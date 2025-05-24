"use client"

import dynamic from "next/dynamic"
import { ChartSkeleton } from "@/components/ui/chart-skeleton"

// Lazy load dei componenti grafici pesanti
export const LazyNetWorthChart = dynamic(() => import("@/components/net-worth-chart"), {
  loading: () => <ChartSkeleton />,
  ssr: false,
})

export const LazyExpensesChart = dynamic(() => import("@/components/expenses-chart"), {
  loading: () => <ChartSkeleton />,
  ssr: false,
})

// Commentiamo temporaneamente questi componenti finché non verifichiamo la loro struttura
// export const LazyPortfolioPerformanceChart = dynamic(
//   () => import("@/components/financial-transactions/portfolio-performance-chart"),
//   {
//     loading: () => <ChartSkeleton />,
//     ssr: false,
//   }
// )

// export const LazyAssetAllocationChart = dynamic(
//   () => import("@/components/financial-transactions/asset-allocation-chart"),
//   {
//     loading: () => <ChartSkeleton />,
//     ssr: false,
//   }
// )

// Wrapper per altri componenti che potrebbero beneficiare del lazy loading
export const LazyHistoricalReturnsWidget = dynamic(
  () => import("@/components/dashboard/historical-returns-widget").then(mod => ({ default: mod.HistoricalReturnsWidget })),
  {
    loading: () => <ChartSkeleton className="h-96" />,
    ssr: false,
  }
)

export const LazyRiskReturnWidget = dynamic(
  () => import("@/components/dashboard/risk-return-widget").then(mod => ({ default: mod.RiskReturnWidget })),
  {
    loading: () => <ChartSkeleton className="h-96" />,
    ssr: false,
  }
)

export const LazyPortfolioDiversificationWidget = dynamic(
  () => import("@/components/dashboard/portfolio-diversification-widget").then(mod => ({ default: mod.PortfolioDiversificationWidget })),
  {
    loading: () => <ChartSkeleton className="h-96" />,
    ssr: false,
  }
)