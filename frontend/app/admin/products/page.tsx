"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  useAdminProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useAdminCategories,
} from "@/lib/queries/useAdmin";
import {
  FiLogOut,
  FiMenu,
  FiX,
  FiPlus,
  FiTrash2,
  FiEdit2,
} from "react-icons/fi";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Product } from "@/types";

export default function AdminProductsPage() {
  const router = useRouter();
  const { admin, logout } = useAuthStore();
  useAdminAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    stock: "",
    image_url: "",
    category_id: "",
  });

  const { data, isLoading, error } = useAdminProducts();
  const { data: categories = [] } = useAdminCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const products = data?.data || [];
  const pagination = data?.pagination;

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description || "",
        price: product.price,
        stock: product.stock.toString(),
        image_url: product.image_url || "",
        category_id: product.category_id,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
        price: "",
        stock: "",
        image_url: "",
        category_id: "",
      });
    }
    setShowModal(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.slug ||
      !formData.price ||
      !formData.stock ||
      !formData.category_id
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
    };

    if (editingProduct) {
      updateMutation.mutate(
        { id: editingProduct.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Product updated successfully");
            setShowModal(false);
          },
          onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update");
          },
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Product created successfully");
          setShowModal(false);
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to create");
        },
      });
    }
  };

  const handleDelete = (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(productId, {
        onSuccess: () => {
          toast.success("Product deleted successfully");
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
            {
              label: "Products",
              href: "/admin/products",
              icon: "📦",
              active: true,
            },
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
        {/* Header */}
        <div className="bg-white shadow-md p-6 sticky top-0 z-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Products Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Create, edit, and delete products
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <FiPlus /> Add Product
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-700">Failed to load products</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 mb-4">No products found</p>
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <FiPlus /> Create First Product
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: Product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.category?.name || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                        ${parseFloat(product.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            product.stock > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                        >
                          <FiEdit2 /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deleteMutation.isPending}
                          className="text-red-600 hover:text-red-800 font-medium inline-flex items-center gap-1 disabled:opacity-50"
                        >
                          <FiTrash2 /> Delete
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

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="product-slug"
                  />
                </div>
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
                  placeholder="Product description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingProduct
                      ? "Update Product"
                      : "Create Product"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 font-medium"
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
