#!/usr/bin/env node

/**
 * ADD PRODUCT PROMPT SCRIPT
 * 
 * This script allows non-technical users to add products using natural language.
 * 
 * Usage: npm run prompt:add-product
 * 
 * Example prompts:
 * - "Add Basmati Rice, premium quality long-grain rice from India, category Rice, image https://example.com/rice.jpg"
 * - "Add organic green tea from Darjeeling in the Tea category with description: Premium loose leaf tea"
 * - "Add fresh roses in Flowers category, available in multiple colors"
 */

const readline = require('readline');
const https = require('https');
const http = require('http');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function parsePrompt(prompt) {
  log('\n🤖 Processing your request with AI...', 'blue');
  
  // Read categories from file
  const categoriesFile = path.join(process.cwd(), 'data', 'categories.json');
  let categories = ['Rice', 'Pulses', 'Tea', 'Fish Products', 'Flowers'];
  try {
    const data = await fs.readFile(categoriesFile, 'utf-8');
    categories = JSON.parse(data);
  } catch (error) {
    // Use default categories
  }
  
  // Simple parsing (you can enhance with OpenAI API)
  const parts = {
    name: '',
    description: '',
    category: '',
    price: '',
    imageUrl: '',
    specifications: {}
  };

  // Extract price
  const priceMatch = prompt.match(/price[:\s]+([^\s,]+)/i);
  if (priceMatch) {
    parts.price = priceMatch[1];
    prompt = prompt.replace(priceMatch[0], '');
  }

  // Extract image URL
  const urlMatch = prompt.match(/https?:\/\/[^\s]+/);
  if (urlMatch) {
    parts.imageUrl = urlMatch[0];
    prompt = prompt.replace(urlMatch[0], '');
  }

  // Extract category
  for (const cat of categories) {
    if (prompt.toLowerCase().includes(cat.toLowerCase())) {
      parts.category = cat;
      break;
    }
  }

  // Extract name (first significant phrase before comma or "in")
  const nameMatch = prompt.match(/add\s+([^,]+?)(?:,|\s+in\s+|\s+with\s+|\s+price\s+|$)/i);
  if (nameMatch) {
    parts.name = nameMatch[1].trim();
  }

  // Extract description
  const descMatch = prompt.match(/(?:description|desc):\s*([^,]+)/i);
  if (descMatch) {
    parts.description = descMatch[1].trim();
  } else {
    // Use remaining text as description
    const cleanPrompt = prompt.replace(/add\s+/i, '').replace(parts.name, '').replace(parts.category, '').replace(/price[:\s]+[^\s,]+/i, '');
    parts.description = cleanPrompt.replace(/,/g, '').trim() || parts.name;
  }

  return parts;
}

async function copyLocalImage(localPath, productId) {
  try {
    // Check if file exists
    if (!fsSync.existsSync(localPath)) {
      throw new Error('File not found');
    }

    const ext = path.extname(localPath);
    const filename = `${productId}${ext}`;
    
    const imagesDir = path.join(process.cwd(), 'public', 'images', 'products');
    await fs.mkdir(imagesDir, { recursive: true });
    
    const destPath = path.join(imagesDir, filename);
    await fs.copyFile(localPath, destPath);
    
    return `/images/products/${filename}`;
  } catch (error) {
    throw new Error(`Failed to copy local image: ${error.message}`);
  }
}

async function downloadImage(url, productId) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks);
          const ext = path.extname(new URL(url).pathname) || '.jpg';
          const filename = `${productId}${ext}`;
          
          const imagesDir = path.join(process.cwd(), 'public', 'images', 'products');
          await fs.mkdir(imagesDir, { recursive: true });
          
          const filepath = path.join(imagesDir, filename);
          await fs.writeFile(filepath, buffer);
          
          resolve(`/images/products/${filename}`);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

async function addProduct(productData) {
  const dataDir = path.join(process.cwd(), 'data');
  const productsFile = path.join(dataDir, 'products.json');

  // Ensure data directory exists
  await fs.mkdir(dataDir, { recursive: true });

  // Read existing products
  let products = [];
  try {
    const data = await fs.readFile(productsFile, 'utf-8');
    products = JSON.parse(data);
  } catch (error) {
    // File doesn't exist yet
  }

  // Create new product
  const now = new Date().toISOString();
  const productId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const newProduct = {
    id: productId,
    name: productData.name,
    description: productData.description,
    category: productData.category,
    price: productData.price || '',
    ...(productData.priceAmount != null && productData.priceCurrency
      ? { priceAmount: productData.priceAmount, priceCurrency: productData.priceCurrency }
      : {}),
    specifications: productData.specifications || {},
    createdAt: now,
    updatedAt: now,
  };

  // Handle image if provided
  if (productData.imageUrl) {
    try {
      if (productData.imageType === 'local') {
        log('📥 Copying local image...', 'blue');
        newProduct.image = await copyLocalImage(productData.imageUrl, productId);
        log('✓ Image saved successfully', 'green');
      } else {
        log('📥 Downloading image from URL...', 'blue');
        newProduct.image = await downloadImage(productData.imageUrl, productId);
        log('✓ Image downloaded successfully', 'green');
      }
    } catch (error) {
      log(`⚠ Warning: Could not process image: ${error.message}`, 'yellow');
      log('  The product will be created without an image (emoji icon will show)', 'yellow');
    }
  }

  products.push(newProduct);
  await fs.writeFile(productsFile, JSON.stringify(products, null, 2));

  return newProduct;
}

