// ✅ src/pages/Layout.jsx
import React, { useEffect, useState, useRef  } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

import {
  Menu,
  ChevronDown,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  FolderKanban,
  BookOpen,
  ListChecks,
  Coins,
  PlusCircle,
  Banknote,
  MailPlus,
  Shield,
  Users,
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { logoutUser } from "@/api/auth";
import { showLoader, hideLoader } from "@/store/loaderSlice";
import { showToast } from "@/store/toastSlice";
import { logout, refreshAccessToken } from "@/store/authSlice";
import { LanguageProvider } from "@/components/common/LanguageProvider";
import PageTransition from "@/components/animation/PageTransition";



/* -------------------------------------------------------------------------- */
/* 🧭 Layout Component */
/* -------------------------------------------------------------------------- */
export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, accessToken, loading } = useSelector((state) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);

  // useEffect(() => {
  //   dispatch(refreshAccessToken());
  // }, [dispatch]);

  // 🌐 Public pages
  const marketingPages = [
  "home", "personal", "business", "agent", "about", "support", "privacy", "terms", "login", "register", "verify-otp",  "publicinvitation","forgot-password", "reset-password"
];

const currentPageName = location.pathname.replace(/\//g, "").toLowerCase() || "home";
const isMarketingPage = marketingPages.includes(currentPageName);

  // 🚪 Logout
  const handleLogout = async () => {
    dispatch(showLoader({ message: "Logging out..." }));
    try {
      await logoutUser();
      dispatch(logout());
      navigate("/login", { replace: true });
    } catch (err) {
      dispatch(
        showToast({
          message:
            err?.response?.data?.message || err.message || "Logout failed.",
          type: "danger",
        })
      );
    } finally {
      dispatch(hideLoader());
    }
  };

  /* ---------------------------------------------------------------------- */
  /* 📋 User Navigation Items */
  /* ---------------------------------------------------------------------- */
  const userNavItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Budget Management",
      icon: FolderKanban,
      children: [
        { title: "My Budgets", url: "/budgets", icon: BookOpen },
        { title: "Budget Categories", url: "/budgets/categories", icon: ListChecks },
        { title: "Expenses List", url: "/expenses", icon: Coins },
        { title: "Create Budget", url: "/budgets/create", icon: PlusCircle },
      ],
    },
    {
      title: "E-Tontine",
      icon: Banknote,
      children: [
        { title: "My Tontines", url: "/tontines", icon: Banknote },
        { title: "Invitations", url: "/tontines/invite", icon: MailPlus },
        { title: "Tontine Create", url: "/tontines/create", icon: PlusCircle },
      ],
    },
    { title: "Manage Users", url: "/admin/users", icon: Users },
    { title: "Manage Access", url: "/admin/roles", icon: Shield },
    {
      title: "Settings",
      url: "/profile",
      icon: Settings,
    },
  ];

  if (loading){
    console.log('Loading2...');
    return (
      <div className="flex justify-center items-center h-screen">Loading...</div>
    );
  }

  if (isMarketingPage)
    return (
      <PublicLayout
        user={user}
        accessToken={accessToken}
      />
    );
  // console.log("User:", JSON.stringify(user, null, 2));
  if (!user) return null;

  /* ---------------------------------------------------------------------- */
  /* 🔐 Authenticated Layout */
  /* ---------------------------------------------------------------------- */
  return (
    <LanguageProvider>
      <div className="min-h-screen flex bg-gray-50">
        {/* 🖥️ Desktop Sidebar */}
        <aside className="hidden md:flex flex-col bg-white border-r h-screen w-60 fixed left-0 top-0 z-40">
          <div className="flex items-center gap-2 p-4 border-b">
            <img src="/logo.png" alt="Logo" className="h-10" />
          </div>
          <div className="flex-1 overflow-y-auto px-2 pt-5">
            <SidebarMenu
              items={userNavItems}
              currentPath={location.pathname}
              expanded
            />
          </div>
          <div className="border-t p-3">
            <UserDropdown user={user} expanded onLogout={handleLogout} />
          </div>
        </aside>

        {/* 📱 Mobile Sidebar */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden fixed top-4 left-4 z-50"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <div className="h-full flex flex-col bg-white">
              <div className="flex items-center gap-2 p-4 border-b">
                <img src="/logo.png" alt="Logo" className="h-10" />
              </div>
              <div className="flex-1 overflow-y-auto px-2">
                <SidebarMenu
                  items={userNavItems}
                  currentPath={location.pathname}
                  expanded
                />
              </div>
              <div className="border-t p-3">
                <UserDropdown user={user} expanded onLogout={handleLogout} />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex-1 md:ml-60 p-6 transition-all duration-300">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </LanguageProvider>
  );
}

/* -------------------------------------------------------------------------- */
/* 🌍 Public Layout */
function PublicLayout({ user, accessToken }) {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-white">
        <header className="sticky top-0 bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-6 flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
            </Link>
            <div className="flex items-center gap-4">
              {!accessToken || !user ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register">Get Started</Link>
                  </Button>
                </>
              ) : (
                <Button asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              )}
            </div>
          </div>
        </header>
        <main>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </LanguageProvider>
  );
}

/* -------------------------------------------------------------------------- */
/* 📂 Sidebar Menu */
function SidebarMenu({ items, currentPath, expanded }) {
  const [openMenus, setOpenMenus] = React.useState({});

  const toggleMenu = (title) =>
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));

  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const isActive = currentPath === item.url;
        const hasChildren = item.children && item.children.length > 0;

        // handle click: toggle submenu OR navigate
        const handleClick = () => {
          if (hasChildren) {
            toggleMenu(item.title);
          }
        };

        return (
          <li key={item.title}>
            {hasChildren ? (
              // Menu with children → toggle
              <div
                onClick={handleClick}
                className={`flex items-center justify-between cursor-pointer px-3 py-2 rounded-md ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-blue-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  {expanded && <span>{item.title}</span>}
                </div>
                {expanded && (openMenus[item.title] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                ))}
              </div>
            ) : (
              // Menu without children → navigate
              <Link
                to={item.url}
                className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-blue-50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {expanded && <span>{item.title}</span>}
              </Link>
            )}

            {/* Submenu */}
            {hasChildren && (
              <AnimatePresence initial={false}>
                {openMenus[item.title] && (
                  <motion.ul
                    className="ml-6 mt-1 space-y-1 overflow-hidden"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <SidebarMenu
                      items={item.children}
                      currentPath={currentPath}
                      expanded={expanded}
                    />
                  </motion.ul>
                )}
              </AnimatePresence>
            )}
          </li>
        );
      })}
    </ul>
  );
}


/* -------------------------------------------------------------------------- */
/* 👤 User Dropdown */
function UserDropdown({ user, expanded, onLogout }) {
  const shortName = user?.fullName?.split(" ").slice(0, 2).join(" ") || "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex items-center justify-start gap-3 px-3"
        >
          <img
            src={user?.profileImage || `https://avatar.vercel.sh/${user.email}`}
            alt={user.fullName}
            className="w-8 h-8 rounded-full"
          />
          {expanded && <span className="font-medium">{shortName}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-full cursor-pointer">
        <DropdownMenuLabel className="flex items-center gap-3">
          <img
            src={user?.profileImage || `https://avatar.vercel.sh/${user.email}`}
            alt={user.fullName}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <p className="font-medium">{shortName}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center gap-4">
            <Settings className="w-4 h-4" /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onLogout} className="text-red-600 flex items-center gap-4">
          <LogOut className="w-4 h-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
