import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../queryClient";
import { Category } from "@/types";

export const CATEGORIES_QUERY_KEY = ["categories"];

export const useCategories = () => {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async (): Promise<Category[]> => {
      try {
        const response = await apiClient.get<{ payload: Category[] }>(
          "/categories",
        );
        console.log("useCategories response:", response.data);
        return response.data.payload || [];
      } catch (error: unknown) {
        console.error("useCategories error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch categories";
        throw new Error(errorMessage);
      }
    },
  });
};

export const useCategoryBySlug = (slug: string | null) => {
  return useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, slug],
    queryFn: async (): Promise<Category & { products: unknown[] }> => {
      try {
        const response = await apiClient.get<{
          payload: Category & { products: unknown[] };
        }>(`/categories/${slug}`);
        console.log("useCategoryBySlug response:", response.data);
        return response.data.payload;
      } catch (error: unknown) {
        console.error("useCategoryBySlug error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch category";
        throw new Error(errorMessage);
      }
    },
    enabled: !!slug,
  });
};
