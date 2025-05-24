'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, DollarSign, Percent, PieChart, Activity, RefreshCw, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatLastUpdate } from '@/hooks/use-portfolio-prices'

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

interface PortfolioSummaryProps {
  metrics: PortfolioMetrics | null
  loading: boolean
  lastPriceUpdate?: Date | null
  onRefreshPrices?: () => void
  isRefreshing?: boolean
}

export function PortfolioSummary({ 
  metrics, 
  loading, 
  lastPriceUpdate,
  onRefreshPrices,
  isRefreshing = false
}: PortfolioSummaryProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-[120px]" />
                <Skeleton className="h-4 w-[80px] mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!metrics) {
    return null
  }

  const cards = [
    {
      title: 'Valore Totale',
      value: `€${metrics.totalValue.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: `Variazione giornaliera: ${metrics.dayChangePercentage >= 0 ? '+' : ''}${metrics.dayChangePercentage.toFixed(2)}%`,
      icon: DollarSign,
      trend: metrics.dayChange,
      trendValue: `€${Math.abs(metrics.dayChange).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      showLiveIndicator: true,
    },
    {
      title: 'Guadagno/Perdita Totale',
      value: `€${Math.abs(metrics.totalGainLoss).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: `${metrics.totalGainLossPercentage >= 0 ? '+' : ''}${metrics.totalGainLossPercentage.toFixed(2)}%`,
      icon: metrics.totalGainLoss >= 0 ? TrendingUp : TrendingDown,
      trend: metrics.totalGainLoss,
      valueClassName: metrics.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600',
      showLiveIndicator: true,
    },
    {
      title: 'Dividendi Totali',
      value: `€${metrics.totalDividends.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: 'Dividendi e interessi ricevuti',
      icon: Percent,
      iconClassName: 'text-blue-600',
    },
    {
      title: 'Performance',
      value: `${metrics.totalGainLossPercentage >= 0 ? '+' : ''}${metrics.totalGainLossPercentage.toFixed(2)}%`,
      description: 'Rendimento totale del portafoglio',
      icon: Activity,
      valueClassName: metrics.totalGainLossPercentage >= 0 ? 'text-green-600' : 'text-red-600',
      showLiveIndicator: true,
    },
  ]

  return (
    <div className="space-y-4">
      {/* Barra di stato prezzi */}
      {(lastPriceUpdate || onRefreshPrices) && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            {lastPriceUpdate && (
              <>
                <Clock className="h-3 w-3" />
                <span>Prezzi aggiornati: {formatLastUpdate(lastPriceUpdate)}</span>
                <Badge variant="outline" className="text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
                  Live
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <Card key={index} className="relative overflow-hidden">
            {/* Indicatore live per carte con prezzi real-time */}
            {card.showLiveIndicator && lastPriceUpdate && (
              <div className="absolute top-2 right-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Prezzi real-time</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={cn("h-4 w-4 text-muted-foreground", card.iconClassName)} />
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", card.valueClassName)}>
                {card.value}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">{card.description}</p>
                {card.trend !== undefined && (
                  <span className={cn(
                    "text-xs font-medium flex items-center gap-1",
                    card.trend >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {card.trend >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {card.trendValue}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}