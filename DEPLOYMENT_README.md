# 🚀 Deployment Guide for End Users

## 📦 What You're Getting

This is a complete, ready-to-use e-commerce website system that runs on your computer. Everything is packaged in a "container" (using Docker), so you don't need to worry about installing Node.js, databases, or other technical dependencies.

---

## 🖥️ System Requirements

- **Operating System**: Windows 10/11, macOS 11+, or Linux
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: 2GB free space
- **Internet**: Required for initial setup only

---

## ⚡ Quick Start (Choose Your OS)

### 🍎 **Mac Users**

1. **Download & Extract**
   - Extract the ZIP file you received
   - Open Terminal (press `Cmd + Space`, type "Terminal")

2. **Navigate to Folder**
   ```bash
   cd /path/to/extracted/folder
   ```

3. **Run Setup**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

4. **Done!**
   - The script will guide you through everything
   - Your website will open at: http://localhost:3000

---

### 🪟 **Windows Users**

1. **Download & Extract**
   - Extract the ZIP file you received
   - Open the folder

2. **Run Setup**
   - Double-click `setup.bat`
   - Or right-click and "Run as Administrator"

3. **Follow Instructions**
   - The script will guide you through everything
   - Your website will open at: http://localhost:3000

---

### 🐧 **Linux Users**

1. **Download & Extract**
   - Extract the ZIP file you received
   - Open Terminal

2. **Navigate to Folder**
   ```bash
   cd /path/to/extracted/folder
   ```

3. **Run Setup**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

4. **Done!**
   - The script will guide you through everything
   - Your website will open at: http://localhost:3000

---

## 🎯 What the Setup Script Does

The automated setup script will:

1. ✅ **Check for Docker**
   - Detects if Docker is already installed
   - If not, offers to install it for you

2. ✅ **Install Docker** (if needed)
   - Downloads and installs Docker automatically
   - Guides you through any manual steps if required

3. ✅ **Configure Your Business**
   - Asks for your business name, description
   - Sets up your About and Contact pages
   - Configures your contact information

4. ✅ **Build Your Website**
   - Creates the website container
   - Sets up all necessary components

5. ✅ **Start Your Website**
   - Launches the website on your computer
   - Makes it accessible at http://localhost:3000

---

## 🎨 First-Time Configuration

During setup, you'll be asked to configure:

### Business Information
- Business name (e.g., "Fresh Farms Export")
- Tagline (e.g., "Premium Agricultural Products Worldwide")
- Description (brief about your business)

### About Page Content
- Mission statement
- Vision statement
- Company story
- Core values (4 values)
- Statistics to showcase (4 stats like years in business, countries served)

### Contact Information
- Email address
- Phone number
- WhatsApp number
- Business address
- Business hours (for each day of the week)
- Social media links (Facebook, Instagram, Twitter, LinkedIn)

**💡 Tip**: You can skip configuration and do it later using the configuration tool.

---

## 📱 Using Your Website

### Access the Website
Open your web browser and go to: **http://localhost:3000**

### Admin Features (Command Line)

#### Configure Business Details
```bash
# Mac/Linux
./configure-business.sh

# Windows
node scripts\configure-business.js
```

#### Add Products
```bash
# Mac/Linux
docker compose exec web npm run prompt:add-product

# Windows
docker compose exec web npm run prompt:add-product
```

You can describe products in plain English:
```
"I want to add premium basmati rice, 1kg pack costs Rs 200,
5kg pack costs Rs 950, available in grain category"
```

#### Update Products
```bash
# Mac/Linux
docker compose exec web npm run prompt:update-product

# Windows
docker compose exec web npm run prompt:update-product
```

#### Remove Products
```bash
# Mac/Linux
docker compose exec web npm run prompt:remove-product

# Windows
docker compose exec web npm run prompt:remove-product
```

#### Manage Categories
```bash
# Mac/Linux
docker compose exec web npm run prompt:manage-categories

# Windows
docker compose exec web npm run prompt:manage-categories
```

#### Change Theme
```bash
# Mac/Linux
docker compose exec web npm run prompt:change-theme

# Windows
docker compose exec web npm run prompt:change-theme
```

Available themes:
- 🟢 Fresh Green (default)
- 🟠 Warm Orange
- 🔵 Ocean Blue
- 🟣 Royal Purple
- 🔴 Bold Red

---

## 🛠️ Daily Operations

### Starting Your Website
```bash
# Mac/Linux
docker compose up -d

# Windows
docker compose up -d
```

### Stopping Your Website
```bash
# Mac/Linux
docker compose down

# Windows
docker compose down
```

### Checking if Website is Running
Open browser and go to: http://localhost:3000

