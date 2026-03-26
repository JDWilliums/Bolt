import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import LiveStock from "@/components/modern/LiveStock";
import { unstable_cache } from "next/cache"; // <-- 1. Import the Next.js cache utility

export async function generateStaticParams() {
  const allProducts = await db.select({ id: products.id }).from(products);
  return allProducts.map((product) => ({
    id: String(product.id),
  }));
}

// 2. NEW: Wrap the raw Drizzle query in Next.js's cache.
// This forces the compiler to treat the database result as static HTML during the build.
const getCachedProduct = unstable_cache(
  async (id: number) => {
    const productData = await db.select().from(products).where(eq(products.id, id));
    return productData[0];
  },
  ['product-detail-cache'] // A unique tag for this cache
);

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  // 3. Call the cached wrapper instead of the raw database!
  const product = await getCachedProduct(Number(resolvedParams.id));

  if (!product) return notFound();

  return (
    <main className="max-w-4xl mx-auto p-8">
      <Link href="/experimental/modern" className="text-blue-600 hover:underline mb-8 inline-block">&larr; Back to Grid</Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="relative aspect-square w-full">
          <Image 
            src={product.imageUrl} 
            alt={product.name} 
            fill 
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            className="object-cover rounded-xl shadow-2xl" 
          />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-extrabold mb-2">{product.name}</h1>
          <p className="text-gray-500 mb-6">{product.category}</p>
          <p className="text-2xl font-bold mb-4">£{(product.price / 100).toFixed(2)}</p>
          
          <div className="mb-6 h-6">
            <Suspense fallback={<div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>}>
              <LiveStock productId={product.id} />
            </Suspense>
          </div>

          <p className="text-lg text-gray-700 mb-8">{product.description}</p>
          <button className="bg-black text-white py-4 px-8 rounded-full font-bold hover:bg-gray-800 transition-all transform hover:scale-105">
            Checkout Now
          </button>
        </div>
      </div>
    </main>
  );
}