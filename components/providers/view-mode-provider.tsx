"use client";

import React, { createContext, useContext, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

type ViewMode = 'fire_only' | 'fire_budget'

interface ViewModeContextType {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  isLoading: boolean
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined)

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewModeState] = useState<ViewMode>('fire_budget')
  const [isLoading, setIsLoading] = useState(true)
  const { data: session, status } = useSession()
  const router = useRouter()

  // Carica la modalità di visualizzazione dal profilo utente
  useEffect(() => {
    const loadViewMode = async () => {
      try {
        if (!session?.user?.email) {
          setIsLoading(false)
          return
        }

        const response = await fetch('/api/profile/view-mode')
        if (!response.ok) {
          console.error("Errore nel caricamento della modalità di visualizzazione")
          setIsLoading(false)
          return
        }

        const data = await response.json()
        if (data.viewMode) {
          setViewModeState(data.viewMode as ViewMode)
        }
      } catch (error) {
        console.error("Errore nel caricamento della modalità di visualizzazione:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "loading") return
    
    if (status === "authenticated") {
      loadViewMode()
    } else {
      setViewModeState('fire_budget')
      setIsLoading(false)
    }
  }, [session, status])

  // Funzione per aggiornare la modalità di visualizzazione
  const setViewMode = async (mode: ViewMode) => {
    try {
      if (!session?.user?.email) return

      // Aggiorna lo stato locale immediatamente per un feedback rapido
      setViewModeState(mode)

      // Aggiorna il database via API
      const response = await fetch('/api/profile/view-mode', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ viewMode: mode }),
      })

      if (!response.ok) {
        console.error("Errore nell'aggiornamento della modalità di visualizzazione")
        // In caso di errore, ricarica la modalità dal database
        const getResponse = await fetch('/api/profile/view-mode')
        if (getResponse.ok) {
          const data = await getResponse.json()
          if (data.viewMode) {
            setViewModeState(data.viewMode as ViewMode)
          }
        }
      }
    } catch (error) {
      console.error("Errore nell'aggiornamento della modalità di visualizzazione:", error)
    }
  }

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode, isLoading }}>
      {children}
    </ViewModeContext.Provider>
  )
}

// Hook per utilizzare il context
export function useViewMode() {
  const context = useContext(ViewModeContext)
  if (context === undefined) {
    throw new Error("useViewMode deve essere utilizzato all'interno di ViewModeProvider")
  }
  return context
}

// Hook di utilità per verificare se siamo in modalità Solo FIRE
export function useIsFireOnly() {
  const { viewMode } = useViewMode()
  return viewMode === 'fire_only'
}

// Hook di utilità per verificare se siamo in modalità FIRE & Budget
export function useIsFireBudget() {
  const { viewMode } = useViewMode()
  return viewMode === 'fire_budget'
}