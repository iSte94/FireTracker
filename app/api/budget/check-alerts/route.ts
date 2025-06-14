import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
// Standard Prisma client imports.
// THESE WILL FAIL IF `npx prisma generate` HAS NOT RUN SUCCESSFULLY
// OR IF YOUR TYPESCRIPT SERVER NEEDS A RESTART.
import {
  Prisma, // For Prisma.Decimal, Prisma.validator, etc.
  BudgetStatus,
  FinancialTransactionType,
  BudgetPeriod,
  BudgetAlertType
} from "@prisma/client";

// Import model types
import type {
  Budget,
  BudgetAlert,
  FinancialTransaction // Using the direct model type
} from "@prisma/client";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id

    // Get active budgets
    const budgets: Budget[] = await prisma.budget.findMany({
      where: {
        userId: userId,
        status: BudgetStatus.ACTIVE, // Corrected to use uppercase
      },
    })

    // Ensure budgets is an array and not null/undefined before checking length
    if (!budgets) {
       console.error('Error fetching budgets or budgets is null/undefined');
       return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 });
    }
    if (budgets.length === 0) {
      console.log('No active budgets found for user:', userId);
      return NextResponse.json({
        success: true,
        alertsCreated: 0,
        message: "No active budgets found."
      });
    }

    const alertsToCreate: Prisma.BudgetAlertCreateManyInput[] = [];
    const currentDate = new Date()

    for (const budget of budgets) {
      // Calculate period dates
      let startDate: Date = new Date()
      let endDate: Date = new Date()

      switch (budget.period) {
        case BudgetPeriod.MONTHLY: // Corrected to use uppercase
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
          break;
        case BudgetPeriod.QUARTERLY: // Corrected to use uppercase
          const quarter = Math.floor(currentDate.getMonth() / 3);
          startDate = new Date(currentDate.getFullYear(), quarter * 3, 1);
          endDate = new Date(currentDate.getFullYear(), quarter * 3 + 3, 0);
          break;
        case BudgetPeriod.YEARLY: // Corrected to use uppercase
          startDate = new Date(currentDate.getFullYear(), 0, 1);
          endDate = new Date(currentDate.getFullYear(), 11, 31);
          break;
        default:
          console.warn(`Unhandled budget period: ${budget.period} for budget ID: ${budget.id}`);
          continue;
      }

      // Get spending for this category and period using the correct Transaction table
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: userId,
          category: budget.category,
          type: 'EXPENSE', // Use string literal for TransactionType.EXPENSE
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          amount: true,
        },
      })
      
      // Calculate total spent from Transaction table
      const totalSpent = transactions.reduce((sum, t: { amount: Prisma.Decimal | null }) => {
        const amountValue = t.amount ? parseFloat(t.amount.toString()) : 0; // Convert Decimal to number
        return sum + Math.abs(amountValue);
      }, 0);

      const budgetAmountNumber = parseFloat(budget.amount.toString()); // budget.amount is Decimal
      const percentageUsed = budgetAmountNumber > 0 ? (totalSpent / budgetAmountNumber) * 100 : 0;

      // Check if we need to create alerts
      const existingAlerts = await prisma.budgetAlert.findMany({
        where: {
          budgetId: budget.id,
          createdAt: {
            gte: startDate,
          },
        },
        select: {
          alertType: true,
        },
      })
      
      const existingAlertTypes = existingAlerts.map((a) => a.alertType)

      // Check for budget exceeded
      if (percentageUsed >= 100 && !existingAlertTypes.includes(BudgetAlertType.BUDGET_EXCEEDED)) { // Corrected enum
        alertsToCreate.push({
          budgetId: budget.id,
          userId: userId,
          alertType: BudgetAlertType.BUDGET_EXCEEDED, // Corrected enum
          percentageUsed: new Prisma.Decimal(percentageUsed),
          message: `Il budget per ${budget.category} è stato superato! Hai speso €${totalSpent.toFixed(2)} su un budget di €${budgetAmountNumber.toFixed(2)}.`
        })
      }
      // Check for threshold reached
      // budget.alertThreshold is Prisma.Decimal, convert to number for comparison
      else if (budget.alertThreshold && percentageUsed >= parseFloat(budget.alertThreshold.toString()) &&
               percentageUsed < 100 &&
               !existingAlertTypes.includes(BudgetAlertType.THRESHOLD_REACHED)) { // Corrected enum
        alertsToCreate.push({
          budgetId: budget.id,
          userId: userId,
          alertType: BudgetAlertType.THRESHOLD_REACHED, // Corrected enum
          percentageUsed: new Prisma.Decimal(percentageUsed),
          message: `Attenzione! Hai raggiunto il ${percentageUsed.toFixed(0)}% del budget per ${budget.category}.`
        });
      }

      // Check for period ending (last 3 days)
      const daysUntilEnd = Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntilEnd <= 3 && daysUntilEnd > 0 && !existingAlertTypes.includes(BudgetAlertType.PERIOD_ENDING)) { // Corrected enum
        alertsToCreate.push({
          budgetId: budget.id,
          userId: userId,
          alertType: BudgetAlertType.PERIOD_ENDING, // Corrected enum
          percentageUsed: new Prisma.Decimal(percentageUsed),
          message: `Il periodo del budget per ${budget.category} termina tra ${daysUntilEnd} giorni. Hai utilizzato il ${percentageUsed.toFixed(0)}% del budget.`
        })
      }
    }

    // Insert new alerts
    if (alertsToCreate.length > 0) {
      const { count } = await prisma.budgetAlert.createMany({
        data: alertsToCreate,
      })

      if (count !== alertsToCreate.length) {
        console.error('Error inserting some alerts, expected', alertsToCreate.length, 'created', count)
        // Non necessariamente un errore fatale, ma da loggare
      }
    }

    return NextResponse.json({
      success: true,
      alertsCreated: alertsToCreate.length,
    })

  } catch (error) {
    console.error('Error in check-alerts:', error)
    const errorMessage = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}