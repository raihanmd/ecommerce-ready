"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { FiLogOut, FiMenu, FiX, FiPlus, FiTrash2 } from "react-icons/fi";
import Link from "next/link";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  category: {
    id: string;
    name: string;
  };
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const { admin, token, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!token || !admin) {
      router.push("/admin/login");
      return;
    }
    fetchData();
  }, [token, admin, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products?take=100`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data.data);
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category_id) {
      toast.error("Please fill all required fields");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock) || 0,
          }),
        },
      );

      if (response.ok) {
        toast.success("Product created successfully");
        setShowModal(false);
        setFormData({
          name: "",
          slug: "",
          description: "",
          price: "",
          stock: "",
          image_url: "",
          category_id: "",
        });
        await fetchData();
      } else {
        toast.error("Failed to create product");
      }
    } catch (error) {
      toast.error("Error creating product");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        toast.success("Product deleted");
        await fetchData();
      } else {
        toast.error("Failed to delete product");
      }
    } catch (error) {
      toast.error("Error deleting product");
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
        <div className="bg-white shadow-md p-6 sticky top-0 z-5 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Products Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Create, edit, and delete products
            </p>
          </div>
          <button
            onClick={() => {
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
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <FiPlus /> New Product
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 mb-4">No products found</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create First Product
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Name
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
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.category.name}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                        ${product.price.toFixed(2)}
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
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(product.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2 flex">
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                        >
                          <FiTrash2 />
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingProduct ? "Edit Product" : "Create Product"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Product Name *"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                rows={2}
              />

              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  placeholder="Price *"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <select
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Category *</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="url"
                placeholder="Image URL"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400"
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
