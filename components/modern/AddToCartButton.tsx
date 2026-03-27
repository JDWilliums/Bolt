"use client";

import { useOptimistic, startTransition } from "react";
import { addToCartAction } from "@/app/actions";

export default function AddToCartButton({ productId }: { productId: number }) {
  const [optimisticState, addOptimisticState] = useOptimistic(
    "idle" as "idle" | "added",
    (_state, next: "idle" | "added") => next
  );

  const handleAdd = () => {
    startTransition(() => {
      // 1. Instantly update the UI (0ms perceived delay)
      addOptimisticState("added");
      // 2. Fire the slow server action in the background (800ms)
      addToCartAction(productId);
    });
  };

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
