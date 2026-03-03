'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';

interface AddToCartProps {
  productId: string;
  productName: string;
  category: string;
  price: string;
  priceAmount?: number;
  priceCurrency?: string;
  image: string;
  packagingOptions?: string; // e.g., "1kg, 5kg, 10kg, 25kg bags"
}

export default function AddToCart({
  productId,
  productName,
  category,
  price,
  priceAmount,
  priceCurrency,
  image,
  packagingOptions
}: AddToCartProps) {
  const { addToCart } = useCart();
  const router = useRouter();
  
  // Parse packaging options from string like "1kg, 5kg, 10kg, 25kg bags"
  const parsePackagingOptions = (): string[] => {
    if (!packagingOptions) return ['Standard'];
    
    // Remove common suffixes and split by comma
    const cleaned = packagingOptions.replace(/bags?|packets?|units?/gi, '').trim();
    const options = cleaned.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0);
    
    return options.length > 0 ? options : ['Standard'];
  };

  const packaging = parsePackagingOptions();
  const [selectedPackaging, setSelectedPackaging] = useState(packaging[0]);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    
    addToCart({
      productId,
      productName,
      category,
      price,
      ...(priceAmount != null && priceCurrency ? { priceAmount, priceCurrency } : {}),
      image,
      packaging: selectedPackaging,
      quantity
    });

    // Show feedback and reset
    setTimeout(() => {
      setIsAdding(false);
      setQuantity(1);
    }, 500);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => {
      router.push('/cart');
    }, 600);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
      {/* Packaging Selector */}
      {packaging.length > 1 && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Packaging
          </label>
          <select
            value={selectedPackaging}
            onChange={(e) => setSelectedPackaging(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {packaging.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Quantity Selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Quantity ({selectedPackaging} per item)
        </label>
        <div className="flex items-center border border-gray-300 rounded-lg w-fit">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 py-2 hover:bg-gray-100 transition"
          >
            -
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 text-center border-x border-gray-300 py-2"
            min="1"
          />
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="px-4 py-2 hover:bg-gray-100 transition"
          >
            +
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Total: {quantity} × {selectedPackaging}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="flex-1 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {isAdding ? 'Added! ✓' : 'Add to Cart'}
        </button>
        <button
          onClick={handleBuyNow}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          Buy Now
        </button>
      </div>

      {/* Info Text */}
      <p className="text-xs text-gray-500 text-center">
        Add items to cart for bulk inquiry or request a custom quote
      </p>
    </div>
  );
}
