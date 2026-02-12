"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import { useProducts } from "@/lib/queries/useProducts";
import { Product } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);

  const categorySlug = searchParams.get("category");
  const searchQuery = searchParams.get("search");
  const limit = 12;

  const { data, isLoading, error } = useProducts({
    page,
    limit,
    category_id: categorySlug || undefined,
    search: searchQuery || undefined,
  });

  const products = data?.data || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;

  // Debug logging
  console.log("Products page - data:", data);
  console.log("Products page - products array:", products);
  console.log("Products page - isLoading:", isLoading);
  console.log("Products page - error:", error);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Products</h1>
        {categorySlug && (
          <p className="text-muted-foreground">
            Category:{" "}
            <span className="font-semibold capitalize">
              {categorySlug.replace("-", " ")}
            </span>
          </p>
        )}
        {searchQuery && (
          <p className="text-muted-foreground">
            Search: <span className="font-semibold">{searchQuery}</span>
          </p>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center min-h-96">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to Load Products</AlertTitle>
          <AlertDescription className="mt-2">
            {error instanceof Error
              ? error.message
              : "An error occurred while fetching products"}
          </AlertDescription>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            Try Again
          </Button>
        </Alert>
      )}

      {/* Products Grid */}
      {!isLoading && !error && products.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {products.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && !error && products.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-96 text-muted-foreground">
          <p className="text-xl mb-4">No products found</p>
          <p>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
