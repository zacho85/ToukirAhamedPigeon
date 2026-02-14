// src/pages/RolesList.jsx
import { useEffect, useState, FormEvent } from "react";
import {
  Edit,
  Plus,
  Trash2,
} from "lucide-react";

import Breadcrumbs from "@/components/dashboard/Breadcumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
} from "@/api/roles";
import { useDispatch } from "react-redux";
import { showToast } from "@/store/toastSlice"; 


export default function RoleList() {
  const dispatch = useDispatch(); 

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const [formData, setFormData] = useState({ name: "", permissions: [] });
  const [editFormData, setEditFormData] = useState({ name: "", permissions: [] });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteRoleId, setDeleteRoleId] = useState(null);

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

  const fetchPermissions = async () => {
    try {
      const res = await getAllPermissions();
      setPermissions(res);
    } catch (err) {
      console.error("Failed to fetch permissions", err);
      setPermissions([]);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const handleCreateRole = async (e) => {
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
          type: "error",
          message: "Error creating role",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    }
  };

  const handleEditRole = (role) => {
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

  const handleUpdateRole = async (e) => {
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
          type: "error",
          message: "Error updating role",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    }
  };

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
          type: "error",
          message: "Error deleting role",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    }
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Roles" },
  ];

  return (
    <div className="space-y-6 mt-10">
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Roles</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Role
        </Button>
      </div>

      {/* Table */}
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
                  <TableHead>Name</TableHead>
                  <TableHead>Total Users</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
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
                        <Button variant="outline" size="sm" onClick={() => handleEditRole(role)}>
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

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
    </div>
  );
}
