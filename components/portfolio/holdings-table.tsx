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
import { TrendingUp, TrendingDown, ArrowUpDown, Info, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  usePortfolioPrices, 
  formatPrice, 
  formatChangePercent, 
  getChangeColor,
  formatLastUpdate 
} from '@/hooks/use-portfolio-prices'

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

interface HoldingsTableProps {
  holdings: Holding[]
  loading: boolean
}

export function HoldingsTable({ holdings: initialHoldings, loading: initialLoading }: HoldingsTableProps) {
  const [sortField, setSortField] = useState<keyof Holding>('currentValue')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Estrai i ticker dalle holdings
  const tickers = useMemo(() => 
    initialHoldings.map(h => h.ticker),
    [initialHoldings]
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

  // Combina i dati delle holdings con i prezzi real-time
  const holdings = useMemo(() => {
    return initialHoldings.map(holding => {
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
  }, [initialHoldings, prices])

  // Calcola le allocazioni dopo aver aggiornato i valori
  const holdingsWithAllocation = useMemo(() => {
    const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0)
    
    return holdings.map(holding => ({
      ...holding,
      allocation: totalValue > 0 ? (holding.currentValue / totalValue) * 100 : 0
    }))
  }, [holdings])

  const handleSort = (field: keyof Holding) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedHoldings = [...holdingsWithAllocation].sort((a, b) => {
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
      stock: { label: 'Azione', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      etf: { label: 'ETF', className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
      bond: { label: 'Obbligazione', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
      crypto: { label: 'Crypto', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
      commodity: { label: 'Commodity', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' }
    }
    
    const variant = variants[type] || { label: type, className: '' }
    
    return (
      <Badge variant="outline" className={variant.className}>
        {variant.label}
      </Badge>
    )
  }

  const loading = initialLoading || (pricesLoading && prices.size === 0)

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (holdingsWithAllocation.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nessuna posizione aperta nel portafoglio
      </div>
    )
  }

  const totalValue = holdingsWithAllocation.reduce((sum, h) => sum + h.currentValue, 0)
  const totalCost = holdingsWithAllocation.reduce((sum, h) => sum + h.totalCost, 0)
  const totalGainLoss = holdingsWithAllocation.reduce((sum, h) => sum + h.gainLoss, 0)
  const totalDayChange = holdingsWithAllocation.reduce((sum, h) => sum + h.dayChange, 0)

  return (
    <div className="space-y-4">
      {/* Barra di stato prezzi */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          {lastUpdate && (
            <>
              <span>Prezzi aggiornati: {formatLastUpdate(lastUpdate)}</span>
              {prices.size > 0 && (
                <Badge variant="outline" className="text-xs">
                  Live
                </Badge>
              )}
            </>
          )}
          {pricesError && (
            <span className="text-red-500">Errore nel caricamento prezzi</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          disabled={isRefreshing}
          className="h-8"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          <span className="ml-2">Aggiorna prezzi</span>
        </Button>
      </div>

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
              <TableHead className="text-right">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-end gap-1">
                        Prezzo Medio
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Prezzo medio di carico</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead className="text-right">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-end gap-1">
                        Prezzo Attuale
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Prezzi real-time da Yahoo Finance</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
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
                  G/P (€)
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('gainLossPercentage')}
                  className="h-8 flex items-center gap-1"
                >
                  G/P (%)
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('allocation')}
                  className="h-8 flex items-center gap-1"
                >
                  Peso %
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedHoldings.map((holding) => {
              const priceData = prices.get(holding.ticker.toUpperCase())
              const hasRealTimePrice = priceData && !priceData.error
              
              return (
                <TableRow key={holding.ticker}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{holding.ticker}</div>
                      <div className="text-sm text-muted-foreground">
                        {holding.displayName || holding.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getAssetTypeBadge(holding.asset_type)}
                  </TableCell>
                  <TableCell className="text-right">
                    {holding.quantity.toLocaleString('it-IT', { maximumFractionDigits: 6 })}
                  </TableCell>
                  <TableCell className="text-right">
                    €{holding.avgPrice.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="space-y-1">
                      <div className="flex items-center justify-end gap-1">
                        {hasRealTimePrice && holding.marketState === 'REGULAR' && (
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        )}
                        <span>
                          {formatPrice(holding.currentPrice, holding.currency || 'EUR')}
                        </span>
                      </div>
                      {hasRealTimePrice && (
                        <div className={getChangeColor(holding.dayChangePercentage)}>
                          {formatChangePercent(holding.dayChangePercentage)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    €{holding.currentValue.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                        €{Math.abs(holding.gainLoss).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  <TableCell>
                    <div className="space-y-1">
                      <Progress value={holding.allocation} className="h-2" />
                      <div className="text-xs text-center text-muted-foreground">
                        {holding.allocation.toFixed(1)}%
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Riepilogo totali */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">Valore Totale</p>
          <p className="text-lg font-semibold">
            €{totalValue.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Costo Totale</p>
          <p className="text-lg font-semibold">
            €{totalCost.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">G/P Totale</p>
          <p className={cn(
            "text-lg font-semibold",
            totalGainLoss >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {totalGainLoss >= 0 ? '+' : ''}€{Math.abs(totalGainLoss).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">G/P %</p>
          <p className={cn(
            "text-lg font-semibold",
            totalGainLoss >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {totalCost > 0 ? (
              <>
                {totalGainLoss >= 0 ? '+' : ''}
                {((totalGainLoss / totalCost) * 100).toFixed(2)}%
              </>
            ) : '0.00%'}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Variazione Oggi</p>
          <p className={cn(
            "text-lg font-semibold",
            totalDayChange >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {totalDayChange >= 0 ? '+' : ''}€{Math.abs(totalDayChange).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  )
}