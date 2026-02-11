"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useGeolocation } from "@/hooks/useGeolocation";
import { ordersApi } from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const geolocation = useGeolocation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    delivery_schedule: "siang",
    payment_method: "cod",
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.items.length === 0) {
      router.push("/cart");
    }
  }, [cart.items.length, router]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRequestGeolocation = () => {
    geolocation.requestLocation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.customer_name ||
      !formData.customer_phone ||
      !formData.customer_address
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        ...formData,
        latitude: geolocation.latitude || undefined,
        longitude: geolocation.longitude || undefined,
        items: cart.items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
        })),
      };

      const response = await ordersApi.create(orderPayload);
      const orderNumber = response.data.data.order_number;

      // Clear cart
      cart.clearCart();

      toast.success("Order placed successfully!");
      router.push(`/order-confirmation/${orderNumber}`);
    } catch (error: any) {
      console.error("Failed to create order:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to create order. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Customer Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Address *
                </label>
                <textarea
                  name="customer_address"
                  value={formData.customer_address}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Enter your full address"
                />
              </div>

              {/* Geolocation */}
              <div>
                <button
                  type="button"
                  onClick={handleRequestGeolocation}
                  disabled={geolocation.loading}
                  className="px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  {geolocation.loading
                    ? "Getting location..."
                    : "Get My Location"}
                </button>
                {geolocation.error && (
                  <p className="text-red-600 text-sm mt-2">
                    {geolocation.error}
                  </p>
                )}
                {geolocation.latitude && geolocation.longitude && (
                  <p className="text-green-600 text-sm mt-2">
                    ✓ Location obtained (Lat: {geolocation.latitude.toFixed(4)},
                    Lng: {geolocation.longitude.toFixed(4)})
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Schedule */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Delivery Schedule
            </h2>

            <div className="space-y-3">
              {[
                {
                  value: "pagi",
                  label: "Pagi (06:00 - 09:00)",
                  description: "Early morning delivery",
                },
                {
                  value: "siang",
                  label: "Siang (11:00 - 14:00)",
                  description: "Midday delivery",
                },
                {
                  value: "sore",
                  label: "Sore (17:00 - 20:00)",
                  description: "Evening delivery",
                },
              ].map((schedule) => (
                <label
                  key={schedule.value}
                  className="flex items-start gap-3 p-3 border border-gray-300 rounded cursor-pointer hover:bg-blue-50"
                >
                  <input
                    type="radio"
                    name="delivery_schedule"
                    value={schedule.value}
                    checked={formData.delivery_schedule === schedule.value}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {schedule.label}
                    </p>
                    <p className="text-sm text-gray-600">
                      {schedule.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Payment Method
            </h2>

            <div className="space-y-3">
              {[
                {
                  value: "cod",
                  label: "Cash on Delivery",
                  description: "Pay when order arrives",
                },
                {
                  value: "transfer",
                  label: "Bank Transfer",
                  description: "Transfer to bank account",
                },
                {
                  value: "ewallet",
                  label: "E-Wallet",
                  description: "Pay using e-wallet apps",
                },
              ].map((method) => (
                <label
                  key={method.value}
                  className="flex items-start gap-3 p-3 border border-gray-300 rounded cursor-pointer hover:bg-blue-50"
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={method.value}
                    checked={formData.payment_method === method.value}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {method.label}
                    </p>
                    <p className="text-sm text-gray-600">
                      {method.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link
              href="/cart"
              className="flex-1 border border-gray-300 text-gray-900 py-3 rounded-lg hover:bg-gray-50 transition text-center font-semibold"
            >
              Back to Cart
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-semibold"
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </form>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow p-6 h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Order Summary
          </h2>

          <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
            {cart.items.map((item) => (
              <div
                key={item.productId}
                className="flex justify-between text-sm"
              >
                <span className="text-gray-600">
                  {item.product.name} x {item.quantity}
                </span>
                <span className="font-semibold">
                  ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between mb-6 text-xl font-bold">
            <span>Total</span>
            <span>${cart.getTotalPrice().toFixed(2)}</span>
          </div>

          <div className="bg-blue-50 p-4 rounded text-sm text-gray-600">
            <p className="mb-2">
              <strong>Note:</strong> Your order will be pending approval. Once
              approved, your items will be shipped.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
