import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to Our Store
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl">
            Discover amazing products at great prices. Shop now and enjoy fast
            delivery!
          </p>
          <div className="flex gap-4">
            <Link
              href="/products"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold text-lg"
            >
              Shop Now
            </Link>
            <Link
              href="/products"
              className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition font-semibold text-lg"
            >
              Browse Products
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 py-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Fast Delivery
            </h3>
            <p className="text-gray-600">
              Get your orders delivered quickly with multiple delivery schedule
              options.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Secure Payment
            </h3>
            <p className="text-gray-600">
              Multiple payment methods available: COD, Bank Transfer, and
              E-wallet.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Best Prices
            </h3>
            <p className="text-gray-600">
              Competitive pricing and regular discounts on your favorite
              products.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
