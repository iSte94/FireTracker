# 🧪 Istruzioni per Testare la Registrazione

## Problemi Risolti

Lo script di test è stato aggiornato per risolvere i seguenti problemi:

1. **✅ Errore verifica trigger**: Rimosso l'uso di `pg_get_triggers` non compatibile con Supabase
2. **✅ Errore accesso auth.users**: Corretto l'accesso tramite `supabase.auth.admin.listUsers()`
3. **✅ Errore fetch**: Aggiunta verifica connettività server e gestione errori robusta

## Script Disponibili

### 1. Script Completo: `test-registration-fix.js`
```bash
node test-registration-fix.js
```

**Funzionalità:**
- ✅ Verifica connettività database
- ✅ Conta utenti e profili esistenti
- ✅ Testa registrazione via API HTTP
- ✅ Testa registrazione diretta Supabase
- ✅ Verifica creazione automatica profilo
- ✅ Pulizia automatica utenti di test

### 2. Script Semplificato: `test-registration-simple.js`
```bash
node test-registration-simple.js
```

**Funzionalità:**
- ✅ Test veloce solo registrazione API
- ✅ Meno dipendenze
- ✅ Output semplificato

### 3. Verifica Database: `verify-db-status.js`
```bash
node verify-db-status.js
```

**Funzionalità:**
- ✅ Test connettività database
- ✅ Verifica permessi tabelle
- ✅ Test scrittura/lettura

## Prerequisiti

### 1. Variabili d'Ambiente
Verifica che `.env.local` contenga:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### 2. Dipendenze Node.js
```bash
npm install @supabase/supabase-js dotenv node-fetch
```

### 3. Server Development
```bash
npm run dev
```

## Procedura di Test Completa

### Passo 1: Verifica Database
```bash
node verify-db-status.js
```

**Risultato atteso:**
- ✅ Connessione database OK
- ✅ Tabella profiles accessibile
- ✅ Accesso auth users OK
- ✅ Permessi scrittura OK

### Passo 2: Test Registrazione Semplice
```bash
node test-registration-simple.js
```

**Risultato atteso:**
- ✅ Server raggiungibile
- ✅ REGISTRAZIONE RIUSCITA!
- ✅ Profilo creato automaticamente

### Passo 3: Test Completo (Opzionale)
```bash
node test-registration-fix.js
```

**Risultato atteso:**
- ✅ Connessione database funzionante
- ✅ Registrazione API completata con successo
- ✅ Registrazione diretta Supabase completata
- ✅ Profilo creato automaticamente dal trigger

## Test Manuale Interfaccia

### 1. Avvia il Server
```bash
npm run dev
```

### 2. Apri il Browser
Vai su: `http://localhost:3000/register`

### 3. Compila il Form
- **Email**: `test@example.com`
- **Password**: `TestPassword123!`
- **Nome Completo**: `Test User`

### 4. Verifica Risultato
- ✅ Messaggio di successo
- ✅ Redirect a pagina conferma email
- ✅ Profilo creato nel database

## Diagnostica Errori

### Errore: "Server non raggiungibile"
**Soluzione:**
```bash
npm run dev
```

### Errore: "Variabili di ambiente mancanti"
**Soluzione:**
1. Copia `.env.example` a `.env.local`
2. Inserisci le credenziali Supabase corrette

### Errore: "Profilo non creato automaticamente"
**Soluzione:**
1. Verifica che il trigger sia attivo:
```sql
-- Esegui in Supabase SQL Editor
SELECT * FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND trigger_name = 'on_auth_user_created';
```

2. Se il trigger non esiste, eseguilo:
```bash
# Applica il file enable-trigger.sql
```

### Errore: "Connessione database fallita"
**Soluzione:**
1. Verifica le credenziali in `.env.local`
2. Controlla che il progetto Supabase sia attivo
3. Verifica i permessi del service role key

## Verifica Manuale Database

### Controlla Utenti Creati
```sql
-- In Supabase SQL Editor
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;
```

### Controlla Profili Creati
```sql
-- In Supabase SQL Editor
SELECT id, email, full_name, created_at 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;
```

### Verifica Trigger
```sql
-- In Supabase SQL Editor
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'users';
```

## Pulizia Test

### Rimuovi Utenti di Test
```sql
-- In Supabase SQL Editor
DELETE FROM auth.users 
WHERE email LIKE '%test%@example.com';
```

## Supporto

Se i test falliscono:

1. **Controlla i log del server** (`npm run dev`)
2. **Verifica le variabili d'ambiente**
3. **Esegui la diagnostica database**
4. **Controlla lo stato del trigger**

## File di Log

I test producono output dettagliato per identificare problemi:
- ✅ Successo operazioni
- ❌ Errori con dettagli
- ⚠️ Warning e suggerimenti
- 💡 Istruzioni per risolvere problemi