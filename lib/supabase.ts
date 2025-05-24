// Re-export delle funzioni client (safe per componenti client)
export { createClientComponentClient, supabase } from './supabase-client'

// Re-export delle funzioni server (richiedono next/headers)
export { 
  createServerComponentClient, 
  createServerAdminClient, 
  createMiddlewareClient 
} from './supabase-server'
