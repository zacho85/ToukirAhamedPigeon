// // ✅ src/layouts/AdminLayout.tsx
// import React, { useState } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { motion, AnimatePresence } from "framer-motion";

// import {
//   Menu,
//   ChevronRight,
//   LogOut,
//   LayoutDashboard,
//   FolderKanban,
//   BookOpen,
//   ListChecks,
//   Coins,
//   PlusCircle,
//   Banknote,
//   MailPlus,
//   Shield,
//   Users,
//   Settings,
// } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuLabel,
// } from "@/components/ui/dropdown-menu";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// import { logoutUser } from "@/modules/auth/api";
// import { showLoader, hideLoader } from "@/redux/slices/loaderSlice";
// import { showToast } from "@/redux/slices/toastSlice";
// import { logout } from "@/redux/slices/authSlice";

// /* ------------------------------------ */
// /* Types */
// /* ------------------------------------ */
// interface User {
//   fullName?: string;
//   email?: string;
//   profileImage?: string;
// }

// interface SidebarItem {
//   title: string;
//   url?: string;
//   icon: React.ElementType;
//   children?: SidebarItem[];
// }

// interface AdminLayoutProps {
//   children: React.ReactNode;
// }

// /* ------------------------------------ */
// /* Admin Layout */
// /* ------------------------------------ */
// export default function AdminLayout({ children }: AdminLayoutProps) {
//   const navigate = useNavigate();
//   // const location = useLocation();
//   const dispatch = useDispatch();
//   const { user, loading } = useSelector((state: any) => state.auth);
//   const [mobileOpen, setMobileOpen] = useState(false);

//   // 🔒 Stable animation key
//   const pageKey =
//     typeof window !== "undefined" ? window.location.pathname : "page";

//   const handleLogout = async () => {
//     dispatch(showLoader({ message: "Logging out..." }));
//     try {
//       await logoutUser();
//       dispatch(logout());
//       navigate("/login", { replace: true });
//     } catch (err: any) {
//       dispatch(
//         showToast({
//           message:
//             err?.response?.data?.message || err.message || "Logout failed.",
//           type: "danger",
//         })
//       );
//     } finally {
//       dispatch(hideLoader());
//     }
//   };

//   const userNavItems: SidebarItem[] = [
//     { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
//     {
//       title: "Budget Management",
//       icon: FolderKanban,
//       children: [
//         { title: "My Budgets", url: "/budgets", icon: BookOpen },
//         { title: "Budget Categories", url: "/budgets/categories", icon: ListChecks },
//         { title: "Expenses List", url: "/expenses", icon: Coins },
//         { title: "Create Budget", url: "/budgets/create", icon: PlusCircle },
//       ],
//     },
//     {
//       title: "E-Tontine",
//       icon: Banknote,
//       children: [
//         { title: "My Tontines", url: "/tontines", icon: Banknote },
//         { title: "Invitations", url: "/tontines/invite", icon: MailPlus },
//         { title: "Tontine Create", url: "/tontines/create", icon: PlusCircle },
//       ],
//     },
//     { title: "Manage Users", url: "/admin/users", icon: Users },
//     { title: "Manage Access", url: "/admin/roles", icon: Shield },
//     { title: "Settings", url: "/profile", icon: Settings },
//   ];

//   if (loading)
//     return <div className="flex items-center justify-center h-screen">Loading...</div>;

//   if (!user) return null;

//   return (
//     <div className="min-h-screen flex bg-gray-50">
//       {/* ================= Desktop Sidebar ================= */}
//       <aside className="hidden md:flex flex-col bg-white border-r h-screen w-60 fixed left-0 top-0 z-40">
//         <div className="p-4 border-b">
//           <img src="/logo.png" alt="Logo" className="h-10" />
//         </div>

//         <div className="flex-1 overflow-y-auto px-2 pt-5">
//           <SidebarMenu
//             items={userNavItems}
//             currentPath={location.pathname}
//             expanded
//           />
//         </div>

//         <div className="border-t p-3">
//           <UserDropdown user={user} expanded onLogout={handleLogout} />
//         </div>
//       </aside>

//       {/* ================= Mobile Sidebar ================= */}
//       <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
//         <SheetTrigger asChild>
//           <Button
//             variant="outline"
//             size="icon"
//             className="md:hidden fixed top-4 left-4 z-50"
//           >
//             <Menu className="w-5 h-5" />
//           </Button>
//         </SheetTrigger>

//         <SheetContent side="left" className="p-0 w-72">
//           <div className="h-full flex flex-col bg-white">
//             <div className="p-4 border-b">
//               <img src="/logo.png" alt="Logo" className="h-10" />
//             </div>

//             <div className="flex-1 overflow-y-auto px-2">
//               <SidebarMenu
//                 items={userNavItems}
//                 currentPath={location.pathname}
//                 expanded
//               />
//             </div>

//             <div className="border-t p-3">
//               <UserDropdown user={user} expanded onLogout={handleLogout} />
//             </div>
//           </div>
//         </SheetContent>
//       </Sheet>

//       {/* ================= Main Content ================= */}
//       <main className="flex-1 md:ml-60 p-6">
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={pageKey}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 20 }}
//             transition={{ duration: 0.35, ease: "easeOut" }}
//           >
//             {children}
//           </motion.div>
//         </AnimatePresence>
//       </main>
//     </div>
//   );
// }

// /* ------------------------------------ */
// /* Sidebar Menu (FIXED) */
// /* ------------------------------------ */
// function SidebarMenu({
//   items,
//   currentPath,
//   expanded,
// }: {
//   items: SidebarItem[];
//   currentPath: string;
//   expanded: boolean;
// }) {
//   const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({});
//   console.log("Loading");

