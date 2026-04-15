'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { getInvoiceById, markInvoicePaid } from '@/lib/supabase';
import { createSDK, getToken, parseAmount, fromAddress, getExplorerUrl } from '@/lib/starkzap';
import { StarkZap, OnboardStrategy, accountPresets } from 'starkzap';
import type { Invoice } from '@/lib/types';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function PayInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const { authenticated, ready, login, user, getAccessToken } = usePrivy();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState('');

  useEffect(() => {
    if (!id) return;
    getInvoiceById(id).then(data => {
      setInvoice(data);
      setLoading(false);
    });
  }, [id]);

  const handlePay = async () => {
    if (!invoice || !user) return;
    setPaying(true);
    setError('');

    try {
      setStep('Setting up your wallet...');
      const accessToken = await getAccessToken();

      const sdk = createSDK();
      const { wallet } = await sdk.onboard({
        strategy: OnboardStrategy.Privy,
        accountPreset: accountPresets.argentXV050,
        privy: {
          resolve: async () => {
            const res = await fetch('/api/wallet/starknet', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
            });
            const data = await res.json();
            return {
              walletId: data.wallet.id,
              publicKey: data.wallet.publicKey,
              serverUrl: `${window.location.origin}/api/wallet/sign`,
            };
          },
        },
        deploy: 'if_needed',
      });

      setStep('Checking balance...');
      const token = getToken(invoice.currency);
      const balance = await wallet.balanceOf(token);
      const amount = parseAmount(invoice.total.toString(), invoice.currency);

      if (balance.lt(amount)) {
        throw new Error(`Insufficient balance. You need ${invoice.total} ${invoice.currency} to pay this invoice.`);
      }

      setStep('Sending payment...');
      const tx = await wallet.transfer(token, [
        {
          to: fromAddress(invoice.sender_wallet),
          amount,
        },
      ]);

      setStep('Confirming on Starknet...');
      await tx.wait();

      await markInvoicePaid(invoice.id, tx.hash);
      setTxHash(tx.hash);
      setPaid(true);
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
      setStep('');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' }}>
        <div style={{ fontSize: '14px', color: '#6B7280' }}>Loading invoice...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '16px', color: '#111827' }}>Invoice not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Minimal header */}
      <header style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: '18px', fontWeight: '700', color: '#111827', letterSpacing: '-0.5px' }}>
          Stark<span style={{ color: '#2563EB' }}>Bill</span>
        </span>
      </header>

      <main style={{ maxWidth: '560px', margin: '48px auto', padding: '0 24px' }}>

        {paid ? (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#F0FDF4', border: '2px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '28px' }}>
              ✓
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>Payment sent</h2>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px', lineHeight: '1.6' }}>
              You have successfully paid {invoice.total.toFixed(2)} {invoice.currency} to {invoice.sender_name}.
            </p>
            <a
              href={getExplorerUrl(txHash)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '14px', color: '#2563EB', fontWeight: '600', textDecoration: 'none' }}
            >
              View transaction on Starknet →
            </a>
          </div>
        ) : (
          <>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: '16px' }}>

              {/* Invoice summary */}
              <div style={{ padding: '28px 28px 20px', borderBottom: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '4px' }}>{invoice.invoice_number}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '2px' }}>{invoice.sender_name}</div>
                    <div style={{ fontSize: '13px', color: '#6B7280' }}>Due {formatDate(invoice.due_date)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#111827', letterSpacing: '-1px' }}>
                      {invoice.total.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6B7280' }}>{invoice.currency}</div>
                  </div>
                </div>
              </div>

              {/* Line items */}
              <div style={{ padding: '16px 28px', borderBottom: '1px solid #E5E7EB' }}>
                {invoice.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <div style={{ fontSize: '14px', color: '#374151' }}>{item.description} × {item.quantity}</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{(item.quantity * item.unitPrice).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div style={{ padding: '16px 28px', backgroundColor: '#F9FAFB' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#9CA3AF', marginBottom: '4px' }}>NOTE</div>
                  <div style={{ fontSize: '13px', color: '#374151' }}>{invoice.notes}</div>
                </div>
              )}
            </div>

            {invoice.status === 'paid' ? (
              <div style={{ padding: '16px 20px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#16A34A' }}>This invoice has already been paid.</div>
              </div>
            ) : (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
                {!authenticated ? (
                  <>
                    <p style={{ fontSize: '14px', color: '#374151', marginBottom: '16px', lineHeight: '1.6' }}>
                      Sign in with your email to pay this invoice. A Starknet wallet will be created for you automatically.
                    </p>
                    <button
                      onClick={login}
                      style={{ width: '100%', padding: '13px', backgroundColor: '#2563EB', color: '#FFFFFF', borderRadius: '8px', border: 'none', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      Sign in to pay
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ marginBottom: '16px', padding: '12px 14px', backgroundColor: '#F9FAFB', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#6B7280' }}>Paying as</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{user?.email?.address}</span>
                    </div>

                    {error && (
                      <div style={{ marginBottom: '16px', padding: '12px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '14px', color: '#DC2626' }}>
                        {error}
                      </div>
                    )}

                    {paying && step && (
                      <div style={{ marginBottom: '16px', padding: '12px 14px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', fontSize: '13px', color: '#2563EB' }}>
                        {step}
                      </div>
                    )}

                    <button
                      onClick={handlePay}
                      disabled={paying}
                      style={{ width: '100%', padding: '13px', backgroundColor: paying ? '#93C5FD' : '#2563EB', color: '#FFFFFF', borderRadius: '8px', border: 'none', fontSize: '15px', fontWeight: '600', cursor: paying ? 'not-allowed' : 'pointer' }}
                    >
                      {paying ? step || 'Processing...' : `Pay ${invoice.total.toFixed(2)} ${invoice.currency}`}
                    </button>

                    <p style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center', marginTop: '12px' }}>
                      Payment is processed on Starknet. Transaction fees are covered.
                    </p>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}