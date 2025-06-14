import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { 
  calculateFireNumber, 
  calculateCoastFireNumber, 
  calculateBaristaFireNumber,
  getCurrentNetWorth,
  getAnnualExpenses 
} from '@/lib/fire-calculations'

export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Ottieni il profilo utente per i dati FIRE
    const profile = await prisma.profile.findUnique({
      where: { id: session.user.id }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }

    // Calcola il patrimonio netto corrente
    const currentNetWorth = await getCurrentNetWorth(session.user.id)
    
    // Calcola le spese annuali
    const annualExpenses = await getAnnualExpenses(session.user.id)
    
    // Calcola i target FIRE
    const fireTarget = calculateFireNumber(annualExpenses, Number(profile.swrRate || 4))
    const coastFireTarget = calculateCoastFireNumber(
      annualExpenses,
      Number(profile.swrRate || 4),
      Number(profile.currentAge || 30),
      Number(profile.retirementAge || 65),
      Number(profile.expectedReturn || 7)
    )
    const baristaFireTarget = calculateBaristaFireNumber(
      annualExpenses,
      Number(profile.swrRate || 4),
      15000 // Valore di fallback per part-time income
    )

    // Calcola i progressi
    const fireProgress = fireTarget > 0 ? (currentNetWorth / fireTarget) * 100 : 0
    const coastFireProgress = coastFireTarget > 0 ? (currentNetWorth / coastFireTarget) * 100 : 0
    const baristaFireProgress = baristaFireTarget > 0 ? (currentNetWorth / baristaFireTarget) * 100 : 0

    const progressData = {
      fireProgress: Math.max(0, fireProgress),
      coastFireProgress: Math.max(0, coastFireProgress),
      baristaFireProgress: Math.max(0, baristaFireProgress),
      fireTarget,
      coastFireTarget,
      baristaFireTarget,
      currentNetWorth,
      annualExpenses
    }

    return NextResponse.json(progressData)
  } catch (error) {
    console.error('Errore nel calcolo dei progressi FIRE:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}