import { connection } from "next/server";

export default async function LiveStock({ productId, nodelay }: { productId: number; nodelay?: boolean }) {
    // Mark as dynamic so Math.random() is allowed during SSR
    await connection();

    // Simulate a slow inventory check to a warehouse API (1.5 seconds)
    if (!nodelay && process.env.NEXT_PUBLIC_BOLT_SIMULATE_DELAY !== "false")
      await new Promise((resolve) => setTimeout(resolve, 1500));

    // Randomly decide if it's in stock for the demo
    const inStock = Math.random() > 0.2;

    return (
      <div className="text-sm font-bold">
        {inStock ? 'In Stock' : 'Out of Stock'}
      </div>
    );
  }
