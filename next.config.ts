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
  },
};

export default nextConfig;
