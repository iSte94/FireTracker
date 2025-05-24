import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const body = await request.json()
    const { userId, email, fullName } = body

    // Verifica se il profilo esiste già
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      return NextResponse.json({ success: true, message: 'Profile already exists' })
    }

    // Crea il profilo
    const { error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          email: email,
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

    if (error) {
      console.error('Profile creation error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Profile created successfully' })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
