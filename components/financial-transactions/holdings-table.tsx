'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { cn } from '@/lib/utils'

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

interface HoldingsTableProps {
  holdings: Holding[]
  loading: boolean
}

export function HoldingsTable({ holdings, loading }: HoldingsTableProps) {
  const [sortField, setSortField] = useState<keyof Holding>('currentValue')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: keyof Holding) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedHoldings = [...holdings].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    }
    
    return 0
  })

  const getAssetTypeBadge = (type: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      stock: { label: 'Azione', className: 'bg-blue-100 text-blue-800' },
      etf: { label: 'ETF', className: 'bg-indigo-100 text-indigo-800' },
      bond: { label: 'Obbligazione', className: 'bg-gray-100 text-gray-800' },
      crypto: { label: 'Crypto', className: 'bg-orange-100 text-orange-800' },
      commodity: { label: 'Commodity', className: 'bg-yellow-100 text-yellow-800' }
    }
    
    const variant = variants[type] || { label: type, className: '' }
    
    return (
      <Badge variant="outline" className={variant.className}>
        {variant.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (holdings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nessuna posizione aperta nel portafoglio
      </div>
    )
  }

  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0)

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('ticker')}
                  className="h-8 flex items-center gap-1"
                >
                  Asset
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('quantity')}
                  className="h-8 flex items-center gap-1"
                >
                  Quantità
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Prezzo Medio</TableHead>
              <TableHead className="text-right">Prezzo Attuale</TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('currentValue')}
                  className="h-8 flex items-center gap-1"
                >
                  Valore
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('gainLoss')}
                  className="h-8 flex items-center gap-1"
                >
                  G/P
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="text-right">G/P %</TableHead>
              <TableHead className="text-right">Var. Giorn.</TableHead>
              <TableHead className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('allocation')}
                  className="h-8 flex items-center gap-1"
                >
                  Allocazione
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedHoldings.map((holding) => (
              <TableRow key={holding.ticker}>
                <TableCell>
                  <div>
                    <div className="font-medium">{holding.ticker}</div>
                    <div className="text-sm text-muted-foreground">{holding.name}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {getAssetTypeBadge(holding.asset_type)}
                </TableCell>
                <TableCell className="text-right">
                  {holding.quantity.toLocaleString('it-IT', { maximumFractionDigits: 6 })}
                </TableCell>
                <TableCell className="text-right">
                  €{holding.avgPrice.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right">
                  €{holding.currentPrice.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right font-medium">
                  €{holding.currentValue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right">
                  <div className={cn(
                    "flex items-center justify-end gap-1",
                    holding.gainLoss >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {holding.gainLoss >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span className="font-medium">
                      €{Math.abs(holding.gainLoss).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className={cn(
                    "font-medium",
                    holding.gainLossPercentage >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {holding.gainLossPercentage >= 0 ? '+' : ''}
                    {holding.gainLossPercentage.toFixed(2)}%
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="space-y-1">
                    <div className={cn(
                      "text-sm font-medium",
                      holding.dayChange >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {holding.dayChange >= 0 ? '+' : ''}
                      €{holding.dayChange.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </div>
                    <div className={cn(
                      "text-xs",
                      holding.dayChangePercentage >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {holding.dayChangePercentage >= 0 ? '+' : ''}
                      {holding.dayChangePercentage.toFixed(2)}%
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Progress value={holding.allocation} className="h-2" />
                    <div className="text-xs text-center text-muted-foreground">
                      {holding.allocation.toFixed(1)}%
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">Valore Totale</p>
          <p className="text-lg font-semibold">
            €{totalValue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Numero Posizioni</p>
          <p className="text-lg font-semibold">{holdings.length}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">G/P Totale</p>
          <p className={cn(
            "text-lg font-semibold",
            holdings.reduce((sum, h) => sum + h.gainLoss, 0) >= 0 ? "text-green-600" : "text-red-600"
          )}>
            €{Math.abs(holdings.reduce((sum, h) => sum + h.gainLoss, 0)).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Variazione Giornaliera</p>
          <p className={cn(
            "text-lg font-semibold",
            holdings.reduce((sum, h) => sum + h.dayChange, 0) >= 0 ? "text-green-600" : "text-red-600"
          )}>
            €{Math.abs(holdings.reduce((sum, h) => sum + h.dayChange, 0)).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  )
}