import { prisma } from "../lib/prisma";
import { FinancialTransaction, FinancialTransactionType, FinancialAssetType, Prisma } from "@prisma/client";
import { startOfDay, subDays, subMonths, subYears, startOfYear } from 'date-fns';

// Interfaccia per i filtri delle transazioni, adattata per Prisma
export interface TransactionFilters {
  assetType?: FinancialAssetType;
  transactionType?: FinancialTransactionType;
  dateRange?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'ytd' | 'all';
  searchTerm?: string;
}

// Interfacce per Holding e PortfolioMetrics (da definire/adattare in base ai calcoli con Prisma)
export interface Holding {
  tickerSymbol: string; // tickerSymbol invece di ticker per coerenza con Prisma
  assetName: string;
  assetType: FinancialAssetType;
  quantity: number;
  avgPrice: number;
  currentPrice?: number; // Opzionale se non recuperato in tempo reale
  totalCost: number;
  currentValue?: number; // Opzionale
  gainLoss?: number; // Opzionale
  gainLossPercentage?: number; // Opzionale
  allocation?: number; // Opzionale
  dayChange?: number; // Opzionale
  dayChangePercentage?: number; // Opzionale
}

export interface PortfolioMetrics {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  dayChange?: number; // Opzionale
  dayChangePercentage?: number; // Opzionale
  totalDividends: number;
  totalFees: number;
}


class FinancialTransactionsClient {
  // userId deve essere passato ai metodi o al costruttore se la classe è istanziata per utente
  
  async getTransactions(userId: string, filters?: TransactionFilters): Promise<FinancialTransaction[]> {
    try {
      console.log('[FinancialTransactionsClient] getTransactions chiamato con userId:', userId, 'e filtri:', filters);
      if (!userId) {
        throw new Error('UserID è obbligatorio per getTransactions');
      }

      const whereClause: Prisma.FinancialTransactionWhereInput = { userId };

      if (filters) {
        if (filters.assetType && filters.assetType !== 'other') { // 'other' potrebbe essere un valore per 'all' o un tipo specifico
            // Assicurati che filters.assetType sia un valore valido di FinancialAssetType
            if (Object.values(FinancialAssetType).includes(filters.assetType)) {
                 whereClause.assetType = filters.assetType;
            } else {
                console.warn(`Tipo asset non valido fornito: ${filters.assetType}`);
            }
        }
        if (filters.transactionType && filters.transactionType !== 'fee') { // 'fee' potrebbe essere un valore per 'all' o un tipo specifico
            // Assicurati che filters.transactionType sia un valore valido di FinancialTransactionType
             if (Object.values(FinancialTransactionType).includes(filters.transactionType)) {
                whereClause.transactionType = filters.transactionType;
            } else {
                console.warn(`Tipo transazione non valido fornito: ${filters.transactionType}`);
            }
        }
        if (filters.searchTerm) {
          whereClause.OR = [
            { tickerSymbol: { contains: filters.searchTerm } }, // Rimosso mode: 'insensitive'
            { assetName: { contains: filters.searchTerm } }, // Rimosso mode: 'insensitive'
          ];
        }
        if (filters.dateRange && filters.dateRange !== 'all') {
          const now = new Date();
          let startDate: Date;
          switch (filters.dateRange) {
            case 'today': startDate = startOfDay(now); break;
            case 'week': startDate = subDays(now, 7); break;
            case 'month': startDate = subMonths(now, 1); break;
            case 'quarter': startDate = subMonths(now, 3); break;
            case 'year': startDate = subYears(now, 1); break;
            case 'ytd': startDate = startOfYear(now); break;
            default: startDate = new Date(0); // Considera se questo è il default corretto
          }
          whereClause.transactionDate = { gte: startDate };
        }
      }

      const transactions = await prisma.financialTransaction.findMany({
        where: whereClause,
        orderBy: { transactionDate: 'desc' },
      });
      
      console.log('[FinancialTransactionsClient] Query completata. Transazioni trovate:', transactions.length);
      return transactions;
    } catch (error) {
      console.error('[FinancialTransactionsClient] Errore nel recupero delle transazioni:', this.serializeError(error));
      throw error;
    }
  }

