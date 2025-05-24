import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Server-side helper per server components e route handlers
export async function createServerComponentClient() {
  console.log('=== CREATE SERVER COMPONENT CLIENT DEBUG ===');
  const cookieStore = await cookies()
  
  const allCookies = cookieStore.getAll();
  console.log('Total cookies found:', allCookies.length);
  
  const supabaseCookies = allCookies.filter(cookie =>
    cookie.name.includes('sb-') || cookie.name.includes('supabase')
  );
  console.log('Supabase cookies found:', supabaseCookies.length);
  supabaseCookies.forEach(cookie => {
    console.log(`  ${cookie.name}: ${cookie.value ? cookie.value.substring(0, 50) + '...' : 'empty'}`);
  });
  
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          const cookies = cookieStore.getAll();
          console.log('getAll() called, returning', cookies.length, 'cookies');
          return cookies;
        },
        setAll(cookiesToSet) {
          console.log('setAll() called with', cookiesToSet.length, 'cookies');
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              console.log(`Setting cookie: ${name}`);
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            console.log('Error setting cookies:', error.message);
            // Il metodo `set` è disponibile solo in Server Components
            // che stanno renderizzando. Ignoriamo l'errore in altri contesti.
          }
        },
      },
    }
  )
}

// Server-side helper per middleware
export function createMiddlewareClient(request: any, response: any) {
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({
              name,
              value,
              ...options,
            })
          })
        },
      },
    }
  )
}

// Server-side helper con service role (solo per operazioni amministrative)
export async function createServerAdminClient() {
  const cookieStore = await cookies()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
  }
  
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
  }
  
  return createServerClient<Database>(
    supabaseUrl,
    serviceRoleKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignoriamo l'errore in contesti non-rendering
          }
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}