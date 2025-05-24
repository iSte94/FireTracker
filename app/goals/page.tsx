'use client';

import { useState, useEffect } from 'react';
import { Plus, Filter, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { GoalsList } from '@/components/goals/goals-list';
import { AddGoalDialog } from '@/components/goals/add-goal-dialog';
import { PortfolioComposition } from '@/components/goals/portfolio-composition';
import { AllocationTargets } from '@/components/goals/allocation-targets';
import { goalsClient, holdingsClient } from '@/lib/goals-client';
import type { InvestmentGoal, PortfolioHolding, GoalType, GoalStatus } from '@/types/investment';
import { GOAL_TYPE_CONFIG } from '@/types/investment';

export default function GoalsPage() {
  const [goals, setGoals] = useState<InvestmentGoal[]>([]);
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<GoalStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<GoalType | 'all'>('all');
  const [deviationAlerts, setDeviationAlerts] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load goals
      const goalsData = await goalsClient.getGoals(statusFilter === 'all' ? undefined : statusFilter);
      setGoals(goalsData);

      // Load holdings
      const holdingsData = await holdingsClient.getHoldings();
      setHoldings(holdingsData);

      // Check for allocation deviations
      checkAllocationDeviations(goalsData, holdingsData);
    } catch (err) {
      setError('Errore nel caricamento dei dati');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkAllocationDeviations = (goals: InvestmentGoal[], holdings: PortfolioHolding[]) => {
    const alerts: string[] = [];
    const portfolioGoals = goals.filter(g => g.goal_type === 'portfolio_allocation' && g.status === 'active');

    portfolioGoals.forEach(goal => {
      if (goal.allocations) {
        goal.allocations.forEach(allocation => {
          const deviation = Math.abs(allocation.current_percentage - allocation.target_percentage);
          if (deviation > 5) { // Alert if deviation is more than 5%
            alerts.push(`${allocation.asset_class}: deviazione del ${deviation.toFixed(1)}% dal target`);
          }
        });
      }
    });

    setDeviationAlerts(alerts);
  };

  const handleGoalAdded = async () => {
    setIsAddDialogOpen(false);
    await loadData();
  };

  const handleGoalUpdated = async () => {
    await loadData();
  };

  const handleGoalDeleted = async () => {
    await loadData();
  };

  const filteredGoals = goals.filter(goal => {
    if (typeFilter !== 'all' && goal.goal_type !== typeFilter) return false;
    return true;
  });

  const activeGoalsCount = goals.filter(g => g.status === 'active').length;
  const completedGoalsCount = goals.filter(g => g.status === 'completed').length;
  const totalPortfolioValue = holdings.reduce((sum, h) => sum + (h.current_value || h.total_cost), 0);

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Obiettivi di Investimento</h1>
          <p className="text-muted-foreground mt-1">
            Gestisci i tuoi obiettivi finanziari e monitora il tuo portfolio
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Nuovo Obiettivo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Obiettivi Attivi</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGoalsCount}</div>
            <p className="text-xs text-muted-foreground">
              {completedGoalsCount} completati
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valore Portfolio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{totalPortfolioValue.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Valore totale attuale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asset nel Portfolio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{holdings.length}</div>
            <p className="text-xs text-muted-foreground">
              Diversificazione attuale
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Deviation Alerts */}
      {deviationAlerts.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Attenzione: Deviazioni significative rilevate</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1">
              {deviationAlerts.map((alert, index) => (
                <li key={index} className="text-sm">• {alert}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="goals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="goals">Obiettivi</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="allocations">Allocazioni</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as GoalStatus | 'all')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtra per stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="active">Attivi</SelectItem>
                <SelectItem value="completed">Completati</SelectItem>
                <SelectItem value="paused">In pausa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as GoalType | 'all')}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Filtra per tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i tipi</SelectItem>
                {Object.entries(GOAL_TYPE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Goals List */}
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Errore</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : filteredGoals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  {goals.length === 0 
                    ? "Non hai ancora creato nessun obiettivo"
                    : "Nessun obiettivo trovato con i filtri selezionati"
                  }
                </p>
                {goals.length === 0 && (
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Crea il tuo primo obiettivo
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <GoalsList 
              goals={filteredGoals}
              onGoalUpdated={handleGoalUpdated}
              onGoalDeleted={handleGoalDeleted}
            />
          )}
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Composizione del Portfolio</CardTitle>
              <CardDescription>
                Visualizzazione della distribuzione attuale dei tuoi investimenti
              </CardDescription>
            </CardHeader>
            <CardContent>
              {holdings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Nessun investimento registrato nel portfolio
                  </p>
                </div>
              ) : (
                <PortfolioComposition holdings={holdings} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Allocazioni Target vs Attuali</CardTitle>
              <CardDescription>
                Confronto tra le allocazioni desiderate e quelle attuali del portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AllocationTargets goals={goals} holdings={holdings} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Goal Dialog */}
      <AddGoalDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onGoalAdded={handleGoalAdded}
      />
    </div>
  );
}