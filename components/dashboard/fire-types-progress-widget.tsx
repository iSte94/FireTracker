"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Flame, Coffee, Palmtree, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface FireType {
  name: string
  icon: React.ReactNode
  description: string
  targetAmount: number
  currentProgress: number
  yearsToReach: number
  monthlyRequired: number
  achieved: boolean
}

export function FireTypesProgressWidget() {
  const currentNetWorth = 120000
  const monthlyContribution = 3500
  const annualExpenses = 30000

  const fireTypes: FireType[] = [
    {
      name: "Coast FIRE",
      icon: <Palmtree className="h-5 w-5" />,
      description: "Hai abbastanza risparmi che cresceranno fino al FIRE senza ulteriori contributi",
      targetAmount: 250000,
      currentProgress: (currentNetWorth / 250000) * 100,
      yearsToReach: 3.5,
      monthlyRequired: 0,
      achieved: false
    },
    {
      name: "Barista FIRE",
      icon: <Coffee className="h-5 w-5" />,
      description: "Puoi coprire le spese base con un lavoro part-time",
      targetAmount: 375000,
      currentProgress: (currentNetWorth / 375000) * 100,
      yearsToReach: 6.2,
      monthlyRequired: 1500,
      achieved: false
    },
    {
      name: "FIRE Tradizionale",
      icon: <Flame className="h-5 w-5" />,
      description: "Indipendenza finanziaria completa con il 4% SWR",
      targetAmount: 750000,
      currentProgress: (currentNetWorth / 750000) * 100,
      yearsToReach: 12.5,
      monthlyRequired: 0,
      achieved: false
    },
    {
      name: "Fat FIRE",
      icon: <Flame className="h-5 w-5 text-amber-500" />,
      description: "FIRE con uno stile di vita più abbondante",
      targetAmount: 1250000,
      currentProgress: (currentNetWorth / 1250000) * 100,
      yearsToReach: 20.3,
      monthlyRequired: 0,
      achieved: false
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5" />
          Progresso FIRE Types
        </CardTitle>
        <CardDescription>
          Il tuo progresso verso diversi tipi di indipendenza finanziaria
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {fireTypes.map((fireType, index) => (
          <div key={index} className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  fireType.achieved ? "bg-emerald-100 text-emerald-700" : "bg-muted"
                }`}>
                  {fireType.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{fireType.name}</h4>
                    {fireType.achieved && (
                      <Badge variant="default" className="text-xs">
                        Raggiunto!
                      </Badge>
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>{fireType.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    €{fireType.targetAmount.toLocaleString()} obiettivo
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{fireType.currentProgress.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">
                  {fireType.yearsToReach} anni
                </p>
              </div>
            </div>
            
            <Progress 
              value={fireType.currentProgress} 
              className="h-2"
            />
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                €{currentNetWorth.toLocaleString()} / €{fireType.targetAmount.toLocaleString()}
              </span>
              {fireType.monthlyRequired > 0 && (
                <span className="text-muted-foreground">
                  Richiede €{fireType.monthlyRequired.toLocaleString()}/mese di reddito
                </span>
              )}
            </div>
          </div>
        ))}

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            💡 <strong>Suggerimento:</strong> Sei sulla buona strada per Coast FIRE! 
            Una volta raggiunto, potresti ridurre il tuo tasso di risparmio o passare a un lavoro meno stressante.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}