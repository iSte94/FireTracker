import { createServerComponentClient, createServerAdminClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName } = body

    // Usa il client SSR per l'autenticazione
    const supabase = await createServerComponentClient()
    
    // Registra l'utente
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${request.headers.get('origin')}/auth/callback`,
      },
    })

    if (error) {
      console.error('Auth signup error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    if (data.user) {
      // Usa il client admin per creare il profilo (bypass RLS)
      const supabaseAdmin = await createServerAdminClient()
      
      // Aspetta un momento per assicurarsi che l'utente sia stato creato
      await new Promise(resolve => setTimeout(resolve, 500))

      try {
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: data.user.email || email,
              full_name: fullName,
              monthly_expenses: 2350,
              annual_expenses: 28200,
              current_age: 30,
              retirement_age: 65,
              swr_rate: 4,
              expected_return: 7,
              inflation_rate: 2
            }
          ])

        if (profileError && !profileError.message.includes('duplicate key')) {
          console.error('Profile creation error:', profileError)
          return NextResponse.json(
            { success: false, error: `Profile creation failed: ${profileError.message}` },
            { status: 500 }
          )
        }
        
        console.log('Profile created successfully for user:', data.user.id)
      } catch (profileErr) {
        console.error('Profile creation exception:', profileErr)
        return NextResponse.json(
          { success: false, error: 'Profile creation failed' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ 
      success: true, 
      user: data.user,
      message: 'User registered successfully' 
    })

  } catch (error) {
    console.error('Registration API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
