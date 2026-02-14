import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar, DollarSign, Filter, Plus, Search, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getTontineContributions
} from "@/api/tontineContributions";

import { getTontines } from "@/api/tontines";

export default function ContributionList() {
  const [contributions, setContributions] = useState({
    data: [],
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  });
  const [tontines, setTontines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tontineFilter, setTontineFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  // Fetch contributions
  const fetchContributions = async (page = 1) => {
    try {
      setLoading(true);

      const params = {
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        tontine_id: tontineFilter !== "all" ? tontineFilter : undefined,
        page,
        limit: 10,
      };

      const res = await getTontineContributions(params);

      // Defensive check
      setContributions({
        data: res?.data || [],
        current_page: res?.current_page || 1,
        last_page: res?.last_page || 1,
        per_page: res?.per_page || 20,
        total: res?.total || (res?.data?.length ?? 0),
      });
    } catch (err) {
      console.error("Error fetching contributions:", err);
      setContributions((prev) => ({ ...prev, data: [] }));
    } finally {
      setLoading(false);
    }
  };

  // Fetch tontines for filter dropdown
  const fetchTontines = async () => {
    try {
        const res = await getTontines();
        // Check if res is an array, or has data array
        if (Array.isArray(res)) {
        setTontines(res);
        } else if (Array.isArray(res?.data)) {
        setTontines(res.data);
        } else if (Array.isArray(res?.data?.data)) {
        setTontines(res.data.data);
        } else {
        setTontines([]);
        }
    } catch (err) {
        console.error("Error fetching tontines:", err);
        setTontines([]);
    }
    };

  useEffect(() => {
    fetchContributions();
    fetchTontines();
  }, []);

  // Re-fetch contributions when filters change
  useEffect(() => {
    fetchContributions(1);
  }, [statusFilter, tontineFilter]);

  const handleSearch = () => fetchContributions(1);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "overdue":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== "number") amount = parseFloat(amount) || 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const paidAmount = (contributions.data || [])
    .filter((c) => c.status === "completed")
    .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

  const pendingAmount = (contributions.data || [])
    .filter((c) => c.status !== "completed")
    .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);


  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Contributions</h1>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search contributions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>

            {/* Status */}
            <Select
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val)}
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

            {/* Tontines */}
            <Select
              value={tontineFilter}
              onValueChange={(val) => setTontineFilter(val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Tontines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tontines</SelectItem>
                {tontines.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleSearch} className="w-full">
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex justify-between">
            <CardTitle>Total Contributions</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contributions.total}</div>
            <p className="text-xs text-muted-foreground">All time contributions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between">
            <CardTitle>Paid Amount</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(paidAmount)}</div>
            <p className="text-xs text-muted-foreground">Total paid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between">
            <CardTitle>Pending Amount</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(pendingAmount)}</div>
            <p className="text-xs text-muted-foreground">Pending & overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Contributions List */}
      <Card>
        <CardHeader>
          <CardTitle>All Contributions</CardTitle>
          <CardDescription>Manage and track all contribution records</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : contributions.data?.length > 0 ? (
            <div className="space-y-4">
              {contributions.data.map((contribution) => (
                <div
                  key={contribution.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {contribution.tontineMember?.user?.fullName || "Unknown User"}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Users className="h-4 w-4" />
                        <span>{contribution.tontineMember?.tontine?.name || "—"}</span>
                        <span>•</span>
                        <Calendar className="h-4 w-4" />
                        <span>
                          {contribution.createdAt
                            ? format(new Date(contribution.createdAt), "MMM dd, yyyy")
                            : "—"}
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
                        {contribution.status
                          ? contribution.status.charAt(0).toUpperCase() + contribution.status.slice(1)
                          : "Unknown"}
                      </Badge>
                    </div>
                    {/* <Button variant="outline" size="sm">
                      View
                    </Button> */}
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
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Contribution
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {contributions.last_page > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing{" "}
            {(contributions.current_page - 1) * contributions.per_page + 1}–
            {Math.min(
              contributions.current_page * contributions.per_page,
              contributions.total
            )}{" "}
            of {contributions.total} results
          </div>
          <div className="flex space-x-2">
            {contributions.current_page > 1 && (
              <Button
                variant="outline"
                onClick={() => fetchContributions(contributions.current_page - 1)}
              >
                Previous
              </Button>
            )}
            {contributions.current_page < contributions.last_page && (
              <Button
                variant="outline"
                onClick={() => fetchContributions(contributions.current_page + 1)}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
