import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  BookOpen,
  ListChecks,
  PlusCircle,
  Banknote,
  MailPlus,
  Shield,
  Settings,
  ChevronRight,
  Coins,
  Users,
  Bitcoin,
  DollarSign,
  History,
  // User,
  Send,
  // Fence,
  CoinsIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

/* ======================================================
   MENU CONFIG WITH PERMISSIONS
====================================================== */
const menu = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    permission: ["read:dashboard"],
  },
  {
    title: "Budget",
    icon: FolderKanban,
    children: [
      {
        title: "My Budgets",
        url: "/budgets",
        icon: BookOpen,
        permission: ["read:budget"],
      },
      {
        title: "Budget Categories",
        url: "/budgets/categories",
        icon: ListChecks,
        permission: ["read:budget-category"],
      },
      {
        title: "Expenses List",
        url: "/expenses",
        icon: Coins,
        permission: ["read:expense"],
      },
      {
        title: "Create Budget",
        url: "/budgets/create",
        icon: PlusCircle,
        permission: ["create:budget"],
      },
    ],
  },
  {
    title: "E-Tontine",
    icon: Banknote,
    children: [
      {
        title: "My Tontines",
        url: "/tontines",
        icon: Banknote,
        permission: ["read:tontine"],
      },
      {
        title: "Invitations",
        url: "/tontines/invite",
        icon: MailPlus,
        permission: ["read:tontine-invite"],
      },
      {
        title: "Tontine Create",
        url: "/tontines/create",
        icon: PlusCircle,
        permission: ["create:tontine"],
      },
    ],
  },
  {
    title: "Wallet",
    url: "/wallet",
    icon: Coins,
    permission: ["read:wallet"],
  },
  {
    title: "Agent Dashboard",
    url: "/agent-dashboard",
    icon: LayoutDashboard,
    permission: ["read:agent-dashboard"],
  },
  {
    title: "Agent CRM",
    url: "/agent-crm",
    icon: Users,
    permission: ["read:agent-crm"],
  },
  {
    title: "Crypto Exchange",
    url: "/crypto-exchange",
    icon: Bitcoin,
    permission: ["read:crypto-exchange"],
  },
  {
    title: "Currency Exchange",
    url: "/currency-exchange",
    icon: DollarSign,
    permission: ["read:currency-exchange"],
  },
  {
    title: "History",
    url: "/history",
    icon: History,
    permission: ["read:history"],
  },
    {
    title: "Fee Management",
    url: "/fee-management",
    icon: CoinsIcon,
    permission: ["read:fee-management"],
  },
  {
    title: "Send Money",
    url: "/send-money",
    icon: Send,
    permission: ["create:send-money"],
  },
  {
    title: "Manage Users",
    url: "/admin/users",
    icon: Users,
    permission: ["read:user"],
  },
  {
    title: "Manage Access",
    url: "/admin/roles",
    icon: Shield,
    permission: ["read:role"],
  },
  {
    title: "Settings",
    url: "/profile",
    icon: Settings,
  },
];

/* ======================================================
   SIDEBAR
====================================================== */
export default function SidebarMenu() {
  const location = useLocation();
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const permissions: string[] =
    useSelector((state: RootState) => (state.auth as any).user?.permissions) || [];

  /* ===========================
     PERMISSION CHECKER
  ============================ */
  const canAccess = (required?: string[]) => {
    if (!required || required.length === 0) return true;
    return required.every((p) => permissions.includes(p));
  };

  /* ===========================
     FILTER MENU BY PERMISSIONS
  ============================ */
  const filteredMenu = menu
    .map((item) => {
      if (item.children) {
        const children = item.children.filter((c) =>
          canAccess(c.permission)
        );
        if (children.length === 0) return null;
        return { ...item, children };
      }
      return canAccess(item.permission) ? item : null;
    })
    .filter(Boolean) as typeof menu;

  const hasActiveChild = (item: any): boolean =>
    item.children?.some(
      (c: any) =>
        c.url === location.pathname ||
        (c.children && hasActiveChild(c))
    );

  useEffect(() => {
    const next: Record<string, boolean> = {};
    filteredMenu.forEach(
      (i) => hasActiveChild(i) && (next[i.title] = true)
    );
    setOpen((p) => ({ ...p, ...next }));
  }, [location.pathname]);

  /* ===========================
     RENDER
  ============================ */
  return (
    <ul className="p-3 space-y-1">
      {filteredMenu.map((item) => {
        const isParentActive = hasActiveChild(item);
        const isOpen = open[item.title] || isParentActive;

        return (
          <li key={item.title}>
            {item.children ? (
              <>
                <div
                  onClick={() =>
                    !isParentActive &&
                    setOpen((p) => ({
                      ...p,
                      [item.title]: !p[item.title],
                    }))
                  }
                  className={`flex justify-between items-center px-3 py-2 rounded cursor-pointer
                    ${
                      isParentActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "hover:bg-blue-50 dark:hover:bg-gray-700"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    {item.title}
                  </div>
                  <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="ml-6 mt-1 space-y-1"
                    >
                      {item.children.map((c) => (
                        <Link
                          key={c.title}
                          to={c.url}
                          className={`block px-3 py-2 rounded
                            ${
                              location.pathname === c.url
                                ? "bg-blue-600 text-white dark:bg-blue-500"
                                : "hover:bg-blue-50 dark:hover:bg-gray-700 dark:text-gray-200"
                            }`}
                        >
                          {c.title}
                        </Link>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Link
                to={item.url}
                className={`flex gap-2 px-3 py-2 rounded
                  ${
                    location.pathname === item.url
                      ? "bg-blue-600 text-white dark:bg-blue-500"
                      : "hover:bg-blue-50 dark:hover:bg-gray-900 dark:text-gray-200"
                  }`}
              >
                <item.icon className="w-4 h-4" />
                {item.title}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
