#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
    echo -e "${2}${1}${NC}"
}

print_header() {
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    print_message "$1" "$BLUE"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
}

print_success() {
    print_message "✓ $1" "$GREEN"
}

print_error() {
    print_message "✗ $1" "$RED"
}

print_warning() {
    print_message "⚠ $1" "$YELLOW"
}

# Detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="mac"
    else
        OS="unknown"
    fi
}

# Check if Docker is installed
check_docker() {
    if command -v docker &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Check if Docker Compose is installed
check_docker_compose() {
    if docker compose version &> /dev/null; then
        return 0
    elif command -v docker-compose &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Install Docker on Linux
install_docker_linux() {
    print_header "Installing Docker on Linux"
    
    # Detect Linux distribution
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        DISTRO=$ID
    fi
    
    case $DISTRO in
        ubuntu|debian)
            print_message "Detected Ubuntu/Debian" "$BLUE"
            sudo apt-get update
            sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
            curl -fsSL https://download.docker.com/linux/$DISTRO/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/$DISTRO $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
            sudo apt-get update
            sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
            ;;
        fedora|centos|rhel)
            print_message "Detected Fedora/CentOS/RHEL" "$BLUE"
            sudo dnf -y install dnf-plugins-core
            sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
            sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
            ;;
        *)
            print_error "Unsupported Linux distribution: $DISTRO"
            print_message "Please install Docker manually from: https://docs.docker.com/engine/install/" "$YELLOW"
            exit 1
            ;;
    esac
    
    # Start Docker service
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    print_success "Docker installed successfully!"
    print_warning "You may need to log out and log back in for group changes to take effect."
    print_message "Or run: newgrp docker" "$YELLOW"
}

# Install Docker on Mac
install_docker_mac() {
    print_header "Installing Docker on Mac"
    
    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        print_message "Installing Homebrew first..." "$BLUE"
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    print_message "Installing Docker Desktop via Homebrew..." "$BLUE"
    brew install --cask docker
    
    print_success "Docker Desktop installed!"
    print_warning "Please start Docker Desktop from your Applications folder."
    print_message "Waiting for Docker Desktop to start..." "$YELLOW"
    
    # Wait for Docker to be available
    echo "Please start Docker Desktop and press Enter when ready..."
    read -r
}

# Main installation function
install_docker() {
    case $OS in
        linux)
            install_docker_linux
            ;;
        mac)
            install_docker_mac
            ;;
        *)
            print_error "Unsupported operating system"
            exit 1
            ;;
    esac
}

# Build and start the application
start_application() {
    print_header "Starting Your E-Commerce Website"
    
    print_message "Building Docker image..." "$BLUE"
    docker compose build
    
    if [ $? -eq 0 ]; then
        print_success "Build completed successfully!"
    else
        print_error "Build failed. Please check the error messages above."
        exit 1
    fi
    
    print_message "Starting the application..." "$BLUE"
    docker compose up -d
    
    if [ $? -eq 0 ]; then
        print_success "Application started successfully!"
    else
        print_error "Failed to start application. Please check the error messages above."
        exit 1
    fi
}

# Main script
main() {
    clear
    print_header "E-Commerce Website Setup"
    print_message "Welcome! This script will set up your e-commerce website." "$GREEN"
    echo ""
    
    # Detect OS
    detect_os
    print_message "Detected operating system: $OS" "$BLUE"
    echo ""
    
    # Check if Docker is installed
    if check_docker; then
        print_success "Docker is already installed"
        DOCKER_VERSION=$(docker --version)
        print_message "  $DOCKER_VERSION" "$BLUE"
    else
        print_warning "Docker is not installed"
        echo ""
        read -p "Would you like to install Docker now? (y/n): " install_choice
        
        if [[ $install_choice == "y" || $install_choice == "Y" ]]; then
            install_docker
            echo ""
            
            # Verify installation
            if check_docker; then
                print_success "Docker installed and verified!"
            else
                print_error "Docker installation verification failed."
                print_message "Please install Docker manually and run this script again." "$YELLOW"
                exit 1
            fi
        else
            print_error "Docker is required to run this application."
            print_message "Please install Docker from: https://docs.docker.com/get-docker/" "$YELLOW"
            exit 1
        fi
    fi
    
    echo ""
    
    # Check Docker Compose
    if check_docker_compose; then
        print_success "Docker Compose is available"
    else
        print_error "Docker Compose is not available"
        exit 1
    fi
    
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    
    # Ask if user wants to configure business details
    read -p "Would you like to configure your business details now? (y/n): " config_choice
    
    if [[ $config_choice == "y" || $config_choice == "Y" ]]; then
        if [ -f "configure-business.sh" ]; then
            chmod +x configure-business.sh
            ./configure-business.sh
        else
            print_warning "Configuration script not found. You can configure later."
        fi
    fi
    
    echo ""
    
    # Start the application
    start_application
    
    echo ""
    print_header "Setup Complete!"
    print_success "Your e-commerce website is now running!"
    echo ""
    print_message "🌐 Access your website at: http://localhost:3000" "$GREEN"
    echo ""
    print_message "Useful commands:" "$BLUE"
    echo "  • Stop the website:    docker compose down"
    echo "  • View logs:           docker compose logs -f"
    echo "  • Restart:             docker compose restart"
    echo "  • Configure business:  ./configure-business.sh"
    echo "  • Add products:        docker compose exec web npm run prompt:add-product"
    echo "  • Manage categories:   docker compose exec web npm run prompt:manage-categories"
    echo ""
    print_message "📁 Your data is stored in:" "$YELLOW"
    echo "  • Products: ./data/products.json"
    echo "  • Categories: ./data/categories.json"
    echo "  • Config: ./config/business-config.json"
    echo ""
    print_message "Need help? Check README.md for more information." "$BLUE"
    echo ""
}

# Run main function
main
