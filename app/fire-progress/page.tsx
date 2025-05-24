"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { FireProgressTracker } from "@/components/fire/fire-progress-tracker"
import { FireTimeline } from "@/components/fire/fire-timeline"
import { FireMilestones } from "@/components/fire/fire-milestones"
import { useFireAlerts } from "@/hooks/use-fire-alerts"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Calculator, TrendingUp, AlertCircle, Lightbulb, X } from "lucide-react"
import { formatCurrency, FIRE_TYPES, calculateTimeToFire } from "@/lib/fire-calculations"
import { useToast } from "@/hooks/use-toast"

export default function FireProgressPage() {
  const { toast } = useToast()
  
  // Stati per i dati finanziari (in produzione verrebbero dal database)
  const [currentSavings, setCurrentSavings] = useState(150000)
  const [annualExpenses, setAnnualExpenses] = useState(40000)
  const [annualSavings, setAnnualSavings] = useState(30000)
  const [monthlyTarget, setMonthlyTarget] = useState(2500)
  const [expectedReturn, setExpectedReturn] = useState(0.07)
  const [inflationRate, setInflationRate] = useState(0.02)
  
  // Stati per simulazioni what-if
  const [simulationMode, setSimulationMode] = useState(false)
  const [simCurrentSavings, setSimCurrentSavings] = useState(currentSavings)
  const [simAnnualExpenses, setSimAnnualExpenses] = useState(annualExpenses)
  const [simAnnualSavings, setSimAnnualSavings] = useState(annualSavings)
  
  // Hook per gli alert
  const { alerts, dismissAlert, stats } = useFireAlerts({
    currentSavings: simulationMode ? simCurrentSavings : currentSavings,
    annualExpenses: simulationMode ? simAnnualExpenses : annualExpenses,
    annualSavings: simulationMode ? simAnnualSavings : annualSavings,
    monthlyTarget,
    expectedReturn,
    inflationRate,
    checkInterval: 30000 // Controlla ogni 30 secondi
  })
  
  // Valori da usare (reali o simulati)
  const displaySavings = simulationMode ? simCurrentSavings : currentSavings
  const displayExpenses = simulationMode ? simAnnualExpenses : annualExpenses
  const displayAnnualSavings = simulationMode ? simAnnualSavings : annualSavings
  
  // Calcola metriche chiave
  const savingsRate = (displayAnnualSavings / (displayAnnualSavings + displayExpenses)) * 100
  const traditionalFireNumber = displayExpenses * FIRE_TYPES.traditional.multiplier
  const timeToFire = calculateTimeToFire(
    displaySavings,
    displayAnnualSavings,
    traditionalFireNumber,
    expectedReturn,
    inflationRate
  )
  
  // Handler per milestone raggiunte
  const handleMilestoneReached = (milestone: string) => {
    toast({
      title: "🎉 Complimenti!",
      description: `Hai raggiunto: ${milestone}`,
      duration: 5000
    })
  }
  
  // Reset simulazione
  const resetSimulation = () => {
    setSimCurrentSavings(currentSavings)
    setSimAnnualExpenses(annualExpenses)
    setSimAnnualSavings(annualSavings)
    setSimulationMode(false)
  }
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Progresso FIRE</h1>
          <p className="text-muted-foreground">
            Monitora il tuo percorso verso l'indipendenza finanziaria
          </p>
        </div>
        <div className="flex items-center gap-2">
          {simulationMode && (
            <Badge variant="secondary" className="gap-1">
              <Calculator className="h-3 w-3" />
              Modalità Simulazione
            </Badge>
          )}
          <Button
            variant={simulationMode ? "destructive" : "outline"}
            size="sm"
            onClick={() => simulationMode ? resetSimulation() : setSimulationMode(true)}
          >
            {simulationMode ? "Esci dalla Simulazione" : "Simulazione What-If"}
          </Button>
        </div>
      </div>
      
      {/* Alert attivi */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 3).map(alert => (
            <Alert key={alert.id} className="relative">
              <alert.icon className="h-4 w-4" />
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.description}</AlertDescription>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => dismissAlert(alert.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </Alert>
          ))}
          {alerts.length > 3 && (
            <p className="text-sm text-muted-foreground text-center">
              +{alerts.length - 3} altri alert
            </p>
          )}
        </div>
      )}
      
      {/* Metriche principali */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Patrimonio Attuale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(displaySavings)}</div>
            <p className="text-xs text-muted-foreground">
              {((displaySavings / traditionalFireNumber) * 100).toFixed(1)}% del FIRE
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tasso di Risparmio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savingsRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(displayAnnualSavings)}/anno
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tempo al FIRE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeToFire.years.toFixed(1)} anni</div>
            <p className="text-xs text-muted-foreground">
              Traditional FIRE
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">FIRE Number</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(traditionalFireNumber)}</div>
            <p className="text-xs text-muted-foreground">
              25x spese annuali
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs principali */}
      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="progress">Progresso</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="milestones">Milestone</TabsTrigger>
          <TabsTrigger value="analysis">Analisi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="progress" className="space-y-4">
          <FireProgressTracker
            currentSavings={displaySavings}
            annualExpenses={displayExpenses}
            annualSavings={displayAnnualSavings}
            expectedReturn={expectedReturn}
            inflationRate={inflationRate}
          />
        </TabsContent>
        
        <TabsContent value="timeline" className="space-y-4">
          <FireTimeline
            currentSavings={displaySavings}
            annualExpenses={displayExpenses}
            annualSavings={displayAnnualSavings}
            expectedReturn={expectedReturn}
            inflationRate={inflationRate}
          />
        </TabsContent>
        
        <TabsContent value="milestones" className="space-y-4">
          <FireMilestones
            currentSavings={displaySavings}
            annualExpenses={displayExpenses}
            onMilestoneReached={handleMilestoneReached}
          />
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-4">
          {/* Pannello di simulazione */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Simulazione What-If
              </CardTitle>
              <CardDescription>
                Modifica i parametri per vedere come cambierebbe il tuo percorso FIRE
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Patrimonio Attuale</Label>
                  <Input
                    type="number"
                    value={simCurrentSavings}
                    onChange={(e) => {
                      setSimCurrentSavings(Number(e.target.value))
                      setSimulationMode(true)
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Spese Annuali</Label>
                  <Input
                    type="number"
                    value={simAnnualExpenses}
                    onChange={(e) => {
                      setSimAnnualExpenses(Number(e.target.value))
                      setSimulationMode(true)
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Risparmi Annuali</Label>
                  <Input
                    type="number"
                    value={simAnnualSavings}
                    onChange={(e) => {
                      setSimAnnualSavings(Number(e.target.value))
                      setSimulationMode(true)
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Rendimento Atteso: {(expectedReturn * 100).toFixed(1)}%</Label>
                  <Slider
                    value={[expectedReturn * 100]}
                    onValueChange={([value]) => setExpectedReturn(value / 100)}
                    min={0}
                    max={12}
                    step={0.5}
                  />
                </div>
              </div>
              
              {simulationMode && (
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetSimulation}>
                    Reset
                  </Button>
                  <Button onClick={() => {
                    setCurrentSavings(simCurrentSavings)
                    setAnnualExpenses(simAnnualExpenses)
                    setAnnualSavings(simAnnualSavings)
                    setSimulationMode(false)
                    toast({
                      title: "Valori aggiornati",
                      description: "I nuovi valori sono stati salvati"
                    })
                  }}>
                    Applica Modifiche
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Consigli personalizzati */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Consigli Personalizzati
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {savingsRate < 20 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Aumenta il tasso di risparmio</AlertTitle>
                  <AlertDescription>
                    Il tuo tasso di risparmio del {savingsRate.toFixed(1)}% è sotto la media.
                    Cerca di raggiungere almeno il 20-30% per accelerare il percorso FIRE.
                  </AlertDescription>
                </Alert>
              )}
              
              {timeToFire.years > 15 && (
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertTitle>Considera strategie alternative</AlertTitle>
                  <AlertDescription>
                    Con {timeToFire.years.toFixed(0)} anni al FIRE, potresti considerare:
                    Coast FIRE (smetti di risparmiare prima) o Barista FIRE (lavoro part-time).
                  </AlertDescription>
                </Alert>
              )}
              
              {displaySavings > 100000 && displaySavings < 200000 && (
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertTitle>Ottimizza gli investimenti</AlertTitle>
                  <AlertDescription>
                    Con un patrimonio di {formatCurrency(displaySavings)}, assicurati di avere
                    una strategia di investimento diversificata e costi bassi.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}