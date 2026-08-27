import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import type { AppDispatch, RootState } from "@/redux/store";
import { refreshAccessToken } from "@/redux/slices/authSlice";
import { getMyStatus } from "@/modules/agents/api";
import PendingApprovalPage from "@/modules/auth/pages/PendingApprovalPage";

interface AgentStatus {
  status: string;
  kycStatus: string;
  kycRejectionReason: string | null;
}

/**
 * Combines two checks behind one gate: is there a valid session at all, and
 * -- if so -- is this agent actually active+verified. AgentGuard on the
 * backend enforces the same status check for every real agent route, so a
 * pending/rejected agent would otherwise hit a wall of 403s with no
 * explanation; this shows them their actual status instead.
 */
export default function AgentGate() {
  const dispatch = useDispatch<AppDispatch>();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const isLoggedOut = useSelector((state: RootState) => state.auth.isLoggedOut);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);

  useEffect(() => {
    if (accessToken || isLoggedOut) {
      setCheckingAuth(false);
      return;
    }
    dispatch(refreshAccessToken())
      .unwrap()
      .catch(() => {})
      .finally(() => setCheckingAuth(false));
  }, [accessToken, isLoggedOut, dispatch]);

  useEffect(() => {
    if (checkingAuth || !accessToken) return;
    getMyStatus()
      .then((data) => setAgentStatus(data))
      .catch(() => setAgentStatus(null))
      .finally(() => setCheckingStatus(false));
  }, [checkingAuth, accessToken]);

  if (checkingAuth) return null;
  if (!accessToken) return <Navigate to="/login" replace />;
  if (checkingStatus) return null;

  if (!agentStatus || agentStatus.status !== "active" || agentStatus.kycStatus !== "verified") {
    return (
      <PendingApprovalPage
        status={agentStatus?.status}
        kycStatus={agentStatus?.kycStatus}
        kycRejectionReason={agentStatus?.kycRejectionReason}
      />
    );
  }

  return <Outlet />;
}
