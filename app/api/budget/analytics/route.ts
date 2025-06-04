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

  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') as 'month' | 'quarter' | 'year' | null;

  if (!period || !['month', 'quarter', 'year'].includes(period)) {
    return NextResponse.json({ error: "Periodo non valido. Scegliere tra 'month', 'quarter', 'year'." }, { status: 400 });
  }

  try {
    const currentDate = new Date();
    let startDate: Date;
    let monthsToAnalyze: number; // Rinominato per chiarezza

    switch (period) {
      case 'month':
        monthsToAnalyze = 6;
        // Inizia dal primo giorno di X mesi fa
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (monthsToAnalyze -1) , 1); 
        break;
      case 'quarter':
        monthsToAnalyze = 12; // 4 trimestri = 12 mesi
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (monthsToAnalyze -1), 1);
        break;
      case 'year':
        monthsToAnalyze = 24; // 2 anni = 24 mesi
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (monthsToAnalyze-1), 1);
        break;
      default: // Non dovrebbe mai arrivare qui a causa del check precedente
        return NextResponse.json({ error: "Periodo specificato non valido." }, { status: 400 });
    }
    
    // Assicurati che startDate non vada oltre il mese corrente se monthsToAnalyze è piccolo
    if (startDate > currentDate) {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    }


    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        date: {
          gte: startDate,
          lte: currentDate, // Fino alla data odierna
        },
      },
      select: {
        category: true,
        amount: true,
        date: true,
      },
      orderBy: {
        date: 'asc' // Ordina per data per un raggruppamento più semplice
      }
    });

    // Raggruppa per mese (YYYY-MM) e categoria
    const monthlyData: { [monthKey: string]: { [category: string]: number } } = {};

    transactions.forEach(transaction => {
      // Formatta la chiave del mese come YYYY-MM
      const monthKey = `${transaction.date.getFullYear()}-${String(transaction.date.getMonth() + 1).padStart(2, '0')}`;
      const category = transaction.category || 'Senza Categoria';
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {};
      }
      if (!monthlyData[monthKey][category]) {
        monthlyData[monthKey][category] = 0;
      }
      monthlyData[monthKey][category] += Math.abs(Number(transaction.amount));
    });

    // Prepara i mesi attesi nell'intervallo
    const expectedMonths: string[] = [];
    let tempDate = new Date(startDate);
    while(tempDate <= currentDate) {
        expectedMonths.push(`${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, '0')}`);
        tempDate.setMonth(tempDate.getMonth() + 1);
    }
    
    // Prendi solo gli ultimi 'monthsToAnalyze' mesi se ce ne sono di più
    const finalMonthKeys = expectedMonths.slice(-monthsToAnalyze);


    // Converte in formato per i grafici, assicurando che tutti i mesi nell'intervallo siano presenti
    const result = finalMonthKeys.map(monthKey => {
      const dataForMonth: any = { month: monthKey };
      const categoriesInMonth = monthlyData[monthKey] || {};
      
      // Aggiungi tutte le categorie trovate in questo mese
      Object.keys(categoriesInMonth).forEach(category => {
        dataForMonth[category] = categoriesInMonth[category];
      });
      return dataForMonth;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in API /api/budget/analytics:", error);
    let errorMessage = 'Errore nel recupero dei dati analitici del budget';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage, details: error instanceof Error ? error.stack : null }, { status: 500 });
  }
}