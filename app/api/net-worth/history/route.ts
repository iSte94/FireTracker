import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Ottieni lo storico del patrimonio netto degli ultimi 12 mesi
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    const netWorthHistory = await prisma.netWorth.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: oneYearAgo
        }
      },
      orderBy: {
        date: 'asc'
      },
      select: {
        date: true,
        amount: true,
        notes: true
      }
    })

    // Formatta le date per il frontend
    const formattedHistory = netWorthHistory.map(entry => ({
      date: entry.date.toISOString().split('T')[0], // Formato YYYY-MM-DD
      amount: Number(entry.amount),
      notes: entry.notes
    }))

    return NextResponse.json(formattedHistory)
  } catch (error) {
    console.error('Errore nel recupero dello storico patrimonio netto:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}