"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export default function CategorySortBar({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSort = searchParams.get("sort") || "default";

  const handleSort = (sort: string) => {
    startTransition(() => {
      if (sort === "default") {
        router.push(`/experimental/nodelay/category/${slug}`);
      } else {
        router.push(`/experimental/nodelay/category/${slug}?sort=${sort}`);
      }
    });
  };

  return (
    <select
      value={currentSort}
      onChange={(e) => handleSort(e.target.value)}
      className={`px-4 py-2 border-2 border-neutral-200 rounded-full text-sm font-medium bg-white outline-none transition-all focus:border-black ${
        isPending ? "opacity-70" : ""
      }`}
    >
      <option value="default">Featured</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
    </select>
  );
}
