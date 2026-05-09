import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import SidebarMenu from "./SidebarMenu";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function SidebarMobileSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>

      <SheetContent 
        side="left" 
        className="p-0 w-72 bg-white dark:bg-gray-800 flex flex-col h-full"
      >
        <SheetTitle className="hidden">Mobile Navigation</SheetTitle>
        
        {/* Logo Section - Fixed at top */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <img src="/logo.png" className="h-9" alt="Kongossa Pay Logo" />
        </div>
        
        {/* Scrollable Menu Section */}
        <div className="flex-1 overflow-y-auto">
          <SidebarMenu />
        </div>
      </SheetContent>
    </Sheet>
  );
}