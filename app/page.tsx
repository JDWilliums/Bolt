import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl text-center mb-16">
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter uppercase mb-4">
          Bolt.
        </h1>
        <p className="text-lg text-neutral-400 max-w-xl mx-auto">
          BSc Dissertation Artifact - Optimising Modern Web Application Performance:
          An Empirical Analysis of Core Web Vitals and Perceived Latency.
        </p>
        <p className="text-sm text-neutral-600 mt-2">Jack Williams - ST20271634 - Cardiff Metropolitan University</p>
      </div>

      {/* ─── STAGE PROGRESSION ─────────────────────────────────── */}
      <div className="w-full max-w-4xl mb-8">
        <div className="flex items-center justify-center gap-2 text-s text-neutral-600 mb-8">
          <span className="bg-red-500/20 text-white px-3 py-1 rounded-full font-bold">Control</span>
          <span className="text-white">→</span>
          <span className="bg-orange-500/20 text-white px-3 py-1 rounded-full font-bold">+ Images</span>
          <span className="text-white">→</span>
          <span className="bg-blue-500/20 text-white px-3 py-1 rounded-full font-bold">+ RSC</span>
          <span className="text-white">→</span>
          <span className="bg-green-500/20 text-white px-3 py-1 rounded-full font-bold">+ PPR</span>
          <span className="text-white">→</span>
          <span className="bg-purple-500/20 text-white px-3 py-1 rounded-full font-bold">No Delay</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-5 gap-6 w-full max-w-6xl">
        {/* ─── CONTROL ─────────────────────────────────────────── */}
        <Link
          href="/control/legacy"
          className="group border border-neutral-800 rounded-2xl p-8 pb-6 hover:border-red-500 transition-all hover:bg-neutral-950 flex flex-col"
        >
          
          <h2 className="text-2xl font-bold mb-3">Legacy CSR</h2>
          <ul className="text-sm text-neutral-400 space-y-1.5">
            <li>• Client-side data fetching (useEffect waterfall)</li>
            <li>• Unoptimised images (&lt;img&gt;, no dimensions)</li>
            <li>• CSS-in-JS runtime overhead (styled-components)</li>
            <li>• Render-blocking Google Fonts</li>
            <li>• Blocking third-party script (200ms)</li>
            <li>• Pessimistic UI (loading spinners)</li>
            <li>• Client-side sorting (main thread blocking)</li>
            <li>• localStorage cart with sequential fetches</li>
          </ul>
          <div className="mt-auto self-center rounded border border-neutral-700 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 transition-colors duration-200 group-hover:border-white group-hover:bg-white group-hover:text-black">
            Open
          </div>
        </Link>

        {/* ─── STAGE A: IMAGE OPTIMISED ────────────────────────── */}
        <Link
          href="/experimental/image-opt"
          className="group border border-neutral-800 rounded-2xl p-8 pb-6 hover:border-orange-500 transition-all hover:bg-neutral-950 flex flex-col"
        >
          
          <h2 className="text-2xl font-bold mb-3">CSR + Optimised Images</h2>
          <ul className="text-sm text-neutral-400 space-y-1.5">
            <li>• <span className="text-orange-400">next/image (AVIF, quality 60, responsive)</span></li>
            <li>• <span className="text-orange-400">Blur-up placeholders</span></li>
            <li>• <span className="text-orange-400">fetchpriority=&quot;high&quot; on LCP images</span></li>
            <li>• <span className="text-orange-400">Proper sizes attributes</span></li>
            <li className="text-neutral-600">• Still client-side rendering</li>
            <li className="text-neutral-600">• Still styled-components / blocking fonts</li>
            <li className="text-neutral-600">• Still useEffect waterfall</li>
            <li className="text-neutral-600">• Still pessimistic UI / localStorage cart</li>
          </ul>
          <div className="mt-auto self-center rounded border border-neutral-700 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 transition-colors duration-200 group-hover:border-white group-hover:bg-white group-hover:text-black">
            Open
          </div>
        </Link>

        {/* ─── STAGE B: SERVER COMPONENTS ───────────────────────── */}
        <Link
          href="/experimental/rsc"
          className="group border border-neutral-800 rounded-2xl p-8 pb-6 hover:border-blue-500 transition-all hover:bg-neutral-950 flex flex-col"
        >
          
          <h2 className="text-2xl font-bold mb-3">RSC + Streaming</h2>
          <ul className="text-sm text-neutral-400 space-y-1.5">
            <li>• <span className="text-blue-400">React Server Components (zero client JS)</span></li>
            <li>• <span className="text-blue-400">Suspense streaming with skeleton fallbacks</span></li>
            <li>• <span className="text-blue-400">Server-side data fetching (single DB query)</span></li>
            <li>• <span className="text-blue-400">useOptimistic for instant cart updates</span></li>
            <li>• <span className="text-blue-400">Tailwind CSS (no runtime overhead)</span></li>
            <li>• <span className="text-blue-400">next/font (self-hosted, no blocking)</span></li>
            <li>• <span className="text-blue-400">Cookie-based cart via server actions</span></li>
            <li className="text-neutral-600">• No PPR or static generation (fully dynamic)</li>
          </ul>
          <div className="mt-auto self-center rounded border border-neutral-700 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 transition-colors duration-200 group-hover:border-white group-hover:bg-white group-hover:text-black">
            Open
          </div>
        </Link>

        {/* ─── STAGE C: FULLY OPTIMISED (PPR) ──────────────────── */}
        <Link
          href="/experimental/modern"
          className="group border border-neutral-800 rounded-2xl p-8 pb-6 hover:border-green-500 transition-all hover:bg-neutral-950 flex flex-col"
        >
          
          <h2 className="text-2xl font-bold mb-3">RSC + PPR + SSG</h2>
          <ul className="text-sm text-neutral-400 space-y-1.5">
            <li>• <span className="text-green-400">Partial Prerendering (instant static shell)</span></li>
            <li>• <span className="text-green-400">generateStaticParams (SSG at build time)</span></li>
            <li>• <span className="text-green-400">Link prefetching (0ms navigation)</span></li>
            <li>• All RSC optimisations from Stage B</li>
            <li>• All image optimisations from Stage A</li>
            <li>• Server-side sorting (DB ORDER BY)</li>
            <li>• Optimistic UI + cookie cart</li>
            <li>• next/image with AVIF + blur placeholders</li>
          </ul>
          <div className="mt-auto self-center rounded border border-neutral-700 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 transition-colors duration-200 group-hover:border-white group-hover:bg-white group-hover:text-black">
            Open
          </div>
        </Link>

        {/* ─── STAGE D: NO DELAY ──────────────────────────────── */}
        <Link
          href="/experimental/nodelay"
          className="group border border-neutral-800 rounded-2xl p-8 pb-6 hover:border-purple-500 transition-all hover:bg-neutral-950 flex flex-col"
        >
          
          <h2 className="text-2xl font-bold mb-3">Zero Artificial Latency</h2>
          <ul className="text-sm text-neutral-400 space-y-1.5">
            <li>• <span className="text-purple-400">All simulated delays removed</span></li>
            <li>• <span className="text-purple-400">No 800ms cart mutations</span></li>
            <li>• <span className="text-purple-400">No 1.5s stock check delay</span></li>
            <li>• <span className="text-purple-400">No API route latency simulation</span></li>
            <li>• All Stage C optimisations (PPR, SSG, RSC)</li>
            <li>• Isolates architecture vs simulated latency</li>
            <li>• Closest to a real optimised production site</li>
            <li>• Best-case Next.js performance baseline</li>
          </ul>
          <div className="mt-auto self-center rounded border border-neutral-700 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 transition-colors duration-200 group-hover:border-white group-hover:bg-white group-hover:text-black">
            Open
          </div>
        </Link>
      </div>

      {/* ─── BENCHMARK INFO ────────────────────────────────────── */}
      <div className="mt-12 text-center text-xs text-neutral-700 max-w-2xl">
        <p>Each stage is benchmarked across No Throttling, 4G, Fast 3G, and Slow 3G network profiles.</p>
        <p className="mt-1">Metrics: FCP, LCP, TBT, CLS, SI - 10 iterations per page, trimmed median.</p>
      </div>
    </main>
  );
}
