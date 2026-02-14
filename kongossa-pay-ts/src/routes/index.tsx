import { Routes, Route, Navigate } from "react-router-dom";

import PublicRoute from "@/components/PublicRoute";
import ProtectedRoute from "@/components/ProtectedRoute";

// Public pages
import HomePage from "@/modules/public/pages/HomePage";
import LoginPage from "@/modules/auth/pages/LoginPage";
import RegisterPage from "@/modules/auth/pages/RegisterPage";
import OTPVerificationPage from "@/modules/auth/pages/OtpVerificationPage";
import ForgotPasswordPage from "@/modules/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/modules/auth/pages/ResetPasswordPage";

// Layout
import AdminLayout from "@/layouts/AdminLayout";

// Dashboard
import DashboardPage from "@/modules/dashboard/pages/DashboardPage";

// Budgets
import BudgetsList from "@/modules/budget/pages/Budgets";
import CreateBudget from "@/modules/budget/pages/CreateBudget";
import EditBudget from "@/modules/budget/pages/BudgetEdit";
import BudgetDetail from "@/modules/budget/pages/BudgetDetail";

// Budget Categories
import BudgetCategoryList from "@/modules/budget-category/pages/BudgetCategoryList";
import BudgetCategoryCreate from "@/modules/budget-category/pages/BudgetCategoryCreate";
import BudgetCategoryEdit from "@/modules/budget-category/pages/BudgetCategoryEdit";
import BudgetCategoryShow from "@/modules/budget-category/pages/BudgetCategoryShow";

// Expenses
import ExpensesList from "@/modules/expense/pages/ExpensesList";
import ExpenseCreate from "@/modules/expense/pages/ExpenseCreate";

// Tontines
import TontinesList from "@/modules/tontine/pages/TontinesList";
import TontineCreate from "@/modules/tontine/pages/TontineCreate";
import TontineDetail from "@/modules/tontine/pages/TontineDetail";
import TontineEdit from "@/modules/tontine/pages/TontineEdit";
import TontineInvite from "@/modules/tontine-invitation/pages/TontineInvite";

// Contributions
import ContributionList from "@/modules/tontine-contribution/pages/ContributionList";
import PaymentSuccess from "@/modules/tontine-contribution/pages/PaymentSuccess";
import PaymentCancel from "@/modules/tontine-contribution/pages/PaymentCancel";

// Wallet & Finance
import WalletPage from "@/modules/wallet/pages/WalletPage";
import AgentCRMPage from "@/modules/agent-crm/pages/AgentCRMPage";
import AgentDashboardPage from "@/modules/agent-dashboard/pages/AgentDashboardPage";
import CryptoExchangePage from "@/modules/crypto-exchange/pages/CryptoExchangePage";
import CurrencyExchangePage from "@/modules/currency-exchange/pages/CurrencyExchangePage";
import HistoryPage from "@/modules/history/pages/HistoryPage";
import SendMoneyPage from "@/modules/send-money/pages/SendMoneyPage";
import FeeManagementPage from "@/modules/fee-management/pages/FeeManagementPage";

// Users & Roles
import UserList from "@/modules/user/pages/UserList";
import UserShow from "@/modules/user/pages/UserShow";
import UserEdit from "@/modules/user/pages/UserEdit";
import UserCreate from "@/modules/user/pages/UserCreate";
import RoleList from "@/modules/role/pages/RoleList";

// Settings
import Profile from "@/modules/settings/pages/Profile";
import Appearance from "@/modules/settings/pages/Appearance";
import Password from "@/modules/settings/pages/Password";

// Public misc
import Terms from "@/modules/public/pages/Terms";
import Privacy from "@/modules/public/pages/Privacy";
import Features from "@/modules/public/pages/Features";
import About from "@/modules/public/pages/About";
import Pricing from "@/modules/public/pages/Pricing";
import Contact from "@/modules/public/pages/Contact";
import FAQ from "@/modules/public/pages/FAQ";

import NotFound from "@/pages/NotFound";
import Unauthorized from "@/pages/Unauthorized";