  async createTransaction(userId: string, transactionData: Prisma.FinancialTransactionUncheckedCreateInput): Promise<FinancialTransaction> {
    try {
      console.log('[FinancialTransactionsClient] createTransaction chiamato con userId:', userId, 'e dati:', transactionData);
      if (!userId) {
        throw new Error('UserID è obbligatorio per createTransaction');
      }
      
      // Assicurati che transactionData includa userId o che sia aggiunto qui
      const dataToCreate: Prisma.FinancialTransactionCreateInput = {
        ...transactionData,
        user: { connect: { id: userId } },
        // Converte i campi numerici in Decimal se necessario, Prisma potrebbe gestirlo
        // quantity: new Prisma.Decimal(transactionData.quantity as number),
        // pricePerUnit: new Prisma.Decimal(transactionData.pricePerUnit as number),
        // totalAmount: new Prisma.Decimal(transactionData.totalAmount as number),
        // fees: new Prisma.Decimal(transactionData.fees as number),
      };


      // Rimuovi userId da transactionData se presente, dato che lo forniamo tramite connect
      const { userId: _, ...restOfData } = transactionData;


      this.validateTransactionData(restOfData); // Valida i dati prima dell'inserimento

      const newTransaction = await prisma.financialTransaction.create({
        data: {
            ...restOfData,
            user: { connect: { id: userId } },
        }
      });
      
      console.log('[FinancialTransactionsClient] Transazione creata con successo:', newTransaction.id);
      return newTransaction;
    } catch (error) {
      console.error('[FinancialTransactionsClient] Errore nella creazione della transazione:', this.serializeError(error));
      throw error;
    }
  }

  async updateTransaction(userId: string, transactionId: string, updates: Prisma.FinancialTransactionUpdateInput): Promise<FinancialTransaction | null> {
    try {
      console.log('[FinancialTransactionsClient] updateTransaction chiamato per userId:', userId, 'transactionId:', transactionId);
      if (!userId || !transactionId) {
        throw new Error('UserID e TransactionID sono obbligatori per updateTransaction');
      }

      // Verifica che la transazione esista e appartenga all'utente
      const existingTransaction = await prisma.financialTransaction.findUnique({
        where: { id: transactionId },
      });

      if (!existingTransaction || existingTransaction.userId !== userId) {
        console.error('[FinancialTransactionsClient] Transazione non trovata o utente non autorizzato.');
        throw new Error('Transazione non trovata o utente non autorizzato.');
      }
      
      // Applica gli aggiornamenti. Prisma gestisce la conversione dei tipi Decimal.
      const updatedTransaction = await prisma.financialTransaction.update({
        where: { id: transactionId },
        data: updates,
      });
      
      console.log('[FinancialTransactionsClient] Transazione aggiornata con successo');
      return updatedTransaction;
    } catch (error) {
      console.error('[FinancialTransactionsClient] Errore nell\'aggiornamento della transazione:', this.serializeError(error));
      throw error;
    }
  }

  async deleteTransaction(userId: string, transactionId: string): Promise<void> {
    try {
      console.log('[FinancialTransactionsClient] deleteTransaction chiamato per userId:', userId, 'transactionId:', transactionId);
      if (!userId || !transactionId) {
        throw new Error('UserID e TransactionID sono obbligatori per deleteTransaction');
      }

      // Verifica che la transazione esista e appartenga all'utente
      const existingTransaction = await prisma.financialTransaction.findUnique({
        where: { id: transactionId },
      });

      if (!existingTransaction || existingTransaction.userId !== userId) {
        console.error('[FinancialTransactionsClient] Transazione non trovata o utente non autorizzato.');
        throw new Error('Transazione non trovata o utente non autorizzato.');
      }

      await prisma.financialTransaction.delete({
        where: { id: transactionId },
      });
      
      console.log('[FinancialTransactionsClient] Transazione eliminata con successo');
    } catch (error) {
      console.error('[FinancialTransactionsClient] Errore nell\'eliminazione della transazione:', this.serializeError(error));
      throw error;
    }
  }

