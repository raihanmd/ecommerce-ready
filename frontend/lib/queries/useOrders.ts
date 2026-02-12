import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, queryClient } from "../queryClient";
import { Order, CreateOrderPayload } from "@/types";

// Query keys for cache management
export const orderKeys = {
  all: ["orders"] as const,
  byNumber: (orderNumber: string) =>
    [...orderKeys.all, "byNumber", orderNumber] as const,
  admin: {
    all: ["orders", "admin", "all"] as const,
  },
};

// Fetch order by order number
const fetchOrderByNumber = async (orderNumber: string) => {
  const { data } = await apiClient.get(`/orders/${orderNumber}`);
  // Backend returns { payload: order }
  return data.payload || data;
};

// Create new order
const createOrder = async (payload: CreateOrderPayload) => {
  const { data } = await apiClient.post("/orders", payload);
  // Backend returns { payload: order }
  return data.payload || data;
};

// Fetch all orders (admin only)
const fetchAllOrders = async () => {
  const { data } = await apiClient.get("/orders/admin/all");
  // Backend returns { payload: [...orders] or { payload: { data: [...], pagination: {...} } } }
  return data.payload || data;
};

// Approve order (admin only)
const approveOrder = async (orderId: string) => {
  const { data } = await apiClient.patch(`/orders/${orderId}/approve`);
  // Backend returns { payload: order }
  return data.payload || data;
};

// Reject order (admin only)
const rejectOrder = async (orderId: string) => {
  const { data } = await apiClient.patch(`/orders/${orderId}/reject`);
  // Backend returns { payload: order }
  return data.payload || data;
};

// Update order status (admin only)
const updateOrderStatus = async (orderId: string, status: string) => {
  const { data } = await apiClient.patch(`/orders/${orderId}/status`, {
    status,
  });
  // Backend returns { payload: order }
  return data.payload || data;
};

// Hook to fetch order by order number
export const useOrderByNumber = (orderNumber: string | null) => {
  return useQuery({
    queryKey: orderKeys.byNumber(orderNumber || ""),
    queryFn: () => fetchOrderByNumber(orderNumber!),
    enabled: !!orderNumber,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to create order
export const useCreateOrder = () => {
  return useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      if (data?.order_number) {
        queryClient.setQueryData(orderKeys.byNumber(data.order_number), data);
      }
    },
  });
};

// Hook to fetch all orders (admin)
export const useAllOrders = (enabled = false) => {
  return useQuery({
    queryKey: orderKeys.admin.all,
    queryFn: fetchAllOrders,
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes for admin data
  });
};

// Hook to approve order
export const useApproveOrder = () => {
  return useMutation({
    mutationFn: approveOrder,
    onSuccess: () => {
      // Invalidate admin orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.admin.all });
    },
  });
};

// Hook to reject order
export const useRejectOrder = () => {
  return useMutation({
    mutationFn: rejectOrder,
    onSuccess: () => {
      // Invalidate admin orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.admin.all });
    },
  });
};

// Hook to update order status
export const useUpdateOrderStatus = () => {
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      // Invalidate admin orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.admin.all });
    },
  });
};
