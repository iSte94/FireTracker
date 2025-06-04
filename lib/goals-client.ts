import { prisma } from "../lib/prisma";
import {
  InvestmentGoal,
  PortfolioAllocation,
  FinancialTransaction,
  PortfolioHolding, // Importato da Prisma
  AssetClass,
  InvestmentGoalStatus,
  InvestmentGoalType,
  Prisma
} from "@prisma/client";
import type {
  // FinancialTransaction as FinancialTransactionTypeLocal, // Useremo Prisma.FinancialTransaction
  // PortfolioHolding as PortfolioHoldingTypeLocal, // Useremo Prisma.PortfolioHolding
  GoalFormData,
  TransactionFormData,
  AllocationFormData
} from '@/types/investment';
import { financialTransactionsClient, Holding } from './financial-transactions-client'; // Importa il client migrato e Holding


// Investment Goals
export const goalsClient = {
  // Get all goals for the current user
  async getGoals(userId: string, status?: InvestmentGoalStatus): Promise<InvestmentGoal[]> {
    try {
      console.log('[GoalsClient] getGoals chiamato con userId:', userId, 'e status:', status);
      if (!userId) throw new Error('UserID è obbligatorio per getGoals');

      const whereClause: Prisma.InvestmentGoalWhereInput = { userId };
      if (status) {
        whereClause.status = status;
      }

      const goals = await prisma.investmentGoal.findMany({
        where: whereClause,
        include: {
          portfolioAllocations: true, // Nome corretto della relazione in Prisma
        },
        orderBy: { createdAt: 'desc' },
      });
      
      console.log('[GoalsClient] Goals trovati:', goals.length);
      return goals;
    } catch (error) {
      console.error('[GoalsClient] Errore nel recupero dei goals:', error);
      throw error;
    }
  },

  // Get a single goal by ID
  async getGoal(userId: string, id: string): Promise<InvestmentGoal | null> {
    try {
      console.log('[GoalsClient] getGoal chiamato per userId:', userId, 'ID:', id);
      if (!userId || !id) throw new Error('UserID e GoalID sono obbligatori per getGoal');
      
      const goal = await prisma.investmentGoal.findUnique({
        where: { id, userId }, // Assicura che l'utente possa accedere solo ai propri goal
        include: {
          portfolioAllocations: true,
        },
      });

      if (!goal) {
        console.log('[GoalsClient] Goal non trovato o non autorizzato');
        return null;
      }
      
      console.log('[GoalsClient] Goal trovato:', goal.id);
      return goal;
    } catch (error) {
      console.error('[GoalsClient] Errore nel recupero del goal:', error);
      throw error;
    }
  },

  // Create a new goal
  async createGoal(userId: string, goalData: GoalFormData): Promise<InvestmentGoal> {
    try {
      console.log('[GoalsClient] createGoal chiamato con userId:', userId, 'e dati:', goalData);
      if (!userId) throw new Error('UserID è obbligatorio per createGoal');

      const { allocations, ...restGoalData } = goalData;

      const createdGoal = await prisma.investmentGoal.create({
        data: {
          ...restGoalData,
          userId,
          currentValue: 0, // Prisma.Decimal
          targetValue: goalData.target_value, // Prisma.Decimal
          status: InvestmentGoalStatus.active, // Usa l'enum Prisma
          goalType: goalData.goal_type as InvestmentGoalType, // Cast al tipo enum Prisma
          // targetDate deve essere un oggetto Date o una stringa ISO
          targetDate: goalData.target_date ? new Date(goalData.target_date) : null,
          portfolioAllocations: allocations && allocations.length > 0 ? {
            create: allocations.map(alloc => ({
              assetClass: alloc.asset_class as AssetClass, // Cast al tipo enum Prisma
              targetPercentage: alloc.target_percentage, // Prisma.Decimal
              currentPercentage: 0, // Prisma.Decimal
            })),
          } : undefined,
        },
        include: {
          portfolioAllocations: true,
        }
      });

      console.log('[GoalsClient] Goal creato con ID:', createdGoal.id);
      return createdGoal;
    } catch (error) {
      console.error('[GoalsClient] Errore nella creazione del goal:', error);
      throw error;
    }
  },

  // Update a goal
  async updateGoal(userId: string, id: string, updates: Partial<GoalFormData>): Promise<InvestmentGoal | null> {
    try {
      console.log('[GoalsClient] updateGoal chiamato per userId:', userId, 'ID:', id);
      if (!userId || !id) throw new Error('UserID e GoalID sono obbligatori per updateGoal');

      // Verifica che il goal appartenga all'utente
      const existingGoal = await prisma.investmentGoal.findUnique({ where: { id, userId } });
      if (!existingGoal) {
        console.error('[GoalsClient] Goal non trovato o utente non autorizzato.');
        throw new Error('Goal non trovato o non autorizzato.');
      }
      
      const { allocations, ...goalUpdates } = updates;

      const dataToUpdate: Prisma.InvestmentGoalUpdateInput = {
        ...goalUpdates,
        updatedAt: new Date(), // Prisma gestisce updatedAt automaticamente
      };
      if (goalUpdates.target_value !== undefined) dataToUpdate.targetValue = goalUpdates.target_value;
      if (goalUpdates.goal_type !== undefined) dataToUpdate.goalType = goalUpdates.goal_type as InvestmentGoalType;
      if (goalUpdates.target_date !== undefined) dataToUpdate.targetDate = goalUpdates.target_date ? new Date(goalUpdates.target_date) : null;


      const updatedGoal = await prisma.investmentGoal.update({
        where: { id },
        data: dataToUpdate,
        include: { portfolioAllocations: true },
      });

      // Se le allocazioni sono fornite, aggiornale (delete + create)
      if (allocations) {
        await prisma.portfolioAllocation.deleteMany({
          where: { goalId: id },
        });
        if (allocations.length > 0) {
          await prisma.portfolioAllocation.createMany({
            data: allocations.map(alloc => ({
              goalId: id,
              assetClass: alloc.asset_class as AssetClass,
              targetPercentage: alloc.target_percentage,
              currentPercentage: 0, // O calcola/mantieni il valore esistente se necessario
            })),
          });
        }
         // Ricarica il goal per includere le nuove allocazioni
        const reloadedGoal = await prisma.investmentGoal.findUnique({
            where: { id },
            include: { portfolioAllocations: true },
        });
        console.log('[GoalsClient] Goal e allocazioni aggiornati con successo');
        return reloadedGoal;
      }
      
      console.log('[GoalsClient] Goal aggiornato con successo');
      return updatedGoal;
    } catch (error) {
      console.error('[GoalsClient] Errore nell\'aggiornamento del goal:', error);
      throw error;
    }
  },

  // Delete a goal
  async deleteGoal(userId: string, id: string): Promise<void> {
    try {
      console.log('[GoalsClient] deleteGoal chiamato per userId:', userId, 'ID:', id);
      if (!userId || !id) throw new Error('UserID e GoalID sono obbligatori per deleteGoal');

      // Verifica che il goal appartenga all'utente prima di eliminarlo
      const existingGoal = await prisma.investmentGoal.findUnique({ where: { id, userId } });
      if (!existingGoal) {
        console.error('[GoalsClient] Goal non trovato o utente non autorizzato per l\'eliminazione.');
        throw new Error('Goal non trovato o non autorizzato.');
      }

      // L'eliminazione a cascata delle portfolioAllocations dovrebbe essere gestita da Prisma se definita nello schema
      await prisma.investmentGoal.delete({
        where: { id },
      });
      
      console.log('[GoalsClient] Goal eliminato con successo');
    } catch (error) {
      console.error('[GoalsClient] Errore nell\'eliminazione del goal:', error);
      throw error;
    }
  },

  // Update goal status
  async updateGoalStatus(userId: string, id: string, status: InvestmentGoalStatus): Promise<InvestmentGoal | null> {
    try {
      console.log('[GoalsClient] updateGoalStatus chiamato per userId:', userId, 'ID:', id, 'status:', status);
      if (!userId || !id) throw new Error('UserID e GoalID sono obbligatori');

      const updatedGoal = await prisma.investmentGoal.updateMany({
        where: { id, userId }, // Assicura che l'utente possa modificare solo i propri goal
        data: {
          status,
          // updatedAt è gestito automaticamente da Prisma
        },
      });

      if (updatedGoal.count === 0) {
         console.log('[GoalsClient] Goal non trovato o utente non autorizzato per aggiornare lo status.');
         return null;
      }
      
      console.log('[GoalsClient] Status aggiornato con successo');
      return prisma.investmentGoal.findUnique({ where: {id}, include: {portfolioAllocations: true}});
    } catch (error) {
      console.error('[GoalsClient] Errore nell\'aggiornamento dello status:', error);
      throw error;
    }
  },

  // Update goal progress
  async updateGoalProgress(userId: string, id: string, currentValue: number | Prisma.Decimal): Promise<InvestmentGoal | null> {
    try {
      console.log('[GoalsClient] updateGoalProgress chiamato per userId:', userId, 'ID:', id, 'valore:', currentValue);
      if (!userId || !id) throw new Error('UserID e GoalID sono obbligatori');
      
      const updatedGoal = await prisma.investmentGoal.updateMany({
        where: { id, userId }, // Assicura che l'utente possa modificare solo i propri goal
        data: {
          currentValue, // Prisma accetta number o Decimal per i campi Decimal
          // updatedAt è gestito automaticamente
        },
      });
      
      if (updatedGoal.count === 0) {
         console.log('[GoalsClient] Goal non trovato o utente non autorizzato per aggiornare il progresso.');
         return null;
      }
      
      console.log('[GoalsClient] Progress aggiornato con successo');
      return prisma.investmentGoal.findUnique({ where: {id}, include: {portfolioAllocations: true}});
    } catch (error) {
      console.error('[GoalsClient] Errore nell\'aggiornamento del progress:', error);
      throw error;
    }
  }
};

