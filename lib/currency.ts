// Currency conversion utilities

export type Currency = 'USD' | 'EUR' | 'INR' | 'CAD';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  flag: string;
}

export interface ExchangeRates {
  rates: Record<Currency, number>;
  lastUpdated: string;
}

// Currency information
export const currencies: Record<Currency, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
};

// Default fallback exchange rates (base: USD)
const defaultExchangeRates: Record<Currency, number> = {
  USD: 1.0,
  EUR: 0.92,
  INR: 83.12,
  CAD: 1.35,
};

// Cache for exchange rates
let cachedRates: ExchangeRates | null = null;

/**
 * Fetch live exchange rates from API
 * Using exchangerate-api.com (free tier: 1,500 requests/month)
 * Alternative APIs:
 * - https://api.exchangerate-api.com/v4/latest/USD (no key required)
 * - https://api.frankfurter.app/latest?from=USD (no key required)
 * - https://openexchangerates.org (requires API key)
 */
export async function fetchExchangeRates(): Promise<ExchangeRates> {
  try {
    // Using frankfurter.app - no API key required, updated daily
    const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=EUR,INR,CAD', {
      next: { revalidate: 86400 } // Cache for 24 hours (86400 seconds)
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }
    
    const data = await response.json();
    
    const rates: Record<Currency, number> = {
      USD: 1.0,
      EUR: data.rates.EUR || defaultExchangeRates.EUR,
      INR: data.rates.INR || defaultExchangeRates.INR,
      CAD: data.rates.CAD || defaultExchangeRates.CAD,
    };
    
    const exchangeRates: ExchangeRates = {
      rates,
      lastUpdated: data.date || new Date().toISOString().split('T')[0]
    };
    
    // Cache the rates
    cachedRates = exchangeRates;
    
    // Store in localStorage for client-side access
    if (typeof window !== 'undefined') {
      localStorage.setItem('exchange_rates', JSON.stringify(exchangeRates));
    }
    
    return exchangeRates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Try to use cached rates from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('exchange_rates');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          // Fall through to default rates
        }
      }
    }
    
    // Return default rates as fallback
    return {
      rates: defaultExchangeRates,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
  }
}

/**
 * Get current exchange rates (uses cache if available and fresh)
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
  // Check if we have cached rates
  if (cachedRates) {
    const cacheDate = new Date(cachedRates.lastUpdated);
    const today = new Date();
    
    // If cache is from today, use it
    if (cacheDate.toDateString() === today.toDateString()) {
      return cachedRates;
    }
  }
  
  // Check localStorage cache
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('exchange_rates');
    if (stored) {
      try {
        const storedRates: ExchangeRates = JSON.parse(stored);
        const cacheDate = new Date(storedRates.lastUpdated);
        const today = new Date();
        
        // If cache is from today, use it
        if (cacheDate.toDateString() === today.toDateString()) {
          cachedRates = storedRates;
          return storedRates;
        }
      } catch (e) {
        // Fall through to fetch new rates
      }
    }
  }
  
  // Fetch fresh rates
  return await fetchExchangeRates();
}

/**
 * Convert amount from USD to target currency using live rates
 */
export async function convertCurrency(amountUSD: number, toCurrency: Currency): Promise<number> {
  const { rates } = await getExchangeRates();
  const rate = rates[toCurrency];
  return amountUSD * rate;
}

/**
 * Convert amount from USD to target currency (synchronous version using cached/default rates)
 */
export function convertCurrencySync(amountUSD: number, toCurrency: Currency): number {
  // Try to use cached rates first
  if (cachedRates) {
    return amountUSD * cachedRates.rates[toCurrency];
  }
  
  // Try localStorage
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('exchange_rates');
    if (stored) {
      try {
        const storedRates: ExchangeRates = JSON.parse(stored);
        return amountUSD * storedRates.rates[toCurrency];
      } catch (e) {
        // Fall through to default rates
      }
    }
  }
  
  // Use default rates as fallback
  return amountUSD * defaultExchangeRates[toCurrency];
}

/**
 * Format currency amount with proper symbol and decimals
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const currencyInfo = currencies[currency];
  
  // Format with appropriate decimal places
  const decimals = currency === 'INR' ? 0 : 2; // INR typically doesn't show decimals
  const formattedAmount = amount.toFixed(decimals);
  
  // Add thousand separators
  const parts = formattedAmount.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  const finalAmount = parts.join('.');
  
  // Return with symbol
  if (currency === 'INR') {
    return `${currencyInfo.symbol}${finalAmount}`;
  }
  return `${currencyInfo.symbol}${finalAmount}`;
}

/**
 * Detect user's currency based on their location
 * This is a simplified version - in production, use IP geolocation API
 */
export function detectUserCurrency(): Currency {
  // Try to detect from browser timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  if (timezone.includes('Europe')) return 'EUR';
  if (timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Calcutta')) return 'INR';
  if (timezone.includes('America') && timezone.includes('Toronto')) return 'CAD';
  if (timezone.includes('America')) return 'USD';
  
  // Default to USD
  return 'USD';
}

/**
 * Get currency from localStorage or detect it
 */
export function getStoredCurrency(): Currency {
  if (typeof window === 'undefined') return 'USD';
  
  const stored = localStorage.getItem('preferred_currency');
  if (stored && ['USD', 'EUR', 'INR', 'CAD'].includes(stored)) {
    return stored as Currency;
  }
  
  // Detect and store
  const detected = detectUserCurrency();
  localStorage.setItem('preferred_currency', detected);
  return detected;
}

/**
 * Save user's currency preference
 */
export function saveCurrencyPreference(currency: Currency): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('preferred_currency', currency);
  }
}

/**
 * Update exchange rates from API (now uses live rates from frankfurter.app)
 */
export async function updateExchangeRates(): Promise<ExchangeRates> {
  // Use the same live API integration
  return await fetchExchangeRates();
}
