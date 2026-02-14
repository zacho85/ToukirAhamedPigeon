import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@/hooks/useForm';
import { BudgetFormData, PeriodEnum } from '@/types/forms';
import { Loader2, Plus, Save } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

interface BudgetFormProps {
  budget?: any; // For editing existing budget
  onSuccess?: () => void;
  onCancel?: () => void;
}

const periodOptions: { value: PeriodEnum; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export function BudgetForm({ budget, onSuccess, onCancel }: BudgetFormProps) {
  const isEditing = !!budget;
  const totalAmountRef = useRef(null)
  const { data, setData, errors, processing, post, put } = useForm<BudgetFormData>({
    name: budget?.name || '',
    period: budget?.period || 'monthly',
    total_amount: budget?.total_amount || 0,
  });

  useEffect(() => {
    // @ts-ignore
    if (totalAmountRef.current && totalAmountRef.current.value === '0') {
      // @ts-ignore
      totalAmountRef.current.value = '';
      setData('total_amount', 0);
    }
  }, [data.total_amount]);

  const handleFocus = () => {
    if (data.total_amount === 0) {
      setData('total_amount', '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitOptions = {
      onSuccess: () => {
        onSuccess?.();
      },
    };

    if (isEditing) {
      put(`/budgets/${budget.id}`, submitOptions);
    } else {
      post('/budgets', submitOptions);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          {isEditing ? 'Edit Budget' : 'Create New Budget'}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? 'Update your budget details below.'
            : 'Set up a new budget to track your spending and financial goals.'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Budget Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Budget Name
            </Label>
            <Input
              id="name"
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              placeholder="e.g., Monthly Budget, Travel Fund, Emergency Savings"
              className="w-full"
              required
            />
            <InputError message={errors.name} />
          </div>

          {/* Period Selection */}
          <div className="space-y-2">
            <Label htmlFor="period" className="text-sm font-medium">
              Budget Period
            </Label>
            <Select
              value={data.period}
              onValueChange={(value: PeriodEnum) => setData('period', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select budget period" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <InputError message={errors.period} />
          </div>

          {/* Total Amount */}
          <div className="space-y-2">
            <Label htmlFor="total_amount" className="text-sm font-medium">
              Total Budget Amount
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                ref={totalAmountRef}
                id="total_amount"
                type="number"
                value={data.total_amount}
                onChange={(e) => setData('total_amount', parseFloat(e.target.value) || 0)}
                onFocus={handleFocus}
                placeholder="0.00"
                className="pl-8 w-full"
                min="0"
                step="0.01"
                required
              />
            </div>
            <InputError message={errors.total_amount} />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={processing}
              className="flex-1 sm:flex-initial"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? 'Update Budget' : 'Create Budget'}
                </>
              )}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={processing}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
