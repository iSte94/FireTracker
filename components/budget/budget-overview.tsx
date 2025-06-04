"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getBudgetOverview, getCategorySpending } from "@/lib/budget-client"
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
  const { data: session } = useSession()

  const loadBudgetData = async () => {
    try {
      setLoading(true)
      
      if (!session?.user?.id) {
        console.log("No user session found")
        return
      }

      const overview = await getBudgetOverview(session.user.id)
      const spending = await getCategorySpending(session.user.id)
      
      setBudgetData(overview)
      setCategorySpending(spending)
    } catch (error) {
      console.error("Error loading budget data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      loadBudgetData()
    }
  }, [session?.user?.id])

  // Aggiungi event listener per refresh automatico
  useEffect(() => {
    const handleRefresh = () => {
      console.log("🔄 Budget Overview: Refreshing data...")
      loadBudgetData()
    }

    // Ascolta eventi di refresh
    window.addEventListener('budget-refresh', handleRefresh)
    window.addEventListener('transactions-refresh', handleRefresh)
    
    return () => {
      window.removeEventListener('budget-refresh', handleRefresh)
      window.removeEventListener('transactions-refresh', handleRefresh)
    }
  }, [session?.user?.id])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium">Accesso richiesto</p>
              <p className="text-sm">Effettua il login per visualizzare i tuoi budget</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium">Accesso richiesto</p>
              <p className="text-sm">Effettua il login per visualizzare le spese</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (budgetData.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Budget per Categoria</CardTitle>
            <CardDescription>
              Progresso delle spese rispetto al budget pianificato
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium">Nessun budget configurato</p>
              <p className="text-sm">Crea il tuo primo budget per iniziare a tracciare le spese</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Distribuzione Spese</CardTitle>
            <CardDescription>
              Come sono distribuite le tue spese per categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium">Nessuna spesa registrata</p>
              <p className="text-sm">Aggiungi transazioni per vedere la distribuzione</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
          {categorySpending.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium">Nessuna spesa questo mese</p>
              <p className="text-sm">Aggiungi transazioni per vedere la distribuzione</p>
            </div>
          ) : (
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
          )}
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
          {budgetData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium">Nessun dato da confrontare</p>
              <p className="text-sm">Configura budget e aggiungi transazioni</p>
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}