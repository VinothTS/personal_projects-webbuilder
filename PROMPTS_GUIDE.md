# 🎯 PROMPTS FOR BUSINESS OWNERS - Complete Guide

This document contains ALL the prompts and commands you'll ever need to manage your agro export website. Keep this handy!

---

## 🚀 INITIAL SETUP (One-Time Only)

### Install Node.js
1. Visit: https://nodejs.org
2. Download LTS version
3. Install it
4. Restart computer

### Setup Project
Open Terminal and run these commands ONE BY ONE:

```bash
cd Desktop/personal_projects/web_build
```

```bash
npm install
```

```bash
npm run demo
```

```bash
npm run dev
```

Open browser: **http://localhost:3000**

✅ **Setup Complete!** Your website is now running with sample products.

---

## 📝 DAILY OPERATIONS - SIMPLE PROMPTS

### 🟢 Start Website (Every Day)

```bash
cd Desktop/personal_projects/web_build
npm run dev
```

Open: **http://localhost:3000**

---

### ➕ ADD NEW PRODUCT

**Command:**
```bash
npm run prompt:add-product
```

**Example Prompts You Can Type:**

1. **Simple Add:**
   ```
   Add Premium White Rice, high-quality rice from Thailand
   ```

2. **Add with Category:**
   ```
   Add Darjeeling Tea in Tea category, premium quality loose leaf tea
   ```

3. **Add with Image URL:**
   ```
   Add Fresh Tulips in Flowers category with image https://example.com/tulips.jpg
   ```

4. **Detailed Add:**
   ```
   Add Tuna Fish in Fish Products category, canned premium quality tuna rich in protein
   ```

**Real Examples for Agro Products:**

**Rice:**
```
Add Brown Rice, organic whole grain rice perfect for health-conscious consumers
```

**Pulses:**
```
Add Black Lentils in Pulses category, protein-rich lentils ideal for dal makhani
```

**Tea:**
```
Add Oolong Tea in Tea category, semi-fermented tea with unique flavor profile
```

**Fish Products:**
```
Add Salmon Fillets in Fish Products category, fresh frozen Atlantic salmon rich in omega-3
```

**Flowers:**
```
Add Orchids in Flowers category, exotic flowers available in purple and white
```

---

### ✏️ UPDATE EXISTING PRODUCT

**Command:**
```bash
npm run prompt:update-product
```

**Steps:**
1. Run the command
2. See list of products
3. Type product name or ID
4. Choose what to update:
   - 1 = Change name
   - 2 = Change description
   - 3 = Change category
   - 4 = Add/update image
5. Enter new information
6. Confirm

**Example Flow:**
```
Which product to update? Premium Basmati Rice
What to update? 2 (description)
New description: Premium aged basmati rice, 2-year aged, aromatic long grain from Punjab India, perfect for biryani and pilaf
```

---

### ❌ REMOVE PRODUCT

**Command:**
```bash
npm run prompt:remove-product
```

**Steps:**
1. Run the command
2. See list of all products
3. Type the product name (or ID)
4. Confirm deletion

**Example:**
```
Which product to remove? Old Rice Product
Confirm? yes
```

---

### 🚀 DEPLOY WEBSITE (Make It Live)

**Command:**
```bash
npm run prompt:deploy
```

This builds your website for production.

**Then deploy with Vercel (FREE):**
```bash
npx vercel
```

Follow the prompts - it's automatic!

---

## 📋 PROMPT TEMPLATES BY CATEGORY

### 🌾 RICE PRODUCTS

```
Add [Type] Rice, [description including origin, quality, grain type]
```

**Examples:**
- `Add Ponni Rice, premium short-grain rice from Tamil Nadu, ideal for South Indian cuisine`
- `Add Red Rice in Rice category, organic whole grain red rice with nutty flavor`
- `Add Sona Masoori Rice, lightweight and aromatic rice perfect for daily meals`

### 🫘 PULSES PRODUCTS

