import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Implementazione della sincronizzazione portfolio con Prisma
    // Questa funzione ricalcola gli holdings basandosi sulle transazioni finanziarie
    
    // 1. Ottieni tutte le transazioni finanziarie dell'utente
    const transactions = await prisma.financialTransaction.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        transactionDate: 'asc'
      }
    })

    // 2. Raggruppa le transazioni per asset (assetType + assetName + tickerSymbol)
    const holdingsMap = new Map<string, {
      assetType: string;
      assetName: string;
      tickerSymbol: string | null;
      totalQuantity: number;
      totalCost: number;
      transactions: any[];
    }>()

    transactions.forEach((transaction: any) => {
      const key = `${transaction.assetType}_${transaction.assetName}_${transaction.tickerSymbol || 'null'}`
      
      if (!holdingsMap.has(key)) {
        holdingsMap.set(key, {
          assetType: transaction.assetType,
          assetName: transaction.assetName,
          tickerSymbol: transaction.tickerSymbol,
          totalQuantity: 0,
          totalCost: 0,
          transactions: []
        })
      }

      const holding = holdingsMap.get(key)!
      holding.transactions.push(transaction)

      // Calcola quantità e costo basandosi sul tipo di transazione
      const quantity = Number(transaction.quantity || 0)
      const amount = Number(transaction.totalAmount)

      switch (transaction.transactionType) {
        case 'buy':
          holding.totalQuantity += quantity
          holding.totalCost += amount
          break
        case 'sell':
          holding.totalQuantity -= quantity
          // Per le vendite, riduciamo il costo proporzionalmente
          if (holding.totalQuantity > 0) {
            const costReduction = (quantity / (holding.totalQuantity + quantity)) * holding.totalCost
            holding.totalCost -= costReduction
          }
          break
        case 'dividend':
        case 'interest':
          // I dividendi riducono il costo medio senza cambiare la quantità
          holding.totalCost -= amount
          break
        case 'fee':
        case 'tax':
          // Fees e tasse aumentano il costo
          holding.totalCost += amount
          break
      }
    })

    // 3. Aggiorna o crea gli holdings nel database
    const updatedHoldings = []
    for (const [key, holdingData] of holdingsMap) {
      if (holdingData.totalQuantity <= 0) {
        // Se la quantità è 0 o negativa, elimina l'holding
        await prisma.portfolioHolding.deleteMany({
          where: {
            userId: session.user.id,
            assetType: holdingData.assetType,
            assetName: holdingData.assetName,
            tickerSymbol: holdingData.tickerSymbol
          }
        })
        continue
      }

      const averageCost = holdingData.totalCost / holdingData.totalQuantity

      const holding = await prisma.portfolioHolding.upsert({
        where: {
          userId_assetType_assetName_tickerSymbol: {
            userId: session.user.id,
            assetType: holdingData.assetType,
            assetName: holdingData.assetName,
            tickerSymbol: holdingData.tickerSymbol
          }
        },
        update: {
          totalQuantity: holdingData.totalQuantity,
          averageCost: averageCost,
          totalCost: holdingData.totalCost,
          lastUpdatedAt: new Date()
        },
        create: {
          userId: session.user.id,
          assetType: holdingData.assetType,
          assetName: holdingData.assetName,
          tickerSymbol: holdingData.tickerSymbol,
          totalQuantity: holdingData.totalQuantity,
          averageCost: averageCost,
          totalCost: holdingData.totalCost,
          lastUpdatedAt: new Date()
        }
      })

      updatedHoldings.push(holding)
    }

    // 4. Calcola le allocazioni
    const totalValue = updatedHoldings.reduce((sum, h) => sum + Number(h.currentValue || h.totalCost), 0)
    const allocations = new Map<string, number>()
    
    updatedHoldings.forEach(holding => {
      const value = Number(holding.currentValue || holding.totalCost)
      const current = allocations.get(holding.assetType) || 0
      allocations.set(holding.assetType, current + value)
    })

    const allocationData = Array.from(allocations.entries()).map(([assetType, value]) => ({
      asset_type: assetType,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
    }))

    return NextResponse.json({
      success: true,
      message: 'Portfolio sincronizzato con successo',
      holdings: updatedHoldings.map(h => ({
        id: h.id,
        asset_type: h.assetType,
        asset_name: h.assetName,
        ticker_symbol: h.tickerSymbol,
        total_quantity: Number(h.totalQuantity),
        average_cost: Number(h.averageCost),
        total_cost: Number(h.totalCost),
        current_price: h.currentPrice ? Number(h.currentPrice) : null,
        current_value: h.currentValue ? Number(h.currentValue) : null,
        last_updated: h.lastUpdatedAt.toISOString()
      })),
      allocations: allocationData,
      totalValue
    })

  } catch (error) {
    console.error('Errore nella sincronizzazione portfolio:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Ottieni tutti gli holdings dell'utente
    const holdings = await prisma.portfolioHolding.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        currentValue: 'desc'
      }
    })

    // Calcola le allocazioni
    const totalValue = holdings.reduce((sum: number, h: any) => sum + Number(h.currentValue || h.totalCost), 0)
    const allocationsMap = new Map<string, number>()
    
    holdings.forEach((holding: any) => {
      const value = Number(holding.currentValue || holding.totalCost)
      const current = allocationsMap.get(holding.assetType) || 0
      allocationsMap.set(holding.assetType, current + value)
    })

    const allocations = Array.from(allocationsMap.entries()).map(([assetType, value]) => ({
      asset_type: assetType,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
    }))

    // Formatta i dati per il frontend
    const formattedHoldings = holdings.map((holding: any) => ({
      id: holding.id,
      asset_type: holding.assetType,
      asset_name: holding.assetName,
      ticker_symbol: holding.tickerSymbol,
      total_quantity: Number(holding.totalQuantity),
      average_cost: Number(holding.averageCost),
      total_cost: Number(holding.totalCost),
      current_price: holding.currentPrice ? Number(holding.currentPrice) : null,
      current_value: holding.currentValue ? Number(holding.currentValue) : null,
      unrealized_gain_loss: holding.unrealizedGainLoss ? Number(holding.unrealizedGainLoss) : null,
      percentage_of_portfolio: holding.percentageOfPortfolio ? Number(holding.percentageOfPortfolio) : null,
      last_updated: holding.lastUpdatedAt.toISOString()
    }))

    return NextResponse.json({
      holdings: formattedHoldings,
      allocations,
      totalValue
    })

  } catch (error) {
    console.error('Errore nel recupero dati portfolio:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}