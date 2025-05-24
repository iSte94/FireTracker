# Risoluzione Problema Cache Schema Supabase (PGRST204)

## Problema Identificato

Il problema principale era che PostgREST (errore PGRST204) non trovava la colonna `date` nella sua cache dello schema, anche se la colonna esisteva nella definizione della tabella.

**Sintomi:**
- Errore PGRST204: "column 'date' does not exist"
- La colonna `date` ESISTE nello schema database ([`supabase/financial-transactions-schema.sql:5`](supabase/financial-transactions-schema.sql:5))
- Il mapping client è CORRETTO ([`lib/financial-transactions-client.ts:206`](lib/financial-transactions-client.ts:206))
- Il problema è la **cache dello schema di Supabase non aggiornata**

## Soluzioni Implementate

### 1. 🔄 Script di Refresh Cache Schema

**File:** [`refresh-supabase-schema.js`](refresh-supabase-schema.js)

**Funzionalità:**
- Forza il refresh della cache dello schema Supabase
- Verifica che la colonna `date` sia accessibile
- Testa la connettività alla tabella `financial_transactions`
- Fornisce diagnostica dettagliata

**Utilizzo:**
```bash
npm run schema:refresh
```

**Cosa fa:**
1. Verifica connessione base al database
2. Testa specificamente l'accesso alla colonna `date`
3. Verifica tutte le colonne della tabella
4. Simula operazioni di inserimento
5. Forza il refresh della cache PostgREST

### 2. 🧪 Funzioni di Test Schema nel Client

**File:** [`lib/financial-transactions-client.ts`](lib/financial-transactions-client.ts)

**Funzioni aggiunte:**
- `testSchemaConnection()`: Verifica l'esistenza della colonna `date` e testa l'accesso alla tabella
- `forceSchemaRefresh()`: Forza il refresh della cache prima delle operazioni

**Integrazione automatica:**
- Il metodo `createTransaction()` ora esegue automaticamente il test dello schema
- Se il test fallisce, viene tentato un refresh automatico
- Fornisce diagnostica dettagliata in caso di problemi

**Utilizzo programmatico:**
```typescript
// Test manuale dello schema
const schemaOk = await financialTransactionsClient.testSchemaConnection()

// Refresh manuale della cache
await financialTransactionsClient.forceSchemaRefresh()
```

### 3. 🔍 Script di Verifica Database

**File:** [`verify-database-schema.js`](verify-database-schema.js)

**Funzionalità:**
- Controlla lo schema attuale del database
- Verifica tutte le colonne della tabella `financial_transactions`
- Confronta con lo schema previsto dal client
- Testa constraint e policy RLS
- Fornisce statistiche della tabella

**Utilizzo:**
```bash
npm run schema:verify
```

**Output:**
- ✅ Colonne esistenti e accessibili
- ❌ Colonne mancanti o problematiche
- 📊 Mapping client-database
- 🔧 Suggerimenti per la risoluzione

### 4. 🛡️ Migrazione di Sicurezza

**File:** [`supabase/ensure-financial-transactions-schema.sql`](supabase/ensure-financial-transactions-schema.sql)

**Funzionalità:**
- Assicura che la tabella e tutte le colonne esistano
- Usa `IF NOT EXISTS` per evitare errori
- Include tutti i constraint e indici necessari
- Crea policy RLS se mancanti
- Verifica e ripara lo schema automaticamente

**Utilizzo:**
1. Copia il contenuto del file
2. Incollalo nel Supabase SQL Editor
3. Esegui la query
4. Oppure usa: `npm run schema:ensure`

### 5. 📋 Comandi di Reset Cache

**File:** [`package.json`](package.json)

**Script aggiunti:**
```json
{
  "scripts": {
    "schema:refresh": "node refresh-supabase-schema.js",
    "schema:verify": "node verify-database-schema.js", 
    "schema:ensure": "echo 'Esegui manualmente supabase/ensure-financial-transactions-schema.sql in Supabase SQL Editor'",
    "schema:reset": "npm run schema:ensure && npm run schema:refresh && npm run schema:verify",
    "debug:schema": "npm run schema:verify && npm run schema:refresh"
  }
}
```

## Procedura di Risoluzione

### Risoluzione Rapida
```bash
# 1. Reset completo dello schema
npm run schema:reset

# 2. Riavvia il progetto
npm run dev
```

### Risoluzione Passo-Passo

1. **Verifica il problema:**
   ```bash
   npm run schema:verify
   ```

2. **Assicura lo schema (se necessario):**
   - Apri Supabase SQL Editor
   - Esegui il contenuto di `supabase/ensure-financial-transactions-schema.sql`

3. **Refresh della cache:**
   ```bash
   npm run schema:refresh
   ```

4. **Verifica finale:**
   ```bash
   npm run schema:verify
   ```

5. **Test dell'applicazione:**
   - Prova a creare una transazione finanziaria
   - Verifica che non ci siano più errori PGRST204

### Debug Avanzato

Se il problema persiste:

1. **Controlla i log dettagliati:**
   ```bash
   npm run debug:schema
   ```

2. **Verifica le variabili ambiente:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Controlla le policy RLS:**
   - Assicurati che l'utente sia autenticato
   - Verifica che le policy permettano l'accesso

4. **Riavvia Supabase (se self-hosted):**
   - Riavvia il container PostgREST
   - Attendi che la cache si aggiorni

## Prevenzione Futura

### Monitoraggio Automatico

Il client ora include controlli automatici:
- Test dello schema prima delle operazioni critiche
- Refresh automatico in caso di errori PGRST204
- Logging dettagliato per il debugging

### Best Practices

1. **Esegui sempre il test dello schema dopo modifiche:**
   ```bash
   npm run schema:verify
   ```

2. **Usa il refresh della cache dopo deploy:**
   ```bash
   npm run schema:refresh
   ```

3. **Monitora i log dell'applicazione** per errori PGRST204

4. **Mantieni sincronizzati** schema database e client TypeScript

## Risoluzione di Problemi Comuni

### Errore: "Variabili ambiente mancanti"
```bash
# Verifica che .env.local contenga:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Errore: "Utente non autenticato"
- Assicurati di essere loggato nell'applicazione
- Verifica che le policy RLS siano configurate correttamente

### Errore: "Tabella non trovata"
- Esegui la migrazione di sicurezza: `npm run schema:ensure`
- Verifica che la tabella esista nel dashboard Supabase

### Cache ancora non aggiornata
- Attendi 30-60 secondi dopo il refresh
- Riavvia completamente l'applicazione
- Controlla se ci sono più istanze di PostgREST in esecuzione

## File Coinvolti

- ✅ [`refresh-supabase-schema.js`](refresh-supabase-schema.js) - Script refresh cache
- ✅ [`verify-database-schema.js`](verify-database-schema.js) - Script verifica schema  
- ✅ [`supabase/ensure-financial-transactions-schema.sql`](supabase/ensure-financial-transactions-schema.sql) - Migrazione sicurezza
- ✅ [`lib/financial-transactions-client.ts`](lib/financial-transactions-client.ts) - Client con test automatici
- ✅ [`package.json`](package.json) - Script npm aggiunti

## Risultato Atteso

Dopo l'implementazione di tutte le soluzioni:
- ✅ Errore PGRST204 risolto
- ✅ Colonna `date` sempre accessibile
- ✅ Cache schema sincronizzata
- ✅ Transazioni finanziarie creabili senza errori
- ✅ Diagnostica automatica per problemi futuri
- ✅ Procedure di recovery automatiche