"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Info, Target, TrendingUp, Calendar, Milestone } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart
} from "recharts"
import {
  FIRE_TYPES,
  SCENARIOS,
  calculateFireNumberBySwr,
  calculateTimeToFire,
  calculateMultipleScenarios,
  calculateMilestones,
  calculateCoastFire,
  calculateBaristaFire,
  formatCurrency,
  formatYears,
  formatPercentage
} from "@/lib/fire-calculations"

interface TimelineResult {
  fireType: string
  fireNumber: number
  scenarios: {
    name: string
    years: number
    monthlyProgress: Array<{ month: number; value: number; percentage: number }>
  }[]
  milestones: ReturnType<typeof calculateMilestones>
}

export default function FireTimelineComparison() {
  // Input states
  const [annualExpenses, setAnnualExpenses] = useState<string>("40000")
  const [currentSavings, setCurrentSavings] = useState<string>("100000")
  const [annualSavings, setAnnualSavings] = useState<string>("30000")
  const [savingsRate, setSavingsRate] = useState<number>(50)
  const [expectedReturn, setExpectedReturn] = useState<number>(7)
  const [currentAge, setCurrentAge] = useState<string>("30")
  const [retirementAge, setRetirementAge] = useState<string>("65")
  const [partTimeIncome, setPartTimeIncome] = useState<string>("20000")
  
  // Results
  const [results, setResults] = useState<TimelineResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [selectedScenario, setSelectedScenario] = useState<string>("Realistico")

  const calculateTimelines = () => {
    const expenses = parseFloat(annualExpenses) || 0
    const savings = parseFloat(currentSavings) || 0
    const annualSave = parseFloat(annualSavings) || 0
    const age = parseFloat(currentAge) || 30
    const retAge = parseFloat(retirementAge) || 65
    const partTime = parseFloat(partTimeIncome) || 0

    if (expenses <= 0 || savings < 0 || annualSave < 0) {
      return
    }

    const newResults: TimelineResult[] = []

    // Traditional FIRE
    const traditionalFireNumber = calculateFireNumberBySwr(expenses, 4)
    const traditionalScenarios = calculateMultipleScenarios(
      savings,
      annualSave,
      traditionalFireNumber
    )
    newResults.push({
      fireType: "Traditional FIRE",
      fireNumber: traditionalFireNumber,
      scenarios: traditionalScenarios.map(s => ({
        name: s.scenario.name,
        years: s.timeToFire.years,
        monthlyProgress: s.timeToFire.monthlyProgress
      })),
      milestones: calculateMilestones(savings, traditionalFireNumber)
    })

    // Coast FIRE
    const yearsToRetirement = retAge - age
    const coastFireNumber = calculateCoastFire(traditionalFireNumber, yearsToRetirement, expectedReturn / 100)
    const coastScenarios = calculateMultipleScenarios(
      savings,
      annualSave,
      coastFireNumber
    )
    newResults.push({
      fireType: "Coast FIRE",
      fireNumber: coastFireNumber,
      scenarios: coastScenarios.map(s => ({
        name: s.scenario.name,
        years: s.timeToFire.years,
        monthlyProgress: s.timeToFire.monthlyProgress
      })),
      milestones: calculateMilestones(savings, coastFireNumber)
    })

    // Barista FIRE
    const baristaCalc = calculateBaristaFire(expenses, partTime)
    const baristaScenarios = calculateMultipleScenarios(
      savings,
      annualSave,
      baristaCalc.fireNumber
    )
    newResults.push({
      fireType: "Barista FIRE",
      fireNumber: baristaCalc.fireNumber,
      scenarios: baristaScenarios.map(s => ({
        name: s.scenario.name,
        years: s.timeToFire.years,
        monthlyProgress: s.timeToFire.monthlyProgress
      })),
      milestones: calculateMilestones(savings, baristaCalc.fireNumber)
    })

    // Fat FIRE
    const fatFireNumber = calculateFireNumberBySwr(expenses * 1.5, 3.33) // 150% delle spese, SWR 3.33%
    const fatScenarios = calculateMultipleScenarios(
      savings,
      annualSave,
      fatFireNumber
    )
    newResults.push({
      fireType: "Fat FIRE",
      fireNumber: fatFireNumber,
      scenarios: fatScenarios.map(s => ({
        name: s.scenario.name,
        years: s.timeToFire.years,
        monthlyProgress: s.timeToFire.monthlyProgress
      })),
      milestones: calculateMilestones(savings, fatFireNumber)
    })

    setResults(newResults)
    setShowResults(true)
  }

  const getFireTypeColor = (fireType: string) => {
    switch (fireType) {
      case "Traditional FIRE": return "#3b82f6"
      case "Coast FIRE": return "#10b981"
      case "Barista FIRE": return "#f59e0b"
      case "Fat FIRE": return "#ef4444"
      default: return "#6b7280"
    }
  }

  const getScenarioOpacity = (scenario: string) => {
    switch (scenario) {
      case "Ottimistico": return 0.4
      case "Realistico": return 1
      case "Pessimistico": return 0.6
      default: return 0.8
    }
  }

  // Prepara i dati per il grafico timeline unificato
  const prepareUnifiedTimelineData = () => {
    const maxMonths = 360 // 30 anni
    const data = []
    
    for (let month = 0; month <= maxMonths; month += 12) {
      const point: any = { year: month / 12 }
      
      results.forEach(result => {
        const scenario = result.scenarios.find(s => s.name === selectedScenario)
        if (scenario) {
          const progress = scenario.monthlyProgress.find(p => p.month === month)
          if (progress) {
            point[result.fireType] = progress.percentage
          }
        }
      })
      
      data.push(point)
    }
    
    return data
  }

  const unifiedTimelineData = showResults ? prepareUnifiedTimelineData() : []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Parametri Finanziari</CardTitle>
          <CardDescription>
            Configura i tuoi dati per confrontare diversi percorsi FIRE
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
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
                placeholder="30000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="part-time-income">Reddito Part-Time (€) - per Barista FIRE</Label>
              <Input
                id="part-time-income"
                type="number"
                value={partTimeIncome}
                onChange={(e) => setPartTimeIncome(e.target.value)}
                placeholder="20000"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="savings-rate">Tasso di Risparmio: {savingsRate}%</Label>
              <Slider
                id="savings-rate"
                min={10}
                max={80}
                step={5}
                value={[savingsRate]}
                onValueChange={(value) => setSavingsRate(value[0])}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expected-return">Rendimento Atteso: {expectedReturn}%</Label>
              <Slider
                id="expected-return"
                min={3}
                max={12}
                step={0.5}
                value={[expectedReturn]}
                onValueChange={(value) => setExpectedReturn(value[0])}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="current-age">Età Attuale</Label>
              <Input
                id="current-age"
                type="number"
                value={currentAge}
                onChange={(e) => setCurrentAge(e.target.value)}
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retirement-age">Età Pensionamento (per Coast FIRE)</Label>
              <Input
                id="retirement-age"
                type="number"
                value={retirementAge}
                onChange={(e) => setRetirementAge(e.target.value)}
                placeholder="65"
              />
            </div>
          </div>

          <Button onClick={calculateTimelines} className="w-full" size="lg">
            Calcola Timeline Comparativo
          </Button>
        </CardContent>
      </Card>

      {showResults && (
        <div className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Confronta i diversi percorsi FIRE e scopri quale si adatta meglio ai tuoi obiettivi. 
              Ogni tipo di FIRE ha vantaggi e compromessi diversi.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {results.map((result, index) => {
              const realisticScenario = result.scenarios.find(s => s.name === "Realistico")
              const currentProgress = (parseFloat(currentSavings) / result.fireNumber) * 100
              
              return (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{result.fireType}</CardTitle>
                    <CardDescription>
                      {formatCurrency(result.fireNumber)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progresso</span>
                        <span>{formatPercentage(currentProgress, 0)}</span>
                      </div>
                      <Progress value={currentProgress} className="h-2" />
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tempo stimato:</span>
                        <span className="font-medium">
                          {formatYears(realisticScenario?.years || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Età al FIRE:</span>
                        <span className="font-medium">
                          {Math.round(parseFloat(currentAge) + (realisticScenario?.years || 0))} anni
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Tabs defaultValue="unified" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="unified">Timeline Unificato</TabsTrigger>
              <TabsTrigger value="scenarios">Scenari Multipli</TabsTrigger>
              <TabsTrigger value="milestones">Milestone</TabsTrigger>
            </TabsList>

            <TabsContent value="unified" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Confronto Timeline FIRE</CardTitle>
                  <CardDescription>
                    Progressione verso diversi tipi di FIRE nello scenario {selectedScenario.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Label>Scenario</Label>
                    <div className="flex gap-2 mt-2">
                      {SCENARIOS.map(scenario => (
                        <Button
                          key={scenario.name}
                          variant={selectedScenario === scenario.name ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedScenario(scenario.name)}
                        >
                          {scenario.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={unifiedTimelineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="year" 
                          label={{ value: "Anni", position: "insideBottom", offset: -5 }}
                        />
                        <YAxis 
                          label={{ value: "Progresso (%)", angle: -90, position: "insideLeft" }}
                          domain={[0, 100]}
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
                          label="Target FIRE"
                        />
                        
                        {results.map((result) => (
                          <Line
                            key={result.fireType}
                            type="monotone"
                            dataKey={result.fireType}
                            stroke={getFireTypeColor(result.fireType)}
                            strokeWidth={2}
                            dot={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scenarios" className="space-y-4">
              {results.map((result, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{result.fireType}</CardTitle>
                    <CardDescription>
                      Confronto tra scenari ottimistico, realistico e pessimistico
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart 
                          data={result.scenarios[0].monthlyProgress.map((_, idx) => {
                            const month = idx * 12
                            const point: any = { year: month / 12 }
                            result.scenarios.forEach(scenario => {
                              const progress = scenario.monthlyProgress.find(p => p.month === month)
                              if (progress) {
                                point[scenario.name] = progress.percentage
                              }
                            })
                            return point
                          })}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="year" 
                            label={{ value: "Anni", position: "insideBottom", offset: -5 }}
                          />
                          <YAxis 
                            label={{ value: "Progresso (%)", angle: -90, position: "insideLeft" }}
                            domain={[0, 100]}
                          />
                          <Tooltip 
                            formatter={(value: number) => `${value.toFixed(1)}%`}
                            labelFormatter={(label) => `Anno ${label}`}
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="Ottimistico"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.3}
                          />
                          <Area
                            type="monotone"
                            dataKey="Realistico"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.5}
                          />
                          <Area
                            type="monotone"
                            dataKey="Pessimistico"
                            stroke="#ef4444"
                            fill="#ef4444"
                            fillOpacity={0.3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {result.scenarios.map((scenario, idx) => (
                        <div key={idx} className="text-center">
                          <p className="text-sm font-medium">{scenario.name}</p>
                          <p className="text-lg font-bold">{formatYears(scenario.years)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="milestones" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {results.map((result, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Milestone className="h-5 w-5" />
                        {result.fireType}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.milestones.map((milestone, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full ${
                                milestone.reached ? 'bg-green-500' : 'bg-gray-300'
                              }`} />
                              <span className={`text-sm ${
                                milestone.reached ? 'font-medium' : 'text-muted-foreground'
                              }`}>
                                {milestone.label}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {formatCurrency(milestone.amount)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatPercentage(milestone.percentage, 0)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Alert>
                <Target className="h-4 w-4" />
                <AlertDescription>
                  Le milestone ti aiutano a tracciare il progresso e mantenere la motivazione. 
                  Ogni traguardo raggiunto è un passo importante verso la tua indipendenza finanziaria.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}