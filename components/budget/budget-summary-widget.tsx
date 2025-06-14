"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getBudgetOverview } from "@/lib/budget-client"
import { Target, TrendingUp, AlertCircle, Calendar } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface BudgetSummaryData {
  totalBudget: number
  totalSpent: number
  budgetsAtRisk: number
  daysRemaining: number
  percentageUsed: number
  remainingAmount: number
}

export default function BudgetSummaryWidget() {
  const [data, setData] = useState<BudgetSummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  const loadBudgetSummary = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!session?.user?.id) {
        setError("Utente non autenticato")
        return
      }

      // Carica overview budget dal client esistente
      const budgetOverview = await getBudgetOverview(session.user.id)
      
      // Calcola i totali
      const totalBudget = budgetOverview.reduce((sum, item) => sum + item.budget, 0)
      const totalSpent = budgetOverview.reduce((sum, item) => sum + item.spent, 0)
      const budgetsAtRisk = budgetOverview.filter(item => 
        item.status === 'warning' || item.status === 'danger'
      ).length

      // Calcola giorni rimanenti nel mese
      const now = new Date()
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      const daysRemaining = Math.max(0, lastDayOfMonth.getDate() - now.getDate())

      const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
      const remainingAmount = totalBudget - totalSpent

      setData({
        totalBudget,
        totalSpent,
        budgetsAtRisk,
        daysRemaining,
        percentageUsed,
        remainingAmount
      })
    } catch (error) {
      console.error("Errore nel caricamento del budget summary:", error)
      setError("Errore nel caricamento dei dati")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBudgetSummary()
  }, [session?.user?.id])

  // Funzione per refresh manuale dei dati
  const refreshData = () => {
    loadBudgetSummary()
  }

  // Esponi la funzione refresh al componente parent
  useEffect(() => {
    // Registra event listener per refresh budget
    const handleBudgetRefresh = () => {
      refreshData()
    }

    window.addEventListener('budget-refresh', handleBudgetRefresh)
    
    return () => {
      window.removeEventListener('budget-refresh', handleBudgetRefresh)
    }
  }, [])

  if (loading) {
    return <BudgetSummarySkeleton />
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="text-center text-red-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Nessun budget configurato</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Budget Totale Mensile */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Budget Totale Mensile</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">€{data.totalBudget.toFixed(0)}</div>
          <p className="text-xs text-muted-foreground">
            <span className={data.remainingAmount >= 0 ? "text-emerald-500" : "text-red-500"}>
              €{Math.abs(data.remainingAmount).toFixed(0)}
            </span>{" "}
            {data.remainingAmount >= 0 ? "rimanenti" : "superati"} questo mese
          </p>
        </CardContent>
      </Card>

      {/* Speso Questo Mese */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Speso Questo Mese</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">€{data.totalSpent.toFixed(0)}</div>
          <p className="text-xs text-muted-foreground">
            <span className={data.percentageUsed <= 80 ? "text-emerald-500" : data.percentageUsed <= 100 ? "text-amber-500" : "text-red-500"}>
              {data.percentageUsed.toFixed(0)}%
            </span>{" "}
            del budget utilizzato
          </p>
        </CardContent>
      </Card>

      {/* Budget a Rischio */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Budget a Rischio</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.budgetsAtRisk}</div>
          <p className="text-xs text-muted-foreground">
            Categorie vicine al limite
          </p>
        </CardContent>
      </Card>

      {/* Giorni Rimanenti */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Giorni Rimanenti</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.daysRemaining}</div>
          <p className="text-xs text-muted-foreground">
            Nel periodo corrente
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function BudgetSummarySkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-3 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}