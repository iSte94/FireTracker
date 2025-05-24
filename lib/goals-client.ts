import { createClientComponentClient } from '@/lib/supabase-client';
import type { 
  InvestmentGoal, 
  PortfolioAllocation, 
  FinancialTransaction, 
  PortfolioHolding,
  GoalFormData,
  TransactionFormData,
  AllocationFormData
} from '@/types/investment';

// Use the same client instance as other parts of the app
const supabase = createClientComponentClient();

// Investment Goals
export const goalsClient = {
  // Get all goals for the current user
  async getGoals(status?: string) {
    try {
      console.log('[GoalsClient] getGoals chiamato con status:', status);
      
      // Verifica autenticazione
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('[GoalsClient] Errore autenticazione:', authError);
        throw new Error('Utente non autenticato');
      }
      
      console.log('[GoalsClient] Utente autenticato:', user.id);

      let query = supabase
        .from('investment_goals')
        .select(`
          *,
          portfolio_allocations (*)
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) {
        console.error('[GoalsClient] Errore query database:', error);
        throw error;
      }
      
      console.log('[GoalsClient] Goals trovati:', data?.length || 0);
      return data as InvestmentGoal[];
    } catch (error) {
      console.error('[GoalsClient] Errore nel recupero dei goals:', error);
      throw error;
    }
  },

  // Get a single goal by ID
  async getGoal(id: string) {
    try {
      console.log('[GoalsClient] getGoal chiamato per ID:', id);
      
      const { data, error } = await supabase
        .from('investment_goals')
        .select(`
          *,
          portfolio_allocations (*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('[GoalsClient] Errore query database:', error);
        throw error;
      }
      
      console.log('[GoalsClient] Goal trovato:', data?.id);
      return data as InvestmentGoal;
    } catch (error) {
      console.error('[GoalsClient] Errore nel recupero del goal:', error);
      throw error;
    }
  },

  // Create a new goal
  async createGoal(goalData: GoalFormData) {
    try {
      console.log('[GoalsClient] createGoal chiamato con:', goalData);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('[GoalsClient] Errore autenticazione:', authError);
        throw new Error('Utente non autenticato');
      }

      // Start a transaction
      const { data: goal, error: goalError } = await supabase
        .from('investment_goals')
        .insert({
          user_id: user.id,
          title: goalData.title,
          description: goalData.description,
          goal_type: goalData.goal_type,
          target_value: goalData.target_value,
          target_date: goalData.target_date,
          current_value: 0,
          status: 'active'
        })
        .select()
        .single();

      if (goalError) {
        console.error('[GoalsClient] Errore creazione goal:', goalError);
        throw goalError;
      }

      console.log('[GoalsClient] Goal creato con ID:', goal.id);

      // If there are allocations, insert them
      if (goalData.allocations && goalData.allocations.length > 0) {
        const allocations = goalData.allocations.map(allocation => ({
          goal_id: goal.id,
          asset_class: allocation.asset_class,
          target_percentage: allocation.target_percentage,
          current_percentage: 0
        }));

        const { error: allocError } = await supabase
          .from('portfolio_allocations')
          .insert(allocations);

        if (allocError) {
          console.error('[GoalsClient] Errore creazione allocations:', allocError);
          throw allocError;
        }
        
        console.log('[GoalsClient] Allocations create:', allocations.length);
      }

      return goal as InvestmentGoal;
    } catch (error) {
      console.error('[GoalsClient] Errore nella creazione del goal:', error);
      throw error;
    }
  },

  // Update a goal
  async updateGoal(id: string, updates: Partial<GoalFormData>) {
    try {
      console.log('[GoalsClient] updateGoal chiamato per ID:', id);
      
      const { error } = await supabase
        .from('investment_goals')
        .update({
          title: updates.title,
          description: updates.description,
          goal_type: updates.goal_type,
          target_value: updates.target_value,
          target_date: updates.target_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('[GoalsClient] Errore aggiornamento goal:', error);
        throw error;
      }

      // If allocations are provided, update them
      if (updates.allocations) {
        // Delete existing allocations
        await supabase
          .from('portfolio_allocations')
          .delete()
          .eq('goal_id', id);

        // Insert new allocations
        const allocations = updates.allocations.map(allocation => ({
          goal_id: id,
          asset_class: allocation.asset_class,
          target_percentage: allocation.target_percentage,
          current_percentage: 0
        }));

        const { error: allocError } = await supabase
          .from('portfolio_allocations')
          .insert(allocations);

        if (allocError) {
          console.error('[GoalsClient] Errore aggiornamento allocations:', allocError);
          throw allocError;
        }
      }
      
      console.log('[GoalsClient] Goal aggiornato con successo');
    } catch (error) {
      console.error('[GoalsClient] Errore nell\'aggiornamento del goal:', error);
      throw error;
    }
  },

  // Delete a goal
  async deleteGoal(id: string) {
    try {
      console.log('[GoalsClient] deleteGoal chiamato per ID:', id);
      
      const { error } = await supabase
        .from('investment_goals')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[GoalsClient] Errore eliminazione goal:', error);
        throw error;
      }
      
      console.log('[GoalsClient] Goal eliminato con successo');
    } catch (error) {
      console.error('[GoalsClient] Errore nell\'eliminazione del goal:', error);
      throw error;
    }
  },

  // Update goal status
  async updateGoalStatus(id: string, status: 'active' | 'completed' | 'paused') {
    try {
      console.log('[GoalsClient] updateGoalStatus chiamato per ID:', id, 'status:', status);
      
      const { error } = await supabase
        .from('investment_goals')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('[GoalsClient] Errore aggiornamento status:', error);
        throw error;
      }
      
      console.log('[GoalsClient] Status aggiornato con successo');
    } catch (error) {
      console.error('[GoalsClient] Errore nell\'aggiornamento dello status:', error);
      throw error;
    }
  },

  // Update goal progress
  async updateGoalProgress(id: string, currentValue: number) {
    try {
      console.log('[GoalsClient] updateGoalProgress chiamato per ID:', id, 'valore:', currentValue);
      
      const { error } = await supabase
        .from('investment_goals')
        .update({ 
          current_value: currentValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('[GoalsClient] Errore aggiornamento progress:', error);
        throw error;
      }
      
      console.log('[GoalsClient] Progress aggiornato con successo');
    } catch (error) {
      console.error('[GoalsClient] Errore nell\'aggiornamento del progress:', error);
      throw error;
    }
  }
};

