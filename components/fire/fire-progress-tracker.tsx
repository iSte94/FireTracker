"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Target, Zap, Coffee, Gem } from "lucide-react"
import { formatCurrency, FIRE_TYPES, calculateTimeToFire } from "@/lib/fire-calculations"
import { cn } from "@/lib/utils"

interface FireProgressTrackerProps {
  currentSavings: number
  annualExpenses: number
  annualSavings: number
  expectedReturn?: number
  inflationRate?: number
}

const fireIcons = {
  traditional: Target,
  coast: Zap,
  barista: Coffee,
  fat: Gem
}

const fireColors = {
  traditional: "bg-blue-500",
  coast: "bg-green-500",
  barista: "bg-orange-500",
  fat: "bg-purple-500"
}

export function FireProgressTracker({
  currentSavings,
  annualExpenses,
  annualSavings,
  expectedReturn = 0.07,
  inflationRate = 0.02
}: FireProgressTrackerProps) {
  // Calcola il progresso per ogni tipo di FIRE
  const fireProgress = Object.entries(FIRE_TYPES).map(([key, type]) => {
    const fireNumber = annualExpenses * type.multiplier
    const percentage = Math.min((currentSavings / fireNumber) * 100, 100)
    const remaining = Math.max(fireNumber - currentSavings, 0)
    const timeToFire = calculateTimeToFire(
      currentSavings,
      annualSavings,
      fireNumber,
      expectedReturn,
      inflationRate
    )
    
    const Icon = fireIcons[key as keyof typeof fireIcons]
    const colorClass = fireColors[key as keyof typeof fireColors]
    
    return {
      key,
      ...type,
      fireNumber,
      percentage,
      remaining,
      timeToFire,
      Icon,
      colorClass,
      reached: percentage >= 100
    }
  })

  // Calcola la velocità di accumulo mensile
  const monthlyAccumulation = annualSavings / 12
  const monthlyReturn = currentSavings * (Math.pow(1 + expectedReturn, 1/12) - 1)
  const totalMonthlyGrowth = monthlyAccumulation + monthlyReturn

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Progresso FIRE
        </CardTitle>
        <CardDescription>
          Monitoraggio del tuo percorso verso l'indipendenza finanziaria
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Velocità di accumulo */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Velocità di accumulo</span>
            <Badge variant="secondary" className="font-mono">
              {formatCurrency(totalMonthlyGrowth)}/mese
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Risparmi mensili:</span>
              <span className="ml-2 font-medium">{formatCurrency(monthlyAccumulation)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Rendimenti mensili:</span>
              <span className="ml-2 font-medium">{formatCurrency(monthlyReturn)}</span>
            </div>
          </div>
        </div>

        {/* Progresso per ogni tipo di FIRE */}
        <div className="space-y-4">
          {fireProgress.map((fire) => (
            <div key={fire.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <fire.Icon className={cn("h-4 w-4", fire.reached && "text-green-500")} />
                  <span className="font-medium">{fire.name}</span>
                  {fire.reached && (
                    <Badge className="ml-2 bg-green-500 text-white border-green-500">
                      Raggiunto!
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {formatCurrency(currentSavings)} / {formatCurrency(fire.fireNumber)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {fire.percentage.toFixed(1)}% completato
                  </div>
                </div>
              </div>
              
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn("h-full w-full flex-1 transition-all", fire.colorClass)}
                  style={{ transform: `translateX(-${100 - fire.percentage}%)` }}
                />
              </div>
              
              {!fire.reached && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Mancano: {formatCurrency(fire.remaining)}</span>
                  <span>~{fire.timeToFire.years.toFixed(1)} anni</span>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                {fire.description}
              </p>
            </div>
          ))}
        </div>

        {/* Riepilogo */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Patrimonio attuale:</span>
              <div className="font-semibold text-lg">{formatCurrency(currentSavings)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Spese annuali:</span>
              <div className="font-semibold text-lg">{formatCurrency(annualExpenses)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}