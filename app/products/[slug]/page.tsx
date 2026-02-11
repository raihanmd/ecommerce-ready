"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { productsApi } from "@/lib/api";
import { Product } from "@/types";
import { useCart } from "@/hooks/useCart";
import { ArrowLeft, ShoppingCart } from "react-icons/fa";
import toast from "react-hot-toast";

interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [imageZoom, setImageZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const cart = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await productsApi.getBySlug(params.slug);
        setProduct(response.data.data);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        toast.error("Product not found");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.slug]);

  const handleAddToCart = () => {
    if (product) {
      cart.addItem(product, quantity);
      toast.success(`${quantity} item(s) added to cart!`);
      setQuantity(1);
    }
  };

  const handleImageMouseEnter = () => {
    setImageZoom(true);
  };

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleImageMouseLeave = () => {
    setImageZoom(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-600">Product not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        href="/products"
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="text-sm" />
        Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <div
            className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in"
            onMouseEnter={handleImageMouseEnter}
            onMouseMove={handleImageMouseMove}
            onMouseLeave={handleImageMouseLeave}
          >
            {product.image_url ? (
              <>
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className={`object-cover transition-transform ${
                    imageZoom ? "scale-150" : "scale-100"
                  }`}
                  style={
                    imageZoom
                      ? {
                          transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        }
                      : {}
                  }
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>
          {imageZoom && (
            <p className="text-sm text-gray-500 mt-2">
              Move your mouse to zoom
            </p>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>

          {/* Category */}
          {product.category && (
            <Link
              href={`/products?category=${product.category.slug}`}
              className="text-blue-600 hover:text-blue-700 mb-4"
            >
              {product.category.name}
            </Link>
          )}

          {/* Price */}
          <p className="text-3xl font-bold text-blue-600 mb-6">
            ${parseFloat(product.price).toFixed(2)}
          </p>

          {/* Stock Status */}
          <div className="mb-6">
            {product.stock === 0 ? (
              <span className="inline-block bg-red-100 text-red-800 px-4 py-2 rounded">
                Out of Stock
              </span>
            ) : (
              <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded">
                In Stock: {product.stock} available
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Description
              </h3>
              <div
                className="text-gray-600 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) setQuantity(Math.min(val, product.stock));
                }}
                min="1"
                max={product.stock}
                className="w-16 text-center border border-gray-300 rounded py-2"
              />
              <button
                onClick={() =>
                  setQuantity(Math.min(quantity + 1, product.stock))
                }
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 text-lg font-semibold"
          >
            <ShoppingCart className="text-lg" />
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>

          {/* Additional Info */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Product ID:{" "}
              <span className="font-mono text-gray-900">{product.id}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
