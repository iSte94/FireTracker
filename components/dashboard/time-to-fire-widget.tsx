"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Calendar, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

interface TimeToFireData {
  yearsToFire: number
  monthsToFire: number
  currentNetWorth: number
  fireNumber: number
  monthlyContribution: number
  expectedReturnRate: number
}

export function TimeToFireWidget() {
  const [data, setData] = useState<TimeToFireData>({
    yearsToFire: 12.5,
    monthsToFire: 150,
    currentNetWorth: 120000,
    fireNumber: 750000,
    monthlyContribution: 3500,
    expectedReturnRate: 7
  })

  const progressPercentage = (data.currentNetWorth / data.fireNumber) * 100
  const totalMonths = data.yearsToFire * 12
  const monthsPassed = data.monthsToFire - totalMonths

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Tempo al FIRE
        </CardTitle>
        <CardDescription>
          Stima del tempo rimanente per raggiungere l'indipendenza finanziaria
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-2xl font-bold">{data.yearsToFire.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">anni rimanenti</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{totalMonths.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">mesi rimanenti</p>
          </div>
        </div>

        <div className="pt-3 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Contributo mensile</span>
            <span className="font-medium">€{data.monthlyContribution.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Rendimento atteso</span>
            <span className="font-medium">{data.expectedReturnRate}% annuo</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">FIRE Number</span>
            <span className="font-medium">€{data.fireNumber.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-emerald-600">
          <TrendingUp className="h-4 w-4" />
          <span>Sei in anticipo di 3 mesi rispetto alla previsione iniziale</span>
        </div>
      </CardContent>
    </Card>
  )
}