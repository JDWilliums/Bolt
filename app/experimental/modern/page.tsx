import { Suspense } from "react";
import HeroCinematic from "@/components/modern/HeroCinematic";
import ProductCarousel from "@/components/modern/ProductCarousel";
import FilterableGrid from "./FilterableGrid";

// The page receives searchParams but does NOT await it here.
// Instead, the promise is passed into a Suspense boundary so
// the static shell (hero, headings) renders instantly while
// the dynamic grid streams in — this is Partial Prerendering.
export default function ModernStorefront({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  return (
    <main className="min-h-screen bg-white">
      {/* 1. Static Hero (LCP) — rendered at build time */}
      <HeroCinematic />

      <div className="max-w-[1600px] mx-auto">
        {/* 2. Carousel — streamed via Suspense */}
        <Suspense fallback={<CarouselSkeleton />}>
          <ProductCarousel />
        </Suspense>

        {/* 3. Filterable Grid — dynamic, reads searchParams inside Suspense */}
        <section id="shop" className="px-4 md:px-8 pb-24">
          <h2 className="text-3xl font-extrabold tracking-tight mb-6">The Collection</h2>
          <Suspense fallback={<ProductGridSkeleton />}>
            <FilterableGrid searchParams={searchParams} />
          </Suspense>
        </section>
      </div>
    </main>
  );
}

function CarouselSkeleton() {
  return (
    <div className="mb-20 px-4 md:px-8">
      <div className="h-8 w-48 bg-neutral-200 rounded mb-8 animate-pulse"></div>
      <div className="flex gap-6 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="min-w-[280px] md:min-w-[350px]">
            <div className="bg-neutral-100 aspect-[4/5] rounded-lg animate-pulse mb-4"></div>
            <div className="h-5 w-3/4 bg-neutral-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-1/2 bg-neutral-100 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div>
      <div className="flex gap-3 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 w-24 bg-neutral-100 rounded-full animate-pulse"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col">
            <div className="bg-neutral-100 aspect-square rounded-lg animate-pulse mb-3"></div>
            <div className="h-4 w-3/4 bg-neutral-200 rounded animate-pulse mb-2"></div>
            <div className="h-3 w-1/2 bg-neutral-100 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-1/4 bg-neutral-200 rounded animate-pulse mb-3"></div>
            <div className="h-10 w-full bg-neutral-100 rounded-full animate-pulse mt-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
