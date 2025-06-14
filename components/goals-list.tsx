"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Target } from "lucide-react"
import Link from "next/link"

interface Goal {
  id: string
  name: string
  target: number
  current: number
  progress: number
  targetDate: string
  status: string
}

// Funzione per ottenere gli obiettivi dell'utente
async function getUserGoals(userId: string): Promise<Goal[]> {
  try {
    const response = await fetch(`/api/goals?userId=${userId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch goals')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching goals:', error)
    return []
  }
}

export default function GoalsList() {
  const { data: session, status } = useSession()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Funzione per formattare la data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("it-IT", { year: "numeric", month: "long" })
  }

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        if (status === "loading") {
          return
        }

        if (!session?.user?.id) {
          // Per utenti non autenticati, mostra lista vuota
          setGoals([])
          setLoading(false)
          return
        }

        const userGoals = await getUserGoals(session.user.id)
        setGoals(userGoals)
      } catch (error) {
        console.error("Error fetching goals:", error)
        setError("Errore nel caricamento degli obiettivi")
      } finally {
        setLoading(false)
      }
    }

    fetchGoals()
  }, [session, status])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-2 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Riprova
        </Button>
      </div>
    )
  }

  if (goals.length === 0) {
    return (
      <div className="text-center py-8">
        <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Nessun obiettivo definito</h3>
        <p className="text-muted-foreground mb-6">
          Inizia a definire i tuoi obiettivi finanziari per tracciare i progressi verso l'indipendenza finanziaria.
        </p>
        <Button asChild>
          <Link href="/goals">
            <Plus className="h-4 w-4 mr-2" />
            Crea il tuo primo obiettivo
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <Card key={goal.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{goal.name}</h3>
                <Badge variant={goal.progress === 100 ? "default" : "outline"}>
                  {goal.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>€{goal.current.toLocaleString()}</span>
                  <span>{goal.progress.toFixed(1)}%</span>
                  <span>€{goal.target.toLocaleString()}</span>
                </div>
                <Progress value={Math.min(100, goal.progress)} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Target: {formatDate(goal.targetDate)}</span>
                  <span>
                    {goal.target > goal.current 
                      ? `Mancano: €${(goal.target - goal.current).toLocaleString()}`
                      : "Obiettivo raggiunto!"
                    }
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <div className="pt-4 border-t">
        <Button variant="outline" asChild className="w-full">
          <Link href="/goals">
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi nuovo obiettivo
          </Link>
        </Button>
      </div>
    </div>
  )
}
