import { Suspense } from "react";
import Link from "next/link";
import { db } from "@/db";
import { products } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { getCart } from "@/app/actions";
import CartItems from "@/app/experimental/modern/cart/CartItems";

export const metadata = {
  title: "Your Cart — Bolt Store",
};

export default async function NoDelayCartPage() {
  return (
    <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 min-h-screen">
      <h1 className="text-3xl font-extrabold tracking-tight uppercase mb-8">
        Your Cart
      </h1>
      <Suspense fallback={<CartSkeleton />}>
        <CartContent />
      </Suspense>
    </main>
  );
}

async function CartContent() {
  const cartItems = await getCart();

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-neutral-500 mb-6">Your cart is empty</p>
        <Link
          href="/experimental/nodelay"
          className="inline-block bg-black text-white font-bold py-3 px-8 rounded-full hover:bg-neutral-800 transition-colors"
          prefetch={true}
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const productIds = cartItems.map((item) => item.productId);
  const cartProducts = await db
    .select()
    .from(products)
    .where(inArray(products.id, productIds));

  const items = cartItems
    .map((item) => {
      const product = cartProducts.find((p) => p.id === item.productId);
      if (!product) return null;
      return { ...item, product };
    })
    .filter(Boolean) as Array<{
    productId: number;
    quantity: number;
    product: typeof cartProducts[number];
  }>;

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-neutral-500 mb-6">Your cart is empty</p>
        <Link
          href="/experimental/nodelay"
          className="inline-block bg-black text-white font-bold py-3 px-8 rounded-full hover:bg-neutral-800 transition-colors"
          prefetch={true}
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal > 5000 ? 0 : 499;
  const total = subtotal + shipping;

  return (
    <div>
      <CartItems
        initialItems={items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          name: item.product.name,
          category: item.product.category,
          price: item.product.price,
          imageUrl: item.product.imageUrl,
        }))}
      />

      <div className="mt-8 p-6 bg-neutral-50 rounded-2xl border border-neutral-200">
        <div className="flex justify-between py-2 text-sm text-neutral-500">
          <span>Subtotal</span>
          <span>£{(subtotal / 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 text-sm text-neutral-500">
          <span>Shipping</span>
          <span>
            {shipping === 0 ? "Free" : `£${(shipping / 100).toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between pt-4 mt-2 border-t-2 border-black text-xl font-bold">
          <span>Total</span>
          <span>£{(total / 100).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div>
      <div className="flex gap-6 py-6 border-b border-neutral-100 items-center">
        <div className="w-[120px] h-[120px] bg-neutral-100 rounded-xl animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-48 bg-neutral-200 rounded animate-pulse" />
          <div className="h-4 w-24 bg-neutral-100 rounded animate-pulse" />
          <div className="h-5 w-20 bg-neutral-200 rounded animate-pulse" />
          <div className="flex gap-3 mt-2">
            <div className="w-8 h-8 rounded-full bg-neutral-100 animate-pulse" />
            <div className="w-6 h-8 bg-neutral-100 rounded animate-pulse" />
            <div className="w-8 h-8 rounded-full bg-neutral-100 animate-pulse" />
          </div>
        </div>
        <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
      </div>

      <div className="mt-8 p-6 bg-neutral-50 rounded-2xl border border-neutral-200">
        <div className="flex justify-between py-2">
          <div className="h-4 w-16 bg-neutral-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-neutral-200 rounded animate-pulse" />
        </div>
        <div className="flex justify-between py-2">
          <div className="h-4 w-16 bg-neutral-200 rounded animate-pulse" />
          <div className="h-4 w-12 bg-neutral-200 rounded animate-pulse" />
        </div>
        <div className="flex justify-between pt-4 mt-2 border-t-2 border-neutral-200">
          <div className="h-6 w-12 bg-neutral-200 rounded animate-pulse" />
          <div className="h-6 w-20 bg-neutral-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
