'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PortfolioSummary } from '@/components/portfolio/portfolio-summary'
import { HoldingsTable } from '@/components/portfolio/holdings-table'
import { AllocationCharts } from '@/components/portfolio/allocation-charts'
import { PortfolioPerformance } from '@/components/portfolio/portfolio-performance'
import { PriceErrorHandler } from '@/components/portfolio/price-error-handler'
import { financialTransactionsClient } from '@/lib/financial-transactions-client'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { usePortfolioPrices } from '@/hooks/use-portfolio-prices'

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<any[]>([])
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estrai i ticker dalle holdings
  const tickers = useMemo(() => 
    holdings.map(h => h.ticker),
    [holdings]
  )

  // Usa l'hook per ottenere i prezzi real-time
  const { 
    prices, 
    loading: pricesLoading, 
    error: pricesError, 
    lastUpdate, 
    refresh, 
    isRefreshing 
  } = usePortfolioPrices({
    tickers,
    refreshInterval: 60000, // Aggiorna ogni minuto
    enabled: tickers.length > 0
  })

  useEffect(() => {
    loadPortfolioData()
  }, [])

  const loadPortfolioData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [holdingsData, metricsData] = await Promise.all([
        financialTransactionsClient.getHoldings(),
        financialTransactionsClient.getPortfolioMetrics()
      ])

      setHoldings(holdingsData)
      setMetrics(metricsData)
    } catch (err) {
      console.error('Errore nel caricamento del portafoglio:', err)
      setError('Impossibile caricare i dati del portafoglio. Riprova più tardi.')
    } finally {
      setLoading(false)
    }
  }

  // Combina i dati delle holdings con i prezzi real-time
  const holdingsWithRealTimePrices = useMemo(() => {
    return holdings.map(holding => {
      const priceData = prices.get(holding.ticker.toUpperCase())
      
      if (priceData && !priceData.error) {
        const currentPrice = priceData.price
        const currentValue = holding.quantity * currentPrice
        const gainLoss = currentValue - holding.totalCost
        const gainLossPercentage = holding.totalCost > 0 
          ? (gainLoss / holding.totalCost) * 100 
          : 0
        
        return {
          ...holding,
          currentPrice,
          currentValue,
          gainLoss,
          gainLossPercentage,
          dayChange: priceData.change * holding.quantity,
          dayChangePercentage: priceData.changePercent,
          // Aggiungi informazioni extra dal prezzo
          currency: priceData.currency,
          marketState: priceData.marketState,
          displayName: priceData.displayName || holding.name,
        }
      }
      
      // Se non ci sono prezzi real-time, usa i dati originali
      return holding
    })
  }, [holdings, prices])

  // Ricalcola le metriche con i prezzi real-time
  const metricsWithRealTimePrices = useMemo(() => {
    if (!metrics) return null

    const totalValue = holdingsWithRealTimePrices.reduce((sum, h) => sum + h.currentValue, 0)
    const totalCost = holdingsWithRealTimePrices.reduce((sum, h) => sum + h.totalCost, 0)
    const totalGainLoss = holdingsWithRealTimePrices.reduce((sum, h) => sum + h.gainLoss, 0)
    const totalDayChange = holdingsWithRealTimePrices.reduce((sum, h) => sum + (h.dayChange || 0), 0)
    
    const totalGainLossPercentage = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0
    const dayChangePercentage = totalValue > 0 ? (totalDayChange / (totalValue - totalDayChange)) * 100 : 0

    return {
      ...metrics,
      totalValue,
      totalGainLoss,
      totalGainLossPercentage,
      dayChange: totalDayChange,
      dayChangePercentage
    }
  }, [metrics, holdingsWithRealTimePrices])

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Errore</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Portafoglio</h1>
        <p className="text-muted-foreground">
          Visualizza e analizza il tuo portafoglio di investimenti con prezzi real-time
        </p>
      </div>

      {/* Gestione errori prezzi */}
      {prices.size > 0 && (
        <PriceErrorHandler
          prices={prices}
          onRetry={refresh}
        />
      )}

      {/* Riepilogo del portafoglio con prezzi real-time */}
      <PortfolioSummary
        metrics={metricsWithRealTimePrices}
        loading={loading}
        lastPriceUpdate={lastUpdate}
        onRefreshPrices={refresh}
        isRefreshing={isRefreshing}
      />

      {/* Tabs per le diverse visualizzazioni */}
      <Tabs defaultValue="holdings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="holdings">Posizioni</TabsTrigger>
          <TabsTrigger value="allocation">Allocazione</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="holdings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Posizioni Aperte</CardTitle>
              <CardDescription>
                Dettaglio di tutti gli asset nel tuo portafoglio con prezzi real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HoldingsTable 
                holdings={holdingsWithRealTimePrices} 
                loading={loading} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          <AllocationCharts 
            holdings={holdingsWithRealTimePrices} 
            loading={loading} 
          />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PortfolioPerformance 
            holdings={holdingsWithRealTimePrices} 
            metrics={metricsWithRealTimePrices} 
            loading={loading}
            lastPriceUpdate={lastUpdate}
            onRefreshPrices={refresh}
            isRefreshing={isRefreshing}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}