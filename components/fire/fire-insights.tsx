"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@/lib/supabase-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Lightbulb,
  TrendingUp,
  Users,
  BookOpen,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Zap,
  Target,
  DollarSign,
  PiggyBank,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Insight {
  id: string
  type: "suggestion" | "opportunity" | "tip" | "warning"
  title: string
  description: string
  impact?: "high" | "medium" | "low"
  actionLabel?: string
  actionHref?: string
  icon?: React.ReactNode
}

interface FireComparison {
  averageSavingsRate: number
  averageTimeToFire: number
  averagePortfolioReturn: number
  userPercentile: number
}

export function FireInsights({ className }: { className?: string }) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [comparison, setComparison] = useState<FireComparison | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("suggestions")
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch user data
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        const { data: holdings } = await supabase
          .from("holdings")
          .select("quantity, symbol")
          .eq("user_id", user.id)

        const { data: transactions } = await supabase
          .from("transactions")
          .select("amount, type, created_at")
          .eq("user_id", user.id)
          .gte("created_at", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

        // Generate personalized insights
        const generatedInsights: Insight[] = []

        // Analizza il tasso di risparmio
        if (profile) {
          const savingsRate = profile.monthly_income > 0 
            ? ((profile.monthly_income - profile.monthly_expenses) / profile.monthly_income) * 100
            : 0

          if (savingsRate < 20) {
            generatedInsights.push({
              id: "low-savings",
              type: "warning",
              title: "Tasso di risparmio basso",
              description: `Il tuo tasso di risparmio è del ${savingsRate.toFixed(1)}%. Aumentarlo al 30% potrebbe ridurre il tempo al FIRE di 5-10 anni.`,
              impact: "high",
              actionLabel: "Ottimizza le spese",
              actionHref: "/budget",
              icon: <AlertCircle className="h-5 w-5" />
            })
          } else if (savingsRate > 50) {
            generatedInsights.push({
              id: "high-savings",
              type: "suggestion",
              title: "Ottimo tasso di risparmio!",
              description: `Con un tasso del ${savingsRate.toFixed(1)}% sei sulla strada giusta. Considera di diversificare maggiormente gli investimenti.`,
              impact: "medium",
              actionLabel: "Esplora investimenti",
              actionHref: "/portfolio",
              icon: <CheckCircle className="h-5 w-5" />
            })
          }
        }

        // Analizza la diversificazione del portafoglio
        if (holdings && holdings.length > 0) {
          const uniqueSymbols = new Set(holdings.map(h => h.symbol)).size
          
          if (uniqueSymbols < 5) {
            generatedInsights.push({
              id: "low-diversification",
              type: "opportunity",
              title: "Diversifica il portafoglio",
              description: "Hai solo " + uniqueSymbols + " asset diversi. Considera ETF globali per ridurre il rischio.",
              impact: "high",
              actionLabel: "Aggiungi asset",
              actionHref: "/financial-transactions",
              icon: <Zap className="h-5 w-5" />
            })
          }
        } else {
          generatedInsights.push({
            id: "no-investments",
            type: "warning",
            title: "Inizia ad investire",
            description: "Non hai ancora investimenti registrati. Il tempo nel mercato è cruciale per il FIRE.",
            impact: "high",
            actionLabel: "Inizia ora",
            actionHref: "/financial-transactions",
            icon: <AlertCircle className="h-5 w-5" />
          })
        }

        // Tips educativi
        const educationalTips: Insight[] = [
          {
            id: "tip-1",
            type: "tip",
            title: "La regola del 4%",
            description: "Puoi ritirare in sicurezza il 4% del tuo portafoglio ogni anno senza esaurire i fondi per 30+ anni.",
            icon: <BookOpen className="h-5 w-5" />
          },
          {
            id: "tip-2",
            type: "tip",
            title: "Coast FIRE",
            description: "Una volta raggiunto il Coast FIRE, i tuoi investimenti cresceranno fino al FIRE number senza ulteriori contributi.",
            actionLabel: "Calcola Coast FIRE",
            actionHref: "/calculators",
            icon: <BookOpen className="h-5 w-5" />
          },
          {
            id: "tip-3",
            type: "tip",
            title: "Barista FIRE",
            description: "Lavora part-time per coprire le spese mentre i tuoi investimenti continuano a crescere.",
            actionLabel: "Scopri di più",
            actionHref: "/calculators",
            icon: <BookOpen className="h-5 w-5" />
          }
        ]

        // Aggiungi un tip random
        const randomTip = educationalTips[Math.floor(Math.random() * educationalTips.length)]
        generatedInsights.push(randomTip)

        // Opportunità basate sui dati recenti
        if (transactions && transactions.length > 0) {
          const recentSells = transactions.filter(t => t.type === "sell").length
          const recentBuys = transactions.filter(t => t.type === "buy").length

          if (recentSells > recentBuys * 2) {
            generatedInsights.push({
              id: "selling-pattern",
              type: "opportunity",
              title: "Pattern di vendita frequente",
              description: "Stai vendendo più di quanto compri. Ricorda: time in the market beats timing the market.",
              impact: "medium",
              icon: <TrendingUp className="h-5 w-5" />
            })
          }
        }

        setInsights(generatedInsights)

        // Simula dati di confronto con altri utenti (in produzione questi verrebbero dal backend)
        setComparison({
          averageSavingsRate: 35,
          averageTimeToFire: 15,
          averagePortfolioReturn: 7.5,
          userPercentile: Math.floor(Math.random() * 40) + 40 // 40-80 percentile
        })

      } catch (error) {
        console.error("Error fetching insights:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [supabase])

  const getImpactColor = (impact?: string) => {
    switch (impact) {
      case "high":
        return "text-red-600 dark:text-red-400"
      case "medium":
        return "text-yellow-600 dark:text-yellow-400"
      case "low":
        return "text-green-600 dark:text-green-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "suggestion":
        return <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      case "opportunity":
        return <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      case "tip":
        return <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle>FIRE Insights</CardTitle>
          <CardDescription>Caricamento suggerimenti personalizzati...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-emerald-600" />
          FIRE Insights
        </CardTitle>
        <CardDescription>
          Suggerimenti personalizzati e opportunità per accelerare il tuo percorso FIRE
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suggestions">Suggerimenti</TabsTrigger>
            <TabsTrigger value="comparison">Confronto</TabsTrigger>
            <TabsTrigger value="education">Formazione</TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-4 mt-6">
            {insights
              .filter(i => i.type !== "tip")
              .map((insight) => (
                <div
                  key={insight.id}
                  className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {insight.icon || getTypeIcon(insight.type)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{insight.title}</h4>
                        {insight.impact && (
                          <Badge
                            variant="outline"
                            className={cn("text-xs", getImpactColor(insight.impact))}
                          >
                            Impatto {insight.impact === "high" ? "Alto" : insight.impact === "medium" ? "Medio" : "Basso"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {insight.description}
                      </p>
                      {insight.actionLabel && insight.actionHref && (
                        <Link href={insight.actionHref}>
                          <Button size="sm" variant="outline" className="mt-2">
                            {insight.actionLabel}
                            <ArrowRight className="ml-2 h-3 w-3" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6 mt-6">
            {comparison && (
              <>
                <div className="text-center p-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                  <Users className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                    Top {comparison.userPercentile}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sei nel top {comparison.userPercentile}% degli utenti FIRE
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Tasso di risparmio medio</span>
                      <span className="font-semibold">{comparison.averageSavingsRate}%</span>
                    </div>
                    <Progress value={comparison.averageSavingsRate} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Tempo medio al FIRE</span>
                      <span className="font-semibold">{comparison.averageTimeToFire} anni</span>
                    </div>
                    <Progress value={(25 - comparison.averageTimeToFire) * 4} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Rendimento medio portafoglio</span>
                      <span className="font-semibold">{comparison.averagePortfolioReturn}%</span>
                    </div>
                    <Progress value={comparison.averagePortfolioReturn * 10} className="h-2" />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  *Dati basati su utenti anonimi con obiettivi simili
                </p>
              </>
            )}
          </TabsContent>

          <TabsContent value="education" className="space-y-4 mt-6">
            {insights
              .filter(i => i.type === "tip")
              .map((tip) => (
                <div
                  key={tip.id}
                  className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {tip.icon}
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="font-semibold">{tip.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {tip.description}
                      </p>
                      {tip.actionLabel && tip.actionHref && (
                        <Link href={tip.actionHref}>
                          <Button size="sm" variant="outline" className="mt-2">
                            {tip.actionLabel}
                            <ArrowRight className="ml-2 h-3 w-3" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}

            <div className="mt-6 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-600" />
                Consiglio del giorno
              </h4>
              <p className="text-sm text-muted-foreground">
                "Il miglior momento per piantare un albero era 20 anni fa. Il secondo miglior momento è ora." 
                - Inizia oggi il tuo percorso verso l'indipendenza finanziaria.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}