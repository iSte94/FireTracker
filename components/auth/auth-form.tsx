"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function AuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  // const supabase = createClientComponentClient() // Rimosso client Supabase
  const pathname = usePathname() // Mantenuto per eventuale logica di redirect pre-autenticazione

  // useEffect rimosso perché la gestione della sessione e redirect
  // per utenti già loggati sarà gestita da next-auth middleware o nelle pagine stesse.

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullName
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        console.error('Registration failed:', result.error)
        setError(result.error || 'Errore durante la registrazione')
        setLoading(false)
        return
      }

      console.log('Registration successful:', result.message)
      // Opzione 1: Login automatico dopo la registrazione
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (signInResult?.error) {
        setError(signInResult.error === "CredentialsSignin" ? "Credenziali non valide dopo la registrazione." : signInResult.error)
        // Potresti reindirizzare alla pagina di login con un messaggio di successo per la registrazione
        // router.push('/login?message=Registrazione completata! Effettua il login.');
      } else if (signInResult?.ok) {
        router.push("/dashboard") // O la pagina desiderata dopo il login
        router.refresh()
      } else {
         // Fallback se signInResult è undefined o non ha ok/error
        setError("Registrazione completata, ma si è verificato un problema con il login automatico.")
        router.push("/login?message=Registrazione completata! Effettua il login.")
      }
      // Opzione 2: Reindirizza alla pagina di login con messaggio di successo
      // setError("Registrazione completata con successo! Ora puoi effettuare il login.")
      // router.push("/login")


    } catch (err) {
      console.error('Registration exception:', err)
      setError('Si è verificato un errore imprevisto durante la registrazione')
    }

    setLoading(false)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    console.log('Tentativo di login per:', email)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false, // Importante per gestire la risposta qui
    })

    console.log('NextAuth signIn result:', result)

    if (result?.error) {
      console.error('Login error:', result.error)
      // next-auth potrebbe restituire "CredentialsSignin" per errori generici di credenziali
      if (result.error === "CredentialsSignin") {
        setError("Credenziali non valide. Controlla email e password.")
      } else {
        setError(result.error)
      }
    } else if (result?.ok) {
      console.log('Login successful, redirecting to dashboard...')
      router.push("/dashboard")
      router.refresh() // Assicura che lo stato della sessione sia aggiornato
    } else {
      // Caso in cui result è undefined o non ha né error né ok
      // Questo non dovrebbe accadere con il provider Credentials se configurato correttamente
      setError("Si è verificato un errore sconosciuto durante il login.")
    }
    setLoading(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <Tabs defaultValue="login">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Accedi</TabsTrigger>
          <TabsTrigger value="register">Registrati</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <form onSubmit={handleSignIn}>
            <CardHeader>
              <CardTitle>Accedi</CardTitle>
              <CardDescription>Inserisci le tue credenziali per accedere al tuo account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@esempio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                {loading ? "Accesso in corso..." : "Accedi"}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>

        <TabsContent value="register">
          <form onSubmit={handleSignUp}>
            <CardHeader>
              <CardTitle>Registrati</CardTitle>
              <CardDescription>Crea un nuovo account per iniziare a tracciare il tuo percorso FIRE.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Mario Rossi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailRegister">Email</Label>
                <Input
                  id="emailRegister"
                  type="email"
                  placeholder="nome@esempio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordRegister">Password</Label>
                <Input
                  id="passwordRegister"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                {loading ? "Registrazione in corso..." : "Registrati"}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
