import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

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

  const checkGoalProgress = useCallback(async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/goals/check-progress');
      if (!response.ok) {
        // Se è un errore 401, l'utente non è autenticato - non mostrare errori
        if (response.status === 401) {
          console.log('Utente non autenticato, saltando controllo obiettivi');
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
  }, [alerts, toast]);

  // Controllo automatico periodico
  useEffect(() => {
    // Se checkInterval è 0, disabilita completamente l'hook
    if (checkInterval === 0) {
      console.log('Goal alerts hook disabilitato (checkInterval = 0)');
      return;
    }

    // Controllo iniziale solo se non stiamo già controllando
    if (!isChecking) {
      checkGoalProgress();
    }

    // Imposta intervallo di controllo
    const interval = setInterval(() => {
      if (!isChecking) {
        checkGoalProgress();
      }
    }, checkInterval);

    return () => clearInterval(interval);
  }, [checkInterval]); // Rimuovo checkGoalProgress per evitare loop, ma aggiungo controllo isChecking

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