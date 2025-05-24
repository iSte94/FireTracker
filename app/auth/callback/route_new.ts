import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    try {
      // Client normale per l'auth
      const supabaseAuth = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      // Service role client per il database (bypass RLS)
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
      
      const { data, error } = await supabaseAuth.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth exchange error:', error)
        return NextResponse.redirect(requestUrl.origin + "/login?error=auth_failed")
      }

      // Se l'utente è stato creato con successo, verifica che il profilo esista
      if (data.user) {
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single()

        // Se il profilo non esiste, crealo
        if (!profile && profileError?.code === 'PGRST116') {
          const { error: insertError } = await supabaseAdmin
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                email: data.user.email || '',
                full_name: data.user.user_metadata?.full_name || '',
                monthly_expenses: 2350,
                annual_expenses: 28200,
                current_age: 30,
                retirement_age: 65,
                swr_rate: 4,
                expected_return: 7,
                inflation_rate: 2
              }
            ])

          if (insertError) {
            console.error('Profile creation error in callback:', insertError)
          }
        }
      }
    } catch (err) {
      console.error('Callback error:', err)
      return NextResponse.redirect(requestUrl.origin + "/login?error=callback_failed")
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin + "/dashboard")
}
