"use client"

import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"

export default function FireNumberCard() {
  // Dati di esempio
  const annualExpenses = 28200 // €28,200 di spese annuali
  const swr = 0.04 // Safe Withdrawal Rate del 4%
  const fireNumber = annualExpenses / swr // €705,000
  const currentNetWorth = 120000 // €120,000 di patrimonio netto attuale
  const progressPercentage = (currentNetWorth / fireNumber) * 100 // 17% di progresso

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium">FIRE Number</span>
          <span className="text-sm font-medium">€{fireNumber.toLocaleString()}</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>€0</span>
          <span>{progressPercentage.toFixed(1)}%</span>
          <span>€{fireNumber.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground">Spese Annuali</div>
            <div className="text-xl font-bold mt-1">€{annualExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground">SWR</div>
            <div className="text-xl font-bold mt-1">{swr * 100}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">Basato su</div>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Spese mensili di €2,350</li>
          <li>• Safe Withdrawal Rate del 4%</li>
          <li>• Patrimonio netto attuale di €120,000</li>
        </ul>
      </div>
    </div>
  )
}
