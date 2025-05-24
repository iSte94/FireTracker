import { createServerComponentClient, createServerAdminClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    try {
      // Usa il client SSR per gestire correttamente i cookie
      const supabase = await createServerComponentClient()
      
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      console.log('=== CALLBACK DEBUG ===')
      console.log('Exchange code result - Error:', error)
      console.log('Exchange code result - Session presente:', !!data.session)
      console.log('Exchange code result - User presente:', !!data.user)
      
      if (error) {
        console.error('Auth exchange error:', error)
        return NextResponse.redirect(requestUrl.origin + "/login?error=auth_failed")
      }

      // Se l'utente è stato creato con successo, verifica che il profilo esista
      if (data.user) {
        // Usa il client admin per bypassare RLS
        const supabaseAdmin = await createServerAdminClient()
        
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
          } else {
            console.log('Profile created successfully for user:', data.user.id)
          }
        } else if (profile) {
          console.log('Profile already exists for user:', data.user.id)
        }
      }

      // Redirect to dashboard after successful authentication
      return NextResponse.redirect(requestUrl.origin + "/dashboard")
      
    } catch (err) {
      console.error('Callback error:', err)
      return NextResponse.redirect(requestUrl.origin + "/login?error=callback_failed")
    }
  }

  // Se non c'è un code, redirect al login
  return NextResponse.redirect(requestUrl.origin + "/login")
}
