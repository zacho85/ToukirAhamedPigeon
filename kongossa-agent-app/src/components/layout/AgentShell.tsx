import { useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Home, ArrowLeftRight, Calendar, Settings, Banknote } from "lucide-react";
import type { RootState } from "@/redux/store";
import { useWaitingCashOuts } from "@/modules/transactions/useWaitingCashOuts";

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
  // A customer-approved cash-out must not go unnoticed while the agent is on another page.
  const waiting = useWaitingCashOuts();
  const { pathname } = useLocation();
  const onCashOutPage = pathname.startsWith("/transactions/cash-out");
  const total = waiting.reduce((sum, r) => sum + Number(r.amount), 0);

  useEffect(() => {
    document.title = waiting.length ? `(${waiting.length}) Kongossa Pay Agent` : "Kongossa Pay Agent";
  }, [waiting.length]);

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col">
      <header className="bg-white px-4 py-3 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 shrink-0">
          <img src="/kp-mark.png" alt="" className="h-8 w-8 rounded-lg" />
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

      {waiting.length > 0 && !onCashOutPage && (
        <Link
          to="/transactions/cash-out"
          role="status"
          className="bg-amber-400 text-[#0B1226] px-4 py-3 flex items-center gap-3 shadow-sm animate-pulse"
        >
          <Banknote className="w-5 h-5 shrink-0" />
          <span className="flex-1 min-w-0 text-sm font-semibold">
            {waiting.length === 1
              ? `Cash-out waiting: ${waiting[0].customer?.fullName || waiting[0].customer?.email || "customer"} · $${Number(waiting[0].amount).toFixed(2)}`
              : `${waiting.length} cash-outs waiting · $${total.toFixed(2)}`}
          </span>
          <span className="text-sm font-bold underline shrink-0">Open</span>
        </Link>
      )}

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 pb-24">
        <Outlet context={{ waitingCashOuts: waiting.length }} />
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
