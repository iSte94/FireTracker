"use client"

import { useState } from "react"
import { createBudget } from "@/lib/budget-client"
import { createClientComponentClient } from "@/lib/supabase-client"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

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

export default function AddBudgetDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Form state
  const [category, setCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [period, setPeriod] = useState<'MONTHLY' | 'QUARTERLY' | 'YEARLY'>('MONTHLY')
  const [isRecurring, setIsRecurring] = useState(true)
  const [alertThreshold, setAlertThreshold] = useState("80")
  const [notes, setNotes] = useState("")
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError("Utente non autenticato")
        setLoading(false)
        return
      }

      await createBudget({
        user_id: user.id,
        category,
        amount: parseFloat(amount),
        period,
        start_date: startDate,
        end_date: endDate || undefined,
        is_recurring: isRecurring,
        notes: notes || undefined,
        alert_threshold: parseFloat(alertThreshold),
        shared_with: [],
        status: 'ACTIVE'
      })

      // Reset form
      setCategory("")
      setAmount("")
      setPeriod('MONTHLY')
      setIsRecurring(true)
      setAlertThreshold("80")
      setNotes("")
      setStartDate(new Date().toISOString().split('T')[0])
      setEndDate("")
      setOpen(false)

      // Refresh the page
      router.refresh()
    } catch (error) {
      console.error("Error creating budget:", error)
      setError("Errore nella creazione del budget")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" /> Aggiungi Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crea Nuovo Budget</DialogTitle>
            <DialogDescription>
              Imposta un budget per controllare le tue spese per categoria.
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
              <Label htmlFor="category" className="text-right">
                Categoria
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category" className="col-span-3">
                  <SelectValue placeholder="Seleziona categoria" />
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
              <Label htmlFor="amount" className="text-right">
                Importo (€)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="col-span-3"
                placeholder="0.00"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="period" className="text-right">
                Periodo
              </Label>
              <Select value={period} onValueChange={(value) => setPeriod(value as any)} required>
                <SelectTrigger id="period" className="col-span-3">
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
              <Label htmlFor="startDate" className="text-right">
                Data Inizio
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                Data Fine
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="col-span-3"
                placeholder="Opzionale"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="recurring" className="text-right">
                Ricorrente
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="recurring"
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
                <Label htmlFor="recurring" className="text-sm text-muted-foreground">
                  Il budget si rinnova automaticamente
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="threshold" className="text-right">
                Soglia Avviso
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="threshold"
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
              <Label htmlFor="notes" className="text-right">
                Note
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3"
                placeholder="Note opzionali..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
              {loading ? "Creazione..." : "Crea Budget"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}