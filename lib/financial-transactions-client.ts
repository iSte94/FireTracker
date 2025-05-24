import { createClientComponentClient } from '@/lib/supabase-client'
import { startOfDay, endOfDay, subDays, subMonths, subYears, startOfYear } from 'date-fns'

export interface FinancialTransaction {
  id: string
  user_id: string
  date: string
  transaction_type: 'buy' | 'sell' | 'dividend' | 'interest'
  asset_type: 'stock' | 'etf' | 'bond' | 'crypto' | 'commodity'
  ticker: string
  asset_name: string
  quantity: number
  price: number
  fees: number
  total: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface Holding {
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
      console.log('[FinancialTransactionsClient] getTransactions chiamato con filtri:', filters)
      
      // Verifica autenticazione
      const { data: { user }, error: authError } = await this.supabase.auth.getUser()
      if (authError) {
        console.error('[FinancialTransactionsClient] Errore autenticazione:', authError)
        throw new Error('Utente non autenticato')
      }
      if (!user) {
        console.error('[FinancialTransactionsClient] Nessun utente autenticato')
        throw new Error('Utente non autenticato')
      }
      
      console.log('[FinancialTransactionsClient] Utente autenticato:', user.id)

      let query = this.supabase
        .from('financial_transactions')
        .select('*')
        .order('transaction_date', { ascending: false })

      // Applica filtri
      if (filters) {
        if (filters.assetType && filters.assetType !== 'all') {
          console.log('[FinancialTransactionsClient] Applicando filtro asset_type:', filters.assetType)
          query = query.eq('asset_type', filters.assetType)
        }

        if (filters.transactionType && filters.transactionType !== 'all') {
          console.log('[FinancialTransactionsClient] Applicando filtro transaction_type:', filters.transactionType)
          query = query.eq('transaction_type', filters.transactionType)
        }

        if (filters.searchTerm) {
          console.log('[FinancialTransactionsClient] Applicando filtro ricerca:', filters.searchTerm)
          query = query.or(`ticker.ilike.%${filters.searchTerm}%,name.ilike.%${filters.searchTerm}%`)
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

          console.log('[FinancialTransactionsClient] Applicando filtro data da:', startDate.toISOString())
          query = query.gte('transaction_date', startDate.toISOString())
        }
      }

      console.log('[FinancialTransactionsClient] Eseguendo query...')
      const { data, error } = await query

      if (error) {
        console.error('[FinancialTransactionsClient] Errore query database:', error)
        console.error('[FinancialTransactionsClient] Dettagli errore:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }
      
      console.log('[FinancialTransactionsClient] Query completata. Transazioni trovate:', data?.length || 0)
      
      // I dati dal database sono già nel formato corretto dell'interfaccia
      const mappedTransactions: FinancialTransaction[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        date: item.date,
        transaction_type: item.transaction_type,
        asset_type: item.asset_type,
        ticker: item.ticker,
        asset_name: item.asset_name,
        quantity: item.quantity,
        price: item.price,
        fees: item.fees,
        total: item.total,
        notes: item.notes,
        created_at: item.created_at,
        updated_at: item.updated_at
      }))
      
      return mappedTransactions
    } catch (error) {
      console.error('[FinancialTransactionsClient] Errore nel recupero delle transazioni:', error)
      throw error
    }
  }

  async createTransaction(transaction: any): Promise<FinancialTransaction> {
    try {
      console.log('[FinancialTransactionsClient] createTransaction chiamato con:', transaction)
      
      // Verifica autenticazione con logging migliorato
      const { data: { user }, error: authError } = await this.supabase.auth.getUser()
      if (authError || !user) {
        console.error('[FinancialTransactionsClient] Errore autenticazione dettagliato:', {
          error: authError,
          errorMessage: authError?.message || 'Nessun utente autenticato',
          errorCode: authError?.status || 'NO_USER',
          timestamp: new Date().toISOString(),
          userExists: !!user,
          userId: user?.id || 'N/A',
          userEmail: user?.email || 'N/A'
        })
        throw new Error(`Errore di autenticazione: ${authError?.message || 'Utente non autenticato'}`)
      }

      console.log('[FinancialTransactionsClient] Utente autenticato:', {
        userId: user.id,
        email: user.email,
        timestamp: new Date().toISOString()
      })

      // Test schema connection prima dell'operazione critica
      console.log('[FinancialTransactionsClient] Test connessione schema...')
      const schemaOk = await this.testSchemaConnection()
      if (!schemaOk) {
        console.log('[FinancialTransactionsClient] Schema test fallito, tentativo refresh...')
        await this.forceSchemaRefresh()
        
        // Riprova il test dopo il refresh
        const schemaRetryOk = await this.testSchemaConnection()
        if (!schemaRetryOk) {
          throw new Error('Schema database non accessibile dopo refresh. Verifica la configurazione.')
        }
      }

      // Validazione pre-insert dei dati
      console.log('[FinancialTransactionsClient] Avvio validazione pre-insert...')
      this.validateTransactionData(transaction)

      // Test connettività database (legacy - mantenuto per compatibilità)
      console.log('[FinancialTransactionsClient] Test connettività database...')
      await this.testDatabaseConnection()

      // Mappiamo i dati dal formato del frontend al formato del database
      // CORREZIONE: Il database richiede 'transaction_type' invece di 'type'
      const dbTransaction = {
        user_id: user.id,
        date: transaction.date,
        transaction_type: transaction.type, // CORREZIONE: Mappato da 'type' a 'transaction_type'
        asset_type: transaction.asset_type,
        ticker: transaction.ticker,
        asset_name: transaction.asset_name,
        quantity: transaction.quantity,
        price: transaction.price,
        fees: transaction.fees,
        total: transaction.total,
        notes: transaction.notes
      }

      console.log('[FinancialTransactionsClient] Dati mappati per il database:', dbTransaction)
      console.log('[FinancialTransactionsClient] ✅ CORREZIONE APPLICATA: Il codice ora invia campo "transaction_type" con valore:', dbTransaction.transaction_type)
      console.log('[FinancialTransactionsClient] Verifica tipi di dati:', {
        date_type: typeof dbTransaction.date,
        date_value: dbTransaction.date,
        type_field: 'transaction_type', // Campo corretto che stiamo inviando
        type_value: dbTransaction.transaction_type, // Valore che stiamo inviando
        quantity_type: typeof dbTransaction.quantity,
        quantity_value: dbTransaction.quantity,
        price_type: typeof dbTransaction.price,
        price_value: dbTransaction.price,
        fees_type: typeof dbTransaction.fees,
        fees_value: dbTransaction.fees,
        total_type: typeof dbTransaction.total,
        total_value: dbTransaction.total
      })

      const { data, error } = await this.supabase
        .from('financial_transactions')
        .insert(dbTransaction)
        .select()
        .single()

      if (error) {
        console.error('[FinancialTransactionsClient] 🚨 ERRORE DATABASE RILEVATO!')
        console.error('[FinancialTransactionsClient] Messaggio errore:', error.message)
        console.error('[FinancialTransactionsClient] Codice errore:', error.code)
        
        // Verifica specifica per il problema transaction_type
        if (error.message && error.message.includes('transaction_type')) {
          console.error('[FinancialTransactionsClient] 🚨 ERRORE TRANSACTION_TYPE RILEVATO!')
          console.error('[FinancialTransactionsClient] Dati inviati:', dbTransaction)
          console.error('[FinancialTransactionsClient] Campo inviato: "transaction_type" =', dbTransaction.transaction_type)
          console.error('[FinancialTransactionsClient] Nota: La correzione del mapping è stata applicata')
        }
        
        console.error('[FinancialTransactionsClient] Errore creazione transazione - Logging migliorato:', JSON.stringify({
          error: this.serializeError(error),
          transactionData: dbTransaction,
          userId: user.id,
          timestamp: new Date().toISOString(),
          context: 'createTransaction - database insert error'
        }, null, 2))
        throw error
      }
      
      console.log('[FinancialTransactionsClient] Transazione creata con successo:', data.id)
      
      // I dati dal database sono già nel formato corretto dell'interfaccia
      const mappedTransaction: FinancialTransaction = {
        id: data.id,
        user_id: data.user_id,
        date: data.date,
        transaction_type: data.transaction_type,
        asset_type: data.asset_type,
        ticker: data.ticker,
        asset_name: data.asset_name,
        quantity: data.quantity,
        price: data.price,
        fees: data.fees,
        total: data.total,
        notes: data.notes,
        created_at: data.created_at,
        updated_at: data.updated_at
      }
      
      return mappedTransaction
    } catch (error) {
      console.error('[FinancialTransactionsClient] Errore nella creazione della transazione - Catch finale:', JSON.stringify({
        error: this.serializeError(error),
        context: 'createTransaction - catch finale',
        timestamp: new Date().toISOString()
      }, null, 2))
      throw error
    }
  }

  async updateTransaction(id: string, transaction: Partial<FinancialTransaction>): Promise<FinancialTransaction> {
    try {
      console.log('[FinancialTransactionsClient] updateTransaction chiamato per ID:', id)
      
      // Verifica autenticazione
      const { data: { user }, error: authError } = await this.supabase.auth.getUser()
      if (authError || !user) {
        console.error('[FinancialTransactionsClient] Errore autenticazione:', authError)
        throw new Error('Utente non autenticato')
      }

      // I campi dell'interfaccia ora corrispondono direttamente al database
      const dbUpdate: any = {}
      if (transaction.date !== undefined) dbUpdate.date = transaction.date
      if (transaction.transaction_type !== undefined) dbUpdate.transaction_type = transaction.transaction_type
      if (transaction.asset_type !== undefined) dbUpdate.asset_type = transaction.asset_type
      if (transaction.ticker !== undefined) dbUpdate.ticker = transaction.ticker
      if (transaction.asset_name !== undefined) dbUpdate.asset_name = transaction.asset_name
      if (transaction.quantity !== undefined) dbUpdate.quantity = transaction.quantity
      if (transaction.price !== undefined) dbUpdate.price = transaction.price
      if (transaction.fees !== undefined) dbUpdate.fees = transaction.fees
      if (transaction.total !== undefined) dbUpdate.total = transaction.total
      if (transaction.notes !== undefined) dbUpdate.notes = transaction.notes

      const { data, error } = await this.supabase
        .from('financial_transactions')
        .update(dbUpdate)
        .eq('id', id)
        .eq('user_id', user.id) // Assicura che l'utente possa modificare solo le proprie transazioni
        .select()
        .single()

      if (error) {
        console.error('[FinancialTransactionsClient] Errore aggiornamento transazione:', error)
        throw error
      }
      
      console.log('[FinancialTransactionsClient] Transazione aggiornata con successo')
      
      // I dati dal database sono già nel formato corretto dell'interfaccia
      const mappedTransaction: FinancialTransaction = {
        id: data.id,
        user_id: data.user_id,
        date: data.date,
        transaction_type: data.transaction_type,
        asset_type: data.asset_type,
        ticker: data.ticker,
        asset_name: data.asset_name,
        quantity: data.quantity,
        price: data.price,
        fees: data.fees,
        total: data.total,
        notes: data.notes,
        created_at: data.created_at,
        updated_at: data.updated_at
      }
      
      return mappedTransaction
    } catch (error) {
      console.error('[FinancialTransactionsClient] Errore nell\'aggiornamento della transazione:', error)
      throw error
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    try {
      console.log('[FinancialTransactionsClient] deleteTransaction chiamato per ID:', id)
      
      // Verifica autenticazione
      const { data: { user }, error: authError } = await this.supabase.auth.getUser()
      if (authError || !user) {
        console.error('[FinancialTransactionsClient] Errore autenticazione:', authError)
        throw new Error('Utente non autenticato')
      }

      const { error } = await this.supabase
        .from('financial_transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id) // Assicura che l'utente possa eliminare solo le proprie transazioni

      if (error) {
        console.error('[FinancialTransactionsClient] Errore eliminazione transazione:', error)
        throw error
      }
      
      console.log('[FinancialTransactionsClient] Transazione eliminata con successo')
    } catch (error) {
      console.error('[FinancialTransactionsClient] Errore nell\'eliminazione della transazione:', error)
      throw error
    }
  }

  async getHoldings(): Promise<Holding[]> {
    try {
      console.log('[FinancialTransactionsClient] getHoldings chiamato')
      
      const transactions = await this.getTransactions()
      console.log('[FinancialTransactionsClient] Calcolando holdings da', transactions.length, 'transazioni')
      
      // Calcola le holdings basandosi sulle transazioni
      const holdingsMap = new Map<string, Holding>()

      transactions.forEach((transaction) => {
        const key = transaction.ticker
        let holding = holdingsMap.get(key)

        if (!holding) {
          holding = {
            ticker: transaction.ticker,
            name: transaction.asset_name,
            asset_type: transaction.asset_type,
            quantity: 0,
            avgPrice: 0,
            currentPrice: 0,
            totalCost: 0,
            currentValue: 0,
            gainLoss: 0,
            gainLossPercentage: 0,
            allocation: 0,
            dayChange: 0,
            dayChangePercentage: 0,
          }
          holdingsMap.set(key, holding)
        }

        if (transaction.transaction_type === 'buy') {
          const newQuantity = holding.quantity + transaction.quantity
          const newTotalCost = holding.totalCost + transaction.total
          holding.avgPrice = newTotalCost / newQuantity
          holding.quantity = newQuantity
          holding.totalCost = newTotalCost
        } else if (transaction.transaction_type === 'sell') {
          holding.quantity -= transaction.quantity
          holding.totalCost -= transaction.quantity * holding.avgPrice
        }
      })

      // Filtra holdings con quantità > 0 e calcola metriche
      const activeHoldings = Array.from(holdingsMap.values()).filter(h => h.quantity > 0)
      
      console.log('[FinancialTransactionsClient] Holdings attive:', activeHoldings.length)
      
      // In un'app reale, qui dovresti recuperare i prezzi correnti da un'API
      // Per ora simuliamo con variazioni casuali
      activeHoldings.forEach((holding) => {
        // Simula prezzo corrente (in produzione useresti un'API di mercato)
        const priceVariation = 0.9 + Math.random() * 0.2 // -10% a +10%
        holding.currentPrice = holding.avgPrice * priceVariation
        holding.currentValue = holding.quantity * holding.currentPrice
        holding.gainLoss = holding.currentValue - holding.totalCost
        holding.gainLossPercentage = (holding.gainLoss / holding.totalCost) * 100
        
        // Simula variazione giornaliera
        const dayVariation = -0.05 + Math.random() * 0.1 // -5% a +5%
        holding.dayChange = holding.currentValue * dayVariation
        holding.dayChangePercentage = dayVariation * 100
      })

      // Calcola allocazione
      const totalValue = activeHoldings.reduce((sum, h) => sum + h.currentValue, 0)
      activeHoldings.forEach((holding) => {
        holding.allocation = totalValue > 0 ? (holding.currentValue / totalValue) * 100 : 0
      })

      return activeHoldings.sort((a, b) => b.currentValue - a.currentValue)
    } catch (error) {
      console.error('[FinancialTransactionsClient] Errore nel recupero delle holdings:', error)
      throw error
    }
  }

  async getPortfolioMetrics(): Promise<PortfolioMetrics> {
    try {
      console.log('[FinancialTransactionsClient] getPortfolioMetrics chiamato')
      
      const [holdings, transactions] = await Promise.all([
        this.getHoldings(),
        this.getTransactions()
      ])

      console.log('[FinancialTransactionsClient] Calcolando metriche portfolio')

      const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0)
      const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0)
      const totalGainLoss = totalValue - totalCost
      const totalGainLossPercentage = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0
      const dayChange = holdings.reduce((sum, h) => sum + h.dayChange, 0)
      const dayChangePercentage = totalValue > 0 ? (dayChange / (totalValue - dayChange)) * 100 : 0

      // Calcola dividendi e commissioni totali
      const totalDividends = transactions
        .filter(t => t.transaction_type === 'dividend' || t.transaction_type === 'interest')
        .reduce((sum, t) => sum + t.total_amount, 0)
      
      const totalFees = transactions.reduce((sum, t) => sum + t.fees, 0)

      const metrics = {
        totalValue,
        totalCost,
        totalGainLoss,
        totalGainLossPercentage,
        dayChange,
        dayChangePercentage,
        totalDividends,
        totalFees,
      }

      console.log('[FinancialTransactionsClient] Metriche calcolate:', metrics)
      return metrics
    } catch (error) {
      console.error('[FinancialTransactionsClient] Errore nel calcolo delle metriche del portafoglio:', error)
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
      t.ticker_symbol,
      t.asset_name,
      t.quantity.toString(),
      t.price_per_unit.toString(),
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

  /**
   * Serializza correttamente gli oggetti Error per il logging
   * Gestisce le proprietà non enumerabili degli Error e proprietà specifiche di Supabase
   */
  private serializeError(error: any): any {
    if (!error) return null;
    
    const serialized: any = {};
    
    // Copia proprietà non enumerabili standard degli Error
    if (error.name) serialized.name = error.name;
    if (error.message) serialized.message = error.message;
    if (error.stack) serialized.stack = error.stack;
    
    // Proprietà specifiche di Supabase/PostgreSQL
    if (error.code) serialized.code = error.code;
    if (error.details) serialized.details = error.details;
    if (error.hint) serialized.hint = error.hint;
    if (error.status) serialized.status = error.status;
    
    // Altre proprietà enumerabili
    Object.keys(error).forEach(key => {
      if (!serialized[key]) {
        serialized[key] = error[key];
      }
    });
    
    // Aggiungi timestamp per il debugging
    serialized.timestamp = new Date().toISOString();
    
    return serialized;
  }

  /**
   * Valida i dati della transazione prima dell'inserimento nel database
   */
  private validateTransactionData(transaction: any): void {
    console.log('[FinancialTransactionsClient] Validazione dati transazione...')
    
    const errors: string[] = []

    // Validazione data
    if (!transaction.date) {
      errors.push('Data mancante')
    } else {
      const date = new Date(transaction.date)
      if (isNaN(date.getTime())) {
        errors.push('Formato data non valido')
      }
      if (date > new Date()) {
        errors.push('La data non può essere nel futuro')
      }
    }

    // Validazione tipo transazione
    const validTypes = ['buy', 'sell', 'dividend', 'interest']
    if (!transaction.type || !validTypes.includes(transaction.type)) {
      errors.push(`Tipo transazione non valido. Deve essere uno di: ${validTypes.join(', ')}`)
    }

    // Validazione tipo asset
    const validAssetTypes = ['stock', 'etf', 'bond', 'crypto', 'commodity']
    if (!transaction.asset_type || !validAssetTypes.includes(transaction.asset_type)) {
      errors.push(`Tipo asset non valido. Deve essere uno di: ${validAssetTypes.join(', ')}`)
    }

    // Validazione constraints numerici
    if (typeof transaction.quantity !== 'number' || transaction.quantity <= 0) {
      errors.push('La quantità deve essere un numero positivo (> 0)')
    }

    if (typeof transaction.price !== 'number' || transaction.price < 0) {
      errors.push('Il prezzo deve essere un numero non negativo (>= 0)')
    }

    if (typeof transaction.fees !== 'number' || transaction.fees < 0) {
      errors.push('Le commissioni devono essere un numero non negativo (>= 0)')
    }

    // Validazione campi obbligatori
    if (!transaction.ticker || typeof transaction.ticker !== 'string' || transaction.ticker.trim().length === 0) {
      errors.push('Ticker obbligatorio')
    }

    if (!transaction.name || typeof transaction.name !== 'string' || transaction.name.trim().length === 0) {
      errors.push('Nome asset obbligatorio')
    }

    if (errors.length > 0) {
      const errorMessage = `Errori di validazione: ${errors.join(', ')}`
      console.error('[FinancialTransactionsClient] Validazione fallita:', {
        errors,
        transactionData: transaction,
        timestamp: new Date().toISOString()
      })
      throw new Error(errorMessage)
    }

    console.log('[FinancialTransactionsClient] Validazione completata con successo')
  }

  /**
   * Testa la connettività al database prima dell'inserimento
   */
  private async testDatabaseConnection(): Promise<void> {
    try {
      console.log('[FinancialTransactionsClient] Test connettività database...')
      
      const { data, error } = await this.supabase
        .from('financial_transactions')
        .select('count')
        .limit(1)

      if (error) {
        console.error('[FinancialTransactionsClient] Test connettività fallito:', JSON.stringify({
          error: this.serializeError(error),
          context: 'testDatabaseConnection - database query error'
        }, null, 2))
        throw new Error(`Connessione al database fallita: ${error.message}`)
      }

      console.log('[FinancialTransactionsClient] Test connettività completato con successo')
    } catch (error) {
      console.error('[FinancialTransactionsClient] Errore durante test connettività:', JSON.stringify({
        error: this.serializeError(error),
        context: 'testDatabaseConnection - catch finale'
      }, null, 2))
      throw error
    }
  }

  /**
   * Testa la connessione allo schema e verifica l'esistenza della colonna date
   * Fornisce diagnostica dettagliata per problemi di cache schema
   */
  async testSchemaConnection(): Promise<boolean> {
    try {
      console.log('[FinancialTransactionsClient] Avvio test connessione schema...')
      
      // Test 1: Verifica connessione base
      console.log('[FinancialTransactionsClient] Test 1: Connessione base...')
      const { data: baseTest, error: baseError } = await this.supabase
        .from('financial_transactions')
        .select('count')
        .limit(1)
      
      if (baseError) {
        console.error('[FinancialTransactionsClient] Test connessione base fallito:', this.serializeError(baseError))
        return false
      }
      
      console.log('[FinancialTransactionsClient] ✅ Connessione base OK')
      
      // Test 2: Verifica specifica colonna date (problema PGRST204)
      console.log('[FinancialTransactionsClient] Test 2: Accesso colonna date...')
      const { data: dateTest, error: dateError } = await this.supabase
        .from('financial_transactions')
        .select('date')
        .limit(1)
      
      if (dateError) {
        console.error('[FinancialTransactionsClient] Test colonna date fallito:', this.serializeError(dateError))
        
        if (dateError.code === 'PGRST204') {
          console.error('[FinancialTransactionsClient] 🚨 RILEVATO ERRORE PGRST204 - Cache schema non aggiornata!')
          console.error('[FinancialTransactionsClient] Soluzioni suggerite:')
          console.error('[FinancialTransactionsClient] 1. Esegui: npm run schema:refresh')
          console.error('[FinancialTransactionsClient] 2. Riavvia il progetto locale')
          console.error('[FinancialTransactionsClient] 3. Verifica lo schema database')
        }
        
        return false
      }
      
      console.log('[FinancialTransactionsClient] ✅ Colonna date accessibile')
      
      // Test 3: Verifica quale campo per il tipo di transazione è presente
      console.log('[FinancialTransactionsClient] Test 3: Verifica campo tipo transazione...')
      
      // Prima prova con 'type'
      const { data: typeTest, error: typeError } = await this.supabase
        .from('financial_transactions')
        .select('type')
        .limit(1)
      
      if (!typeError) {
        console.log('[FinancialTransactionsClient] ✅ Schema usa campo "type"')
      } else {
        console.log('[FinancialTransactionsClient] ❌ Campo "type" non trovato:', this.serializeError(typeError))
        
        // Prova con 'transaction_type'
        const { data: transactionTypeTest, error: transactionTypeError } = await this.supabase
          .from('financial_transactions')
          .select('transaction_type')
          .limit(1)
        
        if (!transactionTypeError) {
          console.log('[FinancialTransactionsClient] ✅ Schema usa campo "transaction_type"')
          console.log('[FinancialTransactionsClient] 🚨 PROBLEMA IDENTIFICATO: Il database usa "transaction_type" ma il codice mappa "type"!')
        } else {
          console.log('[FinancialTransactionsClient] ❌ Nessun campo tipo transazione trovato!')
          console.error('[FinancialTransactionsClient] Errore transaction_type:', this.serializeError(transactionTypeError))
        }
      }
      
      // Test 4: Verifica tutte le colonne critiche
      console.log('[FinancialTransactionsClient] Test 4: Tutte le colonne...')
      const { data: fullTest, error: fullError } = await this.supabase
        .from('financial_transactions')
        .select('id, user_id, date, transaction_type, asset_type, ticker, name, quantity, price, fees, total, notes, created_at, updated_at')
        .limit(1)
      
      if (fullError) {
        console.error('[FinancialTransactionsClient] Test colonne complete fallito:', this.serializeError(fullError))
        return false
      }
      
      console.log('[FinancialTransactionsClient] ✅ Tutte le colonne accessibili')
      
      // Test 5: Verifica policy RLS
      console.log('[FinancialTransactionsClient] Test 5: Policy RLS...')
      const { data: { user }, error: authError } = await this.supabase.auth.getUser()
      
      if (authError || !user) {
        console.warn('[FinancialTransactionsClient] ⚠️ Utente non autenticato - Test RLS saltato')
      } else {
        const { data: rlsTest, error: rlsError } = await this.supabase
          .from('financial_transactions')
          .select('id')
          .limit(1)
        
        if (rlsError) {
          console.error('[FinancialTransactionsClient] Test RLS fallito:', this.serializeError(rlsError))
          return false
        }
        
        console.log('[FinancialTransactionsClient] ✅ Policy RLS funzionanti')
      }
      
      console.log('[FinancialTransactionsClient] 🎉 Test schema completato con successo!')
      return true
      
    } catch (error) {
      console.error('[FinancialTransactionsClient] Errore durante test schema:', this.serializeError(error))
      return false
    }
  }

  /**
   * Forza il refresh della cache dello schema prima delle operazioni critiche
   */
  async forceSchemaRefresh(): Promise<void> {
    try {
      console.log('[FinancialTransactionsClient] Forzando refresh cache schema...')
      
      // Sequenza di query per forzare il refresh
      const refreshQueries = [
        this.supabase.from('financial_transactions').select('count').limit(1),
        this.supabase.from('financial_transactions').select('id').limit(1),
        this.supabase.from('financial_transactions').select('date').limit(1),
        this.supabase.from('financial_transactions').select('*').limit(1)
      ]
      
      await Promise.allSettled(refreshQueries)
      
      // Attesa per permettere al cache di aggiornarsi
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('[FinancialTransactionsClient] ✅ Refresh cache completato')
      
    } catch (error) {
      console.error('[FinancialTransactionsClient] Errore durante refresh cache:', this.serializeError(error))
      throw error
    }
  }
}

export const financialTransactionsClient = new FinancialTransactionsClient()