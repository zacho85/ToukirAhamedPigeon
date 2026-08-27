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
import TransactionsPage from "@/modules/transactions/pages/TransactionsPage";
import CashInPage from "@/modules/transactions/pages/CashInPage";
import CashOutPage from "@/modules/transactions/pages/CashOutPage";
import SettlementPage from "@/modules/settlement/pages/SettlementPage";
import StartDayPage from "@/modules/settlement/pages/StartDayPage";
import EndDayPage from "@/modules/settlement/pages/EndDayPage";
import FloatRequestPage from "@/modules/float-request/pages/FloatRequestPage";
import SettingsPage from "@/modules/settings/pages/SettingsPage";

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
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/transactions/cash-in" element={<CashInPage />} />
            <Route path="/transactions/cash-out" element={<CashOutPage />} />
            <Route path="/settlement" element={<SettlementPage />} />
            <Route path="/settlement/start-day" element={<StartDayPage />} />
            <Route path="/settlement/end-day" element={<EndDayPage />} />
            <Route path="/float-request" element={<FloatRequestPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
