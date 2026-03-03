import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { sendOrderNotificationEmail } from '@/lib/email';
import fs from 'fs';
import path from 'path';

/**
 * POST /api/razorpay/verify-payment
 * 
 * Verifies Razorpay payment signature and processes the order
 * 
 * Body:
 * {
 *   razorpay_order_id: string,
 *   razorpay_payment_id: string,
 *   razorpay_signature: string,
 *   orderDetails: {
 *     items: array,
 *     total: number,
 *     currency: string,
 *     shippingAddress: object,
 *     customerEmail: string
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderDetails 
    } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing payment verification parameters' },
        { status: 400 }
      );
    }

    // Verify payment signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Payment verified successfully - save order
    const order = {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      timestamp: new Date().toISOString(),
      status: 'paid',
      ...orderDetails,
    };

    // Save to orders.json
    const ordersFilePath = path.join(process.cwd(), 'data', 'orders.json');
    let orders = [];

    try {
      if (fs.existsSync(ordersFilePath)) {
        const ordersData = fs.readFileSync(ordersFilePath, 'utf-8');
        orders = JSON.parse(ordersData);
      }
    } catch (error) {
      console.error('Error reading orders file:', error);
    }

    orders.push(order);

    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2));

    // Send order notification email
    try {
      await sendOrderNotificationEmail(order);
    } catch (emailError) {
      console.error('Error sending order notification:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order saved successfully',
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error('Error in verify-payment API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
