# Funzionalità Budget - FIRE Tracker

## Panoramica

La funzionalità Budget permette agli utenti di pianificare e monitorare le proprie spese per categoria, con supporto per budget mensili, trimestrali e annuali. Include analisi avanzate, alert automatici e previsioni basate sui dati storici.

## Struttura Database

### Tabella `budgets`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to auth.users)
- `category`: TEXT - Categoria del budget
- `amount`: NUMERIC(10,2) - Importo del budget
- `period`: TEXT - Periodo ('MONTHLY', 'QUARTERLY', 'YEARLY')
- `start_date`: DATE - Data di inizio
- `end_date`: DATE - Data di fine (opzionale)
- `is_recurring`: BOOLEAN - Se il budget si rinnova automaticamente
- `alert_threshold`: NUMERIC(5,2) - Percentuale per gli alert (default 80%)
- `shared_with`: UUID[] - Array di user ID per budget condivisi
- `goal_id`: UUID - Collegamento a obiettivi specifici
- `status`: TEXT - Stato ('ACTIVE', 'PAUSED', 'COMPLETED')
- `notes`: TEXT - Note opzionali

### Tabella `budget_alerts`
- `id`: UUID (Primary Key)
- `budget_id`: UUID (Foreign Key to budgets)
- `user_id`: UUID (Foreign Key to auth.users)
- `alert_type`: TEXT - Tipo di alert ('THRESHOLD_REACHED', 'BUDGET_EXCEEDED', 'PERIOD_ENDING')
- `percentage_used`: NUMERIC(5,2) - Percentuale utilizzata
- `message`: TEXT - Messaggio dell'alert
- `is_read`: BOOLEAN - Se l'alert è stato letto

## Componenti Principali

### Pagina Budget (`/app/budget/page.tsx`)
Pagina principale con:
- Dashboard con statistiche rapide
- Tab per panoramica, lista budget, analisi e avvisi
- Filtri avanzati per ricerca e ordinamento

### Componenti Budget (`/components/budget/`)

#### `budget-overview.tsx`
- Visualizzazione progress bar per categoria
- Grafico a torta distribuzione spese
- Confronto budget vs spese effettive

#### `budget-list.tsx`
- Lista completa dei budget
- Azioni: modifica, pausa/riattiva, elimina
- Visualizzazione spese in tempo reale

#### `add-budget-dialog.tsx`
- Form per creare nuovi budget
- Selezione categoria, periodo, importo
- Impostazioni ricorrenza e soglie alert

#### `edit-budget-dialog.tsx`
- Form per modificare budget esistenti
- Mantiene la storia delle modifiche

#### `budget-analytics.tsx`
- Grafici di tendenza temporale
- Confronto tra categorie
- Analisi distribuzione spese
- Previsioni future (placeholder)

#### `budget-alerts.tsx`
- Lista avvisi con filtri
- Gestione stato letto/non letto
- Azioni rapide sugli alert

#### `budget-filters.tsx`
- Filtri per categoria, periodo, stato
- Range di importo
- Ricerca testuale

## API Routes

### `/api/budget/check-alerts`
- POST: Controlla e crea alert automatici
- Verifica soglie raggiunte
- Notifica budget superati
- Avvisa scadenze imminenti

## Funzioni Database (`/lib/budget-client.ts`)

- `getBudgetOverview()`: Panoramica budget con spese
- `getCategorySpending()`: Spese per categoria
- `getBudgets()`: Lista completa budget
- `createBudget()`: Crea nuovo budget
- `updateBudget()`: Modifica budget
- `deleteBudget()`: Elimina budget
- `getBudgetAlerts()`: Recupera alert
- `markAlertAsRead()`: Segna alert come letto
- `getBudgetAnalytics()`: Dati per analisi

## Hook Personalizzati

### `use-budget-alerts.ts`
- Controlla periodicamente nuovi alert
- Attivo solo su pagine budget/dashboard
- Intervallo: 5 minuti

## Funzionalità Implementate

### 1. Visualizzazione Budget
✅ Dashboard con overview mensile/annuale
✅ Progress bar per categoria
✅ Confronto spese vs budget
✅ Indicatori visivi per budget a rischio

### 2. Gestione Budget
✅ Creazione budget per categoria
✅ Modifica budget esistenti
✅ Budget mensili, trimestrali, annuali
✅ Budget ricorrenti automatici

### 3. Analisi e Insights
✅ Grafici tendenza nel tempo
✅ Confronto tra categorie
✅ Alert basati su soglie
✅ Suggerimenti (tramite insights)

### 4. Funzionalità Avanzate
✅ Budget condivisi (struttura DB pronta)
✅ Link a obiettivi FIRE
✅ Sistema di alert automatici
⏳ Export CSV/PDF (da implementare)

### 5. UI/UX
✅ Design responsive
✅ Animazioni fluide
✅ Dark mode support
✅ Filtri e ricerca avanzati

## Integrazione con l'App

- Menu navigazione aggiornato con link `/budget`
- Provider alert nel layout principale
- Stile coerente con shadcn/ui
- Integrazione completa con Supabase

## Prossimi Passi

1. Implementare export dati (CSV/PDF)
2. Aggiungere notifiche push/email
3. Migliorare previsioni con ML
4. Implementare budget condivisi UI
5. Aggiungere budget templates predefiniti

## Note Tecniche

- Tutti i componenti sono client-side per reattività
- RLS (Row Level Security) attivo su tutte le tabelle
- Alert generati automaticamente via API
- Performance ottimizzata con lazy loading