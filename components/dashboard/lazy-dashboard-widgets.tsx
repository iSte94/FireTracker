import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Lazy loading dei widget dashboard pesanti
const TimeToFireWidget = lazy(() => import('./time-to-fire-widget').then(module => ({ default: module.TimeToFireWidget })));
const SavingsRateWidget = lazy(() => import('./savings-rate-widget').then(module => ({ default: module.SavingsRateWidget })));
const SafeWithdrawalRateWidget = lazy(() => import('./safe-withdrawal-rate-widget').then(module => ({ default: module.SafeWithdrawalRateWidget })));
const FireTypesProgressWidget = lazy(() => import('./fire-types-progress-widget').then(module => ({ default: module.FireTypesProgressWidget })));
const PortfolioOverviewWidget = lazy(() => import('./portfolio-overview-widget').then(module => ({ default: module.PortfolioOverviewWidget })));
const InvestmentGoalsWidget = lazy(() => import('./investment-goals-widget').then(module => ({ default: module.InvestmentGoalsWidget })));
const FinancialTransactionsWidget = lazy(() => import('./financial-transactions-widget').then(module => ({ default: module.FinancialTransactionsWidget })));
const PortfolioDiversificationWidget = lazy(() => import('./portfolio-diversification-widget').then(module => ({ default: module.PortfolioDiversificationWidget })));
const HistoricalReturnsWidget = lazy(() => import('./historical-returns-widget').then(module => ({ default: module.HistoricalReturnsWidget })));
const RiskReturnWidget = lazy(() => import('./risk-return-widget').then(module => ({ default: module.RiskReturnWidget })));
const DividendsFlowWidget = lazy(() => import('./dividends-flow-widget').then(module => ({ default: module.DividendsFlowWidget })));

// Skeleton components per il loading
const WidgetSkeleton = ({ className = "" }: { className?: string }) => (
  <Card className={className}>
    <CardHeader>
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-48" />
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </CardContent>
  </Card>
);

const ChartSkeleton = ({ className = "" }: { className?: string }) => (
  <Card className={className}>
    <CardHeader>
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-48" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-64 w-full" />
    </CardContent>
  </Card>
);

// Wrapper components con Suspense
export const LazyTimeToFireWidget = ({ className = "" }: { className?: string }) => (
  <Suspense fallback={<WidgetSkeleton className={className} />}>
    <TimeToFireWidget />
  </Suspense>
);

export const LazySavingsRateWidget = ({ className = "" }: { className?: string }) => (
  <Suspense fallback={<WidgetSkeleton className={className} />}>
    <SavingsRateWidget />
  </Suspense>
);

export const LazySafeWithdrawalRateWidget = ({ className = "" }: { className?: string }) => (
  <Suspense fallback={<WidgetSkeleton className={className} />}>
    <SafeWithdrawalRateWidget />
  </Suspense>
);

export const LazyFireTypesProgressWidget = ({ className = "" }: { className?: string }) => (
  <Suspense fallback={<ChartSkeleton className={className} />}>
    <FireTypesProgressWidget />
  </Suspense>
);

export const LazyPortfolioOverviewWidget = ({ className = "" }: { className?: string }) => (
  <Suspense fallback={<WidgetSkeleton className={className} />}>
    <PortfolioOverviewWidget />
  </Suspense>
);

export const LazyInvestmentGoalsWidget = ({ className = "" }: { className?: string }) => (
  <Suspense fallback={<WidgetSkeleton className={className} />}>
    <InvestmentGoalsWidget />
  </Suspense>
);

export const LazyFinancialTransactionsWidget = ({ className = "" }: { className?: string }) => (
  <Suspense fallback={<ChartSkeleton className={className} />}>
    <FinancialTransactionsWidget />
  </Suspense>
);

export const LazyPortfolioDiversificationWidget = ({ className = "" }: { className?: string }) => (
  <Suspense fallback={<ChartSkeleton className={className} />}>
    <PortfolioDiversificationWidget />
  </Suspense>
);

export const LazyHistoricalReturnsWidget = ({ className = "" }: { className?: string }) => (
  <Suspense fallback={<ChartSkeleton className={className} />}>
    <HistoricalReturnsWidget />
  </Suspense>
);

export const LazyRiskReturnWidget = ({ className = "" }: { className?: string }) => (
  <Suspense fallback={<ChartSkeleton className={className} />}>
    <RiskReturnWidget />
  </Suspense>
);

export const LazyDividendsFlowWidget = ({ className = "" }: { className?: string }) => (
  <Suspense fallback={<ChartSkeleton className={className} />}>
    <DividendsFlowWidget />
  </Suspense>
);