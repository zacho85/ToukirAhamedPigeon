import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@/hooks/useForm';
import { TontineInviteFormData } from '@/types/forms';
import  InputError from '@/components/input-error';
import { Loader2, Mail, Send, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TontineInviteFormProps {
  tontine: {
    id: number;
    name: string;
    type: string;
    contribution_amount: number;
    frequency: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TontineInviteForm({ tontine, onSuccess, onCancel }: TontineInviteFormProps) {
  const { data, setData, errors, processing, post, reset } = useForm<TontineInviteFormData>({
    tontine_id: tontine.id,
    email: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    post(`/tontines/${tontine.id}/invites`, {
      onSuccess: () => {
        reset();
        onSuccess?.();
      },
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Invite Member to Tontine
        </CardTitle>
        <CardDescription>
          Send an invitation to join "{tontine.name}" tontine.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Tontine Info */}
        <div className="rounded-lg border bg-muted/50 p-4 mb-6">
          <Label className="text-sm font-medium text-muted-foreground mb-2 block">
            Tontine Details
          </Label>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{tontine.name}</span>
              <Badge variant="outline" className="capitalize">{tontine.type}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Contribution:</span>
              <span className="font-medium">
                ${tontine.contribution_amount} {tontine.frequency}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                placeholder="member@example.com"
                className="pl-10 w-full"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              The person will receive an email invitation to join this tontine.
            </p>
            <InputError message={errors.email} />
          </div>

          {/* Invitation Preview */}
          {data.email && (
            <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 p-4">
              <Label className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 block">
                Invitation Preview
              </Label>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="mb-2">
                  <strong>{data.email}</strong> will receive an invitation to join:
                </p>
                <ul className="space-y-1 ml-4">
                  <li>• Tontine: <strong>{tontine.name}</strong></li>
                  <li>• Type: <strong className="capitalize">{tontine.type}</strong></li>
                  <li>• Contribution: <strong>${tontine.contribution_amount} {tontine.frequency}</strong></li>
                </ul>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={processing || !data.email}
              className="flex-1 sm:flex-initial"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Invitation...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Invitation
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
