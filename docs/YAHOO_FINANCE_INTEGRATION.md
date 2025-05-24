# Integrazione Yahoo Finance per Prezzi Real-Time

## Panoramica

L'integrazione con Yahoo Finance fornisce prezzi real-time per tutti gli asset nel portafoglio, aggiornando automaticamente valori, performance e allocazioni.

## Componenti Principali

### 1. API Route (`app/api/portfolio/prices/route.ts`)
- Endpoint POST per ottenere prezzi multipli
- Endpoint GET per singolo ticker
- Sistema di caching (1 minuto) per ridurre le chiamate API
- Gestione errori e ticker non trovati
- Pulizia automatica della cache ogni 5 minuti

### 2. Hook React (`hooks/use-portfolio-prices.ts`)
- `usePortfolioPrices`: Hook principale per gestire prezzi multipli
- `useTickerPrice`: Hook helper per singolo ticker
- Aggiornamento automatico configurabile
- Retry logic con exponential backoff
- Notifiche toast per errori

### 3. Componenti Aggiornati

#### `components/portfolio/holdings-table.tsx`
- Mostra prezzi real-time con indicatore live
- Variazioni giornaliere con colori (verde/rosso)
- Pulsante di aggiornamento manuale
- Indicatore ultimo aggiornamento

#### `components/portfolio/portfolio-summary.tsx`
- Card con indicatori live per valori real-time
- Barra di stato con timestamp aggiornamento
- Pulsante refresh globale

#### `components/portfolio/portfolio-performance.tsx`
- Performance aggiornata con prezzi real-time
- Indicatori live su top/worst performers
- Statistiche real-time

#### `components/portfolio/price-error-handler.tsx`
- Gestione errori categorizzati (ticker non trovati, rate limit, altri)
- Suggerimenti per correggere ticker
- Azioni di retry

### 4. Pagina Portfolio (`app/portfolio/page.tsx`)
- Integrazione completa con hook prezzi
- Ricalcolo metriche con prezzi real-time
- Gestione errori centralizzata

## Utilizzo

### Configurazione Base
```typescript
const { prices, loading, error, lastUpdate, refresh, isRefreshing } = usePortfolioPrices({
  tickers: ['AAPL', 'GOOGL', 'MSFT'],
  refreshInterval: 60000, // 1 minuto
  enabled: true
})
```

### Formattazione Prezzi
```typescript
import { formatPrice, formatChangePercent, getChangeColor } from '@/hooks/use-portfolio-prices'

// Formatta prezzo
formatPrice(150.50, 'USD') // $150.50

// Formatta variazione percentuale
formatChangePercent(2.5) // +2.50%

// Ottieni classe colore per variazione
getChangeColor(-1.5) // 'text-red-600 dark:text-red-400'
```

## Gestione Ticker

### Ticker Supportati
- **Azioni USA**: Usa il ticker diretto (es: AAPL, GOOGL)
- **Azioni Italiane**: Aggiungi .MI (es: ISP.MI, ENI.MI)
- **Azioni Europee**: Usa suffissi appropriati
  - Londra: .L
  - Parigi: .PA
  - Francoforte: .DE
- **ETF**: Verifica il ticker esatto su Yahoo Finance
- **Crypto**: Usa formato SYMBOL-USD (es: BTC-USD, ETH-USD)

### Errori Comuni

1. **Ticker non trovato**
   - Verifica il suffisso del mercato
   - Controlla su finance.yahoo.com

2. **Rate limiting**
   - Cache automatica riduce le richieste
   - Retry automatico con backoff

3. **Errori di rete**
   - Retry automatico fino a 3 tentativi
   - Notifiche toast per l'utente

## Performance e Ottimizzazioni

### Caching
- Cache lato server: 1 minuto per ticker
- Pulizia automatica vecchie entry
- Riutilizzo cache anche se scaduta in caso di errore

### Limiti
- Massimo 50 ticker per richiesta
- Aggiornamento minimo ogni 60 secondi
- Retry con exponential backoff

### Best Practices
1. Raggruppa le richieste per ticker multipli
2. Usa refresh interval appropriato (60s consigliato)
3. Gestisci sempre gli errori di ticker non trovati
4. Mostra indicatori di caricamento/aggiornamento

## Esempi di Implementazione

### Componente con Prezzi Real-Time
```tsx
function MyPortfolio() {
  const tickers = ['AAPL', 'GOOGL', 'ISP.MI']
  const { prices, loading, lastUpdate, refresh } = usePortfolioPrices({
    tickers,
    refreshInterval: 60000
  })

  return (
    <div>
      {loading ? (
        <Skeleton />
      ) : (
        <>
          {tickers.map(ticker => {
            const price = prices.get(ticker)
            if (!price) return null
            
            return (
              <div key={ticker}>
                <span>{ticker}: {formatPrice(price.price, price.currency)}</span>
                <span className={getChangeColor(price.changePercent)}>
                  {formatChangePercent(price.changePercent)}
                </span>
              </div>
            )
          })}
          <button onClick={refresh}>Aggiorna</button>
          <span>Ultimo aggiornamento: {formatLastUpdate(lastUpdate)}</span>
        </>
      )}
    </div>
  )
}
```

## Troubleshooting

### Prezzi non si aggiornano
1. Verifica che i ticker siano corretti
2. Controlla la console per errori
3. Verifica la connessione internet
4. Prova refresh manuale

### Ticker mostra errore
1. Verifica suffisso mercato
2. Controlla su Yahoo Finance
3. Usa i suggerimenti mostrati

### Performance lenta
1. Riduci numero di ticker
2. Aumenta refresh interval
3. Verifica connessione