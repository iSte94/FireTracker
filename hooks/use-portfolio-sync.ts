import { useEffect, useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PortfolioData {
  holdings: any[];
  allocations: any[];
  totalValue: number;
}

export function usePortfolioSync(autoSync: boolean = true, syncInterval: number = 300000) {
  const [isLoading, setIsLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const { toast } = useToast();

  const syncPortfolio = useCallback(async () => {
    setIsLoading(true);
    try {
      // Sincronizza holdings e allocazioni
      const syncResponse = await fetch('/api/portfolio/sync', {
        method: 'POST',
      });

      if (!syncResponse.ok) {
        throw new Error('Errore nella sincronizzazione del portfolio');
      }

      const syncData = await syncResponse.json();

      // Aggiorna prezzi
      const pricesResponse = await fetch('/api/portfolio/prices', {
        method: 'POST',
      });

      if (!pricesResponse.ok) {
        throw new Error('Errore nell\'aggiornamento dei prezzi');
      }

      const pricesData = await pricesResponse.json();

      // Ottieni dati aggiornati
      const portfolioResponse = await fetch('/api/portfolio/sync');
      if (!portfolioResponse.ok) {
        throw new Error('Errore nel recupero dati portfolio');
      }

      const portfolio = await portfolioResponse.json();
      setPortfolioData(portfolio);
      setLastSync(new Date());

      // Mostra notifica solo se ci sono aggiornamenti significativi
      if (pricesData.totalUpdated > 0) {
        toast({
          title: "Portfolio aggiornato",
          description: `Aggiornati ${pricesData.totalUpdated} prezzi`,
        });
      }

      return portfolio;
    } catch (error) {
      console.error('Errore sincronizzazione portfolio:', error);
      toast({
        title: "Errore sincronizzazione",
        description: "Impossibile sincronizzare il portfolio",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Sincronizzazione automatica
  useEffect(() => {
    if (autoSync) {
      // Sincronizza immediatamente
      syncPortfolio();

      // Imposta intervallo di sincronizzazione
      const interval = setInterval(() => {
        syncPortfolio();
      }, syncInterval);

      return () => clearInterval(interval);
    }
  }, [autoSync, syncInterval, syncPortfolio]);

  // Funzione per forzare la sincronizzazione
  const forceSync = useCallback(async () => {
    return syncPortfolio();
  }, [syncPortfolio]);

  return {
    portfolioData,
    isLoading,
    lastSync,
    syncPortfolio: forceSync,
  };
}