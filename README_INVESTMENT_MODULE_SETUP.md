# 📊 Guida Setup Modulo Investimenti - Fire Tracker

## 🚀 Installazione Rapida (Senza Dipendenze Aggiuntive)

### Opzione 1: Setup Automatico Semplificato

Usa lo script Node.js nativo che non richiede dipendenze aggiuntive:

```bash
npm run setup:investment
```

Oppure esegui direttamente:

```bash
node setup-investment-simple.js
```

### Opzione 2: Setup Manuale (Consigliato per Problemi)

1. **Apri Supabase Dashboard**
   - Vai su [Supabase Dashboard](https://app.supabase.com)
   - Seleziona il tuo progetto
   - Vai su "SQL Editor"

2. **Esegui il File SQL Unificato**
   - Apri il file `supabase/setup-all-investment.sql`
   - Copia tutto il contenuto
   - Incolla nell'SQL Editor di Supabase
   - Clicca su "Run"

## 📁 File Principali

### Script di Setup
- `setup-investment-simple.js` - Script semplificato senza dipendenze esterne
- `supabase/setup-all-investment.sql` - File SQL unificato con tutto il necessario

### File SQL Originali (per riferimento)
- `supabase/investment-schema.sql` - Schema e tabelle
- `supabase/investment-functions.sql` - Funzioni e trigger
- `supabase/investment-migration.sql` - Script di migrazione completo

## 🔧 Risoluzione Problemi

### Errore: "exec_sql non disponibile"
Lo script proverà automaticamente metodi alternativi. Se persiste, usa il setup manuale.

### Errore: "Tabelle non create"
1. Verifica le credenziali in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. Usa il setup manuale tramite Supabase SQL Editor

### Errore: "npm install fallisce"
Il modulo investimenti non richiede dipendenze aggiuntive oltre a quelle già presenti nel progetto principale.

## ✅ Verifica Installazione

Dopo il setup, verifica che le tabelle siano state create:

1. **Via Supabase Dashboard**
   - Vai su "Table Editor"
   - Verifica la presenza di:
     - `investment_goals`
     - `portfolio_allocations`
     - `financial_transactions`
     - `portfolio_holdings`

2. **Via Applicazione**
   - Avvia l'app: `npm run dev`
   - Vai alla sezione "Goals"
   - Prova a creare un nuovo obiettivo

## 📝 Utilizzo del Modulo

### 1. Crea Obiettivi di Investimento
- Vai alla sezione "Goals"
- Clicca su "Add Goal"
- Scegli il tipo di obiettivo (es. Portfolio Allocation)
- Imposta i target

### 2. Registra Transazioni
- Vai a "Financial Transactions"
- Clicca su "Add Transaction"
- Inserisci i dettagli dell'acquisto/vendita

### 3. Monitora il Portfolio
- Dashboard: panoramica generale
- Goals: progresso obiettivi
- Financial Transactions: dettaglio transazioni e holdings

## 🛠️ Funzionalità Principali

- **Tracking Portfolio**: Monitora automaticamente le tue posizioni
- **Obiettivi Personalizzati**: Imposta target di allocazione, valore, rendimento
- **Calcolo Automatico**: Aggiornamento real-time di valori e percentuali
- **Report Dettagliati**: Visualizza performance e allocazioni

## 📊 Tabelle Database

### investment_goals
Memorizza gli obiettivi di investimento dell'utente

### portfolio_allocations
Target di allocazione per asset class

### financial_transactions
Registro di tutte le transazioni (buy, sell, dividend, etc.)

### portfolio_holdings
Posizioni correnti calcolate automaticamente

## 🔐 Sicurezza

- Row Level Security (RLS) attivo su tutte le tabelle
- Ogni utente può vedere solo i propri dati
- Funzioni SECURITY DEFINER per operazioni sicure

## 💡 Suggerimenti

1. **Backup Regolari**: Esporta periodicamente i tuoi dati
2. **Aggiornamento Prezzi**: Usa l'API per aggiornare i prezzi correnti
3. **Revisione Allocazioni**: Controlla regolarmente le deviazioni dai target

## 🆘 Supporto

Per problemi o domande:
1. Controlla i log di Supabase
2. Verifica la console del browser per errori
3. Assicurati che tutte le variabili d'ambiente siano configurate

---

**Nota**: Questo modulo è progettato per integrarsi perfettamente con il Fire Tracker esistente senza richiedere dipendenze aggiuntive.