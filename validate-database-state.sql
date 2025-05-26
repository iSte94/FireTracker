-- Script SQL per validare lo stato del database e identificare il problema
-- Esegui questo script nell'SQL Editor di Supabase per raccogliere informazioni

-- Test 1: Verificare se il trigger esiste ancora
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table, 
  action_statement,
  action_timing,
  action_condition
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created' 
  AND event_object_table = 'users'
  AND event_object_schema = 'auth';

-- Test 2: Verificare se la funzione handle_new_user esiste
SELECT 
  routine_name, 
  routine_type, 
  routine_schema,
  security_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
  AND routine_schema = 'public';

-- Test 3: Verificare la struttura della tabella profiles
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test 4: Verificare le foreign key constraints sulla tabella profiles
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'profiles';

-- Test 5: Verificare le policy RLS sulla tabella profiles
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'profiles'
  AND schemaname = 'public';

-- Test 6: Verificare se ci sono profili orfani (senza utente corrispondente)
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.created_at,
  'ORPHANED PROFILE' as status
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL
LIMIT 10;

-- Test 7: Verificare se ci sono utenti senza profilo
SELECT 
  u.id,
  u.email,
  u.created_at,
  'USER WITHOUT PROFILE' as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
  AND u.created_at > NOW() - INTERVAL '1 day' -- solo utenti recenti
LIMIT 10;

-- Test 8: Verificare l'ID specifico dal messaggio di errore
SELECT 
  'CHECKING SPECIFIC ERROR ID: b77c80cd-1cda-49e5-b0e7-9cab66b7846b' as debug_info;

-- Verifica se questo ID esiste in auth.users
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data,
  'EXISTS IN AUTH.USERS' as status
FROM auth.users 
WHERE id = 'b77c80cd-1cda-49e5-b0e7-9cab66b7846b';

-- Verifica se questo ID esiste in profiles
SELECT 
  id,
  email,
  full_name,
  created_at,
  'EXISTS IN PROFILES' as status
FROM profiles 
WHERE id = 'b77c80cd-1cda-49e5-b0e7-9cab66b7846b';

-- Test 9: Contare i record nelle tabelle principali
SELECT 
  'auth.users' as table_name,
  COUNT(*) as record_count,
  MAX(created_at) as latest_record
FROM auth.users
UNION ALL
SELECT 
  'profiles' as table_name,
  COUNT(*) as record_count,
  MAX(created_at) as latest_record
FROM profiles;

-- Test 10: Verificare se ci sono stati inserimenti recenti che potrebbero causare conflitti
SELECT 
  'Recent registrations analysis' as info,
  u.id,
  u.email,
  u.created_at as user_created,
  p.created_at as profile_created,
  CASE 
    WHEN p.id IS NULL THEN 'MISSING_PROFILE'
    WHEN u.created_at = p.created_at THEN 'SYNC_CREATION'
    WHEN u.created_at < p.created_at THEN 'PROFILE_AFTER_USER'
    ELSE 'TIMING_ISSUE'
  END as creation_status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.created_at > NOW() - INTERVAL '1 hour'
ORDER BY u.created_at DESC
LIMIT 20;