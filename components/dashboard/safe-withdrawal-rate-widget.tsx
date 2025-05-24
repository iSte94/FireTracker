"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, TrendingDown, Wallet } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState } from "react"

interface SWRScenario {
  rate: number
  monthlyAmount: number
  yearlyAmount: number
  label: string
  description: string
  risk: "low" | "medium" | "high"
}

export function SafeWithdrawalRateWidget() {
  const [selectedRate, setSelectedRate] = useState(4)
  const currentNetWorth = 120000
  const fireNumber = 750000
  
  const scenarios: SWRScenario[] = [
    {
      rate: 3,
      monthlyAmount: Math.round((fireNumber * 0.03) / 12),
      yearlyAmount: Math.round(fireNumber * 0.03),
      label: "Conservativo",
      description: "Molto sicuro, ideale per FIRE precoce o periodi economici incerti",
      risk: "low"
    },
    {
      rate: 3.5,
      monthlyAmount: Math.round((fireNumber * 0.035) / 12),
      yearlyAmount: Math.round(fireNumber * 0.035),
      label: "Moderato",
      description: "Buon equilibrio tra sicurezza e reddito",
      risk: "low"
    },
    {
      rate: 4,
      monthlyAmount: Math.round((fireNumber * 0.04) / 12),
      yearlyAmount: Math.round(fireNumber * 0.04),
      label: "Standard",
      description: "La regola del 4% - storicamente sicura per 30 anni",
      risk: "medium"
    },
    {
      rate: 4.5,
      monthlyAmount: Math.round((fireNumber * 0.045) / 12),
      yearlyAmount: Math.round(fireNumber * 0.045),
      label: "Aggressivo",
      description: "Maggior reddito ma richiede flessibilità",
      risk: "high"
    }
  ]

  const currentScenario = scenarios.find(s => s.rate === selectedRate) || scenarios[2]
  const currentMonthlyWithdrawal = Math.round((currentNetWorth * (selectedRate / 100)) / 12)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Safe Withdrawal Rate (SWR)
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Il SWR è la percentuale del tuo portafoglio che puoi prelevare annualmente mantenendo il capitale nel lungo termine</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>
          Proiezioni di prelievo basate sul tuo FIRE Number
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {scenarios.map((scenario) => (
            <button
              key={scenario.rate}
              onClick={() => setSelectedRate(scenario.rate)}
              className={`w-full p-3 rounded-lg border transition-all ${
                selectedRate === scenario.rate
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{scenario.rate}%</span>
                      <Badge 
                        variant={
                          scenario.risk === "low" ? "default" : 
                          scenario.risk === "medium" ? "secondary" : 
                          "destructive"
                        }
                        className="text-xs"
                      >
                        {scenario.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {scenario.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">€{scenario.monthlyAmount.toLocaleString()}/mese</p>
                  <p className="text-xs text-muted-foreground">€{scenario.yearlyAmount.toLocaleString()}/anno</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="pt-4 border-t space-y-3">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-1">Con il tuo patrimonio attuale</p>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">€{currentMonthlyWithdrawal.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">al mese</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Basato su €{currentNetWorth.toLocaleString()} al {selectedRate}%
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-amber-600">
            <TrendingDown className="h-4 w-4" />
            <span>Considera di ridurre il SWR nei primi anni di FIRE per maggiore sicurezza</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}