import { NextRequest, NextResponse } from 'next/server';
import { PrivyClient } from '@privy-io/node';
import { markInvoicePaid, getInvoiceById } from '@/lib/supabase';

const privy = new PrivyClient({
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  appSecret: process.env.PRIVY_APP_SECRET!,
});

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

    const {
      StarkZap,
      OnboardStrategy,
      accountPresets,
      Amount,
      mainnetTokens,
      sepoliaTokens,
      fromAddress,
    } = await import('starkzap');

    const network = (process.env.NEXT_PUBLIC_NETWORK as 'mainnet' | 'sepolia') || 'sepolia';
    const sdk = new StarkZap({ network });
    const tokens = network === 'mainnet' ? mainnetTokens : sepoliaTokens;
    const token = invoice.currency === 'USDC' ? tokens.USDC : tokens.STRK;
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

    const { wallet } = await sdk.onboard({
      strategy: OnboardStrategy.Privy,
      accountPreset: accountPresets.argentXV050,
      privy: {
        resolve: async () => {
          const walletRes = await fetch(`${baseUrl}/api/wallet/starknet`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const data = await walletRes.json();
          return {
            walletId: data.wallet.id,
            publicKey: data.wallet.publicKey,
            serverUrl: `${baseUrl}/api/wallet/sign`,
          };
        },
      },
      deploy: 'if_needed',
    });

    const amount = Amount.parse(invoice.total.toString(), token);
    const balance = await wallet.balanceOf(token);

    if (balance.lt(amount)) {
      return NextResponse.json({
        error: `Insufficient balance. You need ${invoice.total} ${invoice.currency} in your wallet.`,
      }, { status: 400 });
    }

    const tx = await wallet.transfer(token, [
      { to: fromAddress(invoice.sender_wallet), amount },
    ]);

    await tx.wait();
    await markInvoicePaid(invoice.id, tx.hash);

    const explorerUrl = network === 'mainnet'
      ? `https://voyager.online/tx/${tx.hash}`
      : `https://sepolia.voyager.online/tx/${tx.hash}`;

    return NextResponse.json({ success: true, txHash: tx.hash, explorerUrl });

  } catch (err: any) {
    console.error('Payment error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}