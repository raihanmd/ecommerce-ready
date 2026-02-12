import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, queryClient } from "../queryClient";
import { Product } from "@/types";

// ============ PRODUCTS ============

export const useAdminProducts = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ["admin", "products", { page, limit }],
    queryFn: async () => {
      const { data } = await apiClient.get("/products", {
        params: { page, limit },
      });
      // Backend returns { payload: { data: [...], pagination: {...} } }
      return data.payload || data;
    },
  });
};

export const useCreateProduct = () => {
  return useMutation({
    mutationFn: async (payload: Partial<Product>) => {
      const { data } = await apiClient.post("/products", payload);
      // Backend returns { payload: product }
      return data.payload || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
};

export const useUpdateProduct = () => {
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: { id: string } & Partial<Product>) => {
      const { data } = await apiClient.put(`/products/${id}`, payload);
      // Backend returns { payload: product }
      return data.payload || data;
    },
    onSuccess: (responseData: Product) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.setQueryData(["product", responseData.slug], responseData);
    },
  });
};

export const useDeleteProduct = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/products/${id}`);
      // Backend returns { payload: product }
      return data.payload || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
};

// ============ CATEGORIES ============

export const useAdminCategories = () => {
  return useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { data } = await apiClient.get("/categories");
      // Backend returns { payload: [...categories] }
      return data.payload || data;
    },
  });
};

export const useCreateCategory = () => {
  return useMutation({
    mutationFn: async (payload: { name: string; description?: string }) => {
      const { data } = await apiClient.post("/categories", payload);
      // Backend returns { payload: category }
      return data.payload || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useUpdateCategory = () => {
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: { id: string } & { name?: string; description?: string }) => {
      const { data } = await apiClient.put(`/categories/${id}`, payload);
      // Backend returns { payload: category }
      return data.payload || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useDeleteCategory = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/categories/${id}`);
      // Backend returns { payload: category }
      return data.payload || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

// ============ ORDERS ============

export const useAdminOrders = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ["admin", "orders", { page, limit }],
    queryFn: async () => {
      const { data } = await apiClient.get("/orders/admin/all");
      // Backend returns { payload: [...orders] or { payload: { data: [...], pagination: {...} } } }
      return data.payload || data;
    },
  });
};

export const useApproveOrderAdmin = () => {
  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data } = await apiClient.patch(`/orders/${orderId}/approve`);
      // Backend returns { payload: order }
      return data.payload || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
};

export const useRejectOrderAdmin = () => {
  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data } = await apiClient.patch(`/orders/${orderId}/reject`);
      // Backend returns { payload: order }
      return data.payload || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
};

export const useUpdateOrderStatusAdmin = () => {
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: string;
    }) => {
      const { data } = await apiClient.patch(`/orders/${orderId}/status`, {
        status,
      });
      // Backend returns { payload: order }
      return data.payload || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
};
