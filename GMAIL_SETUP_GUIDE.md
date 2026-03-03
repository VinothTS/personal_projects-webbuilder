# Gmail SMTP Setup Guide

## 📧 How to Configure Gmail for Sending Emails

Your e-commerce website is now configured to send real emails using Gmail SMTP. Follow these steps to set up your Gmail account:

---

## Step 1: Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com/security
2. Scroll down to "How you sign in to Google"
3. Click on **"2-Step Verification"**
4. Follow the prompts to enable 2-Step Verification if not already enabled
   - You'll need your phone to receive verification codes
   - This is required for generating App Passwords

---

## Step 2: Generate App Password

1. After enabling 2-Step Verification, go to: https://myaccount.google.com/apppasswords
   - Or navigate: Google Account → Security → 2-Step Verification → App passwords
2. You might need to sign in again
3. In the "Select app" dropdown, choose **"Mail"**
4. In the "Select device" dropdown, choose **"Other (Custom name)"**
5. Enter a name like: `E-commerce Website` or `Order Notifications`
6. Click **"Generate"**
7. Google will show you a 16-character password like: `abcd efgh ijkl mnop`
8. **Important:** Copy this password immediately - you won't be able to see it again!

---

## Step 3: Update Your Environment Variables

1. Open the file: `.env.local` in your project root
2. Update the following lines with your actual information:

```bash
# Replace with your actual Gmail address
EMAIL_USER=your-email@gmail.com

# Replace with the App Password you generated (remove spaces)
EMAIL_PASSWORD=abcdefghijklmnop
```

### Example:
```bash
EMAIL_USER=john.doe@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
```

**Notes:**
- Remove all spaces from the App Password when copying it
- Keep the other settings as they are (`EMAIL_HOST=smtp.gmail.com`, `EMAIL_PORT=587`, `EMAIL_SECURE=false`)

---

## Step 4: Restart Your Development Server

After updating `.env.local`:

```bash
# Stop the current server (Ctrl+C in the terminal)
# Then restart it:
npm run dev
```

The new environment variables will be loaded.

---

## Step 5: Test Email Sending

### Test 1: Contact Form
1. Open your website: http://localhost:3000/contact
2. Fill out and submit the contact form
3. Check your Gmail inbox - you should receive the enquiry email!

### Test 2: Order Notification
1. Add products to cart: http://localhost:3000/products
2. Go to checkout and complete an order
3. You should receive a detailed order notification email

### Test 3: View Saved Data
```bash
npm run prompt:view-enquiries
```
Choose options to view enquiries and orders.

---

## 🎯 What Emails Will You Receive?

### 1. **Contact Form Enquiries**
When customers submit the contact form, you'll receive:
- Customer name, email, phone
- Subject and message
- Beautifully formatted HTML email
- Reply-to set to customer's email for easy responses

### 2. **Order Notifications**
When orders are placed, you'll receive:
- Complete order details with all items
- Customer information
- Shipping address
- Payment method
- Order totals
- Professional invoice-style HTML email

---

## 🔒 Security Best Practices

1. **Never commit `.env.local` to Git**
   - It's already in `.gitignore`
   - Keep your credentials private

2. **Use App Passwords, not your Gmail password**
   - More secure
   - Can be revoked without changing your main password

3. **Limit access to your Gmail account**
   - Review https://myaccount.google.com/security regularly
   - Remove unused App Passwords

4. **For Production:**
   - Consider using a dedicated business email
   - Or professional services like SendGrid (3,000 free emails/month)

---

## 🐛 Troubleshooting

### "Invalid login" error
- Make sure 2-Step Verification is enabled
- Regenerate the App Password
- Check that you removed all spaces from the password
- Verify `EMAIL_USER` is your complete Gmail address

### "Connection timeout" error
- Check your internet connection
- Verify `EMAIL_PORT=587` and `EMAIL_SECURE=false`
- Some networks block SMTP - try a different network

### Emails not arriving
- Check your Spam folder
- Verify the recipient email in `config/business-config.json`
- Check terminal logs for error messages
- Run: `node -e "require('./lib/email').verifyEmailConfig()"` to test connection

### Testing with curl (if needed)
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Email",
    "message": "Testing Gmail SMTP integration"
  }'
```

---

## 📊 Email Features

### Contact Form Emails Include:
✅ Professional HTML design with styling
✅ All customer information organized
✅ Reply-to functionality (click reply to respond to customer)
✅ Mobile-responsive design
✅ Plain text fallback for older email clients

### Order Notification Emails Include:
✅ Complete order summary table
✅ Product details with quantities and prices
✅ Full shipping address
✅ Payment information
✅ Grand total calculations
✅ Professional invoice-style layout
✅ Action prompts for order processing

---

## 🚀 Production Deployment

When deploying to production (Docker, Vercel, AWS, etc.):

1. **Set environment variables in your hosting platform**
   - Don't use `.env.local` in production
   - Use your platform's environment variable settings

2. **Update the sender email if needed**
   - For better deliverability, use a domain email
   - Or stick with Gmail for small volumes

3. **Monitor email delivery**
   - Check logs for failed sends
   - All enquiries/orders are still saved to JSON files as backup

---

## 🎉 You're All Set!

Once configured, your website will automatically:
- Send you emails when customers contact you
- Notify you immediately when orders are placed
- Save all data to JSON files as backup
- Provide a professional experience for your customers

**Quick Start:**
1. Enable 2-Step Verification
2. Generate App Password
3. Update `.env.local`
4. Restart server
5. Test contact form

Need help? Check the terminal logs for detailed error messages when emails are sent.
