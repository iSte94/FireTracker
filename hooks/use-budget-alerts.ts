"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function useBudgetAlerts() {
  const pathname = usePathname()
  console.log("useBudgetAlerts initialized", { pathname })

  useEffect(() => {
    console.log("useBudgetAlerts useEffect", { pathname })
    // Check alerts only when on budget-related pages
    if (!pathname.includes('/budget') && !pathname.includes('/dashboard')) {
      return
    }

    // Function to check for new alerts
    const checkAlerts = async () => {
      console.log("useBudgetAlerts: Calling fetch for /api/budget/check-alerts", { pathname })
      try {
        const response = await fetch('/api/budget/check-alerts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.alertsCreated > 0) {
            // Trigger a refresh of the alerts component
            window.dispatchEvent(new CustomEvent('budget-alerts-updated'))
          }
        }
      } catch (error) {
        console.error('Error checking budget alerts:', error)
      }
    }

    // Check immediately
    checkAlerts()

    // Check every 5 minutes
    const interval = setInterval(checkAlerts, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [pathname])
}