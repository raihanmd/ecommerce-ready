"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { useCart } from "@/hooks/useCart";
import { FaShoppingCart } from "react-icons/fa";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const cart = useCart();
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isOutOfStock) {
      cart.addItem(product, 1);
      toast.success(`${product.name} added to cart!`);
    }
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white cursor-pointer h-full flex flex-col">
        {/* Image Container */}
        <div className="relative w-full h-48 bg-gray-100">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 flex flex-col grow">
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
            {product.name}
          </h3>

          <p className="text-blue-600 font-bold text-lg mb-2">
            ${parseFloat(product.price).toFixed(2)}
          </p>

          <div className="mb-4">
            {isOutOfStock ? (
              <span className="inline-block bg-red-100 text-red-800 text-sm px-3 py-1 rounded">
                Out of Stock
              </span>
            ) : (
              <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded">
                Stock: {product.stock}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="mt-auto w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            <FaShoppingCart className="text-sm" />
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </Link>
  );
}
