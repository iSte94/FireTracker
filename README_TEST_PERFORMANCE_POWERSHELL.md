# 🚀 Sistema Test Performance PowerShell - Fire Tracker

## 📋 Panoramica Completa

Sistema completo di test performance per Windows PowerShell che sostituisce i comandi `curl` non funzionanti, fornendo analisi dettagliata dei tempi di risposta degli endpoint API del Fire Tracker.

## 📁 File Creati

### 🔧 Script Principale
- **[`test-api-performance.ps1`](test-api-performance.ps1)** - Script PowerShell completo con tutte le funzionalità

### 🎯 Script Batch (Uso Rapido)
- **[`test-performance.bat`](test-performance.bat)** - Esecuzione base (3 iterazioni)
- **[`test-performance-csv.bat`](test-performance-csv.bat)** - Con export CSV (5 iterazioni)  
- **[`test-performance-verbose.bat`](test-performance-verbose.bat)** - Modalità dettagliata (5 iterazioni)

### 📚 Documentazione
- **[`ISTRUZIONI_TEST_PERFORMANCE_POWERSHELL.md`](ISTRUZIONI_TEST_PERFORMANCE_POWERSHELL.md)** - Guida completa all'uso
- **[`README_TEST_PERFORMANCE_POWERSHELL.md`](README_TEST_PERFORMANCE_POWERSHELL.md)** - Questo file

## ⚡ Uso Rapido

### 🖱️ Per Utenti Base (Doppio Click)
```batch
# Doppio click su uno di questi file:
test-performance.bat           # Test standard
test-performance-csv.bat       # Test con export CSV
test-performance-verbose.bat   # Test dettagliato
```

### 💻 Per Utenti PowerShell
```powershell
# Test base
.\test-api-performance.ps1

# Test personalizzato
.\test-api-performance.ps1 -Iterations 5 -ExportCsv -Verbose

# Test con URL diverso
.\test-api-performance.ps1 -BaseUrl "http://localhost:4000"
```

## 🎯 Endpoint Testati

| Endpoint | Descrizione | Tempo Atteso |
|----------|-------------|--------------|
| `/api/auth/session` | Autenticazione | < 500ms |
| `/api/fire/progress` | Calcolo FIRE | < 1000ms |
| `/api/goals/check-progress` | Progresso obiettivi | < 800ms |
| `/api/portfolio/holdings` | Dati portafoglio | < 1500ms |
| `/api/net-worth/history` | Storico patrimonio | < 1000ms |

## 📊 Interpretazione Risultati

### 🟢 Performance Eccellente (≤ 500ms)
```
✅ Test 1: 245ms [ECCELLENTE]
✅ Test 2: 312ms [ECCELLENTE]
✅ Test 3: 198ms [ECCELLENTE]
```
**Azione:** Nessuna ottimizzazione necessaria

### 🟡 Performance Buona (≤ 1000ms)
```
✅ Test 1: 756ms [BUONO]
✅ Test 2: 892ms [BUONO]
✅ Test 3: 634ms [BUONO]
```
**Azione:** Monitora, considera ottimizzazioni preventive

### 🔴 Performance Lenta (> 1000ms)
```
✅ Test 1: 2340ms [LENTO]
✅ Test 2: 1876ms [LENTO]
✅ Test 3: 2100ms [LENTO]
```
**Azione:** Ottimizzazione necessaria

### ❌ Performance Critica (> 3000ms)
```
✅ Test 1: 5670ms [CRITICO]
✅ Test 2: 4230ms [CRITICO]
✅ Test 3: 6100ms [CRITICO]
```
**Azione:** Intervento immediato richiesto

## 🔧 Caratteristiche Avanzate

### 📈 Analisi Automatica
- **Identificazione bottleneck** automatica
- **Suggerimenti specifici** per endpoint
- **Statistiche aggregate** per endpoint
- **Confronto performance** tra iterazioni

### 📄 Export e Reporting
- **Export CSV** con timestamp per analisi storiche
- **Report colorato** in console per lettura immediata
- **Raccomandazioni automatiche** basate sui risultati
- **Statistiche aggregate** (min, max, media per endpoint)

### 🛡️ Gestione Errori Robusta
- **Timeout configurabile** per richieste lente
- **Gestione 401 Unauthorized** come successo atteso
- **Retry logic** implicito tramite iterazioni multiple
- **Validation endpoint** prima dell'esecuzione test

