# Global Agro Exports - Multi-Business Website Template

A revolutionary website management system that allows non-technical business owners to create, customize, and manage their own professional websites using simple natural language prompts.

## 🌟 Key Innovation

**TRUE DEMOCRATIZATION**: Each businessman can:
- Set up their OWN business information
- Add products with prices using simple prompts
- Change website styling with one command
- Auto-deploy to live website
- Accept payments via Razorpay (UPI, Cards, NetBanking)
- Manage everything independently - NO coding needed!

## 🎯 Perfect For

- Agro exporters (Rice, Pulses, Tea, Fish, Flowers)
- Small business owners
- Non-technical entrepreneurs
- Multiple businesses sharing one codebase

## 📦 What's Included

```
web_build/
├── app/                      # Website pages
│   ├── page.tsx             # Homepage
│   ├── products/            # Products listing and details
│   ├── cart/                # Shopping cart
│   ├── checkout/            # Shipping address form
│   ├── payment/             # Payment page (Razorpay integrated)
│   ├── about/               # About page
│   ├── contact/             # Contact page
│   └── api/                 # API routes (payment, email)
├── components/              # Reusable components
├── contexts/                # Global state (Cart, Currency)
├── scripts/                 # Easy-to-use management scripts
│   ├── add-product.js      # Add products
│   ├── remove-product.js   # Remove products
│   ├── update-product.js   # Update products
│   └── deploy.js           # Deploy website
├── lib/                     # Business logic
│   ├── currency.ts         # Live exchange rates
│   ├── razorpay.ts         # Payment integration
│   └── email.ts            # Email notifications
├── data/                    # Product data storage
└── public/                  # Images and static files
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your details (OpenAI API key is optional).

### 3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your website.

## 📝 Managing Products (For Non-Technical Users)

### Add a Product

```bash
npm run prompt:add-product
```

**Examples:**
- "Add Basmati Rice, premium quality long-grain rice from India"
- "Add organic green tea in Tea category, best quality from Darjeeling"
- "Add fresh roses in Flowers category with image https://example.com/rose.jpg"

### Update a Product

```bash
npm run prompt:update-product
```

Follow the interactive prompts to:
- Change product name
- Update description
- Change category
- Add or update product image

### Remove a Product

```bash
npm run prompt:remove-product
```

Simply enter the product name or ID when prompted.

### Deploy Website

```bash
npm run prompt:deploy
```

This builds your website for production.

## 🎯 Product Categories

1. **Rice** - Basmati, Jasmine, Brown Rice, etc.
2. **Pulses** - Lentils, Chickpeas, Kidney Beans, etc.
3. **Tea** - Green Tea, Black Tea, Herbal Tea, etc.
4. **Fish Products** - Dried Fish, Fish Oil, Seafood, etc.
5. **Flowers** - Roses, Orchids, Tulips, etc.

## 📸 Adding Product Images

You can add images in two ways:

1. **From URL** - Provide an image URL when adding/updating products
2. **Manual** - Place images in `public/images/products/` folder

Images are automatically optimized for web performance.

## 🌐 Deployment Options

### Option 1: Vercel (Recommended - FREE)

```bash
npm install -g vercel
vercel
```

Follow the prompts. Your site will be live in minutes!

### Option 2: Netlify

```bash
npm install -g netlify-cli
netlify deploy
```

### Option 3: Self-Hosted

```bash
npm run build
npm start
```

Run this on your server with Node.js installed.

## 🛠️ Technical Details

### Tech Stack

- **Next.js 15.1.0** - React framework
- **React 19.0.0** - UI library
- **TypeScript 5.7.2** - Type safety
- **Tailwind CSS 3.4.17** - Styling
- **Sharp 0.33.5** - Image optimization
- **Zod 3.24.1** - Data validation

### Security

✅ All packages are latest stable versions  
✅ No known security vulnerabilities  
✅ Regular dependency updates recommended  
✅ Input validation with Zod  
✅ Secure image handling

## 📖 Step-by-Step Guide for Business Owners

### Day 1: Setup (One-time, 10 minutes)

1. Open Terminal/Command Prompt
2. Navigate to project folder: `cd web_build`
3. Run: `npm install`
4. Run: `npm run dev`
5. Open browser: `http://localhost:3000`

