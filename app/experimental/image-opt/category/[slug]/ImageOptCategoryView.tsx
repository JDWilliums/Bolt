"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import styled from "styled-components";
import {
  CATEGORY_DISPLAY,
  CATEGORY_HEROES,
  CATEGORY_ARCHETYPE,
  GALLERY_IMAGES,
  TRAINING_GUIDE,
  type CategorySlug,
  type CategoryArchetype,
} from "@/lib/categories";
import { addToLocalStorageCart } from "@/lib/cart";
import blurCache from "@/lib/blur-cache.json";

const blurMap = blurCache as Record<string, string>;

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

// ANTI-PATTERN: CSS-IN-JS (styled-components) — kept from control
const HeroSection = styled.section`
  position: relative;
  width: 100%;
  height: 60vh;
  min-height: 450px;
  overflow: hidden;
  margin-bottom: 3rem;
`;

const HeroOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.7) 100%
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  padding: 1rem;
  z-index: 10;
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.03em;
  margin-bottom: 1rem;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
`;

const HeroSubtitle = styled.p`
  font-size: clamp(1rem, 2vw, 1.25rem);
  max-width: 600px;
  font-weight: 300;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
`;

const SortSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 2px solid #e5e5e5;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  background: white;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
  &:focus {
    border-color: black;
  }
`;

const ProductCard = styled.div`
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-4px);
  }
`;

const AddButton = styled.button<{ $isAdding: boolean }>`
  width: 100%;
  padding: 0.625rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${(props) => (props.$isAdding ? "#a3a3a3" : "#000")};
  color: white;
  margin-top: auto;
  &:hover:not(:disabled) {
    background-color: #262626;
  }
  &:disabled {
    cursor: not-allowed;
  }
`;

// Styled-components for thumbnail-grid hover overlay
const ThumbnailCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-4px);
  }
`;

const ThumbnailOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: 0.5rem;
  ${ThumbnailCard}:hover & {
    opacity: 1;
  }
`;

const QuickAddButton = styled.button`
  padding: 0.5rem 1.5rem;
  background: white;
  color: black;
  font-weight: 600;
  font-size: 0.75rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  &:hover {
    background: #e5e5e5;
  }
`;

