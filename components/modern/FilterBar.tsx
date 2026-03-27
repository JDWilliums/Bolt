"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const categories = ["All", "Running", "Training", "Lifestyle", "Basketball", "Football"];

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeCategory = searchParams.get("category") || "All";

  const handleFilter = (category: string) => {
    // useTransition keeps the current UI responsive while the
    // server fetches the filtered data in the background.
    // The user never sees a loading spinner — the old grid
    // stays visible until the new one streams in.
    startTransition(() => {
      if (category === "All") {
        router.push("/experimental/modern");
      } else {
        router.push(`/experimental/modern?category=${category}`);
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
