import api from "@/lib/axios";

// -----------------------------
// Roles API
// -----------------------------

// Create role
export const createRole = async (data:any) => {
  const res = await api.post(`/roles`, data);
  return res.data;
};

// Get all roles
export const getAllRoles = async () => {
  const res = await api.get(`/roles`);
  return res.data;
};

// Get role by ID
export const getRoleById = async (id: number | string) => {
  const res = await api.get(`/roles/${id}`);
  return res.data;
};

// Update role
export const updateRole = async (id: number | string, data: any) => {
  const res = await api.patch(`/roles/${id}`, data);
  return res.data;
};

// Delete role
export const deleteRole = async (id: number | string) => {
  const res = await api.delete(`/roles/${id}`);
  return res.data;
};

// Assign role to user
export const assignRoleToUser = async (userId: number | string, roleId: number | string) => {
  const res = await api.post(`/roles/assign`, { userId, roleId });
  return res.data;
};

// Remove role from user
export const removeRoleFromUser = async (userId: number | string, roleId: number | string) => {
  const res = await api.post(`/roles/remove`, { userId, roleId });
  return res.data;
};

// Get user roles
export const getUserRoles = async (userId: number | string) => {
  const res = await api.get(`/roles/user/${userId}`);
  return res.data;
};

// -----------------------------
// ✅ Additional Missing Calls
// -----------------------------

// Get role permissions
export const getRolePermissions = async (roleId: number | string) => {
  const res = await api.get(`/roles/${roleId}/permissions`);
  return res.data;
};

// Assign permission(s) to role
export const assignPermissionsToRole = async (roleId: number | string, permissionIds: number[] | string[]) => {
  const res = await api.post(`/roles/${roleId}/permissions/assign`, {
    permissionIds,
  });
  return res.data;
};

// Remove permission(s) from role
export const removePermissionsFromRole = async (roleId: number | string, permissionIds: number[] | string[]) => {
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

export const getPermissionActions = async () => {
  const res = await api.get('/permissions/actions');
  return res.data;
};

// Permissions
export const getAllPermissionsWithRoles = async () => {
  const res = await api.get("/permissions/with-roles");
  return res.data;
};

export const createPermission = async (data: any) => {
  return (await api.post("/permissions", data)).data;
};

export const updatePermission = async (id: string, data: any) => {
  return (await api.patch(`/permissions/${id}`, data)).data;
};

export const deletePermission = async (id: string) => {
  return (await api.delete(`/permissions/${id}`)).data;
};
