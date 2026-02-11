"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { categoriesApi } from "@/lib/api";
import { Category } from "@/types";
import { FaChevronDown } from "react-icons/fa";

export default function CategoryDropdown() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesApi.getAll();
        setCategories(response.data.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition py-2">
        Categories
        <FaChevronDown className="text-sm group-hover:rotate-180 transition" />
      </button>

      {/* Dropdown Menu */}
      <div className="absolute left-0 mt-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        {loading ? (
          <div className="px-4 py-2 text-gray-500 text-sm">Loading...</div>
        ) : categories?.length === 0 ? (
          <div className="px-4 py-2 text-gray-500 text-sm">No categories</div>
        ) : (
          categories?.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
              onClick={() => setIsOpen(false)}
            >
              {category.name}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
