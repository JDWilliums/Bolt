import { Suspense } from "react";
import LegacyCategoryView from "./LegacyCategoryView";

export default function LegacyCategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="w-12 h-12 border-4 border-neutral-200 border-t-black rounded-full animate-spin" />
        </div>
      }
    >
      <LegacyCategoryView />
    </Suspense>
  );
}
