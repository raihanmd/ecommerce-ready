import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, queryClient } from "../queryClient";
import { Order, CreateOrderPayload, InitiatePaymentResponse, Payment } from "@/types";

// Query keys
export const orderKeys = {
  all: ["orders"] as const,
  byNumber: (orderNumber: string) =>
    [...orderKeys.all, "byNumber", orderNumber] as const,
  paymentStatus: (orderId: string) =>
    ["payment", "status", orderId] as const,
  admin: {
    all: ["orders", "admin", "all"] as const,
  },
};

// Fetch order by order number
const fetchOrderByNumber = async (orderNumber: string): Promise<Order> => {
  const { data } = await apiClient.get(`/orders/${orderNumber}`);
  return data.payload || data;
};

// Create new order
const createOrder = async (payload: CreateOrderPayload): Promise<Order> => {
  const { data } = await apiClient.post("/orders", payload);
  return data.payload || data;
};

const initiatePayment = async (orderId: string): Promise<InitiatePaymentResponse> => {
  const { data } = await apiClient.post(`/payment/initiate/${orderId}`);
  return data.payload || data;
};

const fetchPaymentStatus = async (orderId: string): Promise<Payment> => {
  const { data } = await apiClient.get(`/payment/status/${orderId}`);
  return data.payload || data;
};

// Fetch all orders (admin)
const fetchAllOrders = async () => {
  const { data } = await apiClient.get("/orders/admin/all");
  return data.payload || data;
};

const approveOrder = async (orderId: string) => {
  const { data } = await apiClient.patch(`/orders/${orderId}/approve`);
  return data.payload || data;
};

const rejectOrder = async (orderId: string) => {
  const { data } = await apiClient.patch(`/orders/${orderId}/reject`);
  return data.payload || data;
};

const updateOrderStatus = async (orderId: string, status: string) => {
  const { data } = await apiClient.patch(`/orders/${orderId}/status`, { status });
  return data.payload || data;
};

// ─── Hooks ────────────────────────────────────────────────────

export const useOrderByNumber = (orderNumber: string | null) => {
  return useQuery({
    queryKey: orderKeys.byNumber(orderNumber || ""),
    queryFn: () => fetchOrderByNumber(orderNumber!),
    enabled: !!orderNumber,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      if (data?.order_number) {
        queryClient.setQueryData(orderKeys.byNumber(data.order_number), data);
      }
    },
  });
};

export const useInitiatePayment = () => {
  return useMutation({
    mutationFn: initiatePayment,
  });
};

// Polling aktif hanya saat enabled=true (setelah Snap popup dibuka)
export const usePaymentStatus = (orderId: string | null, enabled = false) => {
  return useQuery({
    queryKey: orderKeys.paymentStatus(orderId || ""),
    queryFn: () => fetchPaymentStatus(orderId!),
    enabled: !!orderId && enabled,
    // Refetch setiap 3 detik untuk polling webhook result
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 3000;
      // Stop polling jika sudah terminal status
      const terminalStatuses = ["SETTLEMENT", "CANCEL", "EXPIRE", "FAILURE", "DENY"];
      if (terminalStatuses.includes(data.status)) return false;
      return 3000;
    },
    refetchIntervalInBackground: false,
    staleTime: 0,
  });
};

export const useAllOrders = (enabled = false) => {
  return useQuery({
    queryKey: orderKeys.admin.all,
    queryFn: fetchAllOrders,
    enabled,
    staleTime: 2 * 60 * 1000,
  });
};

export const useApproveOrder = () => {
  return useMutation({
    mutationFn: approveOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.admin.all });
    },
  });
};

export const useRejectOrder = () => {
  return useMutation({
    mutationFn: rejectOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.admin.all });
    },
  });
};

export const useUpdateOrderStatus = () => {
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.admin.all });
    },
  });
};