"use client"

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@/lib/supabase-client'
import type { User } from '@supabase/supabase-js'

export function useAuthSync() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log('useAuthSync: Inizializzazione autenticazione...')
        
        // Controlla se siamo nel browser
        if (typeof window === 'undefined') {
          setLoading(false)
          return
        }

        // Prima prova a ottenere la sessione corrente
        const { data: { session }, error } = await supabase.auth.getSession()
        
        console.log('useAuthSync: Sessione corrente:', !!session)
        console.log('useAuthSync: Errore:', error)
        
        if (mounted) {
          if (session?.user) {
            console.log('useAuthSync: Utente trovato:', session.user.id)
            setUser(session.user)
          } else {
            console.log('useAuthSync: Nessun utente nella sessione')
            setUser(null)
          }
          setLoading(false)
          setInitialized(true)
        }
      } catch (err) {
        console.error('useAuthSync: Errore nell\'inizializzazione:', err)
        if (mounted) {
          setUser(null)
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    // Inizializza l'autenticazione
    initializeAuth()

    // Ascolta i cambiamenti di stato dell'autenticazione
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useAuthSync: Auth state change:', event, !!session?.user)
        
        if (mounted) {
          if (session?.user) {
            console.log('useAuthSync: Nuovo utente da auth change:', session.user.id)
            setUser(session.user)
          } else {
            console.log('useAuthSync: Utente rimosso da auth change')
            setUser(null)
          }
          setLoading(false)
          setInitialized(true)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  // Funzione per forzare il refresh della sessione
  const refreshSession = async () => {
    try {
      console.log('useAuthSync: Refresh manuale della sessione...')
      const { data: { session }, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.log('useAuthSync: Errore nel refresh:', error.message)
        return false
      }
      
      if (session?.user) {
        console.log('useAuthSync: Sessione refreshata con successo:', session.user.id)
        setUser(session.user)
        return true
      }
      
      return false
    } catch (err) {
      console.error('useAuthSync: Errore nel refresh manuale:', err)
      return false
    }
  }

  return {
    user,
    loading,
    initialized,
    refreshSession,
  }
}