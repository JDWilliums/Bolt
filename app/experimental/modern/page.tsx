import { Suspense } from "react";
import HeroCinematic from "@/components/modern/HeroCinematic";
import ProductCarousel from "@/components/modern/ProductCarousel";
import ProductGrid from "@/components/modern/ProductGrid";

export default function ModernStorefront() {
  return (
    <main className="min-h-screen bg-white">
      {/* 1. The High-Fidelity Hero (LCP Tester) */}
      <HeroCinematic />

      <div className="max-w-[1600px] mx-auto">
        {/* 2. The JS-Free Carousel (INP Tester) */}
        <Suspense fallback={<div className="h-[500px] bg-gray-100 animate-pulse mb-20 rounded-xl mx-4"></div>}>
          <ProductCarousel />
        </Suspense>

        {/* 3. The Full Catalog Grid */}
        <section id="shop" className="px-4 md:px-8 pb-24">
          <h2 className="text-3xl font-extrabold tracking-tight mb-8">The Collection</h2>
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid />
          </Suspense>
        </section>
      </div>
    </main>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="border p-4 flex flex-col h-[400px] animate-pulse">
          <div className="bg-gray-200 w-full aspect-square mb-4 rounded-lg"></div>
          <div className="bg-gray-200 h-6 w-3/4 mb-2"></div>
          <div className="bg-gray-200 h-4 w-full mb-4 flex-grow"></div>
          <div className="bg-gray-200 h-8 w-1/4 mb-4"></div>
          <div className="bg-gray-300 h-10 w-full mt-auto rounded"></div>
        </div>
      ))}
    </div>
  );
}