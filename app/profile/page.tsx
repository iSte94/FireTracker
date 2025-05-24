"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@/lib/supabase-client"
import { updateProfile } from "@/lib/db-client"
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
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      setUser(user)

      const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error) {
        console.error("Error fetching profile:", error)
        setError("Errore nel caricamento del profilo")
      } else {
        setProfile(profile)
      }

      setLoading(false)
    }

    fetchUserAndProfile()
  }, [router, supabase])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    if (!user) return

    try {
      const updatedProfile = await updateProfile(user.id, {
        full_name: profile.full_name,
        monthly_expenses: profile.monthly_expenses,
        annual_expenses: profile.annual_expenses,
        current_age: profile.current_age,
        retirement_age: profile.retirement_age,
        swr_rate: profile.swr_rate,
        expected_return: profile.expected_return,
        inflation_rate: profile.inflation_rate,
        view_mode: profile.view_mode,
      })

      if (updatedProfile) {
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
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
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
                  <Input id="email" type="email" value={user?.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={profile?.full_name || ""}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currentAge">Età attuale</Label>
                    <Input
                      id="currentAge"
                      type="number"
                      value={profile?.current_age || 30}
                      onChange={(e) => setProfile({ ...profile, current_age: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retirementAge">Età di pensionamento</Label>
                    <Input
                      id="retirementAge"
                      type="number"
                      value={profile?.retirement_age || 65}
                      onChange={(e) => setProfile({ ...profile, retirement_age: Number(e.target.value) })}
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
                      value={profile?.monthly_expenses || 2350}
                      onChange={(e) => {
                        const monthly = Number(e.target.value)
                        setProfile({
                          ...profile,
                          monthly_expenses: monthly,
                          annual_expenses: monthly * 12,
                        })
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="annualExpenses">Spese annuali (€)</Label>
                    <Input
                      id="annualExpenses"
                      type="number"
                      value={profile?.annual_expenses || 28200}
                      onChange={(e) => {
                        const annual = Number(e.target.value)
                        setProfile({
                          ...profile,
                          annual_expenses: annual,
                          monthly_expenses: Math.round(annual / 12),
                        })
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="swrRate">Safe Withdrawal Rate (%)</Label>
                    <span className="text-sm">{profile?.swr_rate || 4}%</span>
                  </div>
                  <Slider
                    id="swrRate"
                    min={2}
                    max={6}
                    step={0.1}
                    value={[profile?.swr_rate || 4]}
                    onValueChange={(value) => setProfile({ ...profile, swr_rate: value[0] })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="expectedReturn">Rendimento atteso (%)</Label>
                    <span className="text-sm">{profile?.expected_return || 7}%</span>
                  </div>
                  <Slider
                    id="expectedReturn"
                    min={1}
                    max={12}
                    step={0.5}
                    value={[profile?.expected_return || 7]}
                    onValueChange={(value) => setProfile({ ...profile, expected_return: value[0] })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="inflationRate">Inflazione (%)</Label>
                    <span className="text-sm">{profile?.inflation_rate || 2}%</span>
                  </div>
                  <Slider
                    id="inflationRate"
                    min={0}
                    max={5}
                    step={0.1}
                    value={[profile?.inflation_rate || 2]}
                    onValueChange={(value) => setProfile({ ...profile, inflation_rate: value[0] })}
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
                      {profile?.view_mode === 'fire_only'
                        ? "Attualmente stai visualizzando solo le funzionalità FIRE"
                        : "Attualmente stai visualizzando sia FIRE che Budget"}
                    </p>
                  </div>
                  <Switch
                    id="view-mode"
                    checked={profile?.view_mode === 'fire_budget'}
                    onCheckedChange={(checked) => {
                      setProfile({
                        ...profile,
                        view_mode: checked ? 'fire_budget' : 'fire_only'
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
                  <Input value={user?.email} disabled />
                  <Button variant="outline" size="sm" disabled>
                    Cambia email
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="flex items-center gap-2">
                  <Input type="password" value="••••••••" disabled />
                  <Button variant="outline" size="sm" disabled>
                    Cambia password
                  </Button>
                </div>
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
