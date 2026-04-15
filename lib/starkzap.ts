import { StarkZap, Amount, fromAddress, mainnetTokens, sepoliaTokens } from 'starkzap';
import type { Currency } from './types';

const network = (process.env.NEXT_PUBLIC_NETWORK as 'mainnet' | 'sepolia') || 'sepolia';

export function createSDK(): StarkZap {
  return new StarkZap({ network });
}

export function getToken(currency: Currency) {
  const tokens = network === 'mainnet' ? mainnetTokens : sepoliaTokens;
  if (currency === 'USDC') return tokens.USDC;
  if (currency === 'STRK') return tokens.STRK;
  throw new Error(`Unsupported currency: ${currency}`);
}

export function parseAmount(value: string, currency: Currency) {
  const token = getToken(currency);
  return Amount.parse(value, token);
}

export function getExplorerUrl(txHash: string): string {
  if (network === 'mainnet') {
    return `https://voyager.online/tx/${txHash}`;
  }
  return `https://sepolia.voyager.online/tx/${txHash}`;
}

export { fromAddress, Amount };