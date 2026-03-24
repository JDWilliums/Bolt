import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: { id: string } }) {
  // Await params in Next.js 15
  const resolvedParams = await params;
  
  // Fetch the specific product
  const productData = await db.select().from(products).where(eq(products.id, Number(resolvedParams.id)));
  const product = productData[0];

  if (!product) return notFound();

  return (
    <main className="max-w-4xl mx-auto p-8">
      <Link href="/modern" className="text-blue-600 hover:underline mb-8 inline-block">&larr; Back to Grid</Link>
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
          <p className="text-2xl font-bold mb-6">£{(product.price / 100).toFixed(2)}</p>
          <p className="text-lg text-gray-700 mb-8">{product.description}</p>
          <button className="bg-black text-white py-4 px-8 rounded-full font-bold hover:bg-gray-800 transition-all transform hover:scale-105">
            Checkout Now
          </button>
        </div>
      </div>
    </main>
  );
}