/**
 * Razorpay Integration Utilities
 * 
 * This file contains helper functions for Razorpay payment gateway integration.
 * 
 * Setup Instructions:
 * 1. Sign up at https://razorpay.com/
 * 2. Get your API keys from Dashboard → Settings → API Keys
 * 3. Add keys to .env.local:
 *    RAZORPAY_KEY_ID=rzp_test_xxxxx (for frontend)
 *    RAZORPAY_KEY_SECRET=xxxxx (for backend)
 * 
 * Test Credentials (for development):
 * - Key ID: rzp_test_xxxxx
 * - Key Secret: xxxxx
 * 
 * Test Card Numbers:
 * - Success: 4111 1111 1111 1111
 * - Failure: 4111 1111 1111 1112
 * - CVV: Any 3 digits
 * - Expiry: Any future date
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';

// Razorpay configuration
export const razorpayConfig = {
  keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_xxxxx',
  keySecret: process.env.RAZORPAY_KEY_SECRET || 'xxxxx',
};

// Initialize Razorpay instance (server-side only)
export const razorpayInstance = new Razorpay({
  key_id: razorpayConfig.keyId,
  key_secret: razorpayConfig.keySecret,
});

/**
 * Create a Razorpay order
 * @param amount - Amount in smallest currency unit (paise for INR, cents for USD)
 * @param currency - Currency code (INR, USD, EUR, etc.)
 * @param receipt - Unique receipt ID
 * @param notes - Additional notes for the order
 */
export async function createRazorpayOrder(
  amount: number,
  currency: string,
  receipt: string,
  notes?: Record<string, string>
) {
  try {
    const options = {
      amount: Math.round(amount * 100), // Convert to smallest unit
      currency: currency,
      receipt: receipt,
      notes: notes || {},
    };

    const order = await razorpayInstance.orders.create(options);
    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verify Razorpay payment signature
 * @param orderId - Razorpay order ID
 * @param paymentId - Razorpay payment ID
 * @param signature - Payment signature from Razorpay
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const text = `${orderId}|${paymentId}`;
    const generated_signature = crypto
      .createHmac('sha256', razorpayConfig.keySecret)
      .update(text)
      .digest('hex');

    return generated_signature === signature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

/**
 * Get Razorpay configuration for frontend
 */
export function getRazorpayConfig() {
  return {
    keyId: razorpayConfig.keyId,
  };
}

/**
 * Convert currency to Razorpay supported format
 * Razorpay requires amount in smallest currency unit:
 * - INR: paise (1 INR = 100 paise)
 * - USD: cents (1 USD = 100 cents)
 * - EUR: cents (1 EUR = 100 cents)
 */
export function convertToSmallestUnit(amount: number, currency: string): number {
  // Most currencies use 100 subunits
  return Math.round(amount * 100);
}

/**
 * Generate unique receipt ID
 */
export function generateReceiptId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `rcpt_${timestamp}_${random}`;
}

/**
 * Razorpay supported currencies
 */
export const RAZORPAY_CURRENCIES = [
  'INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED', 'MYR',
] as const;

export type RazorpayCurrency = typeof RAZORPAY_CURRENCIES[number];

/**
 * Check if currency is supported by Razorpay
 */
export function isSupportedCurrency(currency: string): boolean {
  return RAZORPAY_CURRENCIES.includes(currency as RazorpayCurrency);
}
