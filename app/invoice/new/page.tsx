'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { createInvoice } from '@/lib/supabase';
import type { InvoiceItem, Currency } from '@/lib/types';

const emptyItem = (): InvoiceItem => ({ description: '', quantity: 1, unitPrice: 0 });

export default function NewInvoicePage() {
  const { authenticated, ready, user, login } = usePrivy();
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
    border: '1px solid #D1D5DB',
    fontSize: '14px',
    color: '#111827',
    outline: 'none',
    boxSizing: 'border-box' as const,
    backgroundColor: '#FFFFFF',
  };

  const labelStyle = {
    display: 'block' as const,
    fontSize: '13px',
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: '6px',
  };

  if (!ready) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      <Header />
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px', marginBottom: '4px' }}>New Invoice</h1>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>Fill in the details below to create and share your invoice.</p>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', color: '#DC2626' }}>
            {error}
          </div>
        )}

        {/* From */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>From</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Your name *</label>
              <input style={inputStyle} value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="Jane Smith" />
            </div>
            <div>
              <label style={labelStyle}>Your email</label>
              <input style={{ ...inputStyle, backgroundColor: '#F9FAFB', color: '#6B7280' }} value={user?.email?.address || ''} readOnly />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Your Starknet wallet address *</label>
              <input style={inputStyle} value={senderWallet} onChange={e => setSenderWallet(e.target.value)} placeholder="0x..." />
            </div>
          </div>
        </div>

        {/* To */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>To</h2>
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
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>Details</h2>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px 40px', gap: '8px', marginBottom: '8px' }}>
              {['Description', 'Qty', 'Unit price', ''].map(h => (
                <div key={h} style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>{h}</div>
              ))}
            </div>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px 40px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <input style={inputStyle} value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} placeholder="Service or product" />
                <input style={inputStyle} type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)} />
                <input style={inputStyle} type="number" min="0" step="0.01" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} placeholder="0.00" />
                <button onClick={() => removeItem(idx)} disabled={items.length === 1} style={{ background: 'none', border: 'none', cursor: items.length === 1 ? 'not-allowed' : 'pointer', color: '#9CA3AF', fontSize: '18px' }}>×</button>
              </div>
            ))}
            <button onClick={addItem} style={{ marginTop: '8px', fontSize: '13px', color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', padding: 0 }}>
              + Add line item
            </button>
          </div>

          {/* Total */}
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>Total</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px' }}>
                {total.toFixed(2)} {currency}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginTop: '16px' }}>
            <label style={labelStyle}>Notes (optional)</label>
            <textarea
              style={{ ...inputStyle, height: '80px', resize: 'vertical' }}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Payment terms, bank details, or any additional information..."
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: submitting ? '#93C5FD' : '#2563EB',
            color: '#FFFFFF',
            borderRadius: '10px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '700',
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? 'Creating invoice...' : 'Create invoice'}
        </button>
      </main>
    </div>
  );
}