```
Add [Type] [Pulse Name] in Pulses category, [description including uses, protein content]
```

**Examples:**
- `Add Moong Dal in Pulses category, split yellow lentils high in protein perfect for Indian dishes`
- `Add Kidney Beans in Pulses category, Rajma beans ideal for curries and salads`
- `Add Split Peas in Pulses category, green split peas perfect for soups and stews`

### 🍵 TEA PRODUCTS

```
Add [Type] Tea in Tea category, [description including origin, flavor notes, benefits]
```

**Examples:**
- `Add Chamomile Tea in Tea category, herbal tea with calming properties and floral notes`
- `Add Earl Grey Tea in Tea category, black tea with bergamot essence, classic British blend`
- `Add White Tea in Tea category, delicate and subtle flavor with high antioxidants`

### 🐟 FISH PRODUCTS

```
Add [Fish Type] in Fish Products category, [description including processing, nutritional benefits]
```

**Examples:**
- `Add Mackerel Fish in Fish Products category, fresh frozen mackerel rich in omega-3 fatty acids`
- `Add Fish Oil Capsules in Fish Products category, premium fish oil supplement for heart health`
- `Add Dried Prawns in Fish Products category, sun-dried prawns perfect for Asian cooking`

### 🌺 FLOWER PRODUCTS

```
Add [Flower Name] in Flowers category, [description including colors, use cases]
```

**Examples:**
- `Add Marigold Flowers in Flowers category, bright orange and yellow flowers perfect for decorations`
- `Add Jasmine Flowers in Flowers category, fragrant white flowers used in garlands and ceremonies`
- `Add Carnations in Flowers category, long-lasting flowers available in red, pink, white`

---

## 🎨 ADDING PRODUCT IMAGES

### Method 1: With Image URL
When adding or updating, include the image URL:

```
Add Premium Tea with image https://yourwebsite.com/images/tea.jpg
```

### Method 2: Manual Upload
1. Save image file as: `product-name.jpg`
2. Place in: `public/images/products/` folder
3. The website will automatically show it

**Image Tips:**
- Use JPG or PNG format
- Recommended size: 800x800 pixels
- Keep file size under 500KB
- Use clear, well-lit product photos

---

## 📞 QUICK TROUBLESHOOTING

### Problem: "npm: command not found"
**Solution:** Install Node.js from https://nodejs.org

### Problem: "Port 3000 already in use"
**Solution:** Run on different port:
```bash
npm run dev -- -p 3001
```
Then open: http://localhost:3001

### Problem: Changes not showing
**Solution:** 
1. Refresh browser (F5 or Cmd+R)
2. Clear browser cache
3. Restart dev server (Ctrl+C, then `npm run dev`)

### Problem: Product not added
**Solution:**
1. Check you included product name
2. Ensure category is one of: Rice, Pulses, Tea, Fish Products, Flowers
3. Re-run the command

### Problem: Image not showing
**Solution:**
1. Check image URL is accessible
2. Make sure URL starts with http:// or https://
3. Try downloading image manually first

---

## 🔄 COMMON WORKFLOWS

### Workflow 1: Adding Multiple Products (Morning Routine)

```bash
# Start website
cd Desktop/personal_projects/web_build
npm run dev
```

Then in a NEW terminal window:
```bash
cd Desktop/personal_projects/web_build
npm run prompt:add-product
# Add first product

npm run prompt:add-product
# Add second product

npm run prompt:add-product
# Add third product
```

Refresh browser to see all new products!

### Workflow 2: Weekly Product Update

```bash
# Review products
npm run dev
# (Check website)

# Update old products
npm run prompt:update-product
# (Update descriptions, add new images)

# Remove discontinued products
npm run prompt:remove-product
```

### Workflow 3: Prepare for Trade Show

```bash
# Add all new products
npm run prompt:add-product
# (Add each product with images)

# Build for deployment
npm run prompt:deploy

# Deploy to live site
npx vercel
```

---

## 💡 BEST PRACTICES

