import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {},
  serverExternalPackages: [
    'starkzap',
    '@fatsolutions/tongo-sdk',
    '@hyperlane-xyz/sdk',
    '@hyperlane-xyz/registry', 
    '@hyperlane-xyz/utils',
    'ethers',
  ],
};

export default nextConfig;