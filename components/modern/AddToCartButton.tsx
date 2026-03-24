"use client";

import { useOptimistic, startTransition } from "react";
import { addToCartAction } from "@/app/actions";

export default function AddToCartButton({ productId }: { productId: number }) {
  // React 19 hook: It takes the "real" state (e.g., "Add to Cart") 
  // and an optimistic state to show temporarily
  const [optimisticState, addOptimisticState] = useOptimistic(
    "Add to Cart",
    (state, newMessage: string) => newMessage
  );

  const handleAdd = () => {
    // startTransition tells React this is a non-blocking background update
    startTransition(() => {
      // 1. Instantly update the UI (0ms delay)
      addOptimisticState("Added!");
      
      // 2. Fire the slow server action in the background
      addToCartAction(productId);
    });
  };

  return (
    <button 
      onClick={handleAdd}
      disabled={optimisticState === "Added!"}
      className="bg-black text-white py-2 px-4 hover:bg-gray-800 disabled:bg-green-600 transition-colors"
    >
      {optimisticState}
    </button>
  );
}