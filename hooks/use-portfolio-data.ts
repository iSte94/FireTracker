import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@/lib/supabase-client';
import type { Database } from '@/types/supabase';

type Holding = Database['public']['Tables']['portfolio_holdings']['Row'];
type Transaction = Database['public']['Tables']['financial_transactions']['Row'];

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

  const supabase = createClientComponentClient();

  // Carica holdings
  const loadHoldings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .order('current_value', { ascending: false });

      if (error) throw error;

      setHoldings(data || []);
      return data || [];
    } catch (err) {
      console.error('Errore caricamento holdings:', err);
      setError('Errore nel caricamento degli holdings');
      return [];
    }
  }, [supabase]);

  // Carica transazioni
  const loadTransactions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('transaction_date', { ascending: false })
        .limit(100);

      if (error) throw error;

      setTransactions(data || []);
      return data || [];
    } catch (err) {
      console.error('Errore caricamento transazioni:', err);
      setError('Errore nel caricamento delle transazioni');
      return [];
    }
  }, [supabase]);

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

  // Carica tutti i dati
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [holdingsData] = await Promise.all([
        loadHoldings(),
        loadTransactions(),
      ]);

      calculateStats(holdingsData);
      calculateAllocations(holdingsData);
    } catch (err) {
      console.error('Errore caricamento dati portfolio:', err);
      setError('Errore nel caricamento dei dati del portfolio');
    } finally {
      setIsLoading(false);
    }
  }, [loadHoldings, loadTransactions, calculateStats, calculateAllocations]);

  // Sottoscrizione real-time per holdings
  useEffect(() => {
    loadAllData();

    // Sottoscrizione per aggiornamenti holdings
    const holdingsSubscription = supabase
      .channel('portfolio_holdings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolio_holdings',
        },
        () => {
          loadHoldings().then(data => {
            calculateStats(data);
            calculateAllocations(data);
          });
        }
      )
      .subscribe();

    // Sottoscrizione per nuove transazioni
    const transactionsSubscription = supabase
      .channel('financial_transactions_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'financial_transactions',
        },
        () => {
          loadTransactions();
        }
      )
      .subscribe();

    return () => {
      holdingsSubscription.unsubscribe();
      transactionsSubscription.unsubscribe();
    };
  }, [supabase]);

  // Funzione per aggiungere una transazione
  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utente non autenticato');

      const { data, error } = await supabase
        .from('financial_transactions')
        .insert({
          ...transaction,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Sincronizza portfolio dopo nuova transazione
      await fetch('/api/portfolio/sync', { method: 'POST' });
      
      // Ricarica dati
      await loadAllData();

      return data;
    } catch (err) {
      console.error('Errore aggiunta transazione:', err);
      throw err;
    }
  }, [supabase, loadAllData]);

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