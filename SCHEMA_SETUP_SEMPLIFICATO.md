# Setup Schema Semplificato - Fire Tracker

Questa guida fornisce soluzioni semplificate per risolvere i problemi con lo schema `financial_transactions` senza dipendenze esterne complesse.

## 🎯 Problemi Risolti

- ✅ Script che richiedevano `dotenv` non installato
- ✅ Funzione `exec_sql` non disponibile in Supabase
- ✅ Script che fallivano senza messaggi chiari
- ✅ Mancanza di alternative manuali semplici

## 🚀 Soluzioni Immediate

### 1. Verifica Schema Semplificata

**Comando più semplice (raccomandato):**
```bash
npm run schema:check
```

**Comando con variabili ambiente da .env.local:**
```bash
npm run schema:check:full
```

**Comando manuale (se npm non funziona):**
```bash
# Carica variabili ambiente e esegui
source .env.local && node simple-schema-check.js
```

### 2. Applicazione Schema

**Schema normale (per database nuovo):**
```bash
npm run schema:apply
```

**Schema sicuro (per database esistente):**
```bash
npm run schema:apply:safe
```

### 3. Guida Manuale

Se gli script automatici non funzionano:
```bash
npm run schema:manual
```

Oppure leggi direttamente: [`manual-schema-guide.md`](manual-schema-guide.md)

### 4. Aiuto Rapido

```bash
npm run help:schema
```

## 📁 File Creati/Modificati

### Nuovi File

1. **[`simple-schema-check.js`](simple-schema-check.js)**
   - Verifica schema senza dipendenze esterne
   - Usa solo `@supabase/supabase-js` (già installato)
   - Output chiaro e actionable

2. **[`manual-schema-guide.md`](manual-schema-guide.md)**
   - Guida passo-passo per applicazione manuale
   - Comandi SQL specifici per Supabase Dashboard
   - Risoluzione problemi comuni

3. **[`SCHEMA_SETUP_SEMPLIFICATO.md`](SCHEMA_SETUP_SEMPLIFICATO.md)** (questo file)
   - Panoramica delle soluzioni
   - Comandi rapidi di riferimento

### File Modificati

1. **[`check-existing-schema.js`](check-existing-schema.js)**
   - ❌ Rimossa dipendenza `require('dotenv')`
   - ✅ Legge variabili ambiente direttamente da `process.env`
   - ✅ Messaggi di errore più chiari

2. **[`package.json`](package.json)**
   - ✅ Aggiunti script semplificati
   - ✅ Script di aiuto e guida
   - ✅ Versioni sicure degli script esistenti

## 🔧 Workflow Raccomandato

### Per Utenti Nuovi

1. **Verifica stato attuale:**
   ```bash
   npm run schema:check
   ```

2. **Se schema non esiste, applica:**
   ```bash
   npm run schema:apply
   ```

3. **Verifica applicazione:**
   ```bash
   npm run schema:check
   ```

### Per Utenti con Schema Parziale

1. **Verifica stato attuale:**
   ```bash
   npm run schema:check
   ```

2. **Applica versione sicura:**
   ```bash
   npm run schema:apply:safe
   ```

3. **Verifica completamento:**
   ```bash
   npm run schema:check
   ```

### Se gli Script Non Funzionano

1. **Leggi la guida manuale:**
   ```bash
   npm run schema:manual
   ```

2. **Segui le istruzioni in [`manual-schema-guide.md`](manual-schema-guide.md)**

3. **Applica lo schema nel Supabase Dashboard**

## 🚨 Risoluzione Problemi Comuni

### Errore: "Variabili di ambiente mancanti"

**Soluzione 1 (raccomandato):**
```bash
# Carica variabili da .env.local
source .env.local && npm run schema:check
```

**Soluzione 2:**
```bash
# Usa lo script semplificato che gestisce questo caso
npm run schema:check
```

### Errore: "exec_sql function not found"

**Causa:** Supabase non ha la funzione `exec_sql` abilitata

**Soluzione:** Usa l'applicazione manuale:
```bash
npm run schema:manual
```

### Errore: "dotenv not found"

**Causa:** Script vecchi che richiedevano dotenv

**Soluzione:** Usa i nuovi script:
```bash
npm run schema:check        # invece di node check-existing-schema.js
```

### Schema Parzialmente Applicato

**Sintomi:** Alcune tabelle/colonne esistono, altre no

**Soluzione:**
```bash
npm run schema:apply:safe   # Usa versione sicura
```

## 📊 Verifica Rapida

Dopo aver applicato lo schema, verifica che tutto funzioni:

```bash
# Verifica schema
npm run schema:check

# Se tutto OK, testa l'applicazione
npm run dev
```

## 🔄 Manutenzione

### Aggiornamento Schema

Se in futuro serve aggiornare lo schema:

1. Modifica i file in `supabase/`
2. Usa sempre la versione sicura: `npm run schema:apply:safe`
3. Verifica: `npm run schema:check`

### Backup Prima di Modifiche

Prima di applicare modifiche importanti:

1. Esporta i dati dal Supabase Dashboard
2. Salva una copia dello schema attuale
3. Applica le modifiche
4. Verifica che tutto funzioni

## 💡 Suggerimenti

- **Usa sempre `npm run schema:check`** prima di applicare modifiche
- **Preferisci `schema:apply:safe`** se non sei sicuro dello stato del database
- **Leggi `manual-schema-guide.md`** se hai problemi con gli script automatici
- **Testa sempre** dopo aver applicato lo schema

## 📞 Supporto

Se hai ancora problemi:

1. Controlla [`manual-schema-guide.md`](manual-schema-guide.md) per la procedura manuale
2. Verifica le variabili ambiente in `.env.local`
3. Controlla la connessione a Supabase
4. Usa `npm run help:schema` per vedere tutti i comandi disponibili

---

**✅ Con queste soluzioni, dovresti riuscire a configurare lo schema anche senza dipendenze esterne complesse!**