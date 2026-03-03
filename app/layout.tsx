import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Providers } from '@/components/Providers';
import ThemeApplier from '@/components/ThemeApplier';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Global Agro Exports - Premium Agricultural Products',
  description: 'Leading exporter of rice, pulses, tea, fish products, and fresh flowers worldwide',
  keywords: 'agro exports, rice export, pulses, tea, fish products, flowers, agricultural products',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Razorpay Checkout Script */}
        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js" 
          strategy="lazyOnload"
        />
      </head>
      <body className="antialiased">
        <Providers>
          <ThemeApplier />
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
