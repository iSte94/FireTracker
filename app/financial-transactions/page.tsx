'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TransactionList } from '@/components/financial-transactions/transaction-list'
import { AddTransactionDialog } from '@/components/financial-transactions/add-transaction-dialog'
import { TransactionFilters } from '@/components/financial-transactions/transaction-filters'
import { PortfolioSummary } from '@/components/financial-transactions/portfolio-summary'
import { PortfolioPerformanceChart } from '@/components/financial-transactions/portfolio-performance-chart'
import { HoldingsTable } from '@/components/financial-transactions/holdings-table'
import { AssetAllocationChart } from '@/components/financial-transactions/asset-allocation-chart'
import { Download, Plus, TrendingUp } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { financialTransactionsClient } from '@/lib/financial-transactions-client'
import { format } from 'date-fns'

export default function FinancialTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [holdings, setHoldings] = useState<any[]>([])
  const [portfolioMetrics, setPortfolioMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    assetType: 'all',
    transactionType: 'all',
    dateRange: 'all',
    searchTerm: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    try {
      setLoading(true)
      const [transactionsData, holdingsData, metricsData] = await Promise.all([
        financialTransactionsClient.getTransactions(filters),
        financialTransactionsClient.getHoldings(),
        financialTransactionsClient.getPortfolioMetrics()
      ])
      
      setTransactions(transactionsData)
      setHoldings(holdingsData)
      setPortfolioMetrics(metricsData)
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error)
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i dati delle transazioni',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      const csv = await financialTransactionsClient.exportTransactionsToCSV(transactions)
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transazioni_${format(new Date(), 'yyyy-MM-dd')}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: 'Export completato',
        description: 'Le transazioni sono state esportate con successo'
      })
    } catch (error) {
      console.error('Errore nell\'export:', error)
      toast({
        title: 'Errore',
        description: 'Impossibile esportare le transazioni',
        variant: 'destructive'
      })
    }
  }

  const handleTransactionAdded = () => {
    loadData()
  }

  const handleTransactionUpdated = () => {
    loadData()
  }

  const handleTransactionDeleted = () => {
    loadData()
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transazioni Finanziarie</h1>
          <p className="text-muted-foreground mt-2">
            Gestisci il tuo portafoglio di investimenti e monitora le performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Esporta CSV
          </Button>
          <AddTransactionDialog onTransactionAdded={handleTransactionAdded}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuova Transazione
            </Button>
          </AddTransactionDialog>
        </div>
      </div>

      {/* Riepilogo Portafoglio */}
      <PortfolioSummary metrics={portfolioMetrics} loading={loading} />

      {/* Tabs per diverse visualizzazioni */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions">Transazioni</TabsTrigger>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="allocation">Allocazione</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storico Transazioni</CardTitle>
              <CardDescription>
                Visualizza e gestisci tutte le tue transazioni finanziarie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TransactionFilters 
                filters={filters} 
                onFiltersChange={setFilters} 
              />
              <TransactionList 
                transactions={transactions}
                loading={loading}
                onTransactionUpdated={handleTransactionUpdated}
                onTransactionDeleted={handleTransactionDeleted}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="holdings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Holdings Attuali</CardTitle>
              <CardDescription>
                Dettaglio delle tue posizioni aperte e del loro valore attuale
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HoldingsTable holdings={holdings} loading={loading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance del Portafoglio</CardTitle>
              <CardDescription>
                Andamento del valore del tuo portafoglio nel tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PortfolioPerformanceChart 
                transactions={transactions} 
                loading={loading} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Allocazione Asset</CardTitle>
              <CardDescription>
                Distribuzione del tuo portafoglio per tipo di asset
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssetAllocationChart 
                holdings={holdings} 
                loading={loading} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}