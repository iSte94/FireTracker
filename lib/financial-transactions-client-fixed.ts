import { createClientComponentClient } from '@/lib/supabase-client'
import { startOfDay, endOfDay, subDays, subMonths, subYears, startOfYear } from 'date-fns'
import type { 
  FinancialTransaction, 
  PortfolioHolding,
  AssetType,
  TransactionType
} from '@/types/investment'

export interface Holding {
  ticker_symbol: string
  asset_name: string
  asset_type: AssetType
  total_quantity: number
  average_cost: number
  current_price: number
  total_cost: number
  current_value: number
  unrealized_gain_loss: number
  gainLossPercentage: number
  percentage_of_portfolio: number
  dayChange: number
  dayChangePercentage: number
}

export interface PortfolioMetrics {
  totalValue: number
  totalCost: number
  totalGainLoss: number
  totalGainLossPercentage: number
  dayChange: number
  dayChangePercentage: number
  totalDividends: number
  totalFees: number
}

interface TransactionFilters {
  assetType: string
  transactionType: string
  dateRange: string
  searchTerm: string
}

class FinancialTransactionsClient {
  private supabase = createClientComponentClient()

  async getTransactions(filters?: TransactionFilters): Promise<FinancialTransaction[]> {
    try {
      let query = this.supabase
        .from('financial_transactions')
        .select('*')
        .order('transaction_date', { ascending: false })

      // Applica filtri
      if (filters) {
        if (filters.assetType && filters.assetType !== 'all') {
          query = query.eq('asset_type', filters.assetType)
        }

        if (filters.transactionType && filters.transactionType !== 'all') {
          query = query.eq('transaction_type', filters.transactionType)
        }

        if (filters.searchTerm) {
          query = query.or(`ticker_symbol.ilike.%${filters.searchTerm}%,asset_name.ilike.%${filters.searchTerm}%`)
        }

        if (filters.dateRange && filters.dateRange !== 'all') {
          const now = new Date()
          let startDate: Date

          switch (filters.dateRange) {
            case 'today':
              startDate = startOfDay(now)
              break
            case 'week':
              startDate = subDays(now, 7)
              break
            case 'month':
              startDate = subMonths(now, 1)
              break
            case 'quarter':
              startDate = subMonths(now, 3)
              break
            case 'year':
              startDate = subYears(now, 1)
              break
            case 'ytd':
              startDate = startOfYear(now)
              break
            default:
              startDate = new Date(0)
          }

          query = query.gte('transaction_date', startDate.toISOString())
        }
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Errore nel recupero delle transazioni:', error)
      throw error
    }
  }

  async createTransaction(transaction: Omit<FinancialTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<FinancialTransaction> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Utente non autenticato')

      const { data, error } = await this.supabase
        .from('financial_transactions')
        .insert({
          ...transaction,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Errore nella creazione della transazione:', error)
      throw error
    }
  }

  async updateTransaction(id: string, transaction: Partial<FinancialTransaction>): Promise<FinancialTransaction> {
    try {
      const { data, error } = await this.supabase
        .from('financial_transactions')
        .update(transaction)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Errore nell\'aggiornamento della transazione:', error)
      throw error
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('financial_transactions')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Errore nell\'eliminazione della transazione:', error)
      throw error
    }
  }

  async getHoldings(): Promise<Holding[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Utente non autenticato')

      const { data: holdings, error } = await this.supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error
      if (!holdings) return []

      // Converti da PortfolioHolding a Holding per compatibilità UI
      return holdings.map((h: PortfolioHolding) => ({
        ticker_symbol: h.ticker_symbol || '',
        asset_name: h.asset_name,
        asset_type: h.asset_type,
        total_quantity: h.total_quantity,
        average_cost: h.average_cost,
        current_price: h.current_price || h.average_cost,
        total_cost: h.total_cost,
        current_value: h.current_value || h.total_cost,
        unrealized_gain_loss: h.unrealized_gain_loss || 0,
        gainLossPercentage: h.total_cost > 0 ? ((h.unrealized_gain_loss || 0) / h.total_cost) * 100 : 0,
        percentage_of_portfolio: h.percentage_of_portfolio || 0,
        // Simula variazione giornaliera (in produzione useresti un'API di mercato)
        dayChange: 0,
        dayChangePercentage: 0
      }))
    } catch (error) {
      console.error('Errore nel recupero delle holdings:', error)
      throw error
    }
  }

  async getPortfolioMetrics(): Promise<PortfolioMetrics> {
    try {
      const [holdings, transactions] = await Promise.all([
        this.getHoldings(),
        this.getTransactions()
      ])

      const totalValue = holdings.reduce((sum, h) => sum + h.current_value, 0)
      const totalCost = holdings.reduce((sum, h) => sum + h.total_cost, 0)
      const totalGainLoss = totalValue - totalCost
      const totalGainLossPercentage = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0
      const dayChange = holdings.reduce((sum, h) => sum + h.dayChange, 0)
      const dayChangePercentage = totalValue > 0 ? (dayChange / (totalValue - dayChange)) * 100 : 0

      // Calcola dividendi e commissioni totali
      const totalDividends = transactions
        .filter(t => t.transaction_type === 'dividend' || t.transaction_type === 'interest')
        .reduce((sum, t) => sum + t.total_amount, 0)
      
      const totalFees = transactions.reduce((sum, t) => sum + t.fees, 0)

      return {
        totalValue,
        totalCost,
        totalGainLoss,
        totalGainLossPercentage,
        dayChange,
        dayChangePercentage,
        totalDividends,
        totalFees,
      }
    } catch (error) {
      console.error('Errore nel calcolo delle metriche del portafoglio:', error)
      throw error
    }
  }

  async exportTransactionsToCSV(transactions: FinancialTransaction[]): Promise<string> {
    const headers = [
      'Data',
      'Tipo',
      'Tipo Asset',
      'Ticker',
      'Nome',
      'Quantità',
      'Prezzo',
      'Commissioni',
      'Totale',
      'Note'
    ]

    const rows = transactions.map(t => [
      t.transaction_date,
      t.transaction_type,
      t.asset_type,
      t.ticker_symbol || '',
      t.asset_name,
      (t.quantity || 0).toString(),
      (t.price_per_unit || 0).toString(),
      t.fees.toString(),
      t.total_amount.toString(),
      t.notes || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return csvContent
  }
}

export const financialTransactionsClient = new FinancialTransactionsClient()