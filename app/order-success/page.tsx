'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, Currency } from '@/lib/currency';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem('lastOrder');
    if (savedOrder) {
      setOrderDetails(JSON.parse(savedOrder));
    }
  }, []);

  if (!orderDetails) {
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
      <div className="max-w-3xl mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600">Thank you for your order. We'll send you a confirmation email shortly.</p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-6 pb-6 border-b">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
              <p className="text-gray-600 mt-1">Order ID: <span className="font-semibold text-primary">{orderId}</span></p>
              <p className="text-sm text-gray-500">
                {new Date(orderDetails.orderDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(orderDetails.total, (orderDetails.currency || 'INR') as Currency)}</p>
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Items Ordered</h3>
            <div className="space-y-3">
              {orderDetails.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-800">{item.productName}</p>
                    <p className="text-sm text-gray-600">
                      Packaging: {item.packaging} | Quantity: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-800">{item.price}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="mb-6 pb-6 border-b">
            <div className="space-y-2 text-gray-700">
              {orderDetails.subtotal != null && (
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(orderDetails.subtotal, (orderDetails.currency || 'INR') as Currency)}</span>
                </div>
              )}
              {orderDetails.shipping != null && (
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{orderDetails.shipping === 0 ? 'Free' : formatCurrency(orderDetails.shipping, (orderDetails.currency || 'INR') as Currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t">
                <span>Total:</span>
                <span className="text-primary">{formatCurrency(orderDetails.total, (orderDetails.currency || 'INR') as Currency)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Shipping Address</h3>
            <div className="text-gray-700 bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold">{orderDetails.shippingAddress.fullName}</p>
              <p>{orderDetails.shippingAddress.addressLine1}</p>
              {orderDetails.shippingAddress.addressLine2 && <p>{orderDetails.shippingAddress.addressLine2}</p>}
              <p>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.postalCode}</p>
              <p>{orderDetails.shippingAddress.country}</p>
              <p className="mt-2">{orderDetails.shippingAddress.email}</p>
              <p>{orderDetails.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Payment Method</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg capitalize">
              {orderDetails.paymentMethod === 'cod' ? 'Cash on Delivery' : 
               orderDetails.paymentMethod === 'bank' ? 'Bank Transfer' : 
               'Credit/Debit Card'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link
            href="/products"
            className="flex-1 bg-primary hover:bg-primary/90 text-white text-center px-8 py-3 rounded-lg font-semibold transition"
          >
            Continue Shopping
          </Link>
          <Link
            href="/contact"
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-center px-8 py-3 rounded-lg font-semibold transition"
          >
            Contact Support
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">📧 Confirmation email sent to:</span> {orderDetails.shippingAddress.email}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            You will receive tracking information once your order has been shipped.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Loading...</h1>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
