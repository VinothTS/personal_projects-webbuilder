#!/usr/bin/env node

/**
 * Test Email Configuration
 * This script verifies that your Gmail SMTP settings are correct
 */

const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function testEmailConfig() {
  console.log('\n🔍 Testing Email Configuration...\n');
  
  // Check if environment variables are set
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const emailHost = process.env.EMAIL_HOST;
  const emailPort = process.env.EMAIL_PORT;
  
  console.log('Configuration Check:');
  console.log('-------------------');
  console.log(`Email Host: ${emailHost || '❌ NOT SET'}`);
  console.log(`Email Port: ${emailPort || '❌ NOT SET'}`);
  console.log(`Email User: ${emailUser || '❌ NOT SET'}`);
  console.log(`Email Password: ${emailPassword ? '✅ SET (hidden)' : '❌ NOT SET'}`);
  console.log();
  
  if (!emailUser || !emailPassword) {
    console.log('❌ Email credentials not configured!');
    console.log('\n📋 Next Steps:');
    console.log('1. Open GMAIL_SETUP_GUIDE.md for detailed instructions');
    console.log('2. Enable 2-Step Verification in your Google Account');
    console.log('3. Generate an App Password at https://myaccount.google.com/apppasswords');
    console.log('4. Update EMAIL_USER and EMAIL_PASSWORD in .env.local');
    console.log('5. Run this test again\n');
    return;
  }
  
  console.log('✅ Credentials are configured\n');
  console.log('🔌 Testing SMTP connection...\n');
  
  try {
    // Import email module
    const { verifyEmailConfig } = require('../lib/email.ts');
    
    const result = await verifyEmailConfig();
    
    if (result.success) {
      console.log('✅ SUCCESS! Email server connection verified');
      console.log('📧 You can now send emails from your website\n');
      console.log('Next steps:');
      console.log('1. Test the contact form at http://localhost:3000/contact');
      console.log('2. Complete a test order to receive order notifications');
      console.log('3. Check your Gmail inbox for test emails\n');
    } else {
      console.log('❌ FAILED! Could not connect to email server');
      console.log('Error:', result.error);
      console.log('\n📋 Troubleshooting:');
      console.log('1. Verify 2-Step Verification is enabled');
      console.log('2. Generate a new App Password');
      console.log('3. Remove all spaces from the App Password');
      console.log('4. Check GMAIL_SETUP_GUIDE.md for detailed help\n');
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    console.log('\nFull error:', error);
    console.log('\n📋 See GMAIL_SETUP_GUIDE.md for troubleshooting steps\n');
  }
}

// Run the test
testEmailConfig().catch(console.error);
