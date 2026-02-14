import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { Calendar, DollarSign, Loader2, Shield, Users } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface TontineInvitation {
    id: number;
    name: string;
    description: string;
    type: 'friends' | 'family' | 'savings' | 'investment';
    tontine: {
        id: number;
        name: string;
        contribution_amount: string;
        frequency: 'weekly' | 'monthly';
        created_at: string;
    };
    admin_name: string;
    status: 'expired' | 'accepted' | 'declined' | 'pending';
    created_at: string;
    updated_at: string;
    expires_at: string;
    days_since_sent: number;
    email: string;
    invite_url: string;
    invited_user: null | any;
    is_expired: boolean;
}

interface Props {
    invitation: TontineInvitation;
    token: string;
    errors?: Record<string, string>;
}

const tontineTypeColors = {
    friends: 'bg-blue-100 text-blue-800',
    family: 'bg-green-100 text-green-800',
    savings: 'bg-purple-100 text-purple-800',
    investment: 'bg-orange-100 text-orange-800',
};

const tontineTypeLabels = {
    friends: 'Friends',
    family: 'Family',
    savings: 'Savings',
    investment: 'Investment',
};

export default function PublicInvitation({ invitation }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        email: invitation.email,
        phone: '',
        password: '',
        password_confirmation: ''
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        post(route('register'), {
            onFinish: () => setIsSubmitting(false),
        });
    };

    if (invitation.status === 'expired') {
        return (
            <AuthLayout title='Invitation Expired' description='This invitation is no longer valid.'>
                <Head title="Invitation Expired" />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <CardTitle className="text-red-600">Invitation Expired</CardTitle>
                            <CardDescription>
                                This tontine invitation has expired and is no longer valid.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </AuthLayout>
        );
    }

    // if (invitation.available_spots === 0) {
    //     return (
    //         <>
    //             <Head title="Tontine Full" />
    //             <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    //                 <Card className="w-full max-w-md">
    //                     <CardHeader className="text-center">
    //                         <CardTitle className="text-yellow-600">Tontine Full</CardTitle>
    //                         <CardDescription>
    //                             This tontine has reached its maximum capacity. No more spots are available.
    //                         </CardDescription>
    //                     </CardHeader>
    //                 </Card>
    //             </div>
    //         </>
    //     );
    // }

    return (
        <AuthLayout title={`Join ${invitation.name}`} description="Join this tontine by filling out the form below.">
            <Head title={`Join ${invitation.name} - Tontine Invitation`} />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl space-y-6">
                    {/* Tontine Information Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-2xl">{invitation.name}</CardTitle>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${tontineTypeColors[invitation.type]}`}>
                                    {tontineTypeLabels[invitation.type]}
                                </span>
                            </div>
                            <CardDescription>{invitation.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                    <DollarSign className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium">Contribution</p>
                                        <p className="text-sm text-gray-600">
                                            ${invitation.tontine.contribution_amount.toLocaleString()} {invitation.tontine.frequency}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Users className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium">Available Spots</p>
                                        <p className="text-sm text-gray-600">
                                            Unlimited
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium">Start Date</p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(invitation.tontine.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Shield className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium">Admin</p>
                                        <p className="text-sm text-gray-600">{invitation.admin_name}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Join Form Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Join This Tontine</CardTitle>
                            <CardDescription>
                                Please provide your information to join this tontine.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter your full name"
                                        required
                                        disabled={processing}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Enter your email address"
                                        required
                                        disabled={true}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="Enter your phone number"
                                        required
                                        disabled={processing}
                                    />
                                    {errors.phone && (
                                        <p className="text-sm text-red-600">{errors.phone}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        disabled={processing}
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-red-600">{errors.password}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Password Confirmation</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Enter your password confirmation"
                                        required
                                        disabled={processing}
                                    />
                                    {errors.password_confirmation && (
                                        <p className="text-sm text-red-600">{errors.password_confirmation}</p>
                                    )}
                                </div>

                                {/* {errors.general && (
                                    <Alert>
                                        <AlertDescription>{errors.general}</AlertDescription>
                                    </Alert>
                                )} */}

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={processing || isSubmitting}
                                >
                                    {(processing || isSubmitting) && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Join Tontine
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Security Notice */}
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="pt-6">
                            <div className="flex items-start space-x-3">
                                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div className="text-sm text-blue-700">
                                    <p className="font-medium">Secure & Transparent</p>
                                    <p>Your information is protected and all tontine activities are transparent to all members.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthLayout>
    );
}
