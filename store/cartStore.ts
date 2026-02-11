"use client";

import { create } from "zustand";
import { CartItem, Product } from "@/types";
import {
  saveCartToLocalStorage,
  getCartFromLocalStorage,
  clearCartFromLocalStorage,
} from "@/lib/storage";

interface CartStore {
  items: CartItem[];
  initialize: () => void;
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  initialize: () => {
    const savedCart = getCartFromLocalStorage();
    set({ items: savedCart });
  },

  addItem: (product: Product, quantity: number) => {
    set((state) => {
      const existingItem = state.items.find(
        (item) => item.productId === product.id,
      );

      let newItems: CartItem[];
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          console.warn(`Insufficient stock for ${product.name}`);
          return state;
        }
        newItems = state.items.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: newQuantity }
            : item,
        );
      } else {
        if (quantity > product.stock) {
          console.warn(`Insufficient stock for ${product.name}`);
          return state;
        }
        newItems = [
          ...state.items,
          { productId: product.id, quantity, product },
        ];
      }

      saveCartToLocalStorage(newItems);
      return { items: newItems };
    });
  },

  removeItem: (productId: string) => {
    set((state) => {
      const newItems = state.items.filter(
        (item) => item.productId !== productId,
      );
      saveCartToLocalStorage(newItems);
      return { items: newItems };
    });
  },

  updateQuantity: (productId: string, quantity: number) => {
    set((state) => {
      if (quantity <= 0) {
        return (get().removeItem(productId), state);
      }

      const item = state.items.find((i) => i.productId === productId);
      if (!item) return state;

      if (quantity > item.product.stock) {
        console.warn(`Insufficient stock for ${item.product.name}`);
        return state;
      }

      const newItems = state.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      );

      saveCartToLocalStorage(newItems);
      return { items: newItems };
    });
  },

  clearCart: () => {
    clearCartFromLocalStorage();
    set({ items: [] });
  },

  getTotalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce(
      (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
      0,
    );
  },
}));
