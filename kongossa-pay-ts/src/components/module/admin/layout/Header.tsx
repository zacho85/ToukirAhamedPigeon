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
        <img
          src="/logo.png"
          className="h-9 hidden md:block"
        />
      </div>
        <div className="flex justify-end items-center gap-3">
          <ThemeToggleButton />
          <UserDropdown />
        </div>
    </header>
  );
}