  // I metodi getHoldings, getPortfolioMetrics, exportTransactionsToCSV
  // richiedono una riscrittura più sostanziale e verranno affrontati separatamente o omessi per ora.
  // La logica di calcolo delle holdings e delle metriche deve essere implementata usando i dati da Prisma.

  async getHoldings(userId: string): Promise<Holding[]> {
    console.log('[FinancialTransactionsClient] getHoldings chiamato per userId:', userId);
    if (!userId) throw new Error('UserID è obbligatorio per getHoldings');

    const transactions = await this.getTransactions(userId);
    console.log('[FinancialTransactionsClient] Calcolando holdings da', transactions.length, 'transazioni');

    const holdingsMap = new Map<string, Holding>();

    transactions.forEach((transaction) => {
      const key = transaction.tickerSymbol || 'UNKNOWN_TICKER'; // Usa tickerSymbol
      let holding = holdingsMap.get(key);

      const quantity = transaction.quantity ? Number(transaction.quantity.toString()) : 0;
      const price = transaction.pricePerUnit ? Number(transaction.pricePerUnit.toString()) : 0;
      // totalAmount include le fees nelle transazioni di acquisto/vendita
      // Per buy: costo totale = totalAmount (che è quantità * prezzo + fees)
      // Per sell: ricavo netto = totalAmount (che è quantità * prezzo - fees)
      const totalAmount = Number(transaction.totalAmount.toString()); // Questo è il valore monetario della transazione

      if (!holding) {
        holding = {
          tickerSymbol: key,
          assetName: transaction.assetName,
          assetType: transaction.assetType,
          quantity: 0,
          avgPrice: 0,
          totalCost: 0,
          // currentPrice, currentValue, etc., verranno calcolati dopo o simulati
        };
        holdingsMap.set(key, holding);
      }

      if (transaction.transactionType === FinancialTransactionType.buy) {
        const newQuantity = holding.quantity + quantity;
        // Il costo di acquisto è il totalAmount della transazione 'buy'
        const costOfThisPurchase = totalAmount;
        const newTotalCost = holding.totalCost + costOfThisPurchase;
        
        holding.quantity = newQuantity;
        holding.totalCost = newTotalCost;
        if (newQuantity > 0) {
            holding.avgPrice = newTotalCost / newQuantity;
        } else {
            holding.avgPrice = 0; // Evita divisione per zero se la quantità diventa 0
        }

      } else if (transaction.transactionType === FinancialTransactionType.sell) {
        // Quando si vende, si riduce la quantità e si realizza un P/L,
        // il totalCost si riduce in proporzione alla quantità venduta al costo medio.
        const costOfSoldShares = quantity * holding.avgPrice;
        holding.quantity -= quantity;
        holding.totalCost -= costOfSoldShares;
        if (holding.quantity <= 0) { // Se si vende tutto o più (caso anomalo)
            holding.quantity = 0;
            holding.totalCost = 0;
            holding.avgPrice = 0;
        }
      }
      // Le transazioni di tipo 'dividend' e 'interest' non modificano le quantità o il costo base delle holdings,
      // ma contribuiscono al rendimento generale del portafoglio.
    });

    const activeHoldings = Array.from(holdingsMap.values()).filter(h => h.quantity > 0);
    console.log('[FinancialTransactionsClient] Holdings attive:', activeHoldings.length);

    // Simulazione prezzi correnti e metriche (come prima, da sostituire con API reali)
    activeHoldings.forEach((holding) => {
      const priceVariation = 0.9 + Math.random() * 0.2;
      holding.currentPrice = holding.avgPrice * priceVariation;
      holding.currentValue = holding.quantity * holding.currentPrice;
      holding.gainLoss = holding.currentValue - holding.totalCost;
      holding.gainLossPercentage = holding.totalCost !== 0 ? (holding.gainLoss / holding.totalCost) * 100 : 0;
      
      const dayVariation = -0.05 + Math.random() * 0.1;
      holding.dayChange = (holding.currentValue || 0) * dayVariation; // Usa currentValue se definito
      holding.dayChangePercentage = dayVariation * 100;
    });
    
    const totalPortfolioValue = activeHoldings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
    activeHoldings.forEach((holding) => {
        holding.allocation = totalPortfolioValue > 0 ? ((holding.currentValue || 0) / totalPortfolioValue) * 100 : 0;
    });

    return activeHoldings.sort((a, b) => (b.currentValue || 0) - (a.currentValue || 0));
  }