### Viewing Activity Logs
```bash
docker compose logs -f
```
(Press `Ctrl+C` to stop viewing logs)

---

## 📂 Important Files & Folders

Your data is stored in these folders:

```
📁 Your Website Folder
├── 📄 setup.sh / setup.bat     ← Run this to start
├── 📄 configure-business.sh    ← Configure your business
├── 📁 data/
│   ├── products.json           ← Your products
│   └── categories.json         ← Your categories
├── 📁 config/
│   └── business-config.json    ← Your business info
└── 📁 public/images/products/  ← Product images
```

**⚠️ Important**: Don't delete these folders! They contain all your data.

---

## 🔧 Common Tasks

### Backup Your Data

Before making changes, backup your data:

**Mac/Linux**:
```bash
tar -czf backup-$(date +%Y%m%d).tar.gz data/ config/ public/images/
```

**Windows** (PowerShell):
```powershell
Compress-Archive -Path data,config,public\images -DestinationPath "backup-$(Get-Date -Format 'yyyyMMdd').zip"
```

### Restore from Backup

**Mac/Linux**:
```bash
tar -xzf backup-20260222.tar.gz
```

**Windows**:
```powershell
Expand-Archive -Path backup-20260222.zip -DestinationPath .
```

### Add Product Images

1. Place your image file in `public/images/products/`
2. When adding product, use the filename:
   ```
   "Add rice, 1kg Rs 200, image: rice-basmati.jpg"
   ```

Or provide a URL:
```
"Add rice, 1kg Rs 200, image: https://example.com/image.jpg"
```

---

## ❓ Troubleshooting

### Website Not Loading?

1. **Check if Docker is running**
   - Mac: Look for Docker whale icon in menu bar
   - Windows: Look for Docker whale icon in system tray
   - Linux: Run `sudo systemctl status docker`

2. **Check if website container is running**
   ```bash
   docker compose ps
   ```

3. **Restart the website**
   ```bash
   docker compose restart
   ```

### Port 3000 Already in Use?

Another program is using port 3000. Either:

**Option 1**: Stop the other program

**Option 2**: Change the port
1. Open `docker-compose.yml`
2. Change `"3000:3000"` to `"3001:3000"`
3. Access at http://localhost:3001

### "Docker is not running" Error?

- **Mac**: Open Docker Desktop from Applications
- **Windows**: Open Docker Desktop from Start Menu
- **Linux**: Run `sudo systemctl start docker`

### Permission Errors (Linux)?

```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Website Shows Errors?

1. **View error logs**
   ```bash
   docker compose logs -f
   ```

2. **Rebuild the website**
   ```bash
   docker compose down
   docker compose build
   docker compose up -d
   ```

---

## 🆘 Getting Help

### Check Detailed Guides
- `DOCKER_GUIDE.md` - Detailed Docker instructions
- `README.md` - Full technical documentation
- `QUICK_START.md` - Quick reference

### View Logs
```bash
docker compose logs -f
```

### Check Website Status
```bash
docker compose ps
```

---

## 🎓 Video Tutorials

### For Complete Beginners

1. **First Time Setup** (10 minutes)
   - Running the setup script
   - Configuring your business
   - Accessing your website

2. **Adding Products** (5 minutes)
   - Using the add product command
   - Adding images
   - Setting prices

3. **Daily Operations** (5 minutes)
   - Starting and stopping
   - Updating content
   - Backing up data

---

## ✅ Checklist for New Users

- [ ] Extract the ZIP file
- [ ] Run setup script (`setup.sh` or `setup.bat`)
- [ ] Install Docker (if prompted)
- [ ] Configure business details
- [ ] Wait for website to build
- [ ] Open http://localhost:3000
- [ ] Add your first product
- [ ] Test the website
- [ ] Bookmark http://localhost:3000

---

## 📞 Support Workflow

If you encounter issues:

1. ✅ Check this guide first
2. ✅ Check `DOCKER_GUIDE.md` for Docker-specific issues
3. ✅ View logs: `docker compose logs -f`
4. ✅ Try rebuilding: `docker compose down && docker compose build && docker compose up -d`
5. ✅ Contact your technical support with:
   - Your operating system
   - Error messages from logs
   - What you were trying to do

---

## 🎉 You're All Set!

Your e-commerce website is now running on your computer!

**Next Steps**:
1. Configure your business details
2. Add your products and categories
3. Customize your theme
4. Test the complete shopping flow
5. Share http://localhost:3000 with your team

**Remember**: Your website runs locally on your computer. To make it accessible on the internet, you'll need to deploy it to a hosting service (ask your technical support for help with this).

---

**Happy Selling! 🛒**
