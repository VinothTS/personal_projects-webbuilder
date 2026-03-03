#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const configPath = path.join(__dirname, '..', 'config', 'business-config.json');

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function configureAbout() {
  console.log('\n📝 About Page Configuration\n');
  
  const title = await question('Page Title (e.g., "About Our Company"): ');
  const mission = await question('Mission Statement: ');
  const vision = await question('Vision Statement: ');
  const story = await question('Company Story: ');
  
  const values = [];
  console.log('\n✨ Company Values (Enter 4 values):\n');
  for (let i = 0; i < 4; i++) {
    const valueTitle = await question(`Value ${i + 1} Title: `);
    const valueDesc = await question(`Value ${i + 1} Description: `);
    values.push({ title: valueTitle, description: valueDesc });
  }
  
  console.log('\n📊 Company Statistics:\n');
  const stats = [
    { 
      label: 'Years in Business', 
      value: await question('Years in Business (e.g., "5+"): ')
    },
    { 
      label: 'Countries Served', 
      value: await question('Countries Served (e.g., "30+"): ')
    },
    { 
      label: 'Happy Customers', 
      value: await question('Happy Customers (e.g., "500+"): ')
    },
    { 
      label: 'Products', 
      value: await question('Number of Products (e.g., "50+"): ')
    }
  ];
  
  return { title, mission, vision, story, values, stats };
}

async function configureContact() {
  console.log('\n📞 Contact Information\n');
  
  const email = await question('Email: ');
  const phone = await question('Phone: ');
  const whatsapp = await question('WhatsApp (or press Enter to skip): ');
  
  console.log('\n📍 Address:\n');
  const address = {
    street: await question('Street Address: '),
    city: await question('City: '),
    state: await question('State/Province: '),
    zip: await question('Postal Code: '),
    country: await question('Country: ')
  };
  
  console.log('\n🕐 Business Hours (press Enter to skip):\n');
  const hours = {};
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  for (const day of days) {
    const dayHours = await question(`${day.charAt(0).toUpperCase() + day.slice(1)} (e.g., "9:00 AM - 6:00 PM" or "Closed"): `);
    if (dayHours) hours[day] = dayHours;
  }
  
  console.log('\n🌐 Social Media (press Enter to skip):\n');
  const social = {
    facebook: await question('Facebook URL: '),
    instagram: await question('Instagram URL: '),
    linkedin: await question('LinkedIn URL: '),
    twitter: await question('Twitter URL: ')
  };
  
  return { email, phone, whatsapp: whatsapp || phone, address, social, hours };
}

async function configureBusiness() {
  console.log('\n🏢 Business Information\n');
  
  const name = await question('Business Name: ');
  const tagline = await question('Tagline: ');
  const description = await question('Short Description: ');
  
  return { name, tagline, description };
}

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('   🌾 Business Configuration Tool 🌾');
  console.log('═══════════════════════════════════════════\n');
  console.log('This tool will help you configure your business');
  console.log('information for the website.\n');
  
  try {
    // Load existing config
    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    
    const configOption = await question('Configure: (1) Business Info, (2) About Page, (3) Contact Info, (4) All: ');
    
    if (configOption === '1' || configOption === '4') {
      const businessInfo = await configureBusiness();
      config.business = { ...config.business, ...businessInfo };
    }
    
    if (configOption === '2' || configOption === '4') {
      const aboutInfo = await configureAbout();
      if (!config.business) config.business = {};
      config.business.about = aboutInfo;
    }
    
    if (configOption === '3' || configOption === '4') {
      const contactInfo = await configureContact();
      config.contact = contactInfo;
    }
    
    // Ensure theme and other required fields exist
    if (!config.theme) {
      config.theme = {
        style: 'modern',
        primaryColor: '#2d5016',
        secondaryColor: '#8fbc5a',
        accentColor: '#f4a460',
        layout: 'grid'
      };
    }
    
    if (!config.features) {
      config.features = {
        showPrices: true,
        showSpecifications: true,
        enableInquiry: true,
        showCategories: true,
        enableSearch: true
      };
    }
    
    // Save configuration
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    console.log('\n✅ Configuration saved successfully!');
    console.log(`📄 Config file: ${configPath}\n`);
    console.log('You can edit this file directly or run this script again to update.\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

main();
