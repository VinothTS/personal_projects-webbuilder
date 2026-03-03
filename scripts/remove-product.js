#!/usr/bin/env node

/**
 * REMOVE PRODUCT PROMPT SCRIPT
 * 
 * This script allows non-technical users to remove products using natural language.
 * 
 * Usage: npm run prompt:remove-product
 * 
 * Example prompts:
 * - "Remove Basmati Rice"
 * - "Delete the green tea product"
 * - "Remove product with ID 1234567890-abc"
 */

const readline = require('readline');
const fs = require('fs').promises;
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

async function deleteProductImage(imagePath) {
  if (!imagePath) return;
  
  const filename = path.basename(imagePath);
  const filepath = path.join(process.cwd(), 'public', 'images', 'products', filename);

  try {
    await fs.unlink(filepath);
    log(`  ✓ Deleted image: ${filename}`, 'green');
  } catch (error) {
    // Ignore if file doesn't exist
  }
}

function findProduct(products, query) {
  const lowerQuery = query.toLowerCase();
  
  // Try to find by ID
  let product = products.find(p => p.id === query);
  if (product) return product;

  // Try to find by exact name match
  product = products.find(p => p.name.toLowerCase() === lowerQuery);
  if (product) return product;

  // Try to find by partial name match
  product = products.find(p => p.name.toLowerCase().includes(lowerQuery));
  if (product) return product;

  return null;
}

async function main() {
  log('\n╔══════════════════════════════════════════════════════════╗', 'blue');
  log('║      REMOVE PRODUCT - Natural Language Interface        ║', 'blue');
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

  const prompt = await question('\nWhich product do you want to remove? (name or ID): ');

  if (!prompt.trim()) {
    log('❌ No input provided', 'red');
    rl.close();
    return;
  }

  const productToRemove = findProduct(products, prompt.trim());

  if (!productToRemove) {
    log('\n❌ Product not found', 'red');
    log('Please use the exact product name or ID from the list above', 'yellow');
    rl.close();
    return;
  }

  log('\n📋 Product to remove:', 'yellow');
  log(`  Name: ${productToRemove.name}`);
  log(`  Category: ${productToRemove.category}`);
  log(`  ID: ${productToRemove.id}`);

  const confirm = await question('\nAre you sure you want to delete this product? (yes/no): ');
  
  if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
    log('❌ Operation cancelled', 'yellow');
    rl.close();
    return;
  }

  try {
    // Remove product from array
    const updatedProducts = products.filter(p => p.id !== productToRemove.id);
    
    log('\n💾 Removing product...', 'blue');
    
    // Delete associated image
    if (productToRemove.image) {
      await deleteProductImage(productToRemove.image);
    }
    
    // Save updated products
    await saveProducts(updatedProducts);

    log('\n✅ Product removed successfully!', 'green');
    log(`   Remaining products: ${updatedProducts.length}`, 'green');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
  }

  rl.close();
}

main();
