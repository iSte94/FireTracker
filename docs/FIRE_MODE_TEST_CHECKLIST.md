# Checklist Test Manuale - Modalità Solo FIRE

## 1. Test Toggle Modalità

### 1.1 Switch da FIRE & Budget a Solo FIRE
- [ ] Accedi all'applicazione con un utente esistente
- [ ] Vai alla pagina **Profilo** (`/profile`)
- [ ] Clicca sulla tab **Preferenze**
- [ ] Verifica che lo switch mostri "FIRE & Budget" attivo
- [ ] Clicca sullo switch per passare a "Solo FIRE"
- [ ] Verifica che appaia il messaggio "Preferenze salvate"
- [ ] **Risultato atteso**: Switch cambia stato immediatamente

### 1.2 Persistenza dopo Refresh
- [ ] Dopo aver cambiato modalità, ricarica la pagina (F5)
- [ ] Verifica che la modalità "Solo FIRE" sia ancora attiva
- [ ] **Risultato atteso**: Modalità persiste dopo refresh

### 1.3 Switch da Solo FIRE a FIRE & Budget
- [ ] Dalla modalità Solo FIRE, torna a Profilo > Preferenze
- [ ] Clicca sullo switch per tornare a "FIRE & Budget"
- [ ] Verifica il cambio immediato
- [ ] **Risultato atteso**: Ritorno alla modalità completa

## 2. Test Navigazione

### 2.1 Menu Desktop (Modalità Solo FIRE)
- [ ] Verifica che il menu mostri solo:
  - Dashboard
  - Progresso FIRE
  - Portafoglio
  - Calcolatori
  - Transazioni Finanziarie
- [ ] Verifica che NON ci sia "Budget" o "Obiettivi"
- [ ] **Risultato atteso**: Menu ridotto con solo voci FIRE

### 2.2 Menu Mobile
- [ ] Riduci la finestra del browser per attivare menu mobile
- [ ] Clicca sull'hamburger menu
- [ ] Verifica che le voci del menu siano le stesse del desktop
- [ ] **Risultato atteso**: Consistenza tra menu desktop e mobile

### 2.3 FIRE Quick Stats nell'Header
- [ ] In modalità Solo FIRE, verifica presenza di quick stats nell'header
- [ ] Controlla che mostri:
  - Patrimonio netto
  - % progresso FIRE
  - Anni al FIRE
- [ ] In modalità FIRE & Budget, verifica che NON ci siano quick stats
- [ ] **Risultato atteso**: Quick stats solo in modalità Solo FIRE

## 3. Test Dashboard

### 3.1 Layout Solo FIRE
- [ ] Vai alla Dashboard in modalità Solo FIRE
- [ ] Verifica presenza delle 4 card superiori:
  - Patrimonio Netto
  - Tasso di Risparmio
  - Anni al FIRE
  - Rendimento YTD
- [ ] **Risultato atteso**: Card "Spese Mensili" NON presente

### 3.2 Widget Esclusivi Solo FIRE
- [ ] Nella tab "Panoramica", verifica presenza di:
  - [ ] Time to FIRE Widget
  - [ ] Savings Rate Widget
  - [ ] Safe Withdrawal Rate Widget
  - [ ] FIRE Types Progress Widget
  - [ ] FIRE Insights (suggerimenti)
  - [ ] Sezione "Analisi Portafoglio" con 4 widget
- [ ] **Risultato atteso**: Tutti i widget FIRE avanzati presenti

### 3.3 Tab Analisi
- [ ] Clicca sulla tab "Analisi"
- [ ] Verifica layout specifico Solo FIRE con:
  - Savings Rate Widget
  - Time to FIRE Widget
  - Progresso FIRE
  - Safe Withdrawal Rate Widget
  - FIRE Types Progress Widget
- [ ] **Risultato atteso**: Layout ottimizzato per analisi FIRE

### 3.4 Confronto con FIRE & Budget
- [ ] Switcha a modalità FIRE & Budget
- [ ] Verifica che la Dashboard mostri:
  - Card "Spese Mensili" invece di "Rendimento YTD"
  - Grafico "Spese per Categoria"
  - Tab "Transazioni" visibile
- [ ] **Risultato atteso**: Layout tradizionale con focus budget

## 4. Test Pagina Progresso FIRE

### 4.1 Accesso alla Pagina
- [ ] In modalità Solo FIRE, clicca su "Progresso FIRE" nel menu
- [ ] Verifica caricamento corretto della pagina
- [ ] In modalità FIRE & Budget, verifica che la voce NON sia nel menu
- [ ] **Risultato atteso**: Pagina accessibile solo in Solo FIRE

