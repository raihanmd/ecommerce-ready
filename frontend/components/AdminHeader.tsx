"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Get page title from pathname
const getPageTitle = (pathname: string) => {
  if (pathname === "/admin/dashboard") return "Dashboard";
  if (pathname.includes("/orders")) return "Orders";
  if (pathname.includes("/products")) return "Products";
  if (pathname.includes("/categories")) return "Categories";
  return "Admin";
};

export function AdminHeader() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
      <div className="flex-1">
        <h2 className="text-2xl font-bold tracking-tight">{pageTitle}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Search (optional) */}
        <div className="hidden md:flex">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search..." className="pl-8" />
          </div>
        </div>

        {/* Notifications (optional) */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
        </Button>
      </div>
    </header>
  );
}
