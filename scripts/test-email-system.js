#!/usr/bin/env node

const fetch = require('node-fetch');

async function testContactForm() {
  console.log('\n🧪 Testing Contact Form Submission...\n');

  const testData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    subject: 'Product Inquiry - Test',
    message: 'This is a test enquiry to check if the contact form is working properly. I am interested in learning more about your products.'
  };

  console.log('📤 Sending test enquiry...');
  console.log('Data:', JSON.stringify(testData, null, 2));
  console.log('');

  try {
    const response = await fetch('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS! Contact form submission worked!');
      console.log('');
      console.log('Response:', JSON.stringify(result, null, 2));
      console.log('');
      console.log('📋 Check data/enquiries.json to see the saved enquiry');
    } else {
      console.log('❌ FAILED! Error:', result.error);
    }

  } catch (error) {
    console.log('❌ ERROR:', error.message);
    console.log('');
    console.log('Make sure the dev server is running: npm run dev');
  }

  console.log('');
}

async function testOrderNotification() {
  console.log('🧪 Testing Order Notification...\n');

  const testOrder = {
    orderId: 'ORD-TEST-' + Date.now(),
    items: [
      {
        productId: 'test-product-1',
        productName: 'Premium Basmati Rice',
        packaging: '1kg',
        quantity: 2,
        price: 'Rs 200.00'
      },
      {
        productId: 'test-product-2',
        productName: 'Organic Wheat Flour',
        packaging: '5kg',
        quantity: 1,
        price: 'Rs 450.00'
      }
    ],
    shippingAddress: {
      fullName: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1 (555) 987-6543',
      addressLine1: '123 Main Street',
      addressLine2: 'Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India'
    },
    paymentMethod: 'card',
    subtotal: 850.00,
    shipping: 50.00,
    total: 900.00,
    orderDate: new Date().toISOString()
  };

  console.log('📤 Sending test order notification...');
  console.log('Order ID:', testOrder.orderId);
  console.log('');

  try {
    const response = await fetch('http://localhost:3000/api/order-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testOrder)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS! Order notification worked!');
      console.log('');
      console.log('Response:', JSON.stringify(result, null, 2));
      console.log('');
      console.log('📋 Check data/orders.json to see the saved order');
    } else {
      console.log('❌ FAILED! Error:', result.error);
    }

  } catch (error) {
    console.log('❌ ERROR:', error.message);
    console.log('');
    console.log('Make sure the dev server is running: npm run dev');
  }

  console.log('');
}

async function main() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   Email Notification System Test      ║');
  console.log('╚════════════════════════════════════════╝');

  // Test contact form
  await testContactForm();

  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test order notification
  await testOrderNotification();

  console.log('╔════════════════════════════════════════╗');
  console.log('║          Test Complete!                ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log('📊 View results with: npm run prompt:view-enquiries');
  console.log('');
}

main();
