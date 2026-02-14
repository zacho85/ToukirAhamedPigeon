import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { createPageUrl } from "@/utils";
import { LayoutDashboard, Wallet, Send, History, Briefcase, Coins, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageProvider, useTranslation } from "@/components/common/LanguageProvider";
import PWAInstaller from "@/components/common/PWAInstaller";
import { logout, refreshAccessToken } from "@/store/authSlice";
import { logoutUser } from "@/api/auth";
import { showLoader, hideLoader } from "@/store/loaderSlice";
import { showToast } from "@/store/toastSlice";

function AppLayout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { user, accessToken, loading } = useSelector((state) => state.auth);

  const marketingPages = ["Home", "Personal", "Business", "Agent", "About", "Support", "Privacy", "Terms", "Login", "Register"];
  const isMarketingPage = marketingPages.includes(currentPageName);

  // Refresh token on mount
  useEffect(() => {
    dispatch(refreshAccessToken());
  }, []);

  // Redirect logic
  useEffect(() => {
  if (!loading) {
    // 1️⃣ Logged-in users cannot access Login page
    if (accessToken && user && currentPageName === "Login") {
      navigate("/Dashboard", { replace: true });
      return;
    }

    // 2️⃣ Not logged-in users cannot access protected (non-marketing) pages
    if ((!accessToken || !user) && !isMarketingPage) {
      navigate("/Login", { replace: true });
      return;
    }

    // 3️⃣ All other cases are allowed (marketing pages except Login)
  }
}, [loading, accessToken, user, currentPageName, navigate]);

  const handleLogout = async () => {
    dispatch(showLoader({ message: "Logging out..." }));
    try {
      await logoutUser();
      dispatch(logout());
      navigate("/Login", { replace: true });
    } catch (err) {
      console.error(err);
      dispatch(hideLoader());
      dispatch(showToast({ message: err?.response?.data?.message?.message || err.message || "Logout failed. Please try again.", type: "danger", duration:10000 }));
    } finally {
      dispatch(hideLoader());
    }
  };

  const userNavItems = [
    { title: t("Dashboard"), url: createPageUrl("Dashboard"), icon: LayoutDashboard },
    { title: t("Wallet"), url: createPageUrl("Wallet"), icon: Wallet },
    { title: t("Send Money"), url: createPageUrl("SendMoney"), icon: Send },
    { title: t("Invest"), url: createPageUrl("Invest"), icon: Briefcase },
    { title: t("Exchange"), url: createPageUrl("Exchange"), icon: Coins },
    { title: t("History"), url: createPageUrl("History"), icon: History },
    { title: t("Profile"), url: createPageUrl("Profile"), icon: User },
  ];

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  // Marketing Layout
  if (isMarketingPage) {
    return (
      <div className="min-h-screen bg-white">
        <header className="sticky top-0 bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-6 flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="KongossaPay Logo" className="h-12 w-full" />
            </Link>
            <div className="flex items-center gap-4">
              {(!accessToken || !user) ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/Login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/Register">Get Started</Link>
                  </Button>
                </>
              ) : 
              <>
                <Button asChild>
                    <Link to="/Dashboard">Dashboard</Link>
                  </Button>
              </>}
            </div>
          </div>
        </header>
        <main>{children}</main>
      </div>
    );
  }

  // Protected Layout
  if (!user) return null; // Already redirected by useEffect

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-72 bg-white border-r p-6 hidden md:block">
        <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="KongossaPay Logo" className="h-12 w-36" />
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <img src={user?.profileImage || `https://avatar.vercel.sh/${user.email}`} alt={user.fullName} className="w-10 h-10 rounded-full" />
          <div>
            <p className="font-medium">{user.fullName}</p>
            <Badge>{user.role}</Badge>
          </div>
        </div>
        <nav>
          <ul className="space-y-1">
            {userNavItems.map((item) => (
              <li key={item.title}>
                <Link to={item.url} className={`flex items-center gap-3 px-3 py-2 rounded-md ${location.pathname === item.url ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-50"}`}>
                  <item.icon className="w-5 h-5" /> {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-6">
          <Button variant="outline" onClick={handleLogout} className="w-full justify-start text-red-600">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <LanguageProvider>
      <PWAInstaller />
      <AppLayout currentPageName={currentPageName}>{children}</AppLayout>
    </LanguageProvider>
  );
}
