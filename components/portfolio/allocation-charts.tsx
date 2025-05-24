'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Badge } from '@/components/ui/badge'

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
}

interface AllocationChartsProps {
  holdings: Holding[]
  loading: boolean
}

const COLORS = {
  stock: '#3B82F6',
  etf: '#6366F1',
  bond: '#6B7280',
  crypto: '#F97316',
  commodity: '#EAB308'
}

const ASSET_TYPE_LABELS = {
  stock: 'Azioni',
  etf: 'ETF',
  bond: 'Obbligazioni',
  crypto: 'Crypto',
  commodity: 'Commodity'
}

// Simulazione allocazione geografica (in futuro verrà dai dati reali)
const GEOGRAPHIC_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export function AllocationCharts({ holdings, loading }: AllocationChartsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (holdings.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8 text-muted-foreground">
          Nessun dato disponibile per i grafici di allocazione
        </CardContent>
      </Card>
    )
  }

  // Calcola allocazione per tipo di asset
  const assetTypeAllocation = holdings.reduce((acc, holding) => {
    if (!acc[holding.asset_type]) {
      acc[holding.asset_type] = {
        name: ASSET_TYPE_LABELS[holding.asset_type],
        value: 0,
        percentage: 0
      }
    }
    acc[holding.asset_type].value += holding.currentValue
    return acc
  }, {} as Record<string, { name: string; value: number; percentage: number }>)

  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0)
  
  const assetTypeData = Object.entries(assetTypeAllocation).map(([type, data]) => ({
    ...data,
    percentage: (data.value / totalValue) * 100,
    type
  })).sort((a, b) => b.value - a.value)

  // Simulazione allocazione geografica (placeholder)
  const geographicData = [
    { name: 'USA', value: totalValue * 0.4, percentage: 40 },
    { name: 'Europa', value: totalValue * 0.25, percentage: 25 },
    { name: 'Asia Pacifico', value: totalValue * 0.15, percentage: 15 },
    { name: 'Mercati Emergenti', value: totalValue * 0.1, percentage: 10 },
    { name: 'Italia', value: totalValue * 0.07, percentage: 7 },
    { name: 'Altro', value: totalValue * 0.03, percentage: 3 }
  ]

  // Top 10 holdings per peso
  const topHoldings = [...holdings]
    .sort((a, b) => b.allocation - a.allocation)
    .slice(0, 10)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            €{payload[0].value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm font-medium">
            {payload[0].payload.percentage.toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Allocazione per tipo di asset */}
        <Card>
          <CardHeader>
            <CardTitle>Allocazione per Tipo di Asset</CardTitle>
            <CardDescription>
              Distribuzione del portafoglio per categoria di investimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {assetTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.type as keyof typeof COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {assetTypeData.map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[item.type as keyof typeof COLORS] }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.percentage.toFixed(1)}%</span>
                    <span className="text-sm text-muted-foreground">
                      €{item.value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Allocazione geografica */}
        <Card>
          <CardHeader>
            <CardTitle>Allocazione Geografica</CardTitle>
            <CardDescription>
              Distribuzione geografica degli investimenti (simulata)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={geographicData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {geographicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={GEOGRAPHIC_COLORS[index % GEOGRAPHIC_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {geographicData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: GEOGRAPHIC_COLORS[index % GEOGRAPHIC_COLORS.length] }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.percentage.toFixed(1)}%</span>
                    <span className="text-sm text-muted-foreground">
                      €{item.value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Holdings */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Posizioni</CardTitle>
          <CardDescription>
            Le posizioni con maggior peso nel portafoglio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topHoldings.map((holding, index) => (
              <div key={holding.ticker} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground w-6">
                    {index + 1}.
                  </span>
                  <div>
                    <div className="font-medium">{holding.ticker}</div>
                    <div className="text-sm text-muted-foreground">{holding.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-xs">
                    {ASSET_TYPE_LABELS[holding.asset_type]}
                  </Badge>
                  <div className="text-right">
                    <div className="font-medium">
                      €{holding.currentValue.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {holding.allocation.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}