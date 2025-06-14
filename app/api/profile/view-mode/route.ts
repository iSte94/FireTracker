import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true }
    })

    if (!user) {
      return NextResponse.json({ error: "Utente non trovato" }, { status: 404 })
    }

    return NextResponse.json({
      viewMode: user.profile?.viewMode || 'fire_budget'
    })
  } catch (error) {
    console.error("Errore nel recupero view mode:", error)
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 })
    }

    const { viewMode } = await request.json()

    if (!viewMode || !['fire_only', 'fire_budget'].includes(viewMode)) {
      return NextResponse.json({ error: "ViewMode non valido" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: "Utente non trovato" }, { status: 404 })
    }

    await prisma.profile.upsert({
      where: { id: user.id },
      update: { viewMode },
      create: {
        id: user.id,
        email: session.user.email!,
        viewMode
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Errore nell'aggiornamento view mode:", error)
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 })
  }
}