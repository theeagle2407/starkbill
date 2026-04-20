'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createInvoice } from '@/lib/supabase';
import type { InvoiceItem, Currency } from '@/lib/types';

const BG = '#0A0A0F';
const CARD = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#F0F0F5';
const MUTED = '#8888A8';
const CORAL = '#EC796B';
const AMBER = '#F9A84D';

const emptyItem = (): InvoiceItem => ({ description: '', quantity: 1, unitPrice: 0 });

export default function NewInvoicePage() {
  const { authenticated, ready, user, login, logout } = usePrivy();
  const router = useRouter();

  const [senderName, setSenderName] = useState('');
  const [senderWallet, setSenderWallet] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [currency, setCurrency] = useState<Currency>('USDC');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([emptyItem()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ready && !authenticated) login();
  }, [ready, authenticated]);

  const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const addItem = () => setItems([...items, emptyItem()]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async () => {
    if (!senderName || !senderWallet || !clientName || !clientEmail || !dueDate) {
      setError('Please fill in all required fields.');
      return;
    }
    if (items.some(i => !i.description || i.quantity <= 0 || i.unitPrice <= 0)) {
      setError('Please complete all line items.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const invoice = await createInvoice({
        sender_name: senderName,
        sender_email: user!.email!.address,
        sender_wallet: senderWallet,
        client_name: clientName,
        client_email: clientEmail,
        items,
        currency,
        due_date: dueDate,
        notes,
      });
      router.push(`/invoice/${invoice.id}`);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: `1px solid ${BORDER}`,
    fontSize: '14px',
    color: TEXT,
    outline: 'none',
    boxSizing: 'border-box' as const,
    backgroundColor: 'rgba(255,255,255,0.05)',
    fontFamily: 'system-ui, sans-serif',
  };

  const labelStyle = {
    display: 'block' as const,
    fontSize: '12px',
    fontWeight: '700' as const,
    color: MUTED,
    marginBottom: '6px',
    letterSpacing: '0.3px',
    textTransform: 'uppercase' as const,
  };

  if (!ready) return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '28px', height: '28px', border: `2.5px solid ${CORAL}`, borderTopColor: 'transparent', borderRadius: '50%' }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT, fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid ${BORDER}`, backdropFilter: 'blur(20px)', background: 'rgba(10,10,15,0.85)', padding: '0 40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <img src="/logo.svg" width={28} height={28} alt="StarkBill" />
          <span style={{ fontSize: '18px', fontWeight: '800', color: TEXT, letterSpacing: '-0.5px' }}>
            Stark<span style={{ background: `linear-gradient(135deg, ${CORAL}, ${AMBER})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bill</span>
          </span>
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link href="/dashboard" style={{ fontSize: '14px', color: MUTED, textDecoration: 'none' }}>Dashboard</Link>
          <button onClick={() => { logout(); router.replace('/'); }} style={{ fontSize: '13px', color: MUTED, background: 'none', border: 'none', cursor: 'pointer' }}>Sign out</button>
        </nav>
      </header>

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '40px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '-0.5px', marginBottom: '4px' }}>New Invoice</h1>
          <p style={{ fontSize: '14px', color: MUTED }}>Fill in the details below to create and share your invoice.</p>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(236,121,107,0.08)', border: '1px solid rgba(236,121,107,0.2)', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', color: CORAL }}>
            {error}
          </div>
        )}

        {/* From */}
        <div style={{ background: CARD, borderRadius: '14px', border: `1px solid ${BORDER}`, padding: '24px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '20px', color: TEXT }}>From</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Your name *</label>
              <input style={inputStyle} value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="Jane Smith" />
            </div>
            <div>
              <label style={labelStyle}>Your email</label>
              <input style={{ ...inputStyle, opacity: 0.5 }} value={user?.email?.address || ''} readOnly />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Your Starknet wallet address *</label>
              <input style={inputStyle} value={senderWallet} onChange={e => setSenderWallet(e.target.value)} placeholder="0x..." />
            </div>
          </div>
        </div>

        {/* To */}
        <div style={{ background: CARD, borderRadius: '14px', border: `1px solid ${BORDER}`, padding: '24px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '20px', color: TEXT }}>To</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Client name *</label>
              <input style={inputStyle} value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Acme Corp" />
            </div>
            <div>
              <label style={labelStyle}>Client email *</label>
              <input style={inputStyle} value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="client@example.com" type="email" />
            </div>
          </div>
        </div>

        {/* Details */}
        <div style={{ background: CARD, borderRadius: '14px', border: `1px solid ${BORDER}`, padding: '24px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '20px', color: TEXT }}>Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Currency *</label>
              <select style={inputStyle} value={currency} onChange={e => setCurrency(e.target.value as Currency)}>
                <option value="USDC">USDC</option>
                <option value="STRK">STRK</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Due date *</label>
              <input style={inputStyle} type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
          </div>

          {/* Line items */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 110px 36px', gap: '8px', marginBottom: '8px' }}>
              {['Description', 'Qty', 'Unit price', ''].map(h => (
                <div key={h} style={{ fontSize: '11px', fontWeight: '700', color: MUTED, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{h}</div>
              ))}
            </div>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 110px 36px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <input style={inputStyle} value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} placeholder="Service or product" />
                <input style={inputStyle} type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)} />
                <input style={inputStyle} type="number" min="0" step="0.01" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} placeholder="0.00" />
                <button onClick={() => removeItem(idx)} disabled={items.length === 1}
                  style={{ background: 'none', border: 'none', cursor: items.length === 1 ? 'not-allowed' : 'pointer', color: MUTED, fontSize: '20px', opacity: items.length === 1 ? 0.3 : 1 }}>×</button>
              </div>
            ))}
            <button onClick={addItem} style={{ marginTop: '8px', fontSize: '13px', color: CORAL, background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', padding: 0 }}>
              + Add line item
            </button>
          </div>

          {/* Total */}
          <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: MUTED, marginBottom: '4px', fontWeight: '700', letterSpacing: '0.5px' }}>TOTAL</div>
              <div style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-1px', background: `linear-gradient(135deg, ${CORAL}, ${AMBER})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {total.toFixed(2)} {currency}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginTop: '16px' }}>
            <label style={labelStyle}>Notes (optional)</label>
            <textarea
              style={{ ...inputStyle, height: '80px', resize: 'vertical' as const }}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Payment terms or additional information..."
            />
          </div>
        </div>

        <button onClick={handleSubmit} disabled={submitting}
          style={{ width: '100%', padding: '14px', background: submitting ? 'rgba(236,121,107,0.4)' : `linear-gradient(135deg, ${CORAL}, ${AMBER})`, color: '#fff', borderRadius: '10px', border: 'none', fontSize: '16px', fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer' }}>
          {submitting ? 'Creating invoice...' : 'Create invoice'}
        </button>
      </main>
    </div>
  );
}