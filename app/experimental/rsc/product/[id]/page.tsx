import { Suspense } from "react";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/modern/AddToCartButton";
import blurCache from "@/lib/blur-cache.json";

const blurMap = blurCache as Record<string, string>;

// ──────────────────────────────────────────────────────────────────
// STAGE B: NO generateStaticParams, NO unstable_cache
// Every product page is server-rendered on each request with a
// fresh DB query. Compare with Stage C where product pages are
// pre-built at build time via generateStaticParams.
// ──────────────────────────────────────────────────────────────────

const sizes = ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12"];

export default function RSCProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await db.select().from(products).where(eq(products.id, Number(id)));
  const product = result[0];

  if (!product) return notFound();

  return (
    <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-8">
      <Link
        href="/experimental/rsc"
        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black mb-8 transition-colors"
        prefetch={true}
      >
        &larr; Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        <div className="bg-neutral-100 rounded-2xl overflow-hidden relative aspect-square">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            quality={60}
            placeholder={blurMap[product.imageUrl] ? "blur" : "empty"}
            blurDataURL={blurMap[product.imageUrl] || undefined}
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-sm text-neutral-500 mb-1">{product.category}</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">{product.name}</h1>
          <p className="text-2xl font-bold mb-6">£{(product.price / 100).toFixed(2)}</p>

          <p className="text-neutral-600 mb-8 leading-relaxed">{product.description}</p>

          <div className="mb-8">
            <h3 className="text-sm font-bold mb-3">Select Size</h3>
            <div className="grid grid-cols-4 gap-2">
              {sizes.map((size) => (
                <label key={size} className="cursor-pointer">
                  <input type="radio" name="size" value={size} className="peer sr-only" />
                  <div className="py-3 border rounded-lg text-sm font-medium text-center transition-colors border-neutral-200 hover:border-black peer-checked:border-black peer-checked:bg-black peer-checked:text-white">
                    {size}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <AddToCartButton productId={product.id} />

          <div className="mt-8 space-y-3 text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75m-7.5-2.25H6.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125h12m-3-3V9.375c0-.621-.504-1.125-1.125-1.125h-2.25c-.621 0-1.125.504-1.125 1.125v3.375m-6 0V9.375c0-.621-.504-1.125-1.125-1.125H6.375c-.621 0-1.125.504-1.125 1.125v3.375" />
              </svg>
              Free delivery on orders over £50
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
              </svg>
              Free 30-day returns
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function ProductSkeleton() {
  return (
    <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-8">
      <div className="h-5 w-32 bg-neutral-100 rounded animate-pulse mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        <div className="bg-neutral-100 rounded-2xl aspect-square animate-pulse" />
        <div className="flex flex-col justify-center space-y-4">
          <div className="h-4 w-20 bg-neutral-100 rounded animate-pulse" />
          <div className="h-8 w-64 bg-neutral-200 rounded animate-pulse" />
          <div className="h-6 w-24 bg-neutral-200 rounded animate-pulse" />
          <div className="h-20 w-full bg-neutral-100 rounded animate-pulse" />
          <div className="h-12 w-full bg-neutral-200 rounded-full animate-pulse" />
        </div>
      </div>
    </main>
  );
}
