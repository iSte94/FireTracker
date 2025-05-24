# Funzionalità Obiettivi di Investimento

## Panoramica

La sezione Obiettivi di Investimento permette agli utenti di:
- Creare e gestire obiettivi finanziari personalizzati
- Monitorare il progresso verso gli obiettivi
- Visualizzare la composizione del portfolio
- Confrontare le allocazioni target con quelle attuali
- Ricevere alert per deviazioni significative

## Struttura del Database

### Tabelle Principali

1. **investment_goals** - Obiettivi di investimento
   - Supporta diversi tipi: allocazione portfolio, valore target, investimento mensile, etc.
   - Traccia progresso (current_value vs target_value)
   - Stati: active, completed, paused

2. **portfolio_allocations** - Allocazioni target per asset class
   - Collegate agli obiettivi di tipo "portfolio_allocation"
   - Confronto tra percentuali target e attuali

3. **financial_transactions** - Transazioni finanziarie
   - Acquisti, vendite, dividendi, etc.
   - Base per calcolare i portfolio holdings

4. **portfolio_holdings** - Posizioni attuali nel portfolio
   - Calcolate dalle transazioni
   - Include guadagni/perdite non realizzati

## Componenti UI

### Pagina Principale (/goals)
- **Stats Cards**: Panoramica obiettivi attivi, valore portfolio, diversificazione
- **Deviation Alerts**: Avvisi per deviazioni >5% dalle allocazioni target
- **Tabs**:
  - Obiettivi: Lista filtrata degli obiettivi con progress bars
  - Portfolio: Grafico a torta della composizione attuale
  - Allocazioni: Confronto target vs attuali con suggerimenti

### Componenti
1. **GoalCard** - Card per singolo obiettivo con:
   - Progress bar animata
   - Badge stato colorato
   - Menu azioni (modifica, pausa, elimina)
   - Preview allocazioni per obiettivi portfolio

2. **AddGoalDialog** - Form per creare obiettivi:
   - Selezione tipo obiettivo con descrizioni
   - Form dinamico basato sul tipo
   - Editor allocazioni per portfolio goals
   - Validazione somma allocazioni = 100%

3. **PortfolioComposition** - Visualizzazione portfolio:
   - Grafico a torta interattivo con tooltip
   - Lista dettagliata holdings
   - Statistiche aggregate

4. **AllocationTargets** - Confronto allocazioni:
   - Grafico a barre target vs attuali
   - Cards dettagliate per asset class
   - Suggerimenti di ribilanciamento
   - Alert per deviazioni significative

## Tipi di Obiettivi Supportati

1. **Portfolio Allocation** - Mantenere allocazioni target
2. **Target Portfolio Value** - Raggiungere un valore specifico
3. **Monthly Investment** - Investire importo mensile
4. **Annual Return** - Obiettivo rendimento annuale
5. **Retirement Income** - Rendita pensionistica target
6. **Emergency Fund** - Fondo emergenza in mesi
7. **Custom** - Obiettivo personalizzato

## Funzionalità Chiave

### Monitoraggio Progresso
- Calcolo automatico percentuale completamento
- Tracking progresso nel tempo (con proiezioni)
- Stati dinamici (attivo, completato, in pausa)

### Alert e Notifiche
- Alert per deviazioni allocazioni >5%
- Indicatori visivi stato progresso
- Suggerimenti azioni correttive

### Gestione Portfolio
- Import transazioni finanziarie
- Calcolo automatico holdings da transazioni
- Tracking guadagni/perdite non realizzati
- Percentuali portfolio auto-calcolate

## Stile e UX

### Design System
- Colori consistenti per asset class
- Animazioni smooth per transizioni
- Card con ombre e hover effects
- Icone Lucide per azioni e stati
- Badge colorati per stati e deviazioni

### Responsive Design
- Layout adattivo mobile/desktop
- Grafici responsive con Recharts
- Menu sheet per mobile
- Grid system flessibile

### Accessibilità
- Aria labels appropriati
- Keyboard navigation
- Screen reader friendly
- Contrasti colore WCAG compliant

## Setup e Configurazione

1. **Database**: Eseguire `supabase/investment-schema.sql`
2. **Test Data**: Usare `supabase/test-goals-data.sql` (sostituire USER_ID)
3. **Tipi TypeScript**: Già configurati in `types/investment.ts`
4. **Client API**: Disponibile in `lib/goals-client.ts`

## Prossimi Sviluppi

- [ ] Integrazione API prezzi real-time
- [ ] Export report PDF
- [ ] Notifiche email per deviazioni
- [ ] Storico performance portfolio
- [ ] Simulazioni Monte Carlo
- [ ] Import automatico da broker