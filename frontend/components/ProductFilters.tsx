"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { useState, useTransition } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories?: Category[];
}

export function ProductFilters({ categories = [] }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );

  // Create URL with updated params
  const createQueryString = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Always reset to page 1 when filters change
    params.delete("page");

    return params.toString();
  };

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    startTransition(() => {
      const query = createQueryString({
        category_id: categoryId === "all" ? null : categoryId,
      });
      router.push(`${pathname}?${query}`, { scroll: false });
    });
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      const query = createQueryString({
        search: searchInput.trim() || null,
      });
      router.push(`${pathname}?${query}`, { scroll: false });
    });
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchInput("");
    startTransition(() => {
      const query = createQueryString({ search: null });
      router.push(`${pathname}?${query}`, { scroll: false });
    });
  };

  // Handle clear all filters
  const handleClearAll = () => {
    setSearchInput("");
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const currentCategory = searchParams.get("category_id");
  const currentSearch = searchParams.get("search");
  const hasActiveFilters = currentCategory || currentSearch;

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Category Filter */}
        <div className="w-full sm:w-64">
          <Select
            value={currentCategory || "all"}
            onValueChange={handleCategoryChange}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Cari produk..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              disabled={isPending}
              className="pr-10"
            />
            {searchInput && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button type="submit" disabled={isPending}>
            <Search className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Cari</span>
          </Button>
        </form>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>

          {currentCategory && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
              Category:{" "}
              {categories.find((c) => c.id === currentCategory)?.name ||
                currentCategory}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleCategoryChange("all")}
              >
                <X className="h-3 w-3" />
              </Button>
            </span>
          )}

          {currentSearch && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
              Search: "{currentSearch}"
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={handleClearSearch}
              >
                <X className="h-3 w-3" />
              </Button>
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-7 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
