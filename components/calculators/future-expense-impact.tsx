"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, TrendingUp, Calendar, Euro } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from "recharts"
import {
  FIRE_TYPES,
  calculateFutureExpenseImpact,
  calculateFireNumberBySwr,
  formatCurrency,
  formatYears
} from "@/lib/fire-calculations"

interface ImpactResult {
  fireType: string
  originalFireNumber: number
  adjustedFireNumber: number
  additionalCapital: number
  delayYears: number
  presentValue: number
}

export default function FutureExpenseImpactCalculator() {
  // Input states
  const [annualExpenses, setAnnualExpenses] = useState<string>("40000")
  const [expenseAmount, setExpenseAmount] = useState<string>("30000")
  const [yearsUntilExpense, setYearsUntilExpense] = useState<string>("5")
  const [expectedReturn, setExpectedReturn] = useState<string>("7")
  const [inflationRate, setInflationRate] = useState<string>("2")
  const [currentSavings, setCurrentSavings] = useState<string>("100000")
  const [annualSavings, setAnnualSavings] = useState<string>("20000")
  
  // Results
  const [results, setResults] = useState<ImpactResult[]>([])
  const [timelineData, setTimelineData] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)

  const calculateImpact = () => {
    const expenses = parseFloat(annualExpenses) || 0
    const expense = parseFloat(expenseAmount) || 0
    const years = parseFloat(yearsUntilExpense) || 0
    const returnRate = parseFloat(expectedReturn) / 100 || 0.07
    const inflation = parseFloat(inflationRate) / 100 || 0.02
    const savings = parseFloat(currentSavings) || 0
    const annualSave = parseFloat(annualSavings) || 0

    if (expenses <= 0 || expense <= 0 || years < 0) {
      return
    }

    const newResults: ImpactResult[] = []
    const timelinePoints: any[] = []

    // Calcola per ogni tipo di FIRE
    Object.entries(FIRE_TYPES).forEach(([key, fireType]) => {
      const originalFireNumber = calculateFireNumberBySwr(expenses, 100 / fireType.multiplier)
      const impact = calculateFutureExpenseImpact(
        originalFireNumber,
        expense,
        years,
        returnRate,
        inflation
      )

      newResults.push({
        fireType: fireType.name,
        originalFireNumber,
        adjustedFireNumber: impact.adjustedFireNumber,
        additionalCapital: impact.additionalCapitalNeeded,
        delayYears: impact.delayInYears,
        presentValue: impact.presentValue
      })
    })

    // Genera dati per il grafico timeline
    const maxYears = 30
    for (let year = 0; year <= maxYears; year++) {
      const point: any = { year }
      
      newResults.forEach((result) => {
        const fireKey = result.fireType.replace(/\s+/g, '_')
        
        // Calcola il progresso senza la spesa
        let valueWithoutExpense = savings
        for (let y = 0; y < year; y++) {
          valueWithoutExpense = valueWithoutExpense * (1 + returnRate) + annualSave
        }
        
        // Calcola il progresso con la spesa
        let valueWithExpense = savings
        for (let y = 0; y < year; y++) {
          valueWithExpense = valueWithExpense * (1 + returnRate) + annualSave
          // Sottrai la spesa nell'anno specificato
          if (y === years - 1) {
            valueWithExpense -= expense
          }
        }
        
        point[`${fireKey}_original`] = (valueWithoutExpense / result.originalFireNumber) * 100
        point[`${fireKey}_adjusted`] = (valueWithExpense / result.adjustedFireNumber) * 100
      })
      
      timelinePoints.push(point)
    }

    setResults(newResults)
    setTimelineData(timelinePoints)
    setShowResults(true)
  }

  const getLineColor = (fireType: string) => {
    switch (fireType) {
      case "Traditional FIRE": return "#3b82f6"
      case "Coast FIRE": return "#10b981"
      case "Barista FIRE": return "#f59e0b"
      case "Fat FIRE": return "#ef4444"
      default: return "#6b7280"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Parametri Base</CardTitle>
            <CardDescription>Inserisci i tuoi dati finanziari attuali</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="annual-expenses">Spese Annuali (€)</Label>
              <Input
                id="annual-expenses"
                type="number"
                value={annualExpenses}
                onChange={(e) => setAnnualExpenses(e.target.value)}
                placeholder="40000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current-savings">Risparmi Attuali (€)</Label>
              <Input
                id="current-savings"
                type="number"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(e.target.value)}
                placeholder="100000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annual-savings">Risparmi Annuali (€)</Label>
              <Input
                id="annual-savings"
                type="number"
                value={annualSavings}
                onChange={(e) => setAnnualSavings(e.target.value)}
                placeholder="20000"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spesa Futura</CardTitle>
            <CardDescription>Dettagli della spesa che vuoi pianificare</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expense-amount">Importo Spesa (€)</Label>
              <Input
                id="expense-amount"
                type="number"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="30000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="years-until">Anni fino alla Spesa</Label>
              <Input
                id="years-until"
                type="number"
                value={yearsUntilExpense}
                onChange={(e) => setYearsUntilExpense(e.target.value)}
                placeholder="5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expected-return">Rendimento Atteso (%)</Label>
              <Input
                id="expected-return"
                type="number"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(e.target.value)}
                placeholder="7"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inflation">Inflazione (%)</Label>
              <Input
                id="inflation"
                type="number"
                value={inflationRate}
                onChange={(e) => setInflationRate(e.target.value)}
                placeholder="2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Button onClick={calculateImpact} className="w-full" size="lg">
        Calcola Impatto
      </Button>

      {showResults && (
        <div className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Una spesa di {formatCurrency(parseFloat(expenseAmount))} tra {yearsUntilExpense} anni 
              ha un valore presente di {formatCurrency(results[0]?.presentValue || 0)} considerando 
              inflazione e rendimenti attesi.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="comparison" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="comparison">Confronto FIRE</TabsTrigger>
              <TabsTrigger value="timeline">Timeline Impatto</TabsTrigger>
            </TabsList>

            <TabsContent value="comparison" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {results.map((result, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{result.fireType}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">FIRE Number Originale:</span>
                        <span className="font-medium">{formatCurrency(result.originalFireNumber)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">FIRE Number Aggiustato:</span>
                        <span className="font-medium text-destructive">
                          {formatCurrency(result.adjustedFireNumber)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Capitale Aggiuntivo:</span>
                        <span className="font-medium">{formatCurrency(result.additionalCapital)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Ritardo Stimato:</span>
                        <span className="font-medium text-orange-600">
                          {formatYears(result.delayYears)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Impatto sul Percorso FIRE</CardTitle>
                  <CardDescription>
                    Confronto tra il percorso originale (linea continua) e quello con la spesa futura (linea tratteggiata)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="year" 
                          label={{ value: "Anni", position: "insideBottom", offset: -5 }}
                        />
                        <YAxis 
                          label={{ value: "Progresso FIRE (%)", angle: -90, position: "insideLeft" }}
                        />
                        <Tooltip 
                          formatter={(value: number) => `${value.toFixed(1)}%`}
                          labelFormatter={(label) => `Anno ${label}`}
                        />
                        <Legend />
                        <ReferenceLine 
                          y={100} 
                          stroke="#ef4444" 
                          strokeDasharray="5 5"
                          label="FIRE Target"
                        />
                        <ReferenceLine 
                          x={parseFloat(yearsUntilExpense)} 
                          stroke="#6b7280" 
                          strokeDasharray="5 5"
                          label="Spesa"
                        />
                        
                        {results.map((result) => {
                          const fireKey = result.fireType.replace(/\s+/g, '_')
                          const color = getLineColor(result.fireType)
                          return (
                            <React.Fragment key={fireKey}>
                              <Line
                                type="monotone"
                                dataKey={`${fireKey}_original`}
                                stroke={color}
                                name={`${result.fireType} (Originale)`}
                                strokeWidth={2}
                                dot={false}
                              />
                              <Line
                                type="monotone"
                                dataKey={`${fireKey}_adjusted`}
                                stroke={color}
                                name={`${result.fireType} (Con Spesa)`}
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                              />
                            </React.Fragment>
                          )
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  Il grafico mostra come la spesa futura impatta il tuo percorso verso ogni tipo di FIRE. 
                  La linea verticale indica quando avverrà la spesa, mentre le linee tratteggiate mostrano 
                  il nuovo percorso dopo la spesa.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}