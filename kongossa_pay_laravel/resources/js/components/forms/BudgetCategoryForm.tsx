import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@/hooks/useForm';
import { BudgetCategoryFormData } from '@/types/forms';
import InputError  from '@/components/input-error';
import { ColorPicker } from './ColorPicker';
import { Loader2, Plus, Save, Palette } from 'lucide-react';

interface BudgetCategoryFormProps {
  budgetId: number;
  category?: any; // For editing existing category
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BudgetCategoryForm({ 
  budgetId, 
  category, 
  onSuccess, 
  onCancel 
}: BudgetCategoryFormProps) {
  const isEditing = !!category;
  
  const { data, setData, errors, processing, post, put } = useForm<BudgetCategoryFormData>({
    budget_id: budgetId,
    name: category?.name || '',
    color: category?.color || '#3b82f6',
    limit_amount: category?.limit_amount || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitOptions = {
      onSuccess: () => {
        onSuccess?.();
      },
    };

    if (isEditing) {
      put(`/budget-categories/${category.id}`, submitOptions);
    } else {
      post(`/budgets/${budgetId}/categories`, submitOptions);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          {isEditing ? 'Edit Category' : 'Create Budget Category'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update your budget category details below.'
            : 'Add a new category to organize your budget expenses.'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Category Name
            </Label>
            <Input
              id="name"
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              placeholder="e.g., Food, Transportation, Entertainment, Utilities"
              className="w-full"
              required
            />
            <InputError message={errors.name} />
          </div>

          {/* Color & Limit Amount Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Color Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Category Color
              </Label>
              <div className="flex items-center gap-3">
                <ColorPicker
                  value={data.color}
                  onChange={(color) => setData('color', color)}
                  disabled={processing}
                />
                <span className="text-sm text-muted-foreground">
                  Choose a color to identify this category
                </span>
              </div>
              <InputError message={errors.color} />
            </div>

            {/* Limit Amount */}
            <div className="space-y-2">
              <Label htmlFor="limit_amount" className="text-sm font-medium">
                Spending Limit
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="limit_amount"
                  type="number"
                  value={data.limit_amount}
                  onChange={(e) => setData('limit_amount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="pl-8 w-full"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <InputError message={errors.limit_amount} />
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">
              Preview
            </Label>
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: data.color || '#3b82f6' }}
              />
              <span className="font-medium">
                {data.name || 'Category Name'}
              </span>
              <span className="text-sm text-muted-foreground ml-auto">
                ${data.limit_amount || '0.00'} limit
              </span>
            </div>
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
                  {isEditing ? 'Update Category' : 'Create Category'}
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
