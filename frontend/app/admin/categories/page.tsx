"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/lib/queries/useAdmin";
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
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Category } from "@/types";

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { admin, logout } = useAuthStore();
  useAdminAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const { data: categories = [], isLoading, error } = useAdminCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
      });
    }
    setShowModal(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (editingCategory) {
      updateMutation.mutate(
        { id: editingCategory.id, ...formData },
        {
          onSuccess: () => {
            toast.success("Category updated successfully");
            setShowModal(false);
          },
          onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update");
          },
        },
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          toast.success("Category created successfully");
          setShowModal(false);
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to create");
        },
      });
    }
  };

  const handleDelete = (categoryId: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteMutation.mutate(categoryId, {
        onSuccess: () => {
          toast.success("Category deleted successfully");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to delete");
        },
      });
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

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
        {/* Header */}
        <div className="bg-white shadow-md p-6 sticky top-0 z-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Categories Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Create, edit, and manage product categories
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <FiPlus /> Add Category
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-700">Failed to load categories</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 mb-4">No categories found</p>
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <FiPlus /> Create First Category
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category: Category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                >
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {category.description || "No description"}
                  </p>
                  <div className="bg-gray-50 rounded p-3 mb-4">
                    <p className="text-xs text-gray-500">Slug</p>
                    <p className="text-sm font-mono text-gray-700">
                      {category.slug}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(category)}
                      className="flex-1 flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 font-medium py-2 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      disabled={deleteMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 text-red-600 hover:text-red-800 font-medium py-2 border border-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <FiX className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Category name"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Category description (optional)"
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingCategory
                      ? "Update Category"
                      : "Create Category"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 font-medium transition"
                  disabled={isSubmitting}
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
