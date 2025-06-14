import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Ottieni parametri opzionali dalla query
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100

    // Ottieni tutte le transazioni finanziarie dell'utente
    const transactions = await prisma.financialTransaction.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        transactionDate: 'desc'
      },
      take: limit
    })

    // Formatta i dati per il frontend (converte i campi Decimal in number)
    const formattedTransactions = transactions.map((transaction: any) => ({
      id: transaction.id,
      transaction_type: transaction.transactionType,
      asset_type: transaction.assetType,
      asset_name: transaction.assetName,
      ticker_symbol: transaction.tickerSymbol,
      quantity: transaction.quantity ? Number(transaction.quantity) : null,
      price_per_unit: transaction.pricePerUnit ? Number(transaction.pricePerUnit) : null,
      total_amount: Number(transaction.totalAmount),
      transaction_date: transaction.transactionDate.toISOString().split('T')[0],
      currency: transaction.currency,
      fees: Number(transaction.fees),
      notes: transaction.notes
    }))

    return NextResponse.json({
      transactions: formattedTransactions
    })
  } catch (error) {
    console.error('Errore nel recupero delle transazioni finanziarie:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const {
      transaction_type,
      asset_type,
      asset_name,
      ticker_symbol,
      quantity,
      price_per_unit,
      total_amount,
      transaction_date,
      currency = 'EUR',
      fees = 0,
      notes
    } = body

    if (!transaction_type || !asset_type || !asset_name || total_amount === undefined || !transaction_date) {
      return NextResponse.json(
        { error: 'Campi richiesti: transaction_type, asset_type, asset_name, total_amount, transaction_date' },
        { status: 400 }
      )
    }

    // Crea la transazione finanziaria
    const transaction = await prisma.financialTransaction.create({
      data: {
        userId: session.user.id,
        transactionType: transaction_type,
        assetType: asset_type,
        assetName: asset_name,
        tickerSymbol: ticker_symbol || null,
        quantity: quantity ? Number(quantity) : null,
        pricePerUnit: price_per_unit ? Number(price_per_unit) : null,
        totalAmount: Number(total_amount),
        transactionDate: new Date(transaction_date),
        currency,
        fees: Number(fees),
        notes: notes || null
      }
    })

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        transaction_type: transaction.transactionType,
        asset_type: transaction.assetType,
        asset_name: transaction.assetName,
        ticker_symbol: transaction.tickerSymbol,
        quantity: transaction.quantity ? Number(transaction.quantity) : null,
        price_per_unit: transaction.pricePerUnit ? Number(transaction.pricePerUnit) : null,
        total_amount: Number(transaction.totalAmount),
        transaction_date: transaction.transactionDate.toISOString().split('T')[0],
        currency: transaction.currency,
        fees: Number(transaction.fees),
        notes: transaction.notes
      }
    })
  } catch (error) {
    console.error('Errore nella creazione della transazione finanziaria:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}