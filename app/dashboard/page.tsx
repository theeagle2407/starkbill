'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getInvoicesBySender, updateOverdueInvoices } from '@/lib/supabase';
import type { Invoice } from '@/lib/types';

const BG = '#0A0A0F';
const CARD = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#F0F0F5';
const MUTED = '#8888A8';
const CORAL = '#EC796B';
const AMBER = '#F9A84D';
const VIOLET = '#8B5CF6';
const GREEN = '#4ADE80';

function statusStyle(status: string) {
  if (status === 'paid') return { bg: 'rgba(74,222,128,0.1)', text: GREEN, border: 'rgba(74,222,128,0.2)' };
  if (status === 'overdue') return { bg: 'rgba(236,121,107,0.1)', text: CORAL, border: 'rgba(236,121,107,0.2)' };
  return { bg: 'rgba(249,168,77,0.1)', text: AMBER, border: 'rgba(249,168,77,0.2)' };
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DashboardPage() {
  const { authenticated, ready, user, logout } = usePrivy();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready && !authenticated) router.replace('/');
  }, [ready, authenticated, router]);

  useEffect(() => {
    if (!authenticated || !user?.email?.address) return;
    updateOverdueInvoices().then(() =>
      getInvoicesBySender(user.email!.address).then(data => {
        setInvoices(data);
        setLoading(false);
      })
    );
  }, [authenticated, user]);

  if (!ready || !authenticated) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '28px', height: '28px', border: `2.5px solid ${CORAL}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.total, 0);
  const overdueCount = invoices.filter(i => i.status === 'overdue').length;

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT, fontFamily: 'system-ui, sans-serif' }}>

      {/* Subtle gradient bg */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '0%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid ${BORDER}`, backdropFilter: 'blur(20px)', background: 'rgba(10,10,15,0.85)', padding: '0 40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.svg" width={28} height={28} alt="StarkBill" />
          <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Stark<span style={{ background: `linear-gradient(135deg, ${CORAL}, ${AMBER})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bill</span>
          </span>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link href="/dashboard" style={{ fontSize: '14px', color: TEXT, textDecoration: 'none', fontWeight: '500' }}>Dashboard</Link>
          <Link href="/invoice/new" style={{ padding: '8px 18px', background: `linear-gradient(135deg, ${CORAL}, ${AMBER})`, color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
            New Invoice
          </Link>
          <button onClick={() => { logout(); router.replace('/'); }} style={{ fontSize: '13px', color: MUTED, background: 'none', border: 'none', cursor: 'pointer' }}>
            Sign out
          </button>
        </nav>
      </header>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '40px' }}>

        {/* Title */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '-0.5px', marginBottom: '4px' }}>Dashboard</h1>
          <p style={{ fontSize: '13px', color: MUTED }}>{user?.email?.address}</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
          {[
            { label: 'Total invoiced', value: `$${totalInvoiced.toFixed(2)}`, sub: `${invoices.length} invoices`, color: TEXT },
            { label: 'Collected', value: `$${totalPaid.toFixed(2)}`, sub: `${invoices.filter(i => i.status === 'paid').length} paid`, color: GREEN },
            { label: 'Pending', value: `$${totalPending.toFixed(2)}`, sub: `${invoices.filter(i => i.status === 'pending').length} awaiting`, color: AMBER },
            { label: 'Overdue', value: `${overdueCount}`, sub: overdueCount === 0 ? 'All clear' : 'Needs attention', color: overdueCount > 0 ? CORAL : MUTED },
          ].map(stat => (
            <div key={stat.label} style={{ background: CARD, borderRadius: '12px', padding: '20px', border: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: '11px', color: MUTED, marginBottom: '10px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{stat.label}</div>
              <div style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '4px', color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: MUTED }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px' }}>
          <Link href="/invoice/new" style={{ display: 'block', padding: '18px 20px', background: `linear-gradient(135deg, ${CORAL}, ${AMBER})`, borderRadius: '12px', textDecoration: 'none', boxShadow: '0 0 30px rgba(236,121,107,0.2)' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '3px' }}>Create New Invoice</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Get paid for your work</div>
          </Link>
          <div style={{ padding: '18px 20px', background: CARD, borderRadius: '12px', border: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '3px' }}>Invoices sent</div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: VIOLET }}>{invoices.length}</div>
          </div>
          <div style={{ padding: '18px 20px', background: CARD, borderRadius: '12px', border: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '3px' }}>Collection rate</div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: GREEN }}>
              {invoices.length === 0 ? '—' : `${Math.round((invoices.filter(i => i.status === 'paid').length / invoices.length) * 100)}%`}
            </div>
          </div>
        </div>

        {/* Invoices table */}
        <div style={{ background: CARD, borderRadius: '16px', border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700' }}>All Invoices</h2>
            <Link href="/invoice/new" style={{ fontSize: '13px', color: CORAL, textDecoration: 'none', fontWeight: '600' }}>+ New invoice</Link>
          </div>

          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: MUTED, fontSize: '14px' }}>Loading...</div>
          ) : invoices.length === 0 ? (
            <div style={{ padding: '64px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px' }}>No invoices yet</p>
              <p style={{ fontSize: '13px', color: MUTED, marginBottom: '24px' }}>Create your first invoice to get started.</p>
              <Link href="/invoice/new" style={{ padding: '10px 22px', background: `linear-gradient(135deg, ${CORAL}, ${AMBER})`, color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
                Create invoice
              </Link>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  {['Invoice', 'Client', 'Amount', 'Due date', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: MUTED, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => {
                  const s = statusStyle(inv.status);
                  return (
                    <tr key={inv.id} style={{ borderTop: `1px solid ${BORDER}`, cursor: 'pointer' }}
                      onClick={() => router.push(`/invoice/${inv.id}`)}>
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>{inv.invoice_number}</div>
                        <div style={{ fontSize: '11px', color: MUTED, marginTop: '2px' }}>{fmt(inv.created_at)}</div>
                      </td>
                      <td style={{ padding: '15px 20px', fontSize: '13px', color: MUTED }}>{inv.client_name}</td>
                      <td style={{ padding: '15px 20px', fontSize: '14px', fontWeight: '700' }}>{inv.total.toFixed(2)} {inv.currency}</td>
                      <td style={{ padding: '15px 20px', fontSize: '13px', color: MUTED }}>{fmt(inv.due_date)}</td>
                      <td style={{ padding: '15px 20px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700', background: s.bg, color: s.text, border: `1px solid ${s.border}`, textTransform: 'capitalize', letterSpacing: '0.3px' }}>
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <span style={{ fontSize: '13px', color: CORAL, fontWeight: '600' }}>View →</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}