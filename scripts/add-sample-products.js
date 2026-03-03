#!/usr/bin/env node

/**
 * DEMO SCRIPT - Add Sample Products
 * 
 * This script adds sample products to demonstrate the website
 */

const fs = require('fs').promises;
const path = require('path');

const colors = {
  green: '\x1b[32m',
  blue: '\x1b[36m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const sampleProducts = [
  {
    id: `${Date.now()}-1`,
    name: 'Premium Basmati Rice',
    description: 'Long-grain aged basmati rice from Punjab, India. Perfect for biryani and pilaf. Aromatic and fluffy texture.',
    category: 'Rice',
    specifications: {
      'Origin': 'Punjab, India',
      'Grain Length': '8.3mm',
      'Aging': '2 years',
      'Packaging': '5kg, 10kg, 25kg bags'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: `${Date.now()}-2`,
    name: 'Organic Green Tea',
    description: 'Premium organic green tea from Darjeeling. Rich in antioxidants with a delicate, fresh flavor. First flush harvest.',
    category: 'Tea',
    specifications: {
      'Origin': 'Darjeeling, India',
      'Type': 'First Flush',
      'Certification': 'Organic',
      'Packaging': '100g, 250g, 500g'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: `${Date.now()}-3`,
    name: 'Red Lentils',
    description: 'High-quality split red lentils (Masoor Dal). Protein-rich, quick-cooking, and perfect for soups, curries, and stews.',
    category: 'Pulses',
    specifications: {
      'Origin': 'India',
      'Type': 'Split, Polished',
      'Protein Content': '25%',
      'Packaging': '1kg, 5kg, 20kg bags'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: `${Date.now()}-4`,
    name: 'Premium Dried Fish',
    description: 'Naturally dried fish fillets, rich in omega-3. Traditional processing method preserves nutrients and flavor.',
    category: 'Fish Products',
    specifications: {
      'Type': 'Mixed varieties',
      'Processing': 'Sun-dried',
      'Protein': 'High',
      'Packaging': '500g, 1kg vacuum sealed'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: `${Date.now()}-5`,
    name: 'Fresh Cut Roses',
    description: 'Premium long-stem roses in various colors. Carefully cultivated and hand-picked. Perfect for events and bouquets.',
    category: 'Flowers',
    specifications: {
      'Colors': 'Red, Pink, White, Yellow',
      'Stem Length': '60-80cm',
      'Freshness': '7-10 days',
      'Packaging': 'Bunches of 12, 24, 50'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: `${Date.now()}-6`,
    name: 'Jasmine Rice',
    description: 'Fragrant Thai jasmine rice with a naturally sweet aroma. Soft, sticky texture when cooked. Grade A quality.',
    category: 'Rice',
    specifications: {
      'Origin': 'Thailand',
      'Grade': 'Grade A',
      'Aroma': 'Natural jasmine',
      'Packaging': '5kg, 10kg, 20kg bags'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: `${Date.now()}-7`,
    name: 'Assam Black Tea',
    description: 'Bold and malty Assam black tea. Full-bodied with rich flavor. Perfect for morning brew and milk tea.',
    category: 'Tea',
    specifications: {
      'Origin': 'Assam, India',
      'Grade': 'FTGFOP1',
      'Caffeine': 'High',
      'Packaging': '100g, 250g, 1kg'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: `${Date.now()}-8`,
    name: 'Chickpeas (Kabuli Chana)',
    description: 'Premium quality Kabuli chickpeas. Large, creamy-white grains. Rich in protein and fiber. Perfect for hummus and curries.',
    category: 'Pulses',
    specifications: {
      'Origin': 'India',
      'Type': 'Kabuli (White)',
      'Size': '8-9mm',
      'Packaging': '1kg, 5kg, 25kg bags'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

async function main() {
  log('\n╔══════════════════════════════════════════════════════════╗', 'blue');
  log('║              ADDING SAMPLE PRODUCTS FOR DEMO            ║', 'blue');
  log('╚══════════════════════════════════════════════════════════╝\n', 'blue');

  try {
    const dataDir = path.join(process.cwd(), 'data');
    const productsFile = path.join(dataDir, 'products.json');

    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(productsFile, JSON.stringify(sampleProducts, null, 2));

    log(`✅ Successfully added ${sampleProducts.length} sample products!\n`, 'green');
    
    log('📦 Products added:', 'yellow');
    sampleProducts.forEach((p, i) => {
      log(`   ${i + 1}. ${p.name} (${p.category})`);
    });

    log('\n🚀 Next steps:', 'blue');
    log('   1. Run: npm run dev');
    log('   2. Open: http://localhost:3000');
    log('   3. Explore the website with sample products');
    log('\n💡 To manage products:', 'blue');
    log('   - Add: npm run prompt:add-product');
    log('   - Update: npm run prompt:update-product');
    log('   - Remove: npm run prompt:remove-product\n');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
  }
}

main();
