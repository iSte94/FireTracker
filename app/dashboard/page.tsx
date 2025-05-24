"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDown, ArrowUp, DollarSign, LineChart, PiggyBank, Target } from "lucide-react"
import { LazyNetWorthChart, LazyExpensesChart } from "@/components/lazy-chart-wrapper"
import FireNumberCard from "@/components/fire-number-card"
import ProgressOverview from "@/components/progress-overview"
import RecentTransactions from "@/components/recent-transactions"
import GoalsList from "@/components/goals-list"
import { InvestmentGoalsWidget } from "@/components/dashboard/investment-goals-widget"
import { PortfolioOverviewWidget } from "@/components/dashboard/portfolio-overview-widget"
import { useIsFireBudget, useIsFireOnly } from "@/components/providers/view-mode-provider"
import { TimeToFireWidget } from "@/components/dashboard/time-to-fire-widget"
import { SavingsRateWidget } from "@/components/dashboard/savings-rate-widget"
import { SafeWithdrawalRateWidget } from "@/components/dashboard/safe-withdrawal-rate-widget"
import { FireTypesProgressWidget } from "@/components/dashboard/fire-types-progress-widget"
import { FinancialTransactionsWidget } from "@/components/dashboard/financial-transactions-widget"
import { PortfolioDiversificationWidget } from "@/components/dashboard/portfolio-diversification-widget"
import { HistoricalReturnsWidget } from "@/components/dashboard/historical-returns-widget"
import { RiskReturnWidget } from "@/components/dashboard/risk-return-widget"
import { DividendsFlowWidget } from "@/components/dashboard/dividends-flow-widget"
import { FireInsights } from "@/components/fire/fire-insights"

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

        {/* Cards superiori - diverse per modalità */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patrimonio Netto</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€120,000</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-emerald-500 flex items-center">
                  <ArrowUp className="mr-1 h-4 w-4" />
                  +20.1%
                </span>{" "}
                rispetto all'anno scorso
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasso di Risparmio</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-emerald-500 flex items-center">
                  <ArrowUp className="mr-1 h-4 w-4" />
                  +5%
                </span>{" "}
                rispetto al mese scorso
              </p>
            </CardContent>
          </Card>
          {isFireBudget ? (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Spese Mensili</CardTitle>
                  <ArrowDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€2,350</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-red-500 flex items-center">
                      <ArrowUp className="mr-1 h-4 w-4" />
                      +2.5%
                    </span>{" "}
                    rispetto al mese scorso
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Anni al FIRE</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12.5</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-emerald-500 flex items-center">
                      <ArrowDown className="mr-1 h-4 w-4" />
                      -0.3
                    </span>{" "}
                    rispetto all'anno scorso
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Anni al FIRE</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12.5</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-emerald-500 flex items-center">
                      <ArrowDown className="mr-1 h-4 w-4" />
                      -0.3
                    </span>{" "}
                    rispetto all'anno scorso
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rendimento YTD</CardTitle>
                  <LineChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+8.3%</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-emerald-500 flex items-center">
                      <ArrowUp className="mr-1 h-4 w-4" />
                      +2.1%
                    </span>{" "}
                    sopra il benchmark
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

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
                  <TimeToFireWidget />
                  <SavingsRateWidget />
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
                  <SafeWithdrawalRateWidget />
                  <FireTypesProgressWidget />
                </div>

                {/* FIRE Insights - suggerimenti personalizzati */}
                <FireInsights />

                <div className="grid gap-4 md:grid-cols-2">
                  <PortfolioOverviewWidget />
                  <InvestmentGoalsWidget />
                </div>

                <FinancialTransactionsWidget />

                {/* Sezione Analisi Portafoglio */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Analisi Portafoglio</h2>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <PortfolioDiversificationWidget />
                    <HistoricalReturnsWidget />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <RiskReturnWidget />
                    <DividendsFlowWidget />
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
                  <PortfolioOverviewWidget />
                  <InvestmentGoalsWidget />
                </div>
              </>
            )}
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            {isFireOnly ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <SavingsRateWidget />
                  <TimeToFireWidget />
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
                  <SafeWithdrawalRateWidget />
                </div>
                <FireTypesProgressWidget />
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
              <PortfolioOverviewWidget />
              <InvestmentGoalsWidget />
            </div>
            {isFireOnly ? (
              <FinancialTransactionsWidget />
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
