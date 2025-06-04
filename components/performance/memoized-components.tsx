import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Memoized Fire Number Card per evitare re-renders inutili
interface FireNumberData {
  currentSavings: number;
  monthlyExpenses: number;
  safeWithdrawalRate: number;
}

const MemoizedFireNumberCard = memo(({ data }: { data: FireNumberData }) => {
  const fireNumber = useMemo(() => {
    if (!data.monthlyExpenses || data.safeWithdrawalRate <= 0) return 0;
    return (data.monthlyExpenses * 12) / (data.safeWithdrawalRate / 100);
  }, [data.monthlyExpenses, data.safeWithdrawalRate]);

  const progress = useMemo(() => {
    if (fireNumber === 0) return 0;
    return Math.min((data.currentSavings / fireNumber) * 100, 100);
  }, [data.currentSavings, fireNumber]);

  const yearsToFire = useMemo(() => {
    if (fireNumber === 0 || data.currentSavings >= fireNumber) return 0;
    const remaining = fireNumber - data.currentSavings;
    const monthlySavings = data.monthlyExpenses * 0.3; // Assume 30% savings rate
    if (monthlySavings <= 0) return Infinity;
    return Math.ceil(remaining / (monthlySavings * 12));
  }, [fireNumber, data.currentSavings, data.monthlyExpenses]);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-3xl font-bold text-primary">
          €{fireNumber.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
        </div>
        <p className="text-sm text-muted-foreground">Il tuo FIRE Number</p>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progresso</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {yearsToFire > 0 && yearsToFire !== Infinity && (
        <div className="text-center">
          <div className="text-lg font-semibold">
            {yearsToFire} {yearsToFire === 1 ? 'anno' : 'anni'}
          </div>
          <p className="text-xs text-muted-foreground">per raggiungere il FIRE</p>
        </div>
      )}
    </div>
  );
});

MemoizedFireNumberCard.displayName = 'MemoizedFireNumberCard';

// Memoized Stats Widget
interface StatsData {
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  lastUpdated: string;
}

const MemoizedStatsWidget = memo(({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon,
  isLoading = false 
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  isLoading?: boolean;
}) => {
  const changeColor = useMemo(() => {
    switch (changeType) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  }, [changeType]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-28" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === 'number' 
            ? value.toLocaleString('it-IT') 
            : value
          }
        </div>
        {change && (
          <p className={`text-xs ${changeColor}`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
});

MemoizedStatsWidget.displayName = 'MemoizedStatsWidget';

// Memoized Progress Bar
const MemoizedProgressBar = memo(({ 
  progress, 
  label, 
  color = 'primary',
  showPercentage = true 
}: {
  progress: number;
  label?: string;
  color?: string;
  showPercentage?: boolean;
}) => {
  const progressPercentage = useMemo(() => 
    Math.min(Math.max(progress, 0), 100), 
    [progress]
  );

  const colorClass = useMemo(() => {
    switch (color) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'danger': return 'bg-red-500';
      default: return 'bg-primary';
    }
  }, [color]);

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between text-sm">
          <span>{label}</span>
          {showPercentage && <span>{progressPercentage.toFixed(1)}%</span>}
        </div>
      )}
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ease-out ${colorClass}`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
});

MemoizedProgressBar.displayName = 'MemoizedProgressBar';

// Memoized Chart Container
const MemoizedChartContainer = memo(({ 
  children, 
  title, 
  description,
  height = 'h-64',
  isLoading = false 
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  height?: string;
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return (
      <Card>
        {title && (
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            {description && <Skeleton className="h-4 w-48" />}
          </CardHeader>
        )}
        <CardContent>
          <Skeleton className={`w-full ${height}`} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
      )}
      <CardContent className={height}>
        {children}
      </CardContent>
    </Card>
  );
});

MemoizedChartContainer.displayName = 'MemoizedChartContainer';

export {
  MemoizedFireNumberCard,
  MemoizedStatsWidget,
  MemoizedProgressBar,
  MemoizedChartContainer,
};