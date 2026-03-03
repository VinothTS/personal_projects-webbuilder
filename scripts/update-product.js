#!/usr/bin/env node

/**
 * UPDATE PRODUCT PROMPT SCRIPT
 * 
 * This script allows non-technical users to update products using natural language.
 * 
 * Usage: npm run prompt:update-product
 * 
 * Example prompts:
 * - "Update Basmati Rice description to: Premium aged basmati rice"
 * - "Change the category of green tea to Tea"
 * - "Add image https://example.com/new-image.jpg to product Basmati Rice"
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

async function getProducts() {
  const productsFile = path.join(process.cwd(), 'data', 'products.json');
  try {
    const data = await fs.readFile(productsFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveProducts(products) {
  const dataDir = path.join(process.cwd(), 'data');
  const productsFile = path.join(dataDir, 'products.json');
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(productsFile, JSON.stringify(products, null, 2));
}

function findProduct(products, query) {
  const lowerQuery = query.toLowerCase();
  
  // Check if it's a number (list index)
  const listIndex = parseInt(query);
  if (!isNaN(listIndex) && listIndex > 0 && listIndex <= products.length) {
    return products[listIndex - 1];
  }
  
  let product = products.find(p => p.id === query);
  if (product) return product;

  product = products.find(p => p.name.toLowerCase() === lowerQuery);
  if (product) return product;

  product = products.find(p => p.name.toLowerCase().includes(lowerQuery));
  if (product) return product;

  return null;
}

async function copyLocalImage(localPath, productId) {
  try {
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

async function main() {
  log('\n╔══════════════════════════════════════════════════════════╗', 'blue');
  log('║      UPDATE PRODUCT - Natural Language Interface        ║', 'blue');
  log('╚══════════════════════════════════════════════════════════╝\n', 'blue');

  const products = await getProducts();

  if (products.length === 0) {
    log('❌ No products found in the database', 'red');
    rl.close();
    return;
  }

  log(`📦 Current products (${products.length} total):\n`, 'blue');
  products.forEach((p, i) => {
    log(`${i + 1}. ${p.name} (${p.category}) - ID: ${p.id}`);
  });

  const productQuery = await question('\nWhich product to update? (enter number, name, or ID): ');

  if (!productQuery.trim()) {
    log('❌ No input provided', 'red');
    rl.close();
    return;
  }

  const product = findProduct(products, productQuery.trim());

  if (!product) {
    log('\n❌ Product not found', 'red');
    rl.close();
    return;
  }

  log('\n📋 Current product details:', 'blue');
  log(`  Name: ${product.name}`);
  log(`  Category: ${product.category}`);
  log(`  Description: ${product.description}`);
  if (product.price) log(`  Price: ${product.price}`);
  log(`  Image: ${product.image || 'None'}`);
  if (product.specifications && Object.keys(product.specifications).length > 0) {
    log(`  Specifications:`);
    Object.entries(product.specifications).forEach(([key, value]) => {
      log(`    - ${key}: ${value}`);
    });
  } else {
    log(`  Specifications: None`, 'yellow');
  }

  log('\n\n📝 What would you like to update?', 'yellow');
  log('  1. Name');
  log('  2. Description');
  log('  3. Category');
  log('  4. Price');
  log('  5. Add/Update Image');
  log('  6. Add/Update Specifications');
  log('  7. Update All Fields (guided)');
  log('  8. Cancel');

  const choice = await question('\nEnter your choice (1-8): ');
  
  const updates = { updatedAt: new Date().toISOString() };

  try {
    switch (choice.trim()) {
      case '1': {
        const newName = await question('Enter new name: ');
        if (newName.trim()) updates.name = newName.trim();
        break;
      }
      case '2': {
        const newDesc = await question('Enter new description: ');
        if (newDesc.trim()) updates.description = newDesc.trim();
        break;
      }
      case '3': {
        // Read categories from file
        const categoriesFile = path.join(process.cwd(), 'data', 'categories.json');
        let categories = ['Rice', 'Pulses', 'Tea', 'Fish Products', 'Flowers'];
        try {
          const data = await fs.readFile(categoriesFile, 'utf-8');
          categories = JSON.parse(data);
        } catch (error) {
          // Use default categories
        }
        
        log('\\nCategories: ' + categories.join(', '));
        const newCat = await question('Enter new category: ');
        const matchedCat = categories.find(c => c.toLowerCase() === newCat.trim().toLowerCase());
        if (matchedCat) updates.category = matchedCat;
        else log('⚠ Invalid category, skipping', 'yellow');
        break;
      }
      case '4': {
        log('\n  Currencies: 1=INR (₹)  2=USD ($)  3=EUR (€)  4=CAD (C$)', 'yellow');
        const currencyChoice = await question('  Select currency (1-4): ');
        const currencyMap = { '1': 'INR', '2': 'USD', '3': 'EUR', '4': 'CAD' };
        const symbolMap   = { INR: '₹', USD: '$', EUR: '€', CAD: 'C$' };
        if (currencyChoice in currencyMap) {
          const chosenCurrency = currencyMap[currencyChoice];
          const amountStr = await question(`  Enter amount in ${chosenCurrency} (number only, e.g. 50): `);
          const amount = parseFloat(amountStr.trim());
          if (!isNaN(amount) && amount > 0) {
            const unitStr = await question('  Enter unit (e.g. /kg, /dozen, /box) or press Enter for /kg: ');
            const unit = unitStr.trim() || '/kg';
            updates.priceAmount = amount;
            updates.priceCurrency = chosenCurrency;
            updates.price = `${symbolMap[chosenCurrency]}${amount}${unit}`;
            log(`  ✓ Price set to ${updates.price}`, 'green');
          } else {
            log('  ⚠ Invalid amount, skipping', 'yellow');
          }
        } else {
          log('  ⚠ Invalid choice, skipping', 'yellow');
        }
        break;
      }
      case '5': {
        log('\n📸 Update Product Image:', 'blue');
        log('  1. Use image URL from web', 'yellow');
        log('  2. Use photo from my computer', 'yellow');
        log('  3. Remove image (show emoji)', 'yellow');
        
        const imgChoice = await question('\nChoose option (1/2/3): ');
        
        if (imgChoice === '1') {
          const imageUrl = await question('Enter image URL: ');
          if (imageUrl.trim() && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
            log('📥 Downloading image...', 'blue');
            updates.image = await downloadImage(imageUrl.trim(), product.id);
            log('✓ Image downloaded successfully', 'green');
          } else {
            log('⚠ Invalid URL, skipping', 'yellow');
          }
        } else if (imgChoice === '2') {
          log('\n  Drag and drop your image file here, or paste the full path:', 'yellow');
          const filePath = await question('  File path: ');
          
          if (filePath.trim()) {
            let cleanPath = filePath.trim().replace(/^['"]|['"]$/g, '');
            if (cleanPath.startsWith('~')) {
              cleanPath = path.join(process.env.HOME, cleanPath.slice(1));
            }
            const absolutePath = path.resolve(cleanPath);
            
            if (fsSync.existsSync(absolutePath)) {
              log('📥 Copying local image...', 'blue');
              updates.image = await copyLocalImage(absolutePath, product.id);
              log('✓ Image copied successfully', 'green');
            } else {
              log('⚠ File not found, skipping', 'yellow');
            }
          }
        } else if (imgChoice === '3') {
          delete updates.image;
          product.image = undefined;
          log('✓ Image will be removed', 'green');
        }
        break;
      }
      case '6': {
        log('\n📊 Update Specifications:', 'blue');
        
        if (product.specifications && Object.keys(product.specifications).length > 0) {
          log('Current specifications:', 'yellow');
          Object.entries(product.specifications).forEach(([key, value]) => {
            log(`  ${key}: ${value}`);
          });
        }
        
        log('\nOptions:', 'yellow');
        log('  1. Add new specification');
        log('  2. Update existing specification');
        log('  3. Remove specification');
        
        const specChoice = await question('\nChoose option (1/2/3): ');
        
        if (!product.specifications) {
          product.specifications = {};
        }
        
        if (specChoice === '1') {
          const key = await question('Enter specification name (e.g., Origin, Weight): ');
          if (key.trim()) {
            const value = await question(`Enter value for ${key}: `);
            if (value.trim()) {
              product.specifications[key.trim()] = value.trim();
              updates.specifications = product.specifications;
              log(`✓ Added: ${key.trim()} = ${value.trim()}`, 'green');
            }
          }
        } else if (specChoice === '2') {
          const key = await question('Enter specification name to update: ');
          if (key.trim() && product.specifications[key.trim()]) {
            log(`Current value: ${product.specifications[key.trim()]}`);
            const value = await question('Enter new value: ');
            if (value.trim()) {
              product.specifications[key.trim()] = value.trim();
              updates.specifications = product.specifications;
              log(`✓ Updated: ${key.trim()} = ${value.trim()}`, 'green');
            }
          } else {
            log('⚠ Specification not found', 'yellow');
          }
        } else if (specChoice === '3') {
          const key = await question('Enter specification name to remove: ');
          if (key.trim() && product.specifications[key.trim()]) {
            delete product.specifications[key.trim()];
            updates.specifications = product.specifications;
            log(`✓ Removed: ${key.trim()}`, 'green');
          } else {
            log('⚠ Specification not found', 'yellow');
          }
        }
        break;
      }
      case '7': {
        log('\n📝 Update All Fields - Guided Mode', 'blue');
        log('Press Enter to skip any field you don\'t want to change\n', 'yellow');
        
        // Update price if missing
        if (!product.price || product.price === '') {
          const newPrice = await question('Enter price (e.g., Rs 150/kg): ');
          if (newPrice.trim()) updates.price = newPrice.trim();
        }
        
        // Add specifications if empty
        if (!product.specifications || Object.keys(product.specifications).length === 0) {
          log('\n📊 Add Specifications (recommended):', 'blue');
          
          if (!product.specifications) {
            product.specifications = {};
          }
          
          const addSpecs = await question('Add specifications? (yes/no): ');
          if (addSpecs.toLowerCase() === 'yes' || addSpecs.toLowerCase() === 'y') {
            let addingSpecs = true;
            
            while (addingSpecs) {
              const key = await question('\nEnter specification name (or press Enter to finish): ');
              if (!key.trim()) {
                addingSpecs = false;
                break;
              }
              
              const value = await question(`Enter value for ${key.trim()}: `);
              if (value.trim()) {
                product.specifications[key.trim()] = value.trim();
                log(`  ✓ Added: ${key.trim()} = ${value.trim()}`, 'green');
              }
            }
            
            if (Object.keys(product.specifications).length > 0) {
              updates.specifications = product.specifications;
            }
          }
        }
        
        break;
      }
      case '8': {
        log('❌ Operation cancelled', 'yellow');
        rl.close();
        return;
      }
      default: {
        log('❌ Invalid choice', 'red');
        rl.close();
        return;
      }
    }

    if (Object.keys(updates).length === 1) { // Only updatedAt
      log('❌ No changes made', 'yellow');
      rl.close();
      return;
    }

    // Update product
    const index = products.findIndex(p => p.id === product.id);
    products[index] = { ...products[index], ...updates };

    log('\n💾 Saving changes...', 'blue');
    await saveProducts(products);

    log('\n✅ Product updated successfully!', 'green');
    log('\n📋 Updated product:', 'blue');
    log(`  Name: ${products[index].name}`);
    log(`  Category: ${products[index].category}`);
    log(`  Description: ${products[index].description}`);

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
  }

  rl.close();
}

main();
