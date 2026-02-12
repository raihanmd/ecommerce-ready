"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useProductDetail } from "@/lib/queries/useProducts";
import { useCart } from "@/hooks/useCart";
import { FaArrowLeft, FaShoppingCart } from "react-icons/fa";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [imageZoom, setImageZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const cart = useCart();

  const { data: product, isLoading, error } = useProductDetail(slug);

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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/products"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <FaArrowLeft className="text-sm" />
          Back to Products
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Product Not Found
          </h3>
          <p className="text-red-700 mb-4">
            {error instanceof Error
              ? error.message
              : "The product you are looking for does not exist."}
          </p>
          <Link
            href="/products"
            className="text-red-600 hover:text-red-700 font-semibold"
          >
            View all products →
          </Link>
        </div>
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
        <FaArrowLeft className="text-sm" />
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
            <FaShoppingCart className="text-lg" />
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
