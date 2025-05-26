"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@/lib/supabase-client"
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
  const supabase = createClientComponentClient()
  const router = useRouter()

  // Carica la modalità di visualizzazione dal profilo utente
  useEffect(() => {
    const loadViewMode = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setIsLoading(false)
          return
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("view_mode")
          .eq("id", user.id)
          .single()

        if (error) {
          console.error("Errore nel caricamento della modalità di visualizzazione:", error)
        } else if (profile?.view_mode) {
          setViewModeState(profile.view_mode as ViewMode)
        }
      } catch (error) {
        console.error("Errore nel caricamento della modalità di visualizzazione:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadViewMode()

    // Ascolta i cambiamenti di autenticazione
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadViewMode()
      } else if (event === 'SIGNED_OUT') {
        setViewModeState('fire_budget')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Funzione per aggiornare la modalità di visualizzazione
  const setViewMode = async (mode: ViewMode) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Aggiorna lo stato locale immediatamente per un feedback rapido
      setViewModeState(mode)

      // Aggiorna il database
      const { error } = await supabase
        .from("profiles")
        .update({ view_mode: mode })
        .eq("id", user.id)

      if (error) {
        console.error("Errore nell'aggiornamento della modalità di visualizzazione:", error)
        // In caso di errore, ricarica la modalità dal database
        const { data: profile } = await supabase
          .from("profiles")
          .select("view_mode")
          .eq("id", user.id)
          .single()
        
        if (profile?.view_mode) {
          setViewModeState(profile.view_mode as ViewMode)
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