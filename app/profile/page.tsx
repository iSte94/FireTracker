"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, Eye, Calculator } from "lucide-react"
import { Switch } from "@/components/ui/switch"

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    const fetchProfile = async () => {
      if (status === "loading") return
      
      if (!session?.user) {
        router.push("/login")
        return
      }

      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const profileData = await response.json()
          setProfile(profileData)
        } else {
          setError("Errore nel caricamento del profilo")
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        setError("Errore nel caricamento del profilo")
      }

      setLoading(false)
    }

    fetchProfile()
  }, [router, session, status])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    if (!session?.user) return

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: profile.fullName,
          monthlyExpenses: profile.monthlyExpenses,
          annualExpenses: profile.annualExpenses,
          currentAge: profile.currentAge,
          retirementAge: profile.retirementAge,
          swrRate: profile.swrRate,
          expectedReturn: profile.expectedReturn,
          inflationRate: profile.inflationRate,
          viewMode: profile.viewMode,
        }),
      })

      if (response.ok) {
        setSuccess("Profilo aggiornato con successo")
      } else {
        setError("Errore nell'aggiornamento del profilo")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("Errore nell'aggiornamento del profilo")
    }

    setSaving(false)
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setChangingPassword(true)
    setError(null)
    setSuccess(null)

    if (newPassword !== confirmPassword) {
      setError("Le password non corrispondono")
      setChangingPassword(false)
      return
    }

    if (newPassword.length < 6) {
      setError("La password deve essere di almeno 6 caratteri")
      setChangingPassword(false)
      return
    }

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess("Password cambiata con successo")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        setError(result.error || "Errore nel cambio password")
      }
    } catch (error) {
      console.error("Error changing password:", error)
      setError("Errore nel cambio password")
    }

    setChangingPassword(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <main className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Il tuo profilo</h1>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personal">Dati personali</TabsTrigger>
          <TabsTrigger value="financial">Parametri finanziari</TabsTrigger>
          <TabsTrigger value="preferences">Preferenze</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <form onSubmit={handleProfileUpdate}>
              <CardHeader>
                <CardTitle>Dati personali</CardTitle>
                <CardDescription>Aggiorna le tue informazioni personali</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="bg-emerald-50 text-emerald-800 border-emerald-200">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={session?.user?.email || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={profile?.fullName || ""}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currentAge">Età attuale</Label>
                    <Input
                      id="currentAge"
                      type="number"
                      value={profile?.currentAge || 30}
                      onChange={(e) => setProfile({ ...profile, currentAge: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retirementAge">Età di pensionamento</Label>
                    <Input
                      id="retirementAge"
                      type="number"
                      value={profile?.retirementAge || 65}
                      onChange={(e) => setProfile({ ...profile, retirementAge: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
                  {saving ? "Salvataggio..." : "Salva modifiche"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <form onSubmit={handleProfileUpdate}>
              <CardHeader>
                <CardTitle>Parametri finanziari</CardTitle>
                <CardDescription>Aggiorna i parametri utilizzati per i calcoli FIRE</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="bg-emerald-50 text-emerald-800 border-emerald-200">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyExpenses">Spese mensili (€)</Label>
                    <Input
                      id="monthlyExpenses"
                      type="number"
                      value={profile?.monthlyExpenses || 2350}
                      onChange={(e) => {
                        const monthly = Number(e.target.value)
                        setProfile({
                          ...profile,
                          monthlyExpenses: monthly,
                          annualExpenses: monthly * 12,
                        })
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="annualExpenses">Spese annuali (€)</Label>
                    <Input
                      id="annualExpenses"
                      type="number"
                      value={profile?.annualExpenses || 28200}
                      onChange={(e) => {
                        const annual = Number(e.target.value)
                        setProfile({
                          ...profile,
                          annualExpenses: annual,
                          monthlyExpenses: Math.round(annual / 12),
                        })
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="swrRate">Safe Withdrawal Rate (%)</Label>
                    <span className="text-sm">{profile?.swrRate || 4}%</span>
                  </div>
                  <Slider
                    id="swrRate"
                    min={2}
                    max={6}
                    step={0.1}
                    value={[profile?.swrRate || 4]}
                    onValueChange={(value) => setProfile({ ...profile, swrRate: value[0] })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="expectedReturn">Rendimento atteso (%)</Label>
                    <span className="text-sm">{profile?.expectedReturn || 7}%</span>
                  </div>
                  <Slider
                    id="expectedReturn"
                    min={1}
                    max={12}
                    step={0.5}
                    value={[profile?.expectedReturn || 7]}
                    onValueChange={(value) => setProfile({ ...profile, expectedReturn: value[0] })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="inflationRate">Inflazione (%)</Label>
                    <span className="text-sm">{profile?.inflationRate || 2}%</span>
                  </div>
                  <Slider
                    id="inflationRate"
                    min={0}
                    max={5}
                    step={0.1}
                    value={[profile?.inflationRate || 2]}
                    onValueChange={(value) => setProfile({ ...profile, inflationRate: value[0] })}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
                  {saving ? "Salvataggio..." : "Salva modifiche"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferenze di visualizzazione</CardTitle>
              <CardDescription>Personalizza come vuoi visualizzare l'applicazione</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="view-mode" className="text-base font-medium">
                      Modalità di visualizzazione
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {profile?.viewMode === 'fire_only'
                        ? "Attualmente stai visualizzando solo le funzionalità FIRE"
                        : "Attualmente stai visualizzando sia FIRE che Budget"}
                    </p>
                  </div>
                  <Switch
                    id="view-mode"
                    checked={profile?.viewMode === 'fire_budget'}
                    onCheckedChange={(checked) => {
                      setProfile({
                        ...profile,
                        viewMode: checked ? 'fire_budget' : 'fire_only'
                      })
                    }}
                  />
                </div>
                
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-emerald-600" />
                    <h4 className="font-medium">Solo FIRE</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Concentrati esclusivamente sul tuo percorso verso l'indipendenza finanziaria.
                    Visualizza solo le metriche FIRE, i calcolatori e il tracciamento del patrimonio netto.
                  </p>
                </div>
                
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium">FIRE & Budget</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Visualizzazione completa con tutte le funzionalità: tracciamento FIRE,
                    gestione del budget mensile, categorie di spesa e analisi dettagliate delle finanze.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleProfileUpdate}
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={saving}
              >
                {saving ? "Salvataggio..." : "Salva preferenze"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Gestisci le impostazioni del tuo account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex items-center gap-2">
                  <Input value={session?.user?.email || ""} disabled />
                  <Button variant="outline" size="sm" disabled>
                    Cambia email
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <Label>Password</Label>
                <form onSubmit={handlePasswordChange} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Password attuale</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nuova password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Conferma nuova password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    variant="outline" 
                    size="sm" 
                    disabled={changingPassword}
                    className="w-full"
                  >
                    {changingPassword ? "Cambiando..." : "Cambia password"}
                  </Button>
                </form>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="text-red-500 hover:text-red-700" onClick={handleSignOut}>
                Disconnetti
              </Button>
              <Button variant="destructive" disabled>
                Elimina account
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
