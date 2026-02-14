import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../queryClient";

// ============ ANALYTICS ============
export const useAnalytics = () => {
  return useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/analytics"); // ✅ Fixed endpoint
      return data.payload || data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Auto-refresh every 5 minutes
  });
};

// ============ PRODUCTS ============
export const useAdminProducts = (page = 1, limit = 50) => {
  return useQuery({
    queryKey: ["admin", "products", page, limit],
    queryFn: async () => {
      const { data } = await apiClient.get("/products", {
        params: { page, limit },
      });
      return data.payload || data;
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await apiClient.post("/products", payload);
      return data.payload || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & any) => {
      const { data } = await apiClient.put(`/products/${id}`, payload);
      return data.payload || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/products/${id}`);
      return data.payload || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// ============ CATEGORIES ============
export const useAdminCategories = () => {
  return useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { data } = await apiClient.get("/categories");
      return data.payload || data;
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name: string; description?: string }) => {
      const { data } = await apiClient.post("/categories", payload);
      return data.payload || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & any) => {
      const { data } = await apiClient.put(`/categories/${id}`, payload);
      return data.payload || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/categories/${id}`);
      return data.payload || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

// ============ ORDERS ============
export const useAdminOrders = () => {
  return useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const { data } = await apiClient.get("/orders/admin/all");
      return data.payload || data;
    },
    refetchInterval: 1000 * 30, // Auto-refresh every 30 seconds
  });
};

export const useApproveOrderAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data } = await apiClient.patch(`/orders/${orderId}/approve`);
      return data.payload || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
    },
  });
};

export const useRejectOrderAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data } = await apiClient.patch(`/orders/${orderId}/reject`);
      return data.payload || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
    },
  });
};

export const useUpdateOrderStatusAdmin = () => {
  const queryClient = useQueryClient();

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
      return data.payload || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
};
