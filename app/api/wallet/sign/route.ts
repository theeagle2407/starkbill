import { NextRequest, NextResponse } from 'next/server';
import { PrivyClient } from '@privy-io/node';

const privy = new PrivyClient({
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  appSecret: process.env.PRIVY_APP_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { walletId, hash } = await req.json();

    if (!walletId || !hash) {
      return NextResponse.json(
        { error: 'walletId and hash are required' },
        { status: 400 }
      );
    }

    const result = await (privy as any).walletApi.rpc({
  walletId,
  method: 'starknet_signMessage',
  params: { message: hash },
});

return NextResponse.json({ signature: result.signature });

    return NextResponse.json({ signature: result.signature });
  } catch (err: any) {
    console.error('Signing error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}