"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@/lib/supabase-client"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, DollarSign, Calendar, Target } from "lucide-react"
import { cn } from "@/lib/utils"

interface FireStats {
  fireProgress: number
  netWorth: number
  yearsToFire: number
  monthlyTarget: number
}

export function FireQuickStats({ className }: { className?: string }) {
  const [stats, setStats] = useState<FireStats>({
    fireProgress: 0,
    netWorth: 0,
    yearsToFire: 0,
    monthlyTarget: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchFireStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch user profile for FIRE target
        const { data: profile } = await supabase
          .from("profiles")
          .select("fire_target_amount, monthly_income, monthly_expenses")
          .eq("id", user.id)
          .single()

        // Fetch portfolio value
        const { data: holdings } = await supabase
          .from("holdings")
          .select("quantity, symbol")
          .eq("user_id", user.id)

        // Fetch latest prices
        const symbols = holdings?.map(h => h.symbol) || []
        const { data: prices } = await supabase
          .from("stock_prices")
          .select("symbol, price")
          .in("symbol", symbols)
          .order("updated_at", { ascending: false })

        // Calculate net worth
        let totalValue = 0
        if (holdings && prices) {
          const priceMap = new Map(prices.map(p => [p.symbol, p.price]))
          totalValue = holdings.reduce((sum, holding) => {
            const price = priceMap.get(holding.symbol) || 0
            return sum + (holding.quantity * price)
          }, 0)
        }

        // Calculate FIRE progress
        const fireTarget = profile?.fire_target_amount || 1000000
        const fireProgress = Math.min((totalValue / fireTarget) * 100, 100)

        // Calculate years to FIRE
        const monthlyIncome = profile?.monthly_income || 0
        const monthlyExpenses = profile?.monthly_expenses || 0
        const monthlySavings = monthlyIncome - monthlyExpenses
        const yearsToFire = monthlySavings > 0 
          ? Math.ceil((fireTarget - totalValue) / (monthlySavings * 12))
          : 99

        setStats({
          fireProgress,
          netWorth: totalValue,
          yearsToFire: Math.min(yearsToFire, 99),
          monthlyTarget: monthlySavings,
        })
      } catch (error) {
        console.error("Error fetching FIRE stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFireStats()

    // Refresh every 5 minutes
    const interval = setInterval(fetchFireStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [supabase])

  if (loading) {
    return (
      <div className={cn("hidden lg:flex items-center gap-4", className)}>
        <div className="animate-pulse h-10 w-48 bg-muted rounded" />
      </div>
    )
  }

  return (
    <div className={cn("hidden lg:flex items-center gap-6", className)} role="region" aria-label="Statistiche FIRE rapide">
      {/* Progress FIRE */}
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-emerald-600" aria-hidden="true" />
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Progresso FIRE</span>
          <div className="flex items-center gap-2">
            <Progress
              value={stats.fireProgress}
              className="w-20 h-2"
              aria-label={`Progresso FIRE: ${stats.fireProgress.toFixed(1)}%`}
            />
            <span className="text-sm font-semibold" aria-hidden="true">{stats.fireProgress.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Patrimonio Netto */}
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-emerald-600" aria-hidden="true" />
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Patrimonio</span>
          <span className="text-sm font-semibold" aria-label={`Patrimonio netto: ${stats.netWorth.toLocaleString("it-IT", { maximumFractionDigits: 0 })} euro`}>
            €{stats.netWorth.toLocaleString("it-IT", { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* Tempo al FIRE */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-emerald-600" aria-hidden="true" />
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Tempo al FIRE</span>
          <span className="text-sm font-semibold" aria-label={stats.yearsToFire < 99 ? `Tempo rimanente al FIRE: ${stats.yearsToFire} anni` : "Tempo al FIRE non disponibile"}>
            {stats.yearsToFire < 99 ? `${stats.yearsToFire} anni` : "N/A"}
          </span>
        </div>
      </div>

      {/* Risparmio Mensile */}
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-emerald-600" aria-hidden="true" />
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Risparmio/mese</span>
          <span className="text-sm font-semibold" aria-label={`Risparmio mensile: ${stats.monthlyTarget.toLocaleString("it-IT", { maximumFractionDigits: 0 })} euro`}>
            €{stats.monthlyTarget.toLocaleString("it-IT", { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>
    </div>
  )
}