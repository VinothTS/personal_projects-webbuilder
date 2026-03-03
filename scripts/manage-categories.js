#!/usr/bin/env node

/**
 * MANAGE CATEGORIES SCRIPT
 * 
 * Allows users to add or remove product categories
 * When removing a category, all products in that category are also removed
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

async function getCategories() {
  const categoriesFile = path.join(process.cwd(), 'data', 'categories.json');
  try {
    const data = await fs.readFile(categoriesFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return ["Rice", "Pulses", "Tea", "Fish Products", "Flowers"];
  }
}

async function saveCategories(categories) {
  const dataDir = path.join(process.cwd(), 'data');
  const categoriesFile = path.join(dataDir, 'categories.json');
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(categoriesFile, JSON.stringify(categories, null, 2));
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

async function addCategory() {
  const categories = await getCategories();
  
  log('\n📝 Current categories:', 'blue');
  categories.forEach((cat, i) => {
    log(`  ${i + 1}. ${cat}`);
  });
  
  const newCategory = await question('\nEnter new category name: ');
  
  if (!newCategory.trim()) {
    log('❌ No category name provided', 'red');
    return;
  }
  
  // Check if category already exists
  if (categories.find(c => c.toLowerCase() === newCategory.trim().toLowerCase())) {
    log('❌ Category already exists', 'red');
    return;
  }
  
  // Add category
  categories.push(newCategory.trim());
  await saveCategories(categories);
  
  log(`\n✅ Category "${newCategory.trim()}" added successfully!`, 'green');
  log('\n📝 Updated categories:', 'blue');
  categories.forEach((cat, i) => {
    log(`  ${i + 1}. ${cat}`);
  });
}

async function removeCategory() {
  const categories = await getCategories();
  const products = await getProducts();
  
  log('\n📝 Current categories:', 'blue');
  categories.forEach((cat, i) => {
    const productCount = products.filter(p => p.category === cat).length;
    log(`  ${i + 1}. ${cat} (${productCount} products)`);
  });
  
  const choice = await question('\nEnter category number or name to remove: ');
  
  if (!choice.trim()) {
    log('❌ No category selected', 'red');
    return;
  }
  
  // Find category
  let categoryToRemove = null;
  const choiceNum = parseInt(choice);
  
  if (!isNaN(choiceNum) && choiceNum > 0 && choiceNum <= categories.length) {
    categoryToRemove = categories[choiceNum - 1];
  } else {
    categoryToRemove = categories.find(c => c.toLowerCase() === choice.trim().toLowerCase());
  }
  
  if (!categoryToRemove) {
    log('❌ Category not found', 'red');
    return;
  }
  
  // Count products in this category
  const productsInCategory = products.filter(p => p.category === categoryToRemove);
  
  log(`\n⚠️  WARNING: This will delete category "${categoryToRemove}"`, 'yellow');
  log(`   and ${productsInCategory.length} product(s) in this category:`, 'yellow');
  
  if (productsInCategory.length > 0) {
    productsInCategory.forEach((p, i) => {
      log(`   ${i + 1}. ${p.name}`, 'yellow');
    });
  }
  
  const confirm = await question('\nAre you sure? Type "DELETE" to confirm: ');
  
  if (confirm.trim() !== 'DELETE') {
    log('❌ Operation cancelled', 'yellow');
    return;
  }
  
  // Remove category
  const updatedCategories = categories.filter(c => c !== categoryToRemove);
  await saveCategories(updatedCategories);
  
  // Remove products in this category
  const updatedProducts = products.filter(p => p.category !== categoryToRemove);
  await saveProducts(updatedProducts);
  
  log(`\n✅ Category "${categoryToRemove}" deleted successfully!`, 'green');
  log(`   ${productsInCategory.length} product(s) removed`, 'green');
  
  log('\n📝 Remaining categories:', 'blue');
  updatedCategories.forEach((cat, i) => {
    const productCount = updatedProducts.filter(p => p.category === cat).length;
    log(`  ${i + 1}. ${cat} (${productCount} products)`);
  });
}

async function main() {
  log('\n╔══════════════════════════════════════════════════════════╗', 'blue');
  log('║          MANAGE CATEGORIES - Product Categories         ║', 'blue');
  log('╚══════════════════════════════════════════════════════════╝\n', 'blue');
  
  log('What would you like to do?', 'yellow');
  log('  1. View all categories');
  log('  2. Add new category');
  log('  3. Remove category (deletes all products in it)');
  log('  4. Cancel');
  
  const choice = await question('\nEnter your choice (1-4): ');
  
  try {
    switch (choice.trim()) {
      case '1': {
        const categories = await getCategories();
        const products = await getProducts();
        
        log('\n📝 Current categories:', 'blue');
        categories.forEach((cat, i) => {
          const productCount = products.filter(p => p.category === cat).length;
          log(`  ${i + 1}. ${cat} (${productCount} products)`);
        });
        break;
      }
      case '2': {
        await addCategory();
        break;
      }
      case '3': {
        await removeCategory();
        break;
      }
      case '4': {
        log('❌ Operation cancelled', 'yellow');
        break;
      }
      default: {
        log('❌ Invalid choice', 'red');
        break;
      }
    }
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
  }
  
  rl.close();
}

main();
