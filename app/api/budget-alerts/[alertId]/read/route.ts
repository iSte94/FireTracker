import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

interface RouteParams {
  params: {
    alertId: string;
  }
}

// PUT: Segna un alert come letto
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const { alertId } = params;

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    // Verifica che l'alert esista e appartenga all'utente
    const alertToUpdate = await prisma.budgetAlert.findUnique({
      where: { id: alertId },
    });

    if (!alertToUpdate) {
      return NextResponse.json({ error: 'Alert non trovato' }, { status: 404 });
    }
    if (alertToUpdate.userId !== userId) {
      return NextResponse.json({ error: 'Non autorizzato a modificare questo alert' }, { status: 403 });
    }

    // Se l'alert è già letto, non fare nulla (o restituisci l'alert aggiornato)
    if (alertToUpdate.isRead) {
        // Restituisce 200 OK con l'alert già aggiornato o un messaggio specifico
        return NextResponse.json({ message: 'Alert già segnato come letto', alert: alertToUpdate }, { status: 200 });
    }

    const updatedAlert = await prisma.budgetAlert.update({
      where: { id: alertId },
      data: { isRead: true }, // Prisma gestisce updatedAt automaticamente
    });

    return NextResponse.json(updatedAlert);
  } catch (error) {
    console.error(`Error in API PUT /api/budget-alerts/${alertId}/read:`, error);
    let errorMessage = "Errore nel segnare l'alert come letto";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage, details: error instanceof Error ? error.stack : null }, { status: 500 });
  }
}