### Daily Operations (2-5 minutes each)

**To add a new product:**
1. Open Terminal
2. Run: `npm run prompt:add-product`
3. Type naturally: "Add [product name] in [category] category, [description]"
4. Confirm and done!

**To remove a product:**
1. Run: `npm run prompt:remove-product`
2. Type the product name
3. Confirm deletion

**To update a product:**
1. Run: `npm run prompt:update-product`
2. Select the product
3. Choose what to update
4. Enter new information

**To publish changes:**
1. Run: `npm run prompt:deploy`
2. Follow deployment prompts

## 🎨 Customization

### Change Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  primary: '#2d5016',    // Main green color
  secondary: '#8fbc5a',  // Light green
  accent: '#f4a460',     // Orange accent
}
```

### Change Company Name

Edit `.env.local`:

```
NEXT_PUBLIC_SITE_NAME="Your Company Name"
```

### Add More Fields to Products

Edit `types/product.ts` and add your fields.

## 💳 Payment Integration

### Razorpay Payment Gateway (Fully Integrated!)

Your website includes complete Razorpay integration supporting:
- 💳 Credit/Debit Cards
- 🏦 UPI (GPay, PhonePe, BHIM)
- 🏦 Net Banking
- 💰 Wallets
- 📱 International Cards

#### Quick Test (No Account Needed)
```bash
npm run dev
# Visit http://localhost:3000
# Add products → Checkout → Select Razorpay → Use test card below
```

**Test Card:**
```
Card: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
```

#### Going Live
1. Sign up at https://razorpay.com/
2. Complete KYC verification
3. Get your API keys from Dashboard
4. Update `.env.local`:
   ```env
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY
   RAZORPAY_KEY_SECRET=YOUR_SECRET
   ```
5. Restart server

📖 **See `RAZORPAY_INTEGRATION_GUIDE.md` for complete setup instructions**

📖 **See `RAZORPAY_QUICK_TEST.md` for instant testing guide**

## 🌍 Multi-Currency Support

Your website automatically supports:
- 🇺🇸 USD - US Dollar
- 🇪🇺 EUR - Euro
- 🇮🇳 INR - Indian Rupee
- 🇨🇦 CAD - Canadian Dollar

**Features:**
- Live daily exchange rates from Frankfurter API
- Auto-currency detection based on timezone
- Manual currency selector in header
- All prices automatically converted

📖 **See `LIVE_EXCHANGE_RATES_GUIDE.md` for details**

## 📧 Email Notifications

Integrated email system for:
- Order confirmations
- Contact form submissions
- Customer enquiries

**Setup Gmail SMTP:**
1. Generate App Password from Google Account
2. Update `.env.local`:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

📖 **See `GMAIL_SETUP_GUIDE.md` and `EMAIL_NOTIFICATIONS_GUIDE.md`**

## 🆘 Troubleshooting

### "Cannot find module" error
```bash
npm install
```

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### Images not showing
- Check image URL is accessible
- Ensure images are in `public/images/products/`
- Check file permissions

### Build errors
```bash
rm -rf .next
npm run build
```

## 📞 Support

For issues or questions:
1. Check this README first
2. Review error messages carefully
3. Ensure all commands are run from the project folder
4. Make sure Node.js 18+ is installed

## 🔄 Regular Maintenance

### Weekly
- Add/update products as needed
- Check website is loading correctly

### Monthly
- Update dependencies: `npm update`
- Review and backup product data in `data/products.json`

### Quarterly
- Check for Next.js updates
- Review website performance
- Update content and images

## 📄 License

Private - All rights reserved

## 🎉 Getting Help

The scripts are designed to be self-explanatory with helpful prompts. Just follow the instructions shown in your terminal!

---

**Made with ❤️ for agro exporters worldwide**
