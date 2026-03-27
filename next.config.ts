import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PPR / component caching — moved from experimental to root in Next.js 16
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    // Constrain generated sizes to what the layout actually needs.
    // Product cards are max ~400px wide, heroes are full viewport.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [128, 256, 384],
    // Prefer AVIF over WebP — smaller file size, better compression
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
