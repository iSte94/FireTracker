"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Filter, X, Search } from "lucide-react"

export interface BudgetFilter {
  search?: string
  category?: string
  period?: string
  status?: string
  minAmount?: number
  maxAmount?: number
}

interface BudgetFiltersProps {
  onFilterChange?: (filters: BudgetFilter) => void
}

export default function BudgetFilters({ onFilterChange }: BudgetFiltersProps) {
  const [filters, setFilters] = useState<BudgetFilter>({})
  const [open, setOpen] = useState(false)

  const handleFilterChange = (newFilters: BudgetFilter) => {
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const clearFilter = (key: keyof BudgetFilter) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    handleFilterChange(newFilters)
  }

  const clearAllFilters = () => {
    handleFilterChange({})
  }

  const activeFilterCount = Object.keys(filters).length

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cerca budget..."
            value={filters.search || ""}
            onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtri
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Filtri Budget</h4>
              <p className="text-sm text-muted-foreground">
                Filtra i budget per trovare quello che cerchi
              </p>
            </div>
            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="category-filter">Categoria</Label>
                <Select
                  value={filters.category || ""}
                  onValueChange={(value) =>
                    handleFilterChange({ ...filters, category: value || undefined })
                  }
                >
                  <SelectTrigger id="category-filter">
                    <SelectValue placeholder="Tutte le categorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tutte le categorie</SelectItem>
                    <SelectItem value="Casa">Casa</SelectItem>
                    <SelectItem value="Cibo">Cibo</SelectItem>
                    <SelectItem value="Trasporti">Trasporti</SelectItem>
                    <SelectItem value="Svago">Svago</SelectItem>
                    <SelectItem value="Bollette">Bollette</SelectItem>
                    <SelectItem value="Salute">Salute</SelectItem>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                    <SelectItem value="Educazione">Educazione</SelectItem>
                    <SelectItem value="Investimenti">Investimenti</SelectItem>
                    <SelectItem value="Altro">Altro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="period-filter">Periodo</Label>
                <Select
                  value={filters.period || ""}
                  onValueChange={(value) =>
                    handleFilterChange({ ...filters, period: value || undefined })
                  }
                >
                  <SelectTrigger id="period-filter">
                    <SelectValue placeholder="Tutti i periodi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tutti i periodi</SelectItem>
                    <SelectItem value="MONTHLY">Mensile</SelectItem>
                    <SelectItem value="QUARTERLY">Trimestrale</SelectItem>
                    <SelectItem value="YEARLY">Annuale</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status-filter">Stato</Label>
                <Select
                  value={filters.status || ""}
                  onValueChange={(value) =>
                    handleFilterChange({ ...filters, status: value || undefined })
                  }
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Tutti gli stati" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tutti gli stati</SelectItem>
                    <SelectItem value="ACTIVE">Attivo</SelectItem>
                    <SelectItem value="PAUSED">In pausa</SelectItem>
                    <SelectItem value="COMPLETED">Completato</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Importo</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minAmount || ""}
                    onChange={(e) =>
                      handleFilterChange({
                        ...filters,
                        minAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxAmount || ""}
                    onChange={(e) =>
                      handleFilterChange({
                        ...filters,
                        maxAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="w-full"
              >
                Rimuovi tutti i filtri
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.category && (
            <Badge variant="secondary" className="gap-1">
              Categoria: {filters.category}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => clearFilter("category")}
              />
            </Badge>
          )}
          {filters.period && (
            <Badge variant="secondary" className="gap-1">
              Periodo: {filters.period === "MONTHLY" ? "Mensile" : filters.period === "QUARTERLY" ? "Trimestrale" : "Annuale"}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => clearFilter("period")}
              />
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="gap-1">
              Stato: {filters.status === "ACTIVE" ? "Attivo" : filters.status === "PAUSED" ? "In pausa" : "Completato"}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => clearFilter("status")}
              />
            </Badge>
          )}
          {(filters.minAmount || filters.maxAmount) && (
            <Badge variant="secondary" className="gap-1">
              Importo: €{filters.minAmount || "0"} - €{filters.maxAmount || "∞"}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  clearFilter("minAmount")
                  clearFilter("maxAmount")
                }}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}