"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import styled from "styled-components";
import {
  CATEGORY_DISPLAY,
  CATEGORY_HEROES,
  type CategorySlug,
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

export default function ImageOptCategoryView() {
  const params = useParams();
  const slug = params.slug as CategorySlug;
  const category = CATEGORY_DISPLAY[slug];
  const hero = CATEGORY_HEROES[slug];

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

  // ANTI-PATTERN: PESSIMISTIC UI (kept from control)
  const handleAddToCart = async (id: number) => {
    setAddingToCart(id);
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

      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              {category}
            </h2>
            <p className="text-neutral-500 mt-1">
              {sortedProducts.length} products
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

        <section className="pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product) => {
              const blurDataURL = blurMap[product.imageUrl];
              return (
                <ProductCard key={product.id}>
                  {/* OPTIMISED: next/image with AVIF, quality 60, blur */}
                  <a
                    href={`/experimental/image-opt/product/${product.id}`}
                    className="block mb-3"
                  >
                    <div className="bg-neutral-100 overflow-hidden rounded-lg relative aspect-square">
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
      </div>
    </main>
  );
}
