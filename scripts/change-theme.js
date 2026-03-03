#!/usr/bin/env node

/**
 * CHANGE THEME SCRIPT
 * Allows businessman to change website theme/style
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
  log('║           CHANGE WEBSITE THEME & STYLE                  ║', 'blue');
  log('╚══════════════════════════════════════════════════════════╝\n', 'blue');

  const configFile = path.join(process.cwd(), 'config', 'business-config.json');

  try {
    const data = await fs.readFile(configFile, 'utf-8');
    const config = JSON.parse(data);

    log('🎨 AVAILABLE THEMES:\n', 'yellow');
    log('1. Modern & Clean');
    log('   • Green color scheme');
    log('   • Grid layout');
    log('   • Shadow effects');
    log('   • Best for: Fresh, natural products\n');

    log('2. Elegant & Professional');
    log('   • Blue color scheme');
    log('   • List layout');
    log('   • Border style');
    log('   • Best for: Corporate, professional businesses\n');

    log('3. Vibrant & Colorful');
    log('   • Red/Orange color scheme');
    log('   • Masonry layout');
    log('   • Large shadows');
    log('   • Best for: Eye-catching, bold presence\n');

    log('4. Minimal & Simple');
    log('   • Black/Gray color scheme');
    log('   • Grid layout');
    log('   • Subtle borders');
    log('   • Best for: Clean, minimalist look\n');

    log('5. Classic & Traditional');
    log('   • Navy color scheme');
    log('   • Grid layout');
    log('   • Soft shadows');
    log('   • Best for: Traditional, trustworthy image\n');

    log(`Current theme: ${config.theme.style}\n`, 'blue');

    const choice = await question('Select new theme (1-5) or press Enter to keep current: ');

    if (!choice.trim()) {
      log('No changes made', 'yellow');
      rl.close();
      return;
    }

    const themeMap = {
      '1': { style: 'modern', layout: 'grid' },
      '2': { style: 'elegant', layout: 'list' },
      '3': { style: 'vibrant', layout: 'masonry' },
      '4': { style: 'minimal', layout: 'grid' },
      '5': { style: 'classic', layout: 'grid' }
    };

    const selected = themeMap[choice];

    if (!selected) {
      log('Invalid choice', 'red');
      rl.close();
      return;
    }

    config.theme.style = selected.style;
    config.theme.layout = selected.layout;

    await fs.writeFile(configFile, JSON.stringify(config, null, 2));

    log(`\n✅ Theme changed to: ${selected.style}`, 'green');
    log('\n🔄 Restart your website to see changes:', 'blue');
    log('   Press Ctrl+C in the terminal running the website');
    log('   Then run: ./start-website.sh\n');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    log('Run ./setup-business.sh first to create configuration', 'yellow');
  }

  rl.close();
}

main();