async function main() {
  log('\n╔══════════════════════════════════════════════════════════╗', 'blue');
  log('║       ADD PRODUCT - Natural Language Interface          ║', 'blue');
  log('╚══════════════════════════════════════════════════════════╝\n', 'blue');

  log('📝 Examples:', 'yellow');
  log('  • "Add Basmati Rice, premium quality long-grain rice from India"');
  log('  • "Add organic green tea in Tea category, best quality from Darjeeling"');
  log('  • "Add fresh roses in Flowers category with image https://example.com/rose.jpg"\n');

  const prompt = await question('Enter your request: ');

  if (!prompt.trim()) {
    log('❌ No input provided', 'red');
    rl.close();
    return;
  }

  try {
    const productData = await parsePrompt(prompt);

    // Validate required fields
    if (!productData.name || !productData.category) {
      log('\n❌ Could not parse your request properly', 'red');
      log('Please make sure to include:', 'yellow');
      log('  - Product name', 'yellow');
      log('  - Category (Rice, Pulses, Tea, Fish Products, or Flowers)', 'yellow');
      rl.close();
      return;
    }

    log('\n📋 Parsed product details:', 'blue');
    log(`  Name: ${productData.name}`);
    log(`  Category: ${productData.category}`);
    log(`  Description: ${productData.description}`);
    if (productData.imageUrl) {
      log(`  Image URL: ${productData.imageUrl}`);
    }

    // --- Price & Currency ---
    log('\n💰 PRICE', 'blue');
    log('  Currencies: 1=INR (₹)  2=USD ($)  3=EUR (€)  4=CAD (C$)  5=Skip', 'yellow');
    const currencyChoice = await question('Select currency (1-5): ');
    const currencyMap = { '1': 'INR', '2': 'USD', '3': 'EUR', '4': 'CAD' };
    const symbolMap   = { INR: '₹', USD: '$', EUR: '€', CAD: 'C$' };

    if (currencyChoice in currencyMap) {
      const chosenCurrency = currencyMap[currencyChoice];
      const amountStr = await question(`  Enter amount in ${chosenCurrency} (number only, e.g. 50): `);
      const amount = parseFloat(amountStr.trim());
      if (!isNaN(amount) && amount > 0) {
        const unitStr = await question('  Enter unit (e.g. /kg, /dozen, /box) or press Enter for /kg: ');
        const unit = unitStr.trim() || '/kg';
        productData.priceAmount = amount;
        productData.priceCurrency = chosenCurrency;
        productData.price = `${symbolMap[chosenCurrency]}${amount}${unit}`;
        log(`  ✓ Price set to ${productData.price}`, 'green');
      } else {
        log('  ⊗ Invalid amount, skipping price', 'yellow');
      }
    } else {
      log('  ⊗ Skipping price', 'yellow');
    }

    // --- Product Details / Specifications ---
    log('\n📊 PRODUCT DETAILS (optional)', 'blue');
    log('  Add any custom details like Origin, Grade, Weight, Packaging, etc.', 'yellow');
    const addDetails = await question('  Add details? (yes/no): ');
    if (addDetails.toLowerCase() === 'yes' || addDetails.toLowerCase() === 'y') {
      if (!productData.specifications) productData.specifications = {};
      log('  Enter field name + value. Press Enter with empty name to finish.', 'yellow');
      while (true) {
        const fieldName = await question('  Field name (or Enter to finish): ');
        if (!fieldName.trim()) break;
        const fieldValue = await question(`  Value for "${fieldName.trim()}": `);
        if (fieldValue.trim()) {
          productData.specifications[fieldName.trim()] = fieldValue.trim();
          log(`  ✓ Added: ${fieldName.trim()} = ${fieldValue.trim()}`, 'green');
        }
      }
    }

    // Ask for image URL if not provided in prompt
    if (!productData.imageUrl) {
      let imageValid = false;
      
      while (!imageValid) {
        log('\n📸 Product Image (optional):', 'blue');
        log('  1. Use image URL from web (imgur, imgbb, etc.)', 'yellow');
        log('  2. Use photo from my computer', 'yellow');
        log('  3. Skip (will show emoji icon)\n', 'yellow');
        
        const choice = await question('Choose option (1/2/3): ');
        
        if (choice === '1') {
          const imageUrl = await question('Enter image URL: ');
          if (imageUrl.trim() && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
            productData.imageUrl = imageUrl.trim();
            productData.imageType = 'url';
            log(`  ✓ Using image URL: ${imageUrl.trim()}`, 'green');
            imageValid = true;
          } else {
            log('  ✗ Invalid URL. Must start with http:// or https://', 'red');
            const retry = await question('  Try again? (yes/no): ');
            if (retry.toLowerCase() !== 'yes' && retry.toLowerCase() !== 'y') {
              imageValid = true;
            }
          }
        } else if (choice === '2') {
          log('\n  Drag and drop your image file here, or paste the full path:', 'yellow');
          const filePath = await question('  File path: ');
          
          if (filePath.trim()) {
            // Clean the path
            let cleanPath = filePath.trim().replace(/^['"]|['"]$/g, '');
            
            // Expand ~ to home directory if present
            if (cleanPath.startsWith('~')) {
              cleanPath = path.join(process.env.HOME, cleanPath.slice(1));
            }
            
            // Resolve to absolute path
            const absolutePath = path.resolve(cleanPath);
            
            // Check if file exists
            if (fsSync.existsSync(absolutePath)) {
              productData.imageUrl = absolutePath;
              productData.imageType = 'local';
              log(`  ✓ Using local image: ${absolutePath}`, 'green');
              imageValid = true;
            } else {
              log(`  ✗ File not found: ${absolutePath}`, 'red');
              const retry = await question('  Try again? (yes/no): ');
              if (retry.toLowerCase() !== 'yes' && retry.toLowerCase() !== 'y') {
                imageValid = true;
              }
            }
          } else {
            imageValid = true;
          }
        } else if (choice === '3' || !choice.trim()) {
          // User skipped - no image
          log('  ⊗ Skipping image (emoji icon will display)', 'yellow');
          imageValid = true;
        } else {
          log('  ✗ Invalid choice. Please enter 1, 2, or 3', 'red');
        }
      }
    }

    const confirm = await question('\nDoes this look correct? (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      log('\n⚠️  Let\'s try again...', 'yellow');
      
      // Allow user to re-enter image
      const changeImage = await question('Change image? (yes/no): ');
      if (changeImage.toLowerCase() === 'yes' || changeImage.toLowerCase() === 'y') {
        productData.imageUrl = null;
        productData.imageType = null;
        
        let imageValid = false;
        while (!imageValid) {
          log('\n📸 Product Image:', 'blue');
          log('  1. Use image URL from web', 'yellow');
          log('  2. Use photo from my computer', 'yellow');
          log('  3. Skip\n', 'yellow');
          
          const choice = await question('Choose option (1/2/3): ');
          
          if (choice === '1') {
            const imageUrl = await question('Enter image URL: ');
            if (imageUrl.trim() && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
              productData.imageUrl = imageUrl.trim();
              productData.imageType = 'url';
              log(`  ✓ Using image URL: ${imageUrl.trim()}`, 'green');
              imageValid = true;
            } else {
              log('  ✗ Invalid URL', 'red');
              const retry = await question('  Try again? (yes/no): ');
              if (retry.toLowerCase() !== 'yes' && retry.toLowerCase() !== 'y') {
                imageValid = true;
              }
            }
          } else if (choice === '2') {
            log('\n  Drag and drop your image file here, or paste the full path:', 'yellow');
            const filePath = await question('  File path: ');
            
            if (filePath.trim()) {
              let cleanPath = filePath.trim().replace(/^['"]|['"]$/g, '');
              if (cleanPath.startsWith('~')) {
                cleanPath = path.join(process.env.HOME, cleanPath.slice(1));
              }
              const absolutePath = path.resolve(cleanPath);
              
              if (fsSync.existsSync(absolutePath)) {
                productData.imageUrl = absolutePath;
                productData.imageType = 'local';
                log(`  ✓ Using local image: ${absolutePath}`, 'green');
                imageValid = true;
              } else {
                log(`  ✗ File not found: ${absolutePath}`, 'red');
                const retry = await question('  Try again? (yes/no): ');
                if (retry.toLowerCase() !== 'yes' && retry.toLowerCase() !== 'y') {
                  imageValid = true;
                }
              }
            } else {
              imageValid = true;
            }
          } else if (choice === '3' || !choice.trim()) {
            log('  ⊗ Skipping image', 'yellow');
            imageValid = true;
          } else {
            log('  ✗ Invalid choice', 'red');
          }
        }
        
        const finalConfirm = await question('\nSave product now? (yes/no): ');
        if (finalConfirm.toLowerCase() !== 'yes' && finalConfirm.toLowerCase() !== 'y') {
          log('❌ Operation cancelled', 'yellow');
          rl.close();
          return;
        }
      } else {
        log('❌ Operation cancelled', 'yellow');
        rl.close();
        return;
      }
    }

    log('\n💾 Saving product...', 'blue');
    const product = await addProduct(productData);

    log('\n✅ Product added successfully!', 'green');
    log(`   ID: ${product.id}`, 'green');
    log(`   Name: ${product.name}`, 'green');
    log(`   Category: ${product.category}`, 'green');
    
    log('\n🚀 To see your product, run: npm run dev', 'blue');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
  }

  rl.close();
}

main();
