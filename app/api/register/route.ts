import { createServerComponentClient, createServerAdminClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName } = body

    console.log('=== REGISTRATION FLOW DEBUG START ===')
    console.log('Email:', email)
    console.log('Full Name:', fullName)

    // Usa il client SSR per l'autenticazione
    const supabase = await createServerComponentClient()
    
    console.log('Step 1: Calling supabase.auth.signUp...')
    
    // Registra l'utente - il trigger automatico creerà il profilo
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

    console.log('Step 2: Auth signUp result:')
    console.log('- User created:', !!data.user)
    console.log('- User ID:', data.user?.id)
    console.log('- Error:', error?.message || 'None')

    if (error) {
      console.error('Auth signup error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { success: false, error: 'Utente non creato correttamente' },
        { status: 400 }
      )
    }

    console.log('Step 3: User created successfully, verifying profile creation...')
    
    // Usa il client admin per verificare che il profilo sia stato creato dal trigger
    const supabaseAdmin = await createServerAdminClient()
    
    // Attende un breve momento per permettere al trigger di eseguire
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Verifica che il profilo sia stato creato dal trigger
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', data.user.id)
      .single()
    
    console.log('Step 4: Profile verification:')
    console.log('- Profile created by trigger:', !!profile)
    console.log('- Profile data:', profile)
    console.log('- Profile error:', profileError?.message || 'None')
    
    if (profileError || !profile) {
      console.error('Profile not created by trigger:', profileError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Errore nella creazione del profilo. Il trigger automatico potrebbe non essere attivo.',
          details: profileError?.message 
        },
        { status: 500 }
      )
    }

    console.log('Step 5: Registration completed successfully with automatic profile creation')

    return NextResponse.json({ 
      success: true, 
      user: data.user,
      profile: profile,
      message: 'Utente registrato con successo. Profilo creato automaticamente dal trigger.' 
    })

  } catch (error) {
    console.error('Registration API error:', error)
    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
