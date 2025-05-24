"use client"

import { useEffect, useState } from "react"
import { Budget, getBudgets, updateBudget, deleteBudget } from "@/lib/budget-client"
import { createClientComponentClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { MoreHorizontal, Edit, Trash, Pause, Play, Share2, Calendar } from "lucide-react"
import EditBudgetDialog from "./edit-budget-dialog"
import { format } from "date-fns"
import { it } from "date-fns/locale"

export default function BudgetList() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null)
  const [spendingData, setSpendingData] = useState<{ [key: string]: number }>({})
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadBudgets()
  }, [])

  const loadBudgets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const budgetList = await getBudgets(user.id)
      setBudgets(budgetList)

      // Load spending data for each budget
      await loadSpendingData(user.id, budgetList)
    } catch (error) {
      console.error("Error loading budgets:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadSpendingData = async (userId: string, budgetList: Budget[]) => {
    const currentDate = new Date()
    const spending: { [key: string]: number } = {}

    for (const budget of budgetList) {
      let startDate: Date
      let endDate: Date

      // Calculate period dates based on budget period
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
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('category', budget.category)
        .eq('type', 'EXPENSE')
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())

      const totalSpent = transactions?.reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0
      spending[budget.id] = totalSpent
    }

    setSpendingData(spending)
  }

  const handleToggleStatus = async (budget: Budget) => {
    try {
      const newStatus = budget.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
      await updateBudget(budget.id, { status: newStatus })
      await loadBudgets()
    } catch (error) {
      console.error("Error toggling budget status:", error)
    }
  }

  const handleDelete = async () => {
    if (!deletingBudget) return

    try {
      await deleteBudget(deletingBudget.id)
      setDeletingBudget(null)
      await loadBudgets()
    } catch (error) {
      console.error("Error deleting budget:", error)
    }
  }

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'MONTHLY':
        return 'Mensile'
      case 'QUARTERLY':
        return 'Trimestrale'
      case 'YEARLY':
        return 'Annuale'
      default:
        return period
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default'
      case 'PAUSED':
        return 'secondary'
      case 'COMPLETED':
        return 'outline'
      default:
        return 'default'
    }
  }

  if (loading) {
    return <div>Caricamento budget...</div>
  }

  if (budgets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          Non hai ancora creato nessun budget.
        </p>
        <p className="text-sm text-muted-foreground">
          Clicca su "Aggiungi Budget" per iniziare a pianificare le tue spese.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => {
          const spent = spendingData[budget.id] || 0
          const percentage = (spent / budget.amount) * 100
          const remaining = budget.amount - spent
          const isOverBudget = spent > budget.amount

          return (
            <Card key={budget.id} className={budget.status === 'PAUSED' ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{budget.category}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Azioni</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setEditingBudget(budget)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifica
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(budget)}>
                        {budget.status === 'ACTIVE' ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            Metti in pausa
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Riattiva
                          </>
                        )}
                      </DropdownMenuItem>
                      {budget.shared_with.length > 0 && (
                        <DropdownMenuItem>
                          <Share2 className="mr-2 h-4 w-4" />
                          Gestisci condivisione
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeletingBudget(budget)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Elimina
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="flex items-center gap-2">
                  <Badge variant={getStatusColor(budget.status)}>
                    {budget.status === 'ACTIVE' ? 'Attivo' : budget.status === 'PAUSED' ? 'In pausa' : 'Completato'}
                  </Badge>
                  <span className="text-xs">
                    {getPeriodLabel(budget.period)}
                  </span>
                  {budget.is_recurring && (
                    <Badge variant="outline" className="text-xs">
                      Ricorrente
                    </Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Budget</span>
                    <span className="font-medium">€{budget.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Speso</span>
                    <span className={`font-medium ${isOverBudget ? 'text-red-600' : ''}`}>
                      €{spent.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Rimanente</span>
                    <span className={`font-medium ${remaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      €{remaining.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{percentage.toFixed(0)}% utilizzato</span>
                    {percentage >= budget.alert_threshold && (
                      <span className="text-amber-500">
                        Soglia di avviso raggiunta
                      </span>
                    )}
                  </div>
                </div>

                {budget.notes && (
                  <p className="text-xs text-muted-foreground">{budget.notes}</p>
                )}
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                <Calendar className="mr-1 h-3 w-3" />
                {budget.start_date && (
                  <span>
                    Dal {format(new Date(budget.start_date), 'dd MMM yyyy', { locale: it })}
                    {budget.end_date && ` al ${format(new Date(budget.end_date), 'dd MMM yyyy', { locale: it })}`}
                  </span>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Edit Budget Dialog */}
      {editingBudget && (
        <EditBudgetDialog
          budget={editingBudget}
          open={!!editingBudget}
          onOpenChange={(open: boolean) => !open && setEditingBudget(null)}
          onSuccess={() => {
            setEditingBudget(null)
            loadBudgets()
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingBudget} onOpenChange={(open) => !open && setDeletingBudget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. Il budget per "{deletingBudget?.category}" 
              verrà eliminato permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}