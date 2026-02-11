"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  FiLogOut,
  FiMenu,
  FiX,
  FiCheck,
  FiX as FiXMark,
  FiEye,
} from "react-icons/fi";
import Link from "next/link";
import toast from "react-hot-toast";

interface OrderItem {
  id: string;
  quantity: number;
  price_at_time: string;
  product: {
    id: string;
    name: string;
  };
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  delivery_schedule: string;
  payment_method: string;
  total_amount: string;
  status: string;
  created_at: string;
  order_items: OrderItem[];
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { admin, token, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!token || !admin) {
      router.push("/admin/login");
      return;
    }
    fetchOrders();
  }, [token, admin, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/admin/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        toast.success("Order approved");
        await fetchOrders();
        setShowModal(false);
      } else {
        toast.error("Failed to approve order");
      }
    } catch (error) {
      toast.error("Error approving order");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (orderId: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/reject`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        toast.success("Order rejected");
        await fetchOrders();
        setShowModal(false);
      } else {
        toast.error("Failed to reject order");
      }
    } catch (error) {
      toast.error("Error rejecting order");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800";
      case "DELIVERED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gradient-to-b from-slate-800 to-slate-900 text-white transition-all duration-300 fixed h-full z-10`}
      >
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          {sidebarOpen && <h2 className="font-bold text-xl">Admin</h2>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-700 rounded-lg transition"
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {[
            { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
            {
              label: "Orders",
              href: "/admin/orders",
              icon: "🛒",
              active: true,
            },
            { label: "Products", href: "/admin/products", icon: "📦" },
            { label: "Categories", href: "/admin/categories", icon: "📂" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                item.active
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-700 text-gray-300"
              }`}
            >
              <span>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-700 p-4">
          {sidebarOpen && (
            <div className="mb-4 pb-4 border-b border-slate-700">
              <p className="text-sm text-gray-400">Logged in as</p>
              <p className="font-semibold text-white truncate">
                {admin?.email}
              </p>
              <p className="text-xs text-blue-400">{admin?.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            <FiLogOut /> {sidebarOpen && "Logout"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`${sidebarOpen ? "ml-64" : "ml-20"} flex-1 overflow-auto`}
      >
        <div className="bg-white shadow-md p-6 sticky top-0 z-5">
          <h1 className="text-3xl font-bold text-gray-800">
            Orders Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage and approve/reject customer orders
          </p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Order Number
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-blue-600">
                        {order.order_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {order.customer_name}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                        ${parseFloat(order.total_amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            order.status,
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                        >
                          <FiEye /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Order {selectedOrder.order_number}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="text-2xl" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Customer Name</p>
                  <p className="font-semibold text-gray-800">
                    {selectedOrder.customer_name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Phone</p>
                  <p className="font-semibold text-gray-800">
                    {selectedOrder.customer_phone}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 text-sm">Address</p>
                  <p className="font-semibold text-gray-800">
                    {selectedOrder.customer_address}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Delivery Schedule</p>
                  <p className="font-semibold text-gray-800">
                    {selectedOrder.delivery_schedule}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Payment Method</p>
                  <p className="font-semibold text-gray-800">
                    {selectedOrder.payment_method}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-gray-500 text-sm mb-2">Items</p>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  {selectedOrder.order_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm text-gray-700"
                    >
                      <span>
                        {item.product.name} x {item.quantity}
                      </span>
                      <span className="font-medium">
                        $
                        {(
                          parseFloat(item.price_at_time) * item.quantity
                        ).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">
                    Total Amount
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${parseFloat(selectedOrder.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>

              {selectedOrder.status === "PENDING" && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleApprove(selectedOrder.id)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <FiCheck /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(selectedOrder.id)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    <FiXMark /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
