# 🐳 Docker Setup Guide

## Quick Start (Automated Setup)

### For Mac/Linux Users:
```bash
chmod +x setup.sh
./setup.sh
```

### For Windows Users:
```cmd
setup.bat
```

The automated script will:
1. ✅ Detect your operating system
2. ✅ Check if Docker is installed
3. ✅ Offer to install Docker if needed
4. ✅ Configure your business details (optional)
5. ✅ Build and start your website
6. ✅ Open at http://localhost:3000

---

## Manual Docker Installation

### Windows

1. **Download Docker Desktop**
   - Visit: https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe
   - Double-click the downloaded installer
   - Follow the installation wizard

2. **System Requirements**
   - Windows 10/11 64-bit (Pro, Enterprise, or Education)
   - WSL 2 feature enabled
   - 4GB RAM minimum

3. **After Installation**
   - Restart your computer if prompted
   - Start Docker Desktop from Start Menu
   - Wait for Docker engine to start (green icon in system tray)

### Mac

1. **Using Homebrew (Recommended)**
   ```bash
   brew install --cask docker
   ```

2. **Manual Download**
   - **Intel Chip**: https://desktop.docker.com/mac/main/amd64/Docker.dmg
   - **Apple Silicon (M1/M2)**: https://desktop.docker.com/mac/main/arm64/Docker.dmg
   - Open the .dmg file and drag Docker to Applications
   - Launch Docker from Applications folder

3. **System Requirements**
   - macOS 11 or newer
   - 4GB RAM minimum

### Linux

#### Ubuntu/Debian
```bash
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group
sudo usermod -aG docker $USER

# Log out and log back in, or run:
newgrp docker
```

#### Fedora/CentOS/RHEL
```bash
# Install prerequisites
sudo dnf -y install dnf-plugins-core

# Add Docker repository
sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo

# Install Docker
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

---

## Manual Application Setup

If you prefer to run commands manually:

### 1. Configure Your Business (Optional)
```bash
# Mac/Linux
./configure-business.sh

# Windows
node scripts\configure-business.js
```

### 2. Build the Docker Image
```bash
docker compose build
```

### 3. Start the Application
```bash
docker compose up -d
```

### 4. Access Your Website
Open your browser and go to: **http://localhost:3000**

---

## Docker Commands Reference

### Starting & Stopping

```bash
# Start the website
docker compose up -d

# Stop the website
docker compose down

# Restart the website
docker compose restart

# Stop and remove all data (⚠️ Warning: This deletes your data!)
docker compose down -v
```

### Viewing Logs

```bash
# View all logs
docker compose logs

# Follow logs in real-time
docker compose logs -f

# View last 100 lines
docker compose logs --tail=100
```

### Managing Products & Categories

```bash
# Add a product
docker compose exec web npm run prompt:add-product

# Update a product
docker compose exec web npm run prompt:update-product

# Remove a product
docker compose exec web npm run prompt:remove-product

# Manage categories
docker compose exec web npm run prompt:manage-categories

# Configure business details
docker compose exec web npm run prompt:configure-business

# Change theme
docker compose exec web npm run prompt:change-theme
```

### Accessing the Container

```bash
# Open a shell inside the container
docker compose exec web sh

# Run any Node.js script
docker compose exec web node scripts/your-script.js
```

---

## File Persistence

Your data is stored outside the container in these folders:

- **📦 Products**: `./data/products.json`
- **📁 Categories**: `./data/categories.json`
- **⚙️ Configuration**: `./config/business-config.json`
- **🖼️ Product Images**: `./public/images/products/`

These files persist even if you stop or remove the container.

---

## Troubleshooting

### Docker not starting?

**Mac**: 
- Make sure Docker Desktop app is running
- Check Applications folder

**Windows**: 
- Make sure Docker Desktop is running
- Look for whale icon in system tray
- Ensure WSL 2 is installed and enabled

**Linux**: 
```bash
sudo systemctl status docker
sudo systemctl start docker
```

### Port 3000 already in use?

```bash
# Find what's using port 3000
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

Or edit `docker-compose.yml` to use a different port:
```yaml
ports:
  - "3001:3000"  # Use port 3001 instead
```

### Permission denied errors (Linux)?

```bash
# Add your user to docker group
sudo usermod -aG docker $USER

# Log out and log back in, or run:
newgrp docker
```

### Container won't build?

```bash
# Clear Docker cache and rebuild
docker compose build --no-cache

# Remove old images
docker system prune -a
```

### Website showing errors?

```bash
# Check logs for errors
docker compose logs -f

# Restart the container
docker compose restart

# Rebuild and restart
docker compose down
docker compose build
docker compose up -d
```

---

## Updating Your Website

When you make changes to your code:

```bash
# Stop the current container
docker compose down

# Rebuild with new changes
docker compose build

# Start again
docker compose up -d
```

---

## Backup Your Data

Before making major changes, backup your data:

```bash
# Mac/Linux
tar -czf backup-$(date +%Y%m%d).tar.gz data/ config/ public/images/

# Windows (PowerShell)
Compress-Archive -Path data,config,public\images -DestinationPath "backup-$(Get-Date -Format 'yyyyMMdd').zip"
```

---

## Uninstalling

### Remove the Application
```bash
docker compose down -v
```

### Uninstall Docker

**Mac**: 
- Drag Docker app from Applications to Trash
- Remove data: `rm -rf ~/Library/Group\ Containers/group.com.docker`

**Windows**: 
- Uninstall via Settings > Apps > Docker Desktop

**Linux**: 
```bash
sudo apt-get purge docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo rm -rf /var/lib/docker /var/lib/containerd
```

---

## Support

- 📖 Docker Documentation: https://docs.docker.com/
- 💬 Docker Community: https://forums.docker.com/
- 🐛 Report Issues: Check your website's README.md

---

## Performance Tips

1. **Allocate More Resources** (Docker Desktop)
   - Settings > Resources
   - Increase CPU and Memory limits

2. **Keep Docker Updated**
   - Regular updates improve performance

3. **Clean Up Unused Resources**
   ```bash
   docker system prune -a --volumes
   ```

4. **Monitor Resource Usage**
   ```bash
   docker stats
   ```