### 4.2 Metriche Principali
- [ ] Verifica presenza delle 4 card metriche:
  - Patrimonio Attuale (con % del FIRE)
  - Tasso di Risparmio
  - Tempo al FIRE
  - FIRE Number
- [ ] **Risultato atteso**: Tutte le metriche calcolate correttamente

### 4.3 Tab Progresso
- [ ] Clicca sulla tab "Progresso"
- [ ] Verifica visualizzazione grafica del progresso
- [ ] Controlla barre di progresso per diversi tipi di FIRE
- [ ] **Risultato atteso**: Grafici interattivi e responsive

### 4.4 Tab Timeline
- [ ] Clicca sulla tab "Timeline"
- [ ] Verifica timeline interattiva con proiezioni
- [ ] Testa hover sui punti della timeline
- [ ] **Risultato atteso**: Timeline mostra proiezioni future

### 4.5 Tab Milestones
- [ ] Clicca sulla tab "Milestones"
- [ ] Verifica lista milestone con progress bar
- [ ] Controlla milestone raggiunte vs. da raggiungere
- [ ] **Risultato atteso**: Milestone ordinate e con stato corretto

### 4.6 Simulazione What-If
- [ ] Clicca sulla tab "Analisi"
- [ ] Clicca su "Simulazione What-If"
- [ ] Modifica i valori:
  - [ ] Patrimonio Attuale
  - [ ] Spese Annuali
  - [ ] Risparmi Annuali
  - [ ] Rendimento Atteso (slider)
- [ ] Verifica che appaia badge "Modalità Simulazione"
- [ ] Verifica che i calcoli si aggiornino in tempo reale
- [ ] Clicca "Reset" e verifica ritorno ai valori originali
- [ ] **Risultato atteso**: Simulazione interattiva senza salvare

## 5. Test Pagina Portafoglio

### 5.1 Caricamento Prezzi Real-Time
- [ ] Vai alla pagina Portafoglio
- [ ] Verifica indicatore "Ultimo aggiornamento prezzi"
- [ ] Attendi 1 minuto per auto-refresh
- [ ] Verifica che l'orario si aggiorni
- [ ] **Risultato atteso**: Prezzi aggiornati automaticamente

### 5.2 Portfolio Summary
- [ ] Verifica card riepilogo con:
  - Valore Totale
  - Guadagno/Perdita Totale
  - Variazione Giornaliera
  - Rendimento Totale %
- [ ] Clicca su "Aggiorna prezzi" manualmente
- [ ] **Risultato atteso**: Metriche aggiornate con prezzi real-time

### 5.3 Tab Posizioni
- [ ] Verifica tabella holdings con colonne:
  - Simbolo/Nome
  - Quantità
  - Prezzo Corrente
  - Valore
  - Guadagno/Perdita
  - Variazione Giornaliera
- [ ] **Risultato atteso**: Tutti i dati aggiornati correttamente

### 5.4 Tab Allocazione
- [ ] Clicca sulla tab "Allocazione"
- [ ] Verifica grafici a torta per:
  - Allocazione per Asset
  - Allocazione per Tipo
  - Allocazione per Settore
- [ ] **Risultato atteso**: Grafici interattivi con percentuali

### 5.5 Tab Performance
- [ ] Clicca sulla tab "Performance"
- [ ] Verifica grafici performance nel tempo
- [ ] Controlla metriche di rischio/rendimento
- [ ] **Risultato atteso**: Analisi performance dettagliata

### 5.6 Gestione Errori Prezzi
- [ ] Se alcuni ticker hanno errori, verifica alert di avviso
- [ ] Controlla che i ticker con errori siano evidenziati
- [ ] Verifica possibilità di retry per ticker falliti
- [ ] **Risultato atteso**: Errori gestiti gracefully

## 6. Test Calcolatori

### 6.1 Calcolatori Base (entrambe le modalità)
- [ ] Verifica presenza di:
  - FIRE Calculator
  - COAST FIRE Calculator
  - Barista FIRE Calculator
  - Simulatore Spese
- [ ] **Risultato atteso**: 4 tab base sempre presenti

### 6.2 Calcolatori Avanzati (Solo FIRE)
- [ ] In modalità Solo FIRE, verifica 3 tab aggiuntive:
  - [ ] Impatto Spese
  - [ ] Variazioni SWR
  - [ ] Timeline FIRE
- [ ] Testa funzionamento di ogni calcolatore
- [ ] **Risultato atteso**: 7 tab totali in Solo FIRE

### 6.3 Test Calcolatore Timeline FIRE
- [ ] Vai a tab "Timeline FIRE"
- [ ] Aggiungi scenari multipli
- [ ] Confronta timeline diverse
- [ ] Esporta/salva confronto
- [ ] **Risultato atteso**: Confronto visuale scenari

