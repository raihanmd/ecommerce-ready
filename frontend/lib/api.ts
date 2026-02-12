import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export const categoriesApi = {
  getAll: () => api.get("/categories"),
  getBySlug: (slug: string) => api.get(`/categories/${slug}`),
};

export const productsApi = {
  getAll: (params: any) => api.get("/products", { params }),
  getBySlug: (slug: string) => api.get(`/products/${slug}`),
  checkStock: (id: string, quantity: number) =>
    api.get(`/products/${id}/check-stock`, { params: { quantity } }),
};

export const ordersApi = {
  create: (data: any) => api.post("/orders", data),
  getByOrderNumber: (orderNumber: string) => api.get(`/orders/${orderNumber}`),
};

export default api;