// Portfolio Allocations
export const allocationsClient = {
  // Update allocation percentages for a specific goal
  async updateAllocations(userId: string, goalId: string, allocationsData: AllocationFormData[]): Promise<PortfolioAllocation[]> {
    try {
      console.log('[AllocationsClient] updateAllocations chiamato per userId:', userId, 'goalId:', goalId);
      if (!userId || !goalId) throw new Error('UserID e GoalID sono obbligatori');

      // Verify goal ownership
      const goal = await prisma.investmentGoal.findUnique({ where: { id: goalId, userId } });
      if (!goal) {
        throw new Error('Obiettivo non trovato o utente non autorizzato.');
      }

      // Delete existing allocations for this goal
      await prisma.portfolioAllocation.deleteMany({
        where: { goalId: goalId },
      });

      // Insert new allocations
      if (allocationsData && allocationsData.length > 0) {
        const newAllocationsInput = allocationsData.map(alloc => ({
          goalId: goalId,
          assetClass: alloc.asset_class as AssetClass, // Cast a Prisma enum
          targetPercentage: alloc.target_percentage, // Prisma gestisce Decimal
          currentPercentage: 0, // Inizializza currentPercentage
        }));
        
        await prisma.portfolioAllocation.createMany({
          data: newAllocationsInput,
        });
      }
      
      const updatedAllocations = await prisma.portfolioAllocation.findMany({
        where: { goalId: goalId }
      });
      console.log('[AllocationsClient] Allocations aggiornate:', updatedAllocations.length);
      return updatedAllocations;
    } catch (error) {
      console.error('[AllocationsClient] Errore nell\'aggiornamento delle allocations:', error);
      throw error;
    }
  },

  // Update current percentages based on portfolio holdings for a specific goal
  // Questo metodo necessita di userId per recuperare le holdings
  async updateCurrentPercentages(userId: string, goalId: string): Promise<void> {
    try {
      console.log('[AllocationsClient] updateCurrentPercentages chiamato per userId:', userId, 'goalId:', goalId);
      if (!userId || !goalId) throw new Error('UserID e GoalID sono obbligatori');

      // Recupera le holdings dell'utente utilizzando il client migrato
      // Nota: financialTransactionsClient.getHoldings() calcola le holdings dinamicamente.
      // Se hai una tabella PortfolioHolding persistente, dovresti leggerla direttamente.
      const holdings: Holding[] = await financialTransactionsClient.getHoldings(userId);

      if (!holdings || holdings.length === 0) {
        console.log('[AllocationsClient] Nessun holding trovato per l\'utente:', userId);
        // Potrebbe essere necessario azzerare le percentuali correnti se non ci sono holdings
        await prisma.portfolioAllocation.updateMany({
            where: { goalId: goalId },
            data: { currentPercentage: 0 }
        });
        return;
      }
      
      // Usa currentValue dalle holdings calcolate
      const totalPortfolioValue = holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0);

      if (totalPortfolioValue === 0) {
        console.log('[AllocationsClient] Valore totale portfolio è 0 per l\'utente:', userId);
        await prisma.portfolioAllocation.updateMany({
            where: { goalId: goalId },
            data: { currentPercentage: 0 }
        });
        return;
      }

      const allocationsForGoal = await prisma.portfolioAllocation.findMany({
        where: { goalId: goalId },
      });

      if (!allocationsForGoal || allocationsForGoal.length === 0) {
        console.log('[AllocationsClient] Nessuna allocazione trovata per il goal:', goalId);
        return;
      }
      
      // Raggruppa il valore delle holdings per AssetClass
      const assetClassValues: Record<string, number> = {};
      holdings.forEach((holding) => {
        // mapAssetTypeToClass non è più necessaria se holding.assetType è già AssetClass
        // Assumendo che holding.assetType sia compatibile con Prisma.AssetClass
        const assetClassKey = holding.assetType as string; // holding.assetType è FinancialAssetType
        const mappedAssetClass = mapFinancialAssetTypeToAssetClass(holding.assetType); // Usa la nuova funzione di mapping
        assetClassValues[mappedAssetClass] = (assetClassValues[mappedAssetClass] || 0) + (holding.currentValue || 0);
      });

      for (const allocation of allocationsForGoal) {
        const valueForThisAssetClass = assetClassValues[allocation.assetClass] || 0;
        const currentPercentage = totalPortfolioValue > 0 ? (valueForThisAssetClass / totalPortfolioValue) * 100 : 0;

        await prisma.portfolioAllocation.update({
          where: { id: allocation.id },
          data: {
            currentPercentage: currentPercentage,
            // updatedAt è gestito da Prisma
          },
        });
      }
      
      console.log('[AllocationsClient] Percentuali aggiornate per', allocationsForGoal.length, 'allocations del goal:', goalId);
    } catch (error) {
      console.error('[AllocationsClient] Errore nell\'aggiornamento delle percentuali correnti:', error);
      throw error;
    }
  }
};

