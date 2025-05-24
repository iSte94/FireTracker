import { createClientComponentClient } from "./supabase-client"

export interface Budget {
  id: string
  user_id: string
  category: string
  amount: number
  period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  start_date: string
  end_date?: string
  is_recurring: boolean
  notes?: string
  alert_threshold: number
  shared_with: string[]
  goal_id?: string
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED'
  created_at: string
  updated_at: string
}

export interface BudgetAlert {
  id: string
  budget_id: string
  user_id: string
  alert_type: 'THRESHOLD_REACHED' | 'BUDGET_EXCEEDED' | 'PERIOD_ENDING'
  percentage_used: number
  message: string
  is_read: boolean
  created_at: string
}

// Get budget overview with spending data
export async function getBudgetOverview(userId: string) {
  const supabase = createClientComponentClient()
  
  // Get current month's budgets
  const currentDate = new Date()
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  
  // Get active budgets
  const { data: budgets, error: budgetError } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'ACTIVE')
    .lte('start_date', endOfMonth.toISOString())
    .or(`end_date.is.null,end_date.gte.${startOfMonth.toISOString()}`)
  
  if (budgetError) {
    console.error('Error fetching budgets:', budgetError)
    return []
  }
  
  // Get spending for each category
  const { data: transactions, error: transError } = await supabase
    .from('transactions')
    .select('category, amount')
    .eq('user_id', userId)
    .eq('type', 'EXPENSE')
    .gte('date', startOfMonth.toISOString())
    .lte('date', endOfMonth.toISOString())
  
  if (transError) {
    console.error('Error fetching transactions:', transError)
    return []
  }
  
  // Calculate spending by category
  const spendingByCategory = transactions?.reduce((acc: any, trans) => {
    if (!acc[trans.category]) {
      acc[trans.category] = 0
    }
    acc[trans.category] += Math.abs(trans.amount)
    return acc
  }, {}) || {}
  
  // Combine budget and spending data
  return budgets?.map(budget => {
    const spent = spendingByCategory[budget.category] || 0
    const percentage = (spent / budget.amount) * 100
    let status: 'safe' | 'warning' | 'danger' = 'safe'
    
    if (percentage >= 100) {
      status = 'danger'
    } else if (percentage >= budget.alert_threshold) {
      status = 'warning'
    }
    
    return {
      category: budget.category,
      budget: budget.amount,
      spent,
      percentage: Math.min(percentage, 100),
      status
    }
  }) || []
}

// Get category spending for pie chart
export async function getCategorySpending(userId: string) {
  const supabase = createClientComponentClient()
  
  const currentDate = new Date()
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('category, amount')
    .eq('user_id', userId)
    .eq('type', 'EXPENSE')
    .gte('date', startOfMonth.toISOString())
    .lte('date', endOfMonth.toISOString())
  
  if (error) {
    console.error('Error fetching transactions:', error)
    return []
  }
  
  // Group by category
  const spendingByCategory = transactions?.reduce((acc: any, trans) => {
    if (!acc[trans.category]) {
      acc[trans.category] = 0
    }
    acc[trans.category] += Math.abs(trans.amount)
    return acc
  }, {}) || {}
  
  // Convert to array format with colors
  const categoryColors: { [key: string]: string } = {
    Casa: "#10b981",
    Cibo: "#3b82f6",
    Trasporti: "#f59e0b",
    Svago: "#8b5cf6",
    Bollette: "#ef4444",
    Entrate: "#06b6d4",
    Altro: "#6b7280",
  }
  
  return Object.entries(spendingByCategory).map(([name, value]) => ({
    name,
    value: value as number,
    color: categoryColors[name] || "#6b7280"
  }))
}

// Get all budgets
export async function getBudgets(userId: string) {
  const supabase = createClientComponentClient()
  
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .order('category', { ascending: true })
  
  if (error) {
    console.error('Error fetching budgets:', error)
    return []
  }
  
  return data as Budget[]
}

// Create a new budget
export async function createBudget(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClientComponentClient()
  
  const { data, error } = await supabase
    .from('budgets')
    .insert(budget)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating budget:', error)
    throw error
  }
  
  return data as Budget
}

// Update a budget
export async function updateBudget(id: string, updates: Partial<Budget>) {
  const supabase = createClientComponentClient()
  
  const { data, error } = await supabase
    .from('budgets')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating budget:', error)
    throw error
  }
  
  return data as Budget
}

// Delete a budget
export async function deleteBudget(id: string) {
  const supabase = createClientComponentClient()
  
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting budget:', error)
    throw error
  }
}

// Get budget alerts
export async function getBudgetAlerts(userId: string) {
  const supabase = createClientComponentClient()
  
  const { data, error } = await supabase
    .from('budget_alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching alerts:', error)
    return []
  }
  
  return data as BudgetAlert[]
}

// Mark alert as read
export async function markAlertAsRead(alertId: string) {
  const supabase = createClientComponentClient()
  
  const { error } = await supabase
    .from('budget_alerts')
    .update({ is_read: true })
    .eq('id', alertId)
  
  if (error) {
    console.error('Error marking alert as read:', error)
    throw error
  }
}

// Get budget analytics data
export async function getBudgetAnalytics(userId: string, period: 'month' | 'quarter' | 'year') {
  const supabase = createClientComponentClient()
  
  const currentDate = new Date()
  let startDate: Date
  let endDate = new Date()
  
  switch (period) {
    case 'month':
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1)
      break
    case 'quarter':
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 11, 1)
      break
    case 'year':
      startDate = new Date(currentDate.getFullYear() - 2, 0, 1)
      break
  }
  
  // Get historical spending data
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('date, category, amount')
    .eq('user_id', userId)
    .eq('type', 'EXPENSE')
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString())
    .order('date', { ascending: true })
  
  if (error) {
    console.error('Error fetching analytics data:', error)
    return []
  }
  
  // Group by month and category
  const monthlyData: { [key: string]: { [category: string]: number } } = {}
  
  transactions?.forEach(trans => {
    const monthKey = new Date(trans.date).toISOString().slice(0, 7)
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {}
    }
    if (!monthlyData[monthKey][trans.category]) {
      monthlyData[monthKey][trans.category] = 0
    }
    monthlyData[monthKey][trans.category] += Math.abs(trans.amount)
  })
  
  return Object.entries(monthlyData).map(([month, categories]) => ({
    month,
    ...categories
  }))
}