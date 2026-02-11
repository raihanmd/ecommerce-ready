"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import CartItem from "@/components/CartItem";
import { FaShoppingCart } from "react-icons/fa";

export default function CartPage() {
  const cart = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-center justify-center min-h-96 text-center">
          <FaShoppingCart className="text-6xl text-gray-300 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-gray-600 mb-8">
            Add some products to your cart to get started!
          </p>
          <Link
            href="/products"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="md:col-span-2 bg-white rounded-lg shadow">
          <div className="p-6">
            {cart.items.map((item) => (
              <CartItem key={item.productId} item={item} />
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow p-6 h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Order Summary
          </h2>

          <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">
                ${cart.getTotalPrice().toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-semibold">TBD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="font-semibold">TBD</span>
            </div>
          </div>

          <div className="flex justify-between mb-6 text-xl font-bold">
            <span>Total</span>
            <span>${cart.getTotalPrice().toFixed(2)}</span>
          </div>

          <Link
            href="/checkout"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition text-center font-semibold mb-3"
          >
            Proceed to Checkout
          </Link>

          <Link
            href="/products"
            className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 transition text-center font-semibold"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
