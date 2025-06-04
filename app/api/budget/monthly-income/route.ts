import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

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

    const incomeTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'INCOME',
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        amount: true,
      },
    });

    const totalIncome = incomeTransactions.reduce((sum, transaction) => {
      return sum + Number(transaction.amount); // amount è Decimal, converti a number
    }, 0);

    return NextResponse.json({ totalIncome });
  } catch (error) {
    console.error("Error in API /api/budget/monthly-income:", error);
    let errorMessage = 'Errore nel recupero delle entrate mensili';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage, details: error instanceof Error ? error.stack : null }, { status: 500 });
  }
}