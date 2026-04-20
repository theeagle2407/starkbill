import { NextRequest, NextResponse } from 'next/server';
import { PrivyClient } from '@privy-io/node';

const privy = new PrivyClient({
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  appSecret: process.env.PRIVY_APP_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
   const wallet = await (privy as any).walletApi.create({
  chainType: 'starknet' as any,
});

    return NextResponse.json({
      wallet: {
        id: wallet.id,
        address: wallet.address,
        publicKey: wallet.publicKey,
      },
    });
  } catch (err: any) {
    console.error('Wallet creation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}