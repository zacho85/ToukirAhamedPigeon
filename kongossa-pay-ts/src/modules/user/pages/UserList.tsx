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
/* -----------------------------------------
   📌 Types
-------------------------------------------- */

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

  /* -----------------------------------------
     🔹 Fetch Users
  -------------------------------------------- */

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

  /* -----------------------------------------
     🔹 Debounced Search
  -------------------------------------------- */

  useDebounce(
    searchTerm,
    () => {
      fetchUsers(searchTerm, 1);
    },
    500
  );

  /* -----------------------------------------
     🔹 Format Date
  -------------------------------------------- */

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    return format(date, "PPP");
  };

  /* -----------------------------------------
     🔹 Update Status
  -------------------------------------------- */

  const handleStatus = async (user: User) => {
    try {
      const newStatus = user.status === "Active" ? "inactive" : "active";
      await updateUser(String(user.id), { status: newStatus });

      fetchUsers(searchTerm, pagination.page);

      dispatch(
        showToast({
          type: "success",
          message: `User status updated to ${newStatus}`,
          position: "top-right",
        })
      );
    } catch (err) {
      console.error("Failed to update status:", err);

      dispatch(
        showToast({
          type: "danger",
          message: "Failed to update user status.",
          position: "top-right",
        })
      );
    }
  };

  /* -----------------------------------------
     🔹 Change Role
  -------------------------------------------- */

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

      dispatch(
        showToast({
          type: "success",
          message: `User role updated to ${newRole}`,
          position: "top-right",
        })
      );
    } catch (err) {
      console.error("Failed to update role:", err);

      dispatch(
        showToast({
          type: "danger",
          message: "Failed to update role.",
          position: "top-right",
        })
      );
    }
  };

  /* -----------------------------------------
     🔹 Delete User
  -------------------------------------------- */

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

      dispatch(
        showToast({
          type: "success",
          message: "User deleted successfully",
          position: "top-right",
        })
      );
    } catch (err) {
      dispatch(
        showToast({
          type: "danger",
          message: "Failed to delete user.",
          position: "top-right",
        })
      );
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
      setIsConfirmOpen(false);
    }
  };

  /* -----------------------------------------
     🔹 Breadcrumbs
  -------------------------------------------- */

  const breadcrumbs = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Users" },
  ];

  /* -----------------------------------------
     🔹 JSX
  -------------------------------------------- */

  return (
        <PageTransition>
      <div className="py-6">
        <div className="max-w-full mx-auto">

          <Breadcrumb items={breadcrumbs} title="Users" />

          {/* ---- Stats ---- */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_users}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active_users}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inactive Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inactive_users}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Roles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_roles}</div>
              </CardContent>
            </Card>
          </div>

          {/* ---- Search + Create ---- */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">All Users</h2>

            <div className="flex items-center gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-8"
                  value={searchTerm}
                  ref={inputRef}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Can anyOf={["create:user"]}>
                <Button asChild>
                  <Link to="/admin/users/create">
                    <Plus className="w-4 h-4 mr-2" /> Create User
                  </Link>
                </Button>
              </Can>
            </div>
          </div>

          {/* ---- Users Table ---- */}
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
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        {/* Avatar + Name */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>
                                {user.name
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("")}
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

                        {/* Contact */}
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

                        {/* Type */}
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

                        {/* Status */}
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

                        {/* Role Dropdown */}
                        <TableCell>
                          <Select
                            disabled={user.id === 1}
                            value={user.role?.toLowerCase() ?? ""}
                            onValueChange={(val) =>
                              handleRoleChange(user.id, val)
                            }
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map((role) => (
                                <SelectItem
                                  key={role.id}
                                  value={role.name.toLowerCase()}
                                >
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>

                        {/* Joined */}
                        <TableCell>{formatDate(user.created_at)}</TableCell>

                        {/* Actions */}
                        <TableCell>
                          <div className="flex gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      navigate(`/admin/users/${user.id}`)
                                    }
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <Can anyOf={["update:user"]}>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      navigate(
                                        `/admin/users/${user.id}/edit`
                                      )
                                    }
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            </Can>

                            {user.id !== 1 && (
                              <Can anyOf={["delete:user"]}>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="hover:text-destructive"
                                      onClick={() => handleDelete(user)}
                                    >
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
                      <TableCell colSpan={7} className="text-center h-24">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* ---- Pagination ---- */}
          <div className="flex justify-center mt-6 space-x-2">
            <Button
              disabled={!pagination.hasPrev}
              onClick={() => fetchUsers(searchTerm, pagination.page - 1)}
            >
              Previous
            </Button>

            <span className="px-4 flex items-center">
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

        {/* ---- Confirm Delete Modal ---- */}
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
