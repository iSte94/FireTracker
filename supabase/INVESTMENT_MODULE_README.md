# Modulo Investimenti - Fire Tracker

Questo modulo aggiunge funzionalità complete di tracking degli investimenti al Fire Tracker esistente.

## Struttura del Database

### Tabelle Principali

#### 1. `investment_goals`
Memorizza gli obiettivi di investimento degli utenti.

**Campi principali:**
- `id`: UUID univoco
- `user_id`: Riferimento all'utente
- `title`: Titolo dell'obiettivo
- `description`: Descrizione dettagliata
- `goal_type`: Tipo di obiettivo
  - `monthly_investment`: Investimento mensile target
  - `portfolio_allocation`: Allocazione target del portafoglio
  - `annual_return`: Rendimento annuale target
  - `target_portfolio_value`: Valore totale del portafoglio target
  - `retirement_income`: Reddito da investimenti per la pensione
  - `emergency_fund`: Fondo di emergenza
  - `custom`: Obiettivo personalizzato
- `target_value`: Valore obiettivo
- `current_value`: Valore attuale (calcolato automaticamente)
- `target_date`: Data target per raggiungere l'obiettivo
- `status`: `active`, `completed`, `paused`

#### 2. `portfolio_allocations`
Definisce le allocazioni target per obiettivi di tipo `portfolio_allocation`.

**Campi principali:**
- `goal_id`: Riferimento all'obiettivo
- `asset_class`: Classe di asset
  - `stocks`, `bonds`, `crypto`, `etf`, `funds`, `cash`, `real_estate`, `commodities`, `other`
- `target_percentage`: Percentuale target (0-100)
- `current_percentage`: Percentuale attuale (calcolata automaticamente)

#### 3. `financial_transactions`
Registra tutte le transazioni finanziarie.

**Campi principali:**
- `transaction_type`: Tipo di transazione
  - `buy`, `sell`, `dividend`, `interest`, `deposit`, `withdrawal`, `fee`, `tax`
- `asset_type`: Tipo di asset
  - `stock`, `etf`, `fund`, `bond`, `crypto`, `cash`, `real_estate`, `commodity`, `other`
- `asset_name`: Nome dell'asset
- `ticker_symbol`: Simbolo ticker (opzionale)
- `quantity`: Quantità
- `price_per_unit`: Prezzo per unità
- `total_amount`: Importo totale
- `transaction_date`: Data della transazione
- `currency`: Valuta (default: EUR)
- `fees`: Commissioni
- `notes`: Note aggiuntive

#### 4. `portfolio_holdings`
Vista materializzata del portafoglio attuale calcolata dalle transazioni.

**Campi principali:**
- `total_quantity`: Quantità totale posseduta
- `average_cost`: Costo medio di acquisto
- `current_value`: Valore attuale (richiede aggiornamento prezzi)
- `unrealized_gain_loss`: Guadagno/perdita non realizzato
- `percentage_of_portfolio`: Percentuale del portafoglio totale

### Viste Disponibili

1. **`portfolio_by_asset_class`**: Riepilogo del portafoglio per classe di asset
2. **`investment_goals_progress`**: Progresso degli obiettivi di investimento
3. **`transaction_history_with_balance`**: Storico transazioni con saldo progressivo
4. **`monthly_investment_summary`**: Riepilogo mensile degli investimenti

## Installazione

1. Esegui il file di migrazione completo:
```sql
\i supabase/investment-migration.sql
```

Oppure esegui i file separatamente:
```sql
\i supabase/investment-schema.sql
\i supabase/investment-functions.sql
```

## Utilizzo

### Creare un Obiettivo di Investimento

```sql
-- Esempio: Obiettivo di allocazione del portafoglio
SELECT create_sample_investment_goal(
  auth.uid(),
  'Portafoglio Bilanciato 60/30/10',
  'portfolio_allocation',
  100000
);
```

### Registrare una Transazione

```sql
-- Esempio: Acquisto di azioni
SELECT record_financial_transaction(
  auth.uid(),
  'buy',           -- transaction_type
  'stock',         -- asset_type
  'Apple Inc.',    -- asset_name
  'AAPL',         -- ticker_symbol
  10,             -- quantity
  150.50,         -- price_per_unit
  '2024-01-15',   -- transaction_date
  5.00,           -- fees
  'USD',          -- currency
  'Primo acquisto AAPL'  -- notes
);
```

### Aggiornare i Prezzi del Portafoglio

```sql
-- Aggiorna il prezzo corrente di un asset
SELECT update_portfolio_prices(
  auth.uid(),
  'AAPL',    -- ticker_symbol
  165.75     -- current_price
);
```

### Query Utili

```sql
-- Riepilogo del portafoglio
SELECT * FROM get_portfolio_summary(auth.uid());

-- Controllo deviazioni allocazione
SELECT * FROM check_allocation_deviations('goal_id_here');

-- Vista portafoglio per classe di asset
SELECT * FROM portfolio_by_asset_class WHERE user_id = auth.uid();

-- Progresso obiettivi
SELECT * FROM investment_goals_progress WHERE user_id = auth.uid();
```

## Funzioni Automatiche

Il sistema include trigger che automaticamente:

1. **Dopo ogni transazione:**
   - Ricalcola le holdings del portafoglio
   - Aggiorna le percentuali di allocazione correnti
   - Aggiorna i valori correnti degli obiettivi

2. **Validazione:**
   - Le allocazioni target non possono superare il 100%
   - I valori devono essere positivi
   - Le transazioni devono avere tutti i campi richiesti

## Sicurezza

Tutte le tabelle hanno Row Level Security (RLS) abilitato:
- Gli utenti possono vedere e modificare solo i propri dati
- Le funzioni utilizzano `SECURITY DEFINER` per operazioni che richiedono privilegi elevati
- Le viste rispettano le policy RLS delle tabelle sottostanti

## Integrazione con l'App

Per integrare con l'applicazione Next.js esistente:

1. Aggiorna i tipi TypeScript in `types/supabase.ts`
2. Crea i client hooks per le nuove tabelle
3. Implementa le UI per:
   - Gestione obiettivi di investimento
   - Inserimento transazioni
   - Dashboard portafoglio
   - Report e analisi

## Note Importanti

- I prezzi correnti devono essere aggiornati da un servizio esterno
- Il calcolo del `current_value` dipende dall'aggiornamento dei prezzi
- Le percentuali del portafoglio sono calcolate automaticamente
- I trigger mantengono i dati sincronizzati automaticamente

## Manutenzione

Per ricaricare le holdings del portafoglio di un utente:
```sql
SELECT calculate_portfolio_holdings(auth.uid());
```

Per aggiornare tutti gli obiettivi di un utente:
```sql
SELECT update_investment_goal_values(id)
FROM investment_goals
WHERE user_id = auth.uid() AND status = 'active';