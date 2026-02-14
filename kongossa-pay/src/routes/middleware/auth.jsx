// ✅ src/routes/middleware/auth.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Component wrapper to protect authenticated routes.
 * Usage: <RequireAuth><Dashboard /></RequireAuth>
 */
export function RequireAuth({ children }) {
  const { user, accessToken } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!user || !accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
