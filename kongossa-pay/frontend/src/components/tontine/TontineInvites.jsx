import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TontineInvites() {
  const invites = [];

  if (invites.length === 0) {
    return (
      <Card className="rounded-2xl shadow-sm border-dashed border-2 border-slate-300">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Pending Invites</h3>
          <p className="text-slate-500">
            You don't have any pending tontine invitations at the moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {invites.map(invite => (
        <Card key={invite.id} className="rounded-2xl shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">{invite.tontineName}</p>
              <p className="text-sm text-slate-500">Invited by {invite.inviterName}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">Decline</Button>
              <Button size="sm">Accept</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}