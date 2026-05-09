// ✅ src/pages/RolesList.tsx
import { useEffect, useState, type FormEvent } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";

import Breadcrumbs from "@/components/module/admin/layout/Breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  getAllPermissions,
  getAllPermissionsWithRoles,
  deletePermission,
  createPermission,
  updatePermission,
  getPermissionActions,
} from "@/modules/role/api";
import { useDispatch } from "react-redux";
import { showToast } from "@/redux/slices/toastSlice";
import PageTransition from '@/components/module/admin/layout/PageTransition';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Can } from "@/components/custom/Can";

// ------------------------------------
// Types
// ------------------------------------
interface Permission {
  id: string;
  name: string;
  description?: string;
  roles: { id: string; name: string }[];
}

interface Role {
  id: string;
  name: string;
  total_users: number;
  permissions: Permission[];
}

// ------------------------------------
// Component
// ------------------------------------
export default function RoleList() {
  const dispatch = useDispatch();

  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);

  const [permissionsList, setPermissionsList] = useState<Permission[]>([]);

  const [permissionActions, setPermissionActions] = useState<
    { label: string; value: string }[]
  >([]);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isEditPermissionModalOpen, setIsEditPermissionModalOpen] = useState(false);
  const [createPermissionForm, setCreatePermissionForm] = useState({
    actions: [] as string[],
    resource: "",
    description: "",
    roles: [] as string[],
  });

  const [editPermissionForm, setEditPermissionForm] = useState({
    action: "",
    resource: "",
    description: "",
    roles: [] as string[],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [formData, setFormData] = useState<{ name: string; permissions: string[] }>({ name: "", permissions: [] });
  const [editFormData, setEditFormData] = useState<{ name: string; permissions: string[] }>({ name: "", permissions: [] });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);

  const [editingPermission, setEditingPermission] = useState<any>(null);

  const [isDeletePermissionModalOpen, setIsDeletePermissionModalOpen] = useState(false);
  const [deletePermissionId, setDeletePermissionId] = useState<string | null>(null);

  const editPermission = (permission: any) => {
    setEditingPermission(permission);
    setEditPermissionForm({
      action: permission.name.split(":")[0],
      resource: permission.name.split(":")[1],
      description: permission.description || "",
      roles: permission.roles.map((r: any) => r.id),
    });
    setIsEditPermissionModalOpen(true);
  };

  // Fetch Roles
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await getAllRoles();
      setRoles(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      console.error("Failed to fetch roles", err);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Permissions
  const fetchPermissions = async () => {
    try {
      const res = await getAllPermissions();
      setPermissions(res);
    } catch (err) {
      console.error("Failed to fetch permissions", err);
      setPermissions([]);
    }
  };

  const fetchPermissionActions = async () => {
    try {
      const res = await getPermissionActions();
      setPermissionActions(res);
    } catch (err) {
      dispatch(
        showToast({
          type: "danger",
          message: "Failed to load permission actions",
        })
      );
    }
  };

  const fetchPermissionsList = async () => {
    const res = await getAllPermissionsWithRoles();
    setPermissionsList(res);
    setLoading(false);
  };

  const handleCreatePermission = async () => {
    try {
      await createPermission(createPermissionForm);
      setIsPermissionModalOpen(false);
      setCreatePermissionForm({
        actions: [] as string[],
        resource: "",
        description: "",
        roles: [],
      });
      fetchPermissionsList();
    } catch (err: any) {
      dispatch(
        showToast({
          type: "danger",
          message: err?.response?.data?.message || "Failed to create permission",
        })
      );
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
    fetchPermissionActions();
    fetchPermissionsList();
  }, []);

  // Create Role
  const handleCreateRole = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createRole(formData);
      setIsModalOpen(false);
      setFormData({ name: "", permissions: [] });
      fetchRoles();
      dispatch(
        showToast({
          type: "success",
          message: "Role created successfully!",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } catch (err) {
      console.error(err);
      dispatch(
        showToast({
          type: "danger",
          message: "Error creating role",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    }
  };

  // Edit Role
  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setEditFormData({
      name: role.name,
      permissions: role.permissions.map(p => p.id),
    });
    setIsEditModalOpen(true);
  };

  // Update Role
  const handleUpdateRole = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;

    try {
      await updateRole(editingRole.id, editFormData);
      setIsEditModalOpen(false);
      setEditingRole(null);
      fetchRoles();
      dispatch(
        showToast({
          type: "success",
          message: "Role updated successfully!",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } catch (err) {
      console.error(err);
      dispatch(
        showToast({
          type: "danger",
          message: "Error updating role",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    }
  };

  const handleUpdatePermission = async () => {
    try {
      await updatePermission(editingPermission.id, editPermissionForm);
      setIsEditPermissionModalOpen(false);
      setEditingPermission(null);
      fetchPermissionsList();
    } catch (err: any) {
      dispatch(
        showToast({
          type: "danger",
          message: err?.response?.data?.message || "Failed to update permission",
        })
      );
    }
  };

  // Delete Role
  const handleDeleteRole = async () => {
    if (!deleteRoleId) return;
    try {
      await deleteRole(deleteRoleId);
      setIsDeleteModalOpen(false);
      setDeleteRoleId(null);
      fetchRoles();
      dispatch(
        showToast({
          type: "success",
          message: "Role deleted successfully!",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } catch (err) {
      console.error(err);
      dispatch(
        showToast({
          type: "danger",
          message: "Error deleting role",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    }
  };

  const handleDeletePermission = async () => {
    if (!deletePermissionId) return;

    try {
      await deletePermission(deletePermissionId);
      setIsDeletePermissionModalOpen(false);
      setDeletePermissionId(null);
      await fetchPermissionsList();

      dispatch(
        showToast({
          type: "success",
          message: "Permission deleted successfully",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } catch (err: any) {
      console.error("Delete permission error:", err);

      let message = "Permission cannot be deleted";
      const data = err?.response?.data;

      if (data) {
        if (typeof data.message === "string") {
          message = data.message;
        } else if (Array.isArray(data.message)) {
          message = data.message.join(", ");
        }
      } else if (err?.message) {
        message = err.message;
      }

      dispatch(
        showToast({
          type: "danger",
          message,
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    }
  };

  const confirmDeletePermission = (permissionId: string) => {
    setDeletePermissionId(permissionId);
    setIsDeletePermissionModalOpen(true);
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Roles" },
  ];

  return (
    <PageTransition>
      <div className="space-y-6 px-3 sm:px-4 md:px-6">
        <Breadcrumbs items={breadcrumbs} />

        {/* Header Buttons - Responsive */}
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <Can anyOf={["create:role"]}>
            <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add New Role
            </Button>
          </Can>
          <Can anyOf={["create:permission"]}>
            <Button onClick={() => setIsPermissionModalOpen(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add New Permission
            </Button>
          </Can>
        </div>

        {/* Roles Section - Mobile Optimized */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Roles</h2>
          <div className="bg-background border border-border rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading roles...</div>
            ) : roles.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No roles found</div>
            ) : (
              // Mobile Card View (visible on mobile, hidden on desktop)
              <div className="block md:hidden divide-y divide-border">
                {roles.map((role, index) => (
                  <div key={role.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                        <h3 className="font-semibold text-foreground mt-1">
                          {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <Can anyOf={["update:role"]}>
                          <Button variant="outline" size="sm" onClick={() => handleEditRole(role)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                        </Can>
                        <Can anyOf={["delete:role"]}>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setDeleteRoleId(role.id);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </Can>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Users:</span>
                        <p className="font-medium text-foreground">{role.total_users}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Permissions:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {role.permissions.length > 0 ? (
                            <>
                              {role.permissions.slice(0, 3).map((perm) => (
                                <Badge key={perm.id} variant="secondary" className="text-xs">
                                  {perm.name.split(":").pop()}
                                </Badge>
                              ))}
                              {role.permissions.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{role.permissions.length - 3}
                                </Badge>
                              )}
                            </>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Desktop Table View (hidden on mobile) */}
            {!loading && roles.length > 0 && (
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">SL</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Total Users</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role, index) => (
                      <TableRow key={role.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">
                          {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                        </TableCell>
                        <TableCell>{role.total_users}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.slice(0, 3).map((perm) => (
                              <Badge key={perm.id} variant="secondary" className="text-xs">
                                {perm.name}
                              </Badge>
                            ))}
                            {role.permissions.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{role.permissions.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Can anyOf={["update:role"]}>
                              <Button variant="outline" size="sm" onClick={() => handleEditRole(role)}>
                                <Edit className="h-3 w-3 sm:mr-1" />
                                <span className="hidden sm:inline"> Edit</span>
                              </Button>
                            </Can>
                            <Can anyOf={["delete:role"]}>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setDeleteRoleId(role.id);
                                  setIsDeleteModalOpen(true);
                                }}
                              >
                                <Trash2 className="h-3 w-3 sm:mr-1" />
                                <span className="hidden sm:inline"> Delete</span>
                              </Button>
                            </Can>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        {/* Permissions Section - Mobile Optimized */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Permissions</h2>
          <div className="bg-background border border-border rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading permissions...</div>
            ) : permissionsList.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No permissions found</div>
            ) : (
              // Mobile Card View (visible on mobile, hidden on desktop)
              <div className="block md:hidden divide-y divide-border">
                {permissionsList.map((perm, i) => (
                  <div key={perm.id} className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs text-muted-foreground">#{i + 1}</span>
                        <p className="font-mono text-sm text-foreground mt-1 break-all">{perm.name}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => editPermission(perm)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => confirmDeletePermission(perm.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Roles:</span>
                        <p className="font-medium text-foreground">{perm.roles.length}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Description:</span>
                        <p className="text-sm text-foreground">{perm.description || "—"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Desktop Table View (hidden on mobile) */}
            {!loading && permissionsList.length > 0 && (
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">SL</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Total Roles</TableHead>
                      <TableHead className="hidden lg:table-cell">Description</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissionsList.map((perm, i) => (
                      <TableRow key={perm.id}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell className="font-mono text-sm break-all">{perm.name}</TableCell>
                        <TableCell>{perm.roles.length}</TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {perm.description || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => editPermission(perm)}>
                              <Edit className="h-3 w-3 sm:mr-1" />
                              <span className="hidden sm:inline"> Edit</span>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => confirmDeletePermission(perm.id)}
                            >
                              <Trash2 className="h-3 w-3 sm:mr-1" />
                              <span className="hidden sm:inline"> Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        {/* ================= CREATE PERMISSION MODAL ================= */}
        <Dialog open={isPermissionModalOpen} onOpenChange={setIsPermissionModalOpen}>
          <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Permission</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Actions</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {permissionActions.map((a) => (
                    <label key={a.value} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={createPermissionForm.actions.includes(a.value)}
                        onCheckedChange={(checked) => {
                          setCreatePermissionForm({
                            ...createPermissionForm,
                            actions: checked
                              ? [...createPermissionForm.actions, a.value]
                              : createPermissionForm.actions.filter((v) => v !== a.value),
                          });
                        }}
                      />
                      <span className="text-foreground">{a.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Resource</Label>
                <Input
                  placeholder="e.g. users, orders"
                  value={createPermissionForm.resource}
                  onChange={(e) =>
                    setCreatePermissionForm({
                      ...createPermissionForm,
                      resource: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={createPermissionForm.description}
                  onChange={(e) =>
                    setCreatePermissionForm({
                      ...createPermissionForm,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Assign to Roles</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-[200px] overflow-y-auto">
                  {roles.map((role) => (
                    <label key={role.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={createPermissionForm.roles.includes(role.id)}
                        onCheckedChange={(checked) => {
                          setCreatePermissionForm({
                            ...createPermissionForm,
                            roles: checked
                              ? [...createPermissionForm.roles, role.id]
                              : createPermissionForm.roles.filter((id) => id !== role.id),
                          });
                        }}
                      />
                      <span className="text-foreground">{role.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setIsPermissionModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePermission}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ================= EDIT PERMISSION MODAL ================= */}
        <Dialog open={isEditPermissionModalOpen} onOpenChange={setIsEditPermissionModalOpen}>
          <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Permission</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Action</Label>
                <Select
                  value={editPermissionForm.action}
                  onValueChange={(value) =>
                    setEditPermissionForm({ ...editPermissionForm, action: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    {permissionActions.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Resource</Label>
                <Input
                  value={editPermissionForm.resource}
                  onChange={(e) =>
                    setEditPermissionForm({
                      ...editPermissionForm,
                      resource: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={editPermissionForm.description}
                  onChange={(e) =>
                    setEditPermissionForm({
                      ...editPermissionForm,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Assigned Roles</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-[200px] overflow-y-auto">
                  {roles.map((role) => (
                    <label key={role.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={editPermissionForm.roles.includes(role.id)}
                        onCheckedChange={(checked) => {
                          setEditPermissionForm({
                            ...editPermissionForm,
                            roles: checked
                              ? [...editPermissionForm.roles, role.id]
                              : editPermissionForm.roles.filter((id) => id !== role.id),
                          });
                        }}
                      />
                      <span className="text-foreground">{role.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setIsEditPermissionModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePermission}>Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Role Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px] w-[95vw] rounded-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Role</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter role name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                  {permissions.map((perm) => (
                    <div key={perm.id} className="flex items-center gap-2">
                      <Checkbox
                        id={perm.id}
                        checked={formData.permissions.includes(perm.id)}
                        onCheckedChange={(checked) => {
                          const updated = checked
                            ? [...formData.permissions, perm.id]
                            : formData.permissions.filter((p) => p !== perm.id);
                          setFormData({ ...formData, permissions: updated });
                        }}
                      />
                      <Label htmlFor={perm.id} className="text-sm text-foreground">
                        {perm.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Create Role</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Role Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px] w-[95vw] rounded-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateRole} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Role Name</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="Enter role name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                  {permissions.map((perm) => (
                    <div key={perm.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`edit-${perm.id}`}
                        checked={editFormData.permissions.includes(perm.id)}
                        onCheckedChange={(checked) => {
                          const updated = checked
                            ? [...editFormData.permissions, perm.id]
                            : editFormData.permissions.filter((p) => p !== perm.id);
                          setEditFormData({ ...editFormData, permissions: updated });
                        }}
                      />
                      <Label htmlFor={`edit-${perm.id}`} className="text-sm text-foreground">
                        {perm.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Role Confirmation */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-[400px] w-[95vw] rounded-lg">
            <DialogHeader>
              <DialogTitle>Delete Role</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Are you sure you want to delete this role? This action cannot be undone.
            </p>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteRole}>Delete Role</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Permission Confirmation */}
        <Dialog open={isDeletePermissionModalOpen} onOpenChange={setIsDeletePermissionModalOpen}>
          <DialogContent className="sm:max-w-[400px] w-[95vw] rounded-lg">
            <DialogHeader>
              <DialogTitle>Delete Permission</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Are you sure you want to delete this permission? This action cannot be undone.
            </p>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsDeletePermissionModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeletePermission}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}