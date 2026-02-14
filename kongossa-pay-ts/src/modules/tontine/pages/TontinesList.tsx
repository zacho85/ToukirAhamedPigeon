import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getTontines, deleteTontine } from "@/modules/tontine/api";
import { createStripeCheckoutSession } from "@/modules/tontine/api/stripe"; // new API function

import Breadcrumb from '@/components/module/admin/layout/Breadcrumb'
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  Users,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { showToast } from "@/redux/slices/toastSlice";
import PageTransition from '@/components/module/admin/layout/PageTransition';
import { Can } from "@/components/custom/Can";
// ------------------------------
// Type Definitions
// ------------------------------
interface Tontine {
  id: number;
  name: string;
  type: string;
  status: string;
  contributionAmount: number;
  contributionFrequency: string;
  members?: any[];
  totalContributed?: number;
  totalCollected?: number;
  next_payout_date?: string;
  durationMonths?: number;
  creator: { role: string };
  isAdmin?: boolean;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface Filters {
  search: string;
  type: string;
  status: string;
}

// ------------------------------
// Component
// ------------------------------
export default function TontinesList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tontines, setTontines] = useState<Tontine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [paymentLoadingId, setPaymentLoadingId] = useState<number | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  });
  const [filters, setFilters] = useState<Filters>({
    search: searchParams.get("search") || "",
    type: searchParams.get("type") || "",
    status: searchParams.get("status") || "",
  });

  // --------------------------
  // Fetch Tontines
  // --------------------------
  useEffect(() => {
    document.title = "My Tontines";
  }, []);

  const fetchTontines = async () => {
    setLoading(true);
    try {
      const params = {
        search: filters.search,
        type: filters.type,
        status: filters.status,
        page: searchParams.get("page") || 1,
      };
      const res = await getTontines(params);
      const data = res.data;

      setTontines(data.data || []);
      setPagination({
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        per_page: data.per_page || 10,
        total: data.total || data.data?.length || 0,
      });
    } catch (err) {
      console.error("Failed to load tontines", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTontines();
  }, [searchParams]);

  // --------------------------
  // Handlers
  // --------------------------
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (filters.search) newParams.set("search", filters.search);
    else newParams.delete("search");
    setSearchParams(newParams);
  };

  const handleFilter = (key: keyof Filters, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== "all") newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this tontine?")) return;
    try {
      await deleteTontine(id);
      fetchTontines();
      dispatch(
        showToast({
          type: "success",
          message: "Tontine deleted successfully",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } catch (err) {
      console.error("Failed to delete tontine", err);
      dispatch(
        showToast({
          type: "danger",
          message: "Failed to delete tontine",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    }
  };

  const handleStripeCheckout = async (tontine: Tontine) => {
    try {
      setPaymentLoadingId(tontine.id);
      const session = await createStripeCheckoutSession({
        amount: tontine.contributionAmount,
        currency: "usd",
        description: `Contribution to ${tontine.name}`,
        metadata: {
          tontine_id: tontine.id,
          user_id: 1, // Replace with authenticated user ID
        },
      });
      console.log(session);
      if (session.url) {
        window.location.href = session.url; // redirect to Stripe checkout
        dispatch(
          showToast({
            type: "success",
            message: "Redirecting to payment page",
            position: "top-right",
            animation: "slide-right-in",
            duration: 4000,
          })
        );
      } else {
        dispatch(
          showToast({
            type: "danger",
            message: "Failed to start payment. Please try again.",
            position: "top-right",
            animation: "slide-right-in",
            duration: 4000,
          })
        );
      }
    } catch (err) {
      console.error("Stripe checkout error", err);
      dispatch(
        showToast({
          type: "danger",
          message: "Failed to start payment. Please try again.",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } finally {
      setPaymentLoadingId(null);
    }
  };

  // --------------------------
  // Badge Color Utilities
  // --------------------------
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // --------------------------
  // Breadcrumbs
  // --------------------------
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Tontine System" },
    { label: "My Tontines" },
  ];

  // --------------------------
  // Render
  // --------------------------
  if (loading)
    return (
      <PageTransition>
        <div className="flex justify-center items-center h-64 text-muted-foreground">
          Loading tontines...
        </div>
      </PageTransition>
    );

  return (
    <PageTransition>
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbs} title="My Tontines" />

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tontines</h1>
          <p className="text-muted-foreground">
            Manage your collaborative savings groups and track contributions.
          </p>
        </div>
        <Button onClick={() => navigate("/tontines/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Tontine
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
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </form>

            <div className="flex gap-2">
              <Select
                value={filters.type}
                onValueChange={(v) => {
                  setFilters({ ...filters, type: v });
                  handleFilter("type", v);
                }}
              >
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

              <Select
                value={filters.status}
                onValueChange={(v) => {
                  setFilters({ ...filters, status: v });
                  handleFilter("status", v);
                }}
              >
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
      {tontines.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tontines found</h3>
            <p className="text-muted-foreground text-center mb-6">
              {filters.search || filters.type || filters.status
                ? "Try adjusting your search criteria or filters."
                : "Start building wealth together by creating your first tontine."}
            </p>
            <Button onClick={() => navigate("/tontines/create")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Tontine
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tontines.map((tontine) => (
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
                      {tontine.creator.role === "admin" && (
                        <Badge
                          variant="outline"
                          className="bg-yellow-50 text-yellow-800"
                        >
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
                      <DropdownMenuItem onClick={() => navigate(`/tontines/${tontine.id}`)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      {tontine.isAdmin && (
                        <>
                          <Can anyOf={["update:tontine"]}>
                            <DropdownMenuItem onClick={() => navigate(`/tontines/${tontine.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit Tontine
                            </DropdownMenuItem>
                          </Can>
                          <Can anyOf={["delete:tontine"]}>
                            <DropdownMenuItem
                              className="text-red-600 cursor-pointer"
                              onClick={() => handleDelete(tontine.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Tontine
                          </DropdownMenuItem>
                          </Can>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Contribution</p>
                      <p className="text-lg font-bold">
                        ${Number(tontine.contributionAmount || 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">{tontine.contributionFrequency}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Members</p>
                      <p className="text-lg font-bold">{tontine.members?.length ?? 0}</p>
                      <p className="text-xs text-muted-foreground">participants</p>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Contributed:</span>
                    <span className="font-medium text-blue-600">
                      ${tontine.totalContributed ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Collected:</span>
                    <span className="font-medium text-green-600">${tontine.totalCollected ?? 0}</span>
                  </div>

                  {tontine.next_payout_date && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Next Payout:</span>
                      </div>
                      <p className="font-medium">{new Date(tontine.next_payout_date).toLocaleDateString()}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{tontine.durationMonths ?? 0} months duration</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" onClick={() => navigate(`/tontines/${tontine.id}`)} className="flex-1">
                      <Eye className="mr-2 h-3 w-3" /> View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStripeCheckout(tontine)}
                      disabled={paymentLoadingId === tontine.id}
                      className="flex-1"
                    >
                      {paymentLoadingId === tontine.id ? "Processing..." : <><DollarSign className="mr-2 h-3 w-3" /> Contribute</>}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
      </PageTransition>
  );
}
