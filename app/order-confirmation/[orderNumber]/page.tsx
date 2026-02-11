"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ordersApi } from "@/lib/api";
import { Order } from "@/types";
import { FaCheckCircle } from "react-icons/fa";

interface OrderConfirmationPageProps {
  params: {
    orderNumber: string;
  };
}

export default function OrderConfirmationPage({
  params,
}: OrderConfirmationPageProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const response = await ordersApi.getByOrderNumber(params.orderNumber);
        setOrder(response.data.data);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.orderNumber]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-gray-600 text-center">Order not found</p>
      </div>
    );
  }

  const deliveryScheduleLabels: Record<string, string> = {
    pagi: "Pagi (06:00 - 09:00)",
    siang: "Siang (11:00 - 14:00)",
    sore: "Sore (17:00 - 20:00)",
  };

  const paymentMethodLabels: Record<string, string> = {
    cod: "Cash on Delivery",
    transfer: "Bank Transfer",
    ewallet: "E-Wallet",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Success Message */}
      <div className="text-center mb-12">
        <FaCheckCircle className="text-6xl text-green-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Order Confirmed!
        </h1>
        <p className="text-xl text-gray-600">Thank you for your order</p>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-lg shadow p-8 mb-8">
        <div className="grid md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Order Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-600 text-sm">Order Number</p>
                <p className="text-lg font-mono font-semibold text-gray-900">
                  {order.order_number}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Order Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(order.created_at).toLocaleDateString()} at{" "}
                  {new Date(order.created_at).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Status</p>
                <p className="text-lg font-semibold">
                  <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded">
                    {order.status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Total Amount
            </h3>
            <p className="text-4xl font-bold text-blue-600 mb-4">
              ${parseFloat(order.total_amount).toFixed(2)}
            </p>
            <div className="bg-blue-50 p-4 rounded text-sm text-gray-600">
              <p>
                <strong>Status:</strong> Your order is awaiting owner approval.
                You will receive a notification once it's approved.
              </p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Delivery Information
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 text-sm mb-1">Customer Name</p>
              <p className="font-semibold text-gray-900">
                {order.customer_name}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Phone Number</p>
              <p className="font-semibold text-gray-900">
                {order.customer_phone}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-600 text-sm mb-1">Address</p>
              <p className="font-semibold text-gray-900">
                {order.customer_address}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Delivery Schedule</p>
              <p className="font-semibold text-gray-900">
                {deliveryScheduleLabels[order.delivery_schedule]}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Payment Method</p>
              <p className="font-semibold text-gray-900">
                {paymentMethodLabels[order.payment_method]}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Order Items
          </h3>
          <div className="space-y-3">
            {order.order_items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {item.product.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity} × $
                    {parseFloat(item.price_at_time).toFixed(2)}
                  </p>
                </div>
                <p className="font-semibold text-gray-900">
                  ${(parseFloat(item.price_at_time) * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="flex justify-between text-lg font-bold text-gray-900 pt-4 border-t border-gray-200">
          <span>Total</span>
          <span className="text-blue-600">
            ${parseFloat(order.total_amount).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Location Info */}
      {order.latitude && order.longitude && (
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-2">
            Geolocation Recorded
          </h3>
          <p className="text-gray-600">
            Latitude: {order.latitude} | Longitude: {order.longitude}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Link
          href="/"
          className="flex-1 border border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 transition text-center font-semibold"
        >
          Continue Shopping
        </Link>
      </div>

      {/* Next Steps */}
      <div className="mt-12 pt-12 border-t border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">What's Next?</h3>
        <div className="space-y-4 text-gray-600">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              1
            </div>
            <p>Your order is now pending approval from the store owner</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              2
            </div>
            <p>You will receive a notification once your order is approved</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              3
            </div>
            <p>
              Your items will be shipped according to your selected delivery
              schedule and payment method
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
