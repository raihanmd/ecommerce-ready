export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: string;
  stock: number;
  image_url?: string;
  category_id: string;
  category?: Category;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_time: string;
  product?: Product;
  created_at: string;
  updated_at: string;
}

export enum OrderStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum DeliverySchedule {
  PAGI = "pagi",
  SIANG = "siang",
  SORE = "sore",
}

export enum PaymentMethod {
  COD = "cod",
  TRANSFER = "transfer",
  EWALLET = "ewallet",
  MIDTRANS = "midtrans",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  CAPTURE = "CAPTURE",
  SETTLEMENT = "SETTLEMENT",
  DENY = "DENY",
  CANCEL = "CANCEL",
  EXPIRE = "EXPIRE",
  FAILURE = "FAILURE",
}

export interface Payment {
  id: string;
  order_id: string;
  snap_token: string | null;
  snap_redirect_url: string | null;
  midtrans_order_id: string;
  transaction_id: string | null;
  payment_type: string | null;
  status: PaymentStatus;
  gross_amount: string;
  fraud_status: string | null;
  status_code: string | null;
  expiry_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface InitiatePaymentResponse {
  snap_token: string;
  redirect_url: string;
  payment_id: string;
  expires_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  latitude?: string;
  longitude?: string;
  delivery_schedule: DeliverySchedule;
  payment_method: PaymentMethod;
  total_amount: string;
  status: OrderStatus;
  order_items?: OrderItem[];
  payment?: Payment; // ✅ relasi payment
  created_at: string;
  updated_at: string;
}

export interface CreateOrderPayload {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  latitude?: number;
  longitude?: number;
  delivery_schedule: DeliverySchedule;
  payment_method: PaymentMethod;
  items: Array<{
    product_id: string;
    quantity: number;
  }>;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  timestamp?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  created_at: string;
  updated_at: string;
}

export interface AuthPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
