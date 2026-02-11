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
  product: Product;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  latitude?: string;
  longitude?: string;
  delivery_schedule: "pagi" | "siang" | "sore";
  payment_method: "cod" | "transfer" | "ewallet";
  total_amount: string;
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  order_items: OrderItem[];
  created_at: string;
  updated_at: string;
}
