"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getBudgetOverview, getCategorySpending } from "@/lib/budget-client"
import { createClientComponentClient } from "@/lib/supabase-client"
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

interface BudgetData {
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

const COLORS = {
  safe: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
}

export default function BudgetOverview() {
  const [budgetData, setBudgetData] = useState<BudgetData[]>([])
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadBudgetData()
  }, [])

  const loadBudgetData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const overview = await getBudgetOverview(user.id)
      const spending = await getCategorySpending(user.id)
      
      setBudgetData(overview)
      setCategorySpending(spending)
    } catch (error) {
      console.error("Error loading budget data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Caricamento...</div>
  }

  const totalBudget = budgetData.reduce((sum, item) => sum + item.budget, 0)
  const totalSpent = budgetData.reduce((sum, item) => sum + item.spent, 0)
  const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Budget Progress by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Budget per Categoria</CardTitle>
          <CardDescription>
            Progresso delle spese rispetto al budget pianificato
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {budgetData.map((item) => (
            <div key={item.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.category}</span>
                  {item.status === "warning" && (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                  {item.status === "danger" && (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  €{item.spent.toFixed(2)} / €{item.budget.toFixed(2)}
                </span>
              </div>
              <Progress
                value={item.percentage}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{item.percentage.toFixed(0)}% utilizzato</span>
                <span>€{(item.budget - item.spent).toFixed(2)} rimanenti</span>
              </div>
            </div>
          ))}
          
          {/* Total Progress */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Totale</span>
              <span className="text-sm font-medium">
                €{totalSpent.toFixed(2)} / €{totalBudget.toFixed(2)}
              </span>
            </div>
            <Progress
              value={totalPercentage}
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>

      {/* Spending Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuzione Spese</CardTitle>
          <CardDescription>
            Come sono distribuite le tue spese per categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categorySpending}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categorySpending.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `€${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Budget vs Actual Comparison */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Budget vs Spese Effettive</CardTitle>
          <CardDescription>
            Confronto tra budget pianificato e spese reali
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value: number) => `€${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
              <Bar dataKey="spent" fill="#10b981" name="Speso" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}