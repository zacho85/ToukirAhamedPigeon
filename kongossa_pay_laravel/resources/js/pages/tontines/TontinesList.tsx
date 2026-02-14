import { Breadcrumbs } from '@/components';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Head, Link } from '@inertiajs/react';
import {
  Calendar,
  Clock,
  DollarSign,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Users
} from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Tontine {
  id: number;
  name: string;
  type: 'friends' | 'family' | 'savings' | 'investment';
  contribution_amount: number;
  frequency: 'weekly' | 'monthly';
  duration_months: number;
  members_count: number;
  total_contributed: number;
  total_collected: number;
  next_payout_date: string | null;
  created_at: string;
  is_admin: boolean;
  status: 'active' | 'completed' | 'pending';
}

interface TontinesListProps {
  tontines: {
    data: Tontine[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: {
    search?: string;
    type?: string;
    status?: string;
    sort_by?: string;
    sort_direction?: string;
  };
}

export default function TontinesList({ tontines, filters }: TontinesListProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedType, setSelectedType] = useState(filters.type || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const url = new URL(window.location.href);
    if (searchTerm) {
      url.searchParams.set('search', searchTerm);
    } else {
      url.searchParams.delete('search');
    }
    window.location.href = url.toString();
  };

  const handleFilter = (key: string, value: string) => {
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
    window.location.href = url.toString();
  };

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
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Tontine System' },
    { label: 'My Tontines' },
  ];

  return (
    <>
      <Head title="My Tontines" />
      {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}
      <div className="space-y-6 mt-10">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Tontines</h1>
            <p className="text-muted-foreground">
              Manage your collaborative savings groups and track contributions.
            </p>
          </div>
          <Button asChild>
            <Link href="/tontines/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Tontine
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search tontines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </form>

              <div className="flex gap-2">
                <Select value={selectedType} onValueChange={(value) => {
                  setSelectedType(value);
                  handleFilter('type', value);
                }}>
                  <SelectTrigger className="w-32">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="friends">Friends</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={(value) => {
                  setSelectedStatus(value);
                  handleFilter('status', value);
                }}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Button type="submit" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tontines Grid */}
        {tontines.data.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tontines found</h3>
              <p className="text-muted-foreground text-center mb-6">
                {filters.search || filters.type || filters.status
                  ? "Try adjusting your search criteria or filters."
                  : "Start building wealth together by creating your first tontine."
                }
              </p>
              <Button asChild>
                <Link href="/tontines/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Tontine
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tontines.data.map((tontine) => (
              <Card key={tontine.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{tontine.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className={getTypeBadgeColor(tontine.type)}
                        >
                          {tontine.type}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={getStatusBadgeColor(tontine.status)}
                        >
                          {tontine.status}
                        </Badge>
                        {tontine.is_admin && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                            Admin
                          </Badge>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/tontines/${tontine.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        {tontine.is_admin && (
                          <>
                            {/* <DropdownMenuItem asChild>
                              <Link href={`/tontines/${tontine.id}/invite`}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Invite Members
                              </Link>
                            </DropdownMenuItem> */}
                            <DropdownMenuItem asChild>
                              <Link href={`/tontines/${tontine.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Tontine
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Link href={`/tontines/${tontine.id}`} method="delete" className="flex">
                                <Trash2 className="mr-4 h-4 w-4" />
                                Delete Tontine
                              </Link>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Contribution Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Contribution</p>
                        <p className="text-lg font-bold">
                          ${tontine.contribution_amount}
                        </p>
                        <p className="text-xs text-muted-foreground">{tontine.frequency}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Members</p>
                        <p className="text-lg font-bold">{tontine.members_count}</p>
                        <p className="text-xs text-muted-foreground">participants</p>
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Contributed:</span>
                        <span className="font-medium text-blue-600">
                          ${tontine.total_contributed}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Collected:</span>
                        <span className="font-medium text-green-600">
                          ${tontine.total_collected}
                        </span>
                      </div>
                    </div>

                    {/* Next Payout */}
                    {tontine.next_payout_date && (
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Next Payout:</span>
                        </div>
                        <p className="font-medium">
                          {new Date(tontine.next_payout_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {/* Duration Info */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{tontine.duration_months} months duration</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" asChild className="flex-1">
                        <Link href={`/tontines/${tontine.id}`}>
                          <Eye className="mr-2 h-3 w-3" />
                          View
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/tontines/${tontine.id}/contribute`}>
                          <DollarSign className="mr-2 h-3 w-3" />
                          Contribute
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {tontines.last_page > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {((tontines.current_page - 1) * tontines.per_page) + 1} to {
                Math.min(tontines.current_page * tontines.per_page, tontines.total)
              } of {tontines.total} tontines
            </p>
            <div className="flex gap-2">
              {tontines.current_page > 1 && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`?page=${tontines.current_page - 1}`}>
                    Previous
                  </Link>
                </Button>
              )}
              {tontines.current_page < tontines.last_page && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`?page=${tontines.current_page + 1}`}>
                    Next
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
