# 📊 Modulo Investimenti - Fire Tracker

## 🎯 Panoramica

Il modulo investimenti estende il Fire Tracker con funzionalità complete per:
- 📈 Tracking del portfolio investimenti
- 🎯 Gestione obiettivi di investimento
- 💰 Registrazione transazioni finanziarie
- 📊 Analisi e report dettagliati

## 🚀 Installazione Rapida

### Metodo 1: Setup Automatico (Consigliato)
```bash
npm run setup:investment
```

### Metodo 2: Setup Manuale
1. Apri [Supabase Dashboard](https://app.supabase.com)
2. Vai su "SQL Editor"
3. Esegui il contenuto di `supabase/setup-all-investment.sql`

### Verifica Installazione
```bash
npm run test:investment
```

## 📁 Struttura File

```
fire-tracker/
├── setup-investment-simple.js      # Script setup senza dipendenze
├── scripts/
│   └── test-investment-simple.js   # Script test senza dipendenze
├── supabase/
│   ├── setup-all-investment.sql   # SQL unificato (consigliato)
│   ├── investment-schema.sql      # Schema tabelle
│   ├── investment-functions.sql   # Funzioni e trigger
│   └── investment-migration.sql   # Script migrazione
├── lib/
│   ├── goals-client.ts            # Client API per obiettivi
│   └── financial-transactions-client-fixed.ts  # Client transazioni
├── types/
│   └── investment.ts              # TypeScript types
└── components/
    ├── goals/                     # Componenti obiettivi
    ├── financial-transactions/    # Componenti transazioni
    └── dashboard/                 # Widget dashboard
```

## 🔧 Configurazione

### Variabili d'Ambiente Richieste
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key  # Solo per setup
```

## 📊 Funzionalità Principali

### 1. Obiettivi di Investimento
- **Portfolio Allocation**: Target di allocazione per asset class
- **Target Portfolio Value**: Valore totale del portfolio da raggiungere
- **Monthly Investment**: Obiettivo di investimento mensile
- **Annual Return**: Target di rendimento annuale
- **Custom Goals**: Obiettivi personalizzati

### 2. Transazioni Finanziarie
- **Buy/Sell**: Acquisto e vendita di asset
- **Dividends**: Registrazione dividendi
- **Interest**: Interessi maturati
- **Fees/Tax**: Commissioni e tasse

### 3. Portfolio Holdings
- Calcolo automatico delle posizioni
- Tracking performance (gain/loss)
- Allocazione percentuale
- Prezzo medio di carico

### 4. Report e Analisi
- Portfolio overview
- Asset allocation
- Performance tracking
- Goal progress

## 🛠️ Utilizzo

### Creare un Obiettivo
```typescript
import { goalsClient } from '@/lib/goals-client';

const goal = await goalsClient.createGoal({
  title: 'Portfolio Bilanciato',
  goal_type: 'portfolio_allocation',
  target_value: 100000,
  allocations: [
    { asset_class: 'stocks', target_percentage: 60 },
    { asset_class: 'bonds', target_percentage: 30 },
    { asset_class: 'cash', target_percentage: 10 }
  ]
});
```

### Registrare una Transazione
```typescript
import { transactionsClient } from '@/lib/goals-client';

const transaction = await transactionsClient.createTransaction({
  transaction_type: 'buy',
  asset_type: 'stock',
  asset_name: 'Apple Inc.',
  ticker_symbol: 'AAPL',
  quantity: 10,
  price_per_unit: 180,
  total_amount: 1800,
  transaction_date: '2024-01-15',
  currency: 'EUR',
  fees: 5
});
```

## 🔐 Sicurezza

- **Row Level Security (RLS)**: Ogni utente vede solo i propri dati
- **Autenticazione**: Integrata con Supabase Auth
- **Validazioni**: Check constraints a livello database

## 🐛 Risoluzione Problemi

### Errore: "npm install fallisce"
Il modulo non richiede dipendenze aggiuntive. Usa solo quelle del progetto principale.

### Errore: "Tabelle non trovate"
```bash
# Esegui il setup manuale
node setup-investment-simple.js

# O usa Supabase Dashboard con
# supabase/setup-all-investment.sql
```

### Errore: "Accesso negato"
- Verifica di essere autenticato
- Controlla che RLS sia configurato correttamente
- Assicurati che l'utente abbia un profilo

## 📈 Best Practices

1. **Backup Regolari**: Esporta i dati periodicamente
2. **Aggiornamento Prezzi**: Implementa un sistema per aggiornare i prezzi correnti
3. **Revisione Allocazioni**: Controlla mensilmente le deviazioni dai target
4. **Documentazione Transazioni**: Usa il campo note per dettagli importanti

## 🚧 Limitazioni Note

1. **Prezzi Real-time**: Non inclusi (richiede API esterna)
2. **Calcolo Tasse**: Implementazione base, personalizza per il tuo paese
3. **Multi-valuta**: Supporto base, conversioni non automatiche

## 🔄 Aggiornamenti Futuri

- [ ] Integrazione API prezzi real-time
- [ ] Report fiscali avanzati
- [ ] Import/Export dati da broker
- [ ] Grafici performance avanzati
- [ ] Notifiche obiettivi raggiunti

## 📝 Note Tecniche

### Trigger Automatici
- `update_portfolio_after_transaction`: Aggiorna holdings dopo ogni transazione
- `validate_portfolio_allocations`: Verifica che allocazioni non superino 100%
- `update_updated_at`: Aggiorna timestamp modifiche

### Funzioni Principali
- `calculate_portfolio_holdings()`: Ricalcola posizioni da transazioni
- `update_portfolio_allocations()`: Aggiorna percentuali correnti
- `get_portfolio_summary()`: Ottieni riepilogo portfolio

## 🆘 Supporto

Per problemi o domande:
1. Controlla i log in Supabase Dashboard
2. Verifica la console del browser
3. Esegui `npm run test:investment` per diagnostica

---

**Versione**: 1.0.0  
**Compatibilità**: Fire Tracker v1.x  
**Licenza**: MIT