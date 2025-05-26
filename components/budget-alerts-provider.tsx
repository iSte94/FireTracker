"use client"

import { useBudgetAlerts } from "@/hooks/use-budget-alerts"
import { useIsFireBudget } from "@/components/providers/view-mode-provider"

export default function BudgetAlertsProvider({ children }: { children: React.ReactNode }) {
  const isFireBudget = useIsFireBudget()
  const forceDisableBudgetAlerts = true; // Temporary flag for diagnosis
  
  // Attiva gli alert del budget solo se siamo in modalità FIRE & Budget
  if (!forceDisableBudgetAlerts && isFireBudget) {
    useBudgetAlerts()
  }
  
  return <>{children}</>
}