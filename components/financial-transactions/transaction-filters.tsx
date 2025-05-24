'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X } from 'lucide-react'

interface TransactionFilters {
  assetType: string
  transactionType: string
  dateRange: string
  searchTerm: string
}

interface TransactionFiltersProps {
  filters: TransactionFilters
  onFiltersChange: (filters: TransactionFilters) => void
}

export function TransactionFilters({ filters, onFiltersChange }: TransactionFiltersProps) {
  const handleFilterChange = (key: keyof TransactionFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const handleReset = () => {
    onFiltersChange({
      assetType: 'all',
      transactionType: 'all',
      dateRange: 'all',
      searchTerm: '',
    })
  }

  const hasActiveFilters = 
    filters.assetType !== 'all' || 
    filters.transactionType !== 'all' || 
    filters.dateRange !== 'all' || 
    filters.searchTerm !== ''

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cerca per ticker o nome..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select
          value={filters.assetType}
          onValueChange={(value) => handleFilterChange('assetType', value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Tipo Asset" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli Asset</SelectItem>
            <SelectItem value="stock">Azioni</SelectItem>
            <SelectItem value="etf">ETF</SelectItem>
            <SelectItem value="bond">Obbligazioni</SelectItem>
            <SelectItem value="crypto">Crypto</SelectItem>
            <SelectItem value="commodity">Commodity</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.transactionType}
          onValueChange={(value) => handleFilterChange('transactionType', value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Tipo Transazione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le Transazioni</SelectItem>
            <SelectItem value="buy">Acquisti</SelectItem>
            <SelectItem value="sell">Vendite</SelectItem>
            <SelectItem value="dividend">Dividendi</SelectItem>
            <SelectItem value="interest">Interessi</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.dateRange}
          onValueChange={(value) => handleFilterChange('dateRange', value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutto il periodo</SelectItem>
            <SelectItem value="today">Oggi</SelectItem>
            <SelectItem value="week">Ultima settimana</SelectItem>
            <SelectItem value="month">Ultimo mese</SelectItem>
            <SelectItem value="quarter">Ultimo trimestre</SelectItem>
            <SelectItem value="year">Ultimo anno</SelectItem>
            <SelectItem value="ytd">Da inizio anno</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Filtri attivi:</span>
          {filters.searchTerm && (
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1">
              Ricerca: {filters.searchTerm}
            </span>
          )}
          {filters.assetType !== 'all' && (
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1">
              Asset: {getAssetTypeLabel(filters.assetType)}
            </span>
          )}
          {filters.transactionType !== 'all' && (
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1">
              Tipo: {getTransactionTypeLabel(filters.transactionType)}
            </span>
          )}
          {filters.dateRange !== 'all' && (
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1">
              Periodo: {getDateRangeLabel(filters.dateRange)}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function getAssetTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    stock: 'Azioni',
    etf: 'ETF',
    bond: 'Obbligazioni',
    crypto: 'Crypto',
    commodity: 'Commodity',
  }
  return labels[type] || type
}

function getTransactionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    buy: 'Acquisti',
    sell: 'Vendite',
    dividend: 'Dividendi',
    interest: 'Interessi',
  }
  return labels[type] || type
}

function getDateRangeLabel(range: string): string {
  const labels: Record<string, string> = {
    today: 'Oggi',
    week: 'Ultima settimana',
    month: 'Ultimo mese',
    quarter: 'Ultimo trimestre',
    year: 'Ultimo anno',
    ytd: 'Da inizio anno',
  }
  return labels[range] || range
}