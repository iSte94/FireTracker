"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import AddTransaction from "@/components/transactions/add-transaction"
import { ArrowDownLeft, Coffee, Home, ShoppingBag, Car, Zap, HelpCircle } from "lucide-react"

// Funzione per ottenere le transazioni recenti tramite API
async function getRecentTransactions() {
  try {
    const response = await fetch('/api/transactions/recent')
    if (!response.ok) {
      throw new Error('Failed to fetch transactions')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching recent transactions:', error)
    return []
  }
}

// Funzione per ottenere l'icona in base alla categoria
const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Casa":
      return <Home className="h-4 w-4" />
    case "Cibo":
      return <ShoppingBag className="h-4 w-4" />
    case "Trasporti":
      return <Car className="h-4 w-4" />
    case "Svago":
      return <Coffee className="h-4 w-4" />
    case "Bollette":
      return <Zap className="h-4 w-4" />
    case "Entrate":
      return <ArrowDownLeft className="h-4 w-4" />
    default:
      return <HelpCircle className="h-4 w-4" />
  }
}

// Funzione per ottenere il colore in base alla categoria
const getCategoryColor = (category: string) => {
  switch (category) {
    case "Casa":
      return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300"
    case "Cibo":
      return "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
    case "Trasporti":
      return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300"
    case "Svago":
      return "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
    case "Bollette":
      return "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
    case "Entrate":
      return "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
  }
}


export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session, status } = useSession()

  // Funzione per formattare la data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" })
  }

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        if (status === "loading") {
          return // Attendi che la sessione sia caricata
        }

        if (!session?.user) {
          // Se non c'è un utente autenticato, mostra solo un messaggio
          setTransactions([])
          setLoading(false)
          return
        }

        const recentTransactions = await getRecentTransactions()
        setTransactions(recentTransactions) // Usa sempre i dati reali, anche se vuoti
      } catch (error) {
        console.error("Error fetching transactions:", error)
        setError("Errore nel caricamento delle transazioni")
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [session, status])

  if (loading) {
    return (
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
    )
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  if (transactions.length === 0 && !loading && !error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <AddTransaction />
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-muted-foreground">Nessuna transazione trovata</p>
          <p className="text-sm text-muted-foreground mt-1">
            Aggiungi la tua prima transazione per iniziare
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <AddTransaction />
      </div>
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className={`h-9 w-9 ${getCategoryColor(transaction.category)}`}>
                <AvatarFallback className={getCategoryColor(transaction.category)}>
                  {getCategoryIcon(transaction.category)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">{transaction.description}</p>
                <p className="text-xs text-muted-foreground">{transaction.category}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <p
                className={`text-sm font-medium ${transaction.amount > 0 ? "text-emerald-600 dark:text-emerald-400" : ""}`}
              >
                {transaction.amount > 0 ? "+" : ""}€{Math.abs(transaction.amount).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
