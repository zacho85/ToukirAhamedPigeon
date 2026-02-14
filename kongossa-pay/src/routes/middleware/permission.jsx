// ✅ src/routes/middleware/permission.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

/**
 * Wrapper for permission-based routes.
 * Usage: <RequirePermission permissions={["admin"]}><AdminPage /></RequirePermission>
 */
export function RequirePermission({ children, permissions = [] }) {
  const { user } = useSelector((state) => state.auth);

  if (!user) return <Navigate to="/unauthorized" replace />;

  const hasPermission =
    permissions.length === 0 ||
    permissions.includes(user.role) ||
    (user.permissions &&
      user.permissions.some((p) => permissions.includes(p)));

  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
