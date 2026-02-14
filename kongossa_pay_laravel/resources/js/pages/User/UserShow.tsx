import { Breadcrumbs } from '@/components';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { SharedData, User } from '@/types';
import { Tontine, TontineMember } from '@/types/forms';
import { Head, Link } from '@inertiajs/react';
import { Building2, FileText, Mail, MapPin, Phone, UserCheck, User as UserIcon } from 'lucide-react';

interface UserWithTontines extends User {
    created_tontines: Tontine[];
    tontine_memberships: TontineMember[];
}
interface UserShowProps {
    auth: SharedData['auth'];
    user: UserWithTontines;
}

export default function UserShow({ auth, user }: UserShowProps) {
    console.log(user);
    const createdTontines = user.created_tontines || [];
    const memberTontines = user.tontine_memberships || [];


    const breadcrumbs = [
        { label: 'Users', href: route('users.index') },
        { label: user.name },
    ]
    return (
        <>
            {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}
            <Head title={`User: ${user.name}`} />

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mt-10">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="text-lg">
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{user.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant={user.user_type === 'business_merchant' ? 'default' : 'secondary'}>
                                    {user.user_type === 'business_merchant' ? (
                                        <>
                                            <Building2 className="w-3 h-3 mr-1" />
                                            Business
                                        </>
                                    ) : (
                                        <>
                                            <UserIcon className="w-3 h-3 mr-1" />
                                            Personal
                                        </>
                                    )}
                                </Badge>
                                <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                                    {user.status}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                <UserIcon className="w-4 h-4" />
                                Full name
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{user.name}</dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email address
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{user.email}</dd>
                        </div>
                        {user.phone && (
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    Phone number
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{String(user.phone)}</dd>
                            </div>
                        )}
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{user.role.name}</dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">User Type</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 capitalize">
                                {user.user_type ? String(user.user_type).replace('_', ' ') : 'Personal'}
                            </dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Member since</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{new Date(user.created_at).toLocaleDateString()}</dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                <UserCheck className="w-4 h-4" />
                                Email Verified
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                {user.email_verified_at ? new Date(user.email_verified_at).toLocaleDateString() : 'Not Verified'}
                            </dd>
                        </div>
                    </dl>

                    {/* Business Information Section */}
                    {user.user_type === 'business_merchant' && (
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                Business Information
                            </h4>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                {user.company_name && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Company Name</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{String(user.company_name)}</dd>
                                    </div>
                                )}
                                {user.manager_name && (
                                    <div className="sm:col-span-1">
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Manager Name</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{String(user.manager_name)}</dd>
                                    </div>
                                )}
                                {user.company_phone && (
                                    <div className="sm:col-span-1">
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            Company Phone
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{String(user.company_phone)}</dd>
                                    </div>
                                )}
                                {user.company_legal_form && (
                                    <div className="sm:col-span-1">
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Legal Form</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{String(user.company_legal_form)}</dd>
                                    </div>
                                )}
                                {user.company_address && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            Company Address
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{String(user.company_address)}</dd>
                                    </div>
                                )}
                                {user.business_description && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Description</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{String(user.business_description)}</dd>
                                    </div>
                                )}
                                {user.legal_form_document && (
                                    <div className="sm:col-span-1">
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            Legal Form Document
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                            <a
                                                href={user.legal_form_document_url || String(user.legal_form_document)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:text-primary/80 underline"
                                            >
                                                View Document
                                            </a>
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Tontine Involvement</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tontines Created ({createdTontines.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {createdTontines.length > 0 ? (
                                <ul className="space-y-4">
                                    {createdTontines.map((tontine) => (
                                        <li key={tontine.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <Link href={route('tontines.show', tontine.id)}>
                                                <div className="flex justify-between items-center">
                                                    <span className="font-semibold">{tontine.name}</span>
                                                    <Badge variant={true ? 'default' : 'secondary'}>custom</Badge>
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {formatCurrency(tontine.contribution_amount)} / {tontine.frequency}
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">This user has not created any tontines.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tontine Memberships ({memberTontines.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {memberTontines.length > 0 ? (
                                <ul className="space-y-4">
                                    {memberTontines.map((tontine) => (
                                        <li key={tontine.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <Link href={route('tontines.show', tontine.id)}>
                                                <div className="flex justify-between items-center">
                                                    <span className="font-semibold">{tontine.id}</span>
                                                    <Badge variant={true ? 'default' : 'secondary'}>Active</Badge>
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {formatCurrency(1200)} / 1
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">This user is not a member of any tontines.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
