// src/routes/web.js
import { group } from "./helpers";

import Login from "@/pages/public/Login";
import Register from "@/pages/public/Register";
import OTPVerification from "@/pages/public/OTPVerification";
import ResetPassword from "@/pages/public/ResetPassword";
import ForgotPassword from "@/pages/public/ForgotPassword";
import Dashboard from "@/pages/Dashboard";
import Wallet from "@/pages/Wallet";
import Budgets from "@/pages/Budgets";
import CreateBudget from "@/pages/CreateBudget";
import BudgetEdit from "@/pages/BudgetEdit";
import BudgetDetail from "@/pages/BudgetDetail";
import BudgetCategoryList from "@/pages/BudgetCategoryList";
import BudgetCategoryCreate from "@/pages/BudgetCategoryCreate";
import BudgetCategoryEdit from "@/pages/BudgetCategoryEdit";
import ExpensesList from "@/pages/ExpensesList";
import ExpenseCreate from "@/pages/ExpenseCreate";
import UserList from "@/pages/UserList";
import UserCreate from "@/pages/UserCreate";
import UserEdit from "@/pages/UserEdit";
import RoleList from "@/pages/RoleList";
import Profile from "@/pages/Profile";
import Password from "@/pages/Password";
import Appearance from "@/pages/Appearance";
import Home from "@/pages/public/Home";
import About from "@/pages/public/About";
import Support from "@/pages/public/Support";
import NotFound from "@/pages/NotFound";
import AdminFeeManagement from "@/pages/AdminFeeManagement";

export const routes = [
  // 🔓 Public routes
  { path: "/", element: <Home />, name: "Home", middleware: ["guest"] },
  { path: "/login", element: <Login />, name: "Login", middleware: ["guest"] },
  { path: "/register", element: <Register />, name: "Register", middleware: ["guest"] },
  { path: "/verify-otp", element: <OTPVerification />, name: "OTP", middleware: ["guest"] },
  { path: "/forgot-password", element: <ForgotPassword />, name: "ForgotPassword", middleware: ["guest"] },
  { path: "/reset-password", element: <ResetPassword />, name: "ResetPassword", middleware: ["guest"] },
  { path: "/about", element: <About />, name: "About", middleware: ["guest"] },
  { path: "/support", element: <Support />, name: "Support", middleware: ["guest"] },

  // 🔐 Authenticated User Routes
  ...group({ middleware: ["auth"] }, [
    { path: "/dashboard", element: <Dashboard />, name: "Dashboard" },
    { path: "/wallet", element: <Wallet />, name: "Wallet" },
    { path: "/profile", element: <Profile />, name: "Profile" },
    { path: "/password", element: <Password />, name: "Password" },
    { path: "/appearance", element: <Appearance />, name: "Appearance" },
  ]),

  // 💰 Budgets Routes
  ...group({ prefix: "/budgets", middleware: ["auth"], permissions: ["can:view_budget"] }, [
    { path: "", element: <Budgets />, name: "Budgets" },
    { path: "/create", element: <CreateBudget />, name: "CreateBudget", permissions: ["can:create_budget"] },
    { path: "/:id/edit", element: <BudgetEdit />, name: "BudgetEdit", permissions: ["can:edit_budget"] },
    { path: "/:id", element: <BudgetDetail />, name: "BudgetDetail" },
    { path: "/categories", element: <BudgetCategoryList />, name: "BudgetCategoryList" },
    { path: "/categories/create", element: <BudgetCategoryCreate />, name: "BudgetCategoryCreate" },
    { path: "/categories/:id/edit", element: <BudgetCategoryEdit />, name: "BudgetCategoryEdit" },
  ]),

  // 🧾 Expenses
  ...group({ prefix: "/expenses", middleware: ["auth"], permissions: ["can:view_expenses"] }, [
    { path: "", element: <ExpensesList />, name: "ExpensesList" },
    { path: "/create", element: <ExpenseCreate />, name: "ExpenseCreate" },
  ]),

  // 👥 User Management (Admin)
  ...group({ prefix: "/admin", middleware: ["auth"], permissions: ["can:manage_users"] }, [
    { path: "/users", element: <UserList />, name: "UserList" },
    { path: "/users/create", element: <UserCreate />, name: "UserCreate" },
    { path: "/users/:id/edit", element: <UserEdit />, name: "UserEdit" },
    { path: "/roles", element: <RoleList />, name: "RoleList" },
    { path: "/fees", element: <AdminFeeManagement />, name: "AdminFeeManagement" },
  ]),

  // 🚫 404
  { path: "*", element: <NotFound />, name: "NotFound", middleware: ["guest"] },
];
