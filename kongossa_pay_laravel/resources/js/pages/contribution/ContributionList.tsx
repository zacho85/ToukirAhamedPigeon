import { Breadcrumbs } from '@/components';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Calendar, DollarSign, Filter, Plus, Search, Users } from 'lucide-react';
import { useState } from 'react';

interface Contribution {
    id: number;
    tontine_id: number;
    user_id: number;
    amount: number;
    contribution_date: string;
    status: 'paid' | 'pending' | 'overdue';
    tontine: {
        id: number;
        name: string;
        type: string;
    };
    tontine_member: {
        id: number;
        tontine: {
            id: number;
            name: string;
        };
        user: {
            id: number;
            name: string;
        };
    };
    created_at: string;
    updated_at: string;
}

interface ContributionListProps {
    contributions: {
        data: Contribution[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        tontine_id?: string;
    };
    tontines: Array<{
        id: number;
        name: string;
    }>;
}

export default function ContributionList({
    contributions,
    filters = {},
    tontines = []
}: ContributionListProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [tontineFilter, setTontineFilter] = useState(filters.tontine_id || '');

    const handleSearch = () => {
        router.get(route('contributions.index'), {
            search: searchTerm,
            status: statusFilter,
            tontine_id: tontineFilter,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = {
            search: searchTerm,
            status: statusFilter,
            tontine_id: tontineFilter,
            [key]: value,
        };

        if (key === 'status') setStatusFilter(value);
        if (key === 'tontine_id') setTontineFilter(value);

        router.get(route('contributions.index'), newFilters, {
            preserveState: true,
            replace: true,
        });
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'paid':
                return 'default';
            case 'pending':
                return 'secondary';
            case 'overdue':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const breadcrumbs = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Tontine System' },
        { label: 'My Tontines', href: '/tontines' },
    ];

    return (
        <>
            <Head title="Contributions" />
            {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}
            <div className="py-12">
                <div className="max-w-full mx-auto">
                    {/* Filters */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Filter className="mr-2 h-5 w-5" />
                                Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search contributions..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pl-10"
                                    />
                                </div>

                                <Select
                                    value={statusFilter}
                                    onValueChange={(value) => handleFilterChange('status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="overdue">Overdue</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={tontineFilter}
                                    onValueChange={(value) => handleFilterChange('tontine_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Tontines" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Tontines</SelectItem>
                                        {tontines.map((tontine) => (
                                            <SelectItem key={tontine.id} value={tontine.id.toString()}>
                                                {tontine.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button onClick={handleSearch} className="w-full">
                                    <Search className="mr-2 h-4 w-4" />
                                    Search
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Contributions
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {contributions?.total || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    All time contributions
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Paid Amount
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(
                                        contributions.data
                                            .filter(c => c.status === 'paid')
                                            .reduce((sum, c) => sum + c.amount, 0)
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Total paid contributions
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Pending Amount
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(0.00)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Pending & overdue contributions
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contributions List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>All Contributions</CardTitle>
                            <CardDescription>
                                Manage and track all contribution records
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {contributions.data.length > 0 ? (
                                <div className="space-y-4">
                                    {contributions.data.map((contribution) => (
                                        <div
                                            key={contribution.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <DollarSign className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        {contribution.tontine_member.user.name}
                                                    </h3>
                                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                        <Users className="h-4 w-4" />
                                                        <span>{contribution.tontine_member.tontine.name}</span>
                                                        <span>•</span>
                                                        <Calendar className="h-4 w-4" />
                                                        <span>
                                                            {format(new Date(contribution.contribution_date), 'MMM dd, yyyy')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <p className="text-lg font-semibold text-gray-900">
                                                        {formatCurrency(contribution.amount)}
                                                    </p>
                                                    <Badge variant={getStatusBadgeVariant(contribution.status)}>
                                                        {contribution.status.charAt(0).toUpperCase() + contribution.status.slice(1)}
                                                    </Badge>
                                                </div>

                                                <Link href={route('tontine-contributions.show', contribution.id)}>
                                                    <Button variant="outline" size="sm">
                                                        View
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                        No contributions found
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Get started by creating a new contribution.
                                    </p>
                                    <div className="mt-6">
                                        <Link href="#">
                                            <Button>
                                                <Plus className="mr-2 h-4 w-4" />
                                                New Contribution
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pagination */}
                    {contributions.last_page > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {(contributions.current_page - 1) * contributions.per_page + 1} to{' '}
                                {Math.min(contributions.current_page * contributions.per_page, contributions.total)} of{' '}
                                {contributions.total} results
                            </div>
                            <div className="flex space-x-2">
                                {contributions.current_page > 1 && (
                                    <Link
                                        href={route('contributions.index', {
                                            ...filters,
                                            page: contributions.current_page - 1,
                                        })}
                                    >
                                        <Button variant="outline">Previous</Button>
                                    </Link>
                                )}
                                {contributions.current_page < contributions.last_page && (
                                    <Link
                                        href={route('contributions.index', {
                                            ...filters,
                                            page: contributions.current_page + 1,
                                        })}
                                    >
                                        <Button variant="outline">Next</Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
