'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getInvoiceById } from '@/lib/supabase';
import { getExplorerUrl } from '@/lib/starkzap';
import type { Invoice } from '@/lib/types';

const BG = '#0A0A0F';
const CARD = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#F0F0F5';
const MUTED = '#8888A8';
const CORAL = '#EC796B';
const AMBER = '#F9A84D';
const GREEN = '#4ADE80';

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function statusStyle(status: string) {
  if (status === 'paid') return { bg: 'rgba(74,222,128,0.1)', text: GREEN, border: 'rgba(74,222,128,0.2)' };
  if (status === 'overdue') return { bg: 'rgba(236,121,107,0.1)', text: CORAL, border: 'rgba(236,121,107,0.2)' };
  return { bg: 'rgba(249,168,77,0.1)', text: AMBER, border: 'rgba(249,168,77,0.2)' };
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    getInvoiceById(id).then(data => { setInvoice(data); setLoading(false); });
  }, [id]);

  const paymentLink = typeof window !== 'undefined' ? `${window.location.origin}/pay/${id}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '28px', height: '28px', border: `2.5px solid ${CORAL}`, borderTopColor: 'transparent', borderRadius: '50%' }} />
    </div>
  );

  if (!invoice) return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '16px', marginBottom: '16px' }}>Invoice not found.</p>
        <Link href="/dashboard" style={{ color: CORAL, textDecoration: 'none', fontSize: '14px' }}>Back to dashboard</Link>
      </div>
    </div>
  );

  const s = statusStyle(invoice.status);

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT, fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid ${BORDER}`, backdropFilter: 'blur(20px)', background: 'rgba(10,10,15,0.85)', padding: '0 40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.svg" width={28} height={28} alt="StarkBill" />
          <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Stark<span style={{ background: `linear-gradient(135deg, ${CORAL}, ${AMBER})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bill</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => router.back()} style={{ fontSize: '13px', color: MUTED, background: 'none', border: 'none', cursor: 'pointer' }}>← Back</button>
          {invoice.status === 'pending' && (
            <button onClick={copyLink} style={{ padding: '8px 18px', background: copied ? 'rgba(74,222,128,0.1)' : `linear-gradient(135deg, ${CORAL}, ${AMBER})`, color: copied ? GREEN : '#fff', border: copied ? `1px solid rgba(74,222,128,0.3)` : 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
              {copied ? 'Copied!' : 'Copy payment link'}
            </button>
          )}
        </div>
      </header>

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '40px' }}>

        {/* Invoice card */}
        <div style={{ background: CARD, borderRadius: '20px', border: `1px solid ${BORDER}`, overflow: 'hidden' }}>

          {/* Top gradient line */}
          <div style={{ height: '3px', background: `linear-gradient(90deg, ${CORAL}, #8B5CF6, ${AMBER})` }} />

          {/* Header */}
          <div style={{ padding: '28px 32px', borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: MUTED, marginBottom: '4px', fontWeight: '600', letterSpacing: '0.5px' }}>INVOICE</div>
              <div style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '-0.5px' }}>{invoice.invoice_number}</div>
            </div>
            <span style={{ padding: '5px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', background: s.bg, color: s.text, border: `1px solid ${s.border}`, textTransform: 'capitalize', letterSpacing: '0.3px' }}>
              {invoice.status}
            </span>
          </div>

          {/* From / To */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ padding: '22px 32px', borderRight: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: MUTED, marginBottom: '10px', letterSpacing: '0.5px' }}>FROM</div>
              <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>{invoice.sender_name}</div>
              <div style={{ fontSize: '13px', color: MUTED, marginBottom: '4px' }}>{invoice.sender_email}</div>
              <div style={{ fontSize: '11px', color: MUTED, fontFamily: 'monospace', wordBreak: 'break-all', opacity: 0.7 }}>{invoice.sender_wallet}</div>
            </div>
            <div style={{ padding: '22px 32px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: MUTED, marginBottom: '10px', letterSpacing: '0.5px' }}>TO</div>
              <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>{invoice.client_name}</div>
              <div style={{ fontSize: '13px', color: MUTED }}>{invoice.client_email}</div>
            </div>
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ padding: '16px 32px', borderRight: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: MUTED, marginBottom: '4px', letterSpacing: '0.5px' }}>ISSUED</div>
              <div style={{ fontSize: '14px' }}>{fmt(invoice.created_at)}</div>
            </div>
            <div style={{ padding: '16px 32px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: MUTED, marginBottom: '4px', letterSpacing: '0.5px' }}>DUE</div>
              <div style={{ fontSize: '14px' }}>{fmt(invoice.due_date)}</div>
            </div>
          </div>

          {/* Line items */}
          <div style={{ padding: '22px 32px', borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 100px 90px', gap: '8px', marginBottom: '10px' }}>
              {['Description', 'Qty', 'Unit price', 'Amount'].map(h => (
                <div key={h} style={{ fontSize: '11px', fontWeight: '700', color: MUTED, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{h}</div>
              ))}
            </div>
            {invoice.items.map((item, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 100px 90px', gap: '8px', padding: '10px 0', borderTop: i === 0 ? 'none' : `1px solid ${BORDER}` }}>
                <div style={{ fontSize: '14px' }}>{item.description}</div>
                <div style={{ fontSize: '14px', color: MUTED }}>{item.quantity}</div>
                <div style={{ fontSize: '14px', color: MUTED }}>{item.unitPrice.toFixed(2)}</div>
                <div style={{ fontSize: '14px', fontWeight: '700' }}>{(item.quantity * item.unitPrice).toFixed(2)}</div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div style={{ padding: '22px 32px', display: 'flex', justifyContent: 'flex-end', borderBottom: invoice.notes ? `1px solid ${BORDER}` : 'none' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: MUTED, marginBottom: '6px', fontWeight: '600', letterSpacing: '0.5px' }}>TOTAL AMOUNT DUE</div>
              <div style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1.5px', background: `linear-gradient(135deg, ${CORAL}, ${AMBER})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {invoice.total.toFixed(2)} {invoice.currency}
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div style={{ padding: '18px 32px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: MUTED, marginBottom: '6px', letterSpacing: '0.5px' }}>NOTES</div>
              <div style={{ fontSize: '13px', color: MUTED, lineHeight: '1.6' }}>{invoice.notes}</div>
            </div>
          )}
        </div>

        {/* Transaction hash */}
        {invoice.tx_hash && (
          <div style={{ marginTop: '14px', padding: '16px 20px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: GREEN, marginBottom: '3px' }}>PAYMENT CONFIRMED ON STARKNET</div>
              <div style={{ fontSize: '11px', color: MUTED, fontFamily: 'monospace' }}>{invoice.tx_hash.slice(0, 20)}...{invoice.tx_hash.slice(-10)}</div>
            </div>
            <a href={getExplorerUrl(invoice.tx_hash)} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: GREEN, fontWeight: '600', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              View on explorer →
            </a>
          </div>
        )}

        {/* Payment link */}
        {invoice.status === 'pending' && (
          <div style={{ marginTop: '14px', padding: '18px 20px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#A78BFA', marginBottom: '10px', letterSpacing: '0.5px' }}>PAYMENT LINK — SHARE WITH YOUR CLIENT</div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ flex: 1, fontSize: '13px', color: MUTED, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px', border: `1px solid ${BORDER}` }}>
                {paymentLink}
              </div>
              <button onClick={copyLink} style={{ padding: '10px 18px', background: copied ? 'rgba(74,222,128,0.1)' : `linear-gradient(135deg, ${CORAL}, ${AMBER})`, color: copied ? GREEN : '#fff', border: copied ? `1px solid rgba(74,222,128,0.3)` : 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
            <p style={{ fontSize: '12px', color: MUTED, marginTop: '10px' }}>
              Your client opens this link, signs in with their email, and pays directly. No wallet setup needed.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}