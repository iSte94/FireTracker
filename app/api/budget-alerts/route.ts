import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { BudgetAlertType } from "@prisma/client";

// Interfaccia da budget-client.ts (potrebbe essere centralizzata)
export interface BudgetAlert {
  id: string;
  created_at: Date;
  budget_id: string;
  user_id: string;
  alert_type: BudgetAlertType;
  percentage_used?: number | null;
  message?: string | null;
  is_read: boolean;
}

export interface CreateBudgetAlertInput {
  // user_id sarà preso dalla sessione
  budget_id: string;
  alert_type: BudgetAlertType;
  message: string;
  percentage_used?: number;
}

// GET: Ottiene tutti gli alert budget di un utente
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const alertsPrisma = await prisma.budgetAlert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const alerts: BudgetAlert[] = alertsPrisma.map(a => ({
      id: a.id,
      created_at: a.createdAt,
      budget_id: a.budgetId,
      user_id: a.userId,
      alert_type: a.alertType,
      percentage_used: a.percentageUsed ? Number(a.percentageUsed) : null, // Decimal to number
      message: a.message,
      is_read: a.isRead,
    }));

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Error in API GET /api/budget-alerts:", error);
    let errorMessage = "Errore nel recupero degli alert del budget";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage, details: error instanceof Error ? error.stack : null }, { status: 500 });
  }
}

// POST: Crea un nuovo alert budget
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const input: CreateBudgetAlertInput = await req.json();

    if (!input.budget_id || !input.alert_type || !input.message) {
        return NextResponse.json({ error: 'Dati mancanti o non validi per la creazione dell\'alert' }, { status: 400 });
    }
    
    // Opzionale: Verificare che il budgetId appartenga all'utente
    const budget = await prisma.budget.findUnique({ where: { id: input.budget_id }});
    if (!budget || budget.userId !== userId) {
        return NextResponse.json({ error: 'Budget non trovato o non autorizzato' }, { status: 403 });
    }

    const newAlertPrisma = await prisma.budgetAlert.create({
      data: {
        userId: userId, // Assicurati che l'alert sia associato all'utente corretto
        budgetId: input.budget_id,
        alertType: input.alert_type,
        message: input.message,
        percentageUsed: input.percentage_used || null, // Prisma gestisce number to Decimal
        isRead: false, // Gli alert sono creati come non letti
      },
    });

    const newAlert: BudgetAlert = {
        id: newAlertPrisma.id,
        created_at: newAlertPrisma.createdAt,
        budget_id: newAlertPrisma.budgetId,
        user_id: newAlertPrisma.userId,
        alert_type: newAlertPrisma.alertType,
        percentage_used: newAlertPrisma.percentageUsed ? Number(newAlertPrisma.percentageUsed) : null,
        message: newAlertPrisma.message,
        is_read: newAlertPrisma.isRead,
    };

    return NextResponse.json(newAlert, { status: 201 });
  } catch (error) {
    console.error("Error in API POST /api/budget-alerts:", error);
    let errorMessage = "Errore nella creazione dell'alert del budget";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage, details: error instanceof Error ? error.stack : null }, { status: 500 });
  }
}