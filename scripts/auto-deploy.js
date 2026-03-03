#!/usr/bin/env node

/**
 * AUTO DEPLOY SCRIPT
 * Automatically builds and deploys the website
 */

const { execSync } = require('child_process');
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
  log('║              AUTO DEPLOY TO LIVE WEBSITE                ║', 'blue');
  log('╚══════════════════════════════════════════════════════════╝\n', 'blue');

  log('This will:', 'yellow');
  log('  1. Build your website for production');
  log('  2. Deploy to Vercel (free hosting)');
  log('  3. Give you a live URL\n');

  const confirm = await question('Do you want to proceed? (yes/no): ');
  
  if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
    log('❌ Deployment cancelled', 'yellow');
    rl.close();
    return;
  }

  // Check if vercel is installed
  try {
    execSync('which vercel', { stdio: 'ignore' });
  } catch (error) {
    log('\n📦 Vercel CLI not found. Installing...', 'blue');
    if (!runCommand('npm install -g vercel', 'Installing Vercel CLI')) {
      rl.close();
      return;
    }
  }

  // Build the project
  if (!runCommand('npm run build', 'Building production website')) {
    rl.close();
    return;
  }

  log('\n✅ Build successful!', 'green');
  log('\n🚀 Now deploying to Vercel...', 'blue');
  log('Note: You may need to log in to Vercel on first deployment\n', 'yellow');

  try {
    execSync('vercel --prod', { stdio: 'inherit' });
    
    log('\n✅ Deployment successful!', 'green');
    log('\n🎉 Your website is now LIVE!', 'green');
    log('\n💡 Tips:', 'blue');
    log('   • Copy the URL provided above');
    log('   • Share it with your customers');
    log('   • To update: just run this script again');
    log('   • Changes take 1-2 minutes to appear\n');

    // Update config to remember deployment
    try {
      const configFile = path.join(process.cwd(), 'config', 'business-config.json');
      const data = await fs.readFile(configFile, 'utf-8');
      const config = JSON.parse(data);
      
      const autoUpdate = await question('\nEnable auto-deploy on every product update? (yes/no): ');
      config.deployment.autoDeployOnUpdate = autoUpdate.toLowerCase() === 'yes' || autoUpdate.toLowerCase() === 'y';
      
      await fs.writeFile(configFile, JSON.stringify(config, null, 2));
      
      if (config.deployment.autoDeployOnUpdate) {
        log('\n✅ Auto-deploy enabled! Website will update automatically.', 'green');
      }
    } catch (error) {
      // Ignore config update errors
    }

  } catch (error) {
    log('\n❌ Deployment failed', 'red');
    log('Please check the error messages above', 'yellow');
  }

  rl.close();
}

main();
