import { Suspense } from "react";
import ImageOptProductView from "./ImageOptProductView";

export default function ImageOptProductPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-12 h-12 border-4 border-neutral-200 border-t-black rounded-full animate-spin"></div>
      </div>
    }>
      <ImageOptProductView />
    </Suspense>
  );
}