  async getPortfolioMetrics(userId: string): Promise<PortfolioMetrics> {
    console.log('[FinancialTransactionsClient] getPortfolioMetrics chiamato per userId:', userId);
    if (!userId) throw new Error('UserID è obbligatorio per getPortfolioMetrics');

    const [holdings, transactions] = await Promise.all([
        this.getHoldings(userId),
        this.getTransactions(userId) // Ottiene tutte le transazioni per calcolare dividendi/fees
    ]);

    console.log('[FinancialTransactionsClient] Calcolando metriche portfolio');

    const totalValue = holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
    const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);
    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercentage = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
    const dayChange = holdings.reduce((sum, h) => sum + (h.dayChange || 0), 0);
    const dayChangePercentage = totalValue > 0 && (totalValue - dayChange) !== 0 ? (dayChange / (totalValue - dayChange)) * 100 : 0;


    const totalDividends = transactions
        .filter(t => t.transactionType === FinancialTransactionType.dividend || t.transactionType === FinancialTransactionType.interest)
        .reduce((sum, t) => sum + Number(t.totalAmount.toString()), 0);
    
    const totalFees = transactions.reduce((sum, t) => sum + (t.fees ? Number(t.fees.toString()) : 0), 0);

    const metrics: PortfolioMetrics = {
        totalValue,
        totalCost,
        totalGainLoss,
        totalGainLossPercentage,
        dayChange,
        dayChangePercentage,
        totalDividends,
        totalFees,
    };

