#!/bin/bash

# =============================================================================
# QUICK START SCRIPT FOR BUSINESSMEN
# =============================================================================
# This script sets up and runs your e-commerce website in a Docker container
# No technical knowledge required - just run this script!
# =============================================================================

set -e

echo "=========================================="
echo "  E-COMMERCE WEBSITE SETUP"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
echo "Checking if Docker is installed..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}ERROR: Docker is not installed!${NC}"
    echo ""
    echo "Please install Docker Desktop first:"
    echo "  - Mac: https://docs.docker.com/desktop/install/mac-install/"
    echo "  - Windows: https://docs.docker.com/desktop/install/windows-install/"
    echo "  - Linux: https://docs.docker.com/engine/install/"
    echo ""
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}ERROR: Docker is not running!${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed and running${NC}"
echo ""

# Check if .env.local exists, if not create from example
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}Creating .env.local file...${NC}"
    cat > .env.local << 'EOF'
# Site Configuration
NEXT_PUBLIC_SITE_NAME="Global Agro Exports"
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here

# Razorpay Payment Gateway (Test Mode - Ready to Use)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx

# For Live Payments (After Razorpay Registration):
# NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY
# RAZORPAY_KEY_SECRET=YOUR_SECRET
EOF
    echo -e "${GREEN}✓ Created .env.local with default settings${NC}"
    echo ""
fi

echo "=========================================="
echo "  BUILDING DOCKER CONTAINER"
echo "=========================================="
echo "This may take 5-10 minutes on first run..."
echo ""

# Build the Docker image
docker-compose build

echo ""
echo -e "${GREEN}✓ Docker container built successfully!${NC}"
echo ""

echo "=========================================="
echo "  STARTING YOUR WEBSITE"
echo "=========================================="
echo ""

# Start the container
docker-compose up -d

echo ""
echo -e "${GREEN}✓ Website is starting...${NC}"
echo ""
echo "Waiting for website to be ready..."
sleep 10

echo ""
echo "=========================================="
echo -e "${GREEN}  ✓ SUCCESS! YOUR WEBSITE IS RUNNING!${NC}"
echo "=========================================="
echo ""
echo "🌐 Open your website:"
echo "   👉 http://localhost:3000"
echo ""
echo "📚 Test Razorpay Payment:"
echo "   Card: 4111 1111 1111 1111"
echo "   CVV: 123"
echo "   Expiry: 12/25"
echo ""
echo "🛠️  Manage Your Website:"
echo "   • Add products: ./add-product.sh"
echo "   • Update products: ./update-product.sh"
echo "   • Remove products: ./remove-product.sh"
echo "   • View orders: Check data/orders.json"
echo "   • View enquiries: ./view-enquiries.sh"
echo ""
echo "🔧 Docker Commands:"
echo "   • Stop website: docker-compose stop"
echo "   • Start website: docker-compose start"
echo "   • View logs: docker-compose logs -f"
echo "   • Restart: docker-compose restart"
echo "   • Stop & remove: docker-compose down"
echo ""
echo "📖 Documentation: See QUICK_START.md"
echo ""
echo "=========================================="
