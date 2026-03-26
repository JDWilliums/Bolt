import Image from "next/image";
import Link from "next/link";

export default function HeroCinematic() {
  return (
    <section className="relative w-full h-[70vh] min-h-[600px] flex items-center justify-center overflow-hidden mb-16">
      {/* BACKGROUND IMAGE: Heavily optimized for LCP */}
      <div className="absolute inset-0 z-0 bg-black">
        <Image
          src="https://images.unsplash.com/photo-1552346154-21d32810baa3?q=100&w=3000&auto=format&fit=crop"
          alt="Athlete running on a track"
          fill
          priority // CRITICAL: Tells Next.js this is the LCP element
          fetchPriority="high" // CRITICAL: Instructs the browser to fetch this before anything else
          sizes="100vw"
          className="object-cover opacity-60" 
        />
      </div>

      {/* FOREGROUND CONTENT */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 uppercase drop-shadow-lg">
          Push Your Limits.
        </h1>
        <p className="text-lg md:text-2xl font-light mb-10 max-w-2xl drop-shadow-md">
          Engineered for zero latency. Designed for peak performance. Discover the next generation of athletic footwear.
        </p>
        <div className="flex gap-4">
          <Link 
            href="#shop" 
            className="bg-white text-black font-bold py-4 px-8 rounded-full hover:bg-gray-200 transition-transform hover:scale-105"
          >
            Shop Collection
          </Link>
          <Link 
            href="#new-arrivals" 
            className="bg-transparent border-2 border-white text-white font-bold py-4 px-8 rounded-full hover:bg-white hover:text-black transition-colors"
          >
            New Arrivals
          </Link>
        </div>
      </div>
    </section>
  );
}