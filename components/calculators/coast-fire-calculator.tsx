"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function CoastFireCalculator() {
  // Stati per i valori del calcolatore
  const [currentAge, setCurrentAge] = useState(30)
  const [retirementAge, setRetirementAge] = useState(65)
  const [currentNetWorth, setCurrentNetWorth] = useState(120000)
  const [annualExpenses, setAnnualExpenses] = useState(28200)
  const [expectedReturn, setExpectedReturn] = useState(7)
  const [swr, setSwr] = useState(4)
  const [inflation, setInflation] = useState(2)

  // Calcoli
  const realReturn = (expectedReturn - inflation) / 100
  const yearsToRetirement = retirementAge - currentAge
  const fireNumber = annualExpenses / (swr / 100)

  // Calcolo del Coast FIRE Number (quanto hai bisogno ora per raggiungere il FIRE Number all'età di pensionamento)
  const coastFireNumber = fireNumber / Math.pow(1 + realReturn, yearsToRetirement)
  const progressPercentage = (currentNetWorth / coastFireNumber) * 100

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
            <Label htmlFor="retirementAge">Età di pensionamento</Label>
            <Input
              id="retirementAge"
              type="number"
              value={retirementAge}
              onChange={(e) => setRetirementAge(Number(e.target.value))}
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
            <Label htmlFor="annualExpenses">Spese annuali in pensione (€)</Label>
            <Input
              id="annualExpenses"
              type="number"
              value={annualExpenses}
              onChange={(e) => setAnnualExpenses(Number(e.target.value))}
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
              <h3 className="text-lg font-medium">Il tuo Coast FIRE Number</h3>
              <p className="text-3xl font-bold">
                €{coastFireNumber.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span>{progressPercentage > 100 ? 100 : progressPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={progressPercentage > 100 ? 100 : progressPercentage} className="h-2" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">FIRE Number al pensionamento</h3>
              <p className="text-3xl font-bold">
                €{fireNumber.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-sm text-muted-foreground">
                {progressPercentage >= 100
                  ? "Hai già raggiunto il Coast FIRE! Puoi smettere di risparmiare per la pensione."
                  : `Ti mancano €${(coastFireNumber - currentNetWorth).toLocaleString(undefined, { maximumFractionDigits: 0 })} per raggiungere il Coast FIRE.`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
