"use client";

import { useCartStore } from "@/store/cartStore";
import { useEffect } from "react";

export const useCart = () => {
  const cart = useCartStore();

  useEffect(() => {
    cart.initialize();
  }, []);

  return cart;
};
