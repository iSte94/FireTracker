"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface FireData {
  annualExpenses: number
  currentNetWorth: number
  fireNumber: number
  progressPercentage: number
  swr: number
}

export default function FireNumberCard() {
  const { data: session } = useSession()
  const [fireData, setFireData] = useState<FireData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFireData = async () => {
      try {
        if (!session?.user?.id) {
          // Per nuovi utenti, mostra tutto a zero
          setFireData({
            annualExpenses: 0,
            currentNetWorth: 0,
            fireNumber: 0,
            progressPercentage: 0,
            swr: 4.0
          })
          setLoading(false)
          return
        }

        // TODO: Implementare chiamata API per ottenere dati reali
        // Per ora, calcoliamo basandoci sui budget esistenti
        const response = await fetch('/api/fire/progress')
        if (response.ok) {
          const data = await response.json()
          setFireData({
            annualExpenses: data.annualExpenses || 0,
            currentNetWorth: data.currentNetWorth || 0,
            fireNumber: data.fireTarget || 0,
            progressPercentage: data.fireProgress || 0,
            swr: 4.0
          })
        } else {
          // Fallback a zero se non ci sono dati
          setFireData({
            annualExpenses: 0,
            currentNetWorth: 0,
            fireNumber: 0,
            progressPercentage: 0,
            swr: 4.0
          })
        }
      } catch (error) {
        console.error("Errore nel caricamento dati FIRE:", error)
        setFireData({
          annualExpenses: 0,
          currentNetWorth: 0,
          fireNumber: 0,
          progressPercentage: 0,
          swr: 4.0
        })
      } finally {
        setLoading(false)
      }
    }

    loadFireData()
  }, [session?.user?.id])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-2 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  if (!fireData) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Errore nel caricamento dei dati</p>
      </div>
    )
  }

  const { annualExpenses, currentNetWorth, fireNumber, progressPercentage, swr } = fireData

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium">FIRE Number</span>
          <span className="text-sm font-medium">
            {fireNumber > 0 ? `€${fireNumber.toLocaleString()}` : "Non calcolabile"}
          </span>
        </div>
        <Progress value={Math.min(100, progressPercentage)} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>€0</span>
          <span>{progressPercentage.toFixed(1)}%</span>
          <span>
            {fireNumber > 0 ? `€${fireNumber.toLocaleString()}` : "€0"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground">Spese Annuali</div>
            <div className="text-xl font-bold mt-1">
              {annualExpenses > 0 ? `€${annualExpenses.toLocaleString()}` : "€0"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground">SWR</div>
            <div className="text-xl font-bold mt-1">{swr}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">
          {annualExpenses > 0 ? "Basato su" : "Come iniziare"}
        </div>
        {annualExpenses > 0 ? (
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Spese mensili di €{(annualExpenses / 12).toLocaleString()}</li>
            <li>• Safe Withdrawal Rate del {swr}%</li>
            <li>• Patrimonio netto attuale di €{currentNetWorth.toLocaleString()}</li>
          </ul>
        ) : (
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Aggiungi transazioni per calcolare le spese</li>
            <li>• Registra investimenti per il patrimonio netto</li>
            <li>• Il FIRE Number sarà calcolato automaticamente</li>
          </ul>
        )}
      </div>
    </div>
  )
}
