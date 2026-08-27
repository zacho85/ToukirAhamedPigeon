import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { AppDispatch } from "@/redux/store";
import { logout } from "@/redux/slices/authSlice";
import LoginPage from "@/modules/auth/pages/LoginPage";
import RegisterPage from "@/modules/auth/pages/RegisterPage";
import OtpVerificationPage from "@/modules/auth/pages/OtpVerificationPage";
import AgentGate from "@/components/AgentGate";
import AgentShell from "@/components/layout/AgentShell";
import DashboardPage from "@/modules/dashboard/pages/DashboardPage";
import ComingSoon from "@/components/ComingSoon";

function App() {
  const dispatch = useDispatch<AppDispatch>();

  // axios.ts dispatches this window event when a silent token refresh fails
  // (the refresh cookie itself expired) -- without this listener the agent
  // stays "logged in" in Redux while every request quietly 401s.
  useEffect(() => {
    const onLogout = () => dispatch(logout());
    window.addEventListener("logout", onLogout);
    return () => window.removeEventListener("logout", onLogout);
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<OtpVerificationPage />} />

        <Route element={<AgentGate />}>
          <Route element={<AgentShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/transactions" element={<ComingSoon title="Transaction history" />} />
            <Route
              path="/transactions/cash-in"
              element={<ComingSoon title="Cash In" />}
            />
            <Route
              path="/transactions/cash-out"
              element={<ComingSoon title="Cash Out" />}
            />
            <Route path="/settlement" element={<ComingSoon title="Day settlement" />} />
            <Route
              path="/settlement/start-day"
              element={<ComingSoon title="Start day" />}
            />
            <Route path="/settlement/end-day" element={<ComingSoon title="End day" />} />
            <Route path="/float-request" element={<ComingSoon title="Request float" />} />
            <Route path="/settings" element={<ComingSoon title="Settings" />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
