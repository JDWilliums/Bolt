import RSCFilterBar from "@/components/rsc/FilterBar";
import RSCProductGrid from "@/components/rsc/ProductGrid";

// This server component lives inside a <Suspense> boundary.
// It awaits the searchParams promise (dynamic data), triggering
// streaming — the outer shell renders first while this streams in.
export default async function RSCFilterableGrid({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  return (
    <>
      <RSCFilterBar />
      <RSCProductGrid category={category} />
    </>
  );
}
