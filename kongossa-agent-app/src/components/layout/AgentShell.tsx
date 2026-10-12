import { NavLink, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { Home, ArrowLeftRight, Calendar, Settings } from "lucide-react";
import type { RootState } from "@/redux/store";

const TABS = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/settlement", label: "Settlement", icon: Calendar },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function AgentShell() {
  // Show who is signed in, so an agent (or a tester with several tabs) always
  // knows which account the actions below belong to.
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col">
      <header className="bg-white px-4 py-3 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 shrink-0">
          <img src="/logo.png" alt="" className="h-8 w-auto" />
          <span className="font-semibold text-[#0B1226]">Kongossa Pay Agent</span>
        </div>
        {user && (
          <div className="min-w-0 text-right leading-tight">
            {user.fullName && (
              <p className="text-sm font-medium text-[#0B1226] truncate">{user.fullName}</p>
            )}
            {user.email && <p className="text-xs text-gray-500 truncate">{user.email}</p>}
          </div>
        )}
      </header>

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
        <div className="max-w-md mx-auto flex">
          {TABS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-3 text-xs ${
                  isActive ? "text-emerald-500" : "text-gray-400"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
