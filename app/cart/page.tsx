'use client';

import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/lib/currency';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalItems } = useCart();
  const { currency, exchangeRates } = useCurrency();

  // Convert a stored price amount to the display currency
  const toDisplayAmount = (priceAmount: number | undefined, priceCurrency: string | undefined, qty = 1): number => {
    if (!exchangeRates || priceAmount == null || !priceCurrency) return 0;
    const srcRate = exchangeRates.rates[priceCurrency as keyof typeof exchangeRates.rates] ?? 1;
    const dstRate = exchangeRates.rates[currency] ?? 1;
    return (priceAmount / srcRate) * dstRate * qty;
  };

  // Group items by product ID
  const groupedItems = () => {
    if (!items) return {};
    return items.reduce((groups, item) => {
      if (!groups[item.productId]) {
        groups[item.productId] = {
          productName: item.productName,
          category: item.category,
          price: item.price,
          priceAmount: item.priceAmount,
          priceCurrency: item.priceCurrency,
          image: item.image || '',
          packages: []
        };
      }
      groups[item.productId].packages.push({
        packaging: item.packaging,
        quantity: item.quantity
      });
      return groups;
    }, {} as Record<string, {
      productName: string;
      category: string;
      price: string;
      priceAmount?: number;
      priceCurrency?: string;
      image: string;
      packages: { packaging: string; quantity: number }[];
    }>);
  };

  // Grand total across all items
  const calculateTotal = () => {
    if (!items || !exchangeRates) return 0;
    return items.reduce((total, item) => {
      return total + toDisplayAmount(item.priceAmount, item.priceCurrency, item.quantity);
    }, 0);
  };

  // Subtotal for one grouped product
  const calculateProductSubtotal = (priceAmount: number | undefined, priceCurrency: string | undefined, packages: { quantity: number }[]) => {
    const totalQty = packages.reduce((sum, pkg) => sum + pkg.quantity, 0);
    return toDisplayAmount(priceAmount, priceCurrency, totalQty);
  };

  // Per-unit price display for a product
  const formatPrice = (priceAmount: number | undefined, priceCurrency: string | undefined) => {
    if (!exchangeRates) return 'Loading...';
    if (priceAmount == null || !priceCurrency) return 'Contact for price';
    return formatCurrency(toDisplayAmount(priceAmount, priceCurrency), currency);
  };

  const handleQuantityChange = (productId: string, packaging: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId, packaging);
    } else {
      updateQuantity(productId, packaging, newQuantity);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Add some products to your cart to get started!</p>
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-800 font-medium"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Cart Items - Grouped by Product */}
        <div className="md:col-span-2 space-y-6">
          {Object.entries(groupedItems()).map(([productId, product]) => (
            <div 
              key={productId}
              className="bg-white rounded-lg shadow p-6"
            >
              {/* Product Header */}
              <div className="flex gap-4 mb-4">
                {/* Product Image */}
                <div className="w-32 h-32 flex-shrink-0">
                  <Image
                    src={product.image}
                    alt={product.productName}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover rounded"
                    unoptimized
                  />
                </div>

                {/* Product Info */}
                <div className="flex-grow">
                  <h3 className="font-bold text-xl text-gray-800">{product.productName}</h3>
                  <p className="text-sm text-gray-600 mt-1">{product.category}</p>
                  <p className="text-primary font-bold text-lg mt-2">{formatPrice(product.priceAmount, product.priceCurrency)}</p>

                  {/* Subtotal for this product */}
                  <div className="mt-2 text-sm text-gray-700">
                    <span className="font-semibold">Subtotal: </span>
                    <span className="text-primary font-bold">
                      {formatCurrency(calculateProductSubtotal(product.priceAmount, product.priceCurrency, product.packages), currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Package Lines */}
              <div className="border-t pt-4 space-y-3">
                {product.packages.map((pkg, index) => (
                  <div 
                    key={`${productId}-${pkg.packaging}-${index}`}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-4 flex-grow">
                      {/* Packaging Type */}
                      <div className="min-w-[100px]">
                        <span className="text-sm font-medium text-gray-700">
                          📦 {pkg.packaging}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-300 rounded bg-white">
                        <button
                          onClick={() => handleQuantityChange(productId, pkg.packaging, pkg.quantity - 1)}
                          className="px-3 py-1.5 hover:bg-gray-100 transition"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={pkg.quantity}
                          onChange={(e) => handleQuantityChange(productId, pkg.packaging, parseInt(e.target.value) || 1)}
                          className="w-16 text-center border-x border-gray-300 py-1.5 focus:outline-none"
                          min="1"
                        />
                        <button
                          onClick={() => handleQuantityChange(productId, pkg.packaging, pkg.quantity + 1)}
                          className="px-3 py-1.5 hover:bg-gray-100 transition"
                        >
                          +
                        </button>
                      </div>

                      {/* Quantity Display */}
                      <span className="text-sm text-gray-600">
                        Qty: <span className="font-semibold">{pkg.quantity}</span> × {pkg.packaging}
                      </span>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(productId, pkg.packaging)}
                      className="text-red-600 hover:text-red-800 ml-4"
                      aria-label="Remove this packaging"
                      title="Remove this packaging"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Estimated Total:</span>
                  <span className="text-primary">{formatCurrency(calculateTotal(), currency)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  *Prices shown in {currency}. Actual price may vary based on quantity and shipping
                </p>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full bg-primary text-white text-center px-6 py-3 rounded-lg hover:bg-primary/90 transition font-medium"
            >
              Proceed to Checkout
            </Link>
            
            <Link
              href="/products"
              className="block w-full text-center text-primary hover:text-primary/80 mt-4 font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
