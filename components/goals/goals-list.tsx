'use client';

import { useState } from 'react';
import { GoalCard } from './goal-card';
import { EditGoalDialog } from './edit-goal-dialog';
import type { InvestmentGoal } from '@/types/investment';

interface GoalsListProps {
  goals: InvestmentGoal[];
  onGoalUpdated: () => void;
  onGoalDeleted: () => void;
}

export function GoalsList({ goals, onGoalUpdated, onGoalDeleted }: GoalsListProps) {
  const [editingGoal, setEditingGoal] = useState<InvestmentGoal | null>(null);

  const handleEdit = (goal: InvestmentGoal) => {
    setEditingGoal(goal);
  };

  const handleEditComplete = () => {
    setEditingGoal(null);
    onGoalUpdated();
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onEdit={() => handleEdit(goal)}
            onDelete={onGoalDeleted}
            onStatusChange={onGoalUpdated}
          />
        ))}
      </div>

      {editingGoal && (
        <EditGoalDialog
          goal={editingGoal}
          open={!!editingGoal}
          onOpenChange={(open: boolean) => !open && setEditingGoal(null)}
          onGoalUpdated={handleEditComplete}
        />
      )}
    </>
  );
}