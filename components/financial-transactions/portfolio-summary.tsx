'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, DollarSign, Percent, PieChart, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

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
}

export function PortfolioSummary({ metrics, loading }: PortfolioSummaryProps) {
  if (loading) {
    return (
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
    )
  }

  if (!metrics) {
    return null
  }

  const cards = [
    {
      title: 'Valore Totale',
      value: `€${metrics.totalValue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
      description: `Variazione giornaliera: ${metrics.dayChangePercentage >= 0 ? '+' : ''}${metrics.dayChangePercentage.toFixed(2)}%`,
      icon: DollarSign,
      trend: metrics.dayChange,
      trendValue: `€${Math.abs(metrics.dayChange).toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
    },
    {
      title: 'Guadagno/Perdita Totale',
      value: `€${Math.abs(metrics.totalGainLoss).toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
      description: `${metrics.totalGainLossPercentage >= 0 ? '+' : ''}${metrics.totalGainLossPercentage.toFixed(2)}%`,
      icon: metrics.totalGainLoss >= 0 ? TrendingUp : TrendingDown,
      trend: metrics.totalGainLoss,
      valueClassName: metrics.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600',
    },
    {
      title: 'Dividendi Totali',
      value: `€${metrics.totalDividends.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
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
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
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
                  "text-xs font-medium",
                  card.trend >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {card.trend >= 0 ? '+' : '-'}{card.trendValue}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}