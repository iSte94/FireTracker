'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useToast } from '@/hooks/use-toast'
import { financialTransactionsClient } from '@/lib/financial-transactions-client'

const formSchema = z.object({
  date: z.date({
    required_error: 'La data è obbligatoria',
  }),
  type: z.enum(['buy', 'sell', 'dividend', 'interest'], {
    required_error: 'Il tipo di transazione è obbligatorio',
  }),
  asset_type: z.enum(['stock', 'etf', 'bond', 'crypto', 'commodity'], {
    required_error: 'Il tipo di asset è obbligatorio',
  }),
  ticker: z.string().min(1, 'Il ticker è obbligatorio').toUpperCase(),
  name: z.string().min(1, 'Il nome è obbligatorio'),
  quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'La quantità deve essere un numero positivo',
  }),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Il prezzo deve essere un numero positivo',
  }),
  fees: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Le commissioni devono essere un numero positivo',
  }),
  notes: z.string().optional(),
})

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

interface EditTransactionDialogProps {
  children: React.ReactNode
  transaction: Transaction
  onTransactionUpdated: () => void
}

export function EditTransactionDialog({ 
  children, 
  transaction, 
  onTransactionUpdated 
}: EditTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(transaction.date),
      type: transaction.type,
      asset_type: transaction.asset_type,
      ticker: transaction.ticker,
      name: transaction.name,
      quantity: transaction.quantity.toString(),
      price: transaction.price.toString(),
      fees: transaction.fees.toString(),
      notes: transaction.notes || '',
    },
  })

  const watchQuantity = form.watch('quantity')
  const watchPrice = form.watch('price')
  const watchFees = form.watch('fees')

  const calculateTotal = () => {
    const quantity = parseFloat(watchQuantity) || 0
    const price = parseFloat(watchPrice) || 0
    const fees = parseFloat(watchFees) || 0
    const subtotal = quantity * price
    const type = form.watch('type')
    
    if (type === 'buy') {
      return subtotal + fees
    } else if (type === 'sell') {
      return subtotal - fees
    } else {
      return subtotal
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      
      const transactionData = {
        ...values,
        quantity: parseFloat(values.quantity),
        price: parseFloat(values.price),
        fees: parseFloat(values.fees),
        total: calculateTotal(),
        date: values.date.toISOString(),
      }

      await financialTransactionsClient.updateTransaction(transaction.id, transactionData)
      
      toast({
        title: 'Transazione aggiornata',
        description: 'La transazione è stata aggiornata con successo',
      })
      
      setOpen(false)
      onTransactionUpdated()
    } catch (error) {
      console.error('Errore nell\'aggiornamento della transazione:', error)
      toast({
        title: 'Errore',
        description: 'Impossibile aggiornare la transazione',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTickerChange = async (ticker: string) => {
    form.setValue('ticker', ticker.toUpperCase())
    
    // Qui potresti implementare l'autocompletamento del nome
    // basandoti su un'API esterna o su dati salvati
    if (ticker.length >= 2) {
      // Esempio di autocompletamento (da implementare con API reale)
      const suggestions = {
        'AAPL': 'Apple Inc.',
        'GOOGL': 'Alphabet Inc.',
        'MSFT': 'Microsoft Corporation',
        'AMZN': 'Amazon.com Inc.',
        'TSLA': 'Tesla Inc.',
      }
      
      const name = suggestions[ticker.toUpperCase() as keyof typeof suggestions]
      if (name && ticker !== transaction.ticker) {
        form.setValue('name', name)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Modifica Transazione</DialogTitle>
          <DialogDescription>
            Modifica i dettagli della transazione finanziaria
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: it })
                            ) : (
                              <span>Seleziona data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo Transazione</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="buy">Acquisto</SelectItem>
                        <SelectItem value="sell">Vendita</SelectItem>
                        <SelectItem value="dividend">Dividendo</SelectItem>
                        <SelectItem value="interest">Interesse</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="asset_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo Asset</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona tipo asset" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="stock">Azione</SelectItem>
                        <SelectItem value="etf">ETF</SelectItem>
                        <SelectItem value="bond">Obbligazione</SelectItem>
                        <SelectItem value="crypto">Crypto</SelectItem>
                        <SelectItem value="commodity">Commodity</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ticker"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ticker</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="es. AAPL"
                        {...field}
                        onChange={(e) => handleTickerChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Asset</FormLabel>
                  <FormControl>
                    <Input placeholder="es. Apple Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantità</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.000001"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prezzo (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commissioni (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {(watchQuantity || watchPrice) && (
              <div className="rounded-lg bg-muted p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Totale:</span>
                  <span className="text-lg font-bold">
                    €{calculateTotal().toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (opzionale)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Aggiungi note sulla transazione..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Annulla
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salva Modifiche
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}