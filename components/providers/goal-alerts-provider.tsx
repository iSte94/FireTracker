'use client';

import { useEffect, useState } from 'react';
import { useGoalAlerts } from '@/hooks/use-goal-alerts';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function GoalAlertsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Controllo immediato senza useState per evitare race condition
  // Includo anche l'homepage per evitare chiamate API non autenticate
  const authPages = ['/login', '/register', '/auth/callback', '/auth/check-email'];
  const isAuthPage = authPages.some(page => {
    // La homepage '/' non è più considerata una pagina di autenticazione per GoalAlertsProvider
    return pathname?.startsWith(page);
  });
  
  console.log('[GoalAlertsProvider] pathname:', pathname);
  console.log('[GoalAlertsProvider] isAuthPage:', isAuthPage);

  // Disabilita completamente l'hook nelle pagine di autenticazione
  const { alerts, dismissAlert, hasHighPriorityAlerts } = useGoalAlerts(
    isAuthPage ? 0 : 600000 // Disabilita se è una pagina di auth
  );
  const { toast } = useToast();

  // Mostra toast per nuovi alert ad alta priorità
  useEffect(() => {
    if (hasHighPriorityAlerts && pathname !== '/goals') {
      const highPriorityAlerts = alerts.filter(a => a.severity === 'high');
      
      highPriorityAlerts.forEach(alert => {
        toast({
          title: getAlertTitle(alert.type),
          description: alert.message,
          variant: alert.type === 'achievement' ? 'default' : 'destructive',
          action: alert.action ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/goals'}
            >
              Vai agli obiettivi
            </Button>
          ) : undefined,
        });
      });
    }
  }, [hasHighPriorityAlerts, alerts, pathname, toast]);

  const getAlertTitle = (type: string) => {
    switch (type) {
      case 'deviation':
        return '⚠️ Deviazione Portfolio';
      case 'achievement':
        return '🎉 Obiettivo Raggiunto';
      case 'warning':
        return '📊 Attenzione Richiesta';
      default:
        return '📢 Notifica Obiettivi';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'deviation':
        return AlertTriangle;
      case 'achievement':
        return CheckCircle;
      case 'warning':
        return TrendingUp;
      default:
        return AlertTriangle;
    }
  };

  // Mostra alert persistenti nella dashboard
  const shouldShowPersistentAlerts = pathname === '/dashboard' && alerts.length > 0;

  return (
    <>
      {shouldShowPersistentAlerts && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm space-y-2">
          {alerts.slice(0, 3).map(alert => {
            const Icon = getAlertIcon(alert.type);
            
            return (
              <Alert
                key={alert.id}
                variant={alert.type === 'achievement' ? 'default' : 'destructive'}
                className="pr-8"
              >
                <Icon className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium">{alert.title}</div>
                  <div className="text-sm mt-1">{alert.message}</div>
                  {alert.action && (
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-2 h-auto p-0"
                      onClick={() => window.location.href = '/goals'}
                    >
                      {alert.action} →
                    </Button>
                  )}
                </AlertDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-6 w-6 p-0"
                  onClick={() => dismissAlert(alert.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </Alert>
            );
          })}
        </div>
      )}
      {children}
    </>
  );
}