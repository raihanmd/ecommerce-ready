"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import CartItem from "@/components/CartItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/currency";
import { ShoppingCart } from "lucide-react";

export default function CartPage() {
  const cart = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-center justify-center min-h-96 text-center">
          <ShoppingCart className="w-24 h-24 text-muted-foreground mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Keranjang Anda Kosong
          </h1>
          <p className="text-muted-foreground mb-8">
            Tambahkan beberapa produk ke keranjang untuk memulai!
          </p>
          <Button asChild size="lg">
            <Link href="/products">Lanjutkan Belanja</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">
        Keranjang Belanja
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {cart.items.map((item) => (
                  <div key={item.productId} className="p-6">
                    <CartItem item={item} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <Card className="h-fit sticky top-20">
          <CardHeader>
            <CardTitle>Ringkasan Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3 pb-6 border-b border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">
                  {formatRupiah(cart.getTotalPrice())}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">
                {formatRupiah(cart.getTotalPrice())}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <Button asChild size="lg" className="w-full">
                <Link href="/checkout">Lanjut ke Pembayaran</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link href="/products">Lanjutkan Belanja</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
