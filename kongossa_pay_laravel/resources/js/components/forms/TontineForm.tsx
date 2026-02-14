import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@/hooks/useForm';
import { FrequencyEnum, Tontine, TontineFormData, TontineTypeEnum, TontineTypeEnums } from '@/types/forms';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';
import { CircleDollarSign, HelpCircle, Loader2, Save, Users } from 'lucide-react';
import React from 'react';

interface TontineFormProps {
  tontine?: Tontine;
  onSuccess?: () => void;
  onCancel?: () => void;
  tontineTypes: TontineTypeEnums[];
}

const frequencyOptions: { value: FrequencyEnum; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export function TontineForm({ tontine, onSuccess, onCancel, tontineTypes }: TontineFormProps) {
  const isEditing = !!tontine;


  const { data, setData, errors, processing, post, put } = useForm<TontineFormData>({
    name: tontine?.name || '',
    type: tontine?.type || 'friends',
    contribution_amount: tontine?.contribution_amount ?? 0,
    frequency: tontine?.frequency || 'monthly',
    duration_months: tontine?.duration_months || 12,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitOptions = {
      onSuccess: () => {
        onSuccess?.();
      },
    };

    if (isEditing) {
      put(`/tontines/${tontine.id}`, submitOptions);
    } else {
      post('/tontines', submitOptions);
    }
  };

  const selectedType = tontineTypes.find(option => option.value === data.type);
  const totalCycles = data.frequency === 'weekly'
    ? Math.round(data.duration_months * 4.33)
    : data.duration_months;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {isEditing ? 'Edit Tontine' : 'Create New Tontine'}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? 'Update your tontine details below.'
            : 'Set up a new tontine to start collaborative savings with your group.'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tontine Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Tontine Name
            </Label>
            <Input
              id="name"
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              placeholder="e.g., Family Emergency Fund, Friends Travel Savings, Investment Group"
              className="w-full"
              required
            />
            <InputError message={errors.name} />
          </div>

          {/* Tontine Type */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium">
              Tontine Type
            </Label>
            <Select
              value={data.type}
              onValueChange={(value: TontineTypeEnum) => setData('type', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select tontine type" />
              </SelectTrigger>
              <SelectContent>
                {tontineTypes.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <InputError message={errors.type} />
          </div>

          {/* Contribution Amount & Frequency Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contribution Amount */}
            <div className="space-y-2">
              <Label htmlFor="contribution_amount" className="text-sm font-medium">
                Contribution Amount {isEditing && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="inline w-4 h-4 ml-1 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className='bg-gray-300 text-sm'>You can't change the price of an existing tontine.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </Label>
              <div className="relative">
                <CircleDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contribution_amount"
                  type="number"
                  value={data.contribution_amount || ''}
                  onChange={(e) => setData('contribution_amount', parseFloat(e.target.value) || 0)}
                  onFocus={(e) => {
                    if (parseFloat(e.target.value) === 0) {
                      setData('contribution_amount', null);
                    }
                  }}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      setData('contribution_amount', 0);
                    }
                  }}
                  placeholder="0.00"
                  className="pl-10 w-full"
                  min="0"
                  step="0.01"
                  required
                  disabled={isEditing}
                  title={isEditing ? 'This field is disabled because you are editing an existing tontine.' : ''}
                />
              </div>
              <InputError message={errors.contribution_amount} />
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <Label htmlFor="frequency" className="text-sm font-medium">
                Contribution Frequency
              </Label>
              <Select
                value={data.frequency}
                onValueChange={(value: FrequencyEnum) => setData('frequency', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <InputError message={errors.frequency} />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration_months" className="text-sm font-medium">
              Duration (Months)
            </Label>
            <Input
              id="duration_months"
              type="number"
              value={data.duration_months}
              onChange={(e) => setData('duration_months', parseInt(e.target.value) || 0)}
              placeholder="12"
              className="w-full"
              min="1"
              max="60"
              required
            />
            <p className="text-xs text-muted-foreground">
              Total cycles: {totalCycles} {data.frequency} contributions
            </p>
            <InputError message={errors.duration_months} />
          </div>

          {/* Tontine Summary */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <Label className="text-sm font-medium text-muted-foreground mb-3 block">
              Tontine Summary
            </Label>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Type:</span>
                <Badge variant="secondary">{selectedType?.label}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Per-member contribution:</span>
                <span className="font-bold">${data.contribution_amount} {data.frequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Duration:</span>
                <span className="font-medium">{data.duration_months} months ({totalCycles} cycles)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Estimated pool per cycle:</span>
                <span className="font-bold text-green-600">
                  ${(data.contribution_amount * 10)}
                  <span className="text-xs text-muted-foreground ml-1">(10 members)</span>
                </span>
              </div>
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
                  {isEditing ? 'Update Tontine' : 'Create Tontine'}
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
