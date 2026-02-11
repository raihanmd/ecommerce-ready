"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";
import CategoryDropdown from "./CategoryDropdown";
import { FaShoppingCart } from "react-icons/fa";
import { FaX } from "react-icons/fa6";
import { BiMenu } from "react-icons/bi";

export default function Navbar() {
  const cart = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            eCommerce
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <CategoryDropdown />
            <Link
              href="/products"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              All Products
            </Link>
          </div>

          {/* Cart Icon */}
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative">
              <FaShoppingCart className="text-gray-700 hover:text-blue-600 transition text-xl" />
              {cart.getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.getTotalItems()}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700 hover:text-blue-600 transition"
            >
              {isMenuOpen ? (
                <FaX className="text-xl" />
              ) : (
                <BiMenu className="text-xl" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            <CategoryDropdown />
            <Link
              href="/products"
              className="block text-gray-700 hover:text-blue-600 transition py-2"
            >
              All Products
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
