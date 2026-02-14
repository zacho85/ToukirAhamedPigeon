import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Breadcrumbs from "@/components/dashboard/Breadcumbs";
import TontineContributionForm from "@/components/dashboard/TontineContributionForm";
import TontineInviteForm from "@/components/dashboard/TontineInviteForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Crown, DollarSign, Edit, MoreHorizontal, Plus, Receipt, TrendingUp, UserPlus } from "lucide-react";
import { getTontineById } from "@/api/tontines";
import {Link} from "react-router-dom";
import { useDispatch } from "react-redux";
import { showToast } from "@/store/toastSlice"; 


export default function TontineDetailPage() {
  const { id } = useParams();
  const [tontine, setTontine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const dispatch = useDispatch(); 

  async function fetchTontine() {
      try {
        const data = await getTontineById(id);
        setTontine(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

  useEffect(() => {
    fetchTontine();
  }, [id]);

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case "friends": return "bg-blue-100 text-blue-800";
      case "family": return "bg-green-100 text-green-800";
      case "savings": return "bg-purple-100 text-purple-800";
      case "investment": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "late": return "bg-red-100 text-red-800";
      case "completed": return "bg-green-100 text-green-800";
      case "scheduled": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <p className="py-16 text-center">Loading...</p>;
  if (!tontine) return <p className="py-16 text-center">Tontine not found</p>;

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Tontine System" },
    { label: "My Tontines", href: "/tontines" },
    { label: tontine.name },
  ];

  return (
    <>
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      <div className="space-y-6 mt-10">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{tontine.name}</h1>
              <Badge className={getTypeBadgeColor(tontine.type)}>{tontine.type}</Badge>
              {tontine.isAdmin && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-800 flex items-center gap-1">
                  <Crown className="h-3 w-3" /> Admin
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Created on {new Date(tontine.created_at).toLocaleDateString()} • {tontine.members.length} members • ${tontine.contribution_amount} {tontine.frequency}
            </p>
          </div>

          <div className="flex gap-2">
            {tontine.isAdmin && (
              <>
                <Dialog open={showInviteForm} onOpenChange={setShowInviteForm}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="mr-2 h-4 w-4" /> Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Invite New Member</DialogTitle>
                    </DialogHeader>
                    <TontineInviteForm tontine={tontine} onSuccess={() => setShowInviteForm(false)} onCancel={() => setShowInviteForm(false)} />
                  </DialogContent>
                </Dialog>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/tontines/${tontine.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Tontine
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            {!tontine.isAdmin && (
              <Button>
                <DollarSign className="mr-2 h-4 w-4" /> Make Contribution
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Contributed</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${tontine.stats.total_contributed}</div>
              <p className="text-xs text-muted-foreground">From {tontine.members.length} members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Paid Out</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${tontine.stats.total_paid_out}</div>
              <p className="text-xs text-muted-foreground">Distributed to members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completion</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tontine.stats.completion_percentage.toFixed(1)}%</div>
              <Progress value={tontine.stats.completion_percentage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{tontine.stats.cycles_completed} of {tontine.stats.total_cycles} cycles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Next Payout</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {tontine.stats.next_payout_date ? (
                <div className="text-2xl font-bold">{new Date(tontine.stats.next_payout_date).toLocaleDateString()}</div>
              ) : (
                <div className="text-2xl font-bold text-muted-foreground">TBD</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Members */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div className="flex flex-row justify-between items-start w-full">
                <div className="">
                <CardTitle>Members ({tontine.members.length})</CardTitle>
                <CardDescription>Tontine participants and their contributions</CardDescription>
                </div>
                <div>
                  {tontine.isAdmin && (
                    <Button size="sm" onClick={() => setShowInviteForm(true)}>
                      <Plus className="mr-2 h-3 w-3" /> Add Member
                    </Button>
                  )}
                </div>
              </div>

              
            </CardHeader>

            <CardContent className="space-y-3">
              {tontine.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 pr-2">
                      <span className="font-medium">{member.user.fullName}</span>
                      {member.isAdmin && <Crown className="h-3 w-3 text-yellow-500" />}
                      {member.priorityOrder && (
                        <Badge variant="outline" className="text-xs">
                          #{member.priorityOrder}
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">{member.user.email}</span>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="font-medium text-green-600">${member.total_contributed}</p>
                    {member.pending_contributions > 0 && (
                      <p className="text-sm text-red-600">${member.pending_contributions} pending</p>
                    )}
                    {tontine.isAdmin && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedMember(member);
                          setShowContributionForm(true);
                        }}
                      >
                        <Receipt className="mr-1 h-3 w-3" /> Record
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>


          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest contributions and payouts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Recent Contributions */}
              <div>
                <h4 className="font-medium text-sm mb-2">Recent Contributions</h4>
                {tontine.contributions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent contributions</p>
                ) : (
                  tontine.contributions.slice(0, 3).map(c => (
                    <div key={c.id} className="flex justify-between items-center py-1">
                      <div>
                        <p className="text-sm font-medium">{c.tontineMember.user.fullName}</p>
                        <p className="text-xs text-muted-foreground">{new Date(c.contribution_date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${c.amount ? Number(c.amount).toFixed(2) : '0.00'}</p>
                        <Badge variant="secondary" className={`text-xs ${getStatusBadgeColor(c.status)}`}>{c.status}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Upcoming Payouts */}
              <div>
                <h4 className="font-medium text-sm mb-2">Upcoming Payouts</h4>
                {tontine.upcoming_payouts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No upcoming payouts</p>
                ) : (
                  tontine.upcoming_payouts.slice(0, 3).map(p => (
                    <div key={p.id} className="flex justify-between items-center py-1">
                      <div>
                        <p className="text-sm font-medium">{p.recipient.user.name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(p.payout_date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">${p.amount.toFixed(2)}</p>
                        <Badge variant="secondary" className={`text-xs ${getStatusBadgeColor(p.status)}`}>{p.status}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contribution Modal */}
        <Dialog open={showContributionForm} onOpenChange={setShowContributionForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Record Contribution</DialogTitle></DialogHeader>
            {selectedMember && (
              <TontineContributionForm
                tontineMember={selectedMember}
                onSuccess={() => { setShowContributionForm(false); setSelectedMember(null); fetchTontine();}}
                onCancel={() => { setShowContributionForm(false); setSelectedMember(null); }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
