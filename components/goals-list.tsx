"use client"

import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Dati di esempio per gli obiettivi
const goals = [
  {
    id: "1",
    name: "FIRE",
    target: 705000,
    current: 120000,
    progress: 17,
    targetDate: "2035-01-01",
    status: "In corso",
  },
  {
    id: "2",
    name: "Coast FIRE",
    target: 300000,
    current: 120000,
    progress: 40,
    targetDate: "2028-01-01",
    status: "In corso",
  },
  {
    id: "3",
    name: "Barista FIRE",
    target: 400000,
    current: 120000,
    progress: 30,
    targetDate: "2030-01-01",
    status: "In corso",
  },
  {
    id: "4",
    name: "Fondo Emergenza",
    target: 15000,
    current: 15000,
    progress: 100,
    targetDate: "2023-01-01",
    status: "Completato",
  },
]

export default function GoalsList() {
  // Funzione per formattare la data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("it-IT", { year: "numeric", month: "long" })
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <Card key={goal.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{goal.name}</h3>
                <Badge variant={goal.progress === 100 ? "default" : "outline"}>{goal.status}</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>€{goal.current.toLocaleString()}</span>
                  <span>{goal.progress}%</span>
                  <span>€{goal.target.toLocaleString()}</span>
                </div>
                <Progress value={goal.progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Target: {formatDate(goal.targetDate)}</span>
                  <span>Mancano: €{(goal.target - goal.current).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
