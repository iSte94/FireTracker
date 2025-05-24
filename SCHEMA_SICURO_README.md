# Schema Sicuro Financial Transactions

## Problema Risolto

L'errore `ERROR: 42P07: relation "idx_financial_transactions_user_id" already exists` indica che parte dello schema `financial_transactions` è già stato applicato al database. Questo documento descrive la soluzione implementata per gestire questa situazione.

## File Creati

### 1. `supabase/financial-transactions-schema-safe.sql`
Versione sicura dello schema originale che:
- Usa `CREATE TABLE IF NOT EXISTS` per la tabella
- Controlla l'esistenza di indici prima di crearli con blocchi `DO $$`
- Verifica l'esistenza di policy RLS prima di crearle
- Controlla l'esistenza di trigger prima di crearli
- Gestisce funzioni con `CREATE OR REPLACE`

### 2. `check-existing-schema.js`
Script di verifica che:
- Controlla quali elementi dello schema esistono già
- Fornisce un report dettagliato dello stato attuale
- Suggerisce l'azione appropriata da intraprendere

### 3. `apply-financial-transactions-schema.js` (aggiornato)
Script di applicazione che ora supporta:
- Modalità normale per schema completamente nuovo
- Modalità sicura per schema parzialmente applicato
- Parametro `safe` per attivare la versione sicura

## Utilizzo

### 1. Verifica Stato Schema
Prima di applicare qualsiasi schema, verifica cosa esiste già:

```bash
node check-existing-schema.js
```

Questo script ti dirà:
- Quali elementi esistono già
- Cosa manca
- Quale versione dello schema usare

### 2. Applicazione Schema

#### Per Schema Parzialmente Applicato (raccomandato)
Se ricevi l'errore `relation already exists` o il check mostra elementi esistenti:

```bash
node apply-financial-transactions-schema.js safe
```

#### Per Schema Completamente Nuovo
Solo se il database è completamente vuoto:

```bash
node apply-financial-transactions-schema.js
```

### 3. Verifica Post-Applicazione
Dopo l'applicazione, verifica che tutto sia stato creato correttamente:

```bash
node check-existing-schema.js
```

## Elementi Gestiti con IF NOT EXISTS

### Tabella
- `financial_transactions` - Tabella principale

### Indici
- `idx_financial_transactions_user_id`
- `idx_financial_transactions_date`
- `idx_financial_transactions_ticker`
- `idx_financial_transactions_type`
- `idx_financial_transactions_asset_type`

### Policy RLS
- `Users can view own financial transactions`
- `Users can insert own financial transactions`
- `Users can update own financial transactions`
- `Users can delete own financial transactions`

### Trigger
- `update_financial_transactions_updated_at`

### Funzioni
- `update_updated_at_column()`
- `get_user_holdings()`
- `get_portfolio_metrics()`

## Struttura dei Controlli Sicuri

### Per Indici
```sql
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'nome_indice') THEN
        CREATE INDEX nome_indice ON tabella(colonna);
    END IF;
END $$;
```

### Per Policy RLS
```sql
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'nome_policy' 
        AND tablename = 'nome_tabella'
    ) THEN
        CREATE POLICY "nome_policy" ON nome_tabella FOR SELECT USING (condizione);
    END IF;
END $$;
```

### Per Trigger
```sql
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'nome_trigger'
    ) THEN
        CREATE TRIGGER nome_trigger BEFORE UPDATE ON tabella 
        FOR EACH ROW EXECUTE FUNCTION funzione();
    END IF;
END $$;
```

## Risoluzione Errori Comuni

### Errore: relation "idx_*" already exists
**Soluzione:** Usa la versione sicura
```bash
node apply-financial-transactions-schema.js safe
```

### Errore: policy "*" already exists
**Soluzione:** La versione sicura gestisce automaticamente questo caso

### Errore: trigger "*" already exists
**Soluzione:** La versione sicura controlla l'esistenza prima di creare

## Vantaggi della Versione Sicura

1. **Idempotente**: Può essere eseguita più volte senza errori
2. **Incrementale**: Aggiunge solo gli elementi mancanti
3. **Sicura**: Non sovrascrive elementi esistenti
4. **Diagnostica**: Fornisce feedback dettagliato su cosa viene creato

## Workflow Raccomandato

1. **Verifica**: `node check-existing-schema.js`
2. **Applica**: `node apply-financial-transactions-schema.js safe`
3. **Conferma**: `node check-existing-schema.js`
4. **Testa**: `node test-financial-transaction.js`

Questo approccio garantisce un'applicazione sicura dello schema senza rischi di corruzione o errori di duplicazione.