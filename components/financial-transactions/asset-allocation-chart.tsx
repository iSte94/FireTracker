'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Cell, Pie, PieChart, ResponsiveContainer, Legend } from 'recharts'
import { cn } from '@/lib/utils'

interface Holding {
  ticker: string
  name: string
  asset_type: 'stock' | 'etf' | 'bond' | 'crypto' | 'commodity'
  currentValue: number
  allocation: number
}

interface AssetAllocationChartProps {
  holdings: Holding[]
  loading: boolean
}

const COLORS = {
  stock: '#3b82f6',      // blue-500
  etf: '#6366f1',        // indigo-500
  bond: '#6b7280',       // gray-500
  crypto: '#f97316',     // orange-500
  commodity: '#eab308',  // yellow-500
}

const ASSET_LABELS = {
  stock: 'Azioni',
  etf: 'ETF',
  bond: 'Obbligazioni',
  crypto: 'Crypto',
  commodity: 'Commodity',
}

export function AssetAllocationChart({ holdings, loading }: AssetAllocationChartProps) {
  const allocationData = useMemo(() => {
    if (!holdings.length) return { byType: [], byAsset: [] }

    // Allocazione per tipo di asset
    const typeAllocation = holdings.reduce((acc, holding) => {
      if (!acc[holding.asset_type]) {
        acc[holding.asset_type] = {
          name: ASSET_LABELS[holding.asset_type],
          value: 0,
          percentage: 0,
          count: 0,
        }
      }
      acc[holding.asset_type].value += holding.currentValue
      acc[holding.asset_type].count += 1
      return acc
    }, {} as Record<string, { name: string; value: number; percentage: number; count: number }>)

    const totalValue = Object.values(typeAllocation).reduce((sum, type) => sum + type.value, 0)

    const byType = Object.entries(typeAllocation).map(([type, data]) => ({
      ...data,
      percentage: (data.value / totalValue) * 100,
      fill: COLORS[type as keyof typeof COLORS],
    }))

    // Top 10 holdings per allocazione
    const byAsset = holdings
      .sort((a, b) => b.currentValue - a.currentValue)
      .slice(0, 10)
      .map((holding, index) => ({
        name: holding.ticker,
        fullName: holding.name,
        value: holding.currentValue,
        percentage: holding.allocation,
        fill: `hsl(${(index * 36) % 360}, 70%, 50%)`,
      }))

    return { byType, byAsset }
  }, [holdings])

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
            <Skeleton className="h-4 w-[200px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
            <Skeleton className="h-4 w-[200px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!holdings.length) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        Nessuna posizione disponibile per generare il grafico
      </div>
    )
  }

  const chartConfig = {
    value: {
      label: "Valore",
    },
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: data.payload.fill }}
                />
                <span className="font-medium">{data.name}</span>
              </div>
            </div>
            {data.payload.fullName && (
              <div className="text-xs text-muted-foreground">
                {data.payload.fullName}
              </div>
            )}
            <div className="grid gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">Valore:</span>
                <span className="text-sm font-medium">
                  €{data.value.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">Percentuale:</span>
                <span className="text-sm font-medium">
                  {data.payload.percentage.toFixed(2)}%
                </span>
              </div>
              {data.payload.count && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Numero asset:</span>
                  <span className="text-sm font-medium">{data.payload.count}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Allocazione per Tipo</CardTitle>
          <CardDescription>
            Distribuzione del portafoglio per categoria di asset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData.byType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => `${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {allocationData.byType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 space-y-2">
            {allocationData.byType.map((type) => (
              <div key={type.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: type.fill }}
                  />
                  <span className="text-sm">{type.name}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {type.count} {type.count === 1 ? 'asset' : 'assets'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top 10 Holdings</CardTitle>
          <CardDescription>
            Le 10 posizioni più grandi del portafoglio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData.byAsset}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {allocationData.byAsset.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 space-y-2 max-h-[150px] overflow-y-auto">
            {allocationData.byAsset.map((asset) => (
              <div key={asset.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: asset.fill }}
                  />
                  <span className="font-medium">{asset.name}</span>
                </div>
                <span className="text-muted-foreground">
                  {asset.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}