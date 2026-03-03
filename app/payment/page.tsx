'use client';

import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/lib/currency';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentPage() {
  const { items, clearCart, getTotalItems } = useCart();
  const { currency, exchangeRates } = useCurrency();
  const router = useRouter();

  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Load shipping address from localStorage
    const savedAddress = localStorage.getItem('shippingAddress');
    if (savedAddress) {
      setShippingAddress(JSON.parse(savedAddress));
    } else {
      // Redirect to checkout if no shipping address
      router.push('/checkout');
    }

    // Check if Razorpay script is loaded
    if (typeof window !== 'undefined' && window.Razorpay) {
      setRazorpayLoaded(true);
    }
  }, [router]);

  // Calculate total in the display currency using stored priceAmount + priceCurrency
  const total = items.reduce((sum, item) => {
    if (item.priceAmount == null || !item.priceCurrency || !exchangeRates) return sum;
    const srcRate = exchangeRates.rates[item.priceCurrency as keyof typeof exchangeRates.rates] ?? 1;
    const dstRate = exchangeRates.rates[currency] ?? 1;
    return sum + (item.priceAmount / srcRate) * dstRate * item.quantity;
  }, 0);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    setIsProcessing(true);

    // Handle Razorpay payment
    if (paymentMethod === 'razorpay') {
      await handleRazorpayPayment();
      return;
    }

    // Handle Cash on Delivery
    // Simulate payment processing for COD
    setTimeout(async () => {
      await processOrder('cod');
    }, 2000);
  };

  const handleRazorpayPayment = async () => {
    try {
      if (!razorpayLoaded) {
        alert('Razorpay is not loaded. Please refresh the page.');
        setIsProcessing(false);
        return;
      }

      // Create order on backend
      const orderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          currency: currency,
          customerDetails: {
            name: shippingAddress.fullName,
            email: shippingAddress.email,
            phone: shippingAddress.phone,
          },
          orderDetails: {
            items: items,
          },
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_xxxxx',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Agro Export Business',
        description: `Order for ${getTotalItems()} items`,
        order_id: orderData.orderId,
        prefill: {
          name: shippingAddress.fullName,
          email: shippingAddress.email,
          contact: shippingAddress.phone,
        },
        notes: {
          address: `${shippingAddress.addressLine1}, ${shippingAddress.city}`,
        },
        theme: {
          color: '#22c55e', // Primary green color
        },
        handler: async function (response: any) {
          // Payment successful - verify on backend
          await verifyRazorpayPayment(response);
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            alert('Payment cancelled. Please try again.');
          },
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Razorpay payment error:', error);
      alert(error instanceof Error ? error.message : 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const verifyRazorpayPayment = async (response: any) => {
    try {
      const orderDetails = {
        items: items,
        shippingAddress: shippingAddress,
        total: total,
        currency: currency,
        displayTotal: total,
        customerEmail: shippingAddress.email,
      };

      const verifyResponse = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          orderDetails: orderDetails,
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        throw new Error('Payment verification failed');
      }

      // Save order for confirmation page
      const orderData = {
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        ...orderDetails,
        paymentMethod: 'razorpay',
        orderDate: new Date().toISOString(),
      };

      localStorage.setItem('lastOrder', JSON.stringify(orderData));

      // Clear cart and redirect
      clearCart();
      localStorage.removeItem('shippingAddress');
      router.push(`/order-success?orderId=${response.razorpay_order_id}`);
    } catch (error) {
      console.error('Payment verification error:', error);
      alert('Payment verification failed. Please contact support.');
      setIsProcessing(false);
    }
  };

  const processOrder = async (method: string) => {
    // Save order details for non-Razorpay payments
    const orderData = {
      orderId: `ORD-${Date.now()}`,
      items: items,
      shippingAddress: shippingAddress,
      paymentMethod: method,
      subtotal: total,
      shipping: 0,
      total: total,
      currency: currency,
      displayTotal: total,
      orderDate: new Date().toISOString(),
    };

    localStorage.setItem('lastOrder', JSON.stringify(orderData));

    // Send order notification email
    try {
      await fetch('/api/order-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
    } catch (error) {
      console.error('Failed to send order notification:', error);
    }
    
    // Clear cart
    clearCart();
    localStorage.removeItem('shippingAddress');

    // Redirect to success page
    router.push(`/order-success?orderId=${orderData.orderId}`);
  };

  if (!items || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Please add items to your cart before proceeding to payment.</p>
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

  if (!shippingAddress) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/checkout" className="text-primary hover:text-primary/80">
          ← Back to Shipping
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mt-4">Payment</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Payment Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Shipping Address Review */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800">Shipping Address</h2>
              <Link href="/checkout" className="text-primary text-sm hover:text-primary/80">
                Edit
              </Link>
            </div>
            <div className="text-gray-700">
              <p className="font-semibold">{shippingAddress.fullName}</p>
              <p>{shippingAddress.addressLine1}</p>
              {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
              <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
              <p>{shippingAddress.country}</p>
              <p className="mt-2">{shippingAddress.email}</p>
              <p>{shippingAddress.phone}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Method</h2>
            
            <form onSubmit={handlePayment} className="space-y-4">
              {/* Payment Options */}
              <div className="space-y-3">
                {/* Razorpay Payment Option */}
                <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-primary transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3 w-4 h-4"
                  />
                  <div className="flex-grow">
                    <span className="font-semibold">Razorpay</span>
                    <p className="text-sm text-gray-600">Pay securely with UPI, Cards, NetBanking & More</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">💳 Cards</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">🏦 UPI</span>
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">🏦 NetBanking</span>
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-primary transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3 w-4 h-4"
                  />
                  <div className="flex-grow">
                    <span className="font-semibold">Cash on Delivery</span>
                    <p className="text-sm text-gray-600">Pay when you receive your order</p>
                  </div>
                </label>
              </div>

              {/* Place Order Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : `Place Order - ${formatCurrency(total, currency)}`}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="max-h-48 overflow-y-auto space-y-2 border-b pb-3">
                {items.map((item, index) => (
                  <div key={`${item.productId}-${item.packaging}-${index}`} className="text-sm">
                    <p className="font-medium text-gray-800">{item.productName}</p>
                    <p className="text-gray-600">
                      {item.quantity} × {item.packaging}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(total, currency)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Prices shown in {currency} • Free Shipping</p>
              </div>

              <div className="flex justify-between text-sm text-gray-600 pt-2">
                <span>Total Items:</span>
                <span className="font-semibold">{getTotalItems()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
