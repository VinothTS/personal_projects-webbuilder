# 📧 Email Notifications & Enquiry Management

## Overview

Your e-commerce platform now includes a complete contact form and order notification system. All customer enquiries and orders are automatically saved and can be viewed or exported.

---

## 🎯 Features

### Contact Form
- **Full validation** with Amazon-style error messages
- **Required fields**: Name, Email, Subject, Message
- **Optional field**: Phone number
- **Real-time validation** with helpful error messages
- **Success/Error feedback** with visual indicators
- **Form reset** after successful submission

### Order Notifications
- **Automatic notification** when orders are placed
- **Complete order details** including items, shipping address, payment method
- **Order tracking** with unique Order IDs
- **Persistent storage** in JSON format

### Data Storage
All enquiries and orders are stored in:
- `data/enquiries.json` - Customer contact form submissions
- `data/orders.json` - Customer orders with full details

---

## 📬 Viewing Enquiries & Orders

### Option 1: Command Line Script

```bash
# Mac/Linux
./view-enquiries.sh

# Or using npm
npm run prompt:view-enquiries
```

### Option 2: Docker Container

```bash
docker compose exec web npm run prompt:view-enquiries
```

### Interactive Menu

The script provides an interactive menu:

```
╔════════════════════════════════════════╗
║  Customer Enquiries & Orders Manager   ║
╚════════════════════════════════════════╝

What would you like to do?

1. View Enquiries
2. View Orders
3. Export Enquiries to CSV
4. Export Orders to CSV
5. Exit
```

---

## 📊 Enquiry Details

Each enquiry includes:
- **Enquiry ID**: Unique identifier (e.g., ENQ-1709456789123)
- **Timestamp**: When the enquiry was submitted
- **Customer Info**: Name, Email, Phone (optional)
- **Subject**: What the enquiry is about
- **Message**: Full message from customer
- **Status**: New/Pending/Resolved
- **Recipient Email**: Your business email (from config)

### Example Enquiry:
```
1. Enquiry ID: ENQ-1709456789123
   Date: 2/22/2026, 10:30:45 AM
   From: John Doe (john@example.com)
   Phone: +1 (555) 123-4567
   Subject: Product Inquiry
   Message: I'm interested in bulk orders of rice...
   Status: new
   Recipient Email: contact@yourbusiness.com
```

---

## 📦 Order Details

Each order includes:
- **Order ID**: Unique identifier (e.g., ORD-1709456789123)
- **Timestamp**: When the order was placed
- **Customer Info**: Name, Email, Phone
- **Payment Method**: Card/COD/Bank Transfer
- **Total Amount**: Including shipping
- **Status**: Pending/Processing/Completed
- **Items**: All products with quantities and packaging
- **Shipping Address**: Full delivery address
- **Recipient Email**: Your business email (from config)

### Example Order:
```
1. Order ID: ORD-1709456789123
   Date: 2/22/2026, 11:45:30 AM
   Customer: Jane Smith
   Email: jane@example.com
   Phone: +1 (555) 987-6543
   Payment Method: card
   Total Amount: Rs 1,250.00
   Status: pending
   Items: 2 item(s)
      1. Premium Basmati Rice - 1kg x 2
      2. Organic Wheat Flour - 5kg x 1
   Shipping Address:
      123 Main Street
      Apartment 4B
      Mumbai, Maharashtra 400001
      India
   Recipient Email: contact@yourbusiness.com
```

---

## 📤 Exporting Data

### Export to CSV

The script can export enquiries and orders to CSV files for use in:
- Excel / Google Sheets
- Email marketing tools
- CRM systems
- Accounting software

### Export Files

- **Enquiries CSV**: `enquiries-YYYY-MM-DD.csv`
  - Columns: ID, Date, Name, Email, Phone, Subject, Message, Status, Recipient Email

- **Orders CSV**: `orders-YYYY-MM-DD.csv`
  - Columns: Order ID, Date, Customer Name, Email, Phone, Payment Method, Subtotal, Shipping, Total, Status, Items Count, Recipient Email

### Usage

1. Run the enquiry viewer script
2. Select option 3 (Export Enquiries) or 4 (Export Orders)
3. CSV file will be created in the current directory
4. Open with Excel, Google Sheets, or any spreadsheet software

---

## 🔔 Setting Up Email Notifications

Currently, enquiries and orders are saved to JSON files. To receive actual email notifications:

### Option 1: SendGrid (Recommended)

```bash
npm install @sendgrid/mail
```

Update `app/api/contact/route.ts`:
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

await sgMail.send({
  to: recipientEmail,
  from: 'noreply@yourdomain.com',
  subject: `Contact Form: ${subject}`,
  html: `<h2>New Contact Form Submission</h2>...`
});
```

### Option 2: Resend (Modern Alternative)

```bash
npm install resend
```

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@yourdomain.com',
  to: recipientEmail,
  subject: `Contact Form: ${subject}`,
  html: `<h2>New Contact Form Submission</h2>...`
});
```

### Option 3: AWS SES

```bash
npm install @aws-sdk/client-ses
```

### Option 4: Nodemailer (SMTP)

```bash
npm install nodemailer
```

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

