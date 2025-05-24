# Setup Budget Tables - Guida all'uso

Questo documento spiega come utilizzare gli script per creare automaticamente le tabelle budget nel database Supabase.

## 📋 Prerequisiti

1. **Node.js** installato sul sistema
2. **File `.env.local`** con le credenziali Supabase:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://tuoprogetto.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=tua-service-role-key
   ```
3. **File SQL** già presente in `supabase/add-budgets-table.sql`

## 🚀 Come eseguire lo script

### Metodo 1: Script principale (consigliato)

```bash
node setup-budget-tables.js
```

Questo script:
- ✅ Legge automaticamente le credenziali da `.env.local`
- ✅ Si connette al database Supabase
- ✅ Esegue lo script SQL per creare le tabelle
- ✅ Fornisce feedback colorato durante l'esecuzione
- ✅ Verifica che le tabelle siano state create correttamente

### Metodo 2: Script alternativo

Se il primo script non funziona, prova:

```bash
node setup-budget-tables-alt.js
```

## 📊 Cosa viene creato

Lo script crea le seguenti strutture nel database:

### Tabelle
- **`budgets`** - Gestisce i budget degli utenti
  - Supporta budget mensili, trimestrali e annuali
  - Permette di impostare soglie di allerta
  - Supporta budget condivisi tra utenti
  - Collegamento con obiettivi finanziari

- **`budget_alerts`** - Traccia le notifiche
  - Notifiche quando si raggiunge una soglia
  - Avvisi quando il budget viene superato
  - Promemoria quando il periodo sta per terminare

### Sicurezza
- **Row Level Security (RLS)** abilitata su entrambe le tabelle
- **Policy** per controllo accessi:
  - Gli utenti possono vedere solo i propri budget
  - Gli utenti possono modificare solo i propri dati
  - Supporto per budget condivisi

### Performance
- **Indici** creati per ottimizzare le query su:
  - user_id
  - category
  - period
  - status

## 🔧 Risoluzione problemi

### Errore: "Credenziali Supabase mancanti"
Verifica che il file `.env.local` contenga:
```
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Errore: "Impossibile leggere il file SQL"
Assicurati che il file `supabase/add-budgets-table.sql` esista.

### Errore durante l'esecuzione SQL
Se lo script non riesce ad eseguire le query automaticamente, puoi:

1. **Usare Supabase Dashboard**
   - Vai su [app.supabase.com](https://app.supabase.com)
   - Apri il tuo progetto
   - Vai su "SQL Editor"
   - Copia e incolla il contenuto di `supabase/add-budgets-table.sql`
   - Clicca "Run"

2. **Usare un client PostgreSQL**
   - Connettiti con pgAdmin, TablePlus, o simili
   - Esegui manualmente lo script SQL

## ✅ Verifica installazione

Dopo l'esecuzione, verifica che tutto funzioni:

1. Vai su Supabase Dashboard
2. Controlla la sezione "Table Editor"
3. Dovresti vedere le tabelle `budgets` e `budget_alerts`

## 📝 Note aggiuntive

- Lo script è idempotente: può essere eseguito più volte senza problemi
- Le tabelle usano `IF NOT EXISTS` per evitare errori se già esistono
- Il trigger `update_updated_at()` aggiorna automaticamente il campo `updated_at`

## 🆘 Supporto

Se riscontri problemi:
1. Controlla i log di output dello script
2. Verifica le credenziali Supabase
3. Assicurati di avere i permessi necessari (service role key)
4. Controlla la console Supabase per eventuali errori

---

**Ultimo aggiornamento:** 23/05/2025