    console.log('[FinancialTransactionsClient] Metriche calcolate:', metrics);
    return metrics;
  }


  async exportTransactionsToCSV(userId: string): Promise<string> {
    console.log('[FinancialTransactionsClient] exportTransactionsToCSV chiamato per userId:', userId);
    if (!userId) throw new Error('UserID è obbligatorio per exportTransactionsToCSV');

    const transactions = await this.getTransactions(userId);

    const headers = [
      'Data', 'Tipo Transazione', 'Tipo Asset', 'Ticker', 'Nome Asset',
      'Quantità', 'Prezzo Unità', 'Commissioni', 'Totale Importo', 'Note'
    ];

    const rows = transactions.map(t => [
      t.transactionDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
      t.transactionType,
      t.assetType,
      t.tickerSymbol || '',
      t.assetName,
      t.quantity?.toString() || '0',
      t.pricePerUnit?.toString() || '0',
      t.fees?.toString() || '0',
      t.totalAmount.toString(),
      t.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')) // Escape double quotes
    ].join('\n');

    return csvContent;
  }


  private serializeError(error: any): any {
    if (!error) return null;
    const serialized: any = {
        message: error.message,
        stack: error.stack,
        name: error.name,
        timestamp: new Date().toISOString()
    };
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        serialized.code = error.code;
        serialized.meta = error.meta;
        serialized.clientVersion = error.clientVersion;
    } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        serialized.clientVersion = error.clientVersion;
    } else if (error instanceof Prisma.PrismaClientRustPanicError) {
        serialized.clientVersion = error.clientVersion;
    } else if (error instanceof Prisma.PrismaClientInitializationError) {
        serialized.clientVersion = error.clientVersion;
        serialized.errorCode = error.errorCode;
    } else if (error instanceof Prisma.PrismaClientValidationError) {
        // Non ha clientVersion, è un errore di validazione prima della query
    }
     // Copia altre proprietà enumerabili se presenti
    Object.keys(error).forEach(key => {
      if (!serialized[key]) {
        serialized[key] = error[key];
      }
    });
    return serialized;
  }

  private validateTransactionData(transaction: Omit<Prisma.FinancialTransactionUncheckedCreateInput, 'userId' | 'id' | 'createdAt' | 'updatedAt'>): void {
    console.log('[FinancialTransactionsClient] Validazione dati transazione...');
    const errors: string[] = [];

    if (!transaction.transactionDate) {
      errors.push('Data transazione mancante');
    } else {
      const date = new Date(transaction.transactionDate);
      if (isNaN(date.getTime())) {
        errors.push('Formato data transazione non valido');
      }
      // Non è più necessario controllare se la data è nel futuro se lo schema lo permette
    }

    if (!transaction.transactionType || !Object.values(FinancialTransactionType).includes(transaction.transactionType as FinancialTransactionType)) {
      errors.push(`Tipo transazione non valido. Valori permessi: ${Object.values(FinancialTransactionType).join(', ')}`);
    }

    if (!transaction.assetType || !Object.values(FinancialAssetType).includes(transaction.assetType as FinancialAssetType)) {
      errors.push(`Tipo asset non valido. Valori permessi: ${Object.values(FinancialAssetType).join(', ')}`);
    }
    
    // Prisma.Decimal gestisce la validazione numerica, ma possiamo controllare per valori logici
    // Per i campi Decimal, Prisma si aspetta stringhe, numeri o istanze di Decimal.
    // La validazione qui dovrebbe controllare se il valore fornito può essere interpretato come un numero valido.
    let quantity: number | undefined | null = null;
    if (transaction.quantity !== undefined && transaction.quantity !== null) {
        quantity = Number(transaction.quantity.toString());
        if (isNaN(quantity) || quantity <= 0) {
            errors.push('La quantità deve essere un numero positivo (> 0)');
        }
    } else {
        errors.push('La quantità è obbligatoria');
    }

    let pricePerUnit: number | undefined | null = null;
    if (transaction.pricePerUnit !== undefined && transaction.pricePerUnit !== null) {
        pricePerUnit = Number(transaction.pricePerUnit.toString());
        if (isNaN(pricePerUnit) || pricePerUnit < 0) {
            errors.push('Il prezzo per unità deve essere un numero non negativo (>= 0)');
        }
    } else {
        errors.push('Il prezzo per unità è obbligatorio');
    }
    
    let fees: number | undefined | null = null;
    if (transaction.fees !== undefined && transaction.fees !== null) {
        fees = Number(transaction.fees.toString());
        if (isNaN(fees) || fees < 0) {
            errors.push('Le commissioni devono essere un numero non negativo (>= 0)');
        }
    } else {
         // Le commissioni potrebbero essere opzionali e default a 0 nello schema, quindi non aggiungiamo errore se null/undefined
         // Se sono obbligatorie, aggiungere: errors.push('Le commissioni sono obbligatorie');
    }
    // Rimuovere la parentesi graffa extra da qui

    if (!transaction.assetName || typeof transaction.assetName !== 'string' || transaction.assetName.trim().length === 0) {
      errors.push('Nome asset obbligatorio');
    }
    
    // tickerSymbol è opzionale nello schema Prisma, quindi non è obbligatorio qui a meno di logica di business specifica
    // if (!transaction.tickerSymbol || typeof transaction.tickerSymbol !== 'string' || transaction.tickerSymbol.trim().length === 0) {
    //   errors.push('Ticker obbligatorio');
    // }

    if (errors.length > 0) {
      const errorMessage = `Errori di validazione: ${errors.join('; ')}`;
      console.error('[FinancialTransactionsClient] Validazione fallita:', {
        errors,
        transactionData: transaction,
        timestamp: new Date().toISOString()
      });
      throw new Error(errorMessage);
    }
    console.log('[FinancialTransactionsClient] Validazione completata con successo');
  }
}

export const financialTransactionsClient = new FinancialTransactionsClient();