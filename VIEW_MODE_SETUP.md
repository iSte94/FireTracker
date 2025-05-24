# Setup Modalità di Visualizzazione (View Mode)

Questa guida spiega come configurare la funzionalità di modalità di visualizzazione che permette agli utenti di scegliere tra "Solo FIRE" e "FIRE & Budget".

## Migrazioni Database

Esegui questi comandi SQL nel tuo database Supabase per aggiungere il supporto per la modalità di visualizzazione:

### 1. Aggiungi il campo view_mode alla tabella profiles

```sql
-- File: supabase/add-view-mode-field.sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS view_mode TEXT DEFAULT 'fire_budget' 
CHECK (view_mode IN ('fire_only', 'fire_budget'));

COMMENT ON COLUMN profiles.view_mode IS 'Modalità di visualizzazione dell''applicazione: fire_only (Solo FIRE) o fire_budget (FIRE & Budget)';
```

### 2. Aggiorna la funzione handle_new_user

```sql
-- File: supabase/update-handle-new-user.sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (
    id, 
    email, 
    full_name, 
    avatar_url, 
    monthly_expenses, 
    annual_expenses, 
    current_age, 
    retirement_age, 
    swr_rate, 
    expected_return, 
    inflation_rate,
    view_mode
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    2350,
    28200,
    30,
    65,
    4,
    7,
    2,
    'fire_budget' -- Default view mode
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Funzionalità Implementate

### 1. Toggle nelle Impostazioni del Profilo
- Aggiunta una nuova tab "Preferenze" nella pagina del profilo
- Toggle switch per cambiare tra le due modalità
- Descrizioni chiare in italiano per ogni modalità

### 2. ViewModeProvider
- Context provider globale che gestisce la modalità selezionata
- Sincronizzazione automatica con il database
- Hook utili: `useViewMode()`, `useIsFireOnly()`, `useIsFireBudget()`

### 3. Integrazione nell'Header
- Il link "Budget" viene nascosto automaticamente in modalità "Solo FIRE"
- La navigazione si adatta dinamicamente alla modalità selezionata

## Come Utilizzare

### Nel codice dei componenti:

```tsx
import { useIsFireBudget, useIsFireOnly } from "@/components/providers/view-mode-provider"

function MyComponent() {
  const isFireBudget = useIsFireBudget()
  const isFireOnly = useIsFireOnly()

  return (
    <div>
      {isFireBudget && (
        <div>Contenuto visibile solo in modalità FIRE & Budget</div>
      )}
      
      {isFireOnly && (
        <div>Contenuto visibile solo in modalità Solo FIRE</div>
      )}
    </div>
  )
}
```

### Per accedere alla modalità corrente:

```tsx
import { useViewMode } from "@/components/providers/view-mode-provider"

function MyComponent() {
  const { viewMode, setViewMode, isLoading } = useViewMode()
  
  // viewMode può essere 'fire_only' o 'fire_budget'
  console.log("Modalità corrente:", viewMode)
}
```

## Modalità Disponibili

1. **Solo FIRE** (`fire_only`)
   - Focus esclusivo sull'indipendenza finanziaria
   - Nasconde le funzionalità di budget
   - Mostra solo metriche FIRE, calcolatori e patrimonio netto

2. **FIRE & Budget** (`fire_budget`)
   - Visualizzazione completa di tutte le funzionalità
   - Include gestione budget, categorie di spesa e analisi dettagliate
   - Modalità predefinita per i nuovi utenti

## Note Importanti

- Il valore predefinito per i nuovi utenti è `fire_budget`
- Gli utenti esistenti manterranno la modalità `fire_budget` finché non la cambiano manualmente
- La modalità viene salvata nel profilo utente e persiste tra le sessioni
- Il cambio di modalità è immediato e non richiede refresh della pagina