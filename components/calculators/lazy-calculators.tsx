import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Lazy loading dei calcolatori pesanti
const FireCalculator = lazy(() => import('./fire-calculator'));
const BaristaFireCalculator = lazy(() => import('./barista-fire-calculator'));
const CoastFireCalculator = lazy(() => import('./coast-fire-calculator'));
const ExpenseSimulator = lazy(() => import('./expense-simulator'));
const FireTimelineComparison = lazy(() => import('./fire-timeline-comparison'));
const FutureExpenseImpactCalculator = lazy(() => import('./future-expense-impact'));
const SwrVariationsCalculator = lazy(() => import('./swr-variations'));

// Skeleton per calcolatori
const CalculatorSkeleton = ({ className = "" }: { className?: string }) => (
  <Card className={className}>
    <CardHeader>
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-64" />
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-48 w-full" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="text-center">
          <Skeleton className="h-8 w-20 mx-auto" />
          <Skeleton className="h-4 w-24 mx-auto mt-1" />
        </div>
        <div className="text-center">
          <Skeleton className="h-8 w-20 mx-auto" />
          <Skeleton className="h-4 w-24 mx-auto mt-1" />
        </div>
        <div className="text-center">
          <Skeleton className="h-8 w-20 mx-auto" />
          <Skeleton className="h-4 w-24 mx-auto mt-1" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const ComparisonSkeleton = ({ className = "" }: { className?: string }) => (
  <Card className={className}>
    <CardHeader>
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-64" />
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </CardContent>
  </Card>
);

// Wrapper components con Suspense
export const LazyFireCalculator = ({ className = "" }: { className?: string }) => (
  <Suspense fallback={<CalculatorSkeleton className={className} />}>
    <FireCalculator />
  </Suspense>
);

export const LazyBaristaFireCalculator = ({ className = "" }: { className?: string }) => (
  <Suspense fallback={<CalculatorSkeleton className={className} />}>
    <BaristaFireCalculator />
  </Suspense>
);

export const LazyCoastFireCalculator = ({ className = "" }: { className?: string }) => (
  <Suspense fallback={<CalculatorSkeleton className={className} />}>
    <CoastFireCalculator />
  </Suspense>
);

export const LazyExpenseSimulator = ({ className = "" }: { className?: string }) => (
  <Suspense fallback={<CalculatorSkeleton className={className} />}>
    <ExpenseSimulator />
  </Suspense>
);

export const LazyFireTimelineComparison = ({ className = "" }: { className?: string }) => (
  <Suspense fallback={<ComparisonSkeleton className={className} />}>
    <FireTimelineComparison />
  </Suspense>
);

export const LazyFutureExpenseImpact = ({ className = "" }: { className?: string }) => (
  <Suspense fallback={<CalculatorSkeleton className={className} />}>
    <FutureExpenseImpactCalculator />
  </Suspense>
);

export const LazySwrVariations = ({ className = "" }: { className?: string }) => (
  <Suspense fallback={<ComparisonSkeleton className={className} />}>
    <SwrVariationsCalculator />
  </Suspense>
);