// Portfolio Holdings
export const holdingsClient = {
  async getHoldings(userId: string): Promise<PortfolioHolding[]> {
    if (!userId) throw new Error("UserID è obbligatorio");
    console.log('[HoldingsClient] getHoldings chiamato per userId:', userId);
    try {
      const holdings = await prisma.portfolioHolding.findMany({
        where: { userId },
        orderBy: { assetName: 'asc' } // o un altro ordinamento sensato, es. per assetName
      });
      console.log('[HoldingsClient] Trovate', holdings.length, 'holdings');
      return holdings;
    } catch (error) {
      console.error('[HoldingsClient] Errore nel recupero delle holdings:', error);
      throw error;
    }
  },

  async updatePortfolioPercentages(userId: string): Promise<void> {
    try {
      console.log('[HoldingsClient] updatePortfolioPercentages chiamato per userId:', userId);
      if (!userId) throw new Error("UserID è obbligatorio");

      const holdings = await prisma.portfolioHolding.findMany({ where: { userId } });

      if (!holdings || holdings.length === 0) {
        console.log('[HoldingsClient] Nessuna holding trovata per l\'utente, nessuna percentuale da aggiornare.');
        return;
      }

      // Calcola il valore totale del portafoglio.
      // Prisma.Decimal può essere sommato direttamente se i valori non sono null.
      // Convertiamo in Number per i calcoli per semplicità, assicurandoci di gestire i null.
      const totalValue = holdings.reduce((sum, h) => {
        const value = h.currentValue ?? h.totalCost; // Usa currentValue se disponibile, altrimenti totalCost
        return sum + (value ? Number(value.toString()) : 0);
      }, 0);

      console.log('[HoldingsClient] Valore totale del portafoglio calcolato:', totalValue);

      if (totalValue === 0) {
        console.log('[HoldingsClient] Valore totale portfolio è 0. Aggiornamento percentuali a 0.');
        // Aggiorna tutte le holdings dell'utente a percentageOfPortfolio = 0
        // È importante usare un loop o `updateMany` se si vuole evitare di aggiornare una per una
        // in caso di `updateMany` con `data: { percentageOfPortfolio: 0 }`
        // Tuttavia, Prisma non supporta `updateMany` con un valore calcolato diverso per ogni riga in modo semplice.
        // Quindi, iteriamo.
        for (const holding of holdings) {
          await prisma.portfolioHolding.update({
            where: { id: holding.id },
            data: { percentageOfPortfolio: 0 },
          });
        }
        console.log('[HoldingsClient] Percentuali portfolio azzerate per', holdings.length, 'holdings.');
        return;
      }

      for (const holding of holdings) {
        const value = holding.currentValue ?? holding.totalCost;
        const numericValue = value ? Number(value.toString()) : 0;
        const percentage = (numericValue / totalValue) * 100;

        // Prisma si aspetta un Decimal per percentageOfPortfolio.
        // La conversione diretta da number a Decimal è gestita da Prisma.
        await prisma.portfolioHolding.update({
          where: { id: holding.id },
          data: {
            percentageOfPortfolio: new Prisma.Decimal(percentage.toFixed(4)), // Arrotonda per evitare problemi di precisione
            // lastUpdatedAt è gestito automaticamente da Prisma se definito nello schema
          },
        });
      }
      console.log('[HoldingsClient] Percentuali portfolio aggiornate per', holdings.length, 'holdings.');
    } catch (error) {
      console.error('[HoldingsClient] Errore nell\'aggiornamento delle percentuali del portfolio:', error);
      throw error;
    }
  }
  // Le funzioni più complesse come updateHoldingsFromTransaction o recalculateHoldings
  // non sono implementate in questo momento, come da istruzioni.
};

import { FinancialAssetType as PrismaFinancialAssetType } from "@prisma/client";

// Helper function to map FinancialAssetType (da financial-transactions) a AssetClass (per portfolio allocations)
function mapFinancialAssetTypeToAssetClass(financialAssetType: PrismaFinancialAssetType): AssetClass {
  const mapping: Record<PrismaFinancialAssetType, AssetClass> = {
    [PrismaFinancialAssetType.stock]: AssetClass.stocks,
    [PrismaFinancialAssetType.etf]: AssetClass.etf,
    [PrismaFinancialAssetType.fund]: AssetClass.funds,
    [PrismaFinancialAssetType.bond]: AssetClass.bonds,
    [PrismaFinancialAssetType.crypto]: AssetClass.crypto,
    [PrismaFinancialAssetType.cash]: AssetClass.cash,
    [PrismaFinancialAssetType.real_estate]: AssetClass.real_estate,
    [PrismaFinancialAssetType.commodity]: AssetClass.commodities,
    [PrismaFinancialAssetType.other]: AssetClass.other,
  };
  return mapping[financialAssetType] || AssetClass.other;
}

// Non esportare più supabase, usare prisma direttamente o i client specifici.
// export { supabase };