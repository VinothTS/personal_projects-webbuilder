import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder, generateReceiptId } from '@/lib/razorpay';

/**
 * POST /api/razorpay/create-order
 * 
 * Creates a Razorpay order for payment processing
 * 
 * Body:
 * {
 *   amount: number,        // Amount in currency units (e.g., 100 for $100)
 *   currency: string,      // Currency code (INR, USD, EUR, etc.)
 *   customerDetails: {     // Customer information
 *     name: string,
 *     email: string,
 *     phone: string
 *   },
 *   orderDetails: {        // Order information
 *     items: array,
 *     shippingCost: number
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency, customerDetails, orderDetails } = body;

    // Validate required fields
    if (!amount || !currency) {
      return NextResponse.json(
        { success: false, error: 'Amount and currency are required' },
        { status: 400 }
      );
    }

    // Generate unique receipt ID
    const receipt = generateReceiptId();

    // Prepare notes for the order
    const notes = {
      customer_name: customerDetails?.name || 'Guest',
      customer_email: customerDetails?.email || '',
      customer_phone: customerDetails?.phone || '',
      item_count: orderDetails?.items?.length?.toString() || '0',
      shipping_cost: orderDetails?.shippingCost?.toString() || '0',
    };

    // Create Razorpay order
    const result = await createRazorpayOrder(amount, currency, receipt, notes);

    if (!result.success || !result.order) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create order' },
        { status: 500 }
      );
    }

    // Return order details to frontend
    return NextResponse.json({
      success: true,
      orderId: result.order.id,
      amount: result.order.amount,
      currency: result.order.currency,
      receipt: result.order.receipt,
    });
  } catch (error) {
    console.error('Error in create-order API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
