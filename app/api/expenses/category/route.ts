import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { getCategorySpending } from '@/lib/budget-client'

export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Ottieni le spese per categoria
    const categorySpending = await getCategorySpending(session.user.id)

    return NextResponse.json(categorySpending)
  } catch (error) {
    console.error('Errore nel recupero delle spese per categoria:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}