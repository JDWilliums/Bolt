import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
  CATEGORY_DISPLAY,
  CATEGORY_HEROES,
  type CategorySlug,
} from "@/lib/categories";
import AddToCartButton from "@/components/modern/AddToCartButton";
import RSCCategorySortBar from "./CategorySortBar";
import blurCache from "@/lib/blur-cache.json";

const blurMap = blurCache as Record<string, string>;

// ──────────────────────────────────────────────────────────────────
// STAGE B: NO generateStaticParams — every request hits the server.
// Unlike Stage C where category pages are pre-built at build time,
// this page is server-rendered on each request. Params and data
// are accessed inside Suspense boundaries.
// ──────────────────────────────────────────────────────────────────

export default function RSCCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  return (
    <main className="min-h-screen bg-white">
      <Suspense fallback={<PageSkeleton />}>
        <CategoryContent params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function CategoryContent({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { slug } = await params;
  const { sort } = await searchParams;

  const categorySlug = slug as CategorySlug;
  const displayName = CATEGORY_DISPLAY[categorySlug];
  const hero = CATEGORY_HEROES[categorySlug];

  if (!displayName || !hero) return notFound();

  const heroBlur = blurMap[hero.url];

  // Server-side data fetching — single DB query with ORDER BY
  let query = db.select().from(products).where(eq(products.category, displayName));

  if (sort === "price_asc") {
    query = query.orderBy(asc(products.price)) as typeof query;
  } else if (sort === "price_desc") {
    query = query.orderBy(desc(products.price)) as typeof query;
  }

  const data = await query;

  return (
    <>
      {/* ─── HERO BANNER ───────────────────────────────────────── */}
      <section className="relative w-full h-[60vh] min-h-[450px] overflow-hidden mb-12">
        <div className="absolute inset-0 bg-black">
          <Image
            src={hero.url}
            alt={hero.alt}
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            quality={60}
            placeholder={heroBlur ? "blur" : "empty"}
            blurDataURL={heroBlur || undefined}
            className="object-cover opacity-60"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70 z-[1]" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 uppercase drop-shadow-lg">
            {hero.tagline}
          </h1>
          <p className="text-lg md:text-xl font-light max-w-2xl drop-shadow-md">
            {hero.subtitle}
          </p>
        </div>
      </section>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              {displayName}
            </h2>
            <p className="text-neutral-500 mt-1">{data.length} products</p>
          </div>
          <RSCCategorySortBar slug={slug} />
        </div>

        {/* ─── PRODUCT GRID ─────────────────────────────────────── */}
        <section className="pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.map((product, index) => {
              const blur = blurMap[product.imageUrl];
              return (
                <div key={product.id} className="group flex flex-col">
                  <Link
                    href={`/experimental/rsc/product/${product.id}`}
                    prefetch={true}
                    className="block mb-3"
                  >
                    <div className="bg-neutral-100 overflow-hidden rounded-lg relative aspect-square">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) calc(100vw - 32px), (max-width: 1200px) calc(50vw - 48px), calc(25vw - 48px)"
                        priority={index < 4}
                        quality={60}
                        placeholder={blur ? "blur" : "empty"}
                        blurDataURL={blur || undefined}
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </Link>

                  <div className="flex flex-col flex-grow">
                    <Link
                      href={`/experimental/rsc/product/${product.id}`}
                      prefetch={true}
                      className="hover:underline"
                    >
                      <h3 className="font-bold text-base">{product.name}</h3>
                    </Link>
                    <p className="text-sm text-neutral-500 mb-1">
                      {product.category}
                    </p>
                    <p className="font-bold text-base mb-3">
                      £{(product.price / 100).toFixed(2)}
                    </p>
                    <div className="mt-auto">
                      <AddToCartButton productId={product.id} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}

function PageSkeleton() {
  return (
    <>
      <div className="w-full h-[60vh] min-h-[450px] bg-neutral-200 animate-pulse mb-12" />
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="h-8 w-48 bg-neutral-200 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col">
              <div className="bg-neutral-100 aspect-square rounded-lg animate-pulse mb-3" />
              <div className="h-4 w-3/4 bg-neutral-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-1/2 bg-neutral-100 rounded animate-pulse mb-2" />
              <div className="h-4 w-1/4 bg-neutral-200 rounded animate-pulse mb-3" />
              <div className="h-10 w-full bg-neutral-100 rounded-full animate-pulse mt-auto" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
