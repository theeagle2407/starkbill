import type { Currency } from './types';

const network = process.env.NEXT_PUBLIC_NETWORK || 'sepolia';

export function getExplorerUrl(txHash: string): string {
  if (network === 'mainnet') {
    return `https://voyager.online/tx/${txHash}`;
  }
  return `https://sepolia.voyager.online/tx/${txHash}`;
}

export type { Currency };