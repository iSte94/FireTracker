"use client"

import { Progress } from "@/components/ui/progress"

export default function ProgressOverview() {
  // Dati di esempio
  const fireProgress = 17 // 17% di progresso verso FIRE
  const coastFireProgress = 42 // 42% di progresso verso Coast FIRE
  const baristaFireProgress = 68 // 68% di progresso verso Barista FIRE

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium">FIRE</span>
          <span className="text-sm font-medium">{fireProgress}%</span>
        </div>
        <Progress value={fireProgress} className="h-2" />
        <div className="text-xs text-muted-foreground">Hai raggiunto il {fireProgress}% del tuo obiettivo FIRE</div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Coast FIRE</span>
          <span className="text-sm font-medium">{coastFireProgress}%</span>
        </div>
        <Progress value={coastFireProgress} className="h-2" />
        <div className="text-xs text-muted-foreground">
          Hai raggiunto il {coastFireProgress}% del tuo obiettivo Coast FIRE
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Barista FIRE</span>
          <span className="text-sm font-medium">{baristaFireProgress}%</span>
        </div>
        <Progress value={baristaFireProgress} className="h-2" />
        <div className="text-xs text-muted-foreground">
          Hai raggiunto il {baristaFireProgress}% del tuo obiettivo Barista FIRE
        </div>
      </div>
    </div>
  )
}
