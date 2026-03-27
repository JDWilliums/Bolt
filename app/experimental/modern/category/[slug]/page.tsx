import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
  CATEGORY_SLUGS,
  CATEGORY_DISPLAY,
  CATEGORY_HEROES,
  type CategorySlug,
} from "@/lib/categories";
import AddToCartButton from "@/components/modern/AddToCartButton";
import CategorySortBar from "./CategorySortBar";
import blurCache from "@/lib/blur-cache.json";

const blurMap = blurCache as Record<string, string>;

// ──────────────────────────────────────────────────────────────────
// OPTIMISATION: STATIC SITE GENERATION (SSG)
// Pre-generate all 5 category pages at build time. Combined with
// <Link prefetch>, the browser prefetches the full static shell
// when the user hovers a category link — resulting in 0ms TTFB.
// ──────────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  return CATEGORY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const displayName = CATEGORY_DISPLAY[slug as CategorySlug];
  return { title: `${displayName || "Category"} — Bolt Store` };
}

export default async function ModernCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { slug } = await params;

  const categorySlug = slug as CategorySlug;
  const displayName = CATEGORY_DISPLAY[categorySlug];
  const hero = CATEGORY_HEROES[categorySlug];

  if (!displayName || !hero) return notFound();

  const heroBlur = blurMap[hero.url];

  return (
    <main className="min-h-screen bg-white">
      {/* ─── HERO BANNER (STATIC SHELL) ───────────────────────── */}
      {/* This renders at build time as part of the static shell.
          next/image with priority for LCP, fill for zero CLS,
          and blur placeholder for visual stability. */}
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
        {/* ─── HEADER + SORT ──────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              {displayName}
            </h2>
          </div>
          <Suspense
            fallback={
              <div className="h-10 w-40 bg-neutral-100 rounded-full animate-pulse" />
            }
          >
            <CategorySortBar slug={slug} />
          </Suspense>
        </div>

        {/* ─── PRODUCT GRID (DYNAMIC — streams via Suspense) ──── */}
        {/* The static shell (hero, heading) renders instantly while
            the dynamic grid streams in after the DB query completes. */}
        <section className="pb-24">
          <Suspense fallback={<GridSkeleton />}>
            <CategoryGrid
              category={displayName}
              searchParams={searchParams}
            />
          </Suspense>
        </section>
      </div>
    </main>
  );
}

// ──────────────────────────────────────────────────────────────────
// Server Component: Fetches and renders the product grid.
// searchParams is awaited INSIDE the Suspense boundary so the
// static shell can render without blocking on dynamic data.
// ──────────────────────────────────────────────────────────────────
async function CategoryGrid({
  category,
  searchParams,
}: {
  category: string;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;

  let query = db.select().from(products).where(eq(products.category, category));

  if (sort === "price_asc") {
    query = query.orderBy(asc(products.price)) as typeof query;
  } else if (sort === "price_desc") {
    query = query.orderBy(desc(products.price)) as typeof query;
  }

  const data = await query;

  return (
    <>
      <p className="text-neutral-500 mb-6">{data.length} products</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.map((product, index) => {
          const blur = blurMap[product.imageUrl];
          return (
            <div key={product.id} className="group flex flex-col">
              <Link
                href={`/experimental/modern/product/${product.id}`}
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
                  href={`/experimental/modern/product/${product.id}`}
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
    </>
  );
}

function GridSkeleton() {
  return (
    <div>
      <div className="h-5 w-24 bg-neutral-100 rounded animate-pulse mb-6" />
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
  );
}
