'use client';

import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/lib/currency';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, getTotalItems } = useCart();
  const { currency, exchangeRates } = useCurrency();
  const router = useRouter();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate total price with correct currency conversion
  const calculateTotal = () => {
    if (!items || !exchangeRates) return 0;
    return items.reduce((total, item) => {
      if (item.priceAmount == null || !item.priceCurrency) return total;
      const srcRate = exchangeRates.rates[item.priceCurrency as keyof typeof exchangeRates.rates] ?? 1;
      const dstRate = exchangeRates.rates[currency] ?? 1;
      return total + (item.priceAmount / srcRate) * dstRate * item.quantity;
    }, 0);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Full Name - Required, minimum 2 characters
    if (!shippingAddress.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name';
    } else if (shippingAddress.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    // Email - Required, valid format
    if (!shippingAddress.email.trim()) {
      newErrors.email = 'Please enter your email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone - Required, basic format check
    if (!shippingAddress.phone.trim()) {
      newErrors.phone = 'Please enter your phone number';
    } else if (!/^[\d\s\-\+\(\)]{10,}$/.test(shippingAddress.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Address Line 1 - Required, minimum 5 characters
    if (!shippingAddress.addressLine1.trim()) {
      newErrors.addressLine1 = 'Please enter your street address';
    } else if (shippingAddress.addressLine1.trim().length < 5) {
      newErrors.addressLine1 = 'Address must be at least 5 characters';
    }

    // City - Required, minimum 2 characters
    if (!shippingAddress.city.trim()) {
      newErrors.city = 'Please enter your city';
    } else if (shippingAddress.city.trim().length < 2) {
      newErrors.city = 'City name must be at least 2 characters';
    }

    // State/Province - Required, minimum 2 characters
    if (!shippingAddress.state.trim()) {
      newErrors.state = 'Please enter your state or province';
    } else if (shippingAddress.state.trim().length < 2) {
      newErrors.state = 'State/Province must be at least 2 characters';
    }

    // Postal Code - Required, minimum 3 characters
    if (!shippingAddress.postalCode.trim()) {
      newErrors.postalCode = 'Please enter your postal code';
    } else if (shippingAddress.postalCode.trim().length < 3) {
      newErrors.postalCode = 'Postal code must be at least 3 characters';
    }

    // Country - Required, minimum 2 characters
    if (!shippingAddress.country.trim()) {
      newErrors.country = 'Please enter your country';
    } else if (shippingAddress.country.trim().length < 2) {
      newErrors.country = 'Country name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Save shipping address to localStorage
      localStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
      
      // Navigate to payment page
      router.push('/payment');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Please add items to your cart before checking out.</p>
          <Link 
            href="/products"
            className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/cart" className="text-primary hover:text-primary/80">
          ← Back to Cart
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mt-4">Checkout</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Shipping Address Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Shipping Address</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border ${errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'} rounded-md focus:ring-2 focus:border-transparent transition`}
                  placeholder="Enter your full name"
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                />
                {errors.fullName && (
                  <p id="fullName-error" className="text-red-600 text-xs mt-1.5 flex items-start">
                    <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email and Phone */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={shippingAddress.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'} rounded-md focus:ring-2 focus:border-transparent transition`}
                    placeholder="your@email.com"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-red-600 text-xs mt-1.5 flex items-start">
                      <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'} rounded-md focus:ring-2 focus:border-transparent transition`}
                    placeholder="+1 (555) 000-0000"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                  />
                  {errors.phone && (
                    <p id="phone-error" className="text-red-600 text-xs mt-1.5 flex items-start">
                      <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Address Line 1 */}
              <div>
                <label htmlFor="addressLine1" className="block text-sm font-semibold text-gray-700 mb-2">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="addressLine1"
                  name="addressLine1"
                  value={shippingAddress.addressLine1}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border ${errors.addressLine1 ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'} rounded-md focus:ring-2 focus:border-transparent transition`}
                  placeholder="Street address, P.O. box"
                  aria-invalid={!!errors.addressLine1}
                  aria-describedby={errors.addressLine1 ? 'addressLine1-error' : undefined}
                />
                {errors.addressLine1 && (
                  <p id="addressLine1-error" className="text-red-600 text-xs mt-1.5 flex items-start">
                    <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {errors.addressLine1}
                  </p>
                )}
              </div>

              {/* Address Line 2 */}
              <div>
                <label htmlFor="addressLine2" className="block text-sm font-semibold text-gray-700 mb-2">
                  Address Line 2 <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="addressLine2"
                  name="addressLine2"
                  value={shippingAddress.addressLine2}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  placeholder="Apartment, suite, unit, building, floor, etc."
                />
              </div>

              {/* City, State, Postal Code */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border ${errors.city ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'} rounded-md focus:ring-2 focus:border-transparent transition`}
                    placeholder="City"
                    aria-invalid={!!errors.city}
                    aria-describedby={errors.city ? 'city-error' : undefined}
                  />
                  {errors.city && (
                    <p id="city-error" className="text-red-600 text-xs mt-1.5 flex items-start">
                      <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-2">
                    State/Province <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border ${errors.state ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'} rounded-md focus:ring-2 focus:border-transparent transition`}
                    placeholder="State"
                    aria-invalid={!!errors.state}
                    aria-describedby={errors.state ? 'state-error' : undefined}
                  />
                  {errors.state && (
                    <p id="state-error" className="text-red-600 text-xs mt-1.5 flex items-start">
                      <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {errors.state}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="postalCode" className="block text-sm font-semibold text-gray-700 mb-2">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={shippingAddress.postalCode}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border ${errors.postalCode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'} rounded-md focus:ring-2 focus:border-transparent transition`}
                    placeholder="ZIP/Postal"
                    aria-invalid={!!errors.postalCode}
                    aria-describedby={errors.postalCode ? 'postalCode-error' : undefined}
                  />
                  {errors.postalCode && (
                    <p id="postalCode-error" className="text-red-600 text-xs mt-1.5 flex items-start">
                      <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {errors.postalCode}
                    </p>
                  )}
                </div>
              </div>

              {/* Country */}
              <div>
                <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border ${errors.country ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'} rounded-md focus:ring-2 focus:border-transparent transition`}
                  placeholder="Country"
                  aria-invalid={!!errors.country}
                  aria-describedby={errors.country ? 'country-error' : undefined}
                />
                {errors.country && (
                  <p id="country-error" className="text-red-600 text-xs mt-1.5 flex items-start">
                    <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {errors.country}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-semibold transition"
                >
                  Continue to Payment
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Total Items:</span>
                <span className="font-semibold">{getTotalItems()}</span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 border-t border-b py-3">
                {items.map((item, index) => {
                  const convertedPrice = (exchangeRates && item.priceAmount != null && item.priceCurrency)
                    ? (item.priceAmount / (exchangeRates.rates[item.priceCurrency as keyof typeof exchangeRates.rates] ?? 1)) * (exchangeRates.rates[currency] ?? 1)
                    : 0;
                  
                  return (
                    <div key={`${item.productId}-${item.packaging}-${index}`} className="text-sm">
                      <p className="font-medium text-gray-800">{item.productName}</p>
                      <p className="text-gray-600">
                        {item.quantity} × {item.packaging} - {formatCurrency(convertedPrice, currency)}
                      </p>
                    </div>
                  );
                })}
              </div>
              
              <div className="pt-3">
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(calculateTotal(), currency)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Prices shown in {currency} • Free Shipping Worldwide
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
