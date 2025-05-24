"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { createClientComponentClient } from "@/lib/supabase-client"
import { getNetWorthHistory } from "@/lib/db-client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, type TooltipProps } from "recharts"
import { Card } from "@/components/ui/card"
import { ChartSkeleton } from "@/components/ui/chart-skeleton"

// Componente personalizzato per il tooltip
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <Card className="p-2 shadow-md border">
        <p className="font-medium">{`${label}`}</p>
        <p className="text-emerald-600 dark:text-emerald-400">{`Patrimonio Netto: €${payload[0].value?.toLocaleString()}`}</p>
      </Card>
    )
  }

  return null
}

// Funzione per formattare la data
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("it-IT", { month: "short" })
}

export default function NetWorthChart() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchNetWorthData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          // Se non c'è un utente autenticato, usa dati di esempio
          const demoData = [
            { month: "Gen", netWorth: 80000 },
            { month: "Feb", netWorth: 82000 },
            { month: "Mar", netWorth: 85000 },
            { month: "Apr", netWorth: 89000 },
            { month: "Mag", netWorth: 92000 },
            { month: "Giu", netWorth: 95000 },
            { month: "Lug", netWorth: 98000 },
            { month: "Ago", netWorth: 102000 },
            { month: "Set", netWorth: 105000 },
            { month: "Ott", netWorth: 110000 },
            { month: "Nov", netWorth: 115000 },
            { month: "Dic", netWorth: 120000 },
          ]
          setData(demoData)
          setLoading(false)
          return
        }

        const netWorthHistory = await getNetWorthHistory(user.id)

        if (netWorthHistory.length === 0) {
          // Se non ci sono dati, usa dati di esempio
          const demoData = [
            { month: "Gen", netWorth: 80000 },
            { month: "Feb", netWorth: 82000 },
            { month: "Mar", netWorth: 85000 },
            { month: "Apr", netWorth: 89000 },
            { month: "Mag", netWorth: 92000 },
            { month: "Giu", netWorth: 95000 },
            { month: "Lug", netWorth: 98000 },
            { month: "Ago", netWorth: 102000 },
            { month: "Set", netWorth: 105000 },
            { month: "Ott", netWorth: 110000 },
            { month: "Nov", netWorth: 115000 },
            { month: "Dic", netWorth: 120000 },
          ]
          setData(demoData)
        } else {
          // Formatta i dati per il grafico
          const formattedData = netWorthHistory.map((entry) => ({
            month: formatDate(entry.date),
            netWorth: entry.amount,
            date: entry.date,
          }))
          setData(formattedData)
        }
      } catch (error) {
        console.error("Error fetching net worth data:", error)
        setError("Errore nel caricamento dei dati")
      } finally {
        setLoading(false)
      }
    }

    fetchNetWorthData()
  }, [supabase])

  if (loading) {
    return <ChartSkeleton />
  }

  if (error) {
    return <div className="flex items-center justify-center h-full">{error}</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#eee"} />
        <XAxis dataKey="month" stroke={isDark ? "#888" : "#666"} tick={{ fill: isDark ? "#888" : "#666" }} />
        <YAxis
          stroke={isDark ? "#888" : "#666"}
          tick={{ fill: isDark ? "#888" : "#666" }}
          tickFormatter={(value) => `€${value / 1000}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="netWorth"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 4, fill: "#10b981" }}
          activeDot={{ r: 6, fill: "#10b981" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
