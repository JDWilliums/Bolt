import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-3xl text-center mb-16">
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter uppercase mb-4">
          Bolt
        </h1>
        <p className="text-lg text-neutral-400 max-w-xl mx-auto">
          BSc Dissertation Artifact — Optimising Modern Web Application Performance:
          An Empirical Analysis of Core Web Vitals and Perceived Latency.
        </p>
        <p className="text-sm text-neutral-600 mt-2">Jack Williams — ST20271634 — Cardiff Metropolitan University</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
        {/* Control Group */}
        <Link
          href="/control/legacy"
          className="group border border-neutral-800 rounded-2xl p-8 hover:border-red-500 transition-all hover:bg-neutral-950"
        >
          <div className="text-xs font-bold uppercase tracking-widest text-red-500 mb-3">
            Group A — Control
          </div>
          <h2 className="text-2xl font-bold mb-3">Legacy CSR</h2>
          <ul className="text-sm text-neutral-400 space-y-1.5">
            <li>• Client-side data fetching (useEffect)</li>
            <li>• Unoptimised images (&lt;img&gt;)</li>
            <li>• No dimension attributes (CLS)</li>
            <li>• Blocking third-party script</li>
            <li>• Pessimistic UI (loading spinners)</li>
            <li>• Full JS bundle shipped to client</li>
          </ul>
          <div className="mt-6 text-sm font-medium text-neutral-500 group-hover:text-white transition-colors">
            Open Control Store &rarr;
          </div>
        </Link>

        {/* Experimental Group */}
        <Link
          href="/experimental/modern"
          className="group border border-neutral-800 rounded-2xl p-8 hover:border-green-500 transition-all hover:bg-neutral-950"
        >
          <div className="text-xs font-bold uppercase tracking-widest text-green-500 mb-3">
            Group B — Experimental
          </div>
          <h2 className="text-2xl font-bold mb-3">Optimised RSC</h2>
          <ul className="text-sm text-neutral-400 space-y-1.5">
            <li>• React Server Components</li>
            <li>• Streaming with Suspense</li>
            <li>• next/image (AVIF, lazy, blur-up)</li>
            <li>• Optimistic UI (useOptimistic)</li>
            <li>• Link prefetching</li>
            <li>• Partial Prerendering</li>
          </ul>
          <div className="mt-6 text-sm font-medium text-neutral-500 group-hover:text-white transition-colors">
            Open Optimised Store &rarr;
          </div>
        </Link>
      </div>
    </main>
  );
}