## 7. Test Performance

### 7.1 Tempi di Caricamento
- [ ] Misura tempo caricamento Dashboard
- [ ] Misura tempo caricamento Portafoglio
- [ ] Misura tempo switch modalità
- [ ] **Target**: < 2 secondi per ogni operazione

### 7.2 Responsiveness
- [ ] Testa su desktop (1920x1080)
- [ ] Testa su tablet (768x1024)
- [ ] Testa su mobile (375x667)
- [ ] **Risultato atteso**: Layout adattivo su tutti i dispositivi

### 7.3 Caricamento Lazy
- [ ] Verifica che i grafici si carichino solo quando visibili
- [ ] Controlla skeleton loader durante caricamento
- [ ] **Risultato atteso**: Caricamento progressivo ottimizzato

## 8. Test Integrazione Yahoo Finance

### 8.1 API Funzionante
- [ ] Aggiungi una transazione con ticker valido (es. AAPL)
- [ ] Vai al Portafoglio
- [ ] Verifica che il prezzo sia caricato
- [ ] **Risultato atteso**: Prezzo real-time mostrato

### 8.2 Gestione Ticker Non Validi
- [ ] Aggiungi transazione con ticker non valido
- [ ] Verifica messaggio di errore appropriato
- [ ] **Risultato atteso**: Errore gestito senza crash

### 8.3 Rate Limiting
- [ ] Aggiungi 10+ ticker diversi
- [ ] Verifica che tutti i prezzi si carichino
- [ ] Non dovrebbero esserci errori 429
- [ ] **Risultato atteso**: Rate limiting rispettato

## 9. Test Percorsi Critici

### 9.1 Percorso Nuovo Utente
- [ ] Registra nuovo utente
- [ ] Al primo login, verifica modalità default (FIRE & Budget)
- [ ] Cambia a Solo FIRE dal profilo
- [ ] Naviga attraverso tutte le sezioni
- [ ] **Risultato atteso**: Esperienza fluida per nuovo utente

### 9.2 Percorso Cambio Modalità
- [ ] Da FIRE & Budget, vai a Profilo
- [ ] Switcha a Solo FIRE
- [ ] Verifica redirect a Dashboard
- [ ] Controlla che UI si aggiorni immediatamente
- [ ] **Risultato atteso**: Transizione seamless

### 9.3 Percorso Inserimento Transazione
- [ ] In Solo FIRE, vai a Transazioni Finanziarie
- [ ] Aggiungi nuova transazione investimento
- [ ] Vai al Portafoglio
- [ ] Verifica che appaia con prezzo real-time
- [ ] **Risultato atteso**: Flusso completo funzionante

## 10. Test Edge Cases

### 10.1 Sessione Scaduta
- [ ] Lascia app inattiva per lungo periodo
- [ ] Tenta di cambiare modalità
- [ ] Verifica redirect a login
- [ ] **Risultato atteso**: Gestione sessione corretta

### 10.2 Errore Salvataggio Modalità
- [ ] Simula errore di rete durante switch
- [ ] Verifica rollback a modalità precedente
- [ ] Controlla messaggio di errore
- [ ] **Risultato atteso**: Stato consistente mantenuto

### 10.3 Dati Mancanti
- [ ] Accedi con utente senza transazioni
- [ ] Verifica stati empty in:
  - Dashboard
  - Portafoglio
  - Progresso FIRE
- [ ] **Risultato atteso**: Messaggi empty state appropriati

## Riepilogo Test

### Priorità Alta (Critici)
1. Toggle modalità funziona e persiste
2. Menu navigazione si adatta correttamente
3. Dashboard mostra widget corretti per modalità
4. Portafoglio carica prezzi real-time
5. Calcolatori FIRE funzionano correttamente

### Priorità Media
1. FIRE Progress tracker accurato
2. Simulazione What-If funzionante
3. Timeline e Milestones interattive
4. Performance accettabile su tutti i dispositivi

### Priorità Bassa
1. Animazioni e transizioni fluide
2. Tooltip e help text presenti
3. Export/stampa funzionalità

## Note per il Tester

- Esegui i test in ordine per migliore copertura
- Documenta screenshot per ogni sezione testata
- Segnala qualsiasi comportamento inaspettato
- Testa su browser diversi (Chrome, Firefox, Safari)
- Verifica console per errori JavaScript

## Checklist Finale Pre-Deploy

- [ ] Tutti i test Priorità Alta passati
- [ ] Nessun errore in console
- [ ] Performance entro i target
- [ ] Documentazione aggiornata
- [ ] Backup database effettuato