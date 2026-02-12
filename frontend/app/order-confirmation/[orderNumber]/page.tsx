"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useOrderByNumber } from "@/lib/queries/useOrders";
import { FaCheckCircle } from "react-icons/fa";

interface OrderConfirmationPageProps {
  params: {
    orderNumber: string;
  };
}

export default function OrderConfirmationPage({
  params,
}: OrderConfirmationPageProps) {
  const {
    data: order,
    isLoading,
    error,
  } = useOrderByNumber(params.orderNumber);

  useEffect(() => {
    // Show success toast only once
    if (order) {
      // This effect runs when order is successfully loaded
    }
  }, [order]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-2">
            Order Not Found
          </h2>
          <p className="text-red-700 mb-6">
            {error instanceof Error
              ? error.message
              : "We couldn't find your order. Please check the order number and try again."}
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
            >
              Go Home
            </Link>
            <Link
              href="/products"
              className="border border-red-600 text-red-600 px-6 py-2 rounded hover:bg-red-50 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
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

  const statusColors: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: "bg-yellow-100", text: "text-yellow-800" },
    APPROVED: { bg: "bg-green-100", text: "text-green-800" },
    SHIPPED: { bg: "bg-blue-100", text: "text-blue-800" },
    DELIVERED: { bg: "bg-green-100", text: "text-green-800" },
    REJECTED: { bg: "bg-red-100", text: "text-red-800" },
    CANCELLED: { bg: "bg-gray-100", text: "text-gray-800" },
  };

  const currentStatusColor = statusColors[order.status] || statusColors.PENDING;

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
                <p className="text-lg font-mono font-semibold text-gray-900 break-all">
                  {order.order_number}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Order Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(order.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  at{" "}
                  {new Date(order.created_at).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Status</p>
                <p className="text-lg font-semibold">
                  <span
                    className={`inline-block ${currentStatusColor.bg} ${currentStatusColor.text} px-3 py-1 rounded`}
                  >
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
            {order.status === "PENDING" && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded text-sm text-yellow-800">
                <p>
                  <strong>Awaiting Approval:</strong> Your order is pending
                  owner approval. You will receive a notification once it's
                  approved.
                </p>
              </div>
            )}
            {order.status === "APPROVED" && (
              <div className="bg-green-50 border border-green-200 p-4 rounded text-sm text-green-800">
                <p>
                  <strong>Order Approved:</strong> Your order has been approved
                  and will be shipped soon.
                </p>
              </div>
            )}
            {order.status === "SHIPPED" && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded text-sm text-blue-800">
                <p>
                  <strong>On the Way:</strong> Your order is on its way to you!
                </p>
              </div>
            )}
            {order.status === "DELIVERED" && (
              <div className="bg-green-50 border border-green-200 p-4 rounded text-sm text-green-800">
                <p>
                  <strong>Delivered:</strong> Your order has been successfully
                  delivered!
                </p>
              </div>
            )}
            {order.status === "REJECTED" && (
              <div className="bg-red-50 border border-red-200 p-4 rounded text-sm text-red-800">
                <p>
                  <strong>Order Rejected:</strong> Unfortunately, your order was
                  rejected. Please contact support for more information.
                </p>
              </div>
            )}
            {order.status === "CANCELLED" && (
              <div className="bg-gray-50 border border-gray-200 p-4 rounded text-sm text-gray-800">
                <p>
                  <strong>Order Cancelled:</strong> This order has been
                  cancelled.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Information */}
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
            {order.order_items && order.order_items.length > 0 ? (
              order.order_items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {item.product?.name || "Product"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} × $
                      {parseFloat(item.price_at_time).toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    $
                    {(parseFloat(item.price_at_time) * item.quantity).toFixed(
                      2,
                    )}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center py-4">
                No items in this order
              </p>
            )}
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-2">
            📍 Geolocation Recorded
          </h3>
          <p className="text-gray-700 font-mono text-sm">
            <span className="block">Latitude: {order.latitude}</span>
            <span className="block">Longitude: {order.longitude}</span>
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Link
          href="/"
          className="flex-1 border border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 transition text-center font-semibold"
        >
          Home
        </Link>
        <Link
          href="/products"
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition text-center font-semibold"
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
            <div>
              <p className="font-semibold text-gray-900">Order Review</p>
              <p className="text-sm">
                Your order is pending approval from the store owner
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                Approval Notification
              </p>
              <p className="text-sm">
                You will be notified once your order is approved
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <p className="font-semibold text-gray-900">Shipment</p>
              <p className="text-sm">
                Your items will be shipped according to your selected delivery
                Schedule and payment method
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div>
              <p className="font-semibold text-gray-900">Delivery</p>
              <p className="text-sm">
                Receive your order at your doorstep during the selected time
                slot
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