## 🔍 Risoluzione Problemi Comuni

### Errore: "Script non eseguibile"
```powershell
# Soluzione: Abilita esecuzione script
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Oppure usa bypass temporaneo
PowerShell -ExecutionPolicy Bypass -File .\test-api-performance.ps1
```

### Errore: "Server non raggiungibile"
```bash
# Soluzione: Avvia l'applicazione
npm run dev

# Verifica che sia accessibile
curl http://localhost:3000  # o apri nel browser
```

### Errore: "Invoke-RestMethod non riconosciuto"
```powershell
# Verifica versione PowerShell
$PSVersionTable.PSVersion

# Aggiorna a PowerShell 7+ se necessario
```

### Tutti gli endpoint sono lenti
**Cause probabili:**
- Database non ottimizzato
- Sistema sovraccarico  
- Connessione di rete lenta

**Soluzioni:**
1. Riavvia l'applicazione
2. Chiudi applicazioni pesanti
3. Controlla uso CPU/RAM
4. Verifica connessione Internet (per Yahoo Finance API)

## 💡 Suggerimenti di Ottimizzazione

### Per Portfolio Holdings (Yahoo Finance API)
```typescript
// Implementa cache più aggressiva
const CACHE_DURATION = 5 * 60 * 1000; // 5 minuti

// Batch richieste ticker
const batchSize = 10;
const batchedRequests = chunk(tickers, batchSize);
```

### Per Fire Progress (Calcoli complessi)
```typescript
// Lazy loading componenti pesanti
const LazyFireChart = lazy(() => import('./fire-chart'));

// Memoizzazione calcoli
const memoizedFireCalc = useMemo(() => 
  calculateFireProgress(data), [data]
);
```

### Per Database (Queries lente)
```sql
-- Aggiungi indici strategici
CREATE INDEX idx_user_id ON financial_transactions(user_id);
CREATE INDEX idx_date_range ON net_worth_history(date, user_id);
CREATE INDEX idx_user_sessions ON sessions(userId, expires);
```

## 🚀 Integrazione con Sistema Esistente

Questo sistema di test PowerShell **si integra perfettamente** con il sistema di performance monitoring già esistente:

- **Complementa** il [`test-performance-bottleneck.js`](test-performance-bottleneck.js) esistente
- **Funziona insieme** al Performance Monitor UI in development
- **Condivide** le stesse soglie e criteri di valutazione
- **Estende** le capacità di test su Windows PowerShell

## 📅 Uso Consigliato

### 🔄 Test Regolari
```powershell
# Test giornaliero automatico
.\test-api-performance.ps1 -ExportCsv

# Analisi settimanale dei CSV generati
Get-ChildItem "fire-tracker-performance-*.csv" | Sort-Object CreationTime
```

### 🚨 Test Dopo Modifiche
```powershell
# Prima delle modifiche (baseline)
.\test-api-performance.ps1 -ExportCsv

# Dopo le modifiche (confronto)
.\test-api-performance.ps1 -ExportCsv

# Confronta i risultati CSV
```

### 🔍 Debug Performance
```powershell
# Per debug dettagliato
.\test-api-performance.ps1 -Verbose -Iterations 10
```

## ✅ Checklist Pre-Test

- [ ] Fire Tracker in esecuzione (`npm run dev`)
- [ ] PowerShell 5.1+ installato
- [ ] ExecutionPolicy configurata (se necessario)
- [ ] Connessione Internet stabile (per Yahoo Finance)
- [ ] Altre applicazioni pesanti chiuse
- [ ] Database in stato pulito

## 🎯 Risultati Attesi

Con questo sistema di test PowerShell, dovresti essere in grado di:

1. **Identificare rapidamente** quali endpoint sono lenti
2. **Ottenere suggerimenti specifici** per l'ottimizzazione
3. **Monitorare le performance** nel tempo tramite CSV
4. **Validare le ottimizzazioni** con test before/after
5. **Integrare i test** nel workflow di sviluppo Windows

---

## 🚀 Quick Start per Utenti Windows

1. **Doppio click** su [`test-performance.bat`](test-performance.bat)
2. **Leggi i risultati** colorati in console
3. **Implementa le ottimizzazioni** suggerite
4. **Ripeti il test** per validare i miglioramenti

**In 2 minuti avrai un'analisi completa delle performance del tuo Fire Tracker!**