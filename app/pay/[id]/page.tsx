'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { getInvoiceById } from '@/lib/supabase';
import { getExplorerUrl } from '@/lib/starkzap';
import type { Invoice } from '@/lib/types';

const BG = '#0A0A0F';
const CORAL = '#EC796B';
const AMBER = '#F9A84D';
const GREEN = '#4ADE80';
const MUTED = '#8888A8';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#F0F0F5';

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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
      if (data?.status === 'paid') setPaid(true);
    });
  }, [id]);

  const handlePay = async () => {
    if (!invoice || !user) return;
    setPaying(true);
    setError('');

    try {
      setStep('Setting up your wallet...');
      const accessToken = await getAccessToken();

      setStep('Processing payment on Starknet...');
      const res = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          payerEmail: user.email?.address,
          accessToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      setTxHash(data.txHash);
      setPaid(true);
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
      setStep('');
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '28px', height: '28px', border: `2.5px solid ${CORAL}`, borderTopColor: 'transparent', borderRadius: '50%' }} />
    </div>
  );

  if (!invoice) return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT }}>
      <p>Invoice not found.</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT, fontFamily: 'system-ui, sans-serif' }}>

      <header style={{ borderBottom: `1px solid ${BORDER}`, padding: '0 32px', height: '56px', display: 'flex', alignItems: 'center', background: 'rgba(10,10,15,0.95)' }}>
        <span style={{ fontSize: '18px', fontWeight: '800' }}>
          Stark<span style={{ background: `linear-gradient(135deg, ${CORAL}, ${AMBER})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bill</span>
        </span>
      </header>

      <main style={{ maxWidth: '520px', margin: '48px auto', padding: '0 24px' }}>
        {paid ? (
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '20px', border: `1px solid ${BORDER}`, padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(74,222,128,0.1)', border: `2px solid rgba(74,222,128,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '28px' }}>✓</div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>Payment sent</h2>
            <p style={{ fontSize: '14px', color: MUTED, marginBottom: '24px', lineHeight: '1.6' }}>
              You paid {invoice.total.toFixed(2)} {invoice.currency} to {invoice.sender_name}.
            </p>
            {txHash && (
              <a href={getExplorerUrl(txHash)} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '14px', color: CORAL, fontWeight: '600', textDecoration: 'none' }}>
                View on Starknet explorer →
              </a>
            )}
          </div>
        ) : (
          <>
            {/* Invoice summary */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '20px', border: `1px solid ${BORDER}`, overflow: 'hidden', marginBottom: '14px' }}>
              <div style={{ height: '3px', background: `linear-gradient(90deg, ${CORAL}, #8B5CF6, ${AMBER})` }} />
              <div style={{ padding: '24px 28px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '12px', color: MUTED, marginBottom: '4px' }}>{invoice.invoice_number}</div>
                  <div style={{ fontSize: '16px', fontWeight: '700' }}>{invoice.sender_name}</div>
                  <div style={{ fontSize: '13px', color: MUTED, marginTop: '2px' }}>Due {fmt(invoice.due_date)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '30px', fontWeight: '900', letterSpacing: '-1px', background: `linear-gradient(135deg, ${CORAL}, ${AMBER})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {invoice.total.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '14px', color: MUTED }}>{invoice.currency}</div>
                </div>
              </div>
              <div style={{ padding: '16px 28px' }}>
                {invoice.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                    <div style={{ fontSize: '13px', color: MUTED }}>{item.description} × {item.quantity}</div>
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{(item.quantity * item.unitPrice).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              {invoice.notes && (
                <div style={{ padding: '14px 28px', borderTop: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ fontSize: '11px', color: MUTED, fontWeight: '700', marginBottom: '4px', letterSpacing: '0.5px' }}>NOTE</div>
                  <div style={{ fontSize: '13px', color: MUTED }}>{invoice.notes}</div>
                </div>
              )}
            </div>

            {/* Payment box */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', border: `1px solid ${BORDER}`, padding: '22px' }}>
              {!authenticated ? (
                <>
                  <p style={{ fontSize: '14px', color: MUTED, marginBottom: '16px', lineHeight: '1.6' }}>
                    Sign in with your email to pay this invoice. A Starknet wallet will be set up for you automatically.
                  </p>
                  <button onClick={login} style={{ width: '100%', padding: '13px', background: `linear-gradient(135deg, ${CORAL}, ${AMBER})`, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
                    Sign in to pay
                  </button>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: '14px', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: MUTED }}>Paying as</span>
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>{user?.email?.address}</span>
                  </div>

                  {error && (
                    <div style={{ marginBottom: '14px', padding: '12px 14px', background: 'rgba(236,121,107,0.08)', border: '1px solid rgba(236,121,107,0.2)', borderRadius: '8px', fontSize: '13px', color: CORAL }}>
                      {error}
                    </div>
                  )}

                  {paying && step && (
                    <div style={{ marginBottom: '14px', padding: '12px 14px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '8px', fontSize: '13px', color: '#A78BFA' }}>
                      {step}
                    </div>
                  )}

                  <button onClick={handlePay} disabled={paying}
                    style={{ width: '100%', padding: '13px', background: paying ? 'rgba(236,121,107,0.4)' : `linear-gradient(135deg, ${CORAL}, ${AMBER})`, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: paying ? 'not-allowed' : 'pointer' }}>
                    {paying ? step || 'Processing...' : `Pay ${invoice.total.toFixed(2)} ${invoice.currency}`}
                  </button>

                  <p style={{ fontSize: '11px', color: MUTED, textAlign: 'center', marginTop: '10px' }}>
                    Payment processed on Starknet. Transaction fees are negligible.
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}