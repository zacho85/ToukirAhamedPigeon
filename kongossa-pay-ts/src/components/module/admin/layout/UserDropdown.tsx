"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings } from "lucide-react";

import { showLoader, hideLoader } from "@/redux/slices/loaderSlice";
import { showToast } from "@/redux/slices/toastSlice";
import { logout } from "@/redux/slices/authSlice";
import { logoutUser } from "@/modules/auth/api";

export default function UserDropdown() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const shortName = (user as any).fullName?.split(" ").slice(0, 2).join(" ") || "User";

  const handleLogout = async () => {
    dispatch(showLoader({ message: "Logging out..." }));
    try {
      await logoutUser();
      dispatch(logout());
      navigate("/login", { replace: true });
    } catch (err: any) {
      dispatch(
        showToast({
          message: err?.response?.data?.message || err.message || "Logout failed.",
          type: "danger",
        })
      );
    } finally {
      dispatch(hideLoader());
    }
  };
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer">
          <Avatar className="w-8 h-8">
            <AvatarImage
              src={`${import.meta.env.VITE_APP_API_URL+user?.profileImage || `https://avatar.vercel.sh/${user?.email}`}`}
              alt={user?.fullName}
            />
            <AvatarFallback>{shortName.charAt(0)}</AvatarFallback>
          </Avatar>

          <span className="hidden lg:block text-gray-600 font-medium">{shortName}</span>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-60 p-2 bg-white dark:bg-gray-800">
        <DropdownMenuLabel className="text-gray-700 dark:text-gray-200">{shortName}</DropdownMenuLabel>

        <DropdownMenuItem asChild className="cursor-pointer dark:text-gray-200">
          <Link to="/profile" className="flex items-center gap-2">
            <Settings className="w-4 h-4" /> Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="dark:border-gray-700" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 dark:text-red-400 cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>

    </DropdownMenu>
  );
}
