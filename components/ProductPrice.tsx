'use client';

import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/lib/currency';

interface ProductPriceProps {
  price?: string;
  priceUSD?: number;
  priceAmount?: number;
  priceCurrency?: string;
  className?: string;
}

export default function ProductPrice({ price, priceUSD, priceAmount, priceCurrency, className = 'text-primary font-bold text-3xl' }: ProductPriceProps) {
  const { currency, exchangeRates } = useCurrency();

  // Extract unit from original price string (e.g., "/kg", "/lb")
  const unitMatch = price?.match(/(\/\w+)/);
  const unit = unitMatch ? unitMatch[1] : '';

  if (!exchangeRates) {
    return <p className={className}>Loading...</p>;
  }

  // New path: stored currency + amount
  if (priceAmount != null && priceCurrency) {
    const srcRate = exchangeRates.rates[priceCurrency as keyof typeof exchangeRates.rates] ?? 1;
    const dstRate = exchangeRates.rates[currency] ?? 1;
    const amountInDisplay = (priceAmount / srcRate) * dstRate;
    const displayPrice = formatCurrency(amountInDisplay, currency);

    return (
      <div>
        <p className={className}>{displayPrice}{unit}</p>
        {currency !== priceCurrency && (
          <p className="text-sm text-gray-500 mt-1">
            Original: {priceCurrency} {priceAmount.toLocaleString()}{unit}
          </p>
        )}
      </div>
    );
  }

  // Legacy path: priceUSD field
  if (priceUSD != null) {
    const rate = exchangeRates.rates[currency] ?? 1;
    const displayPrice = formatCurrency(priceUSD * rate, currency);
    return (
      <div>
        <p className={className}>{displayPrice}{unit}</p>
        {currency !== 'USD' && (
          <p className="text-sm text-gray-500 mt-1">Original: ${priceUSD.toFixed(2)}{unit} USD</p>
        )}
      </div>
    );
  }

  return <p className={className}>Contact for price</p>;
}
