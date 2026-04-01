"use server";

import { cookies } from "next/headers";

const SIMULATE_DELAY = process.env.NEXT_PUBLIC_BOLT_SIMULATE_DELAY !== "false";

export interface CartItem {
  productId: number;
  quantity: number;
}

// ──────────────────────────────────────────────────────────────────
// CART COOKIE HELPERS (Experimental Group)
// Using cookies instead of localStorage means the cart state is
// available on the server — enabling server-side rendering of the
// cart page without a client-side fetch waterfall.
// ──────────────────────────────────────────────────────────────────
async function readCart(): Promise<CartItem[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("bolt-cart")?.value;
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeCart(cart: CartItem[]) {
  const cookieStore = await cookies();
  cookieStore.set("bolt-cart", JSON.stringify(cart), {
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
  });
}

// ──────────────────────────────────────────────────────────────────
// ADD TO CART
// Simulates a slow database mutation (800ms). The experimental
// group uses useOptimistic to show success instantly while this
// runs in the background. The control group blocks the UI.
// ──────────────────────────────────────────────────────────────────
export async function addToCartAction(productId: number, nodelay = false) {
  if (SIMULATE_DELAY && !nodelay) await new Promise((resolve) => setTimeout(resolve, 800));

  const cart = await readCart();
  const existing = cart.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ productId, quantity: 1 });
  }
  await writeCart(cart);

  return { success: true, productId };
}

// ──────────────────────────────────────────────────────────────────
// GET CART — reads cart items from the cookie (server-side)
// ──────────────────────────────────────────────────────────────────
export async function getCart(): Promise<CartItem[]> {
  return readCart();
}

// ──────────────────────────────────────────────────────────────────
// UPDATE QUANTITY — increment or decrement an item's quantity
// ──────────────────────────────────────────────────────────────────
export async function updateCartQuantity(productId: number, delta: number, nodelay = false) {
  if (SIMULATE_DELAY && !nodelay) await new Promise((resolve) => setTimeout(resolve, 500));

  let cart = await readCart();
  const existing = cart.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity = Math.max(0, existing.quantity + delta);
    cart = cart.filter((item) => item.quantity > 0);
  }
  await writeCart(cart);

  return { success: true, cart };
}

// ──────────────────────────────────────────────────────────────────
// REMOVE FROM CART
// ──────────────────────────────────────────────────────────────────
export async function removeFromCart(productId: number, nodelay = false) {
  if (SIMULATE_DELAY && !nodelay) await new Promise((resolve) => setTimeout(resolve, 300));

  const cart = (await readCart()).filter(
    (item) => item.productId !== productId
  );
  await writeCart(cart);

  return { success: true, cart };
}
