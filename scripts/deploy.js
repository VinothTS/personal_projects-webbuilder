#!/usr/bin/env node

/**
 * DEPLOY SCRIPT
 * 
 * This script helps deploy the website.
 * 
 * Usage: npm run prompt:deploy
 */

const { execSync } = require('child_process');
const readline = require('readline');

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

function runCommand(command, description) {
  log(`\n${description}...`, 'blue');
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✓ ${description} completed`, 'green');
    return true;
  } catch (error) {
    log(`✗ ${description} failed`, 'red');
    return false;
  }
}

async function main() {
  log('\n╔══════════════════════════════════════════════════════════╗', 'blue');
  log('║            DEPLOY WEBSITE - Simple Interface            ║', 'blue');
  log('╚══════════════════════════════════════════════════════════╝\n', 'blue');

  log('This script will:', 'yellow');
  log('  1. Build the production version of your website');
  log('  2. Prepare it for deployment\n');

  const confirm = await question('Do you want to continue? (yes/no): ');
  
  if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
    log('❌ Deployment cancelled', 'yellow');
    rl.close();
    return;
  }

  // Build the project
  if (!runCommand('npm run build', 'Building production website')) {
    rl.close();
    return;
  }

  log('\n✅ Website built successfully!', 'green');
  log('\n📦 Your website is ready in the .next folder', 'blue');
  log('\n🚀 Deployment options:', 'yellow');
  log('  1. Vercel: Run "npx vercel" (recommended)');
  log('  2. Netlify: Run "npx netlify deploy"');
  log('  3. Self-hosted: Run "npm start" on your server');
  log('\n💡 For Vercel (easiest):');
  log('     1. Create account at vercel.com');
  log('     2. Run: npx vercel');
  log('     3. Follow the prompts');

  rl.close();
}

main();
