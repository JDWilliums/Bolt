export interface CartItem {
  productId: number;
  quantity: number;
}

// Notify any listening UI (e.g. the Navbar CartBadge) that the
// localStorage cart has changed. The `storage` event only fires
// across tabs, so this custom event handles same-tab updates.
function notifyCartUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("bolt-cart-updated"));
}

// ─── localStorage helpers (Control Group) ────────────────────────
export function getLocalStorageCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("bolt-cart") || "[]");
  } catch {
    return [];
  }
}

export function addToLocalStorageCart(productId: number): CartItem[] {
  const cart = getLocalStorageCart();
  const existing = cart.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ productId, quantity: 1 });
  }
  localStorage.setItem("bolt-cart", JSON.stringify(cart));
  notifyCartUpdated();
  return cart;
}

export function updateLocalStorageQuantity(
  productId: number,
  delta: number
): CartItem[] {
  let cart = getLocalStorageCart();
  const existing = cart.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity = Math.max(0, existing.quantity + delta);
    cart = cart.filter((item) => item.quantity > 0);
  }
  localStorage.setItem("bolt-cart", JSON.stringify(cart));
  notifyCartUpdated();
  return cart;
}

export function removeFromLocalStorageCart(productId: number): CartItem[] {
  const cart = getLocalStorageCart().filter(
    (item) => item.productId !== productId
  );
  localStorage.setItem("bolt-cart", JSON.stringify(cart));
  notifyCartUpdated();
  return cart;
}
