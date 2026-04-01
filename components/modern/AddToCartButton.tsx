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
    startTransition(() => {
      // 1. Instantly update the UI (0ms perceived delay)
      addOptimisticState("added");
      // 2. Fire the slow server action in the background (800ms)
      addToCartAction(productId, nodelay);
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
