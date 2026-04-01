"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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

const categories = ["All", "Running", "Training", "Lifestyle", "Basketball", "Football"];

export default function ImageOptHomepage() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  // ANTI-PATTERN: REQUEST WATERFALL (kept from control)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const products = await response.json();
        setData(products);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ANTI-PATTERN: CLIENT-SIDE FILTERING (kept from control)
  const filteredProducts = activeCategory === "All"
    ? data
    : data.filter((p) => p.category === activeCategory);

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
          <div className="w-12 h-12 border-4 border-neutral-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-neutral-500">Loading Store...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* HERO BANNER — OPTIMISED: next/image with blur placeholder */}
      <section className="relative w-full overflow-hidden mb-12" style={{ height: "70vh", minHeight: 600 }}>
        <div className="absolute inset-0 bg-black">
          <Image
            src="https://images.unsplash.com/photo-1556906781-9a412961c28c?q=100&w=3000&auto=format&fit=crop"
            alt="Athlete running on a track"
            fill
            sizes="100vw"
            priority
            fetchPriority="high"
            quality={60}
            placeholder="blur"
            blurDataURL={blurMap["https://images.unsplash.com/photo-1556906781-9a412961c28c?q=100&w=3000&auto=format&fit=crop"] || undefined}
            className="object-cover opacity-60"
          />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 uppercase drop-shadow-lg">
            Push Your Limits.
          </h1>
          <p className="text-lg md:text-2xl font-light mb-10 max-w-2xl drop-shadow-md">
            Engineered for zero latency. Designed for peak performance. Discover the next generation of athletic footwear.
          </p>
          <div className="flex gap-4">
            <a href="#shop" className="bg-white text-black font-bold py-4 px-8 rounded-full hover:bg-gray-200 transition-transform hover:scale-105">
              Shop Collection
            </a>
            <a href="#shop" className="bg-transparent border-2 border-white text-white font-bold py-4 px-8 rounded-full hover:bg-white hover:text-black transition-colors">
              New Arrivals
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <section id="shop" className="mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight mb-6">The Collection</h2>
          <div className="flex flex-wrap gap-3 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-black text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        <section className="pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => {
              const blurDataURL = blurMap[product.imageUrl];
              return (
                <div key={product.id} className="group flex flex-col">
                  {/* OPTIMISED: next/image with AVIF, quality 60, blur placeholder */}
                  <a href={`/experimental/image-opt/product/${product.id}`} className="block mb-3">
                    <div className="bg-neutral-100 overflow-hidden rounded-lg relative aspect-square">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) calc(100vw - 32px), (max-width: 1200px) calc(50vw - 48px), calc(25vw - 48px)"
                        quality={60}
                        placeholder={blurDataURL ? "blur" : "empty"}
                        blurDataURL={blurDataURL || undefined}
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </a>
                  <div className="flex flex-col flex-grow">
                    <a href={`/experimental/image-opt/product/${product.id}`} className="hover:underline">
                      <h3 className="font-bold text-base">{product.name}</h3>
                    </a>
                    <p className="text-sm text-neutral-500 mb-1">{product.category}</p>
                    <p className="font-bold text-base mb-3">£{(product.price / 100).toFixed(2)}</p>
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={addingToCart === product.id}
                      className="mt-auto w-full bg-black text-white py-2.5 rounded-full text-sm font-medium hover:bg-neutral-800 disabled:bg-neutral-400 transition-colors"
                    >
                      {addingToCart === product.id ? "Adding..." : "Add to Cart"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
