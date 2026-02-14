import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  DollarSign,
  Filter,
  Plus,
  Search,
  Users,
} from "lucide-react";

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

import { getTontineContributions } from "@/modules/tontine-contribution/api";
import { getTontines } from "@/modules/tontine/api";

/* =========================
   TYPES
========================= */
interface User {
  fullName?: string;
}

interface Tontine {
  id: number;
  name: string;
}

interface TontineMember {
  user?: User;
  tontine?: Tontine;
}

interface Contribution {
  id: number;
  amount: number | string;
  status: string;
  createdAt?: string;
  tontineMember?: TontineMember;
}

interface PaginatedContributions {
  data: Contribution[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/* =========================
   COMPONENT
========================= */
const ContributionList: React.FC = () => {
  const [contributions, setContributions] =
    useState<PaginatedContributions>({
      data: [],
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 0,
    });

  const [tontines, setTontines] = useState<Tontine[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tontineFilter, setTontineFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(false);

  /* =========================
     FETCH CONTRIBUTIONS
  ========================= */
  const fetchContributions = async (page: number = 1): Promise<void> => {
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

      setContributions({
        data: res?.data ?? [],
        current_page: res?.current_page ?? 1,
        last_page: res?.last_page ?? 1,
        per_page: res?.per_page ?? 20,
        total: res?.total ?? res?.data?.length ?? 0,
      });
    } catch (error) {
      console.error("Error fetching contributions:", error);
      setContributions((prev) => ({ ...prev, data: [] }));
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FETCH TONTINES
  ========================= */
  const fetchTontines = async (): Promise<void> => {
    try {
      const res = await getTontines();

      if (Array.isArray(res)) setTontines(res);
      else if (Array.isArray(res?.data)) setTontines(res.data);
      else if (Array.isArray(res?.data?.data)) setTontines(res.data.data);
      else setTontines([]);
    } catch (error) {
      console.error("Error fetching tontines:", error);
      setTontines([]);
    }
  };

  useEffect(() => {
    fetchContributions();
    fetchTontines();
  }, []);

  useEffect(() => {
    fetchContributions(1);
  }, [statusFilter, tontineFilter]);

  const handleSearch = (): void => {
    fetchContributions(1);
  };

  /* =========================
     HELPERS
  ========================= */
  const getStatusBadgeVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
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

  const formatCurrency = (amount?: number | string): string => {
    const value =
      typeof amount === "number"
        ? amount
        : parseFloat(amount || "0") || 0;

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const paidAmount = contributions.data
    .filter((c) => c.status === "completed")
    .reduce((sum, c) => sum + (parseFloat(String(c.amount)) || 0), 0);

  const pendingAmount = contributions.data
    .filter((c) => c.status !== "completed")
    .reduce((sum, c) => sum + (parseFloat(String(c.amount)) || 0), 0);

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Contributions</h1>

      {/* FILTERS */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" /> Filters
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
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
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

            <Select value={tontineFilter} onValueChange={setTontineFilter}>
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

            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Contributions</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {contributions.total}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paid Amount</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {formatCurrency(paidAmount)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Amount</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {formatCurrency(pendingAmount)}
          </CardContent>
        </Card>
      </div>

      {/* LIST */}
      <Card>
        <CardHeader>
          <CardTitle>All Contributions</CardTitle>
          <CardDescription>
            Manage and track all contribution records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : contributions.data.length ? (
            <div className="space-y-4">
              {contributions.data.map((contribution) => (
                <div
                  key={contribution.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <h3 className="font-medium">
                      {contribution.tontineMember?.user?.fullName ??
                        "Unknown User"}
                    </h3>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {contribution.tontineMember?.tontine?.name || "—"}
                      <Calendar className="h-4 w-4 ml-2" />
                      {contribution.createdAt
                        ? format(
                            new Date(contribution.createdAt),
                            "MMM dd, yyyy"
                          )
                        : "—"}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(contribution.amount)}
                    </p>
                    <Badge
                      variant={getStatusBadgeVariant(contribution.status)}
                    >
                      {contribution.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <p>No contributions found</p>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> New Contribution
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContributionList;
