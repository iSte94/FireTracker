"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

interface FireProgressData {
  fireProgress: number
  coastFireProgress: number
  baristaFireProgress: number
  fireTarget: number
  coastFireTarget: number
  baristaFireTarget: number
  currentNetWorth: number
}

// Funzione per ottenere i progressi FIRE tramite API
async function getFireProgress(): Promise<FireProgressData> {
  try {
    const response = await fetch('/api/fire/progress')
    if (!response.ok) {
      throw new Error('Failed to fetch fire progress')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching fire progress:', error)
    // Dati di fallback
    return {
      fireProgress: 0,
      coastFireProgress: 0,
      baristaFireProgress: 0,
      fireTarget: 0,
      coastFireTarget: 0,
      baristaFireTarget: 0,
      currentNetWorth: 0
    }
  }
}

export default function ProgressOverview() {
  const { data: session, status } = useSession()
  const [progressData, setProgressData] = useState<FireProgressData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        if (status === "loading") {
          return
        }

        if (!session?.user) {
          // Per utenti non autenticati, mostra tutto a zero
          setProgressData({
            fireProgress: 0,
            coastFireProgress: 0,
            baristaFireProgress: 0,
            fireTarget: 0,
            coastFireTarget: 0,
            baristaFireTarget: 0,
            currentNetWorth: 0
          })
          setLoading(false)
          return
        }

        const progress = await getFireProgress()
        setProgressData(progress)
      } catch (error) {
        console.error("Error fetching progress data:", error)
        setError("Errore nel caricamento dei dati")
      } finally {
        setLoading(false)
      }
    }

    fetchProgressData()
  }, [session, status])

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-3 w-48" />
          </div>
        ))}
      </div>
    )
  }

  if (error || !progressData) {
    return <div className="text-center text-red-500">{error || "Errore nel caricamento"}</div>
  }

  const { fireProgress, coastFireProgress, baristaFireProgress } = progressData

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium">FIRE</span>
          <span className="text-sm font-medium">{Math.round(fireProgress)}%</span>
        </div>
        <Progress value={Math.min(100, fireProgress)} className="h-2" />
        <div className="text-xs text-muted-foreground">Hai raggiunto il {Math.round(fireProgress)}% del tuo obiettivo FIRE</div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Coast FIRE</span>
          <span className="text-sm font-medium">{Math.round(coastFireProgress)}%</span>
        </div>
        <Progress value={Math.min(100, coastFireProgress)} className="h-2" />
        <div className="text-xs text-muted-foreground">
          Hai raggiunto il {Math.round(coastFireProgress)}% del tuo obiettivo Coast FIRE
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Barista FIRE</span>
          <span className="text-sm font-medium">{Math.round(baristaFireProgress)}%</span>
        </div>
        <Progress value={Math.min(100, baristaFireProgress)} className="h-2" />
        <div className="text-xs text-muted-foreground">
          Hai raggiunto il {Math.round(baristaFireProgress)}% del tuo obiettivo Barista FIRE
        </div>
      </div>
    </div>
  )
}
