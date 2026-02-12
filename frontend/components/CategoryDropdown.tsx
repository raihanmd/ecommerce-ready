"use client";

import Link from "next/link";
import { useCategories } from "@/lib/queries/useCategories";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CategoryDropdown() {
  const { data: categories = [], isLoading, error } = useCategories();

  // Debug logging
  console.log("CategoryDropdown - data:", categories);
  console.log("CategoryDropdown - isLoading:", isLoading);
  console.log("CategoryDropdown - error:", error);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="gap-2 text-foreground hover:text-primary"
        >
          Categories
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {isLoading ? (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            Loading...
          </div>
        ) : error ? (
          <div className="px-2 py-1.5 text-sm text-destructive">
            Error loading categories
          </div>
        ) : categories?.length === 0 ? (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            No categories
          </div>
        ) : (
          categories?.map((category) => (
            <DropdownMenuItem key={category.id} asChild>
              <Link
                href={`/products?category=${category.slug}`}
                className="cursor-pointer"
              >
                {category.name}
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
