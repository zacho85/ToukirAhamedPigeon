import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@/hooks/useForm';
import { BudgetCategory, ExpenseFormData } from '@/types/forms';
import { format } from 'date-fns';
import { Calendar, Loader2, Receipt, Save } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

interface ExpenseFormProps {
  budgetCategoryId?: number;
  categories: BudgetCategory[];
  expense?: any; // For editing existing expense
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ExpenseForm({
  budgetCategoryId,
  categories,
  expense,
  onSuccess,
  onCancel
}: ExpenseFormProps) {
  const isEditing = !!expense;
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data, setData, errors, processing, post, put } = useForm<ExpenseFormData>({
    budget_category_id: budgetCategoryId || expense?.budget_category_id || 0,
    title: expense?.title || '',
    amount: expense?.amount || 0,
    expense_date: expense?.expense_date || today,
  });

  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (amountRef.current && amountRef.current.value === '0') {
      amountRef.current.value = '';
      setData('amount', 0);
    }
  }, [data.amount]);

  const handleAmountFocus = () => {
    if (amountRef.current && amountRef.current.value === '0') {
      amountRef.current.value = '';
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
      put(`/expenses/${expense.id}`, submitOptions);
    } else {
      post(`/budget-categories/${data.budget_category_id}/expenses`, submitOptions);
    }
  };

  const selectedCategory = categories.find(cat => cat.id === data.budget_category_id);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          {isEditing ? 'Edit Expense' : 'Add New Expense'}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? 'Update your expense details below.'
            : 'Record a new expense to track your spending against your budget.'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection (if not pre-selected) */}
          {!budgetCategoryId && (
            <div className="space-y-2">
              <Label htmlFor="budget_category_id" className="text-sm font-medium">
                Budget Category
              </Label>
              <Select
                value={data.budget_category_id.toString()}
                onValueChange={(value) => setData('budget_category_id', parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a budget category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: category.color || '#3b82f6' }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <InputError message={errors.budget_category_id} />
            </div>
          )}

          {/* Selected Category Display (if pre-selected) */}
          {budgetCategoryId && selectedCategory && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <Label className="text-sm font-medium text-muted-foreground mb-1 block">
                Category
              </Label>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: selectedCategory.color || '#3b82f6' }}
                />
                <span className="font-medium">{selectedCategory.name}</span>
                <span className="text-sm text-muted-foreground ml-auto">
                  ${selectedCategory.limit_amount} limit
                </span>
              </div>
            </div>
          )}

          {/* Expense Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Expense Description
            </Label>
            <Input
              id="title"
              type="text"
              value={data.title}
              onChange={(e) => setData('title', e.target.value)}
              placeholder="e.g., Grocery shopping, Gas station, Restaurant dinner"
              className="w-full"
              required
            />
            <InputError message={errors.title} />
          </div>

          {/* Amount & Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">
                Amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  ref={amountRef}
                  value={data.amount}
                  onChange={(e) => setData('amount', parseFloat(e.target.value) || 0)}
                  onFocus={handleAmountFocus}
                  placeholder="0.00"
                  className="pl-8 w-full"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <InputError message={errors.amount} />
            </div>

            {/* Expense Date */}
            <div className="space-y-2">
              <Label htmlFor="expense_date" className="text-sm font-medium">
                Expense Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="expense_date"
                  type="date"
                  value={data.expense_date}
                  onChange={(e) => setData('expense_date', e.target.value)}
                  className="pl-10 w-full"
                  max={today}
                  required
                />
              </div>
              <InputError message={errors.expense_date} />
            </div>
          </div>

          {/* Expense Summary */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">
              Expense Summary
            </Label>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Description:</span>
                <span className="font-medium">{data.title || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Amount:</span>
                <span className="font-bold text-lg">${data.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Date:</span>
                <span className="font-medium">
                  {data.expense_date ? format(new Date(data.expense_date), 'MMM dd, yyyy') : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={processing || !data.budget_category_id}
              className="flex-1 sm:flex-initial"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? 'Update Expense' : 'Add Expense'}
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
