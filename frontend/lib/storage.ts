import { CartItem } from "@/types";

export const saveCartToLocalStorage = (items: CartItem[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(items));
  }
};

export const getCartFromLocalStorage = (): CartItem[] => {
  if (typeof window !== "undefined") {
    const cart = localStorage.getItem("cart");
    return cart ? JSON.parse(cart) : [];
  }
  return [];
};

export const clearCartFromLocalStorage = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("cart");
  }
};
