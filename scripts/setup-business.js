#!/usr/bin/env node

/**
 * SETUP BUSINESS - Initial Configuration
 * This script helps businessman setup their business information
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

async function main() {
  log('\n╔══════════════════════════════════════════════════════════╗', 'blue');
  log('║          BUSINESS SETUP - Initial Configuration         ║', 'blue');
  log('╚══════════════════════════════════════════════════════════╝\n', 'blue');

  log('Let\'s set up your business information.\n', 'yellow');

  // Business Information
  log('📋 BUSINESS INFORMATION', 'blue');
  const businessName = await question('Business Name: ');
  const tagline = await question('Tagline (e.g., Premium Agricultural Products): ');
  const description = await question('Short Description: ');

  // Contact Information
  log('\n📞 CONTACT INFORMATION', 'blue');
  const email = await question('Email: ');
  const phone = await question('Phone (e.g., +1 234 567 8900): ');
  const whatsapp = await question('WhatsApp (optional, press Enter to skip): ');

  // Address
  log('\n📍 ADDRESS', 'blue');
  const street = await question('Street Address: ');
  const city = await question('City: ');
  const state = await question('State/Province: ');
  const zip = await question('ZIP/Postal Code: ');
  const country = await question('Country: ');

  // Social Media
  log('\n🌐 SOCIAL MEDIA (Optional - press Enter to skip)', 'blue');
  const facebook = await question('Facebook URL: ');
  const instagram = await question('Instagram URL: ');
  const linkedin = await question('LinkedIn URL: ');
  const twitter = await question('Twitter URL: ');

  // Theme Selection
  log('\n🎨 CHOOSE YOUR WEBSITE STYLE', 'blue');
  log('1. Modern & Clean (Green theme, grid layout)');
  log('2. Elegant & Professional (Blue theme, list layout)');
  log('3. Vibrant & Colorful (Red/Orange theme, masonry layout)');
  log('4. Minimal & Simple (Black/Gray theme, grid layout)');
  log('5. Classic & Traditional (Navy theme, grid layout)');
  
  const themeChoice = await question('\nSelect theme (1-5): ');
  const themeMap = {
    '1': 'modern',
    '2': 'elegant',
    '3': 'vibrant',
    '4': 'minimal',
    '5': 'classic'
  };
  const selectedTheme = themeMap[themeChoice] || 'modern';

  // Features
  log('\n✨ FEATURES', 'blue');
  const showPrices = (await question('Show prices on products? (yes/no): ')).toLowerCase() === 'yes';
  const showSpecs = (await question('Show detailed specifications? (yes/no): ')).toLowerCase() === 'yes';

  // Create config
  const config = {
    business: {
      name: businessName,
      tagline: tagline,
      description: description,
      logo: ""
    },
    contact: {
      email: email,
      phone: phone,
      whatsapp: whatsapp || phone,
      address: {
        street: street,
        city: city,
        state: state,
        zip: zip,
        country: country
      },
      social: {
        facebook: facebook,
        instagram: instagram,
        linkedin: linkedin,
        twitter: twitter
      }
    },
    theme: {
      style: selectedTheme,
      primaryColor: "#2d5016",
      secondaryColor: "#8fbc5a",
      accentColor: "#f4a460",
      layout: "grid"
    },
    features: {
      showPrices: showPrices,
      showSpecifications: showSpecs,
      enableInquiry: true,
      showCategories: true,
      enableSearch: true
    },
    categories: ["Rice", "Pulses", "Tea", "Fish Products", "Flowers"],
    deployment: {
      platform: "vercel",
      domain: "",
      autoDeployOnUpdate: false
    }
  };

  // Save config
  const configDir = path.join(process.cwd(), 'config');
  const configFile = path.join(configDir, 'business-config.json');

  await fs.mkdir(configDir, { recursive: true });
  await fs.writeFile(configFile, JSON.stringify(config, null, 2));

  log('\n✅ Business configuration saved successfully!', 'green');
  log('\n📋 Summary:', 'blue');
  log(`   Business: ${businessName}`);
  log(`   Email: ${email}`);
  log(`   Phone: ${phone}`);
  log(`   Theme: ${selectedTheme}`);
  log(`   Show Prices: ${showPrices ? 'Yes' : 'No'}`);

  log('\n🎉 Your website is now personalized!', 'green');
  log('\n🚀 Next steps:', 'blue');
  log('   1. Add products: ./add-product.sh');
  log('   2. Start website: ./start-website.sh');
  log('   3. View at: http://localhost:3000\n');

  rl.close();
}

main().catch(console.error);
