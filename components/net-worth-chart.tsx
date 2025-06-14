"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { useSession } from "next-auth/react"
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

// Funzione per ottenere lo storico del patrimonio netto tramite API
async function getNetWorthHistory() {
  try {
    const response = await fetch('/api/net-worth/history')
    if (!response.ok) {
      throw new Error('Failed to fetch net worth history')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching net worth history:', error)
    return []
  }
}

// Funzione per formattare la data
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("it-IT", { month: "short" })
}

export default function NetWorthChart() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const { data: session, status } = useSession()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNetWorthData = async () => {
      try {
        if (status === "loading") {
          return
        }

        if (!session?.user) {
          // Per utenti non autenticati, mostra grafico vuoto
          setData([])
          setLoading(false)
          return
        }

        const netWorthHistory = await getNetWorthHistory()

        if (netWorthHistory.length === 0) {
          // Se non ci sono dati reali, mostra grafico vuoto
          setData([])
        } else {
          // Formatta i dati reali per il grafico
          const formattedData = netWorthHistory.map((entry: any) => ({
            month: formatDate(entry.date),
            netWorth: Number(entry.amount),
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
          <p className="text-lg font-medium">Nessun dato disponibile</p>
          <p className="text-sm">Aggiungi transazioni per vedere l'andamento del patrimonio netto</p>
        </div>
      </div>
    )
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
