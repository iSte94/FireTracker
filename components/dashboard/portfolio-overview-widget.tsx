'use client';

import { usePortfolioData } from "@/hooks/use-portfolio-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PortfolioValueDisplay } from "@/components/shared/portfolio-value-display";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, TrendingDown, Briefcase, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function PortfolioOverviewWidget() {
  const { stats, allocations, holdings, isLoading, updatePrices } = usePortfolioData();

  const topHoldings = holdings.slice(0, 3);
  const hasHoldings = holdings.length > 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Portfolio Overview
          </CardTitle>
          <CardDescription>Valore totale e performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasHoldings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Portfolio Overview
          </CardTitle>
          <CardDescription>Inizia a costruire il tuo portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Non hai ancora registrato investimenti
            </p>
            <Button asChild>
              <Link href="/financial-transactions">
                Aggiungi la tua prima transazione
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
              <Briefcase className="h-5 w-5" />
              Portfolio Overview
            </CardTitle>
            <CardDescription>
              {holdings.length} asset{holdings.length === 1 ? '' : 's'} • Ultimo aggiornamento: {new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={updatePrices}
              title="Aggiorna prezzi"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/financial-transactions">
                Dettagli
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Valore totale portfolio */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <PortfolioValueDisplay
            totalValue={stats.totalValue}
            totalGainLoss={stats.totalGainLoss}
            totalGainLossPercentage={stats.totalGainLossPercentage}
            compact
          />
        </div>

        {/* Top Holdings */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Top Holdings</h4>
          {topHoldings.map((holding) => {
            const gainLoss = (holding.current_value || 0) - holding.total_cost;
            const gainLossPercentage = holding.total_cost > 0 ? (gainLoss / holding.total_cost) * 100 : 0;
            const isPositive = gainLoss >= 0;
            const portfolioPercentage = stats.totalValue > 0 ? ((holding.current_value || 0) / stats.totalValue) * 100 : 0;

            return (
              <div key={holding.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{holding.ticker_symbol || holding.asset_name}</span>
                    <Badge variant="outline" className="text-xs">
                      {holding.asset_type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={portfolioPercentage} className="h-1.5 w-20" />
                    <span className="text-xs text-muted-foreground">
                      {portfolioPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(holding.current_value || 0)}</div>
                  <div className={`text-xs flex items-center justify-end gap-1 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {formatPercentage(gainLossPercentage)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Allocazioni per tipo */}
        {allocations.length > 0 && (
          <div className="pt-2 border-t">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Allocazione Asset</h4>
            <div className="flex flex-wrap gap-2">
              {allocations.slice(0, 4).map((allocation) => (
                <Badge key={allocation.asset_type} variant="secondary" className="text-xs">
                  {allocation.asset_type}: {allocation.percentage.toFixed(1)}%
                </Badge>
              ))}
              {allocations.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{allocations.length - 4} altri
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}