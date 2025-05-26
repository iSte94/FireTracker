-- Script per pulire e allineare i dati del database
-- Esegui questo nello SQL Editor di Supabase DOPO aver riattivato il trigger

-- 1. Identifica gli utenti in auth.users che non hanno un profilo corrispondente
SELECT 
    'Utenti senza profilo:' as check_type,
    au.id,
    au.email,
    au.created_at,
    au.raw_user_meta_data->>'full_name' as full_name
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 2. Identifica i profili che non hanno un utente corrispondente (orphaned profiles)
SELECT 
    'Profili orfani:' as check_type,
    p.id,
    p.email,
    p.full_name,
    p.created_at
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.id IS NULL;

-- 3. Crea profili mancanti per gli utenti esistenti
-- Questo dovrebbe essere eseguito solo se ci sono utenti senza profili
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
    inflation_rate
)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', 'Utente') as full_name,
    au.raw_user_meta_data->>'avatar_url',
    2350, -- Default monthly expenses
    28200, -- Default annual expenses
    30, -- Default current age
    65, -- Default retirement age
    4, -- Default SWR rate
    7, -- Default expected return
    2 -- Default inflation rate
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 4. Verifica finale: conta gli utenti e i profili
SELECT 
    'Conteggio finale' as check_type,
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM profiles) as total_profiles,
    (SELECT COUNT(*) FROM auth.users au LEFT JOIN profiles p ON au.id = p.id WHERE p.id IS NULL) as users_without_profiles,
    (SELECT COUNT(*) FROM profiles p LEFT JOIN auth.users au ON p.id = au.id WHERE au.id IS NULL) as orphaned_profiles;

-- Messaggio di conferma
SELECT 'Database cleanup completato. Verifica i conteggi sopra per assicurarti che users_without_profiles e orphaned_profiles siano 0.' as result;