import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { BudgetPeriod, BudgetStatus } from "@prisma/client";

// Interfacce da budget-client.ts (potrebbero essere centralizzate)
export interface Budget {
  id: string;
  created_at: Date;
  updated_at: Date;
  user_id: string;
  category: string;
  amount: number;
  period: BudgetPeriod;
  start_date: Date;
  end_date?: Date | null;
  is_recurring: boolean;
  notes?: string | null;
  alert_threshold: number;
  shared_with: string[]; // JSON string nel DB, array qui
  goal_id?: string | null;
  status: BudgetStatus | null; // Modificato per permettere null
}

export interface CreateBudgetInput {
  // user_id sarà preso dalla sessione
  category: string;
  amount: number;
  period: BudgetPeriod;
  start_date: string; // ISO Date string
  end_date?: string; // ISO Date string
  is_recurring: boolean;
  notes?: string;
  alert_threshold: number;
  shared_with: string[];
  status: BudgetStatus; // Input richiede uno status, non nullo
  goal_id?: string;
}

// GET: Ottiene tutti i budget di un utente
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const budgetsPrisma = await prisma.budget.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const budgets: Budget[] = budgetsPrisma.map(b => ({
      id: b.id,
      created_at: b.createdAt,
      updated_at: b.updatedAt,
      user_id: b.userId,
      category: b.category,
      amount: Number(b.amount), // Decimal to number
      period: b.period,
      start_date: b.startDate,
      end_date: b.endDate,
      is_recurring: b.isRecurring,
      notes: b.notes,
      alert_threshold: Number(b.alertThreshold), // Decimal to number
      shared_with: JSON.parse(b.sharedWith || '[]'), 
      goal_id: b.goalId,
      status: b.status, // Ora compatibile con BudgetStatus | null
    }));

    return NextResponse.json(budgets);
  } catch (error) {
    console.error("Error in API GET /api/budget:", error);
    let errorMessage = 'Errore nel recupero dei budget';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage, details: error instanceof Error ? error.stack : null }, { status: 500 });
  }
}

// POST: Crea un nuovo budget
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const input: CreateBudgetInput = await req.json();

    if (!input.category || typeof input.amount !== 'number' || !input.period || !input.start_date || !input.status) {
        return NextResponse.json({ error: 'Dati mancanti o non validi per la creazione del budget (category, amount, period, start_date, status sono obbligatori)' }, { status: 400 });
    }

    const newBudgetPrisma = await prisma.budget.create({
      data: {
        userId: userId,
        category: input.category,
        amount: input.amount, 
        period: input.period,
        startDate: new Date(input.start_date),
        endDate: input.end_date ? new Date(input.end_date) : null,
        isRecurring: input.is_recurring,
        notes: input.notes || null,
        alertThreshold: input.alert_threshold, 
        sharedWith: JSON.stringify(input.shared_with || []),
        status: input.status, // input.status è BudgetStatus, quindi non nullo
        goalId: input.goal_id || null,
      },
    });

    const newBudget: Budget = {
        id: newBudgetPrisma.id,
        created_at: newBudgetPrisma.createdAt,
        updated_at: newBudgetPrisma.updatedAt,
        user_id: newBudgetPrisma.userId,
        category: newBudgetPrisma.category,
        amount: Number(newBudgetPrisma.amount),
        period: newBudgetPrisma.period,
        start_date: newBudgetPrisma.startDate,
        end_date: newBudgetPrisma.endDate,
        is_recurring: newBudgetPrisma.isRecurring,
        notes: newBudgetPrisma.notes,
        alert_threshold: Number(newBudgetPrisma.alertThreshold),
        shared_with: JSON.parse(newBudgetPrisma.sharedWith || '[]'),
        goal_id: newBudgetPrisma.goalId,
        status: newBudgetPrisma.status, // Ora compatibile con BudgetStatus | null
    };

    return NextResponse.json(newBudget, { status: 201 });
  } catch (error) {
    console.error("Error in API POST /api/budget:", error);
    let errorMessage = 'Errore nella creazione del budget';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage, details: error instanceof Error ? error.stack : null }, { status: 500 });
  }
}