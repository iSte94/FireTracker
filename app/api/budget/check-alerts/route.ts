import { NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase-server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerComponentClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get active budgets
    const { data: budgets, error: budgetError } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'ACTIVE')

    if (budgetError) {
      console.error('Error fetching budgets:', budgetError)
      return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 })
    }

    const alerts = []
    const currentDate = new Date()

    for (const budget of budgets || []) {
      // Calculate period dates
      let startDate: Date = new Date()
      let endDate: Date = new Date()

      switch (budget.period) {
        case 'MONTHLY':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
          endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
          break
        case 'QUARTERLY':
          const quarter = Math.floor(currentDate.getMonth() / 3)
          startDate = new Date(currentDate.getFullYear(), quarter * 3, 1)
          endDate = new Date(currentDate.getFullYear(), quarter * 3 + 3, 0)
          break
        case 'YEARLY':
          startDate = new Date(currentDate.getFullYear(), 0, 1)
          endDate = new Date(currentDate.getFullYear(), 11, 31)
          break
      }

      // Get spending for this category and period
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('category', budget.category)
        .eq('type', 'EXPENSE')
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())

      if (transError) {
        console.error('Error fetching transactions:', transError)
        continue
      }

      const totalSpent = transactions?.reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0) || 0
      const percentageUsed = (totalSpent / budget.amount) * 100

      // Check if we need to create alerts
      const existingAlerts = await supabase
        .from('budget_alerts')
        .select('alert_type')
        .eq('budget_id', budget.id)
        .gte('created_at', startDate.toISOString())

      const existingAlertTypes = existingAlerts.data?.map((a: any) => a.alert_type) || []

      // Check for budget exceeded
      if (percentageUsed >= 100 && !existingAlertTypes.includes('BUDGET_EXCEEDED')) {
        alerts.push({
          budget_id: budget.id,
          user_id: user.id,
          alert_type: 'BUDGET_EXCEEDED',
          percentage_used: percentageUsed,
          message: `Il budget per ${budget.category} è stato superato! Hai speso €${totalSpent.toFixed(2)} su un budget di €${budget.amount.toFixed(2)}.`
        })
      }
      // Check for threshold reached
      else if (percentageUsed >= budget.alert_threshold && 
               percentageUsed < 100 && 
               !existingAlertTypes.includes('THRESHOLD_REACHED')) {
        alerts.push({
          budget_id: budget.id,
          user_id: user.id,
          alert_type: 'THRESHOLD_REACHED',
          percentage_used: percentageUsed,
          message: `Attenzione! Hai raggiunto il ${percentageUsed.toFixed(0)}% del budget per ${budget.category}.`
        })
      }

      // Check for period ending (last 3 days)
      const daysUntilEnd = Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntilEnd <= 3 && daysUntilEnd > 0 && !existingAlertTypes.includes('PERIOD_ENDING')) {
        alerts.push({
          budget_id: budget.id,
          user_id: user.id,
          alert_type: 'PERIOD_ENDING',
          percentage_used: percentageUsed,
          message: `Il periodo del budget per ${budget.category} termina tra ${daysUntilEnd} giorni. Hai utilizzato il ${percentageUsed.toFixed(0)}% del budget.`
        })
      }
    }

    // Insert new alerts
    if (alerts.length > 0) {
      const { error: insertError } = await supabase
        .from('budget_alerts')
        .insert(alerts)

      if (insertError) {
        console.error('Error inserting alerts:', insertError)
        return NextResponse.json({ error: "Failed to create alerts" }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      success: true, 
      alertsCreated: alerts.length 
    })

  } catch (error) {
    console.error('Error in check-alerts:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}