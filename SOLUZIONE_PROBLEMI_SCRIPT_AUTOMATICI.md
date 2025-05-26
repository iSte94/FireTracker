# 🔧 SOLUZIONE PROBLEMI SCRIPT AUTOMATICI

## ❌ Problemi Identificati

Gli script automatici falliscono per questi motivi:

1. **File SQL eseguito come JavaScript**: `node .\fix-rls-insert-policy.sql`
2. **Errore database**: "relation public.pg_policies does not exist" 
3. **Funzione mancante**: "Could not find the function public.sql(query)"

## ✅ SOLUZIONE MANUALE SEMPLICE

### STEP 1: Applicare la Correzione via Dashboard Supabase

1. **Vai su**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Seleziona il tuo progetto**
3. **Clicca su "SQL Editor"** nel menu laterale
4. **Copia e incolla questo SQL**:

```sql
CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);
```

5. **Clicca "Run"** o premi Ctrl+Enter

### STEP 2: Verificare la Correzione

Nel SQL Editor, esegui questa query di verifica:

```sql
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public' 
ORDER BY cmd;
```

**Risultato atteso**: Dovresti vedere 3 policy:
- INSERT: "Users can insert own profile"
- SELECT: "Users can view own profile"  
- UPDATE: "Users can update own profile"

### STEP 3: Test Semplificato

Usa il nuovo script di test semplificato:

```bash
node test-registration-manual.js
```

Questo script:
- ✅ Testa solo l'endpoint HTTP `/api/register`
- ✅ Non usa query complesse al database
- ✅ Funziona senza dipendenze da funzioni SQL avanzate
- ✅ Fornisce suggerimenti specifici in caso di errore

### STEP 4: Test Frontend

1. Vai su `http://localhost:3000/register`
2. Prova a registrare un nuovo utente
3. Controlla che non ci siano errori

---

## 📋 CHECKLIST RAPIDA

- [ ] **Policy INSERT creata** via Dashboard Supabase
- [ ] **Query di verifica** mostra tutte e 3 le policy
- [ ] **Test HTTP semplificato** restituisce `success: true`
- [ ] **Registrazione frontend** funziona senza errori
- [ ] **Log del server** mostrano creazione profilo automatica

---

## 🆘 SE HAI ANCORA PROBLEMI

### Problema: Policy non può essere creata
```sql
-- Prima elimina se esiste
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
-- Poi ricrea
CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Problema: Trigger mancante
```sql
-- Verifica trigger
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Se non esiste, crealo:
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Problema: Tabella profiles mancante
```sql
-- Verifica tabella
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'profiles';

-- Se non esiste, usa: supabase/schema.sql per crearla
```

---

## 🎯 RISULTATO FINALE

Quando tutto funziona, vedrai:

**Nel test HTTP**:
```
✅ REGISTRAZIONE FUNZIONA CORRETTAMENTE!
   User ID: [uuid]
   Profile creato: true
```

**Nei log del server**:
```
Step 4: Profile verification:
- Profile created by trigger: true
- Profile data: {id: "[uuid]", email: "test@example.com", full_name: "Test User"}
Step 5: Registration completed successfully with automatic profile creation
```

**Nel frontend**: Registrazione completata senza errori

---

## 📖 DOCUMENTI DI RIFERIMENTO

- **Guida completa**: [`GUIDA_MANUALE_CORREZIONE_REGISTRAZIONE.md`](GUIDA_MANUALE_CORREZIONE_REGISTRAZIONE.md)
- **Test semplificato**: [`test-registration-manual.js`](test-registration-manual.js)
- **Schema database**: [`supabase/schema.sql`](supabase/schema.sql)

La soluzione manuale è più affidabile e facile da seguire rispetto agli script automatici che falliscono.