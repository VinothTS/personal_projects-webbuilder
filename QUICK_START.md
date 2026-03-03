# Quick Start Guide for Business Owners

## 🎯 What You Need

1. A computer (Mac, Windows, or Linux)
2. Internet connection
3. 10 minutes for initial setup

## 📱 Step-by-Step Setup

### Step 1: Install Node.js (One-time)

1. Go to https://nodejs.org
2. Download the LTS version (left button)
3. Install it (just click Next, Next, Finish)
4. Restart your computer

### Step 2: Open Terminal

**On Mac:**
- Press `Command + Space`
- Type "Terminal"
- Press Enter

**On Windows:**
- Press `Windows + R`
- Type "cmd"
- Press Enter

### Step 3: Navigate to Project

```bash
cd Desktop/personal_projects/web_build
```

### Step 4: Install Everything

```bash
npm install
```

Wait 2-3 minutes while it installs.

### Step 5: Start Your Website

```bash
npm run dev
```

Open your browser and go to: `http://localhost:3000`

🎉 **Your website is now running!**

## 📝 Daily Tasks (Simple Commands)

### Add a Product

1. Open Terminal
2. Type: `npm run prompt:add-product`
3. When asked, describe your product naturally:
   - "Add Premium Basmati Rice, best quality from India"
   - "Add Fresh Roses in Flowers category"
   - "Add Green Tea with image https://example.com/tea.jpg"
4. Confirm when asked
5. Done! Refresh website to see it.

### Remove a Product

1. Type: `npm run prompt:remove-product`
2. See list of products
3. Type the name of product to remove
4. Confirm
5. Done!

### Update a Product

1. Type: `npm run prompt:update-product`
2. Choose product from list
3. Select what to change (name, description, image, category)
4. Enter new information
5. Done!

## 🚀 Making Your Website Live

### When Ready to Go Live:

1. Type: `npm run prompt:deploy`
2. Follow the simple prompts
3. Choose Vercel (it's free and easiest)

### For Vercel:

1. Go to https://vercel.com
2. Sign up with your email
3. Come back to Terminal
4. Type: `npx vercel`
5. Answer questions (just press Enter for defaults)
6. Get your live website URL!

## 💡 Common Scenarios

### Scenario 1: Adding Rice Products

```bash
npm run prompt:add-product
```
Type: "Add Premium Basmati Rice, long-grain aged rice from Punjab, best for biryani"

### Scenario 2: Adding with Image

```bash
npm run prompt:add-product
```
Type: "Add Organic Green Tea in Tea category with image https://yoursite.com/tea.jpg"

### Scenario 3: Updating Price Info

```bash
npm run prompt:update-product
```
Choose: Product name
Select: Description
Type: New description with pricing

### Scenario 4: Removing Old Products

```bash
npm run prompt:remove-product
```
Type: Product name or choose from list

## 🔧 Troubleshooting

### Problem: "npm: command not found"
**Solution:** Install Node.js (see Step 1)

### Problem: "Port 3000 is already in use"
**Solution:** Close any other programs using it, or run:
```bash
npm run dev -- -p 3001
```
Then use: `http://localhost:3001`

### Problem: Changes not showing
**Solution:** Refresh your browser (press F5 or Cmd+R)

### Problem: Image not showing
**Solution:** Make sure the image URL is correct and accessible

## 📋 Daily Workflow Example

**Morning routine (5 minutes):**
1. Open Terminal
2. `cd Desktop/personal_projects/web_build`
3. `npm run dev`
4. Open `http://localhost:3000`

**Add new products:**
1. `npm run prompt:add-product`
2. Describe product
3. Confirm

**Check website:**
1. Refresh browser
2. See new products

**When done:**
1. Press `Ctrl+C` in Terminal (stops website)
2. Close Terminal

## 🎓 Tips for Success

✅ **Keep it simple** - Use natural language in prompts  
✅ **Be specific** - Include category and good descriptions  
✅ **Use good images** - Clear, high-quality product photos  
✅ **Regular updates** - Add products weekly for fresh content  
✅ **Backup** - Copy `data/products.json` monthly  

## 📞 Remember

- You DON'T need to know coding
- You DON'T need to edit any files manually
- You JUST use the simple commands
- The system handles everything else!

## 🎉 You're Ready!

Start with one product to practice, then add more. It's that simple!

---

**Questions?** Re-read this guide. Everything you need is here! 😊
