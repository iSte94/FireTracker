'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { TrendingUp, TrendingDown, Calendar, DollarSign, Percent, RefreshCw, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatLastUpdate } from '@/hooks/use-portfolio-prices'

interface Holding {
  ticker: string
  name: string
  asset_type: 'stock' | 'etf' | 'bond' | 'crypto' | 'commodity'
  quantity: number
  avgPrice: number
  currentPrice: number
  totalCost: number
  currentValue: number
  gainLoss: number
  gainLossPercentage: number
  allocation: number
  dayChange: number
  dayChangePercentage: number
  // Proprietà opzionali da Yahoo Finance
  currency?: string
  marketState?: string
  displayName?: string
}

interface PortfolioMetrics {
  totalValue: number
  totalCost: number
  totalGainLoss: number
  totalGainLossPercentage: number
  dayChange: number
  dayChangePercentage: number
  totalDividends: number
  totalFees: number
}

interface PortfolioPerformanceProps {
  holdings: Holding[]
  metrics: PortfolioMetrics | null
  loading: boolean
  lastPriceUpdate?: Date | null
  onRefreshPrices?: () => void
  isRefreshing?: boolean
}

export function PortfolioPerformance({ 
  holdings, 
  metrics, 
  loading,
  lastPriceUpdate,
  onRefreshPrices,
  isRefreshing = false
}: PortfolioPerformanceProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!metrics || holdings.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8 text-muted-foreground">
          Nessun dato disponibile per la performance
        </CardContent>
      </Card>
    )
  }

  // Simulazione dati storici performance (in futuro verranno dai dati reali)
  const generateHistoricalData = () => {
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
    const currentMonth = new Date().getMonth()
    const baseValue = metrics.totalCost
    
    return months.slice(0, currentMonth + 1).map((month, index) => {
      const randomVariation = 0.95 + Math.random() * 0.15 // -5% a +10%
      const value = baseValue * (1 + (index * 0.01)) * randomVariation
      const gain = value - baseValue
      const gainPercentage = (gain / baseValue) * 100
      
      return {
        month,
        value: Math.round(value),
        gain: Math.round(gain),
        gainPercentage: gainPercentage.toFixed(2)
      }
    })
  }

  const historicalData = generateHistoricalData()

  // Performance per asset
  const assetPerformance = [...holdings]
    .sort((a, b) => b.gainLossPercentage - a.gainLossPercentage)
    .slice(0, 5)

  const worstPerformers = [...holdings]
    .sort((a, b) => a.gainLossPercentage - b.gainLossPercentage)
    .slice(0, 5)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{payload[0].payload.month}</p>
          <p className="text-sm">
            Valore: €{payload[0].value.toLocaleString('it-IT')}
          </p>
          <p className={cn(
            "text-sm font-medium",
            payload[0].payload.gain >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {payload[0].payload.gain >= 0 ? '+' : ''}€{payload[0].payload.gain.toLocaleString('it-IT')} ({payload[0].payload.gainPercentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      {/* Barra di stato prezzi */}
      {(lastPriceUpdate || onRefreshPrices) && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            {lastPriceUpdate && (
              <>
                <Clock className="h-3 w-3" />
                <span>Performance aggiornata: {formatLastUpdate(lastPriceUpdate)}</span>
                <Badge variant="outline" className="text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
                  Real-time
                </Badge>
              </>
            )}
          </div>
          {onRefreshPrices && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefreshPrices}
              disabled={isRefreshing}
              className="h-8"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              <span className="ml-2 hidden sm:inline">Aggiorna</span>
            </Button>
          )}
        </div>
      )}

      {/* Grafico performance storica */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Storica</CardTitle>
          <CardDescription>
            Andamento del valore del portafoglio nel tempo (simulato)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="value" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="value">Valore</TabsTrigger>
              <TabsTrigger value="percentage">Percentuale</TabsTrigger>
            </TabsList>
            
            <TabsContent value="value" className="space-y-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="percentage" className="space-y-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="gainPercentage" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Statistiche performance */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="relative overflow-hidden">
          {lastPriceUpdate && (
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          )}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance YTD</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              metrics.totalGainLossPercentage >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {metrics.totalGainLossPercentage >= 0 ? '+' : ''}{metrics.totalGainLossPercentage.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Da inizio anno
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rendimento Annualizzato</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{(metrics.totalGainLossPercentage * 1.2).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Proiezione annuale (simulata)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dividendi/Interessi</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{metrics.totalDividends.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Totale ricevuto
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top e Worst performers */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Top Performers
            </CardTitle>
            <CardDescription>
              I migliori asset per rendimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assetPerformance.map((holding, index) => (
                <div key={holding.ticker} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-6">
                      {index + 1}.
                    </span>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {holding.ticker}
                        {holding.marketState === 'REGULAR' && lastPriceUpdate && (
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {holding.displayName || holding.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "font-medium",
                      holding.gainLossPercentage >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {holding.gainLossPercentage >= 0 ? '+' : ''}{holding.gainLossPercentage.toFixed(2)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      €{Math.abs(holding.gainLoss).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Worst Performers
            </CardTitle>
            <CardDescription>
              Gli asset con performance peggiore
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {worstPerformers.map((holding, index) => (
                <div key={holding.ticker} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-6">
                      {index + 1}.
                    </span>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {holding.ticker}
                        {holding.marketState === 'REGULAR' && lastPriceUpdate && (
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {holding.displayName || holding.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "font-medium",
                      holding.gainLossPercentage >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {holding.gainLossPercentage >= 0 ? '+' : ''}{holding.gainLossPercentage.toFixed(2)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      €{Math.abs(holding.gainLoss).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}