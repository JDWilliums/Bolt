import { db } from "@/db";
import { products } from "@/db/schema";
import Image from "next/image";
import AddToCartButton from "@/components/modern/AddToCartButton";

export default async function ModernStorefront() {
  // 1. SERVER-SIDE FETCHING: No waterfalls. Data is ready before the HTML leaves the server.
  const data = await db.select().from(products);

  return (
    <main className="max-w-7xl mx-auto p-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Bolt Store (Modern)</h1>
        <p className="text-green-600 font-bold">Server-Side Rendered • Optimised Assets • Optimistic UI</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {data.map((product, index) => (
          <div key={product.id} className="border p-4 flex flex-col">
            
            {/* 2. ASSET INTELLIGENCE: Explicit sizing (fill + aspect-square) prevents CLS.
                Next.js automatically converts the 3000px Unsplash image into a lightweight AVIF. */}
            <div className="mb-4 relative w-full aspect-square">
              <Image 
                src={product.imageUrl} 
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                priority={index < 4} // Tell the browser to prioritize the first 4 images for instant LCP
                className="object-cover" 
              />
            </div>
            
            <h2 className="text-lg font-bold">{product.name}</h2>
            <p className="text-sm text-gray-600 mb-4 flex-grow">{product.description}</p>
            <p className="font-bold text-xl mb-4">£{(product.price / 100).toFixed(2)}</p>
            
            {/* 3. OPTIMISTIC UI: The isolated client component */}
            <AddToCartButton productId={product.id} />
          </div>
        ))}
      </div>
    </main>
  );
}