'use client';

import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { authenticated, logout, user } = usePrivy();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header style={{
      borderBottom: '1px solid #E5E7EB',
      backgroundColor: '#FFFFFF',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href={authenticated ? '/dashboard' : '/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.svg" alt="StarkBill" width={32} height={32} />
          <span style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#111827',
            letterSpacing: '-0.5px',
          }}>
            Stark<span style={{ color: '#2563EB' }}>Bill</span>
          </span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {authenticated ? (
            <>
              <Link href="/invoice/new" style={{
                padding: '8px 16px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
              }}>
                New Invoice
              </Link>
              <Link href="/dashboard" style={{
                fontSize: '14px',
                color: '#374151',
                textDecoration: 'none',
                fontWeight: '500',
              }}>
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  fontSize: '14px',
                  color: '#6B7280',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/dashboard" style={{
              padding: '8px 16px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
            }}>
              Get started
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}