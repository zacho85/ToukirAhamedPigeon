import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmationDialog } from "@/components/dashboard/ConfirmationDialog";
import Breadcrumbs from "@/components/dashboard/Breadcumbs";
// import { useToast } from "@/components";
import { useDebounce } from "@/lib/utils";
import {
  Building2,
  Edit,
  Eye,
  Phone,
  Plus,
  Search,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { getUsers, updateUser, deleteUser } from "@/api/users";
import { assignRoleToUser, removeRoleFromUser } from "@/api/roles";
import { Link, useNavigate } from "react-router-dom";
import { showToast } from "@/store/toastSlice";
import { useDispatch } from "react-redux";

export default function UserList() {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    inactive_users: 0,
    total_roles: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 10,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // const { toast } = useToast();
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // 🔹 Fetch Users
  const fetchUsers = async (query = "", page = 1) => {
    try {
      const res = await getUsers({
        page,
        per_page: pagination.perPage,
        search: query,
      });
      if (res) {
        setUsers(res.users || []);
        setRoles(res.roles || []);
        setStats(res.stats || {});
        setPagination(res.pagination || {});
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Debounce Search
  useDebounce(searchTerm, () => {
    fetchUsers(searchTerm, 1);
  }, 500);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    return format(date, "PPP");
  };

  const handleStatus = async (user) => {
    try {
      const newStatus = user.status === "Active" ? "inactive" : "active";
      await updateUser(user.id, { status: newStatus });
      fetchUsers(searchTerm, pagination.page);
      dispatch(
        showToast({
          type: "success",
          message: `User status updated to ${newStatus}`,
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      dispatch(
        showToast({
          type: "error",
          message: "Failed to update user status. Please try again.",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    }
  };

  const handleRoleChange = async (userId, newRoleName) => {
    try {
      // Get current roles of the user
      const userRole = users.find(u => u.id === userId)?.role || 'user';
      const currentRoleId = roles.find(r => r.name.toLowerCase() === userRole.toLowerCase())?.id;
      const newRoleId = roles.find(r => r.name.toLowerCase() === newRoleName.toLowerCase())?.id;

      // Remove old role if exists
      if (currentRoleId) {
        await removeRoleFromUser(userId, currentRoleId);
      }

      // Assign new role
      if (newRoleId) {
        await assignRoleToUser(userId, newRoleId);
      }

      // Refetch users or update state locally
      fetchUsers(searchTerm, pagination.page);
      dispatch(
        showToast({
          type: "success",
          message: `User role updated to ${newRoleName}`,
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } catch (err) {
      console.error("Failed to update role:", err);
      dispatch(
        showToast({
          type: "error",
          message: "Failed to update user role. Please try again.",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    }
  };


  const handleDelete = (user) => {
    setUserToDelete(user);
    setIsConfirmOpen(true);
    
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await deleteUser(userToDelete.id);
      // toast({
      //   title: "User Deleted",
      //   description: "User removed successfully.",
      // });
      fetchUsers(searchTerm, pagination.page);
      dispatch(
        showToast({
          type: "success",
          message: "User deleted successfully!",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } catch (err) {
      console.error("Delete failed:", err);
      dispatch(
        showToast({
          type: "error",
          message: "Failed to delete user. Please try again.",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Users" },
  ];

  return (
    <div className="py-6">
      <div className="max-w-full mx-auto">
        {/* 🔹 Breadcrumbs */}
        <Breadcrumbs breadcrumbs={breadcrumbs} />
        {/* 🔹 Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
              <p className="text-xs text-muted-foreground">Full System</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_users}</div>
              <p className="text-xs text-muted-foreground">Active Accounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Inactive Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inactive_users}</div>
              <p className="text-xs text-muted-foreground">Inactive Accounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_roles}</div>
              <p className="text-xs text-muted-foreground">System Roles</p>
            </CardContent>
          </Card>
        </div>

        {/* 🔹 Search + Add */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">All Users</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, email, phone, role..."
                className="pl-8 w-full"
                value={searchTerm}
                ref={inputRef}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button asChild>
              <Link to="/admin/users/create">
                <Plus className="w-4 h-4 mr-2" /> Create User
              </Link>
            </Button>
          </div>
        </div>

        {/* 🔹 Users Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>
                              {user.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            {user.company_name && (
                              <div className="text-xs text-muted-foreground">
                                {user.company_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{user.email}</div>
                          {user.phone && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" /> {user.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            user.user_type === "business_merchant"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {user.user_type === "business_merchant" ? (
                            <>
                              <Building2 className="w-3 h-3 mr-1" /> Business
                            </>
                          ) : (
                            <>
                              <UserIcon className="w-3 h-3 mr-1" /> Personal
                            </>
                          )}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            user.status === "Active"
                              ? "default"
                              : user.status === "suspended"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          <button onClick={() => handleStatus(user)}>
                            {user.status}
                          </button>
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Select
                          disabled={user.id === 1}
                          value={user.role?.toLowerCase() ?? ""} // controlled value
                          onValueChange={(value) => handleRoleChange(user.id, value)}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => {
                              // make sure the value is also lowercased to match `value`
                              const roleValue = role.name?.toLowerCase() ?? "";
                              return (
                                <SelectItem key={role.id} value={roleValue}>
                                  {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell>{formatDate(user.created_at)}</TableCell>

                      <TableCell>
                        <div className="flex space-x-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => navigate(`/admin/users/${user.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View Details</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit User</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {user.id !== 1 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(user)}
                                    className="hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete User</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 🔹 Pagination */}
        <div className="flex justify-center mt-6 space-x-2">
          <Button
            disabled={!pagination.hasPrev}
            onClick={() => fetchUsers(searchTerm, pagination.page - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            disabled={!pagination.hasNext}
            onClick={() => fetchUsers(searchTerm, pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {userToDelete && (
        <ConfirmationDialog
          open={isConfirmOpen}
          onOpenChange={setIsConfirmOpen}
          title="Are you sure?"
          description={`You are about to delete "${userToDelete.name}". This action cannot be undone.`}
          onConfirm={confirmDelete}
          variant="destructive"
          confirmText={isDeleting ? "Deleting..." : "Yes, delete"}
          loading={isDeleting}
        />
      )}
    </div>
  );
}
