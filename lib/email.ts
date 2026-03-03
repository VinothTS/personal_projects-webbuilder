import nodemailer from 'nodemailer';

// Email configuration
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true', // false for port 587, true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
};

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport(emailConfig);
  }
  return transporter;
}

// Send contact form email
export async function sendContactEmail(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  recipientEmail: string;
}) {
  const { name, email, phone, subject, message, recipientEmail } = data;

  const mailOptions = {
    from: `"${name}" <${emailConfig.auth.user}>`, // Sender name and email
    to: recipientEmail,
    replyTo: email, // User's email for easy reply
    subject: `Contact Form: ${subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #555; }
          .value { margin-top: 5px; padding: 10px; background-color: white; border-left: 3px solid #4CAF50; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔔 New Contact Form Submission</h2>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">👤 Name:</div>
              <div class="value">${name}</div>
            </div>
            <div class="field">
              <div class="label">📧 Email:</div>
              <div class="value"><a href="mailto:${email}">${email}</a></div>
            </div>
            ${phone ? `
            <div class="field">
              <div class="label">📱 Phone:</div>
              <div class="value">${phone}</div>
            </div>
            ` : ''}
            <div class="field">
              <div class="label">📝 Subject:</div>
              <div class="value">${subject}</div>
            </div>
            <div class="field">
              <div class="label">💬 Message:</div>
              <div class="value">${message.replace(/\n/g, '<br>')}</div>
            </div>
            <div class="footer">
              <p>This email was sent from your website contact form.</p>
              <p>Reply directly to this email to respond to ${name}.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
Subject: ${subject}

Message:
${message}

---
This email was sent from your website contact form.
Reply directly to this email to respond to ${name}.
    `.trim(),
  };

  try {
    const info = await getTransporter().sendMail(mailOptions);
    console.log('Contact email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending contact email:', error);
    throw error;
  }
}

// Send order notification email
export async function sendOrderNotificationEmail(data: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    packaging: string;
  }>;
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  total: number;
  recipientEmail: string;
}) {
  const {
    orderId,
    customerName,
    customerEmail,
    customerPhone,
    items,
    shippingAddress,
    paymentMethod,
    subtotal,
    shipping,
    total,
    recipientEmail,
  } = data;

  // Format items list
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.packaging}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const itemsText = items.map(item => 
    `${item.name} (${item.packaging}) - Qty: ${item.quantity} @ $${item.price.toFixed(2)} = $${(item.price * item.quantity).toFixed(2)}`
  ).join('\n');

  const mailOptions = {
    from: `"Order Notification" <${emailConfig.auth.user}>`,
    to: recipientEmail,
    replyTo: customerEmail,
    subject: `🛒 New Order: ${orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 18px; font-weight: bold; color: #2196F3; margin-bottom: 10px; border-bottom: 2px solid #2196F3; padding-bottom: 5px; }
          .info-row { margin-bottom: 8px; }
          .label { font-weight: bold; color: #555; display: inline-block; min-width: 120px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; background-color: white; }
          th { background-color: #2196F3; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          .totals { background-color: white; padding: 15px; margin-top: 10px; border-radius: 5px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .grand-total { font-size: 20px; font-weight: bold; color: #2196F3; border-top: 2px solid #2196F3; padding-top: 10px; margin-top: 10px; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777; text-align: center; border-radius: 0 0 5px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛒 New Order Received!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Order ID: <strong>${orderId}</strong></p>
          </div>
          <div class="content">
            
            <!-- Customer Information -->
            <div class="section">
              <div class="section-title">👤 Customer Information</div>
              <div class="info-row"><span class="label">Name:</span> ${customerName}</div>
              <div class="info-row"><span class="label">Email:</span> <a href="mailto:${customerEmail}">${customerEmail}</a></div>
              ${customerPhone ? `<div class="info-row"><span class="label">Phone:</span> ${customerPhone}</div>` : ''}
            </div>

            <!-- Order Items -->
            <div class="section">
              <div class="section-title">📦 Order Items</div>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Packaging</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Unit Price</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <!-- Shipping Address -->
            <div class="section">
              <div class="section-title">🚚 Shipping Address</div>
              <div class="info-row"><strong>${shippingAddress.fullName}</strong></div>
              <div class="info-row">${shippingAddress.addressLine1}</div>
              ${shippingAddress.addressLine2 ? `<div class="info-row">${shippingAddress.addressLine2}</div>` : ''}
              <div class="info-row">${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}</div>
              <div class="info-row">${shippingAddress.country}</div>
              <div class="info-row" style="margin-top: 10px;">
                <span class="label">Email:</span> ${shippingAddress.email}
              </div>
              <div class="info-row">
                <span class="label">Phone:</span> ${shippingAddress.phone}
              </div>
            </div>

            <!-- Payment & Totals -->
            <div class="section">
              <div class="section-title">💳 Payment Information</div>
              <div class="info-row"><span class="label">Payment Method:</span> ${paymentMethod}</div>
              
              <div class="totals">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span>$${subtotal.toFixed(2)}</span>
                </div>
                <div class="total-row">
                  <span>Shipping:</span>
                  <span>$${shipping.toFixed(2)}</span>
                </div>
                <div class="total-row grand-total">
                  <span>Grand Total:</span>
                  <span>$${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div class="footer">
              <p><strong>⚡ Action Required:</strong> Please process this order and contact the customer if needed.</p>
              <p>This is an automated notification from your e-commerce website.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
🛒 NEW ORDER RECEIVED
Order ID: ${orderId}

CUSTOMER INFORMATION
--------------------
Name: ${customerName}
Email: ${customerEmail}
${customerPhone ? `Phone: ${customerPhone}` : ''}

ORDER ITEMS
-----------
${itemsText}

SHIPPING ADDRESS
----------------
${shippingAddress.fullName}
${shippingAddress.addressLine1}
${shippingAddress.addressLine2 ? `${shippingAddress.addressLine2}\n` : ''}${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}
${shippingAddress.country}

Contact: ${shippingAddress.email} | ${shippingAddress.phone}

PAYMENT INFORMATION
-------------------
Payment Method: ${paymentMethod}

Subtotal:  $${subtotal.toFixed(2)}
Shipping:  $${shipping.toFixed(2)}
----------------------------
TOTAL:     $${total.toFixed(2)}

⚡ Action Required: Please process this order and contact the customer if needed.
This is an automated notification from your e-commerce website.
    `.trim(),
  };

  try {
    const info = await getTransporter().sendMail(mailOptions);
    console.log('Order notification email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending order notification email:', error);
    throw error;
  }
}

// Verify email configuration
export async function verifyEmailConfig() {
  try {
    await getTransporter().verify();
    console.log('✅ Email server connection verified');
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    console.error('❌ Email server connection failed:', error);
    return { success: false, error };
  }
}
