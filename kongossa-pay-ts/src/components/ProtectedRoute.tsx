import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import { Navigate, useLocation } from "react-router-dom";
import { refreshAccessToken, logout } from "../redux/slices/authSlice";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allOf?: string[];
  anyOf?: string[];
}

export default function ProtectedRoute({
  children,
  allOf = [],
  anyOf = [],
}: ProtectedRouteProps) {
  const dispatch = useDispatch<AppDispatch>();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const user = useSelector((state: RootState) => state.auth.user);
  const isLoggedOut = useSelector((state: RootState) => state.auth.isLoggedOut);

  const [loading, setLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (hasCheckedAuth) return;

    const initAuth = async () => {
      try {
        if (!accessToken && !isLoggedOut) {
          await dispatch(refreshAccessToken()).unwrap();
        }
      } catch {
        dispatch(logout());
      } finally {
        setLoading(false);
        setHasCheckedAuth(true);
      }
    };

    initAuth();
  }, [hasCheckedAuth, accessToken, isLoggedOut, dispatch]);

  if (loading) return null;

  if (!accessToken || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  /* ============================
     🔐 PERMISSION CHECK
     ============================ */
  const permissions: string[] = (user as any).permissions || [];

  const hasAll = allOf.every(p => permissions.includes(p));
  const hasAny = anyOf.length ? anyOf.some(p => permissions.includes(p)) : true;
  console.log("permissions", permissions);
  console.log(hasAll, hasAny);
  if ((allOf.length && !hasAll) || (anyOf.length && !hasAny)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
