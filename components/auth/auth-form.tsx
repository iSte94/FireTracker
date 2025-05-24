"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@/lib/supabase-client"
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
  const supabase = createClientComponentClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Usa la nostra API per la registrazione
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
      // Successo - vai alla pagina di verifica email
      router.push("/auth/check-email")

    } catch (err) {
      console.error('Registration exception:', err)
      setError('Si è verificato un errore durante la registrazione')
    }

    setLoading(false)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    console.log('=== LOGIN FORM DEBUG ===')
    console.log('Tentativo di login per:', email)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log('Login result - Error:', error)
    console.log('Login result - Session presente:', !!data.session)
    console.log('Login result - User presente:', !!data.user)

    if (error) {
      console.error('Login error:', error)
      setError(error.message)
    } else {
      console.log('Login successful, redirecting to dashboard...')
      
      // Verifica la sessione dopo il login
      const { data: sessionData } = await supabase.auth.getSession()
      console.log('Sessione dopo login:', !!sessionData.session)
      
      router.push("/dashboard")
      router.refresh()
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
