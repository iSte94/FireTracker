'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import BudgetAlertsProvider from "@/components/budget-alerts-provider";
import { GoalAlertsProvider } from "@/components/providers/goal-alerts-provider";
import { ViewModeProvider } from "@/components/providers/view-mode-provider";

// Wrapper condizionale per i provider - disabilita provider di alert nelle pagine auth
export function ConditionalProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Pagine dove NON devono essere attivi i provider di alert/controlli
  // Includo anche l'homepage per evitare chiamate API non autenticate
  const authPages = ['/login', '/register', '/auth/callback', '/auth/check-email'];
  const isAuthPage = authPages.some(page => {
    if (page === '/') {
      return pathname === '/'; // Controllo esatto per l'homepage
    }
    return pathname?.startsWith(page);
  });
  
  console.log('[ConditionalProviders] pathname:', pathname, 'isAuthPage:', isAuthPage);
  
  if (isAuthPage) {
    // Solo ViewModeProvider per le pagine di autenticazione
    return (
      <ViewModeProvider>
        {children}
      </ViewModeProvider>
    );
  }
  
  // Provider completi per le altre pagine
  return (
    <ViewModeProvider>
      <BudgetAlertsProvider>
        <GoalAlertsProvider>
          {children}
        </GoalAlertsProvider>
      </BudgetAlertsProvider>
    </ViewModeProvider>
  );
}