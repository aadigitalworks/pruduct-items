import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Your Marketplace - Shop Quality Products',
  description: 'Discover amazing products at great prices. Shop now with secure checkout and fast delivery.',
  keywords: 'shopping, marketplace, products, online store',
  openGraph: {
    title: 'Your Marketplace - Shop Quality Products',
    description: 'Discover amazing products at great prices.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}