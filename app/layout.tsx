import type { Metadata } from 'next';
import './globals.css';
import PrivyProvider from '@/components/PrivyProvider';

export const metadata: Metadata = {
  title: 'StarkBill — Get Paid on Starknet',
  description: 'Create invoices and get paid in crypto. No fees. Instant settlement on Starknet.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}>
        <PrivyProvider>
          {children}
        </PrivyProvider>
      </body>
    </html>
  );
}