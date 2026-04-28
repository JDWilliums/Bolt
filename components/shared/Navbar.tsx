import Link from "next/link";
import CartBadge from "./CartBadge";

const categories = ["Running", "Training", "Lifestyle", "Basketball", "Football"];

export default function Navbar({ basePath }: { basePath: string }) {
  return (
    <nav className="bg-black text-white sticky top-0 z-50">
      {/* Top announcement bar */}
      <div className="bg-neutral-900 text-center text-xs py-1.5 tracking-wide text-neutral-400">
        Free Delivery on Orders Over £50
      </div>

      <div className="max-w-[1600px] mx-auto flex items-center justify-between px-4 md:px-8 h-14">
        {/* Mobile hamburger - CSS-only dropdown via <details>/<summary> */}
        <details className="md:hidden relative group">
          <summary className="list-none cursor-pointer p-2 -ml-2" aria-label="Open menu">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </summary>
          <div className="absolute top-full left-0 mt-1 bg-black border border-neutral-800 rounded-md shadow-lg min-w-[200px] py-2 z-50">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`${basePath}/category/${cat.toLowerCase()}`}
                className="block px-4 py-3 text-sm font-medium hover:bg-neutral-900 transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </details>

        {/* Logo */}
        <Link href={basePath} className="text-xl font-extrabold tracking-tighter uppercase">
          Bolt.
        </Link>

        {/* Category Links - desktop only */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`${basePath}/category/${cat.toLowerCase()}`}
              className="hover:text-neutral-400 transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Cart icon - now a link to the cart page */}
        <div className="flex items-center gap-4">
          <Link href={`${basePath}/cart`} className="relative" aria-label="Shopping cart">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <CartBadge basePath={basePath} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
