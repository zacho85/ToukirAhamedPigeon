import { Breadcrumbs } from '@/components';
import { TontineContributionForm, TontineInviteForm } from '@/components/forms';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Head, Link } from '@inertiajs/react';
import {
  Calendar,
  Clock,
  Crown,
  DollarSign,
  Edit,
  MoreHorizontal,
  Plus,
  Receipt,
  TrendingUp,
  UserPlus
} from 'lucide-react';
import { useState } from 'react';

interface TontineMember {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  tontine: {
    name: string;
    contribution_amount: number;
    frequency: string;
  };
  priority_order: number | null;
  is_admin: boolean;
  total_contributed: number;
  pending_contributions: number;
  joined_at: string;
}

interface TontineContribution {
  id: number;
  amount: number;
  contribution_date: string;
  status: 'pending' | 'paid' | 'late';
  member: {
    user: {
      name: string;
    };
  };
}

interface TonninePayout {
  id: number;
  recipient: {
    user: {
      name: string;
    };
  };
  amount: number;
  payout_date: string;
  status: 'scheduled' | 'completed';
}

interface Tontine {
  id: number;
  name: string;
  type: 'friends' | 'family' | 'savings' | 'investment';
  contribution_amount: number;
  frequency: 'weekly' | 'monthly';
  duration_months: number;
  created_at: string;
  is_admin: boolean;
  members: TontineMember[];
  recent_contributions: TontineContribution[];
  upcoming_payouts: TonninePayout[];
  stats: {
    total_contributed: number;
    total_paid_out: number;
    completion_percentage: number;
    next_payout_date: string | null;
    cycles_completed: number;
    total_cycles: number;
  };
}

interface TontineDetailProps {
  tontine: Tontine;
}

export default function TontineDetail({ tontine }: TontineDetailProps) {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TontineMember | null>(null);

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'friends': return 'bg-blue-100 text-blue-800';
      case 'family': return 'bg-green-100 text-green-800';
      case 'savings': return 'bg-purple-100 text-purple-800';
      case 'investment': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'late': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Tontine System' },
    { label: 'My Tontines', href: '/tontines' },
    { label: tontine.name },
  ];


  return (
    <>
      <Head title={tontine.name} />
      {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}
      <div className="space-y-6 mt-10">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{tontine.name}</h1>
              <Badge
                variant="secondary"
                className={getTypeBadgeColor(tontine.type)}
              >
                {tontine.type}
              </Badge>
              {tontine.is_admin && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                  <Crown className="mr-1 h-3 w-3" />
                  Admin
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Created on {new Date(tontine.created_at).toLocaleDateString()} •
              {tontine.members?.length} members •
              ${tontine.contribution_amount} {tontine.frequency}
            </p>
          </div>

          <div className="flex gap-2">
            {tontine.is_admin && (
              <>
                <Dialog open={showInviteForm} onOpenChange={setShowInviteForm}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Invite New Member</DialogTitle>
                    </DialogHeader>
                    <TontineInviteForm
                      tontine={tontine}
                      onSuccess={() => setShowInviteForm(false)}
                      onCancel={() => setShowInviteForm(false)}
                    />
                  </DialogContent>
                </Dialog>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/tontines/${tontine.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Tontine
                      </Link>
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem asChild>
                      <Link href={`/tontines/${tontine.id}/reports`}>
                        <Receipt className="mr-2 h-4 w-4" />
                        View Reports
                      </Link>
                    </DropdownMenuItem> */}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {!tontine.is_admin && (
              <Button>
                <DollarSign className="mr-2 h-4 w-4" />
                Make Contribution
              </Button>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contributed</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${tontine.stats?.total_contributed}
              </div>
              <p className="text-xs text-muted-foreground">
                From {tontine.members?.length} members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid Out</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${tontine.stats?.total_paid_out}
              </div>
              <p className="text-xs text-muted-foreground">
                Distributed to members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tontine.stats?.completion_percentage?.toFixed(1)}%
              </div>
              <Progress value={tontine.stats?.completion_percentage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {tontine.stats?.cycles_completed} of {tontine.stats?.total_cycles} cycles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Payout</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {tontine.stats?.next_payout_date ? (
                <>
                  <div className="text-2xl font-bold">
                    {new Date(tontine.stats?.next_payout_date)?.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tontine.stats?.next_payout_date)?.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-muted-foreground">
                    TBD
                  </div>
                  <p className="text-xs text-muted-foreground">
                    To be determined
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Members and Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Members */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Members ({tontine.members?.length})</CardTitle>
                <CardDescription>
                  Tontine participants and their contributions
                </CardDescription>
              </div>
              {tontine.is_admin && (
                <Button size="sm" onClick={() => setShowInviteForm(true)}>
                  <Plus className="mr-2 h-3 w-3" />
                  Add Member
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tontine.members?.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{member.user.name}</span>
                          {member.is_admin && (
                            <Crown className="h-3 w-3 text-yellow-500" />
                          )}
                          {member.priority_order && (
                            <Badge variant="outline" className="text-xs">
                              #{member.priority_order}
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {member.user.email}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        ${member.total_contributed}
                      </p>
                      {member.pending_contributions > 0 && (
                        <p className="text-sm text-red-600">
                          ${member.pending_contributions.toLocaleString()} pending
                        </p>
                      )}
                      {/* {tontine.is_admin && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-1"
                          onClick={() => {
                            setSelectedMember(member);
                            setShowContributionForm(true);
                          }}
                        >
                          <Receipt className="mr-1 h-3 w-3" />
                          Record
                        </Button>
                      )} */}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest contributions and payouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Recent Contributions */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Recent Contributions</h4>
                  <div className="space-y-2">
                    {tontine.recent_contributions?.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No recent contributions</p>
                    ) : (
                      tontine.recent_contributions?.slice(0, 3).map((contribution) => (
                        <div key={contribution.id} className="flex items-center justify-between py-1">
                          <div>
                            <p className="text-sm font-medium">
                              {contribution.member.user.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(contribution.contribution_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              ${contribution.amount.toFixed(2)}
                            </p>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getStatusBadgeColor(contribution.status)}`}
                            >
                              {contribution.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Upcoming Payouts */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Upcoming Payouts</h4>
                  <div className="space-y-2">
                    {tontine.upcoming_payouts?.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No upcoming payouts</p>
                    ) : (
                      tontine.upcoming_payouts?.slice(0, 3).map((payout) => (
                        <div key={payout.id} className="flex items-center justify-between py-1">
                          <div>
                            <p className="text-sm font-medium">
                              {payout.recipient.user.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(payout.payout_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-600">
                              ${payout.amount.toFixed(2)}
                            </p>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getStatusBadgeColor(payout.status)}`}
                            >
                              {payout.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contribution Form Modal */}
        <Dialog open={showContributionForm} onOpenChange={setShowContributionForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record Contribution</DialogTitle>
            </DialogHeader>
            {selectedMember && (
              <TontineContributionForm
                tontineMember={selectedMember}
                onSuccess={() => {
                  setShowContributionForm(false);
                  setSelectedMember(null);
                }}
                onCancel={() => {
                  setShowContributionForm(false);
                  setSelectedMember(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
