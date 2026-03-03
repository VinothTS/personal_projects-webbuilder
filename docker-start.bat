@echo off
REM =============================================================================
REM QUICK START SCRIPT FOR BUSINESSMEN (WINDOWS)
REM =============================================================================
REM This script sets up and runs your e-commerce website in a Docker container
REM No technical knowledge required - just double-click this file!
REM =============================================================================

echo ==========================================
echo   E-COMMERCE WEBSITE SETUP
echo ==========================================
echo.

REM Check if Docker is installed
echo Checking if Docker is installed...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed!
    echo.
    echo Please install Docker Desktop first:
    echo   https://docs.docker.com/desktop/install/windows-install/
    echo.
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    echo.
    pause
    exit /b 1
)

echo [OK] Docker is installed and running
echo.

REM Check if .env.local exists
if not exist .env.local (
    echo Creating .env.local file...
    (
        echo # Site Configuration
        echo NEXT_PUBLIC_SITE_NAME="Global Agro Exports"
        echo NEXT_PUBLIC_SITE_URL=http://localhost:3000
        echo.
        echo # Email Configuration ^(Gmail SMTP^)
        echo EMAIL_HOST=smtp.gmail.com
        echo EMAIL_PORT=587
        echo EMAIL_SECURE=false
        echo EMAIL_USER=your-email@gmail.com
        echo EMAIL_PASSWORD=your-app-password-here
        echo.
        echo # Razorpay Payment Gateway ^(Test Mode - Ready to Use^)
        echo NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
        echo RAZORPAY_KEY_SECRET=xxxxx
    ) > .env.local
    echo [OK] Created .env.local with default settings
    echo.
)

echo ==========================================
echo   BUILDING DOCKER CONTAINER
echo ==========================================
echo This may take 5-10 minutes on first run...
echo.

REM Build the Docker image
docker-compose build

echo.
echo [OK] Docker container built successfully!
echo.

echo ==========================================
echo   STARTING YOUR WEBSITE
echo ==========================================
echo.

REM Start the container
docker-compose up -d

echo.
echo [OK] Website is starting...
echo.
echo Waiting for website to be ready...
timeout /t 10 /nobreak >nul

echo.
echo ==========================================
echo   SUCCESS! YOUR WEBSITE IS RUNNING!
echo ==========================================
echo.
echo [WEBSITE] Open your website:
echo    http://localhost:3000
echo.
echo [TEST] Test Razorpay Payment:
echo    Card: 4111 1111 1111 1111
echo    CVV: 123
echo    Expiry: 12/25
echo.
echo [MANAGE] Manage Your Website:
echo    Add products: add-product.bat
echo    Update products: update-product.bat
echo    Remove products: remove-product.bat
echo    View orders: Check data\orders.json
echo.
echo [DOCKER] Docker Commands:
echo    Stop website: docker-compose stop
echo    Start website: docker-compose start
echo    View logs: docker-compose logs -f
echo    Restart: docker-compose restart
echo.
echo [DOCS] Documentation: See QUICK_START.md
echo.
echo ==========================================
echo.
pause
