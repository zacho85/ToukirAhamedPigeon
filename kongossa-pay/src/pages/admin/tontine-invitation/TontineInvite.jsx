import React, { useEffect, useState } from "react";
import  Breadcrumbs  from "@/components/dashboard/Breadcumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, DollarSign, Users, Calendar, CheckCircle, XCircle } from "lucide-react";
import {
  getTontineInvites,
  acceptTontineInvite,
  declineTontineInvite,
} from "@/api/tontineInvites";
import { useDispatch } from "react-redux";
import { showToast } from "@/store/toastSlice"; 

export default function TontineInvite() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch(); 

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "E-Tontine" },
    { label: "My Invitations" },
  ];

  const fetchInvites = async () => {
    try {
      const data = await getTontineInvites();
      setInvites(data);
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleAcceptInvite = async (inviteId) => {
    try {
      await acceptTontineInvite(inviteId);
      setInvites(invites.filter((invite) => invite.id !== inviteId));
      dispatch(
        showToast({
          type: "success",
          message: "Invitation accepted successfully",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } catch (error) {
      console.error("Error accepting invitation:", error);
      dispatch(
        showToast({
          type: "error",
          message: "Failed to accept invitation",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    }
  };

  const handleDeclineInvite = async (inviteId) => {
    try {
      await declineTontineInvite(inviteId);
      setInvites(invites.filter((invite) => invite.id !== inviteId));
      dispatch(
        showToast({
          type: "success",
          message: "Invitation declined successfully",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } catch (error) {
      console.error("Error declining invitation:", error);
      dispatch(
        showToast({
          type: "error",
          message: "Failed to decline invitation",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const getTontineTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case "friends":
        return "bg-blue-100 text-blue-800";
      case "family":
        return "bg-green-100 text-green-800";
      case "savings":
        return "bg-purple-100 text-purple-800";
      case "investment":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <p>Loading invitations...</p>;

  return (
    <div className="space-y-6 mt-10">
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      <div>
        <h2 className="text-2xl font-bold tracking-tight">Pending Invitations</h2>
        <p className="text-muted-foreground">
          Review and respond to your tontine invitations
        </p>
      </div>

      {invites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Pending Invitations</h3>
            <p className="text-muted-foreground text-center">
              You don't have any pending tontine invitations at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {invites.map((invite) => (
            <Card key={invite.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{invite.tontine.name}</CardTitle>
                    <CardDescription>
                      Invited on {formatDate(invite.createdAt)}
                    </CardDescription>
                  </div>
                  <Badge className={getTontineTypeColor(invite.tontine.type)}>
                    {invite.tontine.type}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Contribution</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(invite.tontine.contributionAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Frequency</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {invite.tontine.frequency}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Type</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {invite.tontine.type} Tontine
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => handleAcceptInvite(invite.id)}
                    className="flex-1"
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Invitation
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDeclineInvite(invite.id)}
                    className="flex-1"
                    size="sm"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