//   const hasActiveChild = (item: SidebarItem): boolean =>
//     !!item.children?.some(
//       (child) =>
//         child.url === currentPath ||
//         (child.children && hasActiveChild(child))
//     );

//   // 🔁 Auto-open parents that contain active route
//   React.useEffect(() => {
//     const next: Record<string, boolean> = {};
//     items.forEach((i) => hasActiveChild(i) && (next[i.title] = true));
//     setOpenMenus((prev) => ({ ...prev, ...next }));
//   }, [currentPath]);

//   return (
//     <ul className="space-y-1">
//       {items.map((item) => {
//         const isActive = item.url === currentPath;
//         const isParentActive = hasActiveChild(item);
//         const isOpen = openMenus[item.title] || isParentActive;

//         return (
//           <li key={item.title}>
//             {item.children ? (
//               <>
//                 <div
//                   onClick={() => {
//                     // 🔒 DO NOT close if active child exists
//                     if (isParentActive) return;

//                     setOpenMenus((p) => ({
//                       ...p,
//                       [item.title]: !p[item.title],
//                     }));
//                   }}
//                   className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer ${
//                     isParentActive
//                       ? "text-blue-600"
//                       : "text-gray-700 hover:bg-blue-50"
//                   }`}
//                 >
//                   <div className="flex items-center gap-3">
//                     <item.icon className="w-5 h-5" />
//                     {expanded && <span>{item.title}</span>}
//                   </div>

//                   {expanded && (
//                     <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
//                       <ChevronRight className="w-4 h-4" />
//                     </motion.div>
//                   )}
//                 </div>

//                 <AnimatePresence>
//                   {isOpen && (
//                     <motion.ul
//                       className="ml-6 mt-1 space-y-1"
//                       initial={{ height: 0, opacity: 0 }}
//                       animate={{ height: "auto", opacity: 1 }}
//                       exit={{ height: 0, opacity: 0 }}
//                     >
//                       <SidebarMenu
//                         items={item.children}
//                         currentPath={currentPath}
//                         expanded={expanded}
//                       />
//                     </motion.ul>
//                   )}
//                 </AnimatePresence>
//               </>
//             ) : (
//               <Link
//                 to={item.url!}
//                 className={`flex items-center gap-3 px-3 py-2 rounded-md ${
//                   isActive
//                     ? "bg-blue-600 text-white"
//                     : "text-gray-700 hover:bg-blue-50"
//                 }`}
//               >
//                 <item.icon className="w-5 h-5" />
//                 {expanded && <span>{item.title}</span>}
//               </Link>
//             )}
//           </li>
//         );
//       })}
//     </ul>
//   );
// }

// /* ------------------------------------ */
// /* User Dropdown */
// /* ------------------------------------ */
// function UserDropdown({
//   user,
//   expanded,
//   onLogout,
// }: {
//   user: User;
//   expanded: boolean;
//   onLogout: () => void;
// }) {
//   const shortName = user.fullName?.split(" ").slice(0, 2).join(" ") || "User";

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant="ghost" className="w-full flex gap-3 justify-start">
//           <img
//             src={user.profileImage || `https://avatar.vercel.sh/${user.email}`}
//             className="w-8 h-8 rounded-full"
//           />
//           {expanded && <span>{shortName}</span>}
//         </Button>
//       </DropdownMenuTrigger>

//       <DropdownMenuContent side="top" align="start" className="w-full">
//         <DropdownMenuLabel>{shortName}</DropdownMenuLabel>
//         <DropdownMenuItem asChild>
//           <Link to="/settings">
//             <Settings className="w-4 h-4 mr-2" /> Settings
//           </Link>
//         </DropdownMenuItem>
//         <DropdownMenuItem onClick={onLogout} className="text-red-600">
//           <LogOut className="w-4 h-4 mr-2" /> Logout
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }

// import { motion, AnimatePresence } from "framer-motion";
// import Header from "@/components/module/admin/layout/Header";
// import Sidebar from "@/components/module/admin/layout/Sidebar";
// import Main from "@/components/module/admin/layout/Main";
// import RouteProgress from "@/components/module/admin/layout/RouteProgress";

// export default function AdminLayout({ children }: { children: React.ReactNode }) {
//   const pageKey =
//     typeof window !== "undefined" ? window.location.pathname : "page";

//   return (
//     <>
//       <RouteProgress />

//       <div className="flex flex-col min-h-screen bg-gray-50">
//         <Header />

//         <div className="flex pt-16">
//           <Sidebar />

//           <Main>
//             <AnimatePresence mode="wait">
//               <motion.div
//                 key={pageKey}
//                 initial={{ opacity: 0, y: 15 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: 15 }}
//                 transition={{ duration: 0.35, ease: "easeOut" }}
//               >
//                 {children}
//               </motion.div>
//             </AnimatePresence>
//           </Main>
//         </div>
//       </div>
//     </>
//   );
// }

import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Header from "@/components/module/admin/layout/Header";
import Sidebar from "@/components/module/admin/layout/Sidebar";
import Main from "@/components/module/admin/layout/Main";
import RouteProgress from "@/components/module/admin/layout/RouteProgress";

export default function AdminLayout() {
  const location = useLocation();

  return (
    <>
      <RouteProgress />

      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />

        <div className="flex pt-16 bg-gray-50 dark:bg-gray-900">
          <Sidebar />

          <Main>
            <AnimatePresence mode="wait" initial={false}>
              {/* Render nested routes here */}
              <Outlet key={location.pathname} />
            </AnimatePresence>
          </Main>
        </div>
      </div>
    </>
  );
}



