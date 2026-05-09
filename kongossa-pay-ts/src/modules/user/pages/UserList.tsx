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

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Breadcrumb from "@/components/module/admin/layout/Breadcrumb";
import { ConfirmationDialog } from "@/components/custom/ConfirmationDialog";

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
import { getUsers, updateUser, deleteUser } from "../api";
import { assignRoleToUser, removeRoleFromUser } from "../api/roles";

import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showToast } from "@/redux/slices/toastSlice";
import PageTransition from '@/components/module/admin/layout/PageTransition';
import { Can } from "@/components/custom/Can";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  user_type: string;
  company_name?: string;
  status: string;
  role?: string;
  avatar?: string;
  created_at: string;
}

interface Role {
  id: number;
  name: string;
}

interface Stats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  total_roles: number;
}

interface PaginationData {
  page: number;
  perPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function UserList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_users: 0,
    active_users: 0,
    inactive_users: 0,
    total_roles: 0,
  });
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    perPage: 10,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

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
        setStats(res.stats || stats);
        setPagination(res.pagination || pagination);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useDebounce(
    searchTerm,
    () => {
      fetchUsers(searchTerm, 1);
    },
    500
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    return format(date, "PPP");
  };

  const handleStatus = async (user: User) => {
    try {
      const newStatus = user.status === "Active" ? "inactive" : "active";
      await updateUser(String(user.id), { status: newStatus });
      fetchUsers(searchTerm, pagination.page);
      dispatch(showToast({ type: "success", message: `User status updated to ${newStatus}` }));
    } catch (err) {
      console.error("Failed to update status:", err);
      dispatch(showToast({ type: "danger", message: "Failed to update user status." }));
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const user = users.find((u) => u.id === userId);
      if (!user) return;

      const currentRoleId = roles.find(
        (r) => r.name.toLowerCase() === (user.role ?? "").toLowerCase()
      )?.id;

      const newRoleId = roles.find(
        (r) => r.name.toLowerCase() === newRole.toLowerCase()
      )?.id;

      if (currentRoleId) await removeRoleFromUser(String(userId), String(currentRoleId));
      if (newRoleId) await assignRoleToUser(String(userId), String(newRoleId));
      
      fetchUsers(searchTerm, pagination.page);
      dispatch(showToast({ type: "success", message: `User role updated to ${newRole}` }));
    } catch (err) {
      console.error("Failed to update role:", err);
      dispatch(showToast({ type: "danger", message: "Failed to update role." }));
    }
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await deleteUser(String(userToDelete.id));
      fetchUsers(searchTerm, pagination.page);
      dispatch(showToast({ type: "success", message: "User deleted successfully" }));
    } catch (err) {
      dispatch(showToast({ type: "danger", message: "Failed to delete user." }));
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
      setIsConfirmOpen(false);
    }
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Users" },
  ];

  return (
    <PageTransition>
      <div className="py-4 sm:py-6 px-3 sm:px-6 lg:px-8">
        <div className="max-w-full mx-auto">
          <Breadcrumb items={breadcrumbs} title="Users" />

          {/* Stats Cards - Responsive Grid */}
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-4 sm:mb-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm text-muted-foreground">Total Users</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.total_users}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm text-muted-foreground">Active Users</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.active_users}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm text-muted-foreground">Inactive Users</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.inactive_users}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm text-muted-foreground">Total Roles</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.total_roles}</div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Create - Responsive */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">All Users</h2>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  ref={inputRef}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Can anyOf={["create:user"]}>
                <Button asChild className="w-full sm:w-auto">
                  <Link to="/admin/users/create">
                    <Plus className="w-4 h-4 mr-2" /> Create User
                  </Link>
                </Button>
              </Can>
            </div>
          </div>

          {/* Desktop Table View - hidden on mobile */}
          <div className="hidden md:block">
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <div className="min-w-[800px] lg:min-w-full">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="text-muted-foreground">User</TableHead>
                        <TableHead className="text-muted-foreground">Contact</TableHead>
                        <TableHead className="text-muted-foreground">Type</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                        <TableHead className="text-muted-foreground">Role</TableHead>
                        <TableHead className="text-muted-foreground">Joined</TableHead>
                        <TableHead className="text-muted-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length > 0 ? (
                        users.map((user) => (
                          <TableRow key={user.id} className="hover:bg-muted/30">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                                  <AvatarImage src={user.avatar} />
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {user.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-sm sm:text-base text-foreground">{user.name}</div>
                                  {user.company_name && (
                                    <div className="text-xs text-muted-foreground">{user.company_name}</div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm break-all sm:break-normal text-foreground">{user.email}</div>
                                {user.phone && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Phone className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{user.phone}</span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.user_type === "business_merchant" ? "default" : "secondary"} className="whitespace-nowrap">
                                {user.user_type === "business_merchant" ? "Business" : "Personal"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.status === "Active" ? "default" : user.status === "suspended" ? "destructive" : "secondary"} className="cursor-pointer">
                                <button onClick={() => handleStatus(user)} className="text-xs sm:text-sm">{user.status}</button>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Select
                                disabled={user.id === 1}
                                value={user.role?.toLowerCase() ?? ""}
                                onValueChange={(val) => handleRoleChange(user.id, val)}
                              >
                                <SelectTrigger className="w-[110px] sm:w-[130px]">
                                  <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent>
                                  {roles.map((role) => (
                                    <SelectItem key={role.id} value={role.name.toLowerCase()}>
                                      {role.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              {formatDate(user.created_at)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <TooltipProvider delayDuration={300}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/users/${user.id}`)}>
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>View</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <Can anyOf={["update:user"]}>
                                  <TooltipProvider delayDuration={300}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/users/${user.id}/edit`)}>
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Edit</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </Can>
                                {user.id !== 1 && (
                                  <Can anyOf={["delete:user"]}>
                                    <TooltipProvider delayDuration={300}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => handleDelete(user)}>
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Delete</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </Can>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                            No users found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Card View - visible only on mobile */}
          <div className="md:hidden space-y-4">
            {users.length > 0 ? (
              users.map((user) => (
                <Card key={user.id} className="overflow-hidden">
                  <CardContent className="p-4 space-y-3">
                    {/* Header with Avatar and Name */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-foreground">{user.name}</div>
                          {user.company_name && (
                            <div className="text-xs text-muted-foreground">{user.company_name}</div>
                          )}
                        </div>
                      </div>
                      <Badge variant={user.user_type === "business_merchant" ? "default" : "secondary"}>
                        {user.user_type === "business_merchant" ? "Business" : "Personal"}
                      </Badge>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1 pt-2 border-t border-border">
                      <div className="text-sm text-foreground break-all">{user.email}</div>
                      {user.phone && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Status and Role Row */}
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={user.status === "Active" ? "default" : user.status === "suspended" ? "destructive" : "secondary"}
                        className="cursor-pointer"
                      >
                        <button onClick={() => handleStatus(user)}>{user.status}</button>
                      </Badge>
                      <Select
                        disabled={user.id === 1}
                        value={user.role?.toLowerCase() ?? ""}
                        onValueChange={(val) => handleRoleChange(user.id, val)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.name.toLowerCase()}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Joined Date and Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="text-xs text-muted-foreground">
                        Joined {formatDate(user.created_at)}
                      </div>
                      <div className="flex gap-1">
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/users/${user.id}`)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Can anyOf={["update:user"]}>
                          <TooltipProvider delayDuration={300}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/users/${user.id}/edit`)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Can>
                        {user.id !== 1 && (
                          <Can anyOf={["delete:user"]}>
                            <TooltipProvider delayDuration={300}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => handleDelete(user)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Can>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No users found.
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pagination - Responsive */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-6">
            <Button 
              variant="outline"
              disabled={!pagination.hasPrev} 
              onClick={() => fetchUsers(searchTerm, pagination.page - 1)}
              className="w-full sm:w-auto"
            >
              Previous
            </Button>
            <span className="text-sm text-foreground px-4">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button 
              variant="outline"
              disabled={!pagination.hasNext} 
              onClick={() => fetchUsers(searchTerm, pagination.page + 1)}
              className="w-full sm:w-auto"
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
            description={`Delete "${userToDelete.name}"? This action cannot be undone.`}
            onConfirm={confirmDelete}
            confirmText={isDeleting ? "Deleting..." : "Yes, Delete"}
            loading={isDeleting}
            variant="destructive"
          />
        )}
      </div>
    </PageTransition>
  );
}