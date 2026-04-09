"use client";

import { useOptimistic, startTransition } from "react";
import Image from "next/image";
import { updateCartQuantity, removeFromCart } from "@/app/actions";

interface CartItemData {
  productId: number;
  quantity: number;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
}

// Optimistic UI for cart interactions — every quantity change and
// removal updates the UI instantly via useOptimistic. The server
// action runs in the background and reconciles asynchronously.

type OptimisticAction =
  | { type: "update"; productId: number; delta: number }
  | { type: "remove"; productId: number };

export default function CartItems({
  initialItems,
}: {
  initialItems: CartItemData[];
}) {
  const [optimisticItems, addOptimisticAction] = useOptimistic(
    initialItems,
    (state: CartItemData[], action: OptimisticAction) => {
      if (action.type === "remove") {
        return state.filter((item) => item.productId !== action.productId);
      }
      return state
        .map((item) => {
          if (item.productId !== action.productId) return item;
          return { ...item, quantity: Math.max(0, item.quantity + action.delta) };
        })
        .filter((item) => item.quantity > 0);
    }
  );

  const handleQuantityChange = (productId: number, delta: number) => {
    window.dispatchEvent(
      new CustomEvent("bolt-cart-updated", { detail: { optimisticDelta: delta } })
    );
    startTransition(() => {
      addOptimisticAction({ type: "update", productId, delta });
      updateCartQuantity(productId, delta).then(() => {
        window.dispatchEvent(new Event("bolt-cart-updated"));
      });
    });
  };

  const handleRemove = (productId: number) => {
    const removed = optimisticItems.find((item) => item.productId === productId);
    const delta = removed ? -removed.quantity : 0;
    window.dispatchEvent(
      new CustomEvent("bolt-cart-updated", { detail: { optimisticDelta: delta } })
    );
    startTransition(() => {
      addOptimisticAction({ type: "remove", productId });
      removeFromCart(productId).then(() => {
        window.dispatchEvent(new Event("bolt-cart-updated"));
      });
    });
  };

  if (optimisticItems.length === 0) {
    return (
      <p className="text-center text-neutral-500 py-12 text-lg">
        Your cart is empty
      </p>
    );
  }

  return (
    <div>
      {optimisticItems.map((item, index) => (
        <div
          key={item.productId}
          className="flex gap-6 py-6 border-b border-neutral-100 items-center"
        >
          <div className="w-[120px] h-[120px] flex-shrink-0 rounded-xl overflow-hidden bg-neutral-100 relative">
            {index === 0 ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="120px"
                quality={60}
                className="object-cover"
                priority
                fetchPriority="high"
              />
            ) : (
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="120px"
                quality={60}
                className="object-cover"
              />
            )}
          </div>

          <div className="flex-1 flex flex-col gap-1">
            <h3 className="font-bold text-base">{item.name}</h3>
            <p className="text-sm text-neutral-500">{item.category}</p>
            <p className="font-bold text-base">
              £{(item.price / 100).toFixed(2)}
            </p>

            {/* Quantity Controls — instant optimistic response */}
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => handleQuantityChange(item.productId, -1)}
                className="w-8 h-8 rounded-full border-2 border-black font-bold text-sm flex items-center justify-center hover:bg-black hover:text-white transition-colors"
              >
                −
              </button>
              <span className="font-bold text-sm w-6 text-center">
                {item.quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(item.productId, 1)}
                className="w-8 h-8 rounded-full border-2 border-black font-bold text-sm flex items-center justify-center hover:bg-black hover:text-white transition-colors"
              >
                +
              </button>
            </div>

            <button
              onClick={() => handleRemove(item.productId)}
              className="text-xs text-neutral-400 underline hover:text-red-500 mt-2 self-start transition-colors"
            >
              Remove
            </button>
          </div>

          <p className="font-bold text-lg">
            £{((item.price * item.quantity) / 100).toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  );
}
