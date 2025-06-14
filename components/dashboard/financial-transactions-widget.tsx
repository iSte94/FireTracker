"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, DollarSign, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

// Funzione per ottenere l'icona in base al tipo di transazione
const getTransactionIcon = (type: string, amount: number) => {
  if (amount > 0) {
    return <ArrowDownRight className="h-4 w-4" />
  } else {
    return <ArrowUpRight className="h-4 w-4" />
  }
}

// Funzione per ottenere il colore in base al tipo
const getTransactionColor = (amount: number) => {
  if (amount > 0) {
    return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300"
  } else {
    return "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
  }
}

// Dati di esempio per le transazioni finanziarie
const demoFinancialTransactions = [
  {
    id: "1",
    asset_name: "VWCE ETF",
    transaction_type: "buy",
    amount: -2000,
    quantity: 20,
    price_per_unit: 100,
    date: new Date().toISOString(),
    notes: "Acquisto mensile PAC"
  },
  {
    id: "2",
    asset_name: "BTC",
    transaction_type: "buy",
    amount: -500,
    quantity: 0.01,
    price_per_unit: 50000,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "DCA Bitcoin"
  },
  {
    id: "3",
    asset_name: "Dividendi VWCE",
    transaction_type: "dividend",
    amount: 150,
    quantity: 0,
    price_per_unit: 0,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Dividendo trimestrale"
  },
  {
    id: "4",
    asset_name: "S&P 500 ETF",
    transaction_type: "buy",
    amount: -1500,
    quantity: 3,
    price_per_unit: 500,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Diversificazione USA"
  },
  {
    id: "5",
    asset_name: "Obbligazioni Governative",
    transaction_type: "buy",
    amount: -1000,
    quantity: 10,
    price_per_unit: 100,
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Bilanciamento portafoglio"
  }
]

export function FinancialTransactionsWidget() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session, status } = useSession()
  const router = useRouter()

  // Funzione per formattare la data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" })
  }

  // Funzione per ottenere il tipo di transazione in italiano
  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "buy":
        return "Acquisto"
      case "sell":
        return "Vendita"
      case "dividend":
        return "Dividendo"
      default:
        return type
    }
  }

  useEffect(() => {
    const fetchTransactions = async () => {
      // Aspetta che il controllo di sessione sia completato
      if (status === 'loading') {
        return
      }

      try {
        if (status === 'unauthenticated') {
          setTransactions(demoFinancialTransactions)
          setLoading(false)
          return
        }

        // Recupera le transazioni finanziarie tramite API
        const response = await fetch('/api/portfolio/financial-transactions?limit=5')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        const data = result.transactions || []

        if (data.length === 0) {
          setTransactions(demoFinancialTransactions)
        } else {
          // Mappa i dati per compatibilità con il formato esistente
          const mappedData = data.map((t: any) => ({
            id: t.id,
            asset_name: t.asset_name,
            transaction_type: t.transaction_type,
            amount: t.transaction_type === 'buy' ? -Math.abs(t.total_amount) : t.total_amount,
            quantity: t.quantity || 0,
            price_per_unit: t.price_per_unit || 0,
            date: t.transaction_date,
            notes: t.notes || ''
          }))
          setTransactions(mappedData)
        }
      } catch (error) {
        console.error("Error fetching financial transactions:", error)
        setError("Errore nel caricamento delle transazioni finanziarie")
        setTransactions(demoFinancialTransactions)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [status, session])

  if (loading || status === 'loading') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Transazioni Finanziarie Recenti
          </CardTitle>
          <CardDescription>
            Le tue ultime operazioni di investimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24 mt-1" />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-10" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Transazioni Finanziarie Recenti
          </div>
          <Button
            size="sm"
            onClick={() => router.push("/financial-transactions")}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Aggiungi
          </Button>
        </CardTitle>
        <CardDescription>
          Le tue ultime operazioni di investimento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className={`h-9 w-9 ${getTransactionColor(transaction.amount)}`}>
                  <AvatarFallback className={getTransactionColor(transaction.amount)}>
                    {getTransactionIcon(transaction.transaction_type, transaction.amount)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">{transaction.asset_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {getTransactionTypeLabel(transaction.transaction_type)}
                    {transaction.quantity > 0 && ` - ${transaction.quantity} unità`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <p
                  className={`text-sm font-medium ${
                    transaction.amount > 0 
                      ? "text-emerald-600 dark:text-emerald-400" 
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {transaction.amount > 0 ? "+" : ""}€{Math.abs(transaction.amount).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/financial-transactions")}
          >
            Vedi tutte le transazioni
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}