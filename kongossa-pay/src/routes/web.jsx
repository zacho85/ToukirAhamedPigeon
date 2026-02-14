import { group } from "./helpers";

// Public pages
import Login from "@/pages/public/Login";
import Register from "@/pages/public/Register";
import OTPVerification from "@/pages/public/OTPVerification";
import ResetPassword from "@/pages/public/ResetPassword";
import ForgotPassword from "@/pages/public/ForgotPassword";
import Home from "@/pages/public/Home";
import About from "@/pages/public/About";
import Support from "@/pages/public/Support";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";

// Authenticated pages
import Dashboard from "@/pages/admin/Dashboard";
import Wallet from "@/pages/admin/Wallet";
import Budgets from "@/pages/admin/budget/Budgets";
import CreateBudget from "@/pages/admin/budget/CreateBudget";
import BudgetEdit from "@/pages/admin/budget/BudgetEdit";
import BudgetDetail from "@/pages/admin/budget/BudgetDetail";
import BudgetCategoryList from "@/pages/admin/budget-category/BudgetCategoryList";
import BudgetCategoryCreate from "@/pages/admin/budget-category/BudgetCategoryCreate";
import BudgetCategoryEdit from "@/pages/admin/budget-category/BudgetCategoryEdit";
import ExpensesList from "@/pages/admin/expense/ExpensesList";
import ExpenseCreate from "@/pages/admin/expense/ExpenseCreate";
import UserList from "@/pages/admin/user/UserList";
import UserCreate from "@/pages/admin/user/UserCreate";
import UserEdit from "@/pages/admin/user/UserEdit";
import UserShow from "@/pages/admin/user/UserShow";
import RoleList from "@/pages/admin/role/RoleList";
import Profile from "@/pages/admin/settings/Profile";
import Password from "@/pages/admin/settings/Password";
import Appearance from "@/pages/admin/settings/Appearance";
import AdminFeeManagement from "@/pages/admin/AdminFeeManagement";

import TontinesList from "@/pages/admin/tontine/TontinesList";
import TontineInvite from "@/pages/admin/tontine-invitation/TontineInvite";
import ContributionList from "@/pages/admin/tontine-contribution/ContributionList";
import TontineCreate from "@/pages/admin/tontine/TontineCreate";
import TontineDetail from "@/pages/admin/tontine/TontineDetail";
import TontineEdit from "@/pages/admin/tontine/TontineEdit";
import PaymentSuccess from "@/pages/admin/tontine-contribution/PaymentSuccess";
import PaymentCancel from "@/pages/admin/tontine-contribution/PaymentCancel";

// 🧭 Static Laravel-style routes
export const routes = [
  // 🔓 Public Routes
  { path: "/", element: <Home />, name: "Home", middleware: ["guest"] },
  { path: "/login", element: <Login />, name: "Login", middleware: ["guest"] },
  { path: "/register", element: <Register />, name: "Register", middleware: ["guest"] },
  { path: "/verify-otp", element: <OTPVerification />, name: "Verify OTP", middleware: ["guest"] },
  { path: "/forgot-password", element: <ForgotPassword />, name: "Forgot Password", middleware: ["guest"] },
  { path: "/reset-password", element: <ResetPassword />, name: "Reset Password", middleware: ["guest"] },
  { path: "/about", element: <About />, name: "About", middleware: ["guest"] },
  { path: "/support", element: <Support />, name: "Support", middleware: ["guest"] },
  { path: "/unauthorized", element: <Unauthorized />, name: "Unauthorized", middleware: ["guest"] },

  // 🔐 Authenticated routes (wrapped in auth middleware)
  ...group({ middleware: ["auth"] }, [
    // Dashboard & Settings
    { path: "/dashboard", element: <Dashboard />, name: "Dashboard", permissions: ["read:dashboard"] },
    { path: "/wallet", element: <Wallet />, name: "Wallet", permissions: ["read:dashboard"] },
    { path: "/profile", element: <Profile />, name: "Profile", permissions: ["read:dashboard"] },
    { path: "/password", element: <Password />, name: "Password", permissions: ["read:dashboard"] },
    { path: "/appearance", element: <Appearance />, name: "Appearance", permissions: ["read:dashboard"] },
    { path: "/payment/success", element: <PaymentSuccess />, name: "PaymentSuccess", permissions: ["read:dashboard"] },
    { path: "/payment/cancel", element: <PaymentCancel />, name: "PaymentCancel", permissions: ["read:dashboard"] },


    // Budgets
    { path: "/budgets", element: <Budgets />, name: "Budgets", permissions: ["read:dashboard"] },
    { path: "/budgets/create", element: <CreateBudget />, name: "CreateBudget", permissions: ["read:dashboard"] },
    { path: "/budgets/:id/edit", element: <BudgetEdit />, name: "BudgetEdit", permissions: ["read:dashboard"] },
    { path: "/budgets/:id", element: <BudgetDetail />, name: "BudgetDetail", permissions: ["read:dashboard"] },
    { path: "/budgets/categories", element: <BudgetCategoryList />, name: "BudgetCategoryList", permissions: ["read:dashboard"] },
    { path: "/budgets/categories/create", element: <BudgetCategoryCreate />, name: "BudgetCategoryCreate", permissions: ["read:dashboard"] },
    { path: "/budgets/categories/:id/edit", element: <BudgetCategoryEdit />, name: "BudgetCategoryEdit", permissions: ["read:dashboard"] },

    // Expenses
    { path: "/expenses", element: <ExpensesList />, name: "ExpensesList", permissions: ["read:dashboard"] },
    { path: "/expenses/create", element: <ExpenseCreate />, name: "ExpenseCreate", permissions: ["read:dashboard"] },

    { path: "/tontines", element: <TontinesList />, name: "TontinesList", permissions: ["read:dashboard"] },
    { path: "/tontines/create", element: <TontineCreate />, name: "TontineCreate", permissions: ["read:dashboard"] },
    { path: "/tontines/invite", element: <TontineInvite />, name: "TontineInvite", permissions: ["read:dashboard"] },
    { path: "/tontines/:id", element: <TontineDetail />, name: "TontineDetail", permissions: ["read:dashboard"] },
    { path: "/tontine-contributions", element: <ContributionList />, name: "ContributionList", permissions: ["read:dashboard"] },
    { path: "/tontines/:id/edit", element: <TontineEdit />, name: "TontineEdit", permissions: ["read:dashboard"] },


    // Admin
    { path: "/admin/users", element: <UserList />, name: "UserList", permissions: ["read:dashboard"] },
    { path: "/admin/users/create", element: <UserCreate />, name: "UserCreate", permissions: ["read:dashboard"] },
    { path: "/admin/users/:id/edit", element: <UserEdit />, name: "UserEdit", permissions: ["read:dashboard"] },
    { path: "/admin/users/:id", element: <UserShow />, name: "UserShow", permissions: ["read:dashboard"] },
    { path: "/admin/roles", element: <RoleList />, name: "RoleList", permissions: ["read:dashboard"] },
    { path: "/admin/fees", element: <AdminFeeManagement />, name: "AdminFeeManagement", permissions: ["read:dashboard"] },
  ]),

  // 🚫 404
  { path: "*", element: <NotFound />, name: "NotFound", middleware: ["guest"] },
];
