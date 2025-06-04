"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, DollarSign, LineChart, PiggyBank, Target } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchBudgetOverview } from "@/lib/budget-service";
// Nota: getMonthlyIncome, getMonthlyExpenses, getSavingsRate non sono usate qui,
// ma se lo fossero, andrebbero importate da budget-service.ts

interface DashboardStats {
  netWorth: number
  savingsRate: number
  monthlyExpenses: number
  yearsToFire: number
  netWorthChange: number
  savingsRateChange: number
  expensesChange: number
  fireTimeChange: number
}

interface DynamicStatsProps {
  isFireBudget?: boolean
}

export default function DynamicStatsWidget({ isFireBudget = false }: DynamicStatsProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  const loadDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!session?.user?.id) {
        // Non è più necessario controllare session.user.id qui perché
        // la chiamata API gestirà l'autenticazione.
        // Tuttavia, potremmo voler mostrare un messaggio diverso se la sessione non è ancora caricata.
        // Per ora, lasciamo che la chiamata API fallisca se non c'è sessione.
      }

      // Carica dati budget per calcolare spese mensili
      const budgetOverview = await fetchBudgetOverview()
      const monthlyExpenses = budgetOverview.reduce((sum, item) => sum + item.spent, 0)

      // Calcoli basati solo sui dati reali disponibili - nessuna stima per nuovi utenti
      const realStats: DashboardStats = {
        netWorth: 0, // Sarà calcolato da dati portfolio reali
        savingsRate: 0, // Sarà calcolato da transazioni reali
        monthlyExpenses: monthlyExpenses,
        yearsToFire: 0, // Sarà calcolato quando ci saranno dati sufficienti
        netWorthChange: 0, // Nessun cambiamento senza dati storici
        savingsRateChange: 0, // Nessun cambiamento senza dati storici
        expensesChange: 0, // Nessun cambiamento senza dati storici
        fireTimeChange: 0 // Nessun cambiamento senza dati storici
      }

      setStats(realStats)
    } catch (error) {
      console.error("Errore nel caricamento delle statistiche dashboard:", error)
      // L'errore specifico dalla chiamata API è già loggato in handleApiResponse
      // Qui possiamo impostare un messaggio di errore generico per l'UI
      if (error instanceof Error) {
        setError(error.message || "Errore nel caricamento dei dati");
      } else {
        setError("Errore nel caricamento dei dati")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Carica i dati solo se la sessione è disponibile
    // per evitare chiamate API non autenticate se la sessione è in fase di caricamento.
    if (session) { // Può essere session === undefined (loading), session === null (unauth), o session object (auth)
        loadDashboardStats()
    } else if (session === null) {
        setError("Utente non autenticato");
        setLoading(false);
    }
    // La dipendenza da session?.user?.id era per la vecchia logica.
    // Ora, la chiamata API è protetta server-side.
    // Ricarichiamo quando lo stato della sessione cambia (da undefined a object, o da object a null).
  }, [session]) 

  // Event listener per refresh
  useEffect(() => {
    const handleRefresh = () => {
      if (session) { // Esegui solo se c'è una sessione
          loadDashboardStats()
      }
    }

    window.addEventListener('dashboard-refresh', handleRefresh)
    window.addEventListener('budget-refresh', handleRefresh)
    
    return () => {
      window.removeEventListener('dashboard-refresh', handleRefresh)
      window.removeEventListener('budget-refresh', handleRefresh)
    }
  }, [session]) // Aggiunta sessione come dipendenza per ricreare listener se sessione cambia

  if (loading) {
    return <DynamicStatsSkeleton isFireBudget={isFireBudget} />
  }

  if (error || !stats) {
    return <DynamicStatsError isFireBudget={isFireBudget} error={error} />
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Patrimonio Netto */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Patrimonio Netto</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">€{stats.netWorth.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            <span className={stats.netWorthChange >= 0 ? "text-emerald-500 flex items-center" : "text-red-500 flex items-center"}>
              {stats.netWorthChange >= 0 ? <ArrowUp className="mr-1 h-4 w-4" /> : <ArrowDown className="mr-1 h-4 w-4" />}
              {Math.abs(stats.netWorthChange).toFixed(1)}%
            </span>{" "}
            rispetto all'anno scorso
          </p>
        </CardContent>
      </Card>

      {/* Tasso di Risparmio */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasso di Risparmio</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.savingsRate.toFixed(0)}%</div>
          <p className="text-xs text-muted-foreground">
            <span className={stats.savingsRateChange >= 0 ? "text-emerald-500 flex items-center" : "text-red-500 flex items-center"}>
              {stats.savingsRateChange >= 0 ? <ArrowUp className="mr-1 h-4 w-4" /> : <ArrowDown className="mr-1 h-4 w-4" />}
              {Math.abs(stats.savingsRateChange).toFixed(0)}%
            </span>{" "}
            rispetto al mese scorso
          </p>
        </CardContent>
      </Card>

      {/* Card condizionali basate sulla modalità */}
      {isFireBudget ? (
        <>
          {/* Spese Mensili */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Spese Mensili</CardTitle>
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.monthlyExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stats.expensesChange <= 0 ? "text-emerald-500 flex items-center" : "text-red-500 flex items-center"}>
                  {stats.expensesChange <= 0 ? <ArrowDown className="mr-1 h-4 w-4" /> : <ArrowUp className="mr-1 h-4 w-4" />}
                  {Math.abs(stats.expensesChange).toFixed(1)}%
                </span>{" "}
                rispetto al mese scorso
              </p>
            </CardContent>
          </Card>

          {/* Anni al FIRE */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anni al FIRE</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.yearsToFire.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stats.fireTimeChange <= 0 ? "text-emerald-500 flex items-center" : "text-red-500 flex items-center"}>
                  {stats.fireTimeChange <= 0 ? <ArrowDown className="mr-1 h-4 w-4" /> : <ArrowUp className="mr-1 h-4 w-4" />}
                  {Math.abs(stats.fireTimeChange).toFixed(1)}
                </span>{" "}
                rispetto all'anno scorso
              </p>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Anni al FIRE */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anni al FIRE</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.yearsToFire.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stats.fireTimeChange <= 0 ? "text-emerald-500 flex items-center" : "text-red-500 flex items-center"}>
                  {stats.fireTimeChange <= 0 ? <ArrowDown className="mr-1 h-4 w-4" /> : <ArrowUp className="mr-1 h-4 w-4" />}
                  {Math.abs(stats.fireTimeChange).toFixed(1)}
                </span>{" "}
                rispetto all'anno scorso
              </p>
            </CardContent>
          </Card>

          {/* Rendimento YTD - Solo per utenti con dati portfolio */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rendimento YTD</CardTitle>
              <LineChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0.0%</div>
              <p className="text-xs text-muted-foreground">
                Aggiungi investimenti per vedere i rendimenti
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function DynamicStatsSkeleton({ isFireBudget }: { isFireBudget: boolean }) {
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

function DynamicStatsError({ isFireBudget, error }: { isFireBudget: boolean; error?: string | null }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <DollarSign className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">{error || "Dati non disponibili"}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Aggiungi transazioni per vedere le statistiche
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}