// Portfolio Allocations
export const allocationsClient = {
  // Update allocation percentages
  async updateAllocations(goalId: string, allocations: AllocationFormData[]) {
    try {
      console.log('[AllocationsClient] updateAllocations chiamato per goal:', goalId);
      
      // Delete existing allocations
      await supabase
        .from('portfolio_allocations')
        .delete()
        .eq('goal_id', goalId);

      // Insert new allocations
      const newAllocations = allocations.map(allocation => ({
        goal_id: goalId,
        asset_class: allocation.asset_class,
        target_percentage: allocation.target_percentage,
        current_percentage: 0
      }));

      const { error } = await supabase
        .from('portfolio_allocations')
        .insert(newAllocations);

      if (error) {
        console.error('[AllocationsClient] Errore aggiornamento allocations:', error);
        throw error;
      }
      
      console.log('[AllocationsClient] Allocations aggiornate:', newAllocations.length);
    } catch (error) {
      console.error('[AllocationsClient] Errore nell\'aggiornamento delle allocations:', error);
      throw error;
    }
  },

  // Update current percentages based on portfolio holdings
  async updateCurrentPercentages(goalId: string) {
    try {
      console.log('[AllocationsClient] updateCurrentPercentages chiamato per goal:', goalId);
      
      const holdings = await holdingsClient.getHoldings();
      if (!holdings || holdings.length === 0) {
        console.log('[AllocationsClient] Nessun holding trovato');
        return;
      }

      const totalValue = holdings.reduce((sum: number, h: PortfolioHolding) => sum + (h.current_value || 0), 0);
      if (totalValue === 0) {
        console.log('[AllocationsClient] Valore totale portfolio è 0');
        return;
      }

      // Group holdings by asset class
      const assetClassValues: Record<string, number> = {};
      holdings.forEach((holding: PortfolioHolding) => {
        const assetClass = mapAssetTypeToClass(holding.asset_type);
        assetClassValues[assetClass] = (assetClassValues[assetClass] || 0) + (holding.current_value || 0);
      });

      // Update each allocation
      const { data: allocations } = await supabase
        .from('portfolio_allocations')
        .select('*')
        .eq('goal_id', goalId);

      if (!allocations) return;

      for (const allocation of allocations) {
        const currentValue = assetClassValues[allocation.asset_class] || 0;
        const currentPercentage = (currentValue / totalValue) * 100;

        await supabase
          .from('portfolio_allocations')
          .update({ 
            current_percentage: currentPercentage,
            updated_at: new Date().toISOString()
          })
          .eq('id', allocation.id);
      }
      
      console.log('[AllocationsClient] Percentuali aggiornate per', allocations.length, 'allocations');
    } catch (error) {
      console.error('[AllocationsClient] Errore nell\'aggiornamento delle percentuali:', error);
      throw error;
    }
  }
};

