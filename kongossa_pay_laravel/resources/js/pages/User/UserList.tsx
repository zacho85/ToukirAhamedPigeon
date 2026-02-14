import { Breadcrumbs, useToast } from "@/components";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { useDebounce } from "@/lib/utils";
import { Auth, BreadcrumbItem, PaginatedData, Role, User } from "@/types";
import { Head, Link, router, useRemember } from "@inertiajs/react";
import { format, formatDistanceToNow } from "date-fns";
import { Building2, Edit, Eye, Phone, Plus, Search, Trash2, User as UserIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function UserList({ auth, users, roles, stats }: {
    auth: Auth;
    users: PaginatedData<User>;
    roles: Role[];
    stats: {
        total_users: number;
        active_users: number;
        inactive_users: number;
        total_roles: number;
    };
}) {
    const [searchTerm, setSearchTerm] = useRemember("");
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const inputRef = useRef(null)

    useDebounce(searchTerm, function () {
        router.visit(route('users.index', { "filter[search]": searchTerm }), {
            preserveScroll: true,
            preserveState: true,
            preserveUrl: true,
        })
    }, 500)

    useEffect(() => {
        if (searchTerm) (inputRef.current as HTMLInputElement | null)?.focus()
        // @ts-ignore
        setSearchTerm(route().queryParams?.filter?.search || "")
    }, [])


    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
            return formatDistanceToNow(date, { addSuffix: true });
        }
        return format(date, "PPP");
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            label: 'Dashboard',
            href: route('dashboard'),
        },
        {
            label: "Users",
            href: "/"
        }
    ]

    const { toast } = useToast();
    function handleStatus(user: User) {
        router.put(route('users.update', { user: user.id }), {
            'status': user.status === 'Active' ? 'inactive' : 'active'
        }, {
            preserveScroll: true,
            preserveState: true,
            preserveUrl: true,
            onError: (error) => {
                console.log(error);
                toast({
                    title: "Status Updated",
                    description: error.status ? error.status : "An error occurred.",
                    variant: "default",
                });
            },
            onSuccess: () => {
                toast({
                    title: "Status Updated",
                    description: `User status has been changed to ${user.status === 'Active' ? 'inactive' : 'active'}.`,
                    variant: "default",
                });
            },
        })
    }

    function handleRoleChange(userId: number, roleId: string) {
        router.put(route('users.update', { user: userId }), {
            'role': roleId
        }, {
            preserveScroll: true,
            preserveState: true,
            preserveUrl: true,
            onError: (error) => {
                toast({
                    title: "Role Update Failed!",
                    description: error.role ? error.role : "An error occurred.",
                });
            },
            onSuccess: () => {
                toast({
                    title: "Role Updated",
                    description: `User role has been changed!`,
                    variant: "default",
                });
            },
        });
    }

    const [isDeleting, setIsDeleting] = useState(false);
    function handleDelete(user: User) {
        setUserToDelete(user);
        setIsConfirmOpen(true);
    }

    function confirmDelete() {
        if (!userToDelete) return;

        setIsDeleting(true);
        router.delete(route('users.destroy', { user: userToDelete.id }), {
            preserveScroll: true,
            preserveState: true,
            onError: (error) => {
                toast({
                    title: "Delete Failed",
                    description: error.message || "An error occurred while deleting the user.",
                    variant: "destructive",
                });
            },
            onSuccess: () => {
                toast({
                    title: "User Deleted",
                    description: "The user has been successfully deleted.",
                    variant: "default",
                });
            },
            onFinish: () => {
                setIsConfirmOpen(false);
                setUserToDelete(null);
                setIsDeleting(false);
            }
        });
    }

    return (
        <>
            {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}
            <Head title="User List" />

            <div className="py-6">
                <div className="max-w-full mx-auto">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Total Users</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_users}</div>
                                <p className="text-xs text-muted-foreground">
                                    Full System
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Active Users</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.active_users}</div>
                                <p className="text-xs text-muted-foreground">
                                    In Full System
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Inactive Users</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.inactive_users}</div>
                                <p className="text-xs text-muted-foreground">
                                    In full system
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Total Roles</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.total_roles}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    In full System
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">All Users</h2>
                        <div className="flex items-center gap-4">
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by name, email, phone, company, role, or status..."
                                    className="pl-8 w-full"
                                    value={searchTerm}
                                    ref={inputRef}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
                            <Button asChild>
                                <Link href={route('users.create')}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create User
                                </Link>
                            </Button>
                        </div>
                    </div>
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
                                        <TableHead className="w-[100px]">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.length > 0 ? (
                                        users.data.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={user.avatar} alt={user.name} />
                                                            <AvatarFallback className="text-xs">
                                                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">{user.name}</div>
                                                            {user.company_name && (
                                                                <div className="text-xs text-muted-foreground">
                                                                    {String(user.company_name)}
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
                                                                <Phone className="h-3 w-3" />
                                                                {String(user.phone)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={user.user_type === 'business_merchant' ? 'default' : 'secondary'}
                                                        className="text-xs"
                                                    >
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
                                                        className="capitalize"
                                                    >
                                                        <button className="btn btn-sm cursor-pointer" onClick={() => handleStatus(user)} >{user.status} </button>
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        disabled={user.id === 1}
                                                        defaultValue={user.role.name.toLowerCase()}
                                                        onValueChange={(value) => handleRoleChange(user.id, value)}
                                                    >
                                                        <SelectTrigger className="w-[130px]">
                                                            <SelectValue placeholder="Select role" />
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
                                                <TableCell>
                                                    {formatDate(user.created_at)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-1">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        asChild
                                                                    >
                                                                        <Link
                                                                            href={route('users.show', {
                                                                                user: user.id,
                                                                            })}
                                                                            className="hover:text-primary"
                                                                        >
                                                                            <Eye className="h-4 w-4" />
                                                                            <span className="sr-only">
                                                                                View user
                                                                            </span>
                                                                        </Link>
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>View Details</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        asChild
                                                                    >
                                                                        <Link
                                                                            href={route('users.edit', {
                                                                                user: user.id,
                                                                            })}
                                                                            className="hover:text-primary"
                                                                        >
                                                                            <Edit className="h-4 w-4" />
                                                                            <span className="sr-only">
                                                                                Edit user
                                                                            </span>
                                                                        </Link>
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Edit User</p>
                                                                </TooltipContent>
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
                                                                            <span className="sr-only">
                                                                                Delete user
                                                                            </span>
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Delete User</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="text-center h-24"
                                            >
                                                No users found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <Pagination className="mt-6">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    isActive={users.links.prev !== null}
                                    href={users.links.prev || '#'}
                                />
                            </PaginationItem>

                            <PaginationItem>
                                <PaginationNext
                                    isActive={users.links.next !== null}
                                    href={users.links.next || '#'}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
            {userToDelete && (
                <ConfirmationDialog
                    open={isConfirmOpen}
                    onOpenChange={setIsConfirmOpen}
                    title="Are you sure?"
                    description={`You are about to delete the user "${userToDelete.name}". This action cannot be undone.`}
                    onConfirm={confirmDelete}
                    variant="destructive"
                    confirmText={isDeleting ? "Deleting..." : 'Yes, delete'}
                    loading={isDeleting}
                />
            )}
        </>
    );
}

export default UserList;
