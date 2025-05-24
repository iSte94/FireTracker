import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

// Cache per memorizzare i prezzi e ridurre le chiamate API
const priceCache = new Map<string, { price: any; timestamp: number }>();
const CACHE_DURATION = 60 * 1000; // 1 minuto di cache

// Funzione per pulire il ticker (rimuove suffissi di mercato se necessari)
function cleanTicker(ticker: string): string {
  // Rimuove spazi e converte in maiuscolo
  return ticker.trim().toUpperCase();
}

// Funzione per ottenere il prezzo da cache o API
async function getPrice(ticker: string) {
  const cleanedTicker = cleanTicker(ticker);
  const now = Date.now();
  
  // Controlla se il prezzo è in cache e ancora valido
  const cached = priceCache.get(cleanedTicker);
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.price;
  }
  
  try {
    // Ottieni quote da Yahoo Finance
    const quote = await yahooFinance.quote(cleanedTicker);
    
    // Prepara i dati del prezzo
    const priceData = {
      symbol: cleanedTicker,
      price: quote.regularMarketPrice || 0,
      previousClose: quote.regularMarketPreviousClose || 0,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      currency: quote.currency || 'USD',
      marketState: quote.marketState || 'CLOSED',
      marketTime: quote.regularMarketTime || new Date(),
      displayName: quote.displayName || quote.shortName || cleanedTicker,
      exchange: quote.exchange || '',
      quoteType: quote.quoteType || '',
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow || 0,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || 0,
      dayLow: (quote as any).dayLow || 0,
      dayHigh: (quote as any).dayHigh || 0,
      volume: quote.regularMarketVolume || 0,
    };
    
    // Salva in cache
    priceCache.set(cleanedTicker, { price: priceData, timestamp: now });
    
    return priceData;
  } catch (error) {
    console.error(`Errore nel recupero del prezzo per ${cleanedTicker}:`, error);
    
    // Se c'è un errore ma abbiamo dati in cache (anche se scaduti), usiamoli
    if (cached) {
      return cached.price;
    }
    
    // Altrimenti ritorna un oggetto errore
    return {
      symbol: cleanedTicker,
      error: true,
      message: error instanceof Error ? error.message : 'Errore sconosciuto',
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tickers } = body;
    
    if (!tickers || !Array.isArray(tickers)) {
      return NextResponse.json(
        { error: 'Tickers array è richiesto' },
        { status: 400 }
      );
    }
    
    if (tickers.length === 0) {
      return NextResponse.json({ prices: [] });
    }
    
    // Limita il numero di ticker per evitare troppe richieste
    const limitedTickers = tickers.slice(0, 50);
    
    // Ottieni i prezzi in parallelo
    const pricePromises = limitedTickers.map(ticker => getPrice(ticker));
    const prices = await Promise.all(pricePromises);
    
    // Filtra eventuali null/undefined
    const validPrices = prices.filter(price => price !== null && price !== undefined);
    
    return NextResponse.json({
      prices: validPrices,
      timestamp: new Date().toISOString(),
      cached: false, // Potremmo aggiungere logica per indicare se i dati sono dalla cache
    });
    
  } catch (error) {
    console.error('Errore nell\'API dei prezzi:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// Endpoint GET per ottenere il prezzo di un singolo ticker
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ticker = searchParams.get('ticker');
    
    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker è richiesto' },
        { status: 400 }
      );
    }
    
    const price = await getPrice(ticker);
    
    return NextResponse.json({
      price,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Errore nell\'API dei prezzi:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// Funzione per pulire la cache periodicamente (opzionale)
if (typeof window === 'undefined') {
  // Solo lato server
  setInterval(() => {
    const now = Date.now();
    for (const [ticker, data] of priceCache.entries()) {
      if (now - data.timestamp > CACHE_DURATION * 10) {
        // Rimuovi dalla cache se più vecchio di 10 minuti
        priceCache.delete(ticker);
      }
    }
  }, 5 * 60 * 1000); // Pulisci ogni 5 minuti
}