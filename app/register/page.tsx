"use client" // Necessario per useSession e useRouter

import AuthForm from "@/components/auth/auth-form"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function RegisterPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [session, status, router])

  if (status === "loading" || status === "authenticated") {
    // Mostra un loader o nulla mentre si verifica la sessione o si reindirizza
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
        <p>Caricamento...</p>
      </main>
    )
  }

  // Se non autenticato, mostra il form di registrazione
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Crea un account</h1>
          <p className="mt-2 text-muted-foreground">
            Registrati per iniziare a tracciare il tuo percorso verso l'indipendenza finanziaria
          </p>
        </div>
        <AuthForm />
      </div>
    </main>
  )
}
