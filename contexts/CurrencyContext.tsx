'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Currency, getStoredCurrency, saveCurrencyPreference, fetchExchangeRates, type ExchangeRates } from '@/lib/currency';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRates: ExchangeRates | null;
  isLoadingRates: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Get stored or detected currency on mount
    const storedCurrency = getStoredCurrency();
    setCurrencyState(storedCurrency);
    setMounted(true);
    
    // Fetch exchange rates on mount
    fetchExchangeRates()
      .then((rates) => {
        setExchangeRates(rates);
        setIsLoadingRates(false);
      })
      .catch((error) => {
        console.error('Failed to fetch exchange rates:', error);
        setIsLoadingRates(false);
      });
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    saveCurrencyPreference(newCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, exchangeRates, isLoadingRates }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
