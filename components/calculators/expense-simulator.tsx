"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowRight } from "lucide-react"

export default function ExpenseSimulator() {
  // Stati per i valori del simulatore
  const [currentFireNumber, setCurrentFireNumber] = useState(705000)
  const [expenseAmount, setExpenseAmount] = useState(10000)
  const [expenseType, setExpenseType] = useState("one-time")
  const [expenseFrequency, setExpenseFrequency] = useState("monthly")
  const [swr, setSwr] = useState(4)
  const [includeOpportunity, setIncludeOpportunity] = useState(true)
  const [expectedReturn, setExpectedReturn] = useState(7)
  const [years, setYears] = useState(30)

  // Calcoli
  let additionalFireNeeded = 0
  let totalImpact = 0

  if (expenseType === "one-time") {
    additionalFireNeeded = 0
    totalImpact = expenseAmount

    if (includeOpportunity) {
      // Calcolo dell'impatto dell'opportunità persa (quanto avrebbe potuto crescere questo denaro)
      const opportunityCost = expenseAmount * Math.pow(1 + expectedReturn / 100, years) - expenseAmount
      totalImpact += opportunityCost
    }
  } else {
    // Calcolo per spese ricorrenti
    let annualExpense = 0

    switch (expenseFrequency) {
      case "monthly":
        annualExpense = expenseAmount * 12
        break
      case "quarterly":
        annualExpense = expenseAmount * 4
        break
      case "yearly":
        annualExpense = expenseAmount
        break
    }

    additionalFireNeeded = annualExpense / (swr / 100)
    totalImpact = additionalFireNeeded
  }

  const newFireNumber = currentFireNumber + additionalFireNeeded
  const percentageIncrease = (additionalFireNeeded / currentFireNumber) * 100

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentFireNumber">FIRE Number attuale (€)</Label>
            <Input
              id="currentFireNumber"
              type="number"
              value={currentFireNumber}
              onChange={(e) => setCurrentFireNumber(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expenseAmount">Importo spesa (€)</Label>
            <Input
              id="expenseAmount"
              type="number"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expenseType">Tipo di spesa</Label>
            <Select value={expenseType} onValueChange={(value) => setExpenseType(value)}>
              <SelectTrigger id="expenseType">
                <SelectValue placeholder="Seleziona tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one-time">Una tantum</SelectItem>
                <SelectItem value="recurring">Ricorrente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {expenseType === "recurring" && (
            <div className="space-y-2">
              <Label htmlFor="expenseFrequency">Frequenza</Label>
              <Select value={expenseFrequency} onValueChange={(value) => setExpenseFrequency(value)}>
                <SelectTrigger id="expenseFrequency">
                  <SelectValue placeholder="Seleziona frequenza" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensile</SelectItem>
                  <SelectItem value="quarterly">Trimestrale</SelectItem>
                  <SelectItem value="yearly">Annuale</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="swr">Safe Withdrawal Rate (%)</Label>
            <Input id="swr" type="number" value={swr} onChange={(e) => setSwr(Number(e.target.value))} />
          </div>
          {expenseType === "one-time" && (
            <>
              <div className="flex items-center space-x-2">
                <Switch id="includeOpportunity" checked={includeOpportunity} onCheckedChange={setIncludeOpportunity} />
                <Label htmlFor="includeOpportunity">Includi costo opportunità</Label>
              </div>
              {includeOpportunity && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="expectedReturn">Rendimento atteso (%)</Label>
                    <Input
                      id="expectedReturn"
                      type="number"
                      value={expectedReturn}
                      onChange={(e) => setExpectedReturn(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="years">Periodo di investimento (anni)</Label>
                    <Input id="years" type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Impatto sul FIRE Number</h3>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold">€{currentFireNumber.toLocaleString()}</p>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <p className="text-2xl font-bold">€{newFireNumber.toLocaleString()}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {expenseType === "recurring"
                  ? `Questa spesa ricorrente aumenta il tuo FIRE Number di €${additionalFireNeeded.toLocaleString()} (${percentageIncrease.toFixed(1)}%)`
                  : `Questa spesa una tantum ha un impatto totale di €${totalImpact.toLocaleString()} considerando ${includeOpportunity ? "anche il costo opportunità" : "solo l'importo speso"}`}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Dettaglio dell'impatto</h3>
              {expenseType === "one-time" ? (
                <>
                  <p className="text-sm">Importo spesa: €{expenseAmount.toLocaleString()}</p>
                  {includeOpportunity && (
                    <p className="text-sm">
                      Costo opportunità: €{(totalImpact - expenseAmount).toLocaleString()} (in {years} anni al{" "}
                      {expectedReturn}%)
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm">
                    Spesa{" "}
                    {expenseFrequency === "monthly"
                      ? "mensile"
                      : expenseFrequency === "quarterly"
                        ? "trimestrale"
                        : "annuale"}
                    : €{expenseAmount.toLocaleString()}
                  </p>
                  <p className="text-sm">
                    Spesa annuale: €
                    {(expenseFrequency === "monthly"
                      ? expenseAmount * 12
                      : expenseFrequency === "quarterly"
                        ? expenseAmount * 4
                        : expenseAmount
                    ).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    Capitale aggiuntivo necessario: €{additionalFireNeeded.toLocaleString()} (con SWR del {swr}%)
                  </p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
