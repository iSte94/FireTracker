import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface Holding {
  id: string;
  asset_type: string;
  asset_name: string;
  ticker_symbol?: string;
  total_quantity: number;
  average_cost: number;
  total_cost: number;
  current_price?: number;
  current_value?: number;
  unrealized_gain_loss?: number;
  percentage_of_portfolio?: number;
  last_updated: string;
}

interface Transaction {
  id: string;
  transaction_type: string;
  asset_type: string;
  asset_name: string;
  ticker_symbol?: string;
  quantity?: number;
  price_per_unit?: number;
  total_amount: number;
  transaction_date: string;
  currency: string;
  fees: number;
  notes?: string;
}

interface PortfolioStats {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  bestPerformer: Holding | null;
  worstPerformer: Holding | null;
}

interface AllocationData {
  asset_type: string;
  value: number;
  percentage: number;
}

export function usePortfolioData() {
  const { data: session, status } = useSession();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allocations, setAllocations] = useState<AllocationData[]>([]);
  const [stats, setStats] = useState<PortfolioStats>({
    totalValue: 0,
    totalCost: 0,
    totalGainLoss: 0,
    totalGainLossPercentage: 0,
    bestPerformer: null,
    worstPerformer: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carica holdings
  const loadHoldings = useCallback(async () => {
    if (!session?.user?.id) {
      setHoldings([]);
      return [];
    }

    try {
      const response = await fetch('/api/portfolio/holdings');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const holdingsData = data.holdings || [];
      
      setHoldings(holdingsData);
      return holdingsData;
    } catch (err) {
      console.error('Errore caricamento holdings:', err);
      setError('Errore nel caricamento degli holdings');
      return [];
    }
  }, [session?.user?.id]);

  // Carica transazioni finanziarie
  const loadTransactions = useCallback(async () => {
    if (!session?.user?.id) {
      setTransactions([]);
      return [];
    }

    try {
      const response = await fetch('/api/portfolio/financial-transactions?limit=100');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const transactionsData = data.transactions || [];
      
      setTransactions(transactionsData);
      return transactionsData;
    } catch (err) {
      console.error('Errore caricamento transazioni:', err);
      setError('Errore nel caricamento delle transazioni');
      return [];
    }
  }, [session?.user?.id]);

  // Calcola statistiche portfolio
  const calculateStats = useCallback((holdingsData: Holding[]) => {
    if (!holdingsData || holdingsData.length === 0) {
      setStats({
        totalValue: 0,
        totalCost: 0,
        totalGainLoss: 0,
        totalGainLossPercentage: 0,
        bestPerformer: null,
        worstPerformer: null,
      });
      return;
    }

    const totalValue = holdingsData.reduce((sum, h) => sum + (h.current_value || 0), 0);
    const totalCost = holdingsData.reduce((sum, h) => sum + h.total_cost, 0);
    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercentage = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    // Trova best e worst performer
    const sortedByPerformance = [...holdingsData].sort((a, b) => {
      const aPerf = ((a.current_value || 0) - a.total_cost) / a.total_cost;
      const bPerf = ((b.current_value || 0) - b.total_cost) / b.total_cost;
      return bPerf - aPerf;
    });

    setStats({
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercentage,
      bestPerformer: sortedByPerformance[0] || null,
      worstPerformer: sortedByPerformance[sortedByPerformance.length - 1] || null,
    });
  }, []);

  // Calcola allocazioni
  const calculateAllocations = useCallback((holdingsData: Holding[]) => {
    const allocationMap = new Map<string, number>();
    const totalValue = holdingsData.reduce((sum, h) => sum + (h.current_value || 0), 0);

    holdingsData.forEach(holding => {
      const current = allocationMap.get(holding.asset_type) || 0;
      allocationMap.set(holding.asset_type, current + (holding.current_value || 0));
    });

    const allocationsData: AllocationData[] = Array.from(allocationMap.entries()).map(([type, value]) => ({
      asset_type: type,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
    })).sort((a, b) => b.value - a.value);

    setAllocations(allocationsData);
  }, []);

  // Carica tutti i dati con chiamate parallele ottimizzate
  const loadAllData = useCallback(async () => {
    if (status === 'loading') return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Esegui tutte le chiamate API in parallelo
      const [holdingsData, transactionsData] = await Promise.all([
        loadHoldings(),
        loadTransactions(),
      ]);

      // Calcola stats e allocazioni in parallelo
      await Promise.all([
        Promise.resolve(calculateStats(holdingsData)),
        Promise.resolve(calculateAllocations(holdingsData)),
      ]);
    } catch (err) {
      console.error('Errore caricamento dati portfolio:', err);
      setError('Errore nel caricamento dei dati del portfolio');
    } finally {
      setIsLoading(false);
    }
  }, [status, loadHoldings, loadTransactions, calculateStats, calculateAllocations]);

  // Carica dati quando la sessione è pronta
  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      setHoldings([]);
      setTransactions([]);
      setAllocations([]);
      setStats({
        totalValue: 0,
        totalCost: 0,
        totalGainLoss: 0,
        totalGainLossPercentage: 0,
        bestPerformer: null,
        worstPerformer: null,
      });
      setIsLoading(false);
      return;
    }

    loadAllData();
  }, [status, loadAllData]);

  // Funzione per aggiungere una transazione finanziaria
  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    if (!session?.user?.id) {
      throw new Error('Utente non autenticato');
    }

    try {
      const response = await fetch('/api/portfolio/financial-transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Sincronizza portfolio dopo nuova transazione
      await fetch('/api/portfolio/sync', { method: 'POST' });
      
      // Ricarica dati
      await loadAllData();

      return data.transaction;
    } catch (err) {
      console.error('Errore aggiunta transazione:', err);
      throw err;
    }
  }, [session?.user?.id, loadAllData]);

  // Funzione per aggiornare prezzi
  const updatePrices = useCallback(async () => {
    try {
      const response = await fetch('/api/portfolio/prices', { method: 'POST' });
      if (!response.ok) throw new Error('Errore aggiornamento prezzi');
      
      const data = await response.json();
      
      // Ricarica holdings dopo aggiornamento prezzi
      const updatedHoldings = await loadHoldings();
      calculateStats(updatedHoldings);
      calculateAllocations(updatedHoldings);
      
      return data;
    } catch (err) {
      console.error('Errore aggiornamento prezzi:', err);
      throw err;
    }
  }, [loadHoldings, calculateStats, calculateAllocations]);

  return {
    // Dati
    holdings,
    transactions,
    allocations,
    stats,
    
    // Stati
    isLoading,
    error,
    
    // Azioni
    refresh: loadAllData,
    addTransaction,
    updatePrices,
  };
}