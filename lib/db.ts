import { createServerComponentClient } from "./supabase-server"
import { v4 as uuidv4 } from "uuid"

// Profile functions
export async function getProfile(userId: string) {
  const supabase = await createServerComponentClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching profile:", error)
    return null
  }

  return data
}

export async function updateProfile(userId: string, profileData: any) {
  const supabase = await createServerComponentClient()
  const { data, error } = await supabase.from("profiles").update(profileData).eq("id", userId).select().single()

  if (error) {
    console.error("Error updating profile:", error)
    return null
  }

  return data
}

// Net Worth functions
export async function getNetWorthHistory(userId: string) {
  const supabase = await createServerComponentClient()
  const { data, error } = await supabase
    .from("net_worth")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: true })

  if (error) {
    console.error("Error fetching net worth history:", error)
    return []
  }

  return data
}

export async function addNetWorthEntry(userId: string, amount: number, date: string, notes?: string) {
  const supabase = await createServerComponentClient()
  const { data, error } = await supabase
    .from("net_worth")
    .insert({
      id: uuidv4(),
      user_id: userId,
      amount,
      date,
      notes,
    })
    .select()
    .single()

  if (error) {
    console.error("Error adding net worth entry:", error)
    return null
  }

  return data
}

// Expenses functions
export async function getExpensesByCategory(userId: string) {
  const supabase = await createServerComponentClient()
  const { data, error } = await supabase.from("expenses").select("*").eq("user_id", userId)

  if (error) {
    console.error("Error fetching expenses:", error)
    return []
  }

  // Group expenses by category
  const expensesByCategory = data.reduce((acc: any, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0
    }
    acc[expense.category] += expense.amount
    return acc
  }, {})

  // Convert to array format for charts
  return Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
    color: getCategoryColor(name),
  }))
}

// Helper function to get a color for a category
function getCategoryColor(category: string) {
  const colors: { [key: string]: string } = {
    Casa: "#10b981",
    Cibo: "#3b82f6",
    Trasporti: "#f59e0b",
    Svago: "#8b5cf6",
    Bollette: "#ef4444",
    Altro: "#6b7280",
  }

  return colors[category] || "#6b7280" // Default to gray if category not found
}

export async function addExpense(userId: string, category: string, amount: number, date: string, notes?: string) {
  const supabase = await createServerComponentClient()
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      id: uuidv4(),
      user_id: userId,
      category,
      amount,
      date,
      notes,
    })
    .select()
    .single()

  if (error) {
    console.error("Error adding expense:", error)
    return null
  }

  return data
}

// Goals functions
export async function getGoals(userId: string) {
  const supabase = await createServerComponentClient()
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching goals:", error)
    return []
  }

  return data
}

export async function addGoal(
  userId: string,
  name: string,
  type: string,
  targetAmount: number,
  currentAmount: number,
  targetDate?: string,
  notes?: string,
) {
  const supabase = await createServerComponentClient()
  const { data, error } = await supabase
    .from("goals")
    .insert({
      id: uuidv4(),
      user_id: userId,
      name,
      type,
      target_amount: targetAmount,
      current_amount: currentAmount,
      target_date: targetDate,
      notes,
      status: "IN_PROGRESS",
    })
    .select()
    .single()

  if (error) {
    console.error("Error adding goal:", error)
    return null
  }

  return data
}

export async function updateGoal(goalId: string, goalData: any) {
  const supabase = await createServerComponentClient()
  const { data, error } = await supabase.from("goals").update(goalData).eq("id", goalId).select().single()

  if (error) {
    console.error("Error updating goal:", error)
    return null
  }

  return data
}

// Transactions functions
export async function getRecentTransactions(userId: string, limit = 10) {
  const supabase = await createServerComponentClient()
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching transactions:", error)
    return []
  }

  return data
}

export async function addTransaction(
  userId: string,
  description: string,
  amount: number,
  category: string,
  type: string,
  date: string,
  notes?: string,
) {
  const supabase = await createServerComponentClient()
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      id: uuidv4(),
      user_id: userId,
      description,
      amount,
      category,
      type,
      date,
      notes,
    })
    .select()
    .single()

  if (error) {
    console.error("Error adding transaction:", error)
    return null
  }

  return data
}
