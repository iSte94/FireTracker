"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { useSession } from "next-auth/react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card } from "@/components/ui/card"
import { ChartSkeleton } from "@/components/ui/chart-skeleton"


// Funzione per ottenere le spese per categoria tramite API
async function getCategorySpendingData(userId: string) {
  try {
    const response = await fetch(`/api/expenses/category?userId=${userId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch category spending')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching category spending:', error)
    return []
  }
}

// Componente personalizzato per il tooltip
const CustomTooltip = ({ active, payload, totalAmount }: any) => {
  if (active && payload && payload.length) {
    const percentage = totalAmount > 0 ? ((payload[0].value / totalAmount) * 100).toFixed(1) : 0
    return (
      <Card className="p-2 shadow-md border">
        <p className="font-medium">{`${payload[0].name}`}</p>
        <p style={{ color: payload[0].payload.color }}>{`€${payload[0].value.toLocaleString()}`}</p>
        <p style={{ color: payload[0].payload.color }}>{`${percentage}%`}</p>
      </Card>
    )
  }

  return null
}

export default function ExpensesChart() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const { data: session, status } = useSession()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalAmount, setTotalAmount] = useState(0)

  useEffect(() => {
    const fetchExpensesData = async () => {
      try {
        if (status === "loading") {
          return // Attendi che la sessione sia caricata
        }

        if (!session?.user?.id) {
          // Per utenti non autenticati, mostra grafico vuoto
          setData([])
          setTotalAmount(0)
          setLoading(false)
          return
        }

        const expensesByCategory = await getCategorySpendingData(session.user.id)

        if (expensesByCategory.length === 0) {
          // Se non ci sono dati reali, mostra grafico vuoto
          setData([])
          setTotalAmount(0)
        } else {
          setData(expensesByCategory)
          setTotalAmount(expensesByCategory.reduce((sum: number, item: any) => sum + item.value, 0))
        }
      } catch (error) {
        console.error("Error fetching expenses data:", error)
        setError("Errore nel caricamento dei dati")
      } finally {
        setLoading(false)
      }
    }

    fetchExpensesData()
  }, [session, status])

  if (loading) {
    return <ChartSkeleton />
  }

  if (error) {
    return <div className="flex items-center justify-center h-full">{error}</div>
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="text-muted-foreground mb-4">
          <p className="text-lg font-medium">Nessuna spesa registrata</p>
          <p className="text-sm">Aggiungi transazioni per vedere la ripartizione delle spese</p>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip totalAmount={totalAmount} />} />
        <Legend
          formatter={(value, entry, index) => <span style={{ color: isDark ? "#e5e7eb" : "#374151" }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
