@echo off
setlocal enabledelayedexpansion

:: Colors using Windows ANSI escape codes
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

:: Enable ANSI color support
reg add HKCU\Console /v VirtualTerminalLevel /t REG_DWORD /d 1 /f >nul 2>&1

echo.
echo ===============================================================
echo %BLUE%E-Commerce Website Setup for Windows%NC%
echo ===============================================================
echo.
echo %GREEN%Welcome! This script will set up your e-commerce website.%NC%
echo.

:: Check if Docker is installed
where docker >nul 2>&1
if %errorlevel% equ 0 (
    echo %GREEN%[OK] Docker is already installed%NC%
    for /f "tokens=*" %%i in ('docker --version') do echo       %%i
    goto :docker_compose_check
)

echo %YELLOW%[!] Docker is not installed%NC%
echo.
set /p install_choice="Would you like to install Docker Desktop? (y/n): "

if /i "%install_choice%"=="y" (
    echo.
    echo %BLUE%Installing Docker Desktop for Windows...%NC%
    echo.
    echo %YELLOW%Please follow these steps:%NC%
    echo.
    echo 1. Opening Docker Desktop download page in your browser...
    echo 2. Download and run "Docker Desktop Installer.exe"
    echo 3. Follow the installation wizard
    echo 4. Restart your computer if prompted
    echo 5. Start Docker Desktop from Start Menu
    echo 6. Wait for Docker to fully start (icon in system tray)
    echo 7. Come back and run this script again
    echo.
    
    :: Open Docker download page
    start https://desktop.docker.com/win/main/amd64/Docker%%20Desktop%%20Installer.exe
    
    echo.
    echo %YELLOW%After installing Docker Desktop:%NC%
    echo   - Make sure Docker Desktop is running
    echo   - Run this script again: setup.bat
    echo.
    pause
    exit /b 1
) else (
    echo.
    echo %RED%[X] Docker is required to run this application.%NC%
    echo %YELLOW%Please install Docker Desktop from: https://docs.docker.com/desktop/install/windows-install/%NC%
    echo.
    pause
    exit /b 1
)

:docker_compose_check
echo.

:: Check if Docker Compose is available
docker compose version >nul 2>&1
if %errorlevel% equ 0 (
    echo %GREEN%[OK] Docker Compose is available%NC%
) else (
    echo %RED%[X] Docker Compose is not available%NC%
    echo %YELLOW%Please make sure Docker Desktop is running properly.%NC%
    pause
    exit /b 1
)

echo.
echo ===============================================================
echo.

:: Ask if user wants to configure business details
set /p config_choice="Would you like to configure your business details now? (y/n): "

if /i "%config_choice%"=="y" (
    if exist "configure-business.sh" (
        echo.
        echo %BLUE%Starting configuration wizard...%NC%
        node scripts\configure-business.js
    ) else (
        echo %YELLOW%[!] Configuration script not found. You can configure later.%NC%
    )
)

echo.
echo ===============================================================
echo %BLUE%Starting Your E-Commerce Website%NC%
echo ===============================================================
echo.

echo %BLUE%Building Docker image...%NC%
docker compose build

if %errorlevel% equ 0 (
    echo %GREEN%[OK] Build completed successfully!%NC%
) else (
    echo %RED%[X] Build failed. Please check the error messages above.%NC%
    pause
    exit /b 1
)

echo.
echo %BLUE%Starting the application...%NC%
docker compose up -d

if %errorlevel% equ 0 (
    echo %GREEN%[OK] Application started successfully!%NC%
) else (
    echo %RED%[X] Failed to start application. Please check the error messages above.%NC%
    pause
    exit /b 1
)

echo.
echo ===============================================================
echo %GREEN%Setup Complete!%NC%
echo ===============================================================
echo.
echo %GREEN%Your e-commerce website is now running!%NC%
echo.
echo %GREEN%[*] Access your website at: http://localhost:3000%NC%
echo.
echo %BLUE%Useful commands:%NC%
echo   * Stop the website:    docker compose down
echo   * View logs:           docker compose logs -f
echo   * Restart:             docker compose restart
echo   * Configure business:  node scripts\configure-business.js
echo   * Add products:        docker compose exec web npm run prompt:add-product
echo   * Manage categories:   docker compose exec web npm run prompt:manage-categories
echo.
echo %YELLOW%Your data is stored in:%NC%
echo   * Products: .\data\products.json
echo   * Categories: .\data\categories.json
echo   * Config: .\config\business-config.json
echo.
echo %BLUE%Need help? Check README.md for more information.%NC%
echo.
pause
