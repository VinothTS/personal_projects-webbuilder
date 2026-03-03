'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { currencies, type Currency } from '@/lib/currency';

export default function Header() {
  const [businessName, setBusinessName] = useState('Global Agro Exports');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const { getTotalItems } = useCart();
  const { currency, setCurrency } = useCurrency();
  const totalItems = getTotalItems();

  useEffect(() => {
    // Fetch business config on client side
    const fetchBusinessName = async () => {
      try {
        const response = await fetch('/api/config');
        const data = await response.json();
        if (data.business?.name) {
          setBusinessName(data.business.name);
        }
      } catch (error) {
        console.error('Failed to fetch business config:', error);
      }
    };

    fetchBusinessName();
  }, []);

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    setIsCurrencyOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            {businessName}
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary font-medium">
              Home
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-primary font-medium">
              Products
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-primary font-medium">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-primary font-medium">
              Contact
            </Link>
            
            {/* Currency Selector */}
            <div className="relative">
              <button
                onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg border border-gray-300 hover:border-primary hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg">{currencies[currency].flag}</span>
                <span className="font-medium text-gray-700">{currency}</span>
                <svg className={`w-4 h-4 text-gray-600 transition-transform ${isCurrencyOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isCurrencyOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsCurrencyOpen(false)}
                  />
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {(Object.keys(currencies) as Currency[]).map((curr) => (
                      <button
                        key={curr}
                        onClick={() => handleCurrencyChange(curr)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                          currency === curr ? 'bg-primary/10 text-primary' : 'text-gray-700'
                        }`}
                      >
                        <span className="text-2xl">{currencies[curr].flag}</span>
                        <div className="flex-1 text-left">
                          <div className="font-medium">{currencies[curr].code}</div>
                          <div className="text-xs text-gray-500">{currencies[curr].name}</div>
                        </div>
                        {currency === curr && (
                          <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <Link href="/cart" className="relative">
              <svg className="w-6 h-6 text-gray-700 hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3">
            <Link href="/" className="block text-gray-700 hover:text-primary font-medium">
              Home
            </Link>
            <Link href="/products" className="block text-gray-700 hover:text-primary font-medium">
              Products
            </Link>
            <Link href="/about" className="block text-gray-700 hover:text-primary font-medium">
              About
            </Link>
            <Link href="/contact" className="block text-gray-700 hover:text-primary font-medium">
              Contact
            </Link>
            
            {/* Mobile Currency Selector */}
            <div className="pt-2 border-t border-gray-200">
              <div className="text-sm text-gray-500 mb-2">Currency</div>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(currencies) as Currency[]).map((curr) => (
                  <button
                    key={curr}
                    onClick={() => handleCurrencyChange(curr)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                      currency === curr
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-300 text-gray-700 hover:border-primary'
                    }`}
                  >
                    <span className="text-xl">{currencies[curr].flag}</span>
                    <span className="font-medium text-sm">{currencies[curr].code}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <Link href="/cart" className="block text-gray-700 hover:text-primary font-medium pt-2">
              Cart ({totalItems})
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
