"use client";

import Image from "next/image";
import { CartItem as CartItemType } from "@/types";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { formatRupiah } from "@/lib/currency";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const cart = useCart();

  const handleIncrease = () => {
    if (item.quantity < item.product.stock) {
      cart.updateQuantity(item.productId, item.quantity + 1);
    } else {
      toast.error("Stok tidak mencukupi");
    }
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      cart.updateQuantity(item.productId, item.quantity - 1);
    } else {
      cart.removeItem(item.productId);
    }
  };

  const handleRemove = () => {
    cart.removeItem(item.productId);
    toast.success("Item dihapus dari keranjang");
  };

  const subtotal = parseFloat(item.product.price) * item.quantity;

  return (
    <div className="flex gap-4 border-b border-border py-4">
      {/* Product Image */}
      <div className="relative w-24 h-24 bg-muted rounded shrink-0">
        {item.product.image_url ? (
          <Image
            src={item.product.image_url}
            alt={item.product.name}
            fill
            className="object-cover rounded"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            Tidak ada gambar
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="grow">
        <h3 className="font-semibold text-foreground mb-1">
          {item.product.name}
        </h3>
        <p className="text-primary font-bold mb-3">
          {formatRupiah(item.product.price)}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mb-2">
          <Button
            onClick={handleDecrease}
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold w-8 text-center">
            {item.quantity}
          </span>
          <Button
            onClick={handleIncrease}
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Subtotal: {formatRupiah(subtotal)}
        </p>
      </div>

      {/* Remove Button */}
      <Button
        onClick={handleRemove}
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </div>
  );
}
