"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@/lib/supabase-client"
import { getRecentTransactions } from "@/lib/db-client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import AddTransaction from "@/components/transactions/add-transaction"
import { ArrowDownLeft, Coffee, Home, ShoppingBag, Car, Zap, HelpCircle } from "lucide-react"

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

// Dati di esempio per le transazioni
const demoTransactions = [
  {
    id: "1",
    description: "Affitto",
    amount: -800,
    date: "2023-05-01",
    category: "Casa",
  },
  {
    id: "2",
    description: "Stipendio",
    amount: 2500,
    date: "2023-05-01",
    category: "Entrate",
  },
  {
    id: "3",
    description: "Supermercato",
    amount: -120,
    date: "2023-05-03",
    category: "Cibo",
  },
  {
    id: "4",
    description: "Ristorante",
    amount: -45,
    date: "2023-05-05",
    category: "Svago",
  },
  {
    id: "5",
    description: "Benzina",
    amount: -60,
    date: "2023-05-07",
    category: "Trasporti",
  },
  {
    id: "6",
    description: "Caffè",
    amount: -3.5,
    date: "2023-05-08",
    category: "Svago",
  },
]

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Funzione per formattare la data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" })
  }

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          // Se non c'è un utente autenticato, usa dati di esempio
          setTransactions(demoTransactions)
          setLoading(false)
          return
        }

        const recentTransactions = await getRecentTransactions(user.id)

        if (recentTransactions.length === 0) {
          // Se non ci sono dati, usa dati di esempio
          setTransactions(demoTransactions)
        } else {
          setTransactions(recentTransactions)
        }
      } catch (error) {
        console.error("Error fetching transactions:", error)
        setError("Errore nel caricamento delle transazioni")
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [supabase])

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
