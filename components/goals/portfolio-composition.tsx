'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import type { PortfolioHolding, PortfolioCompositionData } from '@/types/investment';
import { ASSET_CLASS_COLORS } from '@/types/investment';

interface PortfolioCompositionProps {
  holdings: PortfolioHolding[];
}

// Map asset types to asset classes for color consistency
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

export function PortfolioComposition({ holdings }: PortfolioCompositionProps) {
  const data = useMemo(() => {
    // Group holdings by asset type
    const groupedData: Record<string, number> = {};
    const totalValue = holdings.reduce((sum, h) => sum + (h.current_value || h.total_cost), 0);

    holdings.forEach(holding => {
      const assetClass = mapAssetTypeToClass(holding.asset_type);
      const value = holding.current_value || holding.total_cost;
      groupedData[assetClass] = (groupedData[assetClass] || 0) + value;
    });

    // Convert to chart data format
    return Object.entries(groupedData).map(([assetClass, value]) => ({
      name: assetClass.charAt(0).toUpperCase() + assetClass.slice(1).replace('_', ' '),
      value: value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
      color: ASSET_CLASS_COLORS[assetClass as keyof typeof ASSET_CLASS_COLORS] || '#6366f1'
    })).sort((a, b) => b.value - a.value);
  }, [holdings]);

  const totalValue = holdings.reduce((sum, h) => sum + (h.current_value || h.total_cost), 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <Card className="shadow-lg">
          <CardContent className="p-3">
            <p className="font-medium">{data.name}</p>
            <p className="text-sm text-muted-foreground">
              €{data.value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm font-medium">
              {data.payload.percentage.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    if (percentage < 5) return null; // Don't show label for small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${percentage.toFixed(0)}%`}
      </text>
    );
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nessun dato disponibile per la composizione del portfolio
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value: string) => (
                <span className="text-sm">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Valore Totale Portfolio</span>
                <span className="text-lg font-bold">
                  €{totalValue.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Numero di Asset</span>
                <span className="text-lg font-bold">{holdings.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium mb-3">Distribuzione per Asset Class</p>
              {data.slice(0, 5).map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.percentage.toFixed(1)}%</span>
                </div>
              ))}
              {data.length > 5 && (
                <p className="text-xs text-muted-foreground pt-1">
                  +{data.length - 5} altre categorie
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium">Dettaglio Holdings</h4>
        <div className="grid gap-3">
          {holdings.slice(0, 10).map((holding) => (
            <Card key={holding.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-2 h-8 rounded-full" 
                      style={{ 
                        backgroundColor: ASSET_CLASS_COLORS[mapAssetTypeToClass(holding.asset_type) as keyof typeof ASSET_CLASS_COLORS] || '#6366f1' 
                      }}
                    />
                    <div>
                      <p className="font-medium text-sm">{holding.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {holding.ticker && <span>{holding.ticker}</span>}
                        <span>•</span>
                        <span>{holding.total_quantity.toFixed(2)} unità</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      €{(holding.current_value || holding.total_cost).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {holding.percentage_of_portfolio?.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {holdings.length > 10 && (
            <p className="text-sm text-center text-muted-foreground">
              +{holdings.length - 10} altri asset nel portfolio
            </p>
          )}
        </div>
      </div>
    </div>
  );
}