"use client";

import { useEffect, useState } from "react";
import { getCart } from "@/app/actions";
import { getLocalStorageCart } from "@/lib/cart";

// ──────────────────────────────────────────────────────────────────
// Cart badge displayed in the Navbar. Two cart backends exist in
// the artifact:
//   • Control + Image-Opt  → localStorage  (client-only)
//   • RSC + Modern + NoDelay → cookie      (server-readable)
//
// This client component detects which backend to read based on the
// active basePath, then listens to a custom `bolt-cart-updated`
// window event so that AddToCartButton / cart helpers can notify
// the badge to refresh after a mutation.
// ──────────────────────────────────────────────────────────────────
export default function CartBadge({ basePath }: { basePath: string }) {
  const [count, setCount] = useState<number>(0);

  const usesLocalStorage =
    basePath.startsWith("/control") || basePath.startsWith("/experimental/image-opt");

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      if (usesLocalStorage) {
        const cart = getLocalStorageCart();
        if (!cancelled) setCount(cart.reduce((sum, item) => sum + item.quantity, 0));
      } else {
        const cart = await getCart();
        if (!cancelled) setCount(cart.reduce((sum, item) => sum + item.quantity, 0));
      }
    };

    refresh();

    const onUpdate = (e: Event) => {
      // If the event carries an optimistic delta, bump the visible
      // count instantly (0ms perceived latency) before the server
      // action has had a chance to persist. The authoritative count
      // is reconciled by a follow-up refresh() when the action resolves.
      const detail = (e as CustomEvent<{ optimisticDelta?: number }>).detail;
      if (detail?.optimisticDelta) {
        setCount((c) => c + detail.optimisticDelta!);
        return;
      }
      refresh();
    };
    window.addEventListener("bolt-cart-updated", onUpdate);
    window.addEventListener("storage", onUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener("bolt-cart-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [usesLocalStorage]);

  return (
    <span className="absolute -top-1 -right-2 bg-white text-black text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
      {count}
    </span>
  );
}
