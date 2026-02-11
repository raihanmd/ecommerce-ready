"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  FiLogOut,
  FiMenu,
  FiX,
  FiPlus,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import Link from "next/link";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count?: {
    products: number;
  };
  created_at: string;
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { admin, token, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!token || !admin) {
      router.push("/admin/login");
      return;
    }
    fetchCategories();
  }, [token, admin, router]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/categories`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Please fill in category name");
      return;
    }

    setActionLoading(true);
    try {
      const url = editingCategory
        ? `${process.env.NEXT_PUBLIC_API_URL}/categories/${editingCategory.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/categories`;

      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          editingCategory ? "Category updated" : "Category created",
        );
        setShowModal(false);
        setEditingCategory(null);
        setFormData({ name: "", description: "" });
        await fetchCategories();
      } else {
        toast.error("Failed to save category");
      }
    } catch (error) {
      toast.error("Error saving category");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        toast.success("Category deleted");
        await fetchCategories();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to delete category");
      }
    } catch (error) {
      toast.error("Error deleting category");
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
            { label: "Orders", href: "/admin/orders", icon: "🛒" },
            { label: "Products", href: "/admin/products", icon: "📦" },
            {
              label: "Categories",
              href: "/admin/categories",
              icon: "📂",
              active: true,
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
        <div className="bg-white shadow-md p-6 sticky top-0 z-5 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Categories Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Organize products into categories
            </p>
          </div>
          <button
            onClick={() => {
              setEditingCategory(null);
              setFormData({ name: "", description: "" });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <FiPlus /> New Category
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 mb-4">No categories found</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create First Category
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {category.description || "No description"}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-gray-500">
                      {category._count?.products || 0} products
                    </span>
                    <span className="text-xs text-gray-400">
                      {category.slug}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                    >
                      <FiEdit2 className="text-sm" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                    >
                      <FiTrash2 className="text-sm" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingCategory ? "Edit Category" : "Create Category"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Category Name *"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                rows={3}
              />

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {actionLoading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
