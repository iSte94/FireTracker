'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { format, subDays, subMonths, subYears, startOfYear } from 'date-fns'
import { it } from 'date-fns/locale'

interface Transaction {
  id: string
  date: string
  type: 'buy' | 'sell' | 'dividend' | 'interest'
  ticker: string
  quantity: number
  price: number
  total: number
}

interface PortfolioPerformanceChartProps {
  transactions: Transaction[]
  loading: boolean
}

export function PortfolioPerformanceChart({ transactions, loading }: PortfolioPerformanceChartProps) {
  const [timeRange, setTimeRange] = useState('1Y')

  const chartData = useMemo(() => {
    if (!transactions.length) return []

    // Ordina le transazioni per data
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // Calcola il valore del portafoglio nel tempo
    const portfolioHistory: { date: string; value: number; cost: number }[] = []
    let holdings: Record<string, { quantity: number; avgPrice: number }> = {}
    let totalCost = 0
    let totalValue = 0

    // Determina la data di inizio in base al timeRange
    const now = new Date()
    let startDate: Date
    switch (timeRange) {
      case '1M':
        startDate = subMonths(now, 1)
        break
      case '3M':
        startDate = subMonths(now, 3)
        break
      case '6M':
        startDate = subMonths(now, 6)
        break
      case 'YTD':
        startDate = startOfYear(now)
        break
      case '1Y':
        startDate = subYears(now, 1)
        break
      case 'ALL':
        startDate = new Date(sortedTransactions[0].date)
        break
      default:
        startDate = subYears(now, 1)
    }

    sortedTransactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date)
      
      if (transactionDate < startDate) return

      if (transaction.type === 'buy') {
        if (!holdings[transaction.ticker]) {
          holdings[transaction.ticker] = { quantity: 0, avgPrice: 0 }
        }
        
        const currentHolding = holdings[transaction.ticker]
        const newQuantity = currentHolding.quantity + transaction.quantity
        const newAvgPrice = 
          (currentHolding.quantity * currentHolding.avgPrice + transaction.total) / newQuantity
        
        holdings[transaction.ticker] = {
          quantity: newQuantity,
          avgPrice: newAvgPrice
        }
        
        totalCost += transaction.total
      } else if (transaction.type === 'sell') {
        if (holdings[transaction.ticker]) {
          holdings[transaction.ticker].quantity -= transaction.quantity
          totalCost -= transaction.quantity * holdings[transaction.ticker].avgPrice
          
          if (holdings[transaction.ticker].quantity <= 0) {
            delete holdings[transaction.ticker]
          }
        }
      }

      // Calcola il valore totale corrente (simulato con prezzo corrente = ultimo prezzo)
      totalValue = Object.entries(holdings).reduce((sum, [ticker, holding]) => {
        // In un'app reale, qui dovresti usare i prezzi di mercato attuali
        // Per ora usiamo l'ultimo prezzo di acquisto come approssimazione
        return sum + (holding.quantity * holding.avgPrice)
      }, 0)

      portfolioHistory.push({
        date: format(transactionDate, 'yyyy-MM-dd'),
        value: totalValue,
        cost: totalCost
      })
    })

    // Aggiungi punti intermedi per un grafico più fluido
    const filledHistory: { date: string; value: number; cost: number; gain: number; gainPercentage: number }[] = []
    let lastValue = portfolioHistory[0]?.value || 0
    let lastCost = portfolioHistory[0]?.cost || 0

    const currentDate = new Date(startDate)
    const endDate = new Date()

    while (currentDate <= endDate) {
      const dateStr = format(currentDate, 'yyyy-MM-dd')
      const dataPoint = portfolioHistory.find(p => p.date === dateStr)
      
      if (dataPoint) {
        lastValue = dataPoint.value
        lastCost = dataPoint.cost
      }

      const gain = lastValue - lastCost
      const gainPercentage = lastCost > 0 ? (gain / lastCost) * 100 : 0

      filledHistory.push({
        date: dateStr,
        value: lastValue,
        cost: lastCost,
        gain,
        gainPercentage
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return filledHistory
  }, [transactions, timeRange])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-10 w-[300px]" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!transactions.length) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        Nessuna transazione disponibile per generare il grafico
      </div>
    )
  }

  const chartConfig = {
    value: {
      label: "Valore",
      color: "hsl(var(--chart-1))",
    },
    cost: {
      label: "Costo",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Performance nel tempo</h3>
          <p className="text-sm text-muted-foreground">
            Andamento del valore del portafoglio rispetto al costo
          </p>
        </div>
        <Tabs value={timeRange} onValueChange={setTimeRange}>
          <TabsList>
            <TabsTrigger value="1M">1M</TabsTrigger>
            <TabsTrigger value="3M">3M</TabsTrigger>
            <TabsTrigger value="6M">6M</TabsTrigger>
            <TabsTrigger value="YTD">YTD</TabsTrigger>
            <TabsTrigger value="1Y">1A</TabsTrigger>
            <TabsTrigger value="ALL">Tutto</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ChartContainer config={chartConfig} className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => format(new Date(value), 'dd MMM', { locale: it })}
              className="text-xs"
            />
            <YAxis 
              tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
              className="text-xs"
            />
            <ChartTooltip 
              content={
                <ChartTooltipContent 
                  formatter={(value, name) => {
                    if (typeof value === 'number') {
                      return `€${value.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`
                    }
                    return value
                  }}
                  labelFormatter={(label) => format(new Date(label), 'dd MMMM yyyy', { locale: it })}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--chart-1))"
              fillOpacity={1}
              fill="url(#colorValue)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="cost"
              stroke="hsl(var(--chart-2))"
              fillOpacity={1}
              fill="url(#colorCost)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>

      {chartData.length > 0 && (
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Valore Finale</p>
            <p className="text-lg font-semibold">
              €{chartData[chartData.length - 1].value.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Guadagno/Perdita</p>
            <p className={`text-lg font-semibold ${chartData[chartData.length - 1].gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {chartData[chartData.length - 1].gain >= 0 ? '+' : ''}
              €{chartData[chartData.length - 1].gain.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Rendimento %</p>
            <p className={`text-lg font-semibold ${chartData[chartData.length - 1].gainPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {chartData[chartData.length - 1].gainPercentage >= 0 ? '+' : ''}
              {chartData[chartData.length - 1].gainPercentage.toFixed(2)}%
            </p>
          </div>
        </div>
      )}
    </div>
  )
}