'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalProgressMini } from "@/components/shared/goal-progress-mini";
import { AllocationDeviationAlert } from "@/components/shared/allocation-deviation-alert";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface GoalProgress {
  id: string;
  title: string;
  goal_type: string;
  progress: number;
  status: string;
  deviations?: any[];
}

export function InvestmentGoalsWidget() {
  const [goalsData, setGoalsData] = useState<{
    goalsProgress: GoalProgress[];
    needsAttention: GoalProgress[];
    summary: {
      total: number;
      onTrack: number;
      completed: number;
      needsAction: number;
    };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGoalsProgress = async () => {
      try {
        const response = await fetch('/api/goals/check-progress');
        if (response.ok) {
          const data = await response.json();
          setGoalsData(data);
        }
      } catch (error) {
        console.error('Errore caricamento obiettivi:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoalsProgress();
  }, []);

  // Trova deviazioni significative per l'alert
  const significantDeviations = goalsData?.goalsProgress
    .filter(g => g.status === 'needs_rebalancing' && g.deviations)
    .flatMap(g => g.deviations)
    .filter(d => d.deviation > 5)
    .slice(0, 3) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Obiettivi di Investimento
          </CardTitle>
          <CardDescription>Monitoraggio progressi e allocazioni</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!goalsData || goalsData.goalsProgress.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Obiettivi di Investimento
          </CardTitle>
          <CardDescription>Inizia a definire i tuoi obiettivi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Non hai ancora definito obiettivi di investimento
            </p>
            <Button asChild>
              <Link href="/goals">
                Crea il tuo primo obiettivo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Obiettivi di Investimento
            </CardTitle>
            <CardDescription>
              {goalsData.summary.onTrack} su {goalsData.summary.total} in linea
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/goals">
              Vedi tutti
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alert deviazioni se presenti */}
        {significantDeviations.length > 0 && (
          <AllocationDeviationAlert
            deviations={significantDeviations}
            compact
            onRebalance={() => window.location.href = '/goals'}
          />
        )}

        {/* Mostra primi 3 obiettivi prioritari */}
        <div className="space-y-3">
          {goalsData.goalsProgress.slice(0, 3).map((goal) => (
            <GoalProgressMini
              key={goal.id}
              title={goal.title}
              progress={goal.progress}
              status={goal.status as any}
              goalType={goal.goal_type}
            />
          ))}
        </div>

        {/* Summary badges */}
        {goalsData.summary.total > 3 && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {goalsData.summary.completed > 0 && (
                  <span className="text-emerald-600 font-medium">
                    {goalsData.summary.completed} completat{goalsData.summary.completed === 1 ? 'o' : 'i'}
                  </span>
                )}
                {goalsData.summary.completed > 0 && goalsData.summary.needsAction > 0 && ' • '}
                {goalsData.summary.needsAction > 0 && (
                  <span className="text-orange-600 font-medium">
                    {goalsData.summary.needsAction} richied{goalsData.summary.needsAction === 1 ? 'e' : 'ono'} attenzione
                  </span>
                )}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}