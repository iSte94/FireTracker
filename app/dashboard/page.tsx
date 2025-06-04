"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart } from "lucide-react"
import { LazyNetWorthChart, LazyExpensesChart } from "@/components/lazy-chart-wrapper"
import FireNumberCard from "@/components/fire-number-card"
import ProgressOverview from "@/components/progress-overview"
import RecentTransactions from "@/components/recent-transactions"
import GoalsList from "@/components/goals-list"
import { useIsFireBudget, useIsFireOnly } from "@/components/providers/view-mode-provider"
import { FireInsights } from "@/components/fire/fire-insights"
import DynamicStatsWidget from "@/components/dashboard/dynamic-stats-widget"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

// Lazy imports per i widget dashboard
import {
  LazyTimeToFireWidget,
  LazySavingsRateWidget,
  LazySafeWithdrawalRateWidget,
  LazyFireTypesProgressWidget,
  LazyPortfolioOverviewWidget,
  LazyInvestmentGoalsWidget,
  LazyFinancialTransactionsWidget,
  LazyPortfolioDiversificationWidget,
  LazyHistoricalReturnsWidget,
  LazyRiskReturnWidget,
  LazyDividendsFlowWidget,
} from "@/components/dashboard/lazy-dashboard-widgets"

export default function DashboardPage() {
  const isFireBudget = useIsFireBudget()
  const isFireOnly = useIsFireOnly()
  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {isFireOnly
              ? "Il tuo percorso verso l'indipendenza finanziaria."
              : "Panoramica del tuo percorso verso l'indipendenza finanziaria e gestione del budget."}
          </p>
        </div>

        {/* Cards superiori - Ora dinamiche! */}
        <Suspense fallback={<DynamicStatsSkeleton />}>
          <DynamicStatsWidget isFireBudget={isFireBudget} />
        </Suspense>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="analytics">Analisi</TabsTrigger>
            <TabsTrigger value="investments">Investimenti</TabsTrigger>
            <TabsTrigger value="goals">Obiettivi</TabsTrigger>
            {isFireBudget && <TabsTrigger value="transactions">Transazioni</TabsTrigger>}
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            {isFireOnly ? (
              <>
                {/* Layout per modalità Solo FIRE */}
                <div className="grid gap-4 md:grid-cols-2">
                  <LazyTimeToFireWidget />
                  <LazySavingsRateWidget />
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Patrimonio Netto nel Tempo</CardTitle>
                      <CardDescription>L'andamento del tuo patrimonio netto negli ultimi 12 mesi</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      <LazyNetWorthChart />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Il Tuo FIRE Number</CardTitle>
                      <CardDescription>Basato sulle tue spese annuali e un SWR del 4%</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FireNumberCard />
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <LazySafeWithdrawalRateWidget />
                  <LazyFireTypesProgressWidget />
                </div>

                {/* FIRE Insights - suggerimenti personalizzati */}
                <FireInsights />

                <div className="grid gap-4 md:grid-cols-2">
                  <LazyPortfolioOverviewWidget />
                  <LazyInvestmentGoalsWidget />
                </div>

                <LazyFinancialTransactionsWidget />

                {/* Sezione Analisi Portafoglio */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Analisi Portafoglio</h2>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <LazyPortfolioDiversificationWidget />
                    <LazyHistoricalReturnsWidget />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <LazyRiskReturnWidget />
                    <LazyDividendsFlowWidget />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Layout originale per modalità FIRE & Budget */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Patrimonio Netto nel Tempo</CardTitle>
                      <CardDescription>L'andamento del tuo patrimonio netto negli ultimi 12 mesi</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      <LazyNetWorthChart />
                    </CardContent>
                  </Card>
                  <Card className="md:row-span-2">
                    <CardHeader>
                      <CardTitle>Il Tuo FIRE Number</CardTitle>
                      <CardDescription>Basato sulle tue spese annuali e un SWR del 4%</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FireNumberCard />
                    </CardContent>
                  </Card>
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Spese per Categoria</CardTitle>
                      <CardDescription>Ripartizione delle tue spese mensili per categoria</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      <LazyExpensesChart />
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <LazyPortfolioOverviewWidget />
                  <LazyInvestmentGoalsWidget />
                </div>
              </>
            )}
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            {isFireOnly ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <LazySavingsRateWidget />
                  <LazyTimeToFireWidget />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Progresso FIRE</CardTitle>
                      <CardDescription>Il tuo progresso verso l'indipendenza finanziaria</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ProgressOverview />
                    </CardContent>
                  </Card>
                  <LazySafeWithdrawalRateWidget />
                </div>
                <LazyFireTypesProgressWidget />
              </>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                  <CardHeader>
                    <CardTitle>Analisi Rendimenti</CardTitle>
                    <CardDescription>Rendimento degli investimenti nel tempo</CardDescription>
                  </CardHeader>
                  <CardContent className="h-96">
                    <div className="flex h-full items-center justify-center">
                      <LineChart className="h-16 w-16 text-muted-foreground" />
                      <p className="ml-4 text-muted-foreground">
                        Grafici dettagliati di analisi rendimenti saranno disponibili qui
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Progresso FIRE</CardTitle>
                    <CardDescription>Il tuo progresso verso l'indipendenza finanziaria</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProgressOverview />
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
          <TabsContent value="investments" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <LazyPortfolioOverviewWidget />
              <LazyInvestmentGoalsWidget />
            </div>
            {isFireOnly ? (
              <LazyFinancialTransactionsWidget />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Transazioni Recenti</CardTitle>
                  <CardDescription>Le tue ultime transazioni di investimento</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentTransactions />
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="goals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>I Tuoi Obiettivi Finanziari</CardTitle>
                <CardDescription>Traccia i tuoi progressi verso gli obiettivi FIRE, COAST FIRE e altri</CardDescription>
              </CardHeader>
              <CardContent>
                <GoalsList />
              </CardContent>
            </Card>
          </TabsContent>
          {isFireBudget && (
            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transazioni Recenti</CardTitle>
                  <CardDescription>Le tue ultime 10 transazioni registrate</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentTransactions />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </main>
  )
}

function DynamicStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-3 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
