import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import SidebarMenu from "./SidebarMenu";
import { Button } from "@/components/ui/button";

export default function SidebarMobileSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="p-0 w-72 bg-white dark:bg-gray-800">
        <SheetTitle className="hidden">Mobile Navigation</SheetTitle>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <img src="/logo.png" className="h-9" />
        </div>
        <SidebarMenu />
      </SheetContent>
    </Sheet>
  );
}
