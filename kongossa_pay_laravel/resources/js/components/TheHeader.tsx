"use client";

import { useState } from "react";
import {Link} from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Wallet, QrCode, Users, Settings, Globe } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const features = [
    {
      title: "Send Money",
      description: "Transfer funds instantly worldwide",
      icon: <Wallet className="h-4 w-4" />,
      href: "/send",
    },
    {
      title: "QR Payments",
      description: "Accept payments with QR codes",
      icon: <QrCode className="h-4 w-4" />,
      href: "/qr-pay",
    },
    {
      title: "Digital Wallet",
      description: "Manage your digital assets",
      icon: <Wallet className="h-4 w-4" />,
      href: "/wallet",
    },
    {
      title: "Remittance",
      description: "International money transfers",
      icon: <Globe className="h-4 w-4" />,
      href: "/remittance",
    },
  ];

  const merchantFeatures = [
    {
      title: "Merchant Dashboard",
      description: "Manage your business payments",
      href: "/merchant",
    },
    {
      title: "Payment Gateway",
      description: "Integrate payment solutions",
      href: "/merchant/gateway",
    },
    {
      title: "Analytics",
      description: "View transaction analytics",
      href: "/merchant/analytics",
    },
    {
      title: "API Access",
      description: "Developer tools and APIs",
      href: "/merchant/api",
    },
  ];

  return (
    <header className="sticky px-20 top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <QrCode className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl">
              <span className="text-orange-500">Kongossa</span>
              <span className="text-red-500">Pay</span>
            </span>
          </Link>

          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[600px] gap-3 p-4 md:grid-cols-2">
                    {features.map((feature) => (
                      <NavigationMenuLink key={feature.title} asChild>
                        <Link
                          href={feature.href}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="flex items-center gap-2">
                            {feature.icon}
                            <div className="text-sm font-medium leading-none">
                              {feature.title}
                            </div>
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {feature.description}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>For Merchants</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[500px] gap-3 p-4 md:grid-cols-2">
                    {merchantFeatures.map((feature) => (
                      <NavigationMenuLink key={feature.title} asChild>
                        <Link
                          href={feature.href}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">
                            {feature.title}
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {feature.description}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/pricing">
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    Pricing
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/support">
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    Support
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Globe className="h-4 w-4 mr-2" />
                EN
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>English</DropdownMenuItem>
              <DropdownMenuItem>Español</DropdownMenuItem>
              <DropdownMenuItem>Français</DropdownMenuItem>
              <DropdownMenuItem>中文</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>KongossaPay</SheetTitle>
                <SheetDescription>
                  Complete digital payment solution
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Features</h4>
                  {features.map((feature) => (
                    <Link
                      key={feature.title}
                      href={feature.href}
                      className="flex items-center gap-3 text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      {feature.icon}
                      {feature.title}
                    </Link>
                  ))}
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">For Merchants</h4>
                  {merchantFeatures.map((feature) => (
                    <Link
                      key={feature.title}
                      href={feature.href}
                      className="block text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      {feature.title}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-col gap-3 mt-6">
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
