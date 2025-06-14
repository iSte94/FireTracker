"use client"

import { useSession } from "next-auth/react"

export function useAuthSync() {
  const { data: session, status } = useSession()
  
  return {
    user: session?.user || null,
    loading: status === "loading",
    initialized: status !== "loading",
    refreshSession: async () => {
      // Con Next-Auth, il refresh è gestito automaticamente
      // Questa funzione è mantenuta per compatibilità
      return true
    },
  }
}