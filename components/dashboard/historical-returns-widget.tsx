'use client';

import { useState } from 'react';
import { usePortfolioData } from "@/hooks/use-portfolio-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Activity, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

interface PerformanceData {
  date: string;
  portfolio: number;
  benchmark: number;
}

interface PeriodReturn {
  period: string;
  portfolioReturn: number;
  benchmarkReturn: number;
  excess: number;
}

export function HistoricalReturnsWidget() {
  const { holdings, stats, isLoading } = usePortfolioData();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1Y');

  // Simula dati storici (in produzione verrebbero dal database)
  const generateHistoricalData = (period: string): PerformanceData[] => {
    const data: PerformanceData[] = [];
    const now = new Date();
    let dataPoints = 0;
    let interval = 1; // giorni

    switch (period) {
      case '1M':
        dataPoints = 30;
        interval = 1;
        break;
      case '3M':
        dataPoints = 90;
        interval = 3;
        break;
      case '6M':
        dataPoints = 180;
        interval = 6;
        break;
      case '1Y':
        dataPoints = 365;
        interval = 7;
        break;
      case '3Y':
        dataPoints = 365 * 3;
        interval = 30;
        break;
      case '5Y':
        dataPoints = 365 * 5;
        interval = 60;
        break;
      case 'ALL':
        dataPoints = 365 * 10;
        interval = 90;
        break;
    }

    const baseValue = 100000;
    let portfolioValue = baseValue;
    let benchmarkValue = baseValue;

    for (let i = dataPoints; i >= 0; i -= interval) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Simula rendimenti casuali ma realistici
      const portfolioReturn = (Math.random() - 0.48) * 0.02; // -1% a +1% per intervallo
      const benchmarkReturn = (Math.random() - 0.49) * 0.015; // Leggermente meno volatile

      portfolioValue *= (1 + portfolioReturn);
      benchmarkValue *= (1 + benchmarkReturn);

      data.push({
        date: date.toLocaleDateString('it-IT', { month: 'short', day: 'numeric', year: period === '5Y' || period === 'ALL' ? '2-digit' : undefined }),
        portfolio: Math.round(portfolioValue),
        benchmark: Math.round(benchmarkValue)
      });
    }

    return data;
  };

  const historicalData = generateHistoricalData(selectedPeriod);

  // Calcola rendimenti per periodo
  const periodReturns: PeriodReturn[] = [
    { period: '1M', portfolioReturn: 2.3, benchmarkReturn: 1.8, excess: 0.5 },
    { period: '3M', portfolioReturn: 5.7, benchmarkReturn: 4.2, excess: 1.5 },
    { period: '6M', portfolioReturn: 8.9, benchmarkReturn: 7.1, excess: 1.8 },
    { period: '1Y', portfolioReturn: 12.4, benchmarkReturn: 10.2, excess: 2.2 },
    { period: '3Y', portfolioReturn: 28.6, benchmarkReturn: 24.3, excess: 4.3 },
    { period: '5Y', portfolioReturn: 52.3, benchmarkReturn: 45.7, excess: 6.6 },
    { period: 'ALL', portfolioReturn: 124.5, benchmarkReturn: 98.2, excess: 26.3 }
  ];

  // Metriche di rischio
  const volatility = 14.2; // Deviazione standard annualizzata
  const sharpeRatio = 0.89;
  const maxDrawdown = -18.5;

  // Migliori e peggiori periodi
  const bestMonth = { period: 'Apr 2023', return: 8.2 };
  const worstMonth = { period: 'Mar 2020', return: -12.3 };
  const bestYear = { period: '2021', return: 24.6 };
  const worstYear = { period: '2022', return: -8.4 };

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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium mb-1">{label}</p>
          <div className="space-y-1">
            <p className="text-sm flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full" />
              Portfolio: {formatCurrency(payload[0].value)}
            </p>
            <p className="text-sm flex items-center gap-2">
              <span className="w-3 h-3 bg-gray-500 rounded-full" />
              Benchmark: {formatCurrency(payload[1].value)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Rendimento Storico
          </CardTitle>
          <CardDescription>Performance del portfolio nel tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (holdings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Rendimento Storico
          </CardTitle>
          <CardDescription>Performance del portfolio nel tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              Nessun investimento registrato per mostrare i rendimenti storici
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Rendimento Storico
        </CardTitle>
        <CardDescription>Performance del portfolio nel tempo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selettore periodo */}
        <div className="flex gap-2 flex-wrap">
          {['1M', '3M', '6M', '1Y', '3Y', '5Y', 'ALL'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period}
            </Button>
          ))}
        </div>

        {/* Grafico rendimenti */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '14px' }}
                iconType="line"
              />
              <ReferenceLine y={100000} stroke="gray" strokeDasharray="3 3" />
              <Line 
                type="monotone" 
                dataKey="portfolio" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                name="Portfolio"
              />
              <Line 
                type="monotone" 
                dataKey="benchmark" 
                stroke="#6b7280" 
                strokeWidth={2}
                dot={false}
                name="S&P 500"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tabs per dettagli */}
        <Tabs defaultValue="returns" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="returns">Rendimenti</TabsTrigger>
            <TabsTrigger value="risk">Rischio</TabsTrigger>
            <TabsTrigger value="extremes">Estremi</TabsTrigger>
          </TabsList>

          <TabsContent value="returns" className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {periodReturns.map((item) => (
                <div key={item.period} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.period}</span>
                    <Badge variant={item.portfolioReturn >= 0 ? "default" : "destructive"} className="text-xs">
                      {formatPercentage(item.portfolioReturn)}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    vs Benchmark: {formatPercentage(item.benchmarkReturn)}
                  </div>
                  <div className="text-xs font-medium text-emerald-500">
                    Excess: {formatPercentage(item.excess)}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="risk" className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Volatilità</span>
                </div>
                <div className="text-2xl font-bold">{volatility.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Deviazione standard annualizzata</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Sharpe Ratio</span>
                </div>
                <div className="text-2xl font-bold">{sharpeRatio.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Rendimento aggiustato per il rischio</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Max Drawdown</span>
                </div>
                <div className="text-2xl font-bold text-red-500">{maxDrawdown.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Massima perdita dal picco</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="extremes" className="space-y-3">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Migliori Periodi
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="text-sm font-medium">Miglior Mese</div>
                    <div className="text-lg font-bold text-emerald-500">{formatPercentage(bestMonth.return)}</div>
                    <div className="text-xs text-muted-foreground">{bestMonth.period}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="text-sm font-medium">Miglior Anno</div>
                    <div className="text-lg font-bold text-emerald-500">{formatPercentage(bestYear.return)}</div>
                    <div className="text-xs text-muted-foreground">{bestYear.period}</div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Peggiori Periodi
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div className="text-sm font-medium">Peggior Mese</div>
                    <div className="text-lg font-bold text-red-500">{formatPercentage(worstMonth.return)}</div>
                    <div className="text-xs text-muted-foreground">{worstMonth.period}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div className="text-sm font-medium">Peggior Anno</div>
                    <div className="text-lg font-bold text-red-500">{formatPercentage(worstYear.return)}</div>
                    <div className="text-xs text-muted-foreground">{worstYear.period}</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}