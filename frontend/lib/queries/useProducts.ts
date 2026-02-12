import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/queryClient";
import { Product } from "@/types";

export interface ProductsResponse {
  payload: {
    data: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ProductDetailsResponse {
  payload: Product;
}

export interface StockCheckResponse {
  payload: {
    hasStock: boolean;
  };
}

interface UseProductsParams {
  page?: number;
  limit?: number;
  category_id?: string;
  search?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ProcessedProductsResponse {
  data: Product[];
  pagination: PaginationInfo;
}

export const useProducts = ({
  page = 1,
  limit = 12,
  category_id,
  search,
}: UseProductsParams = {}) => {
  return useQuery<ProcessedProductsResponse, Error>({
    queryKey: ["products", { page, limit, category_id, search }],
    queryFn: async () => {
      try {
        const response = await apiClient.get<ProductsResponse>("/products", {
          params: {
            page,
            limit,
            ...(category_id && { category_id }),
            ...(search && { search }),
          },
        });
        console.log("useProducts response:", response.data);

        // Backend returns { payload: { data: [...], pagination: {...} } }
        const { payload } = response.data;

        if (!payload) {
          throw new Error("Invalid response structure");
        }

        return {
          data: payload.data || [],
          pagination: payload.pagination,
        };
      } catch (err) {
        console.error("useProducts error:", err);
        throw err;
      }
    },
    enabled: true,
  });
};

export const useProductDetail = (slug: string) => {
  return useQuery<Product, Error>({
    queryKey: ["product", slug],
    queryFn: async () => {
      try {
        const response = await apiClient.get<ProductDetailsResponse>(
          `/products/detail/${slug}`,
        );
        console.log("useProductDetail response:", response.data);
        return response.data.payload;
      } catch (err) {
        console.error("useProductDetail error:", err);
        throw err;
      }
    },
    enabled: !!slug,
  });
};

export const useCheckStock = (productId: string, quantity: number) => {
  return useQuery<boolean, Error>({
    queryKey: ["stock-check", productId, quantity],
    queryFn: async () => {
      try {
        const response = await apiClient.get<StockCheckResponse>(
          `/products/stock-check/${productId}`,
          {
            params: { quantity },
          },
        );
        console.log("useCheckStock response:", response.data);
        return response.data.payload.hasStock;
      } catch (err) {
        console.error("useCheckStock error:", err);
        throw err;
      }
    },
    enabled: !!productId && quantity > 0,
    staleTime: 1000 * 60,
  });
};

export const usePrefetchProduct = () => {
  const queryClient = useQueryClient();

  return (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: ["product", slug],
      queryFn: async () => {
        const response = await apiClient.get<ProductDetailsResponse>(
          `/products/detail/${slug}`,
        );
        return response.data.payload;
      },
    });
  };
};