// Financial Transactions
export const transactionsClient = {
  // Get all transactions
  async getTransactions(filters?: {
    asset_type?: string;
    transaction_type?: string;
    start_date?: string;
    end_date?: string;
  }) {
    try {
      console.log('[TransactionsClient] getTransactions chiamato con filtri:', filters);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('[TransactionsClient] Errore autenticazione:', authError);
        throw new Error('Utente non autenticato');
      }

      let query = supabase
        .from('financial_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });

      if (filters?.asset_type) {
        query = query.eq('asset_type', filters.asset_type);
      }
      if (filters?.transaction_type) {
        query = query.eq('transaction_type', filters.transaction_type);
      }
      if (filters?.start_date) {
        query = query.gte('transaction_date', filters.start_date);
      }
      if (filters?.end_date) {
        query = query.lte('transaction_date', filters.end_date);
      }

      const { data, error } = await query;
      if (error) {
        console.error('[TransactionsClient] Errore query database:', error);
        throw error;
      }
      
      console.log('[TransactionsClient] Transazioni trovate:', data?.length || 0);
      return data as FinancialTransaction[];
    } catch (error) {
      console.error('[TransactionsClient] Errore nel recupero delle transazioni:', error);
      throw error;
    }
  },

  // Create a new transaction
  async createTransaction(transaction: TransactionFormData) {
    try {
      console.log('[TransactionsClient] createTransaction chiamato con:', transaction);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('[TransactionsClient] Errore autenticazione:', authError);
        throw new Error('Utente non autenticato');
      }

      const { data, error } = await supabase
        .from('financial_transactions')
        .insert({
          user_id: user.id,
          ...transaction,
          fees: transaction.fees || 0
        })
        .select()
        .single();

      if (error) {
        console.error('[TransactionsClient] Errore creazione transazione:', error);
        throw error;
      }

      console.log('[TransactionsClient] Transazione creata con ID:', data.id);

      // Update portfolio holdings
      await holdingsClient.updateHoldingsFromTransaction(data as FinancialTransaction);

      return data as FinancialTransaction;
    } catch (error) {
      console.error('[TransactionsClient] Errore nella creazione della transazione:', error);
      throw error;
    }
  },

  // Update a transaction
  async updateTransaction(id: string, updates: Partial<TransactionFormData>) {
    try {
      console.log('[TransactionsClient] updateTransaction chiamato per ID:', id);
      
      const { error } = await supabase
        .from('financial_transactions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('[TransactionsClient] Errore aggiornamento transazione:', error);
        throw error;
      }

      console.log('[TransactionsClient] Transazione aggiornata, ricalcolo holdings...');
      
      // Recalculate portfolio holdings
      await holdingsClient.recalculateHoldings();
    } catch (error) {
      console.error('[TransactionsClient] Errore nell\'aggiornamento della transazione:', error);
      throw error;
    }
  },

  // Delete a transaction
  async deleteTransaction(id: string) {
    try {
      console.log('[TransactionsClient] deleteTransaction chiamato per ID:', id);
      
      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[TransactionsClient] Errore eliminazione transazione:', error);
        throw error;
      }

      console.log('[TransactionsClient] Transazione eliminata, ricalcolo holdings...');
      
      // Recalculate portfolio holdings
      await holdingsClient.recalculateHoldings();
    } catch (error) {
      console.error('[TransactionsClient] Errore nell\'eliminazione della transazione:', error);
      throw error;
    }
  }
};