### ✅ DO:
- Use clear, descriptive product names
- Include origin and quality details
- Add high-quality images
- Update products regularly
- Keep descriptions concise but informative
- Mention key specifications (organic, grade, packaging)

### ❌ DON'T:
- Don't use special characters in product names
- Don't add products without categories
- Don't use very large image files
- Don't forget to specify category correctly
- Don't use same product name twice

---

## 📊 CATEGORIES REFERENCE

You MUST use one of these exact categories:

1. **Rice** - All types of rice (basmati, jasmine, brown, white, red, etc.)
2. **Pulses** - Lentils, beans, chickpeas, peas, dal, etc.
3. **Tea** - Green, black, herbal, oolong, white tea, etc.
4. **Fish Products** - Fresh fish, dried fish, fish oil, seafood, etc.
5. **Flowers** - Roses, orchids, jasmine, marigold, tulips, etc.

---

## 🎯 SAMPLE BUSINESS SCENARIOS

### Scenario 1: New Product Line Launch
**Goal:** Add 5 new organic tea varieties

```bash
npm run prompt:add-product
```
Type: `Add Organic Chamomile Tea in Tea category, caffeine-free herbal tea with calming properties`

Repeat for each tea variety.

### Scenario 2: Seasonal Flower Update
**Goal:** Add fresh spring flowers

```bash
npm run prompt:add-product
```
Type: `Add Spring Tulips in Flowers category, colorful tulips in red, yellow, pink available in bunches of 20`

### Scenario 3: Product Description Update
**Goal:** Add pricing info to existing products

```bash
npm run prompt:update-product
```
Choose product, update description with: "Available in 1kg, 5kg, 10kg packages. Competitive wholesale pricing for bulk orders."

### Scenario 4: Remove Discontinued Items
**Goal:** Remove out-of-stock products

```bash
npm run prompt:remove-product
```
Type product name, confirm removal.

---

## 📱 MOBILE-FRIENDLY TIPS

The website automatically works on mobile devices! Just ensure:
- Images are optimized
- Descriptions are concise
- Product names are short and clear

---

## 🔐 BACKUP YOUR DATA

**Weekly backup:**
```bash
cd Desktop/personal_projects/web_build
cp data/products.json data/products-backup-$(date +%Y%m%d).json
```

Or simply copy the file `data/products.json` to a safe location.

---

## 📅 MAINTENANCE SCHEDULE

### Daily (2-5 minutes):
- Add new products as needed
- Check website is loading

### Weekly (10 minutes):
- Review all products
- Update descriptions
- Add new images
- Remove discontinued items

### Monthly (30 minutes):
- Backup product data
- Review website performance
- Update npm packages: `npm update`
- Check for broken images

---

## 🎓 LEARNING PATH

**Day 1:** Setup and add 3 products  
**Day 2:** Practice updating and removing products  
**Day 3:** Add images to products  
**Week 2:** Add 10-20 products  
**Week 3:** Master all commands  
**Week 4:** Deploy to live website

---

## 📞 EMERGENCY CONTACTS

If something breaks:

1. **Stop everything:** Press `Ctrl+C` in terminal
2. **Backup data:** Copy `data/products.json` file
3. **Restart:** Run `npm run dev` again
4. **Restore:** Copy back products.json if needed

---

## 🎉 SUCCESS CHECKLIST

- ✅ Node.js installed
- ✅ Project dependencies installed (`npm install`)
- ✅ Website running (`npm run dev`)
- ✅ Sample products visible
- ✅ Can add products
- ✅ Can update products
- ✅ Can remove products
- ✅ Images showing correctly
- ✅ Website looks good on phone
- ✅ Ready to deploy!

---

**🌟 YOU'VE GOT THIS! 🌟**

Remember: You don't need technical knowledge. Just follow these prompts exactly as written, and the system handles everything else!

Keep this document open while working, and refer to it whenever you need to manage your products.

---

*Last updated: February 2026*
*For: Global Agro Exports Website*
