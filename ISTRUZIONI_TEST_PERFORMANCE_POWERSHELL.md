# 🚀 Test Performance API con PowerShell - Guida Completa

## 📋 Panoramica

Script PowerShell specifico per Windows che testa i tempi di risposta degli endpoint API del Fire Tracker, progettato per sostituire i comandi `curl` che non funzionano correttamente in PowerShell.

## 🛠️ Prerequisiti

- **Windows PowerShell 5.1+** o **PowerShell 7+**
- **Fire Tracker** in esecuzione (`npm run dev`)
- **Permessi di esecuzione** per script PowerShell

## ⚡ Esecuzione Rapida

### 1. Metodo Base (Veloce)
```powershell
# Avvia l'applicazione (se non già in esecuzione)
npm run dev

# In un nuovo terminale PowerShell
.\test-api-performance.ps1
```

### 2. Metodo Personalizzato
```powershell
# Test con 5 iterazioni e export CSV
.\test-api-performance.ps1 -Iterations 5 -ExportCsv

# Test con URL personalizzato
.\test-api-performance.ps1 -BaseUrl "http://localhost:4000"

# Test verboso con timeout esteso
.\test-api-performance.ps1 -Verbose -TimeoutSeconds 60
```

## 🎯 Parametri Disponibili

| Parametro | Tipo | Default | Descrizione |
|-----------|------|---------|-------------|
| `-BaseUrl` | String | `http://localhost:3000` | URL base dell'applicazione |
| `-Iterations` | Int | `3` | Numero di test per endpoint |
| `-TimeoutSeconds` | Int | `30` | Timeout per ogni richiesta |
| `-Verbose` | Switch | `false` | Output dettagliato |
| `-ExportCsv` | Switch | `false` | Esporta risultati in CSV |

## 📊 Endpoint Testati

### 🔐 API di Autenticazione
- **`/api/auth/session`** - Verifica sessione utente
- *Tempo atteso: < 500ms*

### 🔥 API FIRE Progress  
- **`/api/fire/progress`** - Calcolo progresso FIRE
- *Tempo atteso: < 1000ms*

### 🎯 API Obiettivi
- **`/api/goals/check-progress`** - Verifica progresso obiettivi
- *Tempo atteso: < 800ms*

### 💼 API Portafoglio
- **`/api/portfolio/holdings`** - Dati investimenti
- *Tempo atteso: < 1500ms (API Yahoo Finance)*

### 📈 API Net Worth
- **`/api/net-worth/history`** - Storico patrimonio
- *Tempo atteso: < 1000ms*

## 🚨 Risoluzione Errori PowerShell

### Errore: "Impossibile eseguire script"
```powershell
# Abilita esecuzione script (Amministratore)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Oppure esegui bypassando le policy
PowerShell -ExecutionPolicy Bypass -File .\test-api-performance.ps1
```

### Errore: "Server non raggiungibile"
```powershell
# Verifica che l'app sia in esecuzione
npm run dev

# Verifica la porta
netstat -an | findstr :3000

# Test manuale connessione
Test-NetConnection localhost -Port 3000
```

### Errore: "Invoke-RestMethod non riconosciuto"
```powershell
# Verifica versione PowerShell
$PSVersionTable.PSVersion

# Aggiorna se necessario a PowerShell 7+
```

## 📈 Interpretazione Risultati

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
**Azione:** Monitora e considera ottimizzazioni preventive

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

## 🔧 Suggerimenti di Ottimizzazione

### Per Portfolio Holdings (Lento)
```typescript
// Cache Yahoo Finance API
const CACHE_DURATION = 5 * 60 * 1000; // 5 minuti

// Batch richieste ticker
const batchTickers = chunk(tickers, 10);
```

### Per Fire Progress (Lento)
```typescript
// Lazy loading componenti pesanti
const LazyFireChart = lazy(() => import('./fire-chart'));

// Cache calcoli complessi
const memoizedFireCalc = useMemo(() => 
  calculateFireProgress(data), [data]
);
```

### Per Database Queries (Lente)
```sql
-- Aggiungi indici strategici
CREATE INDEX idx_user_id ON financial_transactions(user_id);
CREATE INDEX idx_date_range ON net_worth_history(date, user_id);
```

## 📄 Output CSV

Quando usi `-ExportCsv`, otterrai un file come:
```
fire-tracker-performance-20250106-111530.csv
```

**Contenuto esempio:**
```csv
Endpoint,Url,ResponseTime,StatusCode,Success,Error,Level
"Auth Session","/api/auth/session",245,200,True,,"ECCELLENTE"
"Fire Progress","/api/fire/progress",1240,200,True,,"LENTO"
```

## 🎯 Esempi di Uso Avanzato

### Test di Carico (Stress Test)
```powershell
# Test intensivo con 10 iterazioni
.\test-api-performance.ps1 -Iterations 10 -Verbose -ExportCsv
```

### Test Environment Staging
```powershell
# Test su ambiente di staging
.\test-api-performance.ps1 -BaseUrl "https://staging.fire-tracker.com"
```

### Test con Monitoraggio
```powershell
# Esegui test ogni 5 minuti (monitoring continuo)
while ($true) {
    .\test-api-performance.ps1 -ExportCsv
    Write-Host "Prossimo test in 5 minuti..."
    Start-Sleep 300
}
```

## 🚀 Quick Troubleshooting

### Problema: Tutti gli endpoint sono lenti
**Causa probabile:** Database o infrastruttura
**Soluzione:** Riavvia app, verifica risorse sistema

### Problema: Solo Portfolio Holdings lento  
**Causa probabile:** Yahoo Finance API
**Soluzione:** Implementa cache più aggressiva

### Problema: Errori 401 (Unauthorized)
**Causa probabile:** Sessioni non autenticate (normale)
**Soluzione:** Nessuna, comportamento atteso

### Problema: Timeout frequenti
**Causa probabile:** Server sovraccarico o rete lenta
**Soluzione:** Aumenta `-TimeoutSeconds` o riduci carico

## 💡 Pro Tips

1. **Esegui il test dopo ogni deploy** per verificare regressioni
2. **Usa `-Verbose`** per debug dettagliato
3. **Salva i risultati CSV** per analisi temporali
4. **Testa in orari diversi** per identificare pattern
5. **Combina con il monitoring real-time** del Performance Monitor esistente

---

## ✅ Checklist Rapida

Prima di eseguire il test:
- [ ] App Fire Tracker in esecuzione (`npm run dev`)
- [ ] PowerShell aperto come utente (non admin necessario)
- [ ] Script scaricato nella directory del progetto
- [ ] ExecutionPolicy configurata se necessario

Per risultati ottimali:
- [ ] Chiudi altre applicazioni pesanti
- [ ] Usa connessione di rete stabile
- [ ] Aspetta che l'app sia completamente caricata
- [ ] Esegui almeno 3 iterazioni per risultati stabili