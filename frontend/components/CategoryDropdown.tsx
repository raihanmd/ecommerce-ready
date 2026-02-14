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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="gap-2 text-foreground hover:text-primary"
        >
          Kategori
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {isLoading ? (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            Memuat...
          </div>
        ) : error ? (
          <div className="px-2 py-1.5 text-sm text-destructive">
            Gagal memuat kategori
          </div>
        ) : categories?.length === 0 ? (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            Tidak ada kategori
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
