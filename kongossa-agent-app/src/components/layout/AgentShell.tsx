import { NavLink, Outlet } from "react-router-dom";
import { Home, ArrowLeftRight, Calendar, Settings } from "lucide-react";

const TABS = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/settlement", label: "Settlement", icon: Calendar },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function AgentShell() {
  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col">
      <header className="bg-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#0B1226] flex items-center justify-center">
            <span className="text-emerald-400 font-bold">K</span>
          </div>
          <span className="font-semibold text-[#0B1226]">KongossaPay Agent</span>
        </div>
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
