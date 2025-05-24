'use client';

import { useState } from 'react';
import { MoreVertical, Edit, Trash2, Play, Pause, CheckCircle, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { goalsClient } from '@/lib/goals-client';
import type { InvestmentGoal } from '@/types/investment';
import { GOAL_TYPE_CONFIG, ASSET_CLASS_COLORS } from '@/types/investment';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface GoalCardProps {
  goal: InvestmentGoal;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: () => void;
}

export function GoalCard({ goal, onEdit, onDelete, onStatusChange }: GoalCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const progress = goal.target_value > 0 ? (goal.current_value / goal.target_value) * 100 : 0;
  const goalConfig = GOAL_TYPE_CONFIG[goal.goal_type];

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await goalsClient.deleteGoal(goal.id);
      onDelete();
    } catch (error) {
      console.error('Error deleting goal:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'completed' | 'paused') => {
    try {
      setIsUpdatingStatus(true);
      await goalsClient.updateGoalStatus(goal.id, newStatus);
      onStatusChange();
    } catch (error) {
      console.error('Error updating goal status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusIcon = () => {
    switch (goal.status) {
      case 'active':
        return <Play className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'paused':
        return <Pause className="h-3 w-3" />;
    }
  };

  const getStatusColor = () => {
    switch (goal.status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'success';
      case 'paused':
        return 'secondary';
    }
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                {goal.title}
              </CardTitle>
              <CardDescription className="text-sm">
                {goalConfig.label}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusColor() as any} className="flex items-center gap-1">
                {getStatusIcon()}
                {goal.status === 'active' ? 'Attivo' : goal.status === 'completed' ? 'Completato' : 'In pausa'}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifica
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {goal.status !== 'active' && (
                    <DropdownMenuItem 
                      onClick={() => handleStatusChange('active')}
                      disabled={isUpdatingStatus}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Attiva
                    </DropdownMenuItem>
                  )}
                  {goal.status === 'active' && (
                    <>
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange('completed')}
                        disabled={isUpdatingStatus}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Completa
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange('paused')}
                        disabled={isUpdatingStatus}
                      >
                        <Pause className="mr-2 h-4 w-4" />
                        Metti in pausa
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Elimina
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {goal.description && (
            <p className="text-sm text-muted-foreground">{goal.description}</p>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">
                €{goal.current_value.toLocaleString('it-IT', { minimumFractionDigits: 2 })} / 
                €{goal.target_value.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progress.toFixed(1)}% completato</span>
              {goal.target_date && (
                <span>Scadenza: {format(new Date(goal.target_date), 'dd MMM yyyy', { locale: it })}</span>
              )}
            </div>
          </div>

          {goal.goal_type === 'portfolio_allocation' && goal.allocations && goal.allocations.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Allocazioni Target</p>
              <div className="grid grid-cols-2 gap-2">
                {goal.allocations.slice(0, 4).map((allocation) => (
                  <div key={allocation.id} className="flex items-center gap-2 text-xs">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: ASSET_CLASS_COLORS[allocation.asset_class] }}
                    />
                    <span className="text-muted-foreground capitalize">
                      {allocation.asset_class.replace('_', ' ')}
                    </span>
                    <span className="font-medium ml-auto">{allocation.target_percentage}%</span>
                  </div>
                ))}
              </div>
              {goal.allocations.length > 4 && (
                <p className="text-xs text-muted-foreground">
                  +{goal.allocations.length - 4} altre allocazioni
                </p>
              )}
            </div>
          )}

          {goal.goal_type === 'monthly_investment' && (
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Target mensile:</span>
              <span className="font-medium">
                €{goal.target_value.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro di voler eliminare questo obiettivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. L'obiettivo "{goal.title}" verrà eliminato permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminazione...' : 'Elimina'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}