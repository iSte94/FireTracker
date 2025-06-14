import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { perfLogger } from '@/lib/performance-logger';

export interface PriceData {
  symbol: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  currency: string;
  marketState: string;
  marketTime: Date | string;
  displayName: string;
  exchange: string;
  quoteType: string;
  fiftyTwoWeekLow: number;
  fiftyTwoWeekHigh: number;
  dayLow: number;
  dayHigh: number;
  volume: number;
  error?: boolean;
  message?: string;
}

interface UsePortfolioPricesOptions {
  tickers: string[];
  refreshInterval?: number; // in millisecondi
  enabled?: boolean;
}

interface UsePortfolioPricesReturn {
  prices: Map<string, PriceData>;
  loading: boolean;
  error: Error | null;
  lastUpdate: Date | null;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
}

export function usePortfolioPrices({
  tickers,
  refreshInterval = 60000, // Default: 1 minuto
  enabled = true,
}: UsePortfolioPricesOptions): UsePortfolioPricesReturn {
  const [prices, setPrices] = useState<Map<string, PriceData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const fetchPrices = useCallback(async (showRefreshIndicator = false) => {
    if (!enabled || tickers.length === 0) {
      setLoading(false);
      return;
    }

    if (showRefreshIndicator) {
      setIsRefreshing(true);
    }

    try {
      await perfLogger.timeOperation(
        'Yahoo Finance API Call',
        async () => {
          const response = await fetch('/api/portfolio/prices', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tickers }),
          });

          if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status}`);
          }

          const data = await response.json();
          
          if (data.error) {
            throw new Error(data.error);
          }

          // Converti l'array di prezzi in una Map per accesso rapido
          const priceMap = new Map<string, PriceData>();
          data.prices.forEach((priceData: PriceData) => {
            priceMap.set(priceData.symbol, priceData);
          });

          setPrices(priceMap);
          setLastUpdate(new Date());
          setError(null);
          retryCountRef.current = 0; // Reset retry count on success

          // Mostra notifica per ticker con errori
          const failedTickers = data.prices.filter((p: PriceData) => p.error);
          if (failedTickers.length > 0) {
            console.warn(`🚨 [PORTFOLIO] Failed tickers: ${failedTickers.map((t: PriceData) => t.symbol).join(', ')}`);
            toast({
              title: "Alcuni ticker non trovati",
              description: `Impossibile ottenere i prezzi per: ${failedTickers.map((t: PriceData) => t.symbol).join(', ')}`,
              variant: "destructive",
            });
          }
        },
        {
          tickersCount: tickers.length,
          tickers: tickers.slice(0, 5), // Log solo i primi 5 per non spammare
          refreshType: showRefreshIndicator ? 'manual' : 'auto'
        }
      );

    } catch (err) {
      console.error('❌ [PORTFOLIO] Error fetching prices:', err);
      setError(err instanceof Error ? err : new Error('Errore sconosciuto'));
      
      // Implementa retry logic
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000); // Exponential backoff
        
        console.warn(`🔄 [PORTFOLIO] Retrying ${retryCountRef.current}/${maxRetries} after ${retryDelay}ms`);
        toast({
          title: "Errore nel recupero dei prezzi",
          description: `Tentativo ${retryCountRef.current}/${maxRetries}. Riprovo tra ${retryDelay / 1000}s...`,
          variant: "destructive",
        });
        
        setTimeout(() => {
          fetchPrices(false);
        }, retryDelay);
      } else {
        console.error(`❌ [PORTFOLIO] Max retries exceeded for tickers: ${tickers.join(', ')}`);
        toast({
          title: "Errore persistente",
          description: "Impossibile recuperare i prezzi. Riprova più tardi.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      if (showRefreshIndicator) {
        setIsRefreshing(false);
      }
    }
  }, [tickers, enabled, toast]);

  // Fetch iniziale
  useEffect(() => {
    if (enabled && tickers.length > 0) {
      fetchPrices(false);
    }
  }, [fetchPrices, enabled, tickers.length]);

  // Setup intervallo di aggiornamento
  useEffect(() => {
    if (enabled && refreshInterval > 0 && tickers.length > 0) {
      intervalRef.current = setInterval(() => {
        fetchPrices(false);
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [fetchPrices, refreshInterval, enabled, tickers.length]);

  // Funzione di refresh manuale
  const refresh = useCallback(async () => {
    await fetchPrices(true);
  }, [fetchPrices]);

  return {
    prices,
    loading,
    error,
    lastUpdate,
    refresh,
    isRefreshing,
  };
}

// Hook helper per ottenere il prezzo di un singolo ticker
export function useTickerPrice(ticker: string, options?: Omit<UsePortfolioPricesOptions, 'tickers'>) {
  const result = usePortfolioPrices({
    tickers: ticker ? [ticker] : [],
    ...options,
  });

  return {
    ...result,
    price: ticker ? result.prices.get(ticker.toUpperCase()) : undefined,
  };
}

// Funzione utility per formattare il prezzo
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

// Funzione utility per formattare la variazione percentuale
export function formatChangePercent(changePercent: number): string {
  const sign = changePercent >= 0 ? '+' : '';
  return `${sign}${changePercent.toFixed(2)}%`;
}

// Funzione utility per determinare il colore della variazione
export function getChangeColor(change: number): string {
  if (change > 0) return 'text-green-600 dark:text-green-400';
  if (change < 0) return 'text-red-600 dark:text-red-400';
  return 'text-gray-600 dark:text-gray-400';
}

// Funzione utility per formattare il tempo dell'ultimo aggiornamento
export function formatLastUpdate(date: Date | null): string {
  if (!date) return 'Mai';
  
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (seconds < 60) return 'Adesso';
  if (minutes < 60) return `${minutes}m fa`;
  if (hours < 24) return `${hours}h fa`;
  
  return date.toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}