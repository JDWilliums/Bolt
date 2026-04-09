"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { addToLocalStorageCart } from "@/lib/cart";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

const sizes = ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12"];

export default function LegacyProductView() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // REQUEST WATERFALL: Component mounts → JS executes → fetch fires
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`);
        if (!response.ok) throw new Error("Not found");
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    // PESSIMISTIC UI: Block for 800ms while "server processes"
    if (process.env.NEXT_PUBLIC_BOLT_SIMULATE_DELAY !== "false")
      await new Promise((resolve) => setTimeout(resolve, 800));
    addToLocalStorageCart(product.id);
    setAddingToCart(false);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-neutral-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-neutral-500">Loading Product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p className="text-xl text-neutral-500">Product not found</p>
      </div>
    );
  }

  return (
    <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-8">
      {/* Back link — uses <a> instead of <Link>, no prefetching */}
      <a
        href="/control/legacy"
        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black mb-8 transition-colors"
      >
        &larr; Back to Shop
      </a>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        {/* PRODUCT IMAGE — unoptimised <img>, no dimensions, no lazy loading */}
        <div className="bg-neutral-100 rounded-2xl overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full aspect-square object-cover"
            // NO width/height, NO srcset, NO loading="lazy"
          />
        </div>

        {/* PRODUCT INFO */}
        <div className="flex flex-col justify-center">
          <p className="text-sm text-neutral-500 mb-1">{product.category}</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">{product.name}</h1>
          <p className="text-2xl font-bold mb-6">£{(product.price / 100).toFixed(2)}</p>

          <p className="text-neutral-600 mb-8 leading-relaxed">{product.description}</p>

          {/* SIZE SELECTOR */}
          <div className="mb-8">
            <h3 className="text-sm font-bold mb-3">Select Size</h3>
            <div className="grid grid-cols-4 gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-3 border rounded-lg text-sm font-medium transition-colors ${
                    selectedSize === size
                      ? "border-black bg-black text-white"
                      : "border-neutral-200 hover:border-black"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* ADD TO CART — pessimistic, blocks while waiting */}
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || addedToCart}
            className={`w-full py-4 rounded-full font-bold text-base transition-colors ${
              addedToCart
                ? "bg-green-600 text-white"
                : "bg-black text-white hover:bg-neutral-800 disabled:bg-neutral-400"
            }`}
          >
            {addingToCart ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Adding to Cart...
              </span>
            ) : addedToCart ? (
              "Added ✓"
            ) : (
              "Add to Cart"
            )}
          </button>

          {/* Shipping info */}
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
