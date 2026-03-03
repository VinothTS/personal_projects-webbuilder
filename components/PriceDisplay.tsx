'use client';

import { useCurrency } from '@/contexts/CurrencyContext';
import { convertCurrencySync, formatCurrency } from '@/lib/currency';

interface PriceDisplayProps {
  priceUSD: number;
  className?: string;
  showCurrency?: boolean;
}

export default function PriceDisplay({ priceUSD, className = '', showCurrency = true }: PriceDisplayProps) {
  const { currency } = useCurrency();
  
  const convertedPrice = convertCurrencySync(priceUSD, currency);
  const formattedPrice = formatCurrency(convertedPrice, currency);

  return (
    <span className={className}>
      {formattedPrice}
      {showCurrency && currency !== 'USD' && (
        <span className="text-xs text-gray-500 ml-1">
          ({currency})
        </span>
      )}
    </span>
  );
}
