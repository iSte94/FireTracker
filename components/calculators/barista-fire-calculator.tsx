"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function BaristaFireCalculator() {
  // Stati per i valori del calcolatore
  const [currentAge, setCurrentAge] = useState(30)
  const [currentNetWorth, setCurrentNetWorth] = useState(120000)
  const [annualExpenses, setAnnualExpenses] = useState(28200)
  const [partTimeIncome, setPartTimeIncome] = useState(12000)
  const [expectedReturn, setExpectedReturn] = useState(7)
  const [swr, setSwr] = useState(4)
  const [inflation, setInflation] = useState(2)

  // Calcoli
  const realReturn = (expectedReturn - inflation) / 100
  const expensesGap = annualExpenses - partTimeIncome
  const baristaFireNumber = expensesGap / (swr / 100)
  const progressPercentage = (currentNetWorth / baristaFireNumber) * 100
  const yearsToBarista =
    Math.log(
      (baristaFireNumber * realReturn + annualExpenses - partTimeIncome) /
        (currentNetWorth * realReturn + annualExpenses - partTimeIncome),
    ) / Math.log(1 + realReturn)
  const baristaAge = currentAge + Math.round(yearsToBarista)

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentAge">Età attuale</Label>
            <Input
              id="currentAge"
              type="number"
              value={currentAge}
              onChange={(e) => setCurrentAge(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentNetWorth">Patrimonio netto attuale (€)</Label>
            <Input
              id="currentNetWorth"
              type="number"
              value={currentNetWorth}
              onChange={(e) => setCurrentNetWorth(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="annualExpenses">Spese annuali (€)</Label>
            <Input
              id="annualExpenses"
              type="number"
              value={annualExpenses}
              onChange={(e) => setAnnualExpenses(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partTimeIncome">Reddito part-time annuale (€)</Label>
            <Input
              id="partTimeIncome"
              type="number"
              value={partTimeIncome}
              onChange={(e) => setPartTimeIncome(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="expectedReturn">Rendimento atteso (%)</Label>
              <span className="text-sm">{expectedReturn}%</span>
            </div>
            <Slider
              id="expectedReturn"
              min={1}
              max={12}
              step={0.5}
              value={[expectedReturn]}
              onValueChange={(value) => setExpectedReturn(value[0])}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="swr">Safe Withdrawal Rate (%)</Label>
              <span className="text-sm">{swr}%</span>
            </div>
            <Slider id="swr" min={2} max={6} step={0.1} value={[swr]} onValueChange={(value) => setSwr(value[0])} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="inflation">Inflazione (%)</Label>
              <span className="text-sm">{inflation}%</span>
            </div>
            <Slider
              id="inflation"
              min={0}
              max={5}
              step={0.1}
              value={[inflation]}
              onValueChange={(value) => setInflation(value[0])}
            />
          </div>
        </div>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Il tuo Barista FIRE Number</h3>
              <p className="text-3xl font-bold">
                €{baristaFireNumber.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span>{progressPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Anni al Barista FIRE</h3>
              <p className="text-3xl font-bold">{Math.round(yearsToBarista)} anni</p>
              <p className="text-sm text-muted-foreground">Raggiungerai il Barista FIRE all'età di {baristaAge} anni</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
