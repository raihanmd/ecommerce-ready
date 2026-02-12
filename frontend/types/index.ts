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
