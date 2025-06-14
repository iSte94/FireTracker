import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const { description, amount, category, type, date, notes } = body

    if (!description || amount === undefined || !category || !type || !date) {
      return NextResponse.json(
        { error: 'Campi richiesti: description, amount, category, type, date' },
        { status: 400 }
      )
    }

    // Crea la transazione
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        description,
        amount: Number(amount),
        category,
        type: type === 'INCOME' ? 'INCOME' : 'EXPENSE',
        date: new Date(date),
        notes: notes || null
      }
    })

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        description: transaction.description,
        amount: Number(transaction.amount),
        category: transaction.category,
        type: transaction.type,
        date: transaction.date.toISOString().split('T')[0],
        notes: transaction.notes
      }
    })
  } catch (error) {
    console.error('Errore nella creazione della transazione:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Ottieni le transazioni dell'utente
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Formatta le transazioni per il frontend
    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      description: transaction.description,
      amount: Number(transaction.amount),
      category: transaction.category,
      type: transaction.type,
      date: transaction.date.toISOString().split('T')[0],
      notes: transaction.notes
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