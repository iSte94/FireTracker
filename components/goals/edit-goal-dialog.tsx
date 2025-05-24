'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { goalsClient } from '@/lib/goals-client';
import type { InvestmentGoal, GoalFormData, AssetClass } from '@/types/investment';
import { GOAL_TYPE_CONFIG, ASSET_CLASS_COLORS } from '@/types/investment';

const formSchema = z.object({
  title: z.string().min(1, 'Il titolo è obbligatorio'),
  description: z.string().optional(),
  goal_type: z.enum([
    'monthly_investment',
    'portfolio_allocation',
    'annual_return',
    'target_portfolio_value',
    'retirement_income',
    'emergency_fund',
    'custom'
  ]),
  target_value: z.number().min(0.01, 'Il valore target deve essere maggiore di 0'),
  target_date: z.date().optional().nullable(),
});

const assetClasses: { value: AssetClass; label: string }[] = [
  { value: 'stocks', label: 'Azioni' },
  { value: 'bonds', label: 'Obbligazioni' },
  { value: 'crypto', label: 'Criptovalute' },
  { value: 'etf', label: 'ETF' },
  { value: 'funds', label: 'Fondi' },
  { value: 'cash', label: 'Liquidità' },
  { value: 'real_estate', label: 'Immobiliare' },
  { value: 'commodities', label: 'Materie Prime' },
  { value: 'other', label: 'Altro' },
];

interface EditGoalDialogProps {
  goal: InvestmentGoal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalUpdated: () => void;
}

export function EditGoalDialog({ goal, open, onOpenChange, onGoalUpdated }: EditGoalDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allocations, setAllocations] = useState<{ asset_class: AssetClass; target_percentage: number }[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: goal.title,
      description: goal.description || '',
      goal_type: goal.goal_type,
      target_value: goal.target_value,
      target_date: goal.target_date ? new Date(goal.target_date) : null,
    },
  });

  useEffect(() => {
    // Reset form when goal changes
    form.reset({
      title: goal.title,
      description: goal.description || '',
      goal_type: goal.goal_type,
      target_value: goal.target_value,
      target_date: goal.target_date ? new Date(goal.target_date) : null,
    });

    // Set allocations if they exist
    if (goal.allocations) {
      setAllocations(goal.allocations.map(a => ({
        asset_class: a.asset_class,
        target_percentage: a.target_percentage
      })));
    } else {
      setAllocations([]);
    }
  }, [goal, form]);

  const goalType = form.watch('goal_type');
  const showAllocations = goalType === 'portfolio_allocation';

  const addAllocation = () => {
    const availableClasses = assetClasses.filter(
      ac => !allocations.find(a => a.asset_class === ac.value)
    );
    if (availableClasses.length > 0) {
      setAllocations([...allocations, { 
        asset_class: availableClasses[0].value, 
        target_percentage: 0 
      }]);
    }
  };

  const removeAllocation = (index: number) => {
    setAllocations(allocations.filter((_, i) => i !== index));
  };

  const updateAllocation = (index: number, field: 'asset_class' | 'target_percentage', value: any) => {
    const newAllocations = [...allocations];
    newAllocations[index] = { ...newAllocations[index], [field]: value };
    setAllocations(newAllocations);
  };

  const getTotalPercentage = () => {
    return allocations.reduce((sum, a) => sum + (a.target_percentage || 0), 0);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      // Validate allocations if needed
      if (showAllocations) {
        const total = getTotalPercentage();
        if (total !== 100) {
          form.setError('target_value', {
            message: 'La somma delle allocazioni deve essere 100%'
          });
          return;
        }
      }

      const updates: Partial<GoalFormData> = {
        title: values.title,
        description: values.description,
        goal_type: values.goal_type,
        target_value: values.target_value,
        target_date: values.target_date ? format(values.target_date, 'yyyy-MM-dd') : undefined,
        allocations: showAllocations ? allocations : undefined,
      };

      await goalsClient.updateGoal(goal.id, updates);
      onGoalUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifica Obiettivo</DialogTitle>
          <DialogDescription>
            Aggiorna i dettagli del tuo obiettivo di investimento
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titolo</FormLabel>
                  <FormControl>
                    <Input placeholder="es. Portafoglio Pensione" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrizione (opzionale)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrivi il tuo obiettivo..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="goal_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo di Obiettivo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(GOAL_TYPE_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex flex-col">
                            <span>{config.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {config.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {goalType === 'monthly_investment' ? 'Importo Mensile Target' :
                     goalType === 'annual_return' ? 'Rendimento Annuale Target (%)' :
                     goalType === 'emergency_fund' ? 'Mesi di Spese' :
                     'Valore Target (€)'}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    {goalType === 'annual_return' && 'Inserisci la percentuale di rendimento annuale desiderata'}
                    {goalType === 'emergency_fund' && 'Numero di mesi di spese da coprire'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data Target (opzionale)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: it })
                          ) : (
                            <span>Seleziona una data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Data entro cui vuoi raggiungere l'obiettivo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showAllocations && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Allocazioni Target</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAllocation}
                    disabled={allocations.length >= assetClasses.length}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Aggiungi Asset Class
                  </Button>
                </div>

                {allocations.length === 0 ? (
                  <Card>
                    <CardContent className="py-6 text-center text-muted-foreground">
                      Aggiungi almeno una asset class per definire l'allocazione target
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {allocations.map((allocation, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex items-end gap-3">
                            <div className="flex-1">
                              <label className="text-sm font-medium">Asset Class</label>
                              <Select
                                value={allocation.asset_class}
                                onValueChange={(value) => updateAllocation(index, 'asset_class', value as AssetClass)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {assetClasses.map((ac) => (
                                    <SelectItem 
                                      key={ac.value} 
                                      value={ac.value}
                                      disabled={allocations.some((a, i) => i !== index && a.asset_class === ac.value)}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div 
                                          className="w-3 h-3 rounded-full" 
                                          style={{ backgroundColor: ASSET_CLASS_COLORS[ac.value] }}
                                        />
                                        {ac.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="w-32">
                              <label className="text-sm font-medium">Percentuale</label>
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  value={allocation.target_percentage}
                                  onChange={(e) => updateAllocation(index, 'target_percentage', parseFloat(e.target.value) || 0)}
                                />
                                <span className="text-sm">%</span>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeAllocation(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <div className="text-right">
                      <span className={cn(
                        "text-sm font-medium",
                        getTotalPercentage() === 100 ? "text-green-600" : "text-destructive"
                      )}>
                        Totale: {getTotalPercentage().toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso attuale:</span>
                <span className="font-medium">
                  €{goal.current_value.toLocaleString('it-IT', { minimumFractionDigits: 2 })} / 
                  €{goal.target_value.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Percentuale completata:</span>
                <span className="font-medium">
                  {((goal.current_value / goal.target_value) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annulla
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}