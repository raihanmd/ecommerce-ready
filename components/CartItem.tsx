"use client";

import Image from "next/image";
import { CartItem as CartItemType } from "@/types";
import { useCart } from "@/hooks/useCart";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const cart = useCart();

  const handleIncrease = () => {
    if (item.quantity < item.product.stock) {
      cart.updateQuantity(item.productId, item.quantity + 1);
    } else {
      toast.error("Insufficient stock");
    }
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      cart.updateQuantity(item.productId, item.quantity - 1);
    } else {
      cart.removeItem(item.productId);
    }
  };

  const handleRemove = () => {
    cart.removeItem(item.productId);
    toast.success("Item removed from cart");
  };

  const subtotal = parseFloat(item.product.price) * item.quantity;

  return (
    <div className="flex gap-4 border-b border-gray-200 py-4">
      {/* Product Image */}
      <div className="relative w-24 h-24 bg-gray-100 rounded shrink-0">
        {item.product.image_url ? (
          <Image
            src={item.product.image_url}
            alt={item.product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="grow">
        <h3 className="font-semibold text-gray-900 mb-1">
          {item.product.name}
        </h3>
        <p className="text-blue-600 font-bold mb-3">
          ${parseFloat(item.product.price).toFixed(2)}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={handleDecrease}
            className="p-1 border border-gray-300 rounded hover:bg-gray-100"
          >
            <FaMinus className="text-sm" />
          </button>
          <span className="text-sm font-semibold w-8 text-center">
            {item.quantity}
          </span>
          <button
            onClick={handleIncrease}
            className="p-1 border border-gray-300 rounded hover:bg-gray-100"
          >
            <FaPlus className="text-sm" />
          </button>
        </div>

        <p className="text-sm text-gray-500">
          Subtotal: ${subtotal.toFixed(2)}
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        className="text-red-600 hover:text-red-700 transition p-2"
      >
        <FaTrash className="text-lg" />
      </button>
    </div>
  );
}
