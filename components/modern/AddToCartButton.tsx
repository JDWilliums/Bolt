"use client";

import { useOptimistic, startTransition } from "react";
import { usePathname } from "next/navigation";
import { addToCartAction } from "@/app/actions";

export default function AddToCartButton({
  productId,
  variant = "default",
}: {
  productId: number;
  variant?: "default" | "quick";
}) {
  const nodelay = usePathname().startsWith("/experimental/nodelay");
  const [optimisticState, addOptimisticState] = useOptimistic(
    "idle" as "idle" | "added",
    (_state, next: "idle" | "added") => next
  );

  const handleAdd = () => {
    // 1. Instantly update the Navbar badge (0ms perceived delay).
    //    The badge listens for this event and re-reads the cart.
    //    Note: for the cookie-based backend the cookie hasn't been
    //    written yet, so the badge optimistically bumps its own
    //    local count via the event's detail payload.
    window.dispatchEvent(
      new CustomEvent("bolt-cart-updated", { detail: { optimisticDelta: 1 } })
    );

    startTransition(() => {
      // 2. Instantly update the button's own state (0ms perceived delay)
      addOptimisticState("added");
      // 3. Fire the slow server action in the background (800ms).
      //    When it resolves, dispatch the event again so the badge
      //    reconciles with the authoritative cookie state.
      addToCartAction(productId, nodelay).then(() => {
        window.dispatchEvent(new Event("bolt-cart-updated"));
      });
    });
  };

  if (variant === "quick") {
    return (
      <button
        onClick={handleAdd}
        disabled={optimisticState === "added"}
        className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
          optimisticState === "added"
            ? "bg-green-600 text-white"
            : "bg-white text-black hover:bg-neutral-200"
        }`}
      >
        {optimisticState === "added" ? "Added ✓" : "Quick Add"}
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={optimisticState === "added"}
      className={`w-full py-2.5 rounded-full text-sm font-medium transition-colors ${
        optimisticState === "added"
          ? "bg-green-600 text-white"
          : "bg-black text-white hover:bg-neutral-800"
      }`}
    >
      {optimisticState === "added" ? "Added ✓" : "Add to Cart"}
    </button>
  );
}
