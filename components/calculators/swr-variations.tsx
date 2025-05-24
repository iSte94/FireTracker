"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Info, TrendingDown, Shield, AlertTriangle } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine
} from "recharts"
import {
  SWR_SCENARIOS,
  calculateFireNumberBySwr,
  formatCurrency,
  formatPercentage
} from "@/lib/fire-calculations"

interface SwrResult {
  swr: number
  fireNumber: number
  monthlyWithdrawal: number
  risk: string
  description: string
  difference: number
  percentageDifference: number
}

export default function SwrVariationsCalculator() {
  const [annualExpenses, setAnnualExpenses] = useState<string>("40000")
  const [currentSavings, setCurrentSavings] = useState<string>("500000")
  const [results, setResults] = useState<SwrResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [selectedSwr, setSelectedSwr] = useState<number>(4.0)

  const calculateVariations = () => {
    const expenses = parseFloat(annualExpenses) || 0
    const savings = parseFloat(currentSavings) || 0

    if (expenses <= 0) {
      return
    }

    const baselineFireNumber = calculateFireNumberBySwr(expenses, 4.0) // 4% come baseline
    const newResults: SwrResult[] = SWR_SCENARIOS.map(scenario => {
      const fireNumber = calculateFireNumberBySwr(expenses, scenario.rate)
      const monthlyWithdrawal = (fireNumber * scenario.rate / 100) / 12
      const difference = fireNumber - baselineFireNumber
      const percentageDifference = (difference / baselineFireNumber) * 100

      return {
        swr: scenario.rate,
        fireNumber,
        monthlyWithdrawal,
        risk: scenario.risk,
        description: scenario.description,
        difference,
        percentageDifference
      }
    })

    setResults(newResults)
    setShowResults(true)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Molto Conservativo": return "bg-green-500"
      case "Conservativo": return "bg-green-400"
      case "Moderato": return "bg-yellow-500"
      case "Aggressivo": return "bg-orange-500"
      case "Molto Aggressivo": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const getRiskBadgeVariant = (risk: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (risk) {
      case "Molto Conservativo":
      case "Conservativo": return "secondary"
      case "Moderato": return "default"
      case "Aggressivo":
      case "Molto Aggressivo": return "destructive"
      default: return "outline"
    }
  }

  const chartData = results.map(result => ({
    swr: `${result.swr}%`,
    fireNumber: result.fireNumber,
    currentSavings: parseFloat(currentSavings),
    gap: Math.max(0, result.fireNumber - parseFloat(currentSavings))
  }))

  const progressData = results.map(result => ({
    swr: `${result.swr}%`,
    progress: Math.min(100, (parseFloat(currentSavings) / result.fireNumber) * 100),
    risk: result.risk
  }))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Parametri di Calcolo</CardTitle>
          <CardDescription>
            Inserisci le tue spese annuali per vedere come diversi SWR influenzano il tuo FIRE number
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
                placeholder="500000"
              />
            </div>
          </div>
          <Button onClick={calculateVariations} className="w-full" size="lg">
            Calcola Variazioni SWR
          </Button>
        </CardContent>
      </Card>

      {showResults && (
        <div className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Il Safe Withdrawal Rate (SWR) determina quanto puoi prelevare annualmente dai tuoi investimenti. 
              Un SWR più basso richiede più capitale ma offre maggiore sicurezza.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((result, index) => (
              <Card 
                key={index} 
                className={selectedSwr === result.swr ? "ring-2 ring-primary" : ""}
                onClick={() => setSelectedSwr(result.swr)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">SWR {formatPercentage(result.swr)}</CardTitle>
                    <Badge variant={getRiskBadgeVariant(result.risk)}>
                      {result.risk}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(result.fireNumber)}</p>
                    <p className="text-sm text-muted-foreground">FIRE Number richiesto</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Prelievo mensile:</span>
                      <span className="font-medium">{formatCurrency(result.monthlyWithdrawal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Differenza dal 4%:</span>
                      <span className={`font-medium ${result.difference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {result.difference > 0 ? '+' : ''}{formatCurrency(result.difference)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{result.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Confronto FIRE Number per SWR</CardTitle>
              <CardDescription>
                Capitale necessario vs. risparmi attuali per ogni Safe Withdrawal Rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="swr" />
                    <YAxis 
                      tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => `SWR: ${label}`}
                    />
                    <Legend />
                    <Bar 
                      dataKey="fireNumber" 
                      fill="#3b82f6" 
                      name="FIRE Number"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar 
                      dataKey="currentSavings" 
                      fill="#10b981" 
                      name="Risparmi Attuali"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progresso verso FIRE per SWR</CardTitle>
              <CardDescription>
                Percentuale di completamento del tuo obiettivo FIRE con diversi SWR
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="swr" />
                    <YAxis 
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                      labelFormatter={(label) => `SWR: ${label}`}
                    />
                    <ReferenceLine 
                      y={100} 
                      stroke="#ef4444" 
                      strokeDasharray="5 5"
                      label="FIRE Raggiunto"
                    />
                    <Line
                      type="monotone"
                      dataKey="progress"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', r: 6 }}
                      name="Progresso %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Considerazioni sulla Sicurezza
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-green-600">SWR Conservativi (2.5% - 3%)</h4>
                  <p className="text-sm text-muted-foreground">
                    Ideali per pensionamenti molto precoci (prima dei 40 anni) o per chi vuole 
                    massima sicurezza. Richiedono più capitale ma offrono tranquillità anche 
                    in scenari di mercato molto negativi.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-yellow-600">SWR Moderati (3.5%)</h4>
                  <p className="text-sm text-muted-foreground">
                    Un buon compromesso tra sicurezza e capitale richiesto. Adatto per la 
                    maggior parte dei casi di FIRE con un orizzonte temporale di 40-50 anni.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-orange-600">SWR Aggressivi (4% - 4.5%)</h4>
                  <p className="text-sm text-muted-foreground">
                    La regola del 4% è lo standard storico, ma richiede flessibilità nelle spese 
                    durante i periodi di mercato negativo. Il 4.5% è rischioso e richiede un 
                    piano di backup.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Fattori di Rischio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium">Sequence of Returns Risk</h4>
                  <p className="text-sm text-muted-foreground">
                    Rendimenti negativi nei primi anni del pensionamento possono compromettere 
                    significativamente la durata del portafoglio.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Inflazione</h4>
                  <p className="text-sm text-muted-foreground">
                    Periodi di alta inflazione riducono il potere d'acquisto dei prelievi, 
                    richiedendo aggiustamenti al rialzo.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Longevità</h4>
                  <p className="text-sm text-muted-foreground">
                    Pensionamenti più lunghi del previsto richiedono SWR più conservativi 
                    per evitare di esaurire il capitale.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}