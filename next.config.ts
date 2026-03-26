import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // PPR mechanics are now handled under cacheComponents in the latest Next.js builds
    cacheComponents: true, 
  },
  images: {
    remotePatterns: [
      { 
        protocol: 'https', 
        hostname: 'images.unsplash.com' 
      }
    ],
  },
};

export default nextConfig;