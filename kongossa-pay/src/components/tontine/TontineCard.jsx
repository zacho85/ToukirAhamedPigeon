import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function TontineCard({ tontine }) {
  const membersCount = tontine.members?.length || 0;
  const maxMembers = tontine.max_members || membersCount || 1;
  const progress = Math.min((membersCount / maxMembers) * 100, 100);
  const nextPayout = tontine.next_payout_date ? formatDistanceToNow(new Date(tontine.next_payout_date), { addSuffix: true }) : 'N/A';

  return (
    <Card className="rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-slate-900">{tontine.name}</CardTitle>
          <Badge variant={tontine.status === 'active' ? 'default' : 'secondary'} className={tontine.status === 'active' ? 'bg-green-100 text-green-800' : ''}>
            {tontine.status}
          </Badge>
        </div>
        <p className="text-sm text-slate-500">${tontine.contribution_amount} / {tontine.contribution_frequency}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Members</span>
            </div>
            <span>{membersCount} / {maxMembers}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-4 h-4" />
            <span>Next Payout: {nextPayout}</span>
          </div>
        </div>
        <div className="flex -space-x-2 overflow-hidden pt-2">
          {tontine.members?.slice(0, 5).map((memberId, i) => (
            <img
              key={i}
              className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
              src={`https://avatar.vercel.sh/${memberId}.png?text=${memberId.charAt(0)}`}
              alt={`Member ${i}`}
            />
          ))}
          {tontine.members?.length > 5 && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 ring-2 ring-white">
              <span className="text-xs font-medium text-slate-600">+{tontine.members.length - 5}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}