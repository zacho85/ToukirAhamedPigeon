import { ThemeToggleButton } from "@/components/custom/ThemeToggleButton";
import SidebarMobileSheet from "./SidebarMobileSheet";
import UserDropdown from "./UserDropdown";

export default function Header() {
  return (
    <header
      className="
        fixed top-0 left-0 z-40 w-full h-16
        bg-white dark:bg-gray-900
        border-b border-gray-200 dark:border-gray-800
        flex items-center justify-between px-4
      "
    >
      <div className="flex items-center gap-3">
        <SidebarMobileSheet />
        <span className="hidden md:block">
          <img src="/kp-logo.png" alt="KongossaPay" className="h-9 dark:hidden" />
          <img src="/kp-logo-white.png" alt="KongossaPay" className="h-9 hidden dark:block" />
        </span>
      </div>
        <div className="flex justify-end items-center gap-3">
          <ThemeToggleButton />
          <UserDropdown />
        </div>
    </header>
  );
}
