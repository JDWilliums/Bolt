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
  CATEGORY_ARCHETYPE,
  GALLERY_IMAGES,
  TRAINING_GUIDE,
  type CategorySlug,
  type CategoryArchetype,
} from "@/lib/categories";
import AddToCartButton from "@/components/modern/AddToCartButton";
import CategorySortBar from "./CategorySortBar";
import blurCache from "@/lib/blur-cache.json";

const blurMap = blurCache as Record<string, string>;

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

export default async function NoDelayCategoryPage({
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
  const archetype: CategoryArchetype = CATEGORY_ARCHETYPE[categorySlug];

  if (!displayName || !hero) return notFound();

  const heroBlur = blurMap[hero.url];
  const containerMaxW = archetype === "minimal" ? "max-w-[1000px]" : "max-w-[1600px]";

  return (
    <main className="min-h-screen bg-white">
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

      <div className={`${containerMaxW} mx-auto px-4 md:px-8`}>
        {archetype !== "minimal" && (
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
        )}

        {archetype === "minimal" && (
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight">
              {displayName}
            </h2>
          </div>
        )}

        <section className={archetype === "minimal" ? "pb-24 px-4" : "pb-24"}>
          <Suspense fallback={<GridSkeleton archetype={archetype} />}>
            <CategoryGrid
              category={displayName}
              archetype={archetype}
              searchParams={searchParams}
            />
          </Suspense>
        </section>

        {archetype === "image-heavy" && (
          <section className="pb-24 px-4 md:px-8">
            <h2 className="text-3xl font-extrabold tracking-tight mb-8">
              Style Inspiration
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {GALLERY_IMAGES.map((image, index) => (
                <div
                  key={index}
                  className={`${index === 0 ? "row-span-2" : ""} relative ${index === 0 ? "h-full min-h-[400px]" : "aspect-[4/5]"}`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    quality={60}
                    placeholder={blurMap[image.url] ? "blur" : "empty"}
                    blurDataURL={blurMap[image.url] || undefined}
                    className="object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {archetype === "text-heavy" && (
          <>
            <section className="pb-12 px-4 md:px-8 max-w-[900px] mx-auto">
              <h2 className="text-3xl font-extrabold tracking-tight mb-4">
                {TRAINING_GUIDE.title}
              </h2>
              <p className="text-lg text-neutral-600 mb-8">
                {TRAINING_GUIDE.intro}
              </p>
              {TRAINING_GUIDE.sections.map((section, index) => (
                <div key={index} className="mb-8">
                  <h3 className="text-xl font-bold mb-3">{section.heading}</h3>
                  <p className="text-neutral-700 leading-relaxed">{section.body}</p>
                </div>
              ))}
            </section>

            <section className="pb-12 px-4 md:px-8 max-w-[900px] mx-auto">
              <h3 className="text-2xl font-bold mb-6">How Training Shoes Compare</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-neutral-200">
                      <th className="text-left py-3 pr-4 font-bold text-sm uppercase tracking-wider text-neutral-500">Spec</th>
                      <th className="text-left py-3 pr-4 font-bold text-sm uppercase tracking-wider text-neutral-500">Running</th>
                      <th className="text-left py-3 pr-4 font-bold text-sm uppercase tracking-wider text-neutral-500">Training</th>
                      <th className="text-left py-3 font-bold text-sm uppercase tracking-wider text-neutral-500">Lifestyle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TRAINING_GUIDE.specs.map((spec, index) => (
                      <tr key={index} className="border-b border-neutral-100">
                        <td className="py-3 pr-4 font-medium text-sm">{spec.label}</td>
                        <td className="py-3 pr-4 text-sm text-neutral-600">{spec.running}</td>
                        <td className="py-3 pr-4 text-sm text-neutral-600">{spec.training}</td>
                        <td className="py-3 text-sm text-neutral-600">{spec.lifestyle}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="pb-24 px-4 md:px-8 max-w-[900px] mx-auto">
              <h3 className="text-2xl font-bold mb-6">What Athletes Say</h3>
              <div className="space-y-6">
                {TRAINING_GUIDE.reviews.map((review, index) => (
                  <div key={index} className="border-b border-neutral-100 pb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-lg ${i < review.rating ? "text-yellow-400" : "text-neutral-200"}`}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="font-bold text-sm">{review.author}</span>
                    </div>
                    <p className="text-neutral-700">{review.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

async function CategoryGrid({
  category,
  archetype,
  searchParams,
}: {
  category: string;
  archetype: CategoryArchetype;
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
  const displayProducts = archetype === "minimal" ? data.slice(0, 4) : data;

  const gridClasses =
    archetype === "thumbnail-grid"
      ? "grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
      : archetype === "minimal"
        ? "grid grid-cols-1 md:grid-cols-2 gap-8"
        : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6";

  const imageAspect =
    archetype === "image-heavy"
      ? "aspect-[3/4]"
      : archetype === "thumbnail-grid"
        ? "aspect-[4/5]"
        : "aspect-square";

  return (
    <>
      <p className="text-neutral-500 mb-6">{displayProducts.length} products</p>
      <div className={gridClasses}>
        {archetype === "thumbnail-grid"
          ? displayProducts.map((product, index) => {
              const blur = blurMap[product.imageUrl];
              return (
                <div key={product.id} className="group flex flex-col">
                  <Link
                    href={`/experimental/nodelay/product/${product.id}`}
                    prefetch={true}
                    className="block mb-2"
                  >
                    <div className={`bg-neutral-100 overflow-hidden rounded-lg relative ${imageAspect}`}>
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 17vw"
                        priority={index < 6}
                        quality={60}
                        placeholder={blur ? "blur" : "empty"}
                        blurDataURL={blur || undefined}
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg">
                        <AddToCartButton productId={product.id} variant="quick" />
                      </div>
                    </div>
                  </Link>
                  <div className="px-1">
                    <h3 className="font-medium text-sm truncate">{product.name}</h3>
                    <p className="font-bold text-sm">
                      £{(product.price / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })
          : displayProducts.map((product, index) => {
              const blur = blurMap[product.imageUrl];
              return (
                <div key={product.id} className="group flex flex-col">
                  <Link
                    href={`/experimental/nodelay/product/${product.id}`}
                    prefetch={true}
                    className="block mb-3"
                  >
                    <div className={`bg-neutral-100 overflow-hidden rounded-lg relative ${imageAspect}`}>
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
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
                      href={`/experimental/nodelay/product/${product.id}`}
                      prefetch={true}
                      className="hover:underline"
                    >
                      <h3 className="font-bold text-base">{product.name}</h3>
                    </Link>
                    <p className="text-sm text-neutral-500 mb-1">
                      {product.category}
                    </p>
                    {archetype === "text-heavy" && product.description && (
                      <p className="text-sm text-neutral-600 mb-2 line-clamp-2">
                        {product.description}
                      </p>
                    )}
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

function GridSkeleton({ archetype }: { archetype: CategoryArchetype }) {
  const cols =
    archetype === "thumbnail-grid"
      ? "grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
      : archetype === "minimal"
        ? "grid-cols-1 md:grid-cols-2"
        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";

  const count = archetype === "minimal" ? 4 : archetype === "thumbnail-grid" ? 12 : 8;

  const aspect =
    archetype === "image-heavy"
      ? "aspect-[3/4]"
      : archetype === "thumbnail-grid"
        ? "aspect-[4/5]"
        : "aspect-square";

  return (
    <div>
      <div className="h-5 w-24 bg-neutral-100 rounded animate-pulse mb-6" />
      <div className={`grid ${cols} gap-6`}>
        {[...Array(count)].map((_, i) => (
          <div key={i} className="flex flex-col">
            <div className={`bg-neutral-100 ${aspect} rounded-lg animate-pulse mb-3`} />
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
