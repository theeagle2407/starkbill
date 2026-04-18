import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@hyperlane-xyz/sdk': false,
      '@hyperlane-xyz/registry': false,
      '@hyperlane-xyz/utils': false,
      '@fatsolutions/tongo-sdk': false,
    };
    return config;
  },
  experimental: {
    optimizePackageImports: ['starkzap'],
  },
};

export default nextConfig;