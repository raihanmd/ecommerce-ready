"use client";

import Link from "next/link";
import { useProducts } from "@/lib/queries/useProducts";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Truck, Shield, Tag, Star, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function Home() {
  const { data, isLoading, error } = useProducts({
    page: 1,
    limit: 8,
  });

  const products = data?.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Premium Shopping
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Experience
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover curated products with unbeatable prices. Fast delivery,
              secure payment, and exceptional customer service guaranteed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
              >
                <Link href="/products">Shop Now</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-blue-400 text-blue-300 hover:bg-blue-400/10"
              >
                <Link href="/products">Explore Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              icon: Truck,
              title: "Fast Delivery",
              description: "Quick delivery with multiple time slots",
              color: "from-blue-500 to-cyan-500",
            },
            {
              icon: Shield,
              title: "Secure Payment",
              description: "COD, Bank Transfer, and E-Wallet options",
              color: "from-green-500 to-emerald-500",
            },
            {
              icon: Tag,
              title: "Best Prices",
              description: "Competitive pricing and regular discounts",
              color: "from-orange-500 to-red-500",
            },
            {
              icon: Star,
              title: "Quality Products",
              description: "Curated selection of premium items",
              color: "from-purple-500 to-pink-500",
            },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-all hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1"
              >
                <div
                  className={`bg-gradient-to-r ${feature.color} p-4 rounded-lg w-fit mb-4`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Featured Products
          </h2>
          <p className="text-gray-400 text-lg">
            Check out our hand-picked selection
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
              <p className="text-gray-400">Loading products...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Failed to Load Products:</strong>{" "}
              {error instanceof Error ? error.message : "An error occurred"}
            </AlertDescription>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              Try Again
            </Button>
          </Alert>
        )}

        {/* Products Grid */}
        {!isLoading && !error && products.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Link href="/products">View All Products →</Link>
              </Button>
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No products available</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 lg:p-16 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Ready to Shop?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Browse our complete collection and find exactly what you need.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-700">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              10K+
            </p>
            <p className="text-gray-400 mt-2">Happy Customers</p>
          </div>
          <div>
            <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              500+
            </p>
            <p className="text-gray-400 mt-2">Premium Products</p>
          </div>
          <div>
            <p className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              24/7
            </p>
            <p className="text-gray-400 mt-2">Customer Support</p>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center border-t border-slate-700">
        <p className="text-gray-400 mb-4">Have questions?</p>
        <p className="text-white">
          Contact us anytime at{" "}
          <a
            href="mailto:support@example.com"
            className="text-blue-400 hover:text-blue-300"
          >
            support@example.com
          </a>
        </p>
      </div>
    </div>
  );
}