export default function ImageOptCategoryView() {
  const params = useParams();
  const slug = params.slug as CategorySlug;
  const category = CATEGORY_DISPLAY[slug];
  const hero = CATEGORY_HEROES[slug];
  const archetype: CategoryArchetype = CATEGORY_ARCHETYPE[slug];

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("default");
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  // ANTI-PATTERN: REQUEST WATERFALL (kept from control)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/products/category/${slug}`);
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [slug]);

  // ANTI-PATTERN: CLIENT-SIDE SORTING WITH MAIN THREAD BLOCKING (kept)
  const handleSort = (order: string) => {
    setSortOrder(order);
    if (order !== "default") {
      const start = Date.now();
      while (Date.now() - start < 50) {}
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortOrder === "price_asc") return a.price - b.price;
    if (sortOrder === "price_desc") return b.price - a.price;
    return 0;
  });

  // For minimal archetype, only show first 4 products
  const displayProducts = archetype === "minimal" ? sortedProducts.slice(0, 4) : sortedProducts;

  // ANTI-PATTERN: PESSIMISTIC UI (kept from control)
  const handleAddToCart = async (id: number) => {
    setAddingToCart(id);
    if (process.env.NEXT_PUBLIC_BOLT_SIMULATE_DELAY !== "false")
      await new Promise((resolve) => setTimeout(resolve, 800));
    addToLocalStorageCart(id);
    alert("Added to cart!");
    setAddingToCart(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-neutral-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-neutral-500">
            Loading {category}...
          </p>
        </div>
      </div>
    );
  }

  // Determine grid classes based on archetype
  const gridClasses =
    archetype === "thumbnail-grid"
      ? "grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
      : archetype === "minimal"
        ? "grid grid-cols-1 md:grid-cols-2 gap-8"
        : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6";

  // Determine aspect ratio for product images
  const imageAspect =
    archetype === "image-heavy"
      ? "aspect-[3/4]"
      : archetype === "thumbnail-grid"
        ? "aspect-[4/5]"
        : "aspect-square";

  // Determine container max-width
  const containerMaxW = archetype === "minimal" ? "max-w-[1000px]" : "max-w-[1600px]";

  return (
    <main className="min-h-screen bg-white">
      {/* HERO — OPTIMISED: next/image with blur placeholder */}
      <HeroSection>
        <div className="absolute inset-0 bg-black">
          <Image
            src={hero.url}
            alt={hero.alt}
            fill
            sizes="100vw"
            priority
            fetchPriority="high"
            quality={60}
            placeholder="blur"
            blurDataURL={blurMap[hero.url] || undefined}
            className="object-cover opacity-60"
          />
        </div>
        <HeroOverlay>
          <HeroTitle>{hero.tagline}</HeroTitle>
          <HeroSubtitle>{hero.subtitle}</HeroSubtitle>
        </HeroOverlay>
      </HeroSection>

      <div className={`${containerMaxW} mx-auto px-4 md:px-8`}>
        {/* ─── HEADER + SORT ──────────────────────────────────── */}
        {archetype !== "minimal" && (
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">
                {category}
              </h2>
              <p className="text-neutral-500 mt-1">
                {displayProducts.length} products
              </p>
            </div>
            <SortSelect
              value={sortOrder}
              onChange={(e) => handleSort(e.target.value)}
            >
              <option value="default">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </SortSelect>
          </div>
        )}

        {archetype === "minimal" && (
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight">
              {category}
            </h2>
            <p className="text-neutral-500 mt-2">
              {displayProducts.length} products
            </p>
          </div>
        )}

        {/* ─── PRODUCT GRID ───────────────────────────────────── */}
        <section className={archetype === "minimal" ? "pb-24 px-4" : "pb-24"}>
          <div className={gridClasses}>
            {archetype === "thumbnail-grid"
              ? displayProducts.map((product) => {
                  const blurDataURL = blurMap[product.imageUrl];
                  return (
                    <ThumbnailCard key={product.id}>
                      <a
                        href={`/experimental/image-opt/product/${product.id}`}
                        className="block mb-2"
                      >
                        <div className={`bg-neutral-100 overflow-hidden rounded-lg relative ${imageAspect}`}>
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) calc(33vw - 16px), (max-width: 1200px) calc(25vw - 16px), calc(16.67vw - 16px)"
                            quality={60}
                            placeholder={blurDataURL ? "blur" : "empty"}
                            blurDataURL={blurDataURL || undefined}
                            className="object-cover"
                          />
                          <ThumbnailOverlay>
                            <QuickAddButton
                              onClick={(e) => {
                                e.preventDefault();
                                handleAddToCart(product.id);
                              }}
                            >
                              Quick Add
                            </QuickAddButton>
                          </ThumbnailOverlay>
                        </div>
                      </a>
                      <div className="px-1">
                        <h3 className="font-medium text-sm truncate">{product.name}</h3>
                        <p className="font-bold text-sm">
                          £{(product.price / 100).toFixed(2)}
                        </p>
                      </div>
                    </ThumbnailCard>
                  );
                })
              : displayProducts.map((product) => {
                  const blurDataURL = blurMap[product.imageUrl];
                  return (
                    <ProductCard key={product.id}>
                      {/* OPTIMISED: next/image with AVIF, quality 60, blur */}
                      <a
                        href={`/experimental/image-opt/product/${product.id}`}
                        className="block mb-3"
                      >
                        <div className={`bg-neutral-100 overflow-hidden rounded-lg relative ${imageAspect}`}>
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) calc(100vw - 32px), (max-width: 1200px) calc(50vw - 48px), calc(25vw - 48px)"
                            quality={60}
                            placeholder={blurDataURL ? "blur" : "empty"}
                            blurDataURL={blurDataURL || undefined}
                            className="object-cover"
                          />
                        </div>
                      </a>
                      <div className="flex flex-col flex-grow">
                        <a
                          href={`/experimental/image-opt/product/${product.id}`}
                          className="hover:underline"
                        >
                          <h3 className="font-bold text-base">{product.name}</h3>
                        </a>
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
                        <AddButton
                          $isAdding={addingToCart === product.id}
                          onClick={() => handleAddToCart(product.id)}
                          disabled={addingToCart === product.id}
                        >
                          {addingToCart === product.id ? "Adding..." : "Add to Cart"}
                        </AddButton>
                      </div>
                    </ProductCard>
                  );
                })}
          </div>
        </section>

        {/* ─── IMAGE-HEAVY: Style Inspiration Gallery ─────────── */}
        {archetype === "image-heavy" && (
          <section className="pb-24 px-4 md:px-8">
            <h2 className="text-3xl font-extrabold tracking-tight mb-8">
              Style Inspiration
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {GALLERY_IMAGES.map((image, index) => (
                <div
                  key={index}
                  className={`${index === 0 ? "row-span-2" : ""} relative ${index === 0 ? "h-full" : "aspect-[4/5]"}`}
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

        {/* ─── TEXT-HEAVY: Training Shoe Guide ────────────────── */}
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
