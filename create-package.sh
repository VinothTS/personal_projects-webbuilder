#!/bin/bash

# =============================================================================
# PACKAGE BUILDER - Create delivery package for businessman
# =============================================================================

set -e

echo "=========================================="
echo "  CREATING DEPLOYMENT PACKAGE"
echo "=========================================="
echo ""

# Package name with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME="ecommerce_website_${TIMESTAMP}"
PACKAGE_DIR="../${PACKAGE_NAME}"

echo "Creating package: ${PACKAGE_NAME}"
echo ""

# Create temporary package directory
mkdir -p "${PACKAGE_DIR}"

# Copy essential files
echo "Copying files..."

# Core application files
cp -r app components contexts lib types public config data scripts "${PACKAGE_DIR}/"

# Configuration files
cp package.json package-lock.json next.config.ts tsconfig.json tailwind.config.ts postcss.config.mjs "${PACKAGE_DIR}/"
cp .gitignore "${PACKAGE_DIR}/"

# Docker files
cp Dockerfile docker-compose.yml "${PACKAGE_DIR}/"
cp docker-start.sh docker-start.bat "${PACKAGE_DIR}/"

# Environment template
if [ -f .env.local ]; then
    # Remove sensitive data and create template
    cat .env.local | sed 's/EMAIL_USER=.*/EMAIL_USER=your-email@gmail.com/' | \
                     sed 's/EMAIL_PASSWORD=.*/EMAIL_PASSWORD=your-gmail-app-password/' > "${PACKAGE_DIR}/.env.local"
else
    # Create from scratch
    cat > "${PACKAGE_DIR}/.env.local" << 'EOF'
# Site Configuration
NEXT_PUBLIC_SITE_NAME="Global Agro Exports"
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# Razorpay Payment Gateway (Test Mode)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
EOF
fi

# Management scripts
cp *.sh "${PACKAGE_DIR}/" 2>/dev/null || :
cp *.bat "${PACKAGE_DIR}/" 2>/dev/null || :

# Documentation
echo "Copying documentation..."
cp DEPLOYMENT_PACKAGE.md PACKAGE_README.md QUICK_START.md MASTER_GUIDE.md README.md "${PACKAGE_DIR}/"
cp RAZORPAY_INTEGRATION_GUIDE.md RAZORPAY_QUICK_TEST.md RAZORPAY_COMPLETE.md "${PACKAGE_DIR}/" 2>/dev/null || :
cp EMAIL_NOTIFICATIONS_GUIDE.md GMAIL_SETUP_GUIDE.md "${PACKAGE_DIR}/" 2>/dev/null || :
cp LIVE_EXCHANGE_RATES_GUIDE.md DOCKER_GUIDE.md DEPLOYMENT_README.md "${PACKAGE_DIR}/" 2>/dev/null || :
cp BUSINESSMAN_GUIDE.md PROJECT_SUMMARY.md PROMPTS_GUIDE.md "${PACKAGE_DIR}/" 2>/dev/null || :

# Make scripts executable
chmod +x "${PACKAGE_DIR}"/*.sh 2>/dev/null || :

echo ""
echo "Creating archive..."

# Create ZIP file
cd ..
zip -r "${PACKAGE_NAME}.zip" "${PACKAGE_NAME}" -q

# Get size
SIZE=$(du -sh "${PACKAGE_NAME}.zip" | cut -f1)

# Cleanup temporary directory
rm -rf "${PACKAGE_NAME}"

echo ""
echo "=========================================="
echo "  ✓ PACKAGE CREATED SUCCESSFULLY!"
echo "=========================================="
echo ""
echo "📦 Package: ${PACKAGE_NAME}.zip"
echo "📊 Size: ${SIZE}"
echo "📍 Location: $(pwd)/${PACKAGE_NAME}.zip"
echo ""
echo "📤 READY TO SHARE WITH BUSINESSMAN!"
echo ""
echo "Package includes:"
echo "  ✓ Complete website code"
echo "  ✓ Docker configuration"
echo "  ✓ Setup scripts (Windows + Mac/Linux)"
echo "  ✓ Complete documentation"
echo "  ✓ Sample products"
echo "  ✓ All features configured"
echo ""
echo "Businessman needs:"
echo "  1. Docker Desktop installed"
echo "  2. Run docker-start.sh (or .bat for Windows)"
echo "  3. Visit http://localhost:3000"
echo ""
echo "=========================================="
