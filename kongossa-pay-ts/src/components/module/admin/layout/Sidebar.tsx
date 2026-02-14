import SidebarMenu from "./SidebarMenu";

export default function Sidebar() {
  return (
    <aside
      className="
        hidden md:flex fixed top-16 left-0 h-[calc(100vh-4rem)] w-60
        bg-white border-r border-gray-200
        dark:bg-gray-900 dark:border-gray-900
        overflow-y-auto
      "
    >
      <SidebarMenu />
    </aside>
  );
}
