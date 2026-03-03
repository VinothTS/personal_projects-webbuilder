'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/lib/currency';
import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { currency, exchangeRates } = useCurrency();

  let displayPrice = 'Contact for price';
  if (exchangeRates) {
    if (product.priceAmount != null && product.priceCurrency) {
      // New path: convert from stored currency to display currency
      const srcRate = exchangeRates.rates[product.priceCurrency as keyof typeof exchangeRates.rates] ?? 1;
      const dstRate = exchangeRates.rates[currency] ?? 1;
      displayPrice = formatCurrency((product.priceAmount / srcRate) * dstRate, currency);
    } else if (product.priceUSD != null) {
      // Legacy path: priceUSD is always USD base
      displayPrice = formatCurrency(product.priceUSD * (exchangeRates.rates[currency] ?? 1), currency);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
      <Link href={`/products/${product.id}`}>
        <div className="relative h-48 bg-gray-200 cursor-pointer">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
              unoptimized
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-4xl">
              {product.category === 'Rice' && '🌾'}
              {product.category === 'Pulses' && '🫘'}
              {product.category === 'Tea' && '🍵'}
              {product.category === 'Fish Products' && '🐟'}
              {product.category === 'Flowers' && '🌺'}
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <span className="text-xs bg-secondary/20 text-primary px-2 py-1 rounded">
          {product.category}
        </span>
        <h3 className="font-bold text-lg mt-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center mt-4">
          <p className="text-primary font-bold text-lg">{displayPrice}</p>
          <Link 
            href={`/products/${product.id}`}
            className="text-primary hover:text-secondary font-semibold text-sm"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
