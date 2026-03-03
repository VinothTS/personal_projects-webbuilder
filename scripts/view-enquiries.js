#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

const enquiriesPath = path.join(__dirname, '../data/enquiries.json');
const ordersPath = path.join(__dirname, '../data/orders.json');

function loadEnquiries() {
  if (fs.existsSync(enquiriesPath)) {
    return JSON.parse(fs.readFileSync(enquiriesPath, 'utf-8'));
  }
  return [];
}

function loadOrders() {
  if (fs.existsSync(ordersPath)) {
    return JSON.parse(fs.readFileSync(ordersPath, 'utf-8'));
  }
  return [];
}

function displayEnquiries() {
  const enquiries = loadEnquiries();
  
  if (enquiries.length === 0) {
    console.log('\n📭 No enquiries yet.\n');
    return;
  }

  console.log('\n📧 ===== CUSTOMER ENQUIRIES =====\n');
  
  enquiries.forEach((enq, index) => {
    console.log(`${index + 1}. Enquiry ID: ${enq.id}`);
    console.log(`   Date: ${new Date(enq.timestamp).toLocaleString()}`);
    console.log(`   From: ${enq.name} (${enq.email})`);
    if (enq.phone) console.log(`   Phone: ${enq.phone}`);
    console.log(`   Subject: ${enq.subject}`);
    console.log(`   Message: ${enq.message}`);
    console.log(`   Status: ${enq.status}`);
    console.log(`   Recipient Email: ${enq.recipientEmail}`);
    console.log('   ' + '-'.repeat(60));
  });
  
  console.log(`\nTotal Enquiries: ${enquiries.length}\n`);
}

function displayOrders() {
  const orders = loadOrders();
  
  if (orders.length === 0) {
    console.log('\n📦 No orders yet.\n');
    return;
  }

  console.log('\n📦 ===== CUSTOMER ORDERS =====\n');
  
  orders.forEach((order, index) => {
    console.log(`${index + 1}. Order ID: ${order.orderId}`);
    console.log(`   Date: ${new Date(order.timestamp).toLocaleString()}`);
    console.log(`   Customer: ${order.customerName}`);
    console.log(`   Email: ${order.customerEmail}`);
    console.log(`   Phone: ${order.customerPhone}`);
    console.log(`   Payment Method: ${order.paymentMethod}`);
    console.log(`   Total Amount: Rs ${order.total.toFixed(2)}`);
    console.log(`   Status: ${order.status}`);
    console.log(`   Items: ${order.items.length} item(s)`);
    order.items.forEach((item, i) => {
      console.log(`      ${i + 1}. ${item.productName} - ${item.packaging} x ${item.quantity}`);
    });
    console.log(`   Shipping Address:`);
    console.log(`      ${order.shippingAddress.addressLine1}`);
    if (order.shippingAddress.addressLine2) {
      console.log(`      ${order.shippingAddress.addressLine2}`);
    }
    console.log(`      ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`);
    console.log(`      ${order.shippingAddress.country}`);
    console.log(`   Recipient Email: ${order.recipientEmail}`);
    console.log('   ' + '-'.repeat(60));
  });
  
  console.log(`\nTotal Orders: ${orders.length}`);
  console.log(`Total Revenue: Rs ${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}\n`);
}

function exportToCSV(type) {
  const timestamp = new Date().toISOString().split('T')[0];
  
  if (type === 'enquiries') {
    const enquiries = loadEnquiries();
    if (enquiries.length === 0) {
      console.log('\n❌ No enquiries to export.\n');
      return;
    }
    
    const csv = [
      'ID,Date,Name,Email,Phone,Subject,Message,Status,Recipient Email',
      ...enquiries.map(e => 
        `"${e.id}","${e.timestamp}","${e.name}","${e.email}","${e.phone || ''}","${e.subject}","${e.message.replace(/"/g, '""')}","${e.status}","${e.recipientEmail}"`
      )
    ].join('\n');
    
    const filename = `enquiries-${timestamp}.csv`;
    fs.writeFileSync(filename, csv);
    console.log(`\n✅ Exported ${enquiries.length} enquiries to ${filename}\n`);
    
  } else if (type === 'orders') {
    const orders = loadOrders();
    if (orders.length === 0) {
      console.log('\n❌ No orders to export.\n');
      return;
    }
    
    const csv = [
      'Order ID,Date,Customer Name,Email,Phone,Payment Method,Subtotal,Shipping,Total,Status,Items Count,Recipient Email',
      ...orders.map(o => 
        `"${o.orderId}","${o.timestamp}","${o.customerName}","${o.customerEmail}","${o.customerPhone}","${o.paymentMethod}",${o.subtotal},${o.shipping},${o.total},"${o.status}",${o.items.length},"${o.recipientEmail}"`
      )
    ].join('\n');
    
    const filename = `orders-${timestamp}.csv`;
    fs.writeFileSync(filename, csv);
    console.log(`\n✅ Exported ${orders.length} orders to ${filename}\n`);
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  Customer Enquiries & Orders Manager   ║');
  console.log('╚════════════════════════════════════════╝\n');

  while (true) {
    console.log('What would you like to do?\n');
    console.log('1. View Enquiries');
    console.log('2. View Orders');
    console.log('3. Export Enquiries to CSV');
    console.log('4. Export Orders to CSV');
    console.log('5. Exit\n');

    const choice = await question('Enter your choice (1-5): ');

    switch (choice.trim()) {
      case '1':
        displayEnquiries();
        break;
      case '2':
        displayOrders();
        break;
      case '3':
        exportToCSV('enquiries');
        break;
      case '4':
        exportToCSV('orders');
        break;
      case '5':
        console.log('\n👋 Goodbye!\n');
        rl.close();
        process.exit(0);
      default:
        console.log('\n❌ Invalid choice. Please try again.\n');
    }
  }
}

main().catch(err => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});