export default function AppRoutes() {
  /** DRY financial / wallet related routes */
  const financeRoutes = [
    { path: "wallet", perm: "read:wallet", component: WalletPage },
    { path: "agent-dashboard", perm: "read:agent-dashboard", component: AgentDashboardPage },
    { path: "agent-crm", perm: "read:agent-crm", component: AgentCRMPage },
    { path: "fee-management", perm: "read:fee-management", component: FeeManagementPage },
    { path: "crypto-exchange", perm: "read:crypto-exchange", component: CryptoExchangePage },
    { path: "currency-exchange", perm: "read:currency-exchange", component: CurrencyExchangePage },
    { path: "history", perm: "read:history", component: HistoryPage },
    { path: "send-money", perm: "read:send-money", component: SendMoneyPage },
  ];

  return (
    <Routes>
      {/* ---------- Public Routes ---------- */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      <Route path="/home" element={<PublicRoute><HomePage /></PublicRoute>} />
      <Route path="/about" element={<PublicRoute><About /></PublicRoute>} />
      <Route path="/features" element={<PublicRoute><Features /></PublicRoute>} />
      <Route path="/pricing" element={<PublicRoute><Pricing /></PublicRoute>} />
      <Route path="/contact" element={<PublicRoute><Contact /></PublicRoute>} />
      <Route path="/faq" element={<PublicRoute><FAQ /></PublicRoute>} />
      <Route path="/terms" element={<PublicRoute><Terms /></PublicRoute>} />
      <Route path="/privacy" element={<PublicRoute><Privacy /></PublicRoute>} />

      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/verify-otp" element={<PublicRoute><OTPVerificationPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* ---------- Protected / Admin Layout ---------- */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute allOf={["read:dashboard"]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Budgets */}
        <Route path="budgets" element={<ProtectedRoute allOf={["read:budget"]}><BudgetsList /></ProtectedRoute>} />
        <Route path="budgets/create" element={<ProtectedRoute allOf={["create:budget"]}><CreateBudget /></ProtectedRoute>} />
        <Route path="budgets/:id/edit" element={<ProtectedRoute allOf={["update:budget"]}><EditBudget /></ProtectedRoute>} />
        <Route path="budgets/:id" element={<ProtectedRoute allOf={["read:budget"]}><BudgetDetail /></ProtectedRoute>} />

        {/* Budget Categories */}
        <Route path="budgets/categories" element={<ProtectedRoute allOf={["read:budget-category"]}><BudgetCategoryList /></ProtectedRoute>} />
        <Route path="budgets/categories/create" element={<ProtectedRoute allOf={["create:budget-category"]}><BudgetCategoryCreate /></ProtectedRoute>} />
        <Route path="budgets/categories/:id/edit" element={<ProtectedRoute allOf={["update:budget-category"]}><BudgetCategoryEdit /></ProtectedRoute>} />
        <Route path="budgets/categories/:id" element={<ProtectedRoute allOf={["read:budget-category"]}><BudgetCategoryShow /></ProtectedRoute>} />

        {/* Expenses */}
        <Route path="expenses" element={<ProtectedRoute allOf={["read:expense"]}><ExpensesList /></ProtectedRoute>} />
        <Route path="expenses/create" element={<ProtectedRoute allOf={["create:expense"]}><ExpenseCreate /></ProtectedRoute>} />

        {/* Tontines */}
        <Route path="tontines" element={<ProtectedRoute allOf={["read:tontine"]}><TontinesList /></ProtectedRoute>} />
        <Route path="tontines/create" element={<ProtectedRoute allOf={["create:tontine"]}><TontineCreate /></ProtectedRoute>} />
        <Route path="tontines/:id" element={<ProtectedRoute allOf={["read:tontine"]}><TontineDetail /></ProtectedRoute>} />
        <Route path="tontines/:id/edit" element={<ProtectedRoute allOf={["update:tontine"]}><TontineEdit /></ProtectedRoute>} />
        <Route path="tontines/invite" element={<ProtectedRoute allOf={["read:tontine-invite"]}><TontineInvite /></ProtectedRoute>} />

        {/* Contributions */}
        <Route path="tontine-contributions" element={<ProtectedRoute allOf={["read:tontine-contribution"]}><ContributionList /></ProtectedRoute>} />

        {/* 🔥 Finance / Wallet (DRY MAP) */}
        {financeRoutes.map(({ path, perm, component: Component }) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute allOf={[perm]}>
                <Component />
              </ProtectedRoute>
            }
          />
        ))}

        {/* Users */}
        <Route path="admin/users" element={<ProtectedRoute allOf={["read:user"]}><UserList /></ProtectedRoute>} />
        <Route path="admin/users/create" element={<ProtectedRoute allOf={["create:user"]}><UserCreate /></ProtectedRoute>} />
        <Route path="admin/users/:id" element={<ProtectedRoute allOf={["read:user"]}><UserShow /></ProtectedRoute>} />
        <Route path="admin/users/:id/edit" element={<ProtectedRoute allOf={["update:user"]}><UserEdit /></ProtectedRoute>} />

        {/* Roles */}
        <Route path="admin/roles" element={<ProtectedRoute allOf={["read:role"]}><RoleList /></ProtectedRoute>} />

        {/* Settings */}
        <Route path="profile" element={<Profile />} />
        <Route path="appearance" element={<Appearance />} />
        <Route path="password" element={<Password />} />

        {/* Payments */}
        <Route path="payment/success" element={<PaymentSuccess />} />
        <Route path="payment/cancel" element={<PaymentCancel />} />

        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