await transporter.sendMail({
  from: email,
  to: recipientEmail,
  subject: `Contact Form: ${subject}`,
  html: `<h2>New Contact Form Submission</h2>...`
});
```

---

## 🔐 Environment Variables

Create a `.env.local` file:

```env
# Email Service (choose one)
SENDGRID_API_KEY=your_sendgrid_api_key
RESEND_API_KEY=your_resend_api_key

# OR SMTP
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Business Email (from config)
BUSINESS_EMAIL=contact@yourbusiness.com
```

---

## 📧 Email Templates

### Contact Form Email Template

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2d5016; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #333; }
    .value { color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Contact Form Submission</h1>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">Name:</div>
        <div class="value">${name}</div>
      </div>
      <div class="field">
        <div class="label">Email:</div>
        <div class="value">${email}</div>
      </div>
      <div class="field">
        <div class="label">Phone:</div>
        <div class="value">${phone || 'Not provided'}</div>
      </div>
      <div class="field">
        <div class="label">Subject:</div>
        <div class="value">${subject}</div>
      </div>
      <div class="field">
        <div class="label">Message:</div>
        <div class="value">${message}</div>
      </div>
    </div>
  </div>
</body>
</html>
```

### Order Notification Email Template

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2d5016; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .order-id { font-size: 24px; font-weight: bold; color: #2d5016; }
    .section { margin: 20px 0; padding: 15px; background: #f9f9f9; }
    .items { list-style: none; padding: 0; }
    .item { padding: 10px; border-bottom: 1px solid #ddd; }
    .total { font-size: 20px; font-weight: bold; color: #2d5016; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Order Received!</h1>
      <div class="order-id">Order #${orderId}</div>
    </div>
    <div class="content">
      <div class="section">
        <h2>Customer Information</h2>
        <p><strong>Name:</strong> ${customerName}</p>
        <p><strong>Email:</strong> ${customerEmail}</p>
        <p><strong>Phone:</strong> ${customerPhone}</p>
      </div>
      <div class="section">
        <h2>Order Items</h2>
        <ul class="items">
          ${items.map(item => `
            <li class="item">
              ${item.productName} - ${item.packaging} × ${item.quantity}
            </li>
          `).join('')}
        </ul>
      </div>
      <div class="section">
        <h2>Shipping Address</h2>
        <p>${addressLine1}</p>
        ${addressLine2 ? `<p>${addressLine2}</p>` : ''}
        <p>${city}, ${state} ${postalCode}</p>
        <p>${country}</p>
      </div>
      <div class="section">
        <h2>Payment</h2>
        <p><strong>Method:</strong> ${paymentMethod}</p>
        <p><strong>Subtotal:</strong> Rs ${subtotal.toFixed(2)}</p>
        <p><strong>Shipping:</strong> Rs ${shipping.toFixed(2)}</p>
        <p class="total">Total: Rs ${total.toFixed(2)}</p>
      </div>
    </div>
  </div>
</body>
</html>
```

---

## 🔄 Workflow

### Contact Form Workflow
1. Customer fills out contact form
2. Form validates all fields
3. Submission sent to `/api/contact`
4. Enquiry saved to `data/enquiries.json`
5. (Optional) Email sent to business email
6. Success message shown to customer
7. Form resets for next submission

### Order Workflow
1. Customer completes checkout
2. Customer enters shipping address
3. Customer selects payment method
4. Order placed
5. Order notification sent to `/api/order-notification`
6. Order saved to `data/orders.json`
7. (Optional) Email sent to business email
8. Customer redirected to order success page
9. Cart cleared

---

## 📈 Analytics

### Key Metrics Available

From **Enquiries**:
- Total number of enquiries
- Enquiries by date/time
- Most common subjects
- Response rates
- Customer contact information

From **Orders**:
- Total number of orders
- Total revenue
- Average order value
- Popular products
- Orders by payment method
- Customer locations
- Peak ordering times

### Viewing Statistics

Use the CSV exports to create:
- Charts in Excel/Google Sheets
- Dashboard in business intelligence tools
- Reports for stakeholders
- Marketing campaign insights

---

## 🛠️ Troubleshooting

### Enquiries not saving?

Check:
1. `data/enquiries.json` exists and is writable
2. API route `/api/contact` is accessible
3. Console logs for errors

### Orders not saving?

Check:
1. `data/orders.json` exists and is writable
2. API route `/api/order-notification` is accessible
3. Payment page completing successfully

### Cannot view enquiries?

```bash
# Check if script is executable
chmod +x view-enquiries.sh

# Check if data files exist
ls -la data/

# Run with node directly
node scripts/view-enquiries.js
```

---

## 🎉 Summary

You now have a complete enquiry and order management system:

✅ **Contact form** with validation
✅ **Order notifications** on every purchase
✅ **Data persistence** in JSON files
✅ **Command-line viewer** for enquiries and orders
✅ **CSV export** for external tools
✅ **Ready for email integration** with popular services
✅ **Professional email templates** included

**Next Steps**:
1. Configure your business email in `config/business-config.json`
2. Test the contact form
3. Place a test order
4. View enquiries and orders with `./view-enquiries.sh`
5. (Optional) Set up email service for notifications

Your customers can now contact you and place orders, and you'll have all the information organized and accessible! 🚀
