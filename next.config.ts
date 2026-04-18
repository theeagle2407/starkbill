import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {},
  experimental: {
    optimizePackageImports: ['starkzap'],
  },
};

export default nextConfig;