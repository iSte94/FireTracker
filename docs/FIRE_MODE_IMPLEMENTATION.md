# Documentazione Implementazione Modalità "Solo FIRE"

## Panoramica

La modalità "Solo FIRE" è una visualizzazione ottimizzata dell'applicazione FIRE Tracker che si concentra esclusivamente sulle funzionalità relative all'indipendenza finanziaria, rimuovendo tutti gli elementi di gestione del budget tradizionale.

## Architettura del Sistema

### 1. Sistema di Toggle Modalità

#### ViewModeProvider (`components/providers/view-mode-provider.tsx`)
Il cuore del sistema di modalità è il `ViewModeProvider` che gestisce:
- **Stati**: `fire_only` | `fire_budget`
- **Persistenza**: Salvata nel campo `view_mode` della tabella `profiles` in Supabase
- **Context API**: Fornisce accesso globale alla modalità corrente
- **Hooks di utilità**:
  - `useViewMode()`: Accesso completo al context
  - `useIsFireOnly()`: Verifica rapida se in modalità Solo FIRE
  - `useIsFireBudget()`: Verifica rapida se in modalità FIRE & Budget

### 2. Switching delle Modalità

#### Pagina Profilo (`app/profile/page.tsx`)
La sezione "Preferenze" permette agli utenti di switchare tra le modalità:
- **UI Switch**: Toggle intuitivo con descrizioni chiare
- **Aggiornamento immediato**: Lo stato locale si aggiorna istantaneamente
- **Persistenza asincrona**: Salvataggio su database in background
- **Gestione errori**: Rollback automatico in caso di errore

## Componenti e Pagine Specifiche

### 1. Navigazione Adattiva

#### Header (`components/header.tsx`)
Il menu di navigazione si adatta dinamicamente:

**Modalità FIRE & Budget**:
- Home
- Dashboard
- Calcolatori
- Budget
- Obiettivi
- Transazioni Finanziarie

**Modalità Solo FIRE**:
- Dashboard
- Progresso FIRE
- Portafoglio
- Calcolatori
- Transazioni Finanziarie

#### FIRE Quick Stats
Visibile solo in modalità Solo FIRE nell'header, mostra:
- Patrimonio netto
- Progresso verso FIRE %
- Anni rimanenti al FIRE

### 2. Dashboard Personalizzata

#### Dashboard (`app/dashboard/page.tsx`)
Layout completamente diversi per ogni modalità:

**Solo FIRE - Widget Esclusivi**:
- Time to FIRE Widget
- Savings Rate Widget
- Safe Withdrawal Rate Widget
- FIRE Types Progress Widget
- Portfolio Diversification Widget
- Historical Returns Widget
- Risk Return Widget
- Dividends Flow Widget
- FIRE Insights (suggerimenti personalizzati)

**Organizzazione Solo FIRE**:
1. Metriche principali in alto
2. Grafici patrimonio e FIRE number
3. Widget di analisi FIRE
4. Sezione analisi portafoglio completa

### 3. Pagine Esclusive Solo FIRE

#### Progresso FIRE (`app/fire-progress/page.tsx`)
Pagina dedicata al monitoraggio del percorso FIRE:
- **Progress Tracker**: Visualizzazione grafica del progresso
- **Timeline**: Proiezioni temporali interattive
- **Milestones**: Traguardi personalizzati
- **Simulazione What-If**: Analisi scenari alternativi
- **Alert System**: Notifiche intelligenti sul progresso

#### Portafoglio (`app/portfolio/page.tsx`)
Gestione investimenti con prezzi real-time:
- **Integrazione Yahoo Finance**: Prezzi aggiornati ogni minuto
- **Portfolio Summary**: Metriche chiave in tempo reale
- **Holdings Table**: Dettaglio posizioni con P&L
- **Allocation Charts**: Grafici di allocazione interattivi
- **Performance Analysis**: Analisi rendimenti storici

### 4. Calcolatori Avanzati

#### Calcolatori Solo FIRE (`app/calculators/page.tsx`)
In modalità Solo FIRE, calcolatori aggiuntivi:
- **Future Expense Impact**: Impatto spese future sul FIRE
- **SWR Variations**: Confronto diversi Safe Withdrawal Rate
- **FIRE Timeline Comparison**: Confronto scenari multipli

## Componenti FIRE Specifici

### 1. Componenti di Visualizzazione (`components/fire/`)

- **FireQuickStats**: Metriche rapide nell'header
- **FireProgressTracker**: Tracciamento visuale del progresso
- **FireTimeline**: Timeline interattiva verso FIRE
- **FireMilestones**: Sistema di milestone personalizzate
- **FireInsights**: Suggerimenti intelligenti basati sui dati

