# 🚀 Guida Setup Completa - FIRE Progress Tracker

Questa guida ti accompagna nel setup completo del progetto FIRE Progress Tracker dal repository GitHub.

## 📋 Prerequisiti

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** (raccomandato) o npm
- **Account Supabase** ([Registrati gratis](https://app.supabase.com))
- **Git** installato

## 🔧 Step 1: Clone e Setup Iniziale

```powershell
# 1. Clona il repository
git clone https://github.com/iSte94/FireTracker.git
cd FireTracker

# 2. Installa le dipendenze
pnpm install
# oppure con npm: npm install

# 3. Verifica che tutto sia installato correttamente
pnpm --version
node --version
```

## 🗄️ Step 2: Setup Supabase Database

### 2.1 Crea Progetto Supabase

1. Vai su [app.supabase.com](https://app.supabase.com)
2. Clicca **"New Project"**
3. Scegli:
   - **Name**: `fire-tracker` (o nome a tua scelta)
   - **Database Password**: Genera una password sicura (SALVALA!)
   - **Region**: Europe (West) per migliori performance in Italia
4. Clicca **"Create new project"**
5. Aspetta 2-3 minuti per la creazione

### 2.2 Ottieni le Credenziali

1. Nel dashboard Supabase, vai su **Settings** → **API**
2. Copia i seguenti valori:
   - **URL**: `https://xxx.supabase.co`
   - **anon public**: `eyJhbGc...` (chiave pubblica)
   - **service_role**: `eyJhbGc...` (chiave privata - TIENI SEGRETA!)

3. Vai su **Settings** → **API** → **JWT Settings**
4. Copia il **JWT Secret**

## 🔐 Step 3: Configurazione Environment Variables

### 3.1 Crea il file .env.local

```powershell
# Copia il template
cp .env.example .env.local

# Apri il file per la modifica
notepad .env.local
```

### 3.2 Configura le variabili in .env.local

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://TUO_PROGETTO_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TUA_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=TUA_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET=TUO_JWT_SECRET

# Optional: App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ IMPORTANTE**: 
- Sostituisci `TUO_PROGETTO_ID` con l'ID del tuo progetto
- Sostituisci le chiavi con quelle del tuo progetto Supabase
- NON condividere mai queste chiavi!

## 🏗️ Step 4: Setup Database Schema

### 4.1 Setup Automatico (Raccomandato)

```powershell
# Setup completo del modulo investimenti
pnpm run setup:investment

# Se hai errori, prova il setup sicuro
node setup-investment-simple.js
```

### 4.2 Setup Manuale (se automatico fallisce)

1. Apri [Supabase Dashboard](https://app.supabase.com)
2. Vai sul tuo progetto → **SQL Editor**
3. Esegui questi file SQL **nell'ordine**:

```sql
-- 1. Setup profili utente
-- Copia e incolla il contenuto di: supabase/setup-profiles.sql

-- 2. Setup tabelle budget  
-- Copia e incolla il contenuto di: supabase/setup-budget-tables.sql

-- 3. Setup modulo investimenti
-- Copia e incolla il contenuto di: supabase/setup-all-investment.sql

-- 4. Setup view mode
-- Copia e incolla il contenuto di: supabase/setup-view-mode.sql
```

### 4.3 Verifica Setup

```powershell
# Testa la connessione al database
pnpm run test:investment

# Verifica lo schema
pnpm run schema:check
```

Se vedi ✅ per tutte le tabelle, il setup è completato!

## 🚀 Step 5: Avvio Applicazione

```powershell
# Avvia il server di sviluppo
pnpm dev

# L'app sarà disponibile su:
# http://localhost:3000
```

## 🔧 Step 6: Configurazione Opzionale

### 6.1 Configurazione Autenticazione

1. Nel dashboard Supabase, vai su **Authentication** → **Providers**
2. Configura i provider che preferisci:
   - **Email**: Già abilitato di default
   - **Google**: Per login con Google
   - **GitHub**: Per login con GitHub

### 6.2 Setup Yahoo Finance (per prezzi real-time)

L'integrazione Yahoo Finance è già configurata e non richiede API key.

### 6.3 Setup RLS (Row Level Security)

Il sistema ha già RLS configurato. Ogni utente vede solo i propri dati.

## 🧪 Step 7: Test e Verifica

### 7.1 Test Completo

```powershell
# Test delle funzionalità principali
pnpm run test:investment

# Verifica che non ci siano errori TypeScript
pnpm run build
```

### 7.2 Test Manuale

1. Apri http://localhost:3000
2. Registra un nuovo account
3. Verifica che:
   - ✅ Dashboard si carica
   - ✅ Puoi cambiare modalità (FIRE/Budget)
   - ✅ Calcolatori funzionano
   - ✅ Portfolio si carica

## 🔄 Script Utili

### Gestione Database

```powershell
# Setup completo database
pnpm run setup:investment

# Verifica schema
pnpm run schema:check

# Reset database (attenzione: cancella dati!)
pnpm run schema:reset

# Debug problemi database
pnpm run debug:schema
```

### Sviluppo

```powershell
# Sviluppo
pnpm dev              # Server sviluppo
pnpm build            # Build produzione
pnpm start            # Server produzione
pnpm lint             # Controllo codice

# Aiuto
pnpm run help:schema  # Lista script database
```

## 🚨 Risoluzione Problemi Comuni

### Errore: "Cannot connect to Supabase"

```powershell
# 1. Verifica le variabili d'ambiente
echo $env:NEXT_PUBLIC_SUPABASE_URL
echo $env:NEXT_PUBLIC_SUPABASE_ANON_KEY

# 2. Verifica che .env.local esista
ls .env.local

# 3. Riavvia il server
pnpm dev
```

### Errore: "Table does not exist"

```powershell
# Riesegui il setup database
pnpm run setup:investment

# Se persiste, setup manuale via Supabase SQL Editor
```

### Errore: "Permission denied" 

1. Vai su Supabase → **SQL Editor**
2. Esegui:
```sql
-- Verifica RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Se rowsecurity = false per qualche tabella, riabilita RLS
ALTER TABLE nome_tabella ENABLE ROW LEVEL SECURITY;
```

### Errore: Build fallisce

```powershell
# Pulisci cache
rm -rf .next
rm -rf node_modules
pnpm install
pnpm build
```

## 📱 Step 8: Deploy in Produzione

### Vercel (Raccomandato)

1. Vai su [vercel.com](https://vercel.com)
2. Collega il repository GitHub
3. Aggiungi le Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_JWT_SECRET`
4. Deploy automatico!

### Altre Piattaforme

- **Netlify**: Supporto Next.js completo
- **Railway**: Database + App hosting
- **DigitalOcean App Platform**: Hosting scalabile

## 🔐 Sicurezza in Produzione

### Environment Variables

```env
# Produzione - NON includere mai queste chiavi nel codice!
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # SOLO per server!
SUPABASE_JWT_SECRET=xxx...             # SOLO per server!

# Optional
NEXT_PUBLIC_APP_URL=https://tuodominio.com
```

### Checklist Sicurezza

- [ ] `.env.local` non è nel repository
- [ ] Service role key non è esposta al client
- [ ] RLS abilitato su tutte le tabelle
- [ ] HTTPS abilitato in produzione
- [ ] Database password sicura

## 📞 Supporto

Se hai problemi:

1. **Controlla i logs**:
   ```powershell
   # Next.js logs
   pnpm dev
   
   # Supabase logs nel dashboard
   ```

2. **Issues GitHub**: [GitHub Issues](https://github.com/iSte94/FireTracker/issues)

3. **Documentazione**: Controlla i file README nella cartella `docs/`

## ✅ Checklist Setup Completo

- [ ] Node.js e pnpm installati
- [ ] Repository clonato
- [ ] Dipendenze installate (`pnpm install`)
- [ ] Progetto Supabase creato
- [ ] Credenziali copiate
- [ ] File `.env.local` configurato
- [ ] Database schema applicato
- [ ] Test superati (`pnpm run test:investment`)
- [ ] App funziona in locale (`pnpm dev`)
- [ ] Account test creato e funzionante

🎉 **Congratulazioni! Il tuo FIRE Progress Tracker è pronto!**

---

**Prossimi Passi**:
- Personalizza i tuoi obiettivi FIRE
- Importa i dati del tuo portfolio
- Configura i budget (modalità FIRE & Budget)
- Esplora i calcolatori avanzati

**Buon viaggio verso l'indipendenza finanziaria! 🔥**
