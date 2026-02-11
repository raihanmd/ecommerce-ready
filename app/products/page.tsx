"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import { productsApi } from "@/lib/api";
import { Product } from "@/types";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const categorySlug = searchParams.get("category");
  const searchQuery = searchParams.get("search");
  const limit = 12;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await productsApi.getAll({
          page,
          limit,
          category_id: categorySlug,
          search: searchQuery,
        });

        setProducts(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, categorySlug, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
        {categorySlug && (
          <p className="text-gray-600">
            Category:{" "}
            <span className="font-semibold capitalize">
              {categorySlug.replace("-", " ")}
            </span>
          </p>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Products Grid */}
      {!loading && products.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
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
      {!loading && products.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-96 text-gray-500">
          <p className="text-xl mb-4">No products found</p>
          <p>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
