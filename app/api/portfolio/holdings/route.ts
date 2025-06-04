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

    // Ottieni tutti gli holdings dell'utente
    const holdings = await prisma.portfolioHolding.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        currentValue: 'desc'
      }
    })

    // Formatta i dati per il frontend (converte i campi Decimal in number)
    const formattedHoldings = holdings.map((holding) => ({
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
      holdings: formattedHoldings
    })
  } catch (error) {
    console.error('Errore nel recupero degli holdings:', error)
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
      assetType,
      assetName,
      tickerSymbol,
      totalQuantity,
      averageCost,
      totalCost,
      currentPrice
    } = body

    if (!assetType || !assetName || totalQuantity === undefined || averageCost === undefined || totalCost === undefined) {
      return NextResponse.json(
        { error: 'Campi richiesti: assetType, assetName, totalQuantity, averageCost, totalCost' },
        { status: 400 }
      )
    }

    // Calcola valori derivati
    const currentValue = currentPrice ? Number(totalQuantity) * Number(currentPrice) : null
    const unrealizedGainLoss = currentValue ? currentValue - Number(totalCost) : null

    // Crea o aggiorna l'holding
    const holding = await prisma.portfolioHolding.upsert({
      where: {
        userId_assetType_assetName_tickerSymbol: {
          userId: session.user.id,
          assetType,
          assetName,
          tickerSymbol: tickerSymbol || null
        }
      },
      update: {
        totalQuantity: Number(totalQuantity),
        averageCost: Number(averageCost),
        totalCost: Number(totalCost),
        currentPrice: currentPrice ? Number(currentPrice) : null,
        currentValue,
        unrealizedGainLoss,
        lastUpdatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        assetType,
        assetName,
        tickerSymbol: tickerSymbol || null,
        totalQuantity: Number(totalQuantity),
        averageCost: Number(averageCost),
        totalCost: Number(totalCost),
        currentPrice: currentPrice ? Number(currentPrice) : null,
        currentValue,
        unrealizedGainLoss,
        lastUpdatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      holding: {
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
        last_updated: holding.lastUpdatedAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Errore nella creazione/aggiornamento holding:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}