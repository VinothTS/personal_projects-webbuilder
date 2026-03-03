'use client';

import { ReactNode } from 'react';
import { CartProvider } from '@/contexts/CartContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CurrencyProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </CurrencyProvider>
  );
}
