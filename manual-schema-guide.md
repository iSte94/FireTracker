# Guida Manuale per Applicare lo Schema Financial Transactions

Questa guida fornisce istruzioni passo-passo per applicare manualmente lo schema delle transazioni finanziarie quando gli script automatici non funzionano.

## 🎯 Obiettivo

Creare e configurare la tabella `financial_transactions` nel database Supabase con tutte le funzionalità necessarie.

## 📋 Prerequisiti

- Accesso al Supabase Dashboard
- Progetto Supabase configurato
- Credenziali di amministratore del database

## 🔧 Procedura Manuale

### Passo 1: Accedi al Supabase Dashboard

1. Vai su [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Accedi al tuo account
3. Seleziona il progetto fire-tracker
4. Vai su **SQL Editor** nel menu laterale

### Passo 2: Verifica lo Stato Attuale

Prima di applicare lo schema, verifica cosa esiste già:

```sql
-- Verifica se la tabella esiste
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'financial_transactions'
);
```

**Risultato:**
- `true` = Tabella esiste già
- `false` = Tabella non esiste

### Passo 3: Applica lo Schema

#### Opzione A: Schema Completo (se tabella NON esiste)

1. Apri il file `supabase/financial-transactions-schema.sql`
2. Copia tutto il contenuto
3. Incolla nel SQL Editor di Supabase
4. Clicca **Run** per eseguire

#### Opzione B: Schema Sicuro (se tabella esiste parzialmente)

1. Apri il file `supabase/financial-transactions-schema-safe.sql`
2. Copia tutto il contenuto
3. Incolla nel SQL Editor di Supabase
4. Clicca **Run** per eseguire

### Passo 4: Verifica l'Applicazione

Esegui queste query per verificare che tutto sia stato creato correttamente:

#### 4.1 Verifica Tabella e Colonne

```sql
-- Verifica struttura tabella
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'financial_transactions'
ORDER BY ordinal_position;
```

**Colonne attese:**
- `id` (uuid, NOT NULL)
- `user_id` (uuid, NOT NULL)
- `date` (date, NOT NULL)
- `type` (text, NOT NULL)
- `ticker` (text, NOT NULL)
- `quantity` (numeric, NOT NULL)
- `price` (numeric, NOT NULL)
- `asset_type` (text)
- `notes` (text)
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone)

#### 4.2 Verifica RLS (Row Level Security)

```sql
-- Verifica che RLS sia abilitato
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'financial_transactions';
```

**Risultato atteso:** `rowsecurity = true`

#### 4.3 Verifica Policy

```sql
-- Verifica policy RLS
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'financial_transactions';
```

**Policy attese:**
- Users can view own financial transactions
- Users can insert own financial transactions
- Users can update own financial transactions
- Users can delete own financial transactions

#### 4.4 Verifica Indici

```sql
-- Verifica indici
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'financial_transactions';
```

**Indici attesi:**
- `idx_financial_transactions_user_id`
- `idx_financial_transactions_date`
- `idx_financial_transactions_ticker`
- `idx_financial_transactions_type`
- `idx_financial_transactions_asset_type`

#### 4.5 Verifica Funzioni

```sql
-- Verifica funzioni create
SELECT proname, prosrc
FROM pg_proc
WHERE proname IN ('update_updated_at_column', 'get_user_holdings', 'get_portfolio_metrics');
```

### Passo 5: Test Funzionalità

#### 5.1 Test Inserimento (con autenticazione)

```sql
-- ATTENZIONE: Questo test funziona solo se sei autenticato
-- Sostituisci 'your-user-id' con il tuo ID utente reale
INSERT INTO financial_transactions (
  user_id,
  date,
  type,
  ticker,
  quantity,
  price,
  asset_type
) VALUES (
  'your-user-id',
  '2024-01-01',
  'buy',
  'TEST',
  10,
  100.00,
  'stock'
);
```

#### 5.2 Test Lettura

```sql
-- Verifica che i dati siano leggibili
SELECT * FROM financial_transactions LIMIT 5;
```

#### 5.3 Pulizia Test

```sql
-- Rimuovi i dati di test
DELETE FROM financial_transactions WHERE ticker = 'TEST';
```

## 🚨 Risoluzione Problemi

### Errore: "relation does not exist"

**Causa:** La tabella non è stata creata
**Soluzione:** Ripeti il Passo 3 con lo schema completo

### Errore: "permission denied"

**Causa:** RLS attivo ma non autenticato
**Soluzione:** Normale, indica che RLS funziona correttamente

### Errore: "column does not exist"

**Causa:** Schema applicato parzialmente
**Soluzione:** Usa lo schema sicuro (Opzione B del Passo 3)

### Errore: "function does not exist"

**Causa:** Funzioni non create
**Soluzione:** Esegui manualmente la sezione funzioni dello schema

## 📊 Comandi di Verifica Rapida

Dopo aver applicato lo schema, usa questi comandi per una verifica rapida:

### Nel terminale (se gli script funzionano):

```bash
# Verifica semplificata
node simple-schema-check.js

# Verifica completa (se dotenv funziona)
source .env.local && node check-existing-schema.js
```

### Nel Supabase SQL Editor:

```sql
-- Verifica rapida completa
SELECT 
  'Tabella' as elemento,
  CASE WHEN EXISTS (SELECT FROM pg_tables WHERE tablename = 'financial_transactions') 
    THEN '✅ Esiste' ELSE '❌ Mancante' END as stato
UNION ALL
SELECT 
  'RLS',
  CASE WHEN (SELECT rowsecurity FROM pg_tables WHERE tablename = 'financial_transactions') 
    THEN '✅ Attivo' ELSE '❌ Disattivo' END
UNION ALL
SELECT 
  'Policy',
  CASE WHEN EXISTS (SELECT FROM pg_policies WHERE tablename = 'financial_transactions') 
    THEN '✅ Configurate' ELSE '❌ Mancanti' END
UNION ALL
SELECT 
  'Indici',
  CASE WHEN EXISTS (SELECT FROM pg_indexes WHERE tablename = 'financial_transactions' AND indexname LIKE 'idx_%') 
    THEN '✅ Creati' ELSE '❌ Mancanti' END;
```

## ✅ Completamento

Una volta completati tutti i passi con successo:

1. ✅ Tabella `financial_transactions` creata
2. ✅ RLS abilitato e policy configurate
3. ✅ Indici per performance creati
4. ✅ Funzioni helper disponibili
5. ✅ Trigger per `updated_at` attivo

Il sistema è pronto per gestire le transazioni finanziarie in modo sicuro e performante.

## 🔄 Prossimi Passi

1. Testa l'integrazione con l'applicazione
2. Verifica che i componenti React possano leggere/scrivere dati
3. Monitora le performance delle query
4. Configura backup automatici se necessario

---

**💡 Suggerimento:** Salva questa guida per riferimenti futuri e condividila con il team per procedure standardizzate.