"use client"

import { useState, useEffect } from "react"
import { Budget, updateBudget } from "@/lib/budget-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const categories = [
  "Casa",
  "Cibo",
  "Trasporti",
  "Svago",
  "Bollette",
  "Salute",
  "Shopping",
  "Educazione",
  "Investimenti",
  "Altro"
]

interface EditBudgetDialogProps {
  budget: Budget
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function EditBudgetDialog({ budget, open, onOpenChange, onSuccess }: EditBudgetDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [category, setCategory] = useState(budget.category)
  const [amount, setAmount] = useState(budget.amount.toString())
  const [period, setPeriod] = useState<'MONTHLY' | 'QUARTERLY' | 'YEARLY'>(budget.period)
  const [isRecurring, setIsRecurring] = useState(budget.is_recurring)
  const [alertThreshold, setAlertThreshold] = useState(budget.alert_threshold.toString())
  const [notes, setNotes] = useState(budget.notes || "")
  const [startDate, setStartDate] = useState(budget.start_date.split('T')[0])
  const [endDate, setEndDate] = useState(budget.end_date?.split('T')[0] || "")

  // Reset form when budget changes
  useEffect(() => {
    setCategory(budget.category)
    setAmount(budget.amount.toString())
    setPeriod(budget.period)
    setIsRecurring(budget.is_recurring)
    setAlertThreshold(budget.alert_threshold.toString())
    setNotes(budget.notes || "")
    setStartDate(budget.start_date.split('T')[0])
    setEndDate(budget.end_date?.split('T')[0] || "")
  }, [budget])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await updateBudget(budget.id, {
        category,
        amount: parseFloat(amount),
        period,
        start_date: startDate,
        end_date: endDate || undefined,
        is_recurring: isRecurring,
        notes: notes || undefined,
        alert_threshold: parseFloat(alertThreshold),
      })

      onSuccess()
    } catch (error) {
      console.error("Error updating budget:", error)
      setError("Errore nell'aggiornamento del budget")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Modifica Budget</DialogTitle>
            <DialogDescription>
              Aggiorna le impostazioni del budget per {budget.category}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right">
                Categoria
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="edit-category" className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-amount" className="text-right">
                Importo (€)
              </Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-period" className="text-right">
                Periodo
              </Label>
              <Select value={period} onValueChange={(value) => setPeriod(value as any)} required>
                <SelectTrigger id="edit-period" className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Mensile</SelectItem>
                  <SelectItem value="QUARTERLY">Trimestrale</SelectItem>
                  <SelectItem value="YEARLY">Annuale</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-startDate" className="text-right">
                Data Inizio
              </Label>
              <Input
                id="edit-startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-endDate" className="text-right">
                Data Fine
              </Label>
              <Input
                id="edit-endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-recurring" className="text-right">
                Ricorrente
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="edit-recurring"
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
                <Label htmlFor="edit-recurring" className="text-sm text-muted-foreground">
                  Il budget si rinnova automaticamente
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-threshold" className="text-right">
                Soglia Avviso
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="edit-threshold"
                  type="number"
                  min="0"
                  max="100"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  className="w-20"
                  required
                />
                <span className="text-sm text-muted-foreground">%</span>
                <span className="text-xs text-muted-foreground">
                  Ricevi un avviso quando superi questa percentuale
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-notes" className="text-right">
                Note
              </Label>
              <Textarea
                id="edit-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3"
                placeholder="Note opzionali..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
              {loading ? "Salvataggio..." : "Salva Modifiche"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}