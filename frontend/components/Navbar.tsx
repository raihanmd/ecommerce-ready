"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";
import CategoryDropdown from "./CategoryDropdown";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Menu, X } from "lucide-react";

export default function Navbar() {
  const cart = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary">
            eCommerce
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <CategoryDropdown />
            <Link
              href="/products"
              className="text-foreground hover:text-primary transition"
            >
              All Products
            </Link>
          </div>

          {/* Cart Icon & Mobile Menu */}
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
              </Button>
              {cart.getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {cart.getTotalItems()}
                </span>
              )}
            </Link>

            {/* Mobile Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  <CategoryDropdown />
                  <Link
                    href="/products"
                    className="text-foreground hover:text-primary transition py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    All Products
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
