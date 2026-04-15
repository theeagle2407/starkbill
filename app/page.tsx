'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LandingPage() {
  const { authenticated, login, ready } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) router.replace('/dashboard');
  }, [ready, authenticated, router]);

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '28px', height: '28px', border: '2.5px solid #EC796B', borderTopColor: 'transparent', borderRadius: '50%' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', color: '#F0F0F5', fontFamily: 'system-ui, sans-serif', overflow: 'hidden' }}>

      {/* Gradient orbs background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', top: '10%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,121,107,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '0%', left: '30%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', background: 'rgba(10,10,15,0.8)', padding: '0 48px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.svg" width={30} height={30} alt="StarkBill" />
          <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Stark<span style={{ background: 'linear-gradient(135deg, #EC796B, #F9A84D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bill</span>
          </span>
        </div>
        <button onClick={login} style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #EC796B, #F9A84D)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
          Get started
        </button>
      </header>

      {/* Hero */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '100px 48px 80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '5px 14px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '999px', marginBottom: '32px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8B5CF6' }} />
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#A78BFA', letterSpacing: '0.3px' }}>BUILT ON STARKNET</span>
        </div>

        <h1 style={{ fontSize: '64px', fontWeight: '900', lineHeight: '1.04', letterSpacing: '-3px', margin: '0 auto 24px', maxWidth: '820px' }}>
          Send invoices.{' '}
          <span style={{ background: 'linear-gradient(135deg, #EC796B 0%, #F9A84D 50%, #8B5CF6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Get paid instantly.
          </span>
        </h1>

        <p style={{ fontSize: '18px', color: '#8888A8', lineHeight: '1.7', maxWidth: '500px', margin: '0 auto 40px' }}>
          Create professional invoices. Collect payments in USDC or STRK on Starknet. Your clients pay with just an email — no crypto wallet needed.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={login} style={{ padding: '13px 30px', background: 'linear-gradient(135deg, #EC796B, #F9A84D)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 0 30px rgba(236,121,107,0.3)' }}>
            Create your first invoice
          </button>
          <a href="#how-it-works" style={{ padding: '13px 30px', background: 'rgba(255,255,255,0.05)', color: '#F0F0F5', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '15px', fontWeight: '600', textDecoration: 'none' }}>
            See how it works
          </a>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', maxWidth: '500px', margin: '72px auto 0', background: 'rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
          {[
            { value: '0%', label: 'Payment fees' },
            { value: '<3s', label: 'Settlement' },
            { value: '100%', label: 'Non-custodial' },
          ].map(s => (
            <div key={s.label} style={{ padding: '24px 20px', textAlign: 'center', background: 'rgba(10,10,15,0.9)' }}>
              <div style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-1.5px', background: 'linear-gradient(135deg, #EC796B, #F9A84D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#8888A8', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ position: 'relative', zIndex: 1, padding: '80px 48px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '900', letterSpacing: '-1.5px', marginBottom: '12px' }}>How it works</h2>
            <p style={{ fontSize: '16px', color: '#8888A8', maxWidth: '400px', margin: '0 auto' }}>Three steps from invoice to payment.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { step: '01', title: 'Create an invoice', desc: 'Add client details, line items, and choose USDC or STRK. Done in under 60 seconds.' },
              { step: '02', title: 'Share the link', desc: 'Send your client a unique payment link. They pay with just their email address.' },
              { step: '03', title: 'Get paid on-chain', desc: 'Payment settles to your Starknet wallet. Every transaction is verifiable on-chain.' },
            ].map(item => (
              <div key={item.step} style={{ padding: '28px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #EC796B, #8B5CF6)' }} />
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#EC796B', marginBottom: '14px', letterSpacing: '1px' }}>{item.step}</div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '10px' }}>{item.title}</h3>
                <p style={{ fontSize: '14px', color: '#8888A8', lineHeight: '1.65', margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 48px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '900', letterSpacing: '-1.5px' }}>Built for professionals</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', maxWidth: '800px', margin: '0 auto' }}>
            {[
              { title: 'No payment fees', desc: 'Traditional payment processors take a cut of every transaction. StarkBill does not. You receive exactly what you invoiced.' },
              { title: 'Instant settlement', desc: 'Payments settle on Starknet in seconds. No waiting for bank transfers or processor delays.' },
              { title: 'On-chain proof', desc: 'Every payment produces a verifiable transaction hash. Your records are permanent and tamper-proof.' },
              { title: 'No wallet needed for clients', desc: 'Clients pay with just their email. Wallet creation is handled invisibly behind the scenes.' },
            ].map(f => (
              <div key={f.title} style={{ padding: '26px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'linear-gradient(135deg, #EC796B, #8B5CF6)', marginBottom: '14px' }} />
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ fontSize: '13px', color: '#8888A8', lineHeight: '1.65', margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 48px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '40px', fontWeight: '900', letterSpacing: '-1.5px', marginBottom: '14px' }}>Start getting paid today</h2>
          <p style={{ fontSize: '16px', color: '#8888A8', marginBottom: '32px' }}>Create your first invoice in under a minute. Free to use.</p>
          <button onClick={login} style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #EC796B, #F9A84D)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 0 40px rgba(236,121,107,0.25)' }}>
            Get started — it is free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.06)', padding: '28px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '15px', fontWeight: '800' }}>
          Stark<span style={{ background: 'linear-gradient(135deg, #EC796B, #F9A84D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bill</span>
        </span>
        <span style={{ fontSize: '12px', color: '#8888A8' }}>Built on Starknet</span>
      </footer>
    </div>
  );
}