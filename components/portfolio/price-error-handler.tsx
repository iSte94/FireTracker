'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, XCircle } from 'lucide-react'
import { PriceData } from '@/hooks/use-portfolio-prices'

interface PriceErrorHandlerProps {
  prices: Map<string, PriceData>
  onRetry?: () => void
  onDismiss?: (ticker: string) => void
}

export function PriceErrorHandler({ prices, onRetry, onDismiss }: PriceErrorHandlerProps) {
  // Trova tutti i ticker con errori
  const errorTickers = Array.from(prices.entries())
    .filter(([_, priceData]) => priceData.error)
    .map(([ticker, priceData]) => ({ ticker, message: priceData.message }))

  if (errorTickers.length === 0) {
    return null
  }

  // Raggruppa gli errori per tipo
  const notFoundTickers = errorTickers.filter(e => 
    e.message?.toLowerCase().includes('not found') || 
    e.message?.toLowerCase().includes('unknown symbol')
  )
  
  const rateLimitErrors = errorTickers.filter(e => 
    e.message?.toLowerCase().includes('rate limit') ||
    e.message?.toLowerCase().includes('too many requests')
  )
  
  const otherErrors = errorTickers.filter(e => 
    !notFoundTickers.includes(e) && !rateLimitErrors.includes(e)
  )

  return (
    <div className="space-y-3">
      {/* Ticker non trovati */}
      {notFoundTickers.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Ticker non trovati</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              <p>I seguenti ticker non sono stati trovati su Yahoo Finance:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {notFoundTickers.map(({ ticker }) => (
                  <div key={ticker} className="flex items-center gap-1">
                    <code className="text-sm bg-destructive/10 px-2 py-1 rounded">
                      {ticker}
                    </code>
                    {onDismiss && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => onDismiss(ticker)}
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm mt-2">
                Verifica che i ticker siano corretti. Per azioni italiane, potrebbe essere necessario 
                aggiungere il suffisso del mercato (es: .MI per Milano).
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Errori di rate limiting */}
      {rateLimitErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Limite di richieste raggiunto</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              <p>
                Troppe richieste a Yahoo Finance. I prezzi verranno aggiornati automaticamente 
                tra qualche minuto.
              </p>
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="mt-2"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Riprova ora
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Altri errori */}
      {otherErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Errore nel recupero dei prezzi</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              <p>Si sono verificati errori per i seguenti ticker:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {otherErrors.map(({ ticker, message }) => (
                  <li key={ticker} className="text-sm">
                    <code className="font-mono">{ticker}</code>: {message}
                  </li>
                ))}
              </ul>
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="mt-2"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Riprova
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// Componente per suggerimenti sui ticker
export function TickerSuggestions({ ticker }: { ticker: string }) {
  const suggestions = generateTickerSuggestions(ticker)
  
  if (suggestions.length === 0) return null
  
  return (
    <div className="mt-2 p-3 bg-muted rounded-lg">
      <p className="text-sm font-medium mb-2">Suggerimenti:</p>
      <div className="space-y-1">
        {suggestions.map((suggestion, index) => (
          <p key={index} className="text-sm text-muted-foreground">
            • {suggestion}
          </p>
        ))}
      </div>
    </div>
  )
}

function generateTickerSuggestions(ticker: string): string[] {
  const suggestions: string[] = []
  const upperTicker = ticker.toUpperCase()
  
  // Suggerimenti per mercati italiani
  if (!upperTicker.includes('.')) {
    suggestions.push(`Prova ${upperTicker}.MI per azioni del mercato italiano (Milano)`)
  }
  
  // Suggerimenti per ETF
  if (upperTicker.startsWith('I') || upperTicker.includes('ETF')) {
    suggestions.push(`Per ETF europei, verifica il ticker corretto su Yahoo Finance`)
  }
  
  // Suggerimenti per crypto
  if (['BTC', 'ETH', 'BNB', 'ADA', 'DOT'].some(crypto => upperTicker.includes(crypto))) {
    suggestions.push(`Per criptovalute, usa il formato SYMBOL-USD (es: BTC-USD)`)
  }
  
  // Suggerimenti generali
  if (suggestions.length === 0) {
    suggestions.push(`Verifica il ticker esatto su finance.yahoo.com`)
    suggestions.push(`Alcuni ticker potrebbero richiedere suffissi di mercato (.MI, .L, .PA, etc.)`)
  }
  
  return suggestions
}