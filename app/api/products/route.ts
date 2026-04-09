import { NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';

export async function GET() {
  try {
    // Fetch all products from Neon
    const allProducts = await db.select().from(products);
    
    // Artificial delay (500ms) to simulate a slow legacy backend/network
    if (process.env.NEXT_PUBLIC_BOLT_SIMULATE_DELAY !== "false")
      await new Promise((resolve) => setTimeout(resolve, 500));
    
    return NextResponse.json(allProducts);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}