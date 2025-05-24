'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { InvestmentGoal, PortfolioHolding, AllocationComparisonData, AssetClass } from '@/types/investment';
import { ASSET_CLASS_COLORS } from '@/types/investment';

interface AllocationTargetsProps {
  goals: InvestmentGoal[];
  holdings: PortfolioHolding[];
}

// Map asset types to asset classes
const mapAssetTypeToClass = (assetType: string): string => {
  const mapping: Record<string, string> = {
    'stock': 'stocks',
    'etf': 'etf',
    'fund': 'funds',
    'bond': 'bonds',
    'crypto': 'crypto',
    'cash': 'cash',
    'real_estate': 'real_estate',
    'commodity': 'commodities',
    'other': 'other'
  };
  return mapping[assetType] || 'other';
};

export function AllocationTargets({ goals, holdings }: AllocationTargetsProps) {
  const { comparisonData, activeAllocationGoal, deviations } = useMemo(() => {
    // Find active portfolio allocation goal
    const allocationGoal = goals.find(g => 
      g.goal_type === 'portfolio_allocation' && 
      g.status === 'active' &&
      g.allocations && 
      g.allocations.length > 0
    );

    if (!allocationGoal || !allocationGoal.allocations) {
      return { comparisonData: [], activeAllocationGoal: null, deviations: [] };
    }

    // Calculate current allocations from holdings
    const totalValue = holdings.reduce((sum, h) => sum + (h.current_value || h.total_cost), 0);
    const currentAllocations: Record<string, number> = {};

    holdings.forEach(holding => {
      const assetClass = mapAssetTypeToClass(holding.asset_type);
      const value = holding.current_value || holding.total_cost;
      currentAllocations[assetClass] = (currentAllocations[assetClass] || 0) + value;
    });

    // Convert to percentages
    Object.keys(currentAllocations).forEach(key => {
      currentAllocations[key] = totalValue > 0 ? (currentAllocations[key] / totalValue) * 100 : 0;
    });

    // Create comparison data
    const data: AllocationComparisonData[] = allocationGoal.allocations.map(allocation => {
      const current = currentAllocations[allocation.asset_class] || 0;
      const target = allocation.target_percentage;
      const difference = current - target;

      return {
        asset_class: allocation.asset_class,
        target,
        current,
        difference
      };
    });

    // Calculate deviations
    const significantDeviations = data.filter(d => Math.abs(d.difference) > 5);

    return { 
      comparisonData: data, 
      activeAllocationGoal: allocationGoal,
      deviations: significantDeviations
    };
  }, [goals, holdings]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Card className="shadow-lg">
          <CardContent className="p-3 space-y-1">
            <p className="font-medium capitalize">{data.asset_class.replace('_', ' ')}</p>
            <p className="text-sm">Target: {data.target.toFixed(1)}%</p>
            <p className="text-sm">Attuale: {data.current.toFixed(1)}%</p>
            <p className={`text-sm font-medium ${
              data.difference > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              Differenza: {data.difference > 0 ? '+' : ''}{data.difference.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  const getDeviationIcon = (difference: number) => {
    if (Math.abs(difference) < 2) return <Minus className="h-4 w-4" />;
    if (difference > 0) return <TrendingUp className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  const getDeviationColor = (difference: number) => {
    const abs = Math.abs(difference);
    if (abs < 2) return 'default';
    if (abs < 5) return 'secondary';
    return 'destructive';
  };

  if (!activeAllocationGoal) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          Non hai obiettivi di allocazione portfolio attivi
        </p>
        <p className="text-sm text-muted-foreground">
          Crea un obiettivo di tipo "Allocazione Portfolio" per vedere il confronto
        </p>
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          Nessun investimento nel portfolio
        </p>
        <p className="text-sm text-muted-foreground">
          Aggiungi transazioni per vedere il confronto con gli obiettivi
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {deviations.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Attenzione:</strong> {deviations.length} asset class{deviations.length > 1 ? 'i' : ''} con deviazioni significative (&gt;5%) dal target
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6">
          <h4 className="text-sm font-medium mb-4">Obiettivo: {activeAllocationGoal.title}</h4>
          {activeAllocationGoal.description && (
            <p className="text-sm text-muted-foreground mb-4">{activeAllocationGoal.description}</p>
          )}
          
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="asset_class" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ')}
                />
                <YAxis 
                  label={{ value: 'Percentuale (%)', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="target" 
                  fill="#3b82f6" 
                  name="Target"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="current" 
                  fill="#10b981" 
                  name="Attuale"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <h4 className="text-sm font-medium">Dettaglio Allocazioni</h4>
        {comparisonData.map((item) => (
          <Card key={item.asset_class}>
            <CardContent className="py-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: ASSET_CLASS_COLORS[item.asset_class] }}
                    />
                    <span className="font-medium capitalize">
                      {item.asset_class.replace('_', ' ')}
                    </span>
                  </div>
                  <Badge variant={getDeviationColor(item.difference) as any} className="flex items-center gap-1">
                    {getDeviationIcon(item.difference)}
                    {item.difference > 0 ? '+' : ''}{item.difference.toFixed(1)}%
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Target</span>
                    <span className="font-medium">{item.target.toFixed(1)}%</span>
                  </div>
                  <Progress value={item.target} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Attuale</span>
                    <span className="font-medium">{item.current.toFixed(1)}%</span>
                  </div>
                  <Progress value={item.current} className="h-2 bg-green-100">
                    <div 
                      className="h-full bg-green-500 transition-all" 
                      style={{ width: `${item.current}%` }}
                    />
                  </Progress>
                </div>

                {Math.abs(item.difference) > 5 && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-xs">
                      {item.difference > 0 
                        ? `Sovraesposto di ${item.difference.toFixed(1)}% rispetto al target`
                        : `Sottoesposto di ${Math.abs(item.difference).toFixed(1)}% rispetto al target`
                      }
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h4 className="text-sm font-medium mb-3">Suggerimenti per il Ribilanciamento</h4>
          <div className="space-y-2">
            {comparisonData
              .filter(item => Math.abs(item.difference) > 2)
              .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))
              .map((item) => (
                <div key={item.asset_class} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground">•</span>
                  <span>
                    {item.difference > 0 ? (
                      <>Considera di <strong>ridurre</strong> {item.asset_class.replace('_', ' ')} del {item.difference.toFixed(1)}%</>
                    ) : (
                      <>Considera di <strong>aumentare</strong> {item.asset_class.replace('_', ' ')} del {Math.abs(item.difference).toFixed(1)}%</>
                    )}
                  </span>
                </div>
              ))}
            {comparisonData.filter(item => Math.abs(item.difference) > 2).length === 0 && (
              <p className="text-sm text-muted-foreground">
                Il tuo portfolio è ben bilanciato rispetto agli obiettivi!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}