import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { BudgetPeriod, BudgetStatus } from "@prisma/client";
import { Budget } from "../route"; // Importa l'interfaccia Budget dal route.ts genitore

// Interfaccia per l'input dell'aggiornamento (da budget-client.ts)
export interface UpdateBudgetInput {
  category?: string;
  amount?: number;
  period?: BudgetPeriod;
  start_date?: string; // ISO Date string
  end_date?: string; // ISO Date string
  is_recurring?: boolean;
  notes?: string;
  alert_threshold?: number;
  shared_with?: string[];
  status?: BudgetStatus;
  goal_id?: string;
}

interface RouteParams {
  params: {
    budgetId: string;
  }
}

// PUT: Aggiorna un budget esistente
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const { budgetId } = params;

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const input: UpdateBudgetInput = await req.json();

    // Verifica che il budget esista e appartenga all'utente
    const existingBudget = await prisma.budget.findUnique({
      where: { id: budgetId },
    });

    if (!existingBudget) {
      return NextResponse.json({ error: 'Budget non trovato' }, { status: 404 });
    }
    if (existingBudget.userId !== userId) {
      return NextResponse.json({ error: 'Non autorizzato a modificare questo budget' }, { status: 403 });
    }

    const updateData: any = {};
    if (input.category !== undefined) updateData.category = input.category;
    if (input.amount !== undefined) updateData.amount = input.amount; // Prisma gestisce number to Decimal
    if (input.period !== undefined) updateData.period = input.period;
    if (input.start_date !== undefined) updateData.startDate = new Date(input.start_date);
    if (input.end_date !== undefined) updateData.endDate = input.end_date ? new Date(input.end_date) : null;
    if (input.is_recurring !== undefined) updateData.isRecurring = input.is_recurring;
    if (input.notes !== undefined) updateData.notes = input.notes || null;
    if (input.alert_threshold !== undefined) updateData.alertThreshold = input.alert_threshold; // Prisma gestisce number to Decimal
    if (input.shared_with !== undefined) updateData.sharedWith = JSON.stringify(input.shared_with || []);
    if (input.status !== undefined) updateData.status = input.status;
    if (input.goal_id !== undefined) updateData.goalId = input.goal_id || null;
    
    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: 'Nessun dato fornito per l\'aggiornamento' }, { status: 400 });
    }
    updateData.updatedAt = new Date(); // Aggiorna manualmente updatedAt

    const updatedBudgetPrisma = await prisma.budget.update({
      where: { id: budgetId },
      data: updateData,
    });

    const resultBudget: Budget = {
        id: updatedBudgetPrisma.id,
        created_at: updatedBudgetPrisma.createdAt,
        updated_at: updatedBudgetPrisma.updatedAt,
        user_id: updatedBudgetPrisma.userId,
        category: updatedBudgetPrisma.category,
        amount: Number(updatedBudgetPrisma.amount),
        period: updatedBudgetPrisma.period,
        start_date: updatedBudgetPrisma.startDate,
        end_date: updatedBudgetPrisma.endDate,
        is_recurring: updatedBudgetPrisma.isRecurring,
        notes: updatedBudgetPrisma.notes,
        alert_threshold: Number(updatedBudgetPrisma.alertThreshold),
        shared_with: JSON.parse(updatedBudgetPrisma.sharedWith || '[]'),
        goal_id: updatedBudgetPrisma.goalId,
        status: updatedBudgetPrisma.status,
    };

    return NextResponse.json(resultBudget);
  } catch (error) {
    console.error(`Error in API PUT /api/budget/${budgetId}:`, error);
    let errorMessage = "Errore nell'aggiornamento del budget";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage, details: error instanceof Error ? error.stack : null }, { status: 500 });
  }
}

// DELETE: Elimina un budget
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const { budgetId } = params;

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    // Verifica che il budget esista e appartenga all'utente
    const budgetToDelete = await prisma.budget.findUnique({
      where: { id: budgetId },
    });

    if (!budgetToDelete) {
      return NextResponse.json({ error: 'Budget non trovato' }, { status: 404 });
    }
    if (budgetToDelete.userId !== userId) {
      return NextResponse.json({ error: 'Non autorizzato a eliminare questo budget' }, { status: 403 });
    }

    await prisma.budget.delete({
      where: { id: budgetId },
    });

    return NextResponse.json({ message: 'Budget eliminato con successo' }, { status: 200 }); // o 204 No Content
  } catch (error) {
    console.error(`Error in API DELETE /api/budget/${budgetId}:`, error);
    let errorMessage = "Errore nell'eliminazione del budget";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage, details: error instanceof Error ? error.stack : null }, { status: 500 });
  }
}