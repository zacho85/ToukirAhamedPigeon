import api from "@/lib/axios";

// -----------------------------
// Roles API
// -----------------------------

// Create role
export const createRole = async (data: any) => {
  const res = await api.post(`/roles`, data);
  return res.data;
};

// Get all roles
export const getAllRoles = async () => {
  const res = await api.get(`/roles`);
  return res.data;
};

// Get role by ID
export const getRoleById = async (id: string) => {
  const res = await api.get(`/roles/${id}`);
  return res.data;
};

// Update role
export const updateRole = async (id: string, data: any) => {
  const res = await api.patch(`/roles/${id}`, data);
  return res.data;
};

// Delete role
export const deleteRole = async (id: string) => {
  const res = await api.delete(`/roles/${id}`);
  return res.data;
};

// Assign role to user
export const assignRoleToUser = async (userId: string, roleId: string) => {
  const res = await api.post(`/roles/assign`, { userId, roleId });
  return res.data;
};

// Remove role from user
export const removeRoleFromUser = async (userId: string, roleId: string) => {
  const res = await api.post(`/roles/remove`, { userId, roleId });
  return res.data;
};

// Get user roles
export const getUserRoles = async (userId: string) => {
  const res = await api.get(`/roles/user/${userId}`);
  return res.data;
};

// -----------------------------
// ✅ Additional Missing Calls
// -----------------------------

// Get role permissions
export const getRolePermissions = async (roleId: string) => {
  const res = await api.get(`/roles/${roleId}/permissions`);
  return res.data;
};

// Assign permission(s) to role
export const assignPermissionsToRole = async (roleId: string, permissionIds: string[]) => {
  const res = await api.post(`/roles/${roleId}/permissions/assign`, {
    permissionIds,
  });
  return res.data;
};

// Remove permission(s) from role
export const removePermissionsFromRole = async (roleId: string, permissionIds: string[]) => {
  const res = await api.post(`/roles/${roleId}/permissions/remove`, {
    permissionIds,
  });
  return res.data;
};

// Get all permissions (helpful for role management UI)
export const getAllPermissions = async () => {
  const res = await api.get(`/permissions`);
  return res.data;
};

// Create new permission
export const createPermission = async (data: any) => {
  const res = await api.post(`/permissions`, data);
  return res.data;
};

// Delete permission
export const deletePermission = async (id: string) => {
  const res = await api.delete(`/permissions/${id}`);
  return res.data;
};
