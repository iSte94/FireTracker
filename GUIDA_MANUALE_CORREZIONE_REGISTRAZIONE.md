# 🔧 GUIDA MANUALE CORREZIONE REGISTRAZIONE

## Problema Identificato
Gli script automatici falliscono a causa di:
1. File SQL eseguito come JavaScript (`node .\fix-rls-insert-policy.sql`)
2. Errore "relation public.pg_policies does not exist" negli script di test
3. Funzione `public.sql(query)` non disponibile

**SOLUZIONE**: Applicare la correzione manualmente tramite Dashboard Supabase.

---

## 🎯 STEP 1: APPLICARE LA POLICY INSERT MANUALMENTE

### Accedere al Dashboard Supabase
1. Vai su [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Seleziona il tuo progetto
3. Nel menu laterale, clicca su **"SQL Editor"**

### Copiare e Incollare il SQL
Nel SQL Editor, copia e incolla esattamente questo codice:

```sql
-- CORREZIONE: Aggiunta policy RLS INSERT mancante per tabella profiles
CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);
```

### Eseguire il Query
1. Clicca il pulsante **"Run"** (o premi Ctrl+Enter)
2. Se vedi il messaggio "Success. No rows returned", la policy è stata creata correttamente
3. Se ricevi un errore "policy already exists", significa che è già presente

---

## 🔍 STEP 2: VERIFICARE CHE LA CORREZIONE SIA STATA APPLICATA

Sempre nel SQL Editor, esegui questa query di verifica:

```sql
-- Verifica che tutte le policy RLS siano presenti
SELECT 
  policyname, 
  cmd,
  CASE 
    WHEN cmd = 'SELECT' THEN qual
    WHEN cmd IN ('INSERT', 'UPDATE') THEN with_check
    ELSE 'N/A'
  END as condition
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND schemaname = 'public'
ORDER BY cmd;
```

### Risultato Atteso
Dovresti vedere 3 policy:
- **INSERT**: "Users can insert own profile" 
- **SELECT**: "Users can view own profile"
- **UPDATE**: "Users can update own profile"

Se manca una di queste policy, la registrazione non funzionerà.

---

## 🧪 STEP 3: TEST SEMPLIFICATO DELLA REGISTRAZIONE

Crea un file per testare solo la registrazione HTTP:

### Creare test-registration-manual.js
```javascript
const fetch = require('node-fetch');

async function testRegistration() {
  console.log('🧪 TEST SEMPLIFICATO REGISTRAZIONE\n');
  
  const testEmail = `test-${Date.now()}@example.com`;
  const testData = {
    email: testEmail,
    password: 'test123456!',
    fullName: 'Test User Manual'
  };
  
  console.log(`📧 Tentativo registrazione con: ${testEmail}`);
  
  try {
    const response = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    console.log('📝 Risposta API:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${result.success}`);
    
    if (result.success) {
      console.log('✅ REGISTRAZIONE FUNZIONA CORRETTAMENTE!');
      console.log(`   User ID: ${result.user?.id}`);
      console.log(`   Profile creato: ${!!result.profile}`);
    } else {
      console.log('❌ REGISTRAZIONE FALLITA:');
      console.log(`   Errore: ${result.error}`);
      if (result.details) {
        console.log(`   Dettagli: ${result.details}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Errore durante test:', error.message);
  }
}

testRegistration();
```

### Eseguire il Test
```bash
node test-registration-manual.js
```

---

## 🔍 STEP 4: VERIFICA DIRETTA VIA BROWSER

### Test Frontend
1. Assicurati che il server sia in esecuzione: `npm run dev`
2. Vai su `http://localhost:3000/register`
3. Prova a registrare un nuovo utente
4. Controlla la console del browser e i log del server per eventuali errori

---

## ✅ STEP 5: VERIFICA FUNZIONAMENTO COMPLETO

Se tutto funziona correttamente, dovresti vedere:

### Nel Test HTTP
```
✅ REGISTRAZIONE FUNZIONA CORRETTAMENTE!
   User ID: [uuid]
   Profile creato: true
```

### Nel Frontend
- Registrazione completata senza errori
- Redirect alla pagina di conferma email
- Nessun errore nella console

### Nei Log del Server
```
=== REGISTRATION FLOW DEBUG START ===
Email: test@example.com
Full Name: Test User
Step 1: Calling supabase.auth.signUp...
Step 2: Auth signUp result:
- User created: true
- User ID: [uuid]
- Error: None
Step 3: User created successfully, verifying profile creation...
Step 4: Profile verification:
- Profile created by trigger: true
- Profile data: {id: "[uuid]", email: "test@example.com", full_name: "Test User"}
- Profile error: None
Step 5: Registration completed successfully with automatic profile creation
```

---

## 🚨 TROUBLESHOOTING

### Se la Policy INSERT non può essere creata
```sql
-- Prima elimina la policy se esiste già
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Poi ricreala
CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);
```

### Se il Trigger non Funziona
Verifica che il trigger esista:
```sql
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

Se non esiste, crealo:
```sql
-- Crea la funzione handle_new_user se non esiste
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crea il trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Se Continui ad Avere Problemi
1. Verifica che RLS sia abilitato sulla tabella profiles:
   ```sql
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ```

2. Controlla che la tabella profiles esista:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'profiles';
   ```

---

## 📋 CHECKLIST FINALE

- [ ] Policy INSERT creata tramite Dashboard Supabase
- [ ] Verifica query mostra tutte e 3 le policy (INSERT, SELECT, UPDATE)
- [ ] Test HTTP risponde con success: true
- [ ] Registrazione frontend funziona senza errori
- [ ] Log del server mostrano creazione profilo automatica
- [ ] Nessun errore nella console del browser

**Quando tutti questi punti sono completati, la registrazione funziona correttamente!**