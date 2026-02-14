import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@/hooks/useForm';
import { TontineContributionFormData, StatusEnum } from '@/types/forms';
import  InputError from '@/components/input-error';
import { Loader2, DollarSign, Save, Calendar, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface TontineContributionFormProps {
  tontineMember: {
    id: number;
    user: { name: string; email: string };
    tontine: { 
      name: string; 
      contribution_amount: number; 
      frequency: string;
    };
  };
  contribution?: any; // For editing existing contribution
  onSuccess?: () => void;
  onCancel?: () => void;
}

const statusOptions: { value: StatusEnum; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'orange' },
  { value: 'paid', label: 'Paid', color: 'green' },
  { value: 'late', label: 'Late', color: 'red' },
];

export function TontineContributionForm({ 
  tontineMember, 
  contribution, 
  onSuccess, 
  onCancel 
}: TontineContributionFormProps) {
  const isEditing = !!contribution;
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const { data, setData, errors, processing, post, put } = useForm<TontineContributionFormData>({
    tontine_member_id: tontineMember.id,
    amount: contribution?.amount || tontineMember.tontine.contribution_amount,
    contribution_date: contribution?.contribution_date || today,
    status: contribution?.status || 'pending',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitOptions = {
      onSuccess: () => {
        onSuccess?.();
      },
    };

    if (isEditing) {
      put(`/tontine-contributions/${contribution.id}`, submitOptions);
    } else {
      post(`/tontine-members/${tontineMember.id}/contributions`, submitOptions);
    }
  };

  const selectedStatus = statusOptions.find(option => option.value === data.status);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {isEditing ? 'Edit Contribution' : 'Record Contribution'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update contribution details below.'
            : 'Record a new contribution for this tontine member.'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Member & Tontine Info */}
        <div className="rounded-lg border bg-muted/50 p-4 mb-6">
          <Label className="text-sm font-medium text-muted-foreground mb-2 block">
            Member Information
          </Label>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{tontineMember.user.name}</span>
              <span className="text-sm text-muted-foreground">{tontineMember.user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tontine:</span>
              <span className="font-medium">{tontineMember.tontine.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Expected Amount:</span>
              <span className="font-bold text-green-600">
                ${tontineMember.tontine.contribution_amount.toFixed(2)} {tontineMember.tontine.frequency}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount & Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">
                Contribution Amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  value={data.amount}
                  onChange={(e) => setData('amount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="pl-8 w-full"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              {data.amount !== tontineMember.tontine.contribution_amount && (
                <p className="text-xs text-orange-600">
                  Different from expected amount (${tontineMember.tontine.contribution_amount.toFixed(2)})
                </p>
              )}
              <InputError message={errors.amount} />
            </div>

            {/* Contribution Date */}
            <div className="space-y-2">
              <Label htmlFor="contribution_date" className="text-sm font-medium">
                Contribution Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contribution_date"
                  type="date"
                  value={data.contribution_date}
                  onChange={(e) => setData('contribution_date', e.target.value)}
                  className="pl-10 w-full"
                  max={today}
                  required
                />
              </div>
              <InputError message={errors.contribution_date} />
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Contribution Status
            </Label>
            <Select 
              value={data.status} 
              onValueChange={(value: StatusEnum) => setData('status', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-2 h-2 rounded-full bg-${option.color}-500`}
                      />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <InputError message={errors.status} />
          </div>

          {/* Contribution Summary */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <Label className="text-sm font-medium text-muted-foreground mb-3 block">
              Contribution Summary
            </Label>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Status:</span>
                <Badge 
                  variant={data.status === 'paid' ? 'default' : 'secondary'}
                  className={
                    data.status === 'paid' ? 'bg-green-100 text-green-800' :
                    data.status === 'late' ? 'bg-red-100 text-red-800' :
                    'bg-orange-100 text-orange-800'
                  }
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {selectedStatus?.label}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Amount:</span>
                <span className="font-bold text-lg">${data.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Date:</span>
                <span className="font-medium">
                  {data.contribution_date ? format(new Date(data.contribution_date), 'MMM dd, yyyy') : 'N/A'}
                </span>
              </div>
              {data.amount !== tontineMember.tontine.contribution_amount && (
                <div className="flex justify-between">
                  <span className="text-sm">Difference:</span>
                  <span className={`font-medium ${
                    data.amount > tontineMember.tontine.contribution_amount ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {data.amount > tontineMember.tontine.contribution_amount ? '+' : ''}
                    ${(data.amount - tontineMember.tontine.contribution_amount).toFixed(2)}
                  </span>
                </div>
              )}
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
                  {isEditing ? 'Updating...' : 'Recording...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? 'Update Contribution' : 'Record Contribution'}
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
