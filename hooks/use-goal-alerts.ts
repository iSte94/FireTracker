import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createClientComponentClient } from '@/lib/supabase-client';

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  // Verifica autenticazione all'inizializzazione
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        console.log('Errore verifica autenticazione:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    // Ascolta cambiamenti di autenticazione
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const checkGoalProgress = useCallback(async () => {
    // Blocca completamente se non autenticato
    if (isAuthenticated === false) {
      console.log('Hook goal-alerts: Utente non autenticato, blocco chiamata API');
      return [];
    }

    // Non procedere se lo stato di autenticazione non è ancora determinato
    if (isAuthenticated === null) {
      console.log('Hook goal-alerts: Stato autenticazione non determinato, blocco chiamata API');
      return [];
    }

    setIsChecking(true);
    try {
      const response = await fetch('/api/goals/check-progress');
      if (!response.ok) {
        // Se è un errore 401, l'utente non è autenticato - non mostrare errori
        if (response.status === 401) {
          console.log('API risposta 401, aggiorno stato autenticazione');
          setIsAuthenticated(false);
          return [];
        }
        throw new Error('Errore nel controllo obiettivi');
      }

      const data = await response.json();
      const newAlerts: GoalAlert[] = [];

      // Analizza ogni obiettivo per generare alert
      data.goalsProgress.forEach((goal: GoalProgress) => {
        // Alert per deviazioni allocazione
        if (goal.status === 'needs_rebalancing' && goal.deviations) {
          goal.deviations.forEach((deviation: any) => {
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
          });
        }

        // Alert per obiettivi completati
        if (goal.status === 'completed' || goal.status === 'achieved') {
          newAlerts.push({
            id: `${goal.id}-completed`,
            title: goal.title,
            type: 'achievement',
            message: `Obiettivo raggiunto! Progresso: ${goal.progress.toFixed(0)}%`,
            severity: 'low'
          });
        }

        // Alert per obiettivi in ritardo
        if (goal.status === 'behind' || goal.status === 'underperforming') {
          newAlerts.push({
            id: `${goal.id}-behind`,
            title: goal.title,
            type: 'warning',
            message: `Obiettivo in ritardo. Progresso attuale: ${goal.progress.toFixed(0)}%`,
            action: 'Rivedere la strategia di investimento',
            severity: goal.progress < 50 ? 'high' : 'medium'
          });
        }
      });

      // Confronta con alert precedenti per mostrare solo nuovi
      const previousAlertIds = new Set(alerts.map(a => a.id));
      const newUniqueAlerts = newAlerts.filter(alert => !previousAlertIds.has(alert.id));

      // Mostra toast per nuovi alert ad alta priorità
      newUniqueAlerts
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

      setAlerts(newAlerts);
      return newAlerts;
    } catch (error) {
      console.error('Errore controllo obiettivi:', error);
      toast({
        title: "Errore",
        description: "Impossibile controllare il progresso degli obiettivi",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsChecking(false);
    }
  }, [alerts, toast, isAuthenticated, supabase]);

  // Controllo automatico periodico
  useEffect(() => {
    // Blocca tutto se non autenticato
    if (isAuthenticated === false) {
      setAlerts([]); // Pulisce gli alert esistenti
      return;
    }

    // Non procedere se lo stato di autenticazione non è ancora determinato
    if (isAuthenticated === null) {
      return;
    }

    // Se checkInterval è 0, disabilita completamente l'hook
    if (checkInterval === 0) {
      setAlerts([]); // Pulisce gli alert esistenti
      return;
    }

    // Controllo iniziale solo se non stiamo già controllando e siamo autenticati
    if (!isChecking && isAuthenticated === true) {
      checkGoalProgress();
    }

    // Imposta intervallo di controllo solo se autenticati
    const interval = setInterval(() => {
      if (!isChecking && isAuthenticated === true) {
        checkGoalProgress();
      }
    }, checkInterval);

    return () => {
      clearInterval(interval);
    };
  }, [checkInterval, checkGoalProgress, isAuthenticated]); // Aggiungo isAuthenticated alle dipendenze

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