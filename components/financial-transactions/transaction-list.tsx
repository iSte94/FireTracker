'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EditTransactionDialog } from './edit-transaction-dialog'
import { 
  MoreHorizontal, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpDown,
  Edit,
  Trash2
} from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { financialTransactionsClient } from '@/lib/financial-transactions-client'

interface Transaction {
  id: string
  date: string
  type: 'buy' | 'sell' | 'dividend' | 'interest'
  asset_type: 'stock' | 'etf' | 'bond' | 'crypto' | 'commodity'
  ticker: string
  name: string
  quantity: number
  price: number
  fees: number
  total: number
  notes?: string
}

interface TransactionListProps {
  transactions: Transaction[]
  loading: boolean
  onTransactionUpdated: () => void
  onTransactionDeleted: () => void
}

export function TransactionList({
  transactions,
  loading,
  onTransactionUpdated,
  onTransactionDeleted
}: TransactionListProps) {
  const [sortField, setSortField] = useState<keyof Transaction>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null)
  const { toast } = useToast()

  const handleSort = (field: keyof Transaction) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedTransactions = [...transactions].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return 1
    if (bValue == null) return -1
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return

    try {
      await financialTransactionsClient.deleteTransaction(transactionToDelete.id)
      toast({
        title: 'Transazione eliminata',
        description: 'La transazione è stata eliminata con successo'
      })
      onTransactionDeleted()
    } catch (error) {
      console.error('Errore nell\'eliminazione:', error)
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare la transazione',
        variant: 'destructive'
      })
    } finally {
      setDeleteDialogOpen(false)
      setTransactionToDelete(null)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'sell':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getTransactionTypeBadge = (type: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      buy: { label: 'Acquisto', className: 'bg-green-100 text-green-800' },
      sell: { label: 'Vendita', className: 'bg-red-100 text-red-800' },
      dividend: { label: 'Dividendo', className: 'bg-blue-100 text-blue-800' },
      interest: { label: 'Interesse', className: 'bg-purple-100 text-purple-800' }
    }
    
    const variant = variants[type] || { label: type, className: '' }
    
    return (
      <Badge className={variant.className}>
        {variant.label}
      </Badge>
    )
  }

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

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nessuna transazione trovata
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('date')}
                  className="h-8 flex items-center gap-1"
                >
                  Data
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('ticker')}
                  className="h-8 flex items-center gap-1"
                >
                  Ticker
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Quantità</TableHead>
              <TableHead className="text-right">Prezzo</TableHead>
              <TableHead className="text-right">Commissioni</TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('total')}
                  className="h-8 flex items-center gap-1"
                >
                  Totale
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {format(new Date(transaction.date), 'dd MMM yyyy', { locale: it })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getTransactionIcon(transaction.type)}
                    {getTransactionTypeBadge(transaction.type)}
                  </div>
                </TableCell>
                <TableCell>
                  {getAssetTypeBadge(transaction.asset_type)}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{transaction.ticker}</div>
                    <div className="text-sm text-muted-foreground">{transaction.name}</div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {transaction.quantity.toLocaleString('it-IT')}
                </TableCell>
                <TableCell className="text-right">
                  €{transaction.price.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right">
                  €{transaction.fees.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right font-medium">
                  €{transaction.total.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <EditTransactionDialog
                        transaction={transaction}
                        onTransactionUpdated={onTransactionUpdated}
                      >
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifica
                        </DropdownMenuItem>
                      </EditTransactionDialog>
                      <DropdownMenuItem
                        className="text-red-600"
                        onSelect={() => {
                          setTransactionToDelete(transaction)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Elimina
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questa transazione? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTransaction}
              className="bg-red-600 hover:bg-red-700"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}