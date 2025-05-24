'use client';

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface GoalProgressMiniProps {
  title: string;
  progress: number;
  status: 'on_track' | 'behind' | 'needs_rebalancing' | 'completed' | 'achieved' | 'underperforming';
  goalType: string;
  isLoading?: boolean;
}

export function GoalProgressMini({
  title,
  progress,
  status,
  goalType,
  isLoading = false
}: GoalProgressMiniProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    );
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
      case 'achieved':
        return {
          icon: CheckCircle,
          color: 'text-emerald-500',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          label: 'Completato',
          variant: 'default' as const
        };
      case 'on_track':
        return {
          icon: TrendingUp,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'In linea',
          variant: 'secondary' as const
        };
      case 'needs_rebalancing':
        return {
          icon: AlertTriangle,
          color: 'text-orange-500',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          label: 'Ribilanciare',
          variant: 'outline' as const
        };
      case 'behind':
      case 'underperforming':
        return {
          icon: AlertTriangle,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'In ritardo',
          variant: 'destructive' as const
        };
      default:
        return {
          icon: Target,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'Attivo',
          variant: 'outline' as const
        };
    }
  };

  const statusConfig = getStatusConfig();
  const Icon = statusConfig.icon;

  const getGoalTypeLabel = () => {
    const types: Record<string, string> = {
      'monthly_investment': 'Investimento Mensile',
      'portfolio_allocation': 'Allocazione Portfolio',
      'annual_return': 'Rendimento Annuale',
      'target_portfolio_value': 'Valore Portfolio Target',
      'retirement_income': 'Reddito Pensione',
      'emergency_fund': 'Fondo Emergenza',
      'custom': 'Personalizzato'
    };
    return types[goalType] || goalType;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${statusConfig.color}`} />
          <h4 className="text-sm font-medium truncate max-w-[200px]" title={title}>
            {title}
          </h4>
        </div>
        <Badge variant={statusConfig.variant} className="text-xs">
          {statusConfig.label}
        </Badge>
      </div>
      
      <div className="space-y-1">
        <Progress value={Math.min(100, progress)} className="h-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{getGoalTypeLabel()}</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}