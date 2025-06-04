import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Password attuale e nuova password sono richieste' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'La nuova password deve essere di almeno 6 caratteri' },
        { status: 400 }
      )
    }

    // Recupera l'utente con la password corrente
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      select: {
        id: true,
        password: true
      }
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Utente non trovato o password non impostata' },
        { status: 404 }
      )
    }

    // Verifica che la password attuale sia corretta
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Password attuale non corretta' },
        { status: 400 }
      )
    }

    // Hash della nuova password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // Aggiorna la password nel database
    await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        password: hashedNewPassword
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Password cambiata con successo'
    })
  } catch (error) {
    console.error('Errore nel cambio password:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}