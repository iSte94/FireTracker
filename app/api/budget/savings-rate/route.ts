import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

async function getMonthlyIncomeForUser(userId: string): Promise<number> {
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const incomeTransactions = await prisma.transaction.findMany({
    where: { userId, type: 'INCOME', date: { gte: startOfMonth, lte: endOfMonth } },
    select: { amount: true },
  });
  return incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
}

async function getMonthlyExpensesForUser(userId: string): Promise<number> {
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const expenseTransactions = await prisma.transaction.findMany({
    where: { userId, type: 'EXPENSE', date: { gte: startOfMonth, lte: endOfMonth } },
    select: { amount: true },
  });
  return expenseTransactions.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const income = await getMonthlyIncomeForUser(userId);
    const expenses = await getMonthlyExpensesForUser(userId);

    if (income === 0) {
      return NextResponse.json({ savingsRate: 0 });
    }

    const savingsRate = ((income - expenses) / income) * 100;
    // Math.max(0, savingsRate) per non avere tassi negativi se le spese superano le entrate
    // Arrotondiamo a un decimale per consistenza
    return NextResponse.json({ savingsRate: parseFloat(Math.max(0, savingsRate).toFixed(1)) });

  } catch (error) {
    console.error("Error in API /api/budget/savings-rate:", error);
    let errorMessage = 'Errore nel calcolo del tasso di risparmio';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage, details: error instanceof Error ? error.stack : null }, { status: 500 });
  }
}