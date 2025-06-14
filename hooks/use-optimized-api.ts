import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface ApiEndpoint {
  url: string;
  cacheKey: string;
  cacheDuration?: number; // in milliseconds
}

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  
  set<T>(key: string, data: T, duration: number = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + duration,
    });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  clear(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}

const apiCache = new ApiCache();

export function useOptimizedApi<T extends Record<string, any>>(
  endpoints: ApiEndpoint[]
) {
  const { data: session, status } = useSession();
  const [data, setData] = useState<Partial<T>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (status === 'loading') return;
    
    if (!session?.user?.id) {
      setData({});
      setIsLoading(false);
      return;
    }

    // Annulla richieste precedenti
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const results: Partial<T> = {};
      const fetchPromises: Promise<void>[] = [];

      endpoints.forEach((endpoint) => {
        const cacheKey = `${endpoint.cacheKey}_${session.user.id}`;
        
        // Controlla cache se non è forzato il refresh
        if (!forceRefresh) {
          const cachedData = apiCache.get(cacheKey);
          if (cachedData) {
            results[endpoint.cacheKey as keyof T] = cachedData;
            return;
          }
        }

        // Aggiungi fetch promise
        const fetchPromise = fetch(endpoint.url, {
          signal: abortControllerRef.current?.signal,
        })
          .then(async (response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            
            // Salva in cache
            apiCache.set(
              cacheKey,
              responseData,
              endpoint.cacheDuration || 5 * 60 * 1000
            );
            
            results[endpoint.cacheKey as keyof T] = responseData;
          })
          .catch((err) => {
            if (err.name !== 'AbortError') {
              console.error(`Errore fetch ${endpoint.url}:`, err);
              throw err;
            }
          });

        fetchPromises.push(fetchPromise);
      });

      // Esegui tutte le richieste in parallelo
      await Promise.allSettled(fetchPromises);
      
      setData(results);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Errore caricamento dati:', err);
        setError('Errore nel caricamento dei dati');
      }
    } finally {
      setIsLoading(false);
    }
  }, [endpoints, session?.user?.id, status]);

  // Auto-fetch on mount e quando cambia la sessione
  useEffect(() => {
    fetchData();
    
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const refresh = useCallback(() => fetchData(true), [fetchData]);

  const clearCache = useCallback((pattern?: string) => {
    apiCache.clear(pattern);
  }, []);

  return {
    data,
    isLoading,
    error,
    refresh,
    clearCache,
  };
}

// Hook specializzato per dashboard
export function useDashboardData() {
  return useOptimizedApi([
    {
      url: '/api/portfolio/holdings',
      cacheKey: 'holdings',
      cacheDuration: 2 * 60 * 1000, // 2 minuti
    },
    {
      url: '/api/portfolio/financial-transactions?limit=10',
      cacheKey: 'recentTransactions',
      cacheDuration: 1 * 60 * 1000, // 1 minuto
    },
    {
      url: '/api/goals/check-progress',
      cacheKey: 'goals',
      cacheDuration: 5 * 60 * 1000, // 5 minuti
    },
    {
      url: '/api/fire/progress',
      cacheKey: 'fireProgress',
      cacheDuration: 5 * 60 * 1000, // 5 minuti
    },
    {
      url: '/api/net-worth/history',
      cacheKey: 'netWorthHistory',
      cacheDuration: 10 * 60 * 1000, // 10 minuti
    },
    {
      url: '/api/budget/check-alerts',
      cacheKey: 'budgetAlerts',
      cacheDuration: 2 * 60 * 1000, // 2 minuti
    },
  ]);
}

// Hook per portfolio completo
export function usePortfolioCompleteData() {
  return useOptimizedApi([
    {
      url: '/api/portfolio/holdings',
      cacheKey: 'holdings',
      cacheDuration: 2 * 60 * 1000,
    },
    {
      url: '/api/portfolio/financial-transactions?limit=100',
      cacheKey: 'transactions',
      cacheDuration: 2 * 60 * 1000,
    },
    {
      url: '/api/portfolio/prices',
      cacheKey: 'prices',
      cacheDuration: 15 * 60 * 1000, // 15 minuti per i prezzi
    },
  ]);
}