"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { useCart } from "@/hooks/useCart";
import { ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { formatRupiah } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col border border-slate-200">
        {/* Image Container */}
        <div className="relative w-full h-48 bg-slate-100">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              No image
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 flex flex-col grow">
          <h3 className="font-semibold text-slate-900 line-clamp-2 mb-2">
            {product.name}
          </h3>

          <p className="text-primary font-bold text-lg mb-2">
            {formatRupiah(product.price)}
          </p>

          <div className="mb-4">
            {isOutOfStock ? (
              <Badge variant="destructive">Out of Stock</Badge>
            ) : (
              <Badge variant="secondary">Stock: {product.stock}</Badge>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="mt-auto w-full"
            size="sm"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </Card>
    </Link>
  );
}
