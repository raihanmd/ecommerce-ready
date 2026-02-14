"use client";

import Link from "next/link";
import { useProducts } from "@/lib/queries/useProducts";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Truck, Shield, Tag, Star, AlertCircle, Loader2 } from "lucide-react";

export default function Home() {
  const { data, isLoading, error } = useProducts({
    page: 1,
    limit: 8,
  });

  const products = data?.data || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Welcome Greeting */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-lg md:text-xl text-muted-foreground">
            Halo, selamat datang di toko saya 👋
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Pengalaman Belanja Premium
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Temukan produk pilihan dengan harga terbaik. Pengiriman cepat,
            pembayaran aman, dan layanan pelanggan yang siap membantu Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/products">Belanja Sekarang</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Truck,
                title: "Pengiriman Cepat",
                description: "Pengiriman cepat dengan berbagai pilihan waktu",
              },
              {
                icon: Shield,
                title: "Pembayaran Aman",
                description: "COD, Transfer Bank, dan E-Wallet tersedia",
              },
              {
                icon: Tag,
                title: "Harga Terbaik",
                description: "Harga kompetitif dengan promo menarik",
              },
              {
                icon: Star,
                title: "Produk Berkualitas",
                description: "Pilihan produk terbaik dan terkurasi",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Produk Unggulan
          </h2>
          <p className="text-muted-foreground">
            Pilihan terbaik yang kami rekomendasikan untuk Anda
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Memuat produk...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Gagal memuat produk:</strong>{" "}
              {error instanceof Error ? error.message : "An error occurred"}
            </AlertDescription>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              Coba Lagi
            </Button>
          </Alert>
        )}

        {/* Products Grid */}
        {!isLoading && !error && products.length > 0 && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center">
              <Button asChild size="lg" variant="outline">
                <Link href="/products">View All Products →</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Belum ada produk tersedia</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Siap untuk Berbelanja?
            </h2>
            <p className="text-lg text-muted-foreground">
              Jelajahi koleksi lengkap kami dan temukan produk yang Anda
              butuhkan.
            </p>
            <Button asChild size="lg">
              <Link href="/products">Belanja Sekarang</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12 text-center space-y-2">
          <p className="text-sm">
            Ada pertanyaan?{" "}
            <a
              href="wa.me/+6281320554367"
              className="font-medium underline underline-offset-4 hover:text-primary"
            >
              Whatsapp
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
