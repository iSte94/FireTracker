import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';

interface GoalAlert {
  id: string;
  title: string;
  type: 'deviation' | 'achievement' | 'warning';
  message: string;
  action?: string;
  severity: 'low' | 'medium' | 'high';
}

interface GoalProgress {
  id: string;
  title: string;
  goal_type: string;
  progress: number;
  status: string;
  deviations?: any[];
}

export function useGoalAlerts(checkInterval: number = 600000) { // 10 minuti default
  const [alerts, setAlerts] = useState<GoalAlert[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();
  const { data: session, status } = useSession();
  
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  const checkGoalProgress = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('Hook goal-alerts: Utente non autenticato, blocco chiamata API');
      return [];
    }
    if (isLoading) {
      console.log('Hook goal-alerts: Stato autenticazione in caricamento, blocco chiamata API');
      return [];
    }

    setIsChecking(true);
    try {
      const response = await fetch('/api/goals/check-progress');
      if (!response.ok) {
        if (response.status === 401) {
          console.log('API risposta 401, utente non autenticato');
          return [];
        }
        throw new Error('Errore nel controllo obiettivi');
      }

      const data = await response.json();
      console.log('[useGoalAlerts] Dati ricevuti da API:', JSON.stringify(data, null, 2)); // Log dei dati grezzi
      const newAlerts: GoalAlert[] = [];

      if (data && data.goalsProgress && Array.isArray(data.goalsProgress)) { // Controllo robustezza
        data.goalsProgress.forEach((goal: GoalProgress) => {
          console.log('[useGoalAlerts] Processando goal:', JSON.stringify(goal, null, 2)); // Log per ogni goal

          // Alert per deviazioni allocazione
          if (goal.status === 'needs_rebalancing' && goal.deviations && Array.isArray(goal.deviations)) { // Controllo robustezza
            goal.deviations.forEach((deviation: any) => {
              console.log('[useGoalAlerts] Processando deviation:', JSON.stringify(deviation, null, 2)); // Log per ogni deviation
              // Aggiunto controllo per assicurarsi che deviation e le sue proprietà esistano
              if (deviation && typeof deviation.deviation === 'number' && typeof deviation.asset_class === 'string') {
                if (deviation.deviation > 5) {
                  newAlerts.push({
                    id: `${goal.id}-${deviation.asset_class}`,
                    title: goal.title,
                    type: 'deviation',
                    message: `${deviation.asset_class}: deviazione del ${deviation.deviation.toFixed(1)}% dall'obiettivo`,
                    action: deviation.action === 'increase' 
                      ? `Aumentare allocazione in ${deviation.asset_class}`
                      : `Ridurre allocazione in ${deviation.asset_class}`,
                    severity: deviation.deviation > 10 ? 'high' : 'medium'
                  });
                }
              } else {
                console.warn('[useGoalAlerts] Oggetto deviation malformato o con proprietà mancanti:', deviation);
              }
            });
          } else if (goal.status === 'needs_rebalancing') {
            console.warn('[useGoalAlerts] Goal con status "needs_rebalancing" ma "deviations" è mancante o non è un array:', goal);
          }

          // Alert per obiettivi completati
          if (goal.status === 'completed' || goal.status === 'achieved') {
            if (typeof goal.progress === 'number') { // Controllo robustezza
              newAlerts.push({
                id: `${goal.id}-completed`,
                title: goal.title,
                type: 'achievement',
                message: `Obiettivo raggiunto! Progresso: ${goal.progress.toFixed(0)}%`,
                severity: 'low'
              });
            } else {
               console.warn('[useGoalAlerts] Goal "completed/achieved" con "progress" mancante o non numerico:', goal);
            }
          }
  
          // Alert per obiettivi in ritardo
          if (goal.status === 'behind' || goal.status === 'underperforming') {
            if (typeof goal.progress === 'number') { // Controllo robustezza
              newAlerts.push({
                id: `${goal.id}-behind`,
                title: goal.title,
                type: 'warning',
                message: `Obiettivo in ritardo. Progresso attuale: ${goal.progress.toFixed(0)}%`,
                action: 'Rivedere la strategia di investimento',
                severity: goal.progress < 50 ? 'high' : 'medium'
              });
            } else {
              console.warn('[useGoalAlerts] Goal "behind/underperforming" con "progress" mancante o non numerico:', goal);
            }
          }
        });
      } else {
        console.warn('[useGoalAlerts] "data.goalsProgress" non trovato o non è un array:', data);
      }

      // Confronta con alert precedenti per mostrare solo nuovi e aggiorna lo stato
      setAlerts(prevAlerts => {
        const previousAlertIds = new Set(prevAlerts.map(a => a.id));
        const uniqueNewAlertsToShowInToast = newAlerts.filter(alert => !previousAlertIds.has(alert.id));

        // Mostra toast per nuovi alert ad alta priorità
        uniqueNewAlertsToShowInToast
          .filter(alert => alert.severity === 'high')
          .forEach(alert => {
            toast({
              title: alert.type === 'deviation' ? "⚠️ Deviazione Portfolio" : 
                     alert.type === 'achievement' ? "🎉 Obiettivo Raggiunto" : 
                     "📊 Attenzione Richiesta",
              description: alert.message,
              variant: alert.type === 'achievement' ? 'default' : 'destructive',
            });
          });
        
        return newAlerts; 
      });

      return newAlerts;
    } catch (error) {
      console.error('Errore controllo obiettivi:', error);
      // Aggiungo il log dello stack trace dell'errore per maggiori dettagli
      if (error instanceof Error) {
        console.error('Stack trace:', error.stack);
      }
      toast({
        title: "Errore",
        description: "Impossibile controllare il progresso degli obiettivi",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsChecking(false);
    }
  }, [toast, isAuthenticated, isLoading]);

  // Controllo automatico periodico
  useEffect(() => {
    // Blocca tutto se non autenticato
    if (!isAuthenticated) {
      setAlerts([]); // Pulisce gli alert esistenti
      return;
    }

    // Non procedere se ancora in caricamento
    if (isLoading) {
      return;
    }

    // Se checkInterval è 0, disabilita completamente l'hook
    if (checkInterval === 0) {
      setAlerts([]); // Pulisce gli alert esistenti
      return;
    }

    // Controllo iniziale solo se non stiamo già controllando e siamo autenticati
    if (!isChecking && isAuthenticated) {
      checkGoalProgress();
    }

    // Imposta intervallo di controllo solo se autenticati
    const interval = setInterval(() => {
      if (!isChecking && isAuthenticated) {
        checkGoalProgress();
      }
    }, checkInterval);

    return () => {
      clearInterval(interval);
    };
  }, [checkInterval, checkGoalProgress, isAuthenticated, isLoading]); // Aggiungo isAuthenticated e isLoading alle dipendenze

  // Funzione per rimuovere un alert
  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  // Funzione per forzare il controllo
  const forceCheck = useCallback(async () => {
    return checkGoalProgress();
  }, [checkGoalProgress]);

  return {
    alerts,
    isChecking,
    checkGoalProgress: forceCheck,
    dismissAlert,
    hasHighPriorityAlerts: alerts.some(a => a.severity === 'high'),
    alertCounts: {
      total: alerts.length,
      high: alerts.filter(a => a.severity === 'high').length,
      medium: alerts.filter(a => a.severity === 'medium').length,
      low: alerts.filter(a => a.severity === 'low').length,
    }
  };
}