"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Flag, Milestone as MilestoneIcon, TrendingUp, TrendingDown } from "lucide-react"
import { formatCurrency, FIRE_TYPES, calculateTimeToFire, calculateMultipleScenarios, formatYears } from "@/lib/fire-calculations"
import { cn } from "@/lib/utils"

interface FireTimelineProps {
  currentSavings: number
  annualExpenses: number
  annualSavings: number
  expectedReturn?: number
  inflationRate?: number
}

interface TimelineEvent {
  date: Date
  label: string
  type: "milestone" | "fire" | "current"
  fireType?: string
  percentage?: number
  amount?: number
}

export function FireTimeline({
  currentSavings,
  annualExpenses,
  annualSavings,
  expectedReturn = 0.07,
  inflationRate = 0.02
}: FireTimelineProps) {
  const [selectedScenario, setSelectedScenario] = useState("Realistico")
  
  // Calcola gli scenari multipli
  const scenarios = calculateMultipleScenarios(
    currentSavings,
    annualSavings,
    annualExpenses * FIRE_TYPES.traditional.multiplier
  )
  
  const currentScenario = scenarios.find(s => s.scenario.name === selectedScenario) || scenarios[1]
  
  // Genera eventi della timeline
  const generateTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = []
    const now = new Date()
    
    // Evento corrente
    events.push({
      date: now,
      label: "Oggi",
      type: "current",
      amount: currentSavings
    })
    
    // Calcola eventi per ogni tipo di FIRE
    Object.entries(FIRE_TYPES).forEach(([key, fireType]) => {
      const fireNumber = annualExpenses * fireType.multiplier
      const timeToFire = calculateTimeToFire(
        currentSavings,
        annualSavings,
        fireNumber,
        currentScenario.scenario.expectedReturn,
        currentScenario.scenario.inflationRate
      )
      
      // Aggiungi milestone intermedie (25%, 50%, 75%)
      const milestones = [25, 50, 75]
      milestones.forEach(percentage => {
        const targetAmount = fireNumber * (percentage / 100)
        if (currentSavings < targetAmount) {
          const timeToMilestone = calculateTimeToFire(
            currentSavings,
            annualSavings,
            targetAmount,
            currentScenario.scenario.expectedReturn,
            currentScenario.scenario.inflationRate
          )
          
          const milestoneDate = new Date(now)
          milestoneDate.setMonth(milestoneDate.getMonth() + Math.round(timeToMilestone.years * 12))
          
          events.push({
            date: milestoneDate,
            label: `${percentage}% ${fireType.name}`,
            type: "milestone",
            fireType: key,
            percentage,
            amount: targetAmount
          })
        }
      })
      
      // Aggiungi evento FIRE raggiunto
      if (currentSavings < fireNumber) {
        const fireDate = new Date(now)
        fireDate.setMonth(fireDate.getMonth() + Math.round(timeToFire.years * 12))
        
        events.push({
          date: fireDate,
          label: fireType.name,
          type: "fire",
          fireType: key,
          percentage: 100,
          amount: fireNumber
        })
      }
    })
    
    // Ordina eventi per data
    return events.sort((a, b) => a.date.getTime() - b.date.getTime())
  }
  
  const timelineEvents = generateTimelineEvents()
  
  // Calcola la differenza tra scenari
  const optimisticScenario = scenarios.find(s => s.scenario.name === "Ottimistico")
  const pessimisticScenario = scenarios.find(s => s.scenario.name === "Pessimistico")
  
  const yearsDifference = optimisticScenario && pessimisticScenario
    ? pessimisticScenario.timeToFire.years - optimisticScenario.timeToFire.years
    : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline FIRE
            </CardTitle>
            <CardDescription>
              Visualizza il tuo percorso verso l'indipendenza finanziaria
            </CardDescription>
          </div>
          <Select value={selectedScenario} onValueChange={setSelectedScenario}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {scenarios.map(s => (
                <SelectItem key={s.scenario.name} value={s.scenario.name}>
                  <div className="flex items-center gap-2">
                    {s.scenario.name === "Pessimistico" && <TrendingDown className="h-4 w-4 text-red-500" />}
                    {s.scenario.name === "Realistico" && <TrendingUp className="h-4 w-4 text-blue-500" />}
                    {s.scenario.name === "Ottimistico" && <TrendingUp className="h-4 w-4 text-green-500" />}
                    {s.scenario.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Info scenario */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Rendimento atteso:</span>
            <span className="font-medium">{(currentScenario.scenario.expectedReturn * 100).toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Inflazione:</span>
            <span className="font-medium">{(currentScenario.scenario.inflationRate * 100).toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Crescita risparmi:</span>
            <span className="font-medium">{(currentScenario.scenario.savingsGrowthRate * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          
          <div className="space-y-6">
            {timelineEvents.map((event, index) => {
              const isReached = event.date <= new Date()
              const Icon = event.type === "current" ? Flag : 
                         event.type === "fire" ? Flag : MilestoneIcon
              
              return (
                <div key={index} className="relative flex items-start gap-4">
                  <div className={cn(
                    "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background",
                    event.type === "current" && "border-primary bg-primary text-primary-foreground",
                    event.type === "fire" && "border-green-500",
                    event.type === "milestone" && "border-blue-500",
                    isReached && event.type !== "current" && "bg-green-500 text-white border-green-500"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">
                        {event.label}
                      </p>
                      {event.type === "fire" && (
                        <Badge variant="outline" className="text-xs">
                          FIRE!
                        </Badge>
                      )}
                      {isReached && event.type !== "current" && (
                        <Badge className="text-xs bg-green-500 text-white">
                          Raggiunto
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {event.date.toLocaleDateString('it-IT', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                      {event.amount && ` • ${formatCurrency(event.amount)}`}
                    </p>
                    {index === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Patrimonio attuale: {formatCurrency(currentSavings)}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Differenza tra scenari */}
        {yearsDifference > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground">
              La differenza tra lo scenario ottimistico e pessimistico è di{" "}
              <span className="font-medium text-foreground">
                {formatYears(yearsDifference)}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}