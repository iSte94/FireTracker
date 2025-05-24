'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { GoalProgressData } from '@/types/investment';

interface GoalProgressChartProps {
  goalId: string;
  targetValue: number;
  currentValue: number;
  targetDate?: string;
  // In a real implementation, this would fetch historical data from the database
  // For now, we'll generate sample data
}

export function GoalProgressChart({ goalId, targetValue, currentValue, targetDate }: GoalProgressChartProps) {
  const data = useMemo(() => {
    // Generate sample progress data
    // In production, this would be fetched from a historical data table
    const months = 12;
    const startValue = 0;
    const monthlyGrowth = currentValue / months;
    
    const progressData: GoalProgressData[] = [];
    const today = new Date();
    
    for (let i = months; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      
      const value = Math.max(0, startValue + (months - i) * monthlyGrowth + (Math.random() - 0.5) * monthlyGrowth * 0.3);
      
      progressData.push({
        date: format(date, 'MMM yyyy', { locale: it }),
        value: parseFloat(value.toFixed(2)),
        target: targetValue
      });
    }
    
    // Add projected data if target date is in the future
    if (targetDate && new Date(targetDate) > today) {
      const monthsToTarget = Math.ceil((new Date(targetDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30));
      const projectedMonthlyGrowth = (targetValue - currentValue) / monthsToTarget;
      
      for (let i = 1; i <= Math.min(monthsToTarget, 6); i++) {
        const date = new Date(today);
        date.setMonth(date.getMonth() + i);
        
        const projectedValue = currentValue + i * projectedMonthlyGrowth;
        
        progressData.push({
          date: format(date, 'MMM yyyy', { locale: it }),
          value: parseFloat(projectedValue.toFixed(2)),
          target: targetValue
        });
      }
    }
    
    return progressData;
  }, [currentValue, targetValue, targetDate, goalId]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isProjected = new Date(data.date) > new Date();
      
      return (
        <Card className="shadow-lg">
          <CardContent className="p-3 space-y-1">
            <p className="font-medium">{data.date}</p>
            <p className="text-sm">
              Valore: €{data.value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-muted-foreground">
              Target: €{data.target.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            {isProjected && (
              <p className="text-xs text-amber-600 font-medium">Proiezione</p>
            )}
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  const progressPercentage = (currentValue / targetValue) * 100;
  const isOnTrack = progressPercentage >= 80; // Consider on track if above 80% of expected progress

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Valore Attuale</p>
              <p className="text-2xl font-bold">
                €{currentValue.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground">
                {progressPercentage.toFixed(1)}% del target
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Target</p>
              <p className="text-2xl font-bold">
                €{targetValue.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              {targetDate && (
                <p className="text-xs text-muted-foreground">
                  Entro {format(new Date(targetDate), 'dd MMM yyyy', { locale: it })}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Stato Progresso</p>
              <p className={`text-2xl font-bold ${isOnTrack ? 'text-green-600' : 'text-amber-600'}`}>
                {isOnTrack ? 'In linea' : 'In ritardo'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isOnTrack 
                  ? 'Stai procedendo bene verso il tuo obiettivo'
                  : 'Considera di aumentare i contributi'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h4 className="text-sm font-medium mb-4">Andamento nel Tempo</h4>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine 
                  y={targetValue} 
                  stroke="#ef4444" 
                  strokeDasharray="5 5"
                  label={{ value: "Target", position: "right" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Valore"
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                {/* Show projected line if we have future data */}
                {data.some(d => new Date(d.date) > new Date()) && (
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Proiezione"
                    data={data.filter(d => new Date(d.date) >= new Date())}
                    dot={{ fill: '#f59e0b', r: 3 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {targetDate && new Date(targetDate) > new Date() && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h4 className="text-sm font-medium mb-3">Analisi del Progresso</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Tempo rimanente</span>
                <span className="font-medium">
                  {Math.ceil((new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30))} mesi
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Importo rimanente</span>
                <span className="font-medium">
                  €{(targetValue - currentValue).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Contributo mensile necessario</span>
                <span className="font-medium">
                  €{((targetValue - currentValue) / Math.max(1, Math.ceil((new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)))).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}