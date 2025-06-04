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

    // Ottieni le transazioni recenti (ultime 10)
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        date: 'desc'
      },
      take: 10
    })

    // Formatta le transazioni per il frontend
    const formattedTransactions = recentTransactions.map((transaction: any) => ({
      id: transaction.id,
      description: transaction.description,
      amount: Number(transaction.amount),
      date: transaction.date.toISOString().split('T')[0], // Formato YYYY-MM-DD
      category: transaction.category,
      type: transaction.type
    }))

    return NextResponse.json(formattedTransactions)
  } catch (error) {
    console.error('Errore nel recupero delle transazioni:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}