"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  FiLogOut,
  FiMenu,
  FiX,
  FiBarChart3,
  FiPackage,
  FiShoppingCart,
  FiTrendingUp,
} from "react-icons/fi";
import Link from "next/link";

interface Analytics {
  totalOrders: number;
  totalProducts: number;
  totalCategories: number;
  totalRevenue: number;
  pendingOrders: number;
  approvedOrders: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { admin, token, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    if (!token || !admin) {
      router.push("/admin/login");
      return;
    }

    // Fetch analytics
    fetchAnalytics();
  }, [token, admin, router]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/analytics`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: string;
  }) => (
    <div
      className="bg-white rounded-lg shadow-md p-6 border-l-4"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <div style={{ color }}>{Icon}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gradient-to-b from-slate-800 to-slate-900 text-white transition-all duration-300 fixed h-full z-10`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          {sidebarOpen && <h2 className="font-bold text-xl">Admin</h2>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-700 rounded-lg transition"
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {[
            {
              label: "Dashboard",
              icon: <FiBarChart3 />,
              href: "/admin/dashboard",
              active: true,
            },
            {
              label: "Orders",
              icon: <FiShoppingCart />,
              href: "/admin/orders",
            },
            {
              label: "Products",
              icon: <FiPackage />,
              href: "/admin/products",
            },
            {
              label: "Categories",
              icon: <FiTrendingUp />,
              href: "/admin/categories",
            },
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
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Profile & Logout */}
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
        {/* Header */}
        <div className="bg-white shadow-md p-6 flex items-center justify-between sticky top-0 z-5">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              Welcome back, {admin?.name}
            </p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={<FiShoppingCart className="text-2xl" />}
                  label="Total Orders"
                  value={analytics.totalOrders}
                  color="#3b82f6"
                />
                <StatCard
                  icon={<FiTrendingUp className="text-2xl" />}
                  label="Total Revenue"
                  value={`$${analytics.totalRevenue.toLocaleString()}`}
                  color="#10b981"
                />
                <StatCard
                  icon={<FiPackage className="text-2xl" />}
                  label="Total Products"
                  value={analytics.totalProducts}
                  color="#f59e0b"
                />
                <StatCard
                  icon={<FiBarChart3 className="text-2xl" />}
                  label="Total Categories"
                  value={analytics.totalCategories}
                  color="#8b5cf6"
                />
              </div>

              {/* Orders Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Order Status
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          Pending
                        </span>
                        <span className="text-2xl font-bold text-yellow-600">
                          {analytics.pendingOrders}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{
                            width: `${(analytics.pendingOrders / analytics.totalOrders) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          Approved
                        </span>
                        <span className="text-2xl font-bold text-green-600">
                          {analytics.approvedOrders}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${(analytics.approvedOrders / analytics.totalOrders) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <Link
                      href="/admin/orders"
                      className="block px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition"
                    >
                      View All Orders
                    </Link>
                    <Link
                      href="/admin/products"
                      className="block px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg font-medium transition"
                    >
                      Manage Products
                    </Link>
                    <Link
                      href="/admin/categories"
                      className="block px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-medium transition"
                    >
                      Manage Categories
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Failed to load analytics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
