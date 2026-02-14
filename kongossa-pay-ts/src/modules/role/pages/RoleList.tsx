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
  actions: [] as string[], // multiple actions for create
  resource: "",
  description: "",
  roles: [] as string[],
});

const [editPermissionForm, setEditPermissionForm] = useState({
  action: "", // single action for edit
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

  const [isDeletePermissionModalOpen, setIsDeletePermissionModalOpen] =
  useState(false);
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
  };

  const handleCreatePermission = async () => {
    try {
      await createPermission(createPermissionForm);
      setIsPermissionModalOpen(false);
      setCreatePermissionForm({
        actions: [] as string[], // <-- change here
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
    dispatch(
      showToast({
        type: "info",
        message: "Edit role: " + role.name,
        position: "top-right",
        animation: "slide-right-in",
        duration: 4000,
      })
    );
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

      // Extract string message safely
      let message = "Permission cannot be deleted";
      const data = err?.response?.data;

      if (data) {
        // If backend sends { message: string, ... }
        if (typeof data.message === "string") {
          message = data.message;
        }
        // fallback if backend sends an array of messages
        else if (Array.isArray(data.message)) {
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
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />

        {/* Header */}
        <div className="flex justify-end">
          {/* <h2 className="text-2xl font-bold tracking-tight">Roles</h2> */}
          <Can anyOf={["create:role"]}>
            <Button onClick={() => setIsModalOpen(true)} className="mr-2">
              <Plus className="mr-2 h-4 w-4" />
              Add New Role
            </Button>
          </Can>
          <Can anyOf={["create:permission"]}>
            <Button onClick={() => setIsPermissionModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add New Permission
            </Button>
          </Can>
        </div>

        {/* Table */}
        <h2 className="text-xl font-semibold mt-10">Roles</h2>
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
          <div className="p-6">
            {loading ? (
              <p>Loading...</p>
            ) : roles.length === 0 ? (
              <p>No roles found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SL</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Total Users</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role, index) => (
                    <TableRow key={role.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{role.name.charAt(0).toUpperCase() + role.name.slice(1)}</TableCell>
                      <TableCell>{role.total_users}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.map((perm) => (
                            <Badge key={perm.id} className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {perm.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Can anyOf={["update:role"]}>
                            <Button variant="outline" size="sm" onClick={() => handleEditRole(role)}>
                              <Edit className="h-4 w-4 mr-1" /> Edit
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
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </Can>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        <h2 className="text-xl font-semibold mt-10">Permissions</h2>
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
          <div className="p-6">
            {loading ? (
              <p>Loading...</p>
            ) : roles.length === 0 ? (
              <p>No roles found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SL</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Total Roles</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissionsList.map((perm, i) => (
                    <TableRow key={perm.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{perm.name}</TableCell>
                      <TableCell>{perm.roles.length}</TableCell>
                      <TableCell>{perm.description}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => editPermission(perm)}>
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => confirmDeletePermission(perm.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

            {/* ================= CREATE PERMISSION MODAL ================= */}
          <Dialog
            open={isPermissionModalOpen}
            onOpenChange={setIsPermissionModalOpen}
          >
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Permission</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Action */}
                <div>
                  <Label>Action</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {permissionActions.map((a) => (
                      <label key={a.value} className="flex items-center gap-2">
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
                        <span>{a.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Resource */}
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

                {/* Description */}
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

                {/* Roles */}
                <div>
                  <Label>Assign to Roles</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {roles.map((role) => (
                      <label key={role.id} className="flex items-center gap-2">
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
                        <span>{role.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsPermissionModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreatePermission}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* ================= EDIT PERMISSION MODAL ================= */}
        <Dialog
          open={isEditPermissionModalOpen}
          onOpenChange={setIsEditPermissionModalOpen}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Permission</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Action */}
              <div>
                <Label>Action</Label>
                <Select
                  value={editPermissionForm.action}
                  onValueChange={(value) =>
                    setEditPermissionForm({ ...editPermissionForm, action: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
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

              {/* Resource */}
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

              {/* Description */}
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

              {/* Roles */}
              <div>
                <Label>Assigned Roles</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {roles.map((role) => (
                    <label key={role.id} className="flex items-center gap-2">
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
                      <span>{role.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditPermissionModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdatePermission}>Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>



        {/* Create Role Modal */}

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
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
                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
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
                      <Label htmlFor={perm.id}>{perm.name}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Create Role</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Role Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
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
                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
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
                      <Label htmlFor={`edit-${perm.id}`}>{perm.name}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        {isDeleteModalOpen && (
          <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Delete Role</DialogTitle>
              </DialogHeader>
              <p>Are you sure you want to delete this role? This action cannot be undone.</p>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDeleteRole}>Delete Role</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      {isDeletePermissionModalOpen && (
        <Dialog
          open={isDeletePermissionModalOpen}
          onOpenChange={setIsDeletePermissionModalOpen}
        >
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Delete Permission</DialogTitle>
            </DialogHeader>

            <p>
              Are you sure you want to delete this permission? This action cannot be
              undone.
            </p>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeletePermissionModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeletePermission}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      </div>
    </PageTransition>
  );
}
