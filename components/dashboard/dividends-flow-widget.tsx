'use client';

import { useState } from 'react';
import { usePortfolioData } from "@/hooks/use-portfolio-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Calendar, Banknote, ChevronDown, ChevronUp } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, Cell } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

interface DividendData {
  month: string;
  amount: number;
  stocks: number;
  etfs: number;
  bonds: number;
}

interface CashFlowData {
  month: string;
  inflows: number;
  outflows: number;
  net: number;
}

export function DividendsFlowWidget() {
  const { holdings, stats, isLoading } = usePortfolioData();
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
  const [isExpanded, setIsExpanded] = useState(true);

  // Genera dati dividendi simulati
  const generateDividendData = (): DividendData[] => {
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    return months.map(month => {
      const isQuarterlyMonth = ['Mar', 'Giu', 'Set', 'Dic'].includes(month);
      const baseAmount = isQuarterlyMonth ? 800 : 200;
      
      return {
        month,
        amount: baseAmount + Math.random() * 300,
        stocks: (baseAmount * 0.6) + Math.random() * 150,
        etfs: (baseAmount * 0.3) + Math.random() * 100,
        bonds: (baseAmount * 0.1) + Math.random() * 50,
      };
    });
  };

  // Genera dati flussi di cassa
  const generateCashFlowData = (): CashFlowData[] => {
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    return months.map((month, index) => {
      const dividends = generateDividendData()[index].amount;
      const contributions = 2000 + Math.random() * 500;
      const withdrawals = Math.random() > 0.8 ? Math.random() * 1000 : 0;
      
      return {
        month,
        inflows: dividends + contributions,
        outflows: withdrawals,
        net: dividends + contributions - withdrawals
      };
    });
  };

  const dividendData = generateDividendData();
  const cashFlowData = generateCashFlowData();

  // Calcola metriche
  const totalDividends = dividendData.reduce((sum, d) => sum + d.amount, 0);
  const averageMonthlyDividend = totalDividends / 12;
  const portfolioYield = stats.totalValue > 0 ? (totalDividends / stats.totalValue) * 100 : 0;
  const projectedDividends = totalDividends * 1.05;
  const projectedYield = stats.totalValue > 0 ? (projectedDividends / stats.totalValue) * 100 : 0;

  // Dati per vista annuale
  const yearlyData = [
    { year: '2020', dividends: 8500, growth: 0 },
    { year: '2021', dividends: 9200, growth: 8.2 },
    { year: '2022', dividends: 10100, growth: 9.8 },
    { year: '2023', dividends: 11300, growth: 11.9 },
    { year: '2024', dividends: totalDividends, growth: 6.2 },
    { year: '2025*', dividends: projectedDividends, growth: 5.0 },
  ];

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
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
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
            <Banknote className="h-5 w-5" />
            Dividendi e Flussi
          </CardTitle>
          <CardDescription>Analisi dei dividendi e flussi di cassa</CardDescription>
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
            <Banknote className="h-5 w-5" />
            Dividendi e Flussi
          </CardTitle>
          <CardDescription>Analisi dei dividendi e flussi di cassa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              Nessun investimento registrato per mostrare dividendi e flussi
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer">
        <div 
          className="flex items-center justify-between"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              Dividendi e Flussi
            </CardTitle>
            <CardDescription>Analisi dei dividendi e flussi di cassa</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </div>
        {isExpanded && (
          <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
            <Button
              variant={viewMode === 'monthly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('monthly')}
            >
              Mensile
            </Button>
            <Button
              variant={viewMode === 'yearly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('yearly')}
            >
              Annuale
            </Button>
          </div>
        )}
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Metriche principali */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-sm font-medium mb-1">Dividendi Annuali</div>
              <div className="text-xl font-bold">{formatCurrency(totalDividends)}</div>
              <div className="text-xs text-emerald-500">
                {formatPercentage(6.2)} vs anno prec.
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-sm font-medium mb-1">Media Mensile</div>
              <div className="text-xl font-bold">{formatCurrency(averageMonthlyDividend)}</div>
              <div className="text-xs text-muted-foreground">
                Dividendi medi/mese
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-sm font-medium mb-1">Yield Portfolio</div>
              <div className="text-xl font-bold">{portfolioYield.toFixed(2)}%</div>
              <div className="text-xs text-muted-foreground">
                Rendimento da dividendi
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-sm font-medium mb-1">Proiezione 2025</div>
              <div className="text-xl font-bold">{formatCurrency(projectedDividends)}</div>
              <div className="text-xs text-muted-foreground">
                Yield: {projectedYield.toFixed(2)}%
              </div>
            </div>
          </div>

          <Tabs defaultValue="dividends" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dividends">Dividendi</TabsTrigger>
              <TabsTrigger value="cashflow">Flussi di Cassa</TabsTrigger>
              <TabsTrigger value="projection">Proiezioni</TabsTrigger>
            </TabsList>

            <TabsContent value="dividends" className="space-y-4">
              {viewMode === 'monthly' ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dividendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="month" 
                        className="text-xs"
                        tick={{ fill: 'currentColor' }}
                      />
                      <YAxis 
                        className="text-xs"
                        tick={{ fill: 'currentColor' }}
                        tickFormatter={(value) => `€${value}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '14px' }} />
                      <Bar dataKey="stocks" stackId="a" fill="#3b82f6" name="Azioni" />
                      <Bar dataKey="etfs" stackId="a" fill="#10b981" name="ETF" />
                      <Bar dataKey="bonds" stackId="a" fill="#f59e0b" name="Obbligazioni" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yearlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="year" 
                        className="text-xs"
                        tick={{ fill: 'currentColor' }}
                      />
                      <YAxis 
                        className="text-xs"
                        tick={{ fill: 'currentColor' }}
                        tickFormatter={(value) => `€${value}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="dividends" fill="#3b82f6" name="Dividendi">
                        {yearlyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.year === '2025*' ? '#94a3b8' : '#3b82f6'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <h4 className="text-sm font-medium mb-2">Top Dividend Payers</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>MSFT</span>
                      <span className="font-medium">€2,400/anno</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>JNJ</span>
                      <span className="font-medium">€1,800/anno</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>VYM ETF</span>
                      <span className="font-medium">€1,200/anno</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <h4 className="text-sm font-medium mb-2">Prossimi Dividendi</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>15 Gen - AAPL</span>
                      <span className="font-medium">€180</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>1 Feb - VTI</span>
                      <span className="font-medium">€320</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>15 Mar - MSFT</span>
                      <span className="font-medium">€600</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cashflow" className="space-y-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="month" 
                      className="text-xs"
                      tick={{ fill: 'currentColor' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'currentColor' }}
                      tickFormatter={(value) => `€${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '14px' }} />
                    <Area 
                      type="monotone" 
                      dataKey="inflows" 
                      stackId="1" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.6}
                      name="Entrate"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="outflows" 
                      stackId="2" 
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      fillOpacity={0.6}
                      name="Uscite"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="net" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Netto"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-emerald-500/10 text-center">
                  <div className="text-2xl font-bold text-emerald-500">
                    {formatCurrency(cashFlowData.reduce((sum, d) => sum + d.inflows, 0))}
                  </div>
                  <div className="text-xs text-muted-foreground">Totale Entrate</div>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10 text-center">
                  <div className="text-2xl font-bold text-red-500">
                    {formatCurrency(cashFlowData.reduce((sum, d) => sum + d.outflows, 0))}
                  </div>
                  <div className="text-xs text-muted-foreground">Totale Uscite</div>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10 text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {formatCurrency(cashFlowData.reduce((sum, d) => sum + d.net, 0))}
                  </div>
                  <div className="text-xs text-muted-foreground">Flusso Netto</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="projection" className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-3">Proiezione Dividendi Futuri</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Crescita media annua stimata</span>
                    <Badge variant="secondary">5%</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>2025</span>
                        <span className="font-medium">{formatCurrency(projectedDividends)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>2026</span>
                        <span className="font-medium">{formatCurrency(projectedDividends * 1.05)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>2027</span>
                        <span className="font-medium">{formatCurrency(projectedDividends * 1.05 * 1.05)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>2028</span>
                        <span className="font-medium">{formatCurrency(projectedDividends * Math.pow(1.05, 3))}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>2029</span>
                        <span className="font-medium">{formatCurrency(projectedDividends * Math.pow(1.05, 4))}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>2030</span>
                        <span className="font-medium">{formatCurrency(projectedDividends * Math.pow(1.05, 5))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <h4 className="text-sm font-medium">Impatto sul FIRE</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Con i dividendi attuali, copri il {((totalDividends / (stats.totalValue * 0.04)) * 100).toFixed(1)}% 
                  delle tue spese annuali stimate per il FIRE.
                </p>
                <div className="text-sm">
                  Dividendi necessari per coprire il 100%: 
                  <span className="font-bold ml-1">{formatCurrency(stats.totalValue * 0.04)}</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
}