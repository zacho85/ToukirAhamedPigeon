import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from '@/hooks/useForm';
import { TontineMemberFormData } from '@/types/forms';
import InputError from '@/components/input-error';
import { Loader2, Users, Save, Crown, Hash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TontineMemberFormProps {
  tontine: {
    id: number;
    name: string;
    type: string;
  };
  availableUsers: Array<{
    id: number;
    name: string;
    email: string;
  }>;
  member?: any; // For editing existing member
  maxPriorityOrder?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TontineMemberForm({ 
  tontine, 
  availableUsers, 
  member, 
  maxPriorityOrder = 1,
  onSuccess, 
  onCancel 
}: TontineMemberFormProps) {
  const isEditing = !!member;
  
  const { data, setData, errors, processing, post, put } = useForm<TontineMemberFormData>({
    tontine_id: tontine.id,
    user_id: member?.user_id || 0,
    priority_order: member?.priority_order || (maxPriorityOrder + 1),
    is_admin: member?.is_admin || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitOptions = {
      onSuccess: () => {
        onSuccess?.();
      },
    };

    if (isEditing) {
      put(`/tontine-members/${member.id}`, submitOptions);
    } else {
      post(`/tontines/${tontine.id}/members`, submitOptions);
    }
  };

  const selectedUser = availableUsers.find(user => user.id === data.user_id);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {isEditing ? 'Edit Member' : 'Add Member to Tontine'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update member details and permissions.'
            : `Add a new member to "${tontine.name}" tontine.`
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Tontine Info */}
        <div className="rounded-lg border bg-muted/50 p-4 mb-6">
          <Label className="text-sm font-medium text-muted-foreground mb-2 block">
            Tontine Information
          </Label>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{tontine.name}</span>
              <Badge variant="outline" className="capitalize">{tontine.type}</Badge>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Selection (only for new members) */}
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="user_id" className="text-sm font-medium">
                Select User
              </Label>
              <Select 
                value={data.user_id.toString()} 
                onValueChange={(value) => setData('user_id', parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a user to add" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <InputError message={errors.user_id} />
            </div>
          )}

          {/* Current User Display (for editing) */}
          {isEditing && member && (
            <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 p-4">
              <Label className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 block">
                Current Member
              </Label>
              <div className="space-y-1">
                <div className="font-medium">{member.user.name}</div>
                <div className="text-sm text-muted-foreground">{member.user.email}</div>
              </div>
            </div>
          )}

          {/* Priority Order & Admin Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priority Order */}
            <div className="space-y-2">
              <Label htmlFor="priority_order" className="text-sm font-medium">
                Payout Priority Order
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="priority_order"
                  type="number"
                  value={data.priority_order || ''}
                  onChange={(e) => setData('priority_order', parseInt(e.target.value) || undefined)}
                  placeholder="Auto-assign"
                  className="pl-10 w-full"
                  min="1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Lower numbers receive payouts first. Leave empty to auto-assign.
              </p>
              <InputError message={errors.priority_order} />
            </div>

            {/* Admin Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Administrative Privileges
              </Label>
              <div className="flex items-center space-x-2 p-3 rounded-lg border">
                <Switch
                  id="is_admin"
                  checked={data.is_admin}
                  onCheckedChange={(checked) => setData('is_admin', checked)}
                />
                <div className="flex-1">
                  <Label htmlFor="is_admin" className="text-sm font-medium cursor-pointer">
                    Grant admin access
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Can manage members, invites, and contributions
                  </p>
                </div>
                {data.is_admin && <Crown className="h-4 w-4 text-yellow-500" />}
              </div>
              <InputError message={errors.is_admin} />
            </div>
          </div>

          {/* Member Summary */}
          {selectedUser && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <Label className="text-sm font-medium text-muted-foreground mb-3 block">
                Member Summary
              </Label>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Member:</span>
                  <div className="text-right">
                    <div className="font-medium">{selectedUser.name}</div>
                    <div className="text-xs text-muted-foreground">{selectedUser.email}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Priority Order:</span>
                  <Badge variant="outline">
                    #{data.priority_order || 'Auto-assign'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Role:</span>
                  <Badge 
                    variant={data.is_admin ? 'default' : 'secondary'}
                    className={data.is_admin ? 'bg-yellow-100 text-yellow-800' : ''}
                  >
                    {data.is_admin ? (
                      <>
                        <Crown className="w-3 h-3 mr-1" />
                        Administrator
                      </>
                    ) : (
                      'Member'
                    )}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={processing || (!isEditing && !data.user_id)}
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
                  {isEditing ? 'Update Member' : 'Add Member'}
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