### 2. Widget Dashboard (`components/dashboard/`)

Widget specifici per Solo FIRE:
- **TimeToFireWidget**: Calcolo dinamico tempo rimanente
- **SavingsRateWidget**: Analisi tasso di risparmio
- **SafeWithdrawalRateWidget**: Analisi SWR personalizzato
- **FireTypesProgressWidget**: Progresso verso diversi tipi di FIRE
- **PortfolioDiversificationWidget**: Analisi diversificazione
- **HistoricalReturnsWidget**: Rendimenti storici
- **RiskReturnWidget**: Analisi rischio/rendimento
- **DividendsFlowWidget**: Flusso dividendi

## API e Integrazioni

### 1. Yahoo Finance Integration

#### API Route (`app/api/yahoo-finance/route.ts`)
- **Endpoint**: `/api/yahoo-finance`
- **Metodo**: GET con parametri `symbols`
- **Rate Limiting**: Max 5 richieste al secondo
- **Caching**: Cache in-memory di 60 secondi
- **Error Handling**: Gestione robusta degli errori

#### Hook (`hooks/use-portfolio-prices.ts`)
- **Auto-refresh**: Aggiornamento configurabile
- **Error Recovery**: Retry automatico su errore
- **State Management**: Gestione stati di caricamento/errore

### 2. Database Schema

#### Tabella `profiles`
```sql
view_mode: text CHECK (view_mode IN ('fire_only', 'fire_budget'))
```

## Hooks Personalizzati

### 1. `use-fire-alerts.ts`
Sistema di alert intelligenti per il progresso FIRE:
- Monitoraggio milestone raggiunte
- Alert su deviazioni dal percorso
- Suggerimenti personalizzati

### 2. `use-portfolio-sync.ts`
Sincronizzazione dati portfolio:
- Aggiornamento prezzi real-time
- Calcolo metriche aggregate
- Gestione cache locale

## Librerie di Calcolo

### `lib/fire-calculations.ts`
Funzioni core per calcoli FIRE:
- `calculateFireNumber()`: Calcolo FIRE number per tipo
- `calculateTimeToFire()`: Tempo rimanente con interesse composto
- `calculateCoastFireNumber()`: Calcolo Coast FIRE
- `formatCurrency()`: Formattazione valuta consistente

## Performance e Ottimizzazioni

### 1. Lazy Loading
- Grafici caricati on-demand con `LazyChartWrapper`
- Split del bundle per modalità

### 2. Caching
- Cache prezzi Yahoo Finance (60 secondi)
- Memoizzazione calcoli pesanti con `useMemo`

### 3. Real-time Updates
- WebSocket per aggiornamenti prezzi (futuro)
- Polling ottimizzato per dati critici

## Guida per Sviluppatori

### Aggiungere Nuove Funzionalità Solo FIRE

1. **Verificare la modalità**:
```tsx
const isFireOnly = useIsFireOnly()

if (isFireOnly) {
  // Logica specifica Solo FIRE
}
```

2. **Condizionare il rendering**:
```tsx
{isFireOnly && <ComponenteSoloFire />}
```

3. **Adattare i layout**:
```tsx
<div className={isFireOnly ? 'grid-cols-3' : 'grid-cols-2'}>
  {/* contenuto */}
</div>
```

### Best Practices

1. **Sempre usare gli hook di utilità** invece di accedere direttamente al context
2. **Testare entrambe le modalità** quando si modificano componenti condivisi
3. **Mantenere la separazione** tra logica FIRE e budget
4. **Documentare le dipendenze** dalla modalità nei commenti

## Testing

### Scenari di Test Critici

1. **Switch modalità**:
   - Da FIRE & Budget a Solo FIRE
   - Da Solo FIRE a FIRE & Budget
   - Persistenza dopo refresh

2. **Navigazione**:
   - Menu si adatta correttamente
   - Route esclusive non accessibili

3. **Dashboard**:
   - Widget corretti per modalità
   - Layout responsive

4. **Dati real-time**:
   - Prezzi Yahoo Finance si aggiornano
   - Gestione errori API

## Deployment

### Variabili d'Ambiente Richieste

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Configurazione Database

1. Eseguire migration per campo `view_mode`
2. Impostare default a `'fire_budget'`
3. Verificare RLS policies

## Manutenzione

### Monitoraggio

1. **Performance API Yahoo Finance**
2. **Errori di switching modalità**
3. **Tempi di caricamento dashboard**

### Aggiornamenti Futuri

1. **WebSocket per prezzi real-time**
2. **Export dati in modalità Solo FIRE**
3. **Notifiche push per milestone**
4. **Integrazione con altri provider di dati finanziari**