import Link from "next/link";

const categories = ["Running", "Training", "Lifestyle", "Basketball", "Football"];

export default function Navbar({ basePath }: { basePath: string }) {
  return (
    <nav className="bg-black text-white sticky top-0 z-50">
      {/* Top announcement bar */}
      <div className="bg-neutral-900 text-center text-xs py-1.5 tracking-wide text-neutral-400">
        Free Delivery on Orders Over £50
      </div>

      <div className="max-w-[1600px] mx-auto flex items-center justify-between px-4 md:px-8 h-14">
        {/* Logo */}
        <Link href={basePath} className="text-xl font-extrabold tracking-tighter uppercase">
          Bolt
        </Link>

        {/* Category Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`${basePath}?category=${cat}`}
              className="hover:text-neutral-400 transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Cart icon (cosmetic) */}
        <div className="flex items-center gap-4">
          <button className="relative" aria-label="Shopping cart">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <span className="absolute -top-1 -right-2 bg-white text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">0</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
