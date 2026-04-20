import { NextRequest, NextResponse } from 'next/server';
import { PrivyClient } from '@privy-io/node';
import { RpcProvider, Account, cairo, CallData, num } from 'starknet';
import { markInvoicePaid, getInvoiceById } from '@/lib/supabase';

const privy = new PrivyClient({
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  appSecret: process.env.PRIVY_APP_SECRET!,
});

const network = process.env.NEXT_PUBLIC_NETWORK || 'sepolia';

const RPC_URL = network === 'mainnet'
  ? 'https://starknet-mainnet.public.blastapi.io/rpc/v0_7'
  : 'https://starknet-sepolia.public.blastapi.io/rpc/v0_7';

// Token addresses on Sepolia
const TOKEN_ADDRESSES: Record<string, string> = {
  USDC_sepolia: '0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080',
  STRK_sepolia: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  USDC_mainnet: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
  STRK_mainnet: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
};

function getTokenAddress(currency: string): string {
  const key = `${currency}_${network}`;
  return TOKEN_ADDRESSES[key] || TOKEN_ADDRESSES[`${currency}_sepolia`];
}

function toTokenAmount(amount: number, currency: string): bigint {
  const decimals = currency === 'USDC' ? 6 : 18;
  return BigInt(Math.round(amount * Math.pow(10, decimals)));
}

export async function POST(req: NextRequest) {
  try {
    const { invoiceId, accessToken } = await req.json();

    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 });
    }

    const invoice = await getInvoiceById(invoiceId);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 });
    }

    // Get payer wallet from Privy
    const walletRes = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/wallet/starknet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const walletData = await walletRes.json();
    if (!walletData.wallet) {
      return NextResponse.json({ error: 'Could not get wallet' }, { status: 500 });
    }

    const { id: walletId, address: walletAddress, publicKey } = walletData.wallet;

    const provider = new RpcProvider({ nodeUrl: RPC_URL });
    const tokenAddress = getTokenAddress(invoice.currency);
    const amount = toTokenAmount(invoice.total, invoice.currency);

    // Build the transfer call
    const transferCall = {
      contractAddress: tokenAddress,
      entrypoint: 'transfer',
      calldata: CallData.compile({
        recipient: invoice.sender_wallet,
        amount: cairo.uint256(amount),
      }),
    };

    // Get nonce
    const nonce = await provider.getNonceForAddress(walletAddress);

    // Build transaction details for signing
    const details = {
      nonce,
      maxFee: BigInt(0),
      version: '0x1' as const,
      chainId: await provider.getChainId(),
    };

    // Sign via Privy
    const txHash = await provider.getTransactionHash(
      walletAddress,
      [transferCall],
      details
    );

    const signResult = await (privy.walletApi as any).rpc({
      walletId,
      method: 'starknet_signTransaction',
      params: {
        calls: [transferCall],
        details,
      },
    });

    // Execute transaction
    const response = await provider.invokeFunction(
      {
        contractAddress: walletAddress,
        calldata: CallData.compile({
          calls: [transferCall],
        }),
        signature: signResult.signature,
      },
      details
    );

    await provider.waitForTransaction(response.transaction_hash);
    await markInvoicePaid(invoice.id, response.transaction_hash);

    const explorerUrl = network === 'mainnet'
      ? `https://voyager.online/tx/${response.transaction_hash}`
      : `https://sepolia.voyager.online/tx/${response.transaction_hash}`;

    return NextResponse.json({
      success: true,
      txHash: response.transaction_hash,
      explorerUrl,
    });

  } catch (err: any) {
    console.error('Payment error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}import { NextRequest, NextResponse } from 'next/server';
import { PrivyClient } from '@privy-io/node';
import { RpcProvider, Account, cairo, CallData, num } from 'starknet';
import { markInvoicePaid, getInvoiceById } from '@/lib/supabase';

const privy = new PrivyClient({
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  appSecret: process.env.PRIVY_APP_SECRET!,
});

const network = process.env.NEXT_PUBLIC_NETWORK || 'sepolia';

const RPC_URL = network === 'mainnet'
  ? 'https://starknet-mainnet.public.blastapi.io/rpc/v0_7'
  : 'https://starknet-sepolia.public.blastapi.io/rpc/v0_7';

// Token addresses on Sepolia
const TOKEN_ADDRESSES: Record<string, string> = {
  USDC_sepolia: '0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080',
  STRK_sepolia: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  USDC_mainnet: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
  STRK_mainnet: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
};

function getTokenAddress(currency: string): string {
  const key = `${currency}_${network}`;
  return TOKEN_ADDRESSES[key] || TOKEN_ADDRESSES[`${currency}_sepolia`];
}

function toTokenAmount(amount: number, currency: string): bigint {
  const decimals = currency === 'USDC' ? 6 : 18;
  return BigInt(Math.round(amount * Math.pow(10, decimals)));
}

export async function POST(req: NextRequest) {
  try {
    const { invoiceId, accessToken } = await req.json();

    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 });
    }

    const invoice = await getInvoiceById(invoiceId);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 });
    }

    // Get payer wallet from Privy
    const walletRes = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/wallet/starknet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const walletData = await walletRes.json();
    if (!walletData.wallet) {
      return NextResponse.json({ error: 'Could not get wallet' }, { status: 500 });
    }

    const { id: walletId, address: walletAddress, publicKey } = walletData.wallet;

    const provider = new RpcProvider({ nodeUrl: RPC_URL });
    const tokenAddress = getTokenAddress(invoice.currency);
    const amount = toTokenAmount(invoice.total, invoice.currency);

    // Build the transfer call
    const transferCall = {
      contractAddress: tokenAddress,
      entrypoint: 'transfer',
      calldata: CallData.compile({
        recipient: invoice.sender_wallet,
        amount: cairo.uint256(amount),
      }),
    };

    // Get nonce
    const nonce = await provider.getNonceForAddress(walletAddress);

    // Build transaction details for signing
    const details = {
      nonce,
      maxFee: BigInt(0),
      version: '0x1' as const,
      chainId: await provider.getChainId(),
    };

    // Sign via Privy
    const txHash = await provider.getTransactionHash(
      walletAddress,
      [transferCall],
      details
    );

    const signResult = await (privy.walletApi as any).rpc({
      walletId,
      method: 'starknet_signTransaction',
      params: {
        calls: [transferCall],
        details,
      },
    });

    // Execute transaction
    const response = await provider.invokeFunction(
      {
        contractAddress: walletAddress,
        calldata: CallData.compile({
          calls: [transferCall],
        }),
        signature: signResult.signature,
      },
      details
    );

    await provider.waitForTransaction(response.transaction_hash);
    await markInvoicePaid(invoice.id, response.transaction_hash);

    const explorerUrl = network === 'mainnet'
      ? `https://voyager.online/tx/${response.transaction_hash}`
      : `https://sepolia.voyager.online/tx/${response.transaction_hash}`;

    return NextResponse.json({
      success: true,
      txHash: response.transaction_hash,
      explorerUrl,
    });

  } catch (err: any) {
    console.error('Payment error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}