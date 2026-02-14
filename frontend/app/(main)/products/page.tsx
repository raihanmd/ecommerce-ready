"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTransition, Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/lib/queries/useProducts";
import { Product } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { ProductFilters } from "@/components/ProductFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/PaginationControls";
import { useCategories } from "@/lib/queries/useCategories";

function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Get params from URL
  const page = parseInt(searchParams.get("page") || "1", 10);
  const categoryId = searchParams.get("category_id") || undefined;
  const search = searchParams.get("search") || undefined;
  const limit = 12;

  // Fetch data
  const { data: categoriesData } = useCategories();
  const { data, isLoading, error, refetch } = useProducts({
    page,
    limit,
    category_id: categoryId,
    search,
  });

  const products = data?.data || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const total = pagination?.total || 0;
  const categories = categoriesData || [];

  // Handle page change
  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (newPage > 1) {
        params.set("page", newPage.toString());
      } else {
        params.delete("page");
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      router.push(newUrl, { scroll: false });

      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  // Get result range text
  const getResultRange = () => {
    if (!pagination || total === 0) return "";
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);
    return `Showing ${start}-${end} of ${total} products`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Products
            </h1>
            {!isLoading && !error && total > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {getResultRange()}
              </p>
            )}
          </div>

          {/* Filters */}
          <ProductFilters categories={categories} />
        </div>

        {/* Loading State */}
        {(isLoading || isPending) && (
          <div className="space-y-8">
            {/* Loading Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: limit }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && !isPending && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to Load Products</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p>
                {error instanceof Error
                  ? error.message
                  : "An error occurred while fetching products"}
              </p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Products Grid */}
        {!isLoading && !isPending && !error && products.length > 0 && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center pt-4">
                <PaginationControls
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isPending && !error && products.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-100 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-semibold">No products found</p>
              <p className="text-sm text-muted-foreground max-w-md">
                {categoryId || search
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "There are currently no products available."}
              </p>
            </div>
            {(categoryId || search) && (
              <Button
                variant="outline"
                onClick={() => {
                  router.push(pathname);
                }}
              >
                Clear All Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center min-h-100">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Loading products...
                </p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
