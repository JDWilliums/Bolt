import { db } from "@/db";
import { products } from "@/db/schema";
import Image from "next/image";
import Link from "next/link";
import { desc } from "drizzle-orm";

export default async function ProductCarousel() {
  // Fetch the 6 newest products for the carousel
  const carouselData = await db.select().from(products).orderBy(desc(products.id)).limit(6);

  return (
    <section id="new-arrivals" className="mb-20">
      <div className="flex justify-between items-end mb-8 px-4 md:px-8">
        <h2 className="text-3xl font-extrabold tracking-tight">New Arrivals</h2>
        <span className="text-gray-500 font-medium hidden md:block">Swipe to explore &rarr;</span>
      </div>

      {/* CSS-ONLY CAROUSEL: overflow-x-auto and snap-x eliminate the need for JavaScript */}
      <div className="flex overflow-x-auto gap-6 pb-8 px-4 md:px-8 snap-x snap-mandatory">
        {carouselData.map((product) => (
          <div 
            key={product.id} 
            className="min-w-[280px] md:min-w-[350px] snap-start relative group flex flex-col"
          >
            <Link 
              href={`/experimental/modern/product/${product.id}`}
              prefetch={true}
              className="absolute inset-0 z-10"
            >
              <span className="sr-only">View {product.name}</span>
            </Link>
            
            <div className="relative w-full aspect-[4/5] bg-gray-100 mb-4 overflow-hidden rounded-lg">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="280px"
                quality={60}
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 left-2 bg-white text-black text-xs font-bold px-3 py-1 uppercase tracking-wider rounded">
                Just Dropped
              </div>
            </div>
            
            <h3 className="text-lg font-bold">{product.name}</h3>
            <p className="text-gray-500">{product.category}</p>
            <p className="font-bold text-xl mt-2">£{(product.price / 100).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}