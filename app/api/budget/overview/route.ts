import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options"; // Percorso corretto per authOptions

// Definizione duplicata da budget-client.ts per ora, potrebbe essere centralizzata
interface BudgetOverviewItem {
  category: string;
  budget: number;
  spent: number;
  percentage: number;
  status: "safe" | "warning" | "danger";
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        startDate: {
          lte: endOfMonth,
        },
        OR: [
          { endDate: null },
          { endDate: { gte: startOfMonth } },
        ],
      },
    });

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        category: true,
        amount: true,
      },
    });

    const spendingByCategory = transactions.reduce((acc, transaction) => {
      const category = transaction.category || 'Senza Categoria'; // Fallback per categoria nulla
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += Math.abs(Number(transaction.amount));
      return acc;
    }, {} as Record<string, number>);

    const overview: BudgetOverviewItem[] = budgets.map((budget) => {
      const spent = spendingByCategory[budget.category] || 0;
      const budgetAmount = Number(budget.amount);
      const percentage = budgetAmount === 0 ? 0 : Math.min(100, (spent / budgetAmount) * 100);
      
      let status: "safe" | "warning" | "danger" = "safe";
      if (percentage >= 100) {
        status = "danger";
      } else if (percentage >= (budget.alertThreshold ? Number(budget.alertThreshold) : 80)) { // Usa alertThreshold se disponibile, convertito a numero
        status = "warning";
      }

      return {
        category: budget.category,
        budget: budgetAmount,
        spent,
        percentage: parseFloat(percentage.toFixed(1)), // Arrotonda a 1 decimale
        status,
      };
    });
    
    const sortedOverview = overview.sort((a, b) => a.category.localeCompare(b.category));
    return NextResponse.json(sortedOverview);
  } catch (error) {
    console.error("Error in API /api/budget/overview:", error);
    // Considera di loggare l'errore in modo più strutturato se necessario
    let errorMessage = 'Errore nel recupero della panoramica del budget';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage, details: error instanceof Error ? error.stack : null }, { status: 500 });
  }
}