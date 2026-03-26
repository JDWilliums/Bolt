import { db } from "@/db";
import { products } from "@/db/schema";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";

export default async function ProductGrid() {
  // The database query is now isolated inside this specific component
  const data = await db.select().from(products);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {data.map((product, index) => (
        <div key={product.id} className="border p-4 flex flex-col hover:shadow-lg transition-shadow relative group">
          <Link 
            href={`/experimental/modern/product/${product.id}`}
            prefetch={true}
            className="absolute inset-0 z-10"
            aria-label={`View ${product.name}`}
          >
            <span className="sr-only">View Product</span>
          </Link>
          
          <div className="mb-4 relative w-full aspect-square">
            <Image 
              src={product.imageUrl} 
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              priority={index < 4}
              className="object-cover" 
            />
          </div>
          
          <h2 className="text-lg font-bold">{product.name}</h2>
          <p className="text-sm text-gray-600 mb-4 flex-grow">{product.description}</p>
          <p className="font-bold text-xl mb-4">£{(product.price / 100).toFixed(2)}</p>
          
          <div className="relative z-20 mt-auto">
            <AddToCartButton productId={product.id} />
          </div>
        </div>
      ))}
    </div>
  );
}