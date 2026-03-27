import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";

export default async function ProductGrid({ category }: { category?: string }) {
  // Server-side filtering: the WHERE clause runs on the database,
  // not in the browser. Only matching rows are serialised to HTML.
  const data = category
    ? await db.select().from(products).where(eq(products.category, category))
    : await db.select().from(products);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {data.map((product, index) => (
        <div key={product.id} className="group flex flex-col">
          <Link
            href={`/experimental/modern/product/${product.id}`}
            prefetch={true}
            className="block mb-3"
          >
            <div className="bg-neutral-100 overflow-hidden rounded-lg relative aspect-square">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                priority={index < 4}
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>

          <div className="flex flex-col flex-grow">
            <Link
              href={`/experimental/modern/product/${product.id}`}
              prefetch={true}
              className="hover:underline"
            >
              <h3 className="font-bold text-base">{product.name}</h3>
            </Link>
            <p className="text-sm text-neutral-500 mb-1">{product.category}</p>
            <p className="font-bold text-base mb-3">£{(product.price / 100).toFixed(2)}</p>
            <div className="mt-auto">
              <AddToCartButton productId={product.id} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
