'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PortfolioValueDisplayProps {
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  isLoading?: boolean;
  compact?: boolean;
}

export function PortfolioValueDisplay({
  totalValue,
  totalGainLoss,
  totalGainLossPercentage,
  isLoading = false,
  compact = false
}: PortfolioValueDisplayProps) {
  const isPositive = totalGainLoss >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const trendColor = isPositive ? "text-emerald-500" : "text-red-500";

  if (isLoading) {
    return (
      <Card className={compact ? "p-4" : ""}>
        <CardHeader className={compact ? "p-0 pb-2" : ""}>
          <CardTitle className={compact ? "text-sm" : ""}>Valore Portfolio</CardTitle>
        </CardHeader>
        <CardContent className={compact ? "p-0" : ""}>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </CardContent>
      </Card>
    );
  }

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

  if (compact) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="text-2xl font-bold">{formatCurrency(totalValue)}</span>
        </div>
        <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
          <TrendIcon className="h-3 w-3" />
          <span>{formatCurrency(Math.abs(totalGainLoss))}</span>
          <span>({formatPercentage(totalGainLossPercentage)})</span>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Valore Portfolio</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
        <p className="text-xs text-muted-foreground">
          <span className={`flex items-center ${trendColor}`}>
            <TrendIcon className="mr-1 h-4 w-4" />
            {formatCurrency(Math.abs(totalGainLoss))} ({formatPercentage(totalGainLossPercentage)})
          </span>
        </p>
      </CardContent>
    </Card>
  );
}