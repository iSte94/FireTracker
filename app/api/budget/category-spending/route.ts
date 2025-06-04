import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

// Definizione duplicata da budget-client.ts
interface CategorySpending {
  name: string;
  value: number;
  color: string;
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
      const category = transaction.category || 'Senza Categoria';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += Math.abs(Number(transaction.amount));
      return acc;
    }, {} as Record<string, number>);

    // Definisci colori per le categorie (come in budget-client)
    const categoryColors: Record<string, string> = {
      Casa: "#3b82f6",
      Cibo: "#10b981",
      Trasporti: "#f59e0b",
      Svago: "#ef4444",
      Bollette: "#8b5cf6",
      Entrate: "#06d6a0", // Anche se qui filtriamo per EXPENSE, lo manteniamo per coerenza se la logica dovesse cambiare
      Altro: "#64748b",
    };
    const defaultColors = [
      "#3b82f6", "#10b981", "#f59e0b", "#ef4444", 
      "#8b5cf6", "#06d6a0", "#64748b", "#f97316"
    ];

    const categorySpendingData: CategorySpending[] = Object.entries(spendingByCategory)
      .map(([category, amount], index) => ({
        name: category,
        value: amount,
        color: categoryColors[category] || defaultColors[index % defaultColors.length],
      }))
      .sort((a, b) => b.value - a.value);

    return NextResponse.json(categorySpendingData);
  } catch (error) {
    console.error("Error in API /api/budget/category-spending:", error);
    let errorMessage = 'Errore nel recupero della spesa per categoria';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage, details: error instanceof Error ? error.stack : null }, { status: 500 });
  }
}