// Portfolio Holdings
export const holdingsClient = {
  // Get all holdings
  async getHoldings() {
    try {
      console.log('[HoldingsClient] getHoldings chiamato');
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('[HoldingsClient] Errore autenticazione:', authError);
        throw new Error('Utente non autenticato');
      }

      const { data, error } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('user_id', user.id)
        .order('current_value', { ascending: false });

      if (error) {
        console.error('[HoldingsClient] Errore query database:', error);
        throw error;
      }
      
      console.log('[HoldingsClient] Holdings trovati:', data?.length || 0);
      return data as PortfolioHolding[];
    } catch (error) {
      console.error('[HoldingsClient] Errore nel recupero degli holdings:', error);
      throw error;
    }
  },

  // Update holdings from a transaction
  async updateHoldingsFromTransaction(transaction: FinancialTransaction) {
    try {
      console.log('[HoldingsClient] updateHoldingsFromTransaction chiamato per transazione:', transaction.id);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('[HoldingsClient] Errore autenticazione:', authError);
        throw new Error('Utente non autenticato');
      }

      // Get existing holding
      const { data: existingHolding } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('user_id', user.id)
        .eq('asset_type', transaction.asset_type)
        .eq('asset_name', transaction.name)
        .eq('ticker_symbol', transaction.ticker || '')
        .single();

      if (transaction.transaction_type === 'buy' || transaction.transaction_type === 'deposit') {
        if (existingHolding) {
          // Update existing holding
          const newQuantity = existingHolding.total_quantity + (transaction.quantity || 0);
          const newTotalCost = existingHolding.total_cost + transaction.total;
          const newAverageCost = newTotalCost / newQuantity;

          await supabase
            .from('portfolio_holdings')
            .update({
              total_quantity: newQuantity,
              average_cost: newAverageCost,
              total_cost: newTotalCost,
              last_updated: new Date().toISOString()
            })
            .eq('id', existingHolding.id);
            
          console.log('[HoldingsClient] Holding esistente aggiornato');
        } else {
          // Create new holding
          await supabase
            .from('portfolio_holdings')
            .insert({
              user_id: user.id,
              asset_type: transaction.asset_type,
              asset_name: transaction.name,
              ticker_symbol: transaction.ticker,
              total_quantity: transaction.quantity || 0,
              average_cost: transaction.price || 0,
              total_cost: transaction.total
            });
            
          console.log('[HoldingsClient] Nuovo holding creato');
        }
      } else if (transaction.transaction_type === 'sell' || transaction.transaction_type === 'withdrawal') {
        if (existingHolding) {
          const newQuantity = existingHolding.total_quantity - (transaction.quantity || 0);
          
          if (newQuantity <= 0) {
            // Delete holding if quantity is 0 or negative
            await supabase
              .from('portfolio_holdings')
              .delete()
              .eq('id', existingHolding.id);
              
            console.log('[HoldingsClient] Holding eliminato (quantità 0)');
          } else {
            // Update holding
            const newTotalCost = existingHolding.average_cost * newQuantity;
            
            await supabase
              .from('portfolio_holdings')
              .update({
                total_quantity: newQuantity,
                total_cost: newTotalCost,
                last_updated: new Date().toISOString()
              })
              .eq('id', existingHolding.id);
              
            console.log('[HoldingsClient] Holding aggiornato dopo vendita');
          }
        }
      }

      // Update portfolio percentages
      await this.updatePortfolioPercentages();
    } catch (error) {
      console.error('[HoldingsClient] Errore nell\'aggiornamento degli holdings:', error);
      throw error;
    }
  },

  // Recalculate all holdings from transactions
  async recalculateHoldings() {
    try {
      console.log('[HoldingsClient] recalculateHoldings chiamato');
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('[HoldingsClient] Errore autenticazione:', authError);
        throw new Error('Utente non autenticato');
      }

      // Delete all existing holdings
      await supabase
        .from('portfolio_holdings')
        .delete()
        .eq('user_id', user.id);

      // Get all transactions
      const transactions = await transactionsClient.getTransactions();
      if (!transactions || transactions.length === 0) {
        console.log('[HoldingsClient] Nessuna transazione trovata');
        return;
      }

      // Group transactions by asset
      const assetGroups: Record<string, FinancialTransaction[]> = {};
      transactions.forEach((tx: FinancialTransaction) => {
        const key = `${tx.asset_type}-${tx.name}-${tx.ticker || ''}`;
        if (!assetGroups[key]) assetGroups[key] = [];
        assetGroups[key].push(tx);
      });

      console.log('[HoldingsClient] Transazioni raggruppate in', Object.keys(assetGroups).length, 'assets');

      // Calculate holdings for each asset
      for (const [key, txs] of Object.entries(assetGroups)) {
        let totalQuantity = 0;
        let totalCost = 0;

        txs.forEach(tx => {
          if (tx.transaction_type === 'buy' || tx.transaction_type === 'deposit') {
            totalQuantity += tx.quantity || 0;
            totalCost += tx.total;
          } else if (tx.transaction_type === 'sell' || tx.transaction_type === 'withdrawal') {
            totalQuantity -= tx.quantity || 0;
            totalCost -= tx.total;
          }
        });

        if (totalQuantity > 0) {
          const firstTx = txs[0];
          await supabase
            .from('portfolio_holdings')
            .insert({
              user_id: user.id,
              asset_type: firstTx.asset_type,
              asset_name: firstTx.name,
              ticker_symbol: firstTx.ticker,
              total_quantity: totalQuantity,
              average_cost: totalCost / totalQuantity,
              total_cost: totalCost
            });
        }
      }

      console.log('[HoldingsClient] Holdings ricalcolati');
      await this.updatePortfolioPercentages();
    } catch (error) {
      console.error('[HoldingsClient] Errore nel ricalcolo degli holdings:', error);
      throw error;
    }
  },

  // Update portfolio percentages
  async updatePortfolioPercentages() {
    try {
      console.log('[HoldingsClient] updatePortfolioPercentages chiamato');
      
      const holdings = await this.getHoldings();
      const totalValue = holdings.reduce((sum, h) => sum + (h.current_value || h.total_cost), 0);

      if (totalValue === 0) {
        console.log('[HoldingsClient] Valore totale portfolio è 0');
        return;
      }

      for (const holding of holdings) {
        const value = holding.current_value || holding.total_cost;
        const percentage = (value / totalValue) * 100;

        await supabase
          .from('portfolio_holdings')
          .update({
            percentage_of_portfolio: percentage,
            last_updated: new Date().toISOString()
          })
          .eq('id', holding.id);
      }
      
      console.log('[HoldingsClient] Percentuali portfolio aggiornate per', holdings.length, 'holdings');
    } catch (error) {
      console.error('[HoldingsClient] Errore nell\'aggiornamento delle percentuali:', error);
      throw error;
    }
  }
};

// Helper function to map asset types to asset classes
function mapAssetTypeToClass(assetType: string): string {
  const mapping: Record<string, string> = {
    'stock': 'stocks',
    'etf': 'etf',
    'fund': 'funds',
    'bond': 'bonds',
    'crypto': 'crypto',
    'cash': 'cash',
    'real_estate': 'real_estate',
    'commodity': 'commodities',
    'other': 'other'
  };
  
  return mapping[assetType] || 'other';
}

// Export the supabase client for direct use if needed
export { supabase };