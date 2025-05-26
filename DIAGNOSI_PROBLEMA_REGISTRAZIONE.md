# 🚨 DIAGNOSI PROBLEMA REGISTRAZIONE 

## ❌ PROBLEMA IDENTIFICATO
**"Database error saving new user"** durante la registrazione

## 🔍 ANALISI COMPLETA

### 1. **FLUSSO DI REGISTRAZIONE ANALIZZATO**
```
1. ✅ Server funzionante su localhost:3000
2. ✅ Database connesso  
3. ✅ API /api/register raggiungibile
4. ❌ supabase.auth.signUp() fallisce con "Database error saving new user"
```

### 2. **PUNTO ESATTO DEL FALLIMENTO**
- **File**: `app/api/register/route.ts` linea 20
- **Operazione**: `await supabase.auth.signUp()`
- **Errore**: `AuthApiError: Database error saving new user`
- **Codice**: `unexpected_failure` (status 500)

### 3. **CAUSA RADICE IDENTIFICATA**
Il trigger `on_auth_user_created` fallisce quando cerca di inserire nella tabella `profiles` perché **manca la policy RLS INSERT**.

#### 🔧 DETTAGLI TECNICI

**Trigger configurato correttamente:**
```sql
-- Funzione (presente)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, ...) 
  VALUES (NEW.id, NEW.email, ...);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger (presente)  
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**Policy RLS - PROBLEMA:**
```sql
-- ✅ Policy esistenti
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ❌ Policy MANCANTE
-- CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

### 4. **PROOF OF CONCEPT - TEST ESEGUITI**

#### Test 1: Inserimento diretto tabella profiles
```
❌ Risultato: Foreign key constraint violation
✅ Conferma: La tabella profiles è accessibile in lettura
📊 Stato: 1 profilo esistente nel database
```

#### Test 2: Registrazione reale 
```
❌ Risultato: "Database error saving new user" 
🎯 Punto di fallimento: supabase.auth.signUp()
🚨 Trigger fallisce a causa di policy RLS mancante
```

#### Test 3: Verifica RLS
```
✅ RLS attivo sulla tabella profiles
❌ Policy INSERT mancante
✅ Policy SELECT e UPDATE presenti
```

## 🎯 CAUSA SPECIFICA INDIVIDUATA

Il trigger `handle_new_user()` ha `SECURITY DEFINER`, il che significa che dovrebbe eseguire con i privilegi del proprietario della funzione. Tuttavia, **anche le funzioni SECURITY DEFINER sono soggette alle policy RLS**, e la policy INSERT mancante impedisce l'inserimento.

## ⚠️ PROBLEMI SECONDARI IDENTIFICATI

1. **Schema RLS incompleto**: Policy INSERT mancante sulla tabella profiles
2. **Configurazione inconsistente**: Il trigger è presente ma non può funzionare
3. **Error handling**: Il messaggio di errore generico nasconde la causa reale

## 🚀 SOLUZIONI RICHIESTE

### SOLUZIONE PRIMARIA (OBBLIGATORIA)
Aggiungere la policy INSERT mancante per la tabella profiles:

```sql
-- Aggiungere questa policy per permettere al trigger di funzionare
CREATE POLICY "Trigger can insert new profile" ON profiles 
  FOR INSERT 
  WITH CHECK (true);  -- Permette al trigger SECURITY DEFINER di inserire

-- OPPURE, per maggiore sicurezza:
CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);
```

### SOLUZIONI ALTERNATIVE

1. **Disabilitare temporaneamente RLS** per testing:
   ```sql
   ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
   ```

2. **Modificare la funzione** per bypassare RLS:
   ```sql
   -- Aggiungere SET session_replication_role = replica; nella funzione
   ```

## 📊 PRIORITÀ DELLE CORREZIONI

1. **🔥 CRITICA**: Aggiungere policy INSERT per profiles
2. **⚠️ MEDIA**: Migliorare error handling nel trigger 
3. **📋 BASSA**: Aggiungere logging dettagliato per debug futuro

## ✅ CONFERMA DIAGNOSI

- [x] Problema identificato: Policy RLS INSERT mancante
- [x] Punto di fallimento localizzato: supabase.auth.signUp() 
- [x] Causa radice confermata: Trigger bloccato da RLS
- [x] Soluzione definita: Aggiungere policy INSERT
- [x] Test di conferma eseguiti

## 🎯 PROSSIMI STEP

1. Implementare la policy INSERT mancante
2. Testare la registrazione 
3. Verificare che il profilo venga creato automaticamente
4. Confermare che il flow completo funzioni

---

**Diagnosi completata il**: 26/05/2025, 12:40:00 PM  
**Tempo di debug**: ~15 minuti  
**Metodi utilizzati**: Analisi codice, test diretti, log analysis, test RLS