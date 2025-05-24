'use client';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Deviation {
  asset_class: string;
  target: number;
  current: number;
  deviation: number;
  action: 'increase' | 'decrease';
}

interface AllocationDeviationAlertProps {
  deviations: Deviation[];
  onRebalance?: () => void;
  compact?: boolean;
}

export function AllocationDeviationAlert({
  deviations,
  onRebalance,
  compact = false
}: AllocationDeviationAlertProps) {
  if (!deviations || deviations.length === 0) {
    return null;
  }

  const highPriorityDeviations = deviations.filter(d => d.deviation > 10);
  const hasHighPriority = highPriorityDeviations.length > 0;

  const formatAssetClass = (assetClass: string) => {
    const translations: Record<string, string> = {
      'stocks': 'Azioni',
      'bonds': 'Obbligazioni',
      'crypto': 'Crypto',
      'etf': 'ETF',
      'funds': 'Fondi',
      'cash': 'Liquidità',
      'real_estate': 'Immobiliare',
      'commodities': 'Materie Prime',
      'other': 'Altro'
    };
    return translations[assetClass] || assetClass;
  };

  if (compact) {
    return (
      <Alert variant={hasHighPriority ? "destructive" : "default"} className="py-2">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          {deviations.length} allocazion{deviations.length === 1 ? 'e devia' : 'i deviano'} dagli obiettivi
          {onRebalance && (
            <Button 
              variant="link" 
              size="sm" 
              className="ml-2 h-auto p-0 text-xs"
              onClick={onRebalance}
            >
              Ribilancia
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant={hasHighPriority ? "destructive" : "default"}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Deviazioni dalle Allocazioni Target</AlertTitle>
      <AlertDescription>
        <div className="mt-2 space-y-2">
          {deviations.map((deviation, index) => {
            const Icon = deviation.action === 'increase' ? TrendingUp : TrendingDown;
            const actionText = deviation.action === 'increase' ? 'Aumentare' : 'Ridurre';
            const actionColor = deviation.action === 'increase' ? 'text-emerald-600' : 'text-red-600';
            
            return (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${actionColor}`} />
                  <span className="font-medium">{formatAssetClass(deviation.asset_class)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">
                    Attuale: {deviation.current.toFixed(1)}% | Target: {deviation.target.toFixed(1)}%
                  </span>
                  <span className={`font-medium ${deviation.deviation > 10 ? 'text-red-600' : 'text-orange-600'}`}>
                    {deviation.deviation.toFixed(1)}% di deviazione
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        {onRebalance && (
          <div className="mt-4 flex justify-end">
            <Button size="sm" onClick={onRebalance}>
              Visualizza Piano di Ribilanciamento
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}