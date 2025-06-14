import { prisma } from "@/lib/prisma"
import { BudgetPeriod, BudgetStatus, BudgetAlertType } from "@prisma/client"

// Tipi per i Budget
export interface Budget {
  id: string
  created_at: Date
  updated_at: Date
  user_id: string
  category: string
  amount: number
  period: BudgetPeriod
  start_date: Date
  end_date?: Date | null
  is_recurring: boolean
  notes?: string | null
  alert_threshold: number
  shared_with: string[]
  goal_id?: string | null
  status: BudgetStatus
}

// Tipi per gli Alert Budget
export interface BudgetAlert {
  id: string
  created_at: Date
  budget_id: string
  user_id: string
  alert_type: BudgetAlertType
  percentage_used?: number | null
  message?: string | null
  is_read: boolean
}

// Input per la creazione di Budget
export interface CreateBudgetInput {
  user_id: string
  category: string
  amount: number
  period: BudgetPeriod
  start_date: string
  end_date?: string
  is_recurring: boolean
  notes?: string
  alert_threshold: number
  shared_with: string[]
  status: BudgetStatus
  goal_id?: string
}

// Input per l'aggiornamento di Budget
export interface UpdateBudgetInput {
  category?: string
  amount?: number
  period?: BudgetPeriod
  start_date?: string
  end_date?: string
  is_recurring?: boolean
  notes?: string
  alert_threshold?: number
  shared_with?: string[]
  status?: BudgetStatus
  goal_id?: string
}

interface BudgetOverviewItem {
  category: string
  budget: number
  spent: number
  percentage: number
  status: "safe" | "warning" | "danger"
}

interface CategorySpending {
  name: string
  value: number
  color: string
}

/**
 * Ottiene una panoramica del budget per un utente
 */
export async function getBudgetOverview(userId: string): Promise<BudgetOverviewItem[]> {
  try {
    // Ottieni tutti i budget attivi dell'utente
    const currentDate = new Date()
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

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
    })

    // Ottieni le spese per categoria nel periodo corrente
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
    })

    // Calcola spese per categoria
    const spendingByCategory = transactions.reduce((acc, transaction) => {
      if (!acc[transaction.category]) {
        acc[transaction.category] = 0
      }
      acc[transaction.category] += Math.abs(Number(transaction.amount))
      return acc
    }, {} as Record<string, number>)

    // Combina budget con spese effettive
    const overview: BudgetOverviewItem[] = budgets.map((budget) => {
      const spent = spendingByCategory[budget.category] || 0
      const budgetAmount = Number(budget.amount)
      const percentage = budgetAmount === 0 ? 0 : Math.min(100, (spent / budgetAmount) * 100)
      
      let status: "safe" | "warning" | "danger" = "safe"
      if (percentage >= 100) {
        status = "danger"
      } else if (percentage >= 80) {
        status = "warning"
      }

      return {
        category: budget.category,
        budget: budgetAmount,
        spent,
        percentage,
        status,
      }
    })

    return overview.sort((a, b) => a.category.localeCompare(b.category))
  } catch (error) {
    console.error("Error getting budget overview:", error)
    return []
  }
}

/**
 * Ottiene la distribuzione delle spese per categoria
 */
export async function getCategorySpending(userId: string): Promise<CategorySpending[]> {
  try {
    const currentDate = new Date()
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

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
    })

    // Raggruppa per categoria
    const spendingByCategory = transactions.reduce((acc, transaction) => {
      if (!acc[transaction.category]) {
        acc[transaction.category] = 0
      }
      acc[transaction.category] += Math.abs(Number(transaction.amount))
      return acc
    }, {} as Record<string, number>)

    // Definisci colori per le categorie
    const categoryColors: Record<string, string> = {
      Casa: "#3b82f6",
      Cibo: "#10b981",
      Trasporti: "#f59e0b",
      Svago: "#ef4444",
      Bollette: "#8b5cf6",
      Entrate: "#06d6a0",
      Altro: "#64748b",
    }

    const defaultColors = [
      "#3b82f6", "#10b981", "#f59e0b", "#ef4444", 
      "#8b5cf6", "#06d6a0", "#64748b", "#f97316"
    ]

    // Converti in formato per il grafico
    const categorySpending: CategorySpending[] = Object.entries(spendingByCategory)
      .map(([category, amount], index) => ({
        name: category,
        value: amount,
        color: categoryColors[category] || defaultColors[index % defaultColors.length],
      }))
      .sort((a, b) => b.value - a.value) // Ordina per importo decrescente

    return categorySpending
  } catch (error) {
    console.error("Error getting category spending:", error)
    return []
  }
}

/**
 * Ottiene il totale delle entrate per un utente nel mese corrente
 */
export async function getMonthlyIncome(userId: string): Promise<number> {
  try {
    const currentDate = new Date()
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

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
    })

    const totalIncome = incomeTransactions.reduce((sum, transaction) => {
      return sum + Number(transaction.amount)
    }, 0)

    return totalIncome
  } catch (error) {
    console.error("Error getting monthly income:", error)
    return 0
  }
}

/**
 * Ottiene il totale delle spese per un utente nel mese corrente
 */
export async function getMonthlyExpenses(userId: string): Promise<number> {
  try {
    const currentDate = new Date()
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    const expenseTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        amount: true,
      },
    })

    const totalExpenses = expenseTransactions.reduce((sum, transaction) => {
      return sum + Math.abs(Number(transaction.amount))
    }, 0)

    return totalExpenses
  } catch (error) {
    console.error("Error getting monthly expenses:", error)
    return 0
  }
}

/**
 * Calcola il tasso di risparmio per un utente
 */
export async function getSavingsRate(userId: string): Promise<number> {
  try {
    const income = await getMonthlyIncome(userId)
    const expenses = await getMonthlyExpenses(userId)

    if (income === 0) return 0

    const savingsRate = ((income - expenses) / income) * 100
    return Math.max(0, savingsRate)
  } catch (error) {
    console.error("Error calculating savings rate:", error)
    return 0
  }
}

// ===== FUNZIONI CRUD PER BUDGET =====

/**
 * Crea un nuovo budget
 */
export async function createBudget(input: CreateBudgetInput): Promise<Budget> {
  try {
    const budget = await prisma.budget.create({
      data: {
        userId: input.user_id,
        category: input.category,
        amount: input.amount,
        period: input.period,
        startDate: new Date(input.start_date),
        endDate: input.end_date ? new Date(input.end_date) : null,
        isRecurring: input.is_recurring,
        notes: input.notes || null,
        alertThreshold: input.alert_threshold,
        sharedWith: JSON.stringify(input.shared_with),
        status: input.status,
        goalId: input.goal_id || null,
      },
    })

    return {
      id: budget.id,
      created_at: budget.createdAt,
      updated_at: budget.updatedAt,
      user_id: budget.userId,
      category: budget.category,
      amount: Number(budget.amount),
      period: budget.period,
      start_date: budget.startDate,
      end_date: budget.endDate,
      is_recurring: budget.isRecurring,
      notes: budget.notes,
      alert_threshold: Number(budget.alertThreshold),
      shared_with: JSON.parse(budget.sharedWith),
      goal_id: budget.goalId,
      status: budget.status!,
    }
  } catch (error) {
    console.error("Error creating budget:", error)
    throw new Error("Errore nella creazione del budget")
  }
}

/**
 * Ottiene tutti i budget di un utente
 */
export async function getBudgets(userId: string): Promise<Budget[]> {
  try {
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return budgets.map(budget => ({
      id: budget.id,
      created_at: budget.createdAt,
      updated_at: budget.updatedAt,
      user_id: budget.userId,
      category: budget.category,
      amount: Number(budget.amount),
      period: budget.period,
      start_date: budget.startDate,
      end_date: budget.endDate,
      is_recurring: budget.isRecurring,
      notes: budget.notes,
      alert_threshold: Number(budget.alertThreshold),
      shared_with: JSON.parse(budget.sharedWith),
      goal_id: budget.goalId,
      status: budget.status!,
    }))
  } catch (error) {
    console.error("Error getting budgets:", error)
    return []
  }
}

/**
 * Aggiorna un budget esistente
 */
export async function updateBudget(budgetId: string, input: UpdateBudgetInput): Promise<Budget> {
  try {
    const updateData: any = {}

    if (input.category !== undefined) updateData.category = input.category
    if (input.amount !== undefined) updateData.amount = input.amount
    if (input.period !== undefined) updateData.period = input.period
    if (input.start_date !== undefined) updateData.startDate = new Date(input.start_date)
    if (input.end_date !== undefined) updateData.endDate = input.end_date ? new Date(input.end_date) : null
    if (input.is_recurring !== undefined) updateData.isRecurring = input.is_recurring
    if (input.notes !== undefined) updateData.notes = input.notes || null
    if (input.alert_threshold !== undefined) updateData.alertThreshold = input.alert_threshold
    if (input.shared_with !== undefined) updateData.sharedWith = JSON.stringify(input.shared_with)
    if (input.status !== undefined) updateData.status = input.status
    if (input.goal_id !== undefined) updateData.goalId = input.goal_id || null

    const budget = await prisma.budget.update({
      where: { id: budgetId },
      data: updateData,
    })

    return {
      id: budget.id,
      created_at: budget.createdAt,
      updated_at: budget.updatedAt,
      user_id: budget.userId,
      category: budget.category,
      amount: Number(budget.amount),
      period: budget.period,
      start_date: budget.startDate,
      end_date: budget.endDate,
      is_recurring: budget.isRecurring,
      notes: budget.notes,
      alert_threshold: Number(budget.alertThreshold),
      shared_with: JSON.parse(budget.sharedWith),
      goal_id: budget.goalId,
      status: budget.status!,
    }
  } catch (error) {
    console.error("Error updating budget:", error)
    throw new Error("Errore nell'aggiornamento del budget")
  }
}

/**
 * Elimina un budget
 */
export async function deleteBudget(budgetId: string): Promise<void> {
  try {
    await prisma.budget.delete({
      where: { id: budgetId },
    })
  } catch (error) {
    console.error("Error deleting budget:", error)
    throw new Error("Errore nell'eliminazione del budget")
  }
}

// ===== FUNZIONI PER BUDGET ALERTS =====

/**
 * Ottiene tutti gli alert budget di un utente
 */
export async function getBudgetAlerts(userId: string): Promise<BudgetAlert[]> {
  try {
    const alerts = await prisma.budgetAlert.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return alerts.map(alert => ({
      id: alert.id,
      created_at: alert.createdAt,
      budget_id: alert.budgetId,
      user_id: alert.userId,
      alert_type: alert.alertType,
      percentage_used: alert.percentageUsed ? Number(alert.percentageUsed) : null,
      message: alert.message,
      is_read: alert.isRead,
    }))
  } catch (error) {
    console.error("Error getting budget alerts:", error)
    return []
  }
}

/**
 * Segna un alert come letto
 */
export async function markAlertAsRead(alertId: string): Promise<void> {
  try {
    await prisma.budgetAlert.update({
      where: { id: alertId },
      data: { isRead: true },
    })
  } catch (error) {
    console.error("Error marking alert as read:", error)
    throw new Error("Errore nel segnare l'alert come letto")
  }
}

/**
 * Crea un nuovo alert budget
 */
export async function createBudgetAlert(
  budgetId: string,
  userId: string,
  alertType: BudgetAlertType,
  message: string,
  percentageUsed?: number
): Promise<BudgetAlert> {
  try {
    const alert = await prisma.budgetAlert.create({
      data: {
        budgetId,
        userId,
        alertType,
        message,
        percentageUsed: percentageUsed || null,
        isRead: false,
      },
    })

    return {
      id: alert.id,
      created_at: alert.createdAt,
      budget_id: alert.budgetId,
      user_id: alert.userId,
      alert_type: alert.alertType,
      percentage_used: alert.percentageUsed ? Number(alert.percentageUsed) : null,
      message: alert.message,
      is_read: alert.isRead,
    }
  } catch (error) {
    console.error("Error creating budget alert:", error)
    throw new Error("Errore nella creazione dell'alert")
  }
}

// ===== FUNZIONI PER ANALYTICS =====

/**
 * Ottiene i dati analitici del budget per un utente
 */
export async function getBudgetAnalytics(userId: string, period: 'month' | 'quarter' | 'year'): Promise<any[]> {
  try {
    const currentDate = new Date()
    let startDate: Date
    let months: number

    // Determina il periodo di analisi
    switch (period) {
      case 'month':
        months = 6
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - months, 1)
        break
      case 'quarter':
        months = 12
        startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1)
        break
      case 'year':
        months = 24
        startDate = new Date(currentDate.getFullYear() - 2, currentDate.getMonth(), 1)
        break
    }

    // Ottieni tutte le transazioni nel periodo
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        date: {
          gte: startDate,
          lte: currentDate,
        },
      },
      select: {
        category: true,
        amount: true,
        date: true,
      },
    })

    // Raggruppa per mese e categoria
    const monthlyData: { [key: string]: { [category: string]: number } } = {}

    transactions.forEach(transaction => {
      const monthKey = `${transaction.date.getFullYear()}-${String(transaction.date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {}
      }
      
      if (!monthlyData[monthKey][transaction.category]) {
        monthlyData[monthKey][transaction.category] = 0
      }
      
      monthlyData[monthKey][transaction.category] += Math.abs(Number(transaction.amount))
    })

    // Converte in formato per i grafici
    const result = Object.keys(monthlyData)
      .sort()
      .slice(-months)
      .map(monthKey => {
        const data: any = { month: monthKey }
        Object.keys(monthlyData[monthKey]).forEach(category => {
          data[category] = monthlyData[monthKey][category]
        })
        return data
      })

    return result
  } catch (error) {
    console.error("Error getting budget analytics:", error)
    return []
  }
}