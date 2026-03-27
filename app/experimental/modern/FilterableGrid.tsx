import FilterBar from "@/components/modern/FilterBar";
import ProductGrid from "@/components/modern/ProductGrid";

// This server component lives inside a <Suspense> boundary.
// It awaits the searchParams promise (dynamic data), which
// triggers the PPR dynamic hole — the static shell renders
// instantly while this component streams in.
export default async function FilterableGrid({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  return (
    <>
      <FilterBar />
      <ProductGrid category={category} />
    </>
  );
}
