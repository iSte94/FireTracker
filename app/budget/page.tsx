import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import BudgetOverview from "@/components/budget/budget-overview"
import BudgetList from "@/components/budget/budget-list"
import BudgetAnalytics from "@/components/budget/budget-analytics"
import BudgetAlerts from "@/components/budget/budget-alerts"
import AddBudgetDialog from "@/components/budget/add-budget-dialog"
import BudgetFilters from "@/components/budget/budget-filters"
import BudgetSummaryWidget from "@/components/budget/budget-summary-widget"

export default function BudgetPage() {
  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Budget</h1>
              <p className="text-muted-foreground">
                Gestisci e monitora i tuoi budget per raggiungere i tuoi obiettivi finanziari.
              </p>
            </div>
            <AddBudgetDialog />
          </div>
        </div>

        {/* Quick Stats - Ora dinamici! */}
        <Suspense fallback={<BudgetSummarySkeleton />}>
          <BudgetSummaryWidget />
        </Suspense>

        {/* Filters */}
        <BudgetFilters />

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="budgets">Budget</TabsTrigger>
            <TabsTrigger value="analytics">Analisi</TabsTrigger>
            <TabsTrigger value="alerts">Avvisi</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Suspense fallback={<BudgetOverviewSkeleton />}>
              <BudgetOverview />
            </Suspense>
          </TabsContent>

          <TabsContent value="budgets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>I Tuoi Budget</CardTitle>
                <CardDescription>
                  Gestisci i budget per categoria e periodo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<BudgetListSkeleton />}>
                  <BudgetList />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Suspense fallback={<BudgetAnalyticsSkeleton />}>
              <BudgetAnalytics />
            </Suspense>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Avvisi Budget</CardTitle>
                <CardDescription>
                  Notifiche e alert sui tuoi budget
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<BudgetAlertsSkeleton />}>
                  <BudgetAlerts />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

// Loading Skeletons
function BudgetSummarySkeleton() {
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

function BudgetOverviewSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

function BudgetListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  )
}

function BudgetAnalyticsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

function BudgetAlertsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  )
}