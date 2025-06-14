"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getBudgetAnalytics } from "@/lib/budget-client"
import { useSession } from "next-auth/react"
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { format } from "date-fns"
import { it } from "date-fns/locale"

interface MonthlyData {
  month: string
  [key: string]: string | number
}

interface TrendData {
  category: string
  trend: "up" | "down" | "stable"
  percentage: number
  average: number
}

export default function BudgetAnalytics() {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month')
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user?.id) {
      loadAnalyticsData()
    }
  }, [period, session?.user?.id])

  const loadAnalyticsData = async () => {
    try {
      if (!session?.user?.id) return

      const data = await getBudgetAnalytics(session.user.id, period)
      setMonthlyData(data)

      // Calculate trends
      calculateTrends(data)
    } catch (error) {
      console.error("Error loading analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTrends = (data: MonthlyData[]) => {
    if (data.length < 2) return

    const categories = Object.keys(data[0]).filter(key => key !== 'month')
    const trends: TrendData[] = []

    categories.forEach(category => {
      const values = data.map(d => (d[category] as number) || 0)
      const average = values.reduce((a, b) => a + b, 0) / values.length
      
      // Calculate trend
      const recentAvg = values.slice(-3).reduce((a, b) => a + b, 0) / 3
      const olderAvg = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3
      
      let trend: "up" | "down" | "stable" = "stable"
      let percentage = 0
      
      if (olderAvg > 0) {
        percentage = ((recentAvg - olderAvg) / olderAvg) * 100
        if (percentage > 5) trend = "up"
        else if (percentage < -5) trend = "down"
      }

      trends.push({
        category,
        trend,
        percentage: Math.abs(percentage),
        average
      })
    })

    setTrendData(trends)
  }

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + '-01')
    return format(date, 'MMM yyyy', { locale: it })
  }

  const getInsights = () => {
    if (trendData.length === 0) return []

    const insights = []
    
    // Find categories with increasing spending
    const increasing = trendData.filter(t => t.trend === 'up')
    if (increasing.length > 0) {
      const highest = increasing.reduce((a, b) => a.percentage > b.percentage ? a : b)
      insights.push({
        type: 'warning',
        message: `Le spese per ${highest.category} sono aumentate del ${highest.percentage.toFixed(0)}%`
      })
    }

    // Find categories with decreasing spending
    const decreasing = trendData.filter(t => t.trend === 'down')
    if (decreasing.length > 0) {
      const highest = decreasing.reduce((a, b) => a.percentage > b.percentage ? a : b)
      insights.push({
        type: 'success',
        message: `Hai ridotto le spese per ${highest.category} del ${highest.percentage.toFixed(0)}%`
      })
    }

    // Find highest spending category
    const highestSpending = trendData.reduce((a, b) => a.average > b.average ? a : b)
    insights.push({
      type: 'info',
      message: `${highestSpending.category} è la tua categoria di spesa principale (€${highestSpending.average.toFixed(0)}/mese)`
    })

    return insights
  }

  if (loading) {
    return <div>Caricamento analisi...</div>
  }

  const insights = getInsights()
  const categories = monthlyData.length > 0 ? Object.keys(monthlyData[0]).filter(key => key !== 'month') : []

  return (
    <div className="space-y-4">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Analisi Temporale</h3>
        <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Ultimi 6 mesi</SelectItem>
            <SelectItem value="quarter">Ultimo anno</SelectItem>
            <SelectItem value="year">Ultimi 2 anni</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Insights Cards */}
      {insights.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {insights.map((insight, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  {insight.type === 'warning' && <TrendingUp className="h-4 w-4 text-amber-500" />}
                  {insight.type === 'success' && <TrendingDown className="h-4 w-4 text-emerald-500" />}
                  {insight.type === 'info' && <DollarSign className="h-4 w-4 text-blue-500" />}
                  {insight.message}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="trend" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trend">Andamento</TabsTrigger>
          <TabsTrigger value="comparison">Confronto</TabsTrigger>
          <TabsTrigger value="distribution">Distribuzione</TabsTrigger>
          <TabsTrigger value="forecast">Previsioni</TabsTrigger>
        </TabsList>

        <TabsContent value="trend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Andamento Spese per Categoria</CardTitle>
              <CardDescription>
                Come sono cambiate le tue spese nel tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={formatMonth}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={formatMonth}
                    formatter={(value: number) => `€${value.toFixed(2)}`}
                  />
                  <Legend />
                  {categories.map((category, index) => (
                    <Line
                      key={category}
                      type="monotone"
                      dataKey={category}
                      stroke={`hsl(${index * 360 / categories.length}, 70%, 50%)`}
                      strokeWidth={2}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Confronto Categorie</CardTitle>
              <CardDescription>
                Confronta le spese tra diverse categorie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={formatMonth}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={formatMonth}
                    formatter={(value: number) => `€${value.toFixed(2)}`}
                  />
                  <Legend />
                  {categories.slice(0, 5).map((category, index) => (
                    <Bar
                      key={category}
                      dataKey={category}
                      fill={`hsl(${index * 360 / 5}, 70%, 50%)`}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuzione Media delle Spese</CardTitle>
              <CardDescription>
                Come sono distribuite mediamente le tue spese
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={trendData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis />
                  <Radar
                    name="Spesa Media"
                    dataKey="average"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Tooltip formatter={(value: number) => `€${value.toFixed(2)}`} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Previsioni di Spesa</CardTitle>
              <CardDescription>
                Stima delle spese future basata sui dati storici
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Le previsioni avanzate saranno disponibili dopo aver raccolto più dati storici.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Continua a tracciare le tue spese per ottenere previsioni accurate.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}