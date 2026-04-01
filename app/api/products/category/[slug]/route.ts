import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CATEGORY_DISPLAY, type CategorySlug } from "@/lib/categories";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const displayName = CATEGORY_DISPLAY[slug as CategorySlug];

    if (!displayName) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Artificial delay (500ms) to simulate a slow legacy backend
    if (process.env.NEXT_PUBLIC_BOLT_SIMULATE_DELAY !== "false")
      await new Promise((resolve) => setTimeout(resolve, 500));

    const categoryProducts = await db
      .select()
      .from(products)
      .where(eq(products.category, displayName));

    return NextResponse.json(categoryProducts);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
