"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { createClientComponentClient } from "@/lib/supabase-client"
import { getExpensesByCategory } from "@/lib/db-client"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card } from "@/components/ui/card"
import { ChartSkeleton } from "@/components/ui/chart-skeleton"

// Dati di esempio per il grafico delle spese
const demoData = [
  { name: "Casa", value: 800, color: "#10b981" },
  { name: "Cibo", value: 400, color: "#3b82f6" },
  { name: "Trasporti", value: 300, color: "#f59e0b" },
  { name: "Svago", value: 200, color: "#8b5cf6" },
  { name: "Bollette", value: 250, color: "#ef4444" },
  { name: "Altro", value: 400, color: "#6b7280" },
]

// Componente personalizzato per il tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <Card className="p-2 shadow-md border">
        <p className="font-medium">{`${payload[0].name}`}</p>
        <p style={{ color: payload[0].payload.color }}>{`€${payload[0].value}`}</p>
        <p style={{ color: payload[0].payload.color }}>{`${((payload[0].value / 2350) * 100).toFixed(1)}%`}</p>
      </Card>
    )
  }

  return null
}

export default function ExpensesChart() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchExpensesData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          // Se non c'è un utente autenticato, usa dati di esempio
          setData(demoData)
          setLoading(false)
          return
        }

        const expensesByCategory = await getExpensesByCategory(user.id)

        if (expensesByCategory.length === 0) {
          // Se non ci sono dati, usa dati di esempio
          setData(demoData)
        } else {
          setData(expensesByCategory)
        }
      } catch (error) {
        console.error("Error fetching expenses data:", error)
        setError("Errore nel caricamento dei dati")
      } finally {
        setLoading(false)
      }
    }

    fetchExpensesData()
  }, [supabase])

  if (loading) {
    return <ChartSkeleton />
  }

  if (error) {
    return <div className="flex items-center justify-center h-full">{error}</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value, entry, index) => <span style={{ color: isDark ? "#e5e7eb" : "#374151" }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
