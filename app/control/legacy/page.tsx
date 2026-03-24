"use client";

import { useEffect, useState } from "react";

// Define the shape of our product data
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

export default function LegacyStorefront() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  // 1. THE WATERFALL: Fetching data only after the component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
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

  // 3. PESSIMISTIC UI: Blocking state while waiting for "server"
  const handleAddToCart = async (id: number) => {
    setAddingToCart(id);
    // Simulate a slow network request (800ms) before updating the UI
    await new Promise((resolve) => setTimeout(resolve, 800));
    alert("Added to cart!"); // Legacy-style feedback
    setAddingToCart(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl font-bold animate-pulse">Loading App...</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Bolt Store (Legacy)</h1>
        <p className="text-gray-500">Client-Side Rendered • Unoptimised Assets</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {data.map((product) => (
          <div key={product.id} className="border p-4 flex flex-col">
            {/* 2. UNOPTIMISED ASSETS: Standard img tag, no width/height to cause Layout Shift */}
            <div className="mb-4">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                // Intentionally leaving out width/height attributes!
                className="w-full object-cover" 
              />
            </div>
            
            <h2 className="text-lg font-bold">{product.name}</h2>
            <p className="text-sm text-gray-600 mb-4 flex-grow">{product.description}</p>
            <p className="font-bold text-xl mb-4">£{(product.price / 100).toFixed(2)}</p>
            
            <button 
              onClick={() => handleAddToCart(product.id)}
              disabled={addingToCart === product.id}
              className="bg-black text-white py-2 px-4 hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
            >
              {addingToCart === product.id ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}