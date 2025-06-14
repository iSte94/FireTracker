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
    
    const body = await request.json()
    const { userId, email, fullName } = body

    // Verifica se il profilo esiste già
    const existingProfile = await prisma.profile.findUnique({
      where: {
        id: userId || session.user.id
      }
    })

    if (existingProfile) {
      return NextResponse.json({ success: true, message: 'Profile already exists' })
    }

    // Crea il profilo
    const newProfile = await prisma.profile.create({
      data: {
        id: userId || session.user.id,
        email: email || session.user.email || '',
        fullName: fullName,
        monthlyExpenses: 2350,
        annualExpenses: 28200,
        currentAge: 30,
        retirementAge: 65,
        swrRate: 4,
        expectedReturn: 7,
        inflationRate: 2
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Profile created successfully',
      profile: newProfile
    })

  } catch (error) {
    console.error('API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
