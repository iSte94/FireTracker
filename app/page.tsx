"use client"

import { useEffect } from "react" // useState non è più necessario qui per 'user'
import Link from "next/link"
import { useSession } from "next-auth/react" // Importa useSession
import { useRouter } from "next/navigation" // Importa useRouter per il redirect
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ArrowRight, 
  BarChart3, 
  Calculator, 
  LineChart, 
  PiggyBank, 
  Target,
  TrendingUp,
  Briefcase,
  Receipt,
  Flame,
  Clock,
  DollarSign,
  Users,
  BookOpen,
  Zap
} from "lucide-react"
import ProgressOverview from "@/components/progress-overview"
import FireNumberCard from "@/components/fire-number-card"
import ExpensesChart from "@/components/expenses-chart"
import NetWorthChart from "@/components/net-worth-chart"
import { useIsFireOnly } from "@/components/providers/view-mode-provider"
// Rimuovi: import { createClientComponentClient } from "@/lib/supabase-client"

export default function Home() {
  const { data: session, status } = useSession() // Usa useSession per ottenere l'utente
  const user = session?.user
  const isLoadingSession = status === "loading"
  const router = useRouter() // Hook per il routing

  const isFireOnly = useIsFireOnly()

  // Redirect automatico alla Dashboard per utenti autenticati
  useEffect(() => {
    if (status === "authenticated" && user) {
      router.push("/dashboard")
    }
  }, [status, user, router])
  // Rimuovi: const [user, setUser] = useState<any>(null)
  // Rimuovi: const supabase = createClientComponentClient()

  // Rimuovi: useEffect per fetchUser con Supabase
  // useEffect(() => {
  //   const fetchUser = async () => {
  //     const { data: { user } } = await supabase.auth.getUser()
  //     setUser(user)
  //   }
  //   fetchUser()
  // }, [supabase.auth])

  if (isLoadingSession) {
    // Puoi mostrare uno scheletro o un loader qui se preferisci
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <p>Caricamento...</p>
      </main>
    )
  }

  // Contenuto specifico per modalità Solo FIRE
  if (isFireOnly) {
    return (
      <main className="flex min-h-screen flex-col">
        {/* Hero Section FIRE */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-emerald-50 via-emerald-100 to-white dark:from-emerald-950 dark:via-gray-900 dark:to-gray-950">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                  <Flame className="h-5 w-5" />
                  <span className="text-sm font-semibold">Il tuo percorso verso la libertà finanziaria</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-emerald-600 to-emerald-800 dark:from-emerald-400 dark:to-emerald-600 bg-clip-text text-transparent">
                  Raggiungi il FIRE
                </h1>
                <p className="mx-auto max-w-[800px] text-gray-600 md:text-xl lg:text-2xl dark:text-gray-300">
                  Financial Independence, Retire Early. Traccia, pianifica e ottimizza il tuo percorso verso l'indipendenza finanziaria.
                </p>
              </div>
              
              {/* Call to Action */}
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <>
                    <Link href="/dashboard">
                      <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
                        Vai alla Dashboard
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/fire-progress">
                      <Button size="lg" variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950">
                        Visualizza Progresso
                        <TrendingUp className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/register">
                      <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
                        Inizia il tuo percorso FIRE
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/calculators">
                      <Button size="lg" variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950">
                        Prova i calcolatori
                        <Calculator className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Statistiche Motivazionali */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 w-full max-w-3xl">
                <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-white to-emerald-50 dark:from-gray-900 dark:to-emerald-950/20">
                  <CardContent className="p-6 text-center">
                    <Users className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">10K+</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Utenti attivi</p>
                  </CardContent>
                </Card>
                <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-white to-emerald-50 dark:from-gray-900 dark:to-emerald-950/20">
                  <CardContent className="p-6 text-center">
                    <Target className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">€50M+</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Patrimonio tracciato</p>
                  </CardContent>
                </Card>
                <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-white to-emerald-50 dark:from-gray-900 dark:to-emerald-950/20">
                  <CardContent className="p-6 text-center">
                    <Clock className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">15 anni</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tempo medio al FIRE</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links alle funzionalità principali */}
        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Strumenti per il tuo successo FIRE
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">
                Tutto ciò di cui hai bisogno per raggiungere l'indipendenza finanziaria
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link href="/fire-progress" className="group">
                <Card className="h-full transition-all hover:shadow-lg hover:scale-105 hover:border-emerald-500 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <TrendingUp className="h-8 w-8 text-emerald-600 group-hover:text-emerald-700" />
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <CardTitle className="text-xl">Progresso FIRE</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Monitora il tuo avanzamento verso l'indipendenza finanziaria con metriche dettagliate
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/portfolio" className="group">
                <Card className="h-full transition-all hover:shadow-lg hover:scale-105 hover:border-emerald-500 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Briefcase className="h-8 w-8 text-emerald-600 group-hover:text-emerald-700" />
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <CardTitle className="text-xl">Portafoglio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Gestisci e ottimizza i tuoi investimenti per massimizzare i rendimenti
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/calculators" className="group">
                <Card className="h-full transition-all hover:shadow-lg hover:scale-105 hover:border-emerald-500 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Calculator className="h-8 w-8 text-emerald-600 group-hover:text-emerald-700" />
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <CardTitle className="text-xl">Calcolatori FIRE</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Simula scenari e calcola il tuo FIRE number personalizzato
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/financial-transactions" className="group">
                <Card className="h-full transition-all hover:shadow-lg hover:scale-105 hover:border-emerald-500 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Receipt className="h-8 w-8 text-emerald-600 group-hover:text-emerald-700" />
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <CardTitle className="text-xl">Transazioni</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Traccia acquisti e vendite per ottimizzare la tua strategia di investimento
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* Tips educativi sul FIRE */}
        <section className="w-full py-12 md:py-24 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                I principi del movimento FIRE
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">
                Scopri le strategie fondamentali per raggiungere l'indipendenza finanziaria
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
                    <PiggyBank className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <CardTitle>Risparmia Aggressivamente</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Punta a risparmiare il 50-70% del tuo reddito. Ogni euro risparmiato oggi vale molto di più domani grazie agli interessi composti.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
                    <LineChart className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <CardTitle>Investi Saggiamente</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Diversifica in ETF a basso costo, azioni e altri asset. Il tempo nel mercato batte il timing del mercato.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <CardTitle>Ottimizza le Spese</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Riduci le spese non essenziali senza sacrificare la qualità della vita. Ogni riduzione accelera il tuo percorso FIRE.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
                    <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <CardTitle>Aumenta il Reddito</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Sviluppa competenze, cerca promozioni o crea entrate passive. Un reddito maggiore accelera drasticamente il FIRE.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <CardTitle>Calcola il tuo FIRE Number</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Il tuo FIRE number è 25x le tue spese annuali. Questo ti permette di ritirare il 4% annuo in sicurezza.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <CardTitle>Continua ad Imparare</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Studia finanza personale, investimenti e strategie FIRE. La conoscenza è il tuo miglior investimento.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* CTA finale */}
            <div className="mt-16 text-center">
              <Link href={user ? "/dashboard" : "/register"}>
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
                  {user ? "Vai alla tua Dashboard" : "Inizia oggi il tuo percorso FIRE"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    )
  }

  // Contenuto originale per modalità normale
  return (
    <main className="flex min-h-screen flex-col">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                FIRE Progress Tracker
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Traccia e pianifica il tuo percorso verso l'indipendenza finanziaria con strumenti avanzati per FIRE,
                COAST FIRE e Barista FIRE.
              </p>
            </div>
            <div className="space-x-4">
              {user ? (
                <Link href="/dashboard">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Vai alla Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      Inizia ora
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/calculators">
                    <Button variant="outline">Esplora i calcolatori</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Caratteristiche Principali</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Strumenti potenti per pianificare e monitorare il tuo percorso verso l'indipendenza finanziaria.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Dashboard Interattiva</CardTitle>
                <BarChart3 className="h-5 w-5 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Panoramica completa del tuo percorso FIRE con metriche chiave e grafici interattivi.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Calcolatori Avanzati</CardTitle>
                <Calculator className="h-5 w-5 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Calcola il tuo "FIRE number" personalizzato, COAST FIRE, Barista FIRE e simula scenari finanziari.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Gestione Obiettivi</CardTitle>
                <Target className="h-5 w-5 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <CardDescription>Traccia obiettivi multipli con indicatori visivi di progresso.</CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Gestione Finanziaria</CardTitle>
                <PiggyBank className="h-5 w-5 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Traccia spese ed entrate, analizza le spese per categoria e pianifica il budget.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Simulatore di Impatto Spese</CardTitle>
                <LineChart className="h-5 w-5 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Simula l'impatto di spese future sul tuo FIRE number e visualizza graficamente i risultati.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Report Periodici</CardTitle>
                <BarChart3 className="h-5 w-5 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <CardDescription>Genera report personalizzabili e confronta scenari reali e simulati.</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Anteprima Dashboard - Visualizzabile sempre ma con contenuti diversi */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                {user ? "La Tua Dashboard" : "Anteprima Dashboard"}
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                {user
                  ? "Panoramica del tuo percorso verso l'indipendenza finanziaria."
                  : "Scopri come sarà la tua dashboard personalizzata una volta registrato."
                }
              </p>
            </div>
          </div>

          {/* Statistiche in evidenza */}
          {!user && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-12 mb-8 max-w-6xl mx-auto">
              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">FIRE Number</CardTitle>
                  <Target className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">€1.250.000</div>
                  <p className="text-xs text-muted-foreground">25x le spese annuali</p>
                </CardContent>
              </Card>
              
              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Progresso FIRE</CardTitle>
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">67%</div>
                  <p className="text-xs text-muted-foreground">€837.500 risparmiati</p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Anni al FIRE</CardTitle>
                  <Clock className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">4.2</div>
                  <p className="text-xs text-muted-foreground">Al ritmo attuale</p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tasso di Risparmio</CardTitle>
                  <PiggyBank className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">52%</div>
                  <p className="text-xs text-muted-foreground">€3.200/mese</p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3 mt-8">
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Patrimonio Netto nel Tempo</CardTitle>
                  <CardDescription>
                    {user ? "L'andamento del tuo patrimonio negli ultimi 12 mesi" : "Esempio di crescita del patrimonio nel tempo"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <NetWorthChart />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>{user ? "Il Tuo FIRE Number" : "FIRE Number Esempio"}</CardTitle>
                  <CardDescription>
                    {user ? "Basato sulle tue spese reali" : "Calcolato su spese di €50.000/anno"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FireNumberCard />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Progresso FIRE</CardTitle>
                  <CardDescription>
                    {user ? "Il tuo avanzamento reale" : "Esempio di progresso tipico"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProgressOverview />
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Spese per Categoria</CardTitle>
                  <CardDescription>
                    {user ? "Le tue spese mensili per categoria" : "Esempio di distribuzione delle spese"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ExpensesChart />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Call to Action per utenti non registrati */}
          {!user && (
            <div className="mt-16 text-center">
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 rounded-2xl p-8 max-w-2xl mx-auto border border-emerald-200 dark:border-emerald-800">
                <h3 className="text-2xl font-bold mb-4 text-emerald-800 dark:text-emerald-300">
                  Pronto a iniziare il tuo percorso FIRE?
                </h3>
                <p className="text-emerald-700 dark:text-emerald-400 mb-6">
                  Registrati gratuitamente e inizia a tracciare i tuoi progressi verso l'indipendenza finanziaria con dati reali e personalizzati.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/register">
                    <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
                      Registrati Gratis
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/calculators">
                    <Button size="lg" variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950">
                      Prova i Calcolatori
                      <Calculator className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
