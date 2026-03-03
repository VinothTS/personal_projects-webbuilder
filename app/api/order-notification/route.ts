import { NextRequest, NextResponse } from 'next/server';
import { getBusinessConfig } from '@/lib/config';
import { sendOrderNotificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, items, shippingAddress, paymentMethod, subtotal, shipping, total, orderDate } = body;

    // Validate required fields
    if (!orderId || !items || !shippingAddress) {
      return NextResponse.json(
        { error: 'Missing required order information' },
        { status: 400 }
      );
    }

    // Get business config for recipient email
    const config = await getBusinessConfig();
    const recipientEmail = config.contact.email;

    // Send order notification email
    try {
      await sendOrderNotificationEmail({
        orderId,
        customerName: shippingAddress.fullName,
        customerEmail: shippingAddress.email,
        customerPhone: shippingAddress.phone,
        items,
        shippingAddress,
        paymentMethod,
        subtotal,
        shipping,
        total,
        recipientEmail
      });
      console.log('✅ Order notification email sent successfully to:', recipientEmail);
    } catch (emailError) {
      console.error('⚠️ Email sending failed (but saving order):', emailError);
      // Continue even if email fails - we'll still save the order
    }

    // Save order notification
    const fs = require('fs');
    const path = require('path');
    const ordersPath = path.join(process.cwd(), 'data', 'orders.json');

    let orders = [];
    if (fs.existsSync(ordersPath)) {
      const data = fs.readFileSync(ordersPath, 'utf-8');
      orders = JSON.parse(data);
    }

    orders.push({
      orderId,
      timestamp: new Date().toISOString(),
      customerName: shippingAddress.fullName,
      customerEmail: shippingAddress.email,
      customerPhone: shippingAddress.phone,
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      shipping,
      total,
      orderDate,
      status: 'pending',
      recipientEmail
    });

    fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Order notification sent successfully',
      orderId
    });

  } catch (error) {
    console.error('Order notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send order notification' },
      { status: 500 }
    );
  }
}
