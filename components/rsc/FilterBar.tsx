"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const categories = ["All", "Running", "Training", "Lifestyle", "Basketball", "Football"];

export default function RSCFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeCategory = searchParams.get("category") || "All";

  const handleFilter = (category: string) => {
    startTransition(() => {
      if (category === "All") {
        router.push("/experimental/rsc");
      } else {
        router.push(`/experimental/rsc?category=${category}`);
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => handleFilter(cat)}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
            activeCategory === cat
              ? "bg-black text-white"
              : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
          } ${isPending ? "opacity-70" : ""}`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
