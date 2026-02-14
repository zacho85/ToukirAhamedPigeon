import { Breadcrumbs } from "@/components";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TontineInvite } from "@/types/forms";
import { Head, router } from "@inertiajs/react";
import { Calendar, CheckCircle, Clock, DollarSign, Users, XCircle } from "lucide-react";

interface InvitationsListProps {
    invites: TontineInvite[];
}

export default function InvitationsList({ invites }: InvitationsListProps) {
    const breadcrumbs = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Tontine System' },
        { label: 'My Invitations' },
    ];

    const handleAcceptInvite = (inviteId: number) => {
        router.patch(route('tontine-invites.accept', inviteId), {}, {
            onSuccess: () => {
                // Handle success - redirect or show success message
            },
            onError: (errors) => {
                console.error('Error accepting invitation:', errors);
            }
        });
    };

    const handleDeclineInvite = (inviteId: number) => {
        router.patch(`/tontine-invites/${inviteId}/decline`, {}, {
            onSuccess: () => {
                // Handle success - refresh the list or show success message
            },
            onError: (errors) => {
                console.error('Error declining invitation:', errors);
            }
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getTontineTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'friends':
                return 'bg-blue-100 text-blue-800';
            case 'family':
                return 'bg-green-100 text-green-800';
            case 'savings':
                return 'bg-purple-100 text-purple-800';
            case 'investment':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <>
            <Head title="My Invitations" />

            {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}
            <div className="space-y-6 mt-10">
                {/* Header */}
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Pending Invitations</h2>
                    <p className="text-muted-foreground">
                        Review and respond to your tontine invitations
                    </p>
                </div>

                {/* Invitations List */}
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
                                            <CardTitle className="text-xl">
                                                {invite.tontine.name}
                                            </CardTitle>
                                            <CardDescription>
                                                Invited on {formatDate(invite.created_at)}
                                            </CardDescription>
                                        </div>
                                        <Badge className={getTontineTypeColor(invite.tontine.type)}>
                                            {invite.tontine.type}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Tontine Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="flex items-center space-x-2">
                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Contribution</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatCurrency(invite.tontine.contribution_amount)}
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

                                    {/* Action Buttons */}
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
        </>
    );
}