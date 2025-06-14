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

    const profile = await prisma.profile.findUnique({
      where: {
        id: session.user.id
      }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }

    // Converte i campi del database in camelCase per il frontend
    const formattedProfile = {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      monthlyExpenses: Number(profile.monthlyExpenses) || 2350,
      annualExpenses: Number(profile.annualExpenses) || 28200,
      currentAge: profile.currentAge || 30,
      retirementAge: profile.retirementAge || 65,
      swrRate: Number(profile.swrRate) || 4,
      expectedReturn: Number(profile.expectedReturn) || 7,
      inflationRate: Number(profile.inflationRate) || 2,
      viewMode: profile.viewMode || 'fire_budget'
    }

    return NextResponse.json(formattedProfile)
  } catch (error) {
    console.error('Errore nel recupero del profilo:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const {
      fullName,
      monthlyExpenses,
      annualExpenses,
      currentAge,
      retirementAge,
      swrRate,
      expectedReturn,
      inflationRate,
      viewMode
    } = body

    const updatedProfile = await prisma.profile.update({
      where: {
        id: session.user.id
      },
      data: {
        fullName,
        monthlyExpenses,
        annualExpenses,
        currentAge,
        retirementAge,
        swrRate,
        expectedReturn,
        inflationRate,
        viewMode
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Profilo aggiornato con successo',
      profile: updatedProfile
    })
  } catch (error) {
    console.error('Errore nell\'aggiornamento del profilo:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}