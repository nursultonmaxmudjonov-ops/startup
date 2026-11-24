import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  devIndicators: false,
  experimental: {
    cpus: 1,
  },
};

export default nextConfig;
