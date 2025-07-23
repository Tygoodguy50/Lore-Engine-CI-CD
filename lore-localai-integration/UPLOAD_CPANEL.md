# 📁 cPanel/Shared Hosting Upload Instructions

## Step-by-Step cPanel Upload Process

### 1. **Access cPanel**
- Login to your hosting control panel (usually yourhost.com/cpanel)
- Look for "File Manager" icon

### 2. **Create Subdomain** (if not done yet)
- Find "Subdomains" in cPanel
- Create new subdomain: `haunted`
- Domain: `phantomgear.it.com` 
- Document Root: `/public_html/haunted/` (or similar)
- Click "Create"

### 3. **Navigate to Subdomain Folder**
- Open File Manager
- Navigate to: `/public_html/haunted/` (your subdomain folder)
- You should see an empty folder or default files

### 4. **Upload Your Website**
**Method 1: Direct Upload**
- Click "Upload" button in File Manager
- Select your `index.html` file from your computer
- Wait for upload to complete

**Method 2: Copy from main directory**
- If you already uploaded to main directory, copy the file:
- Navigate to `/public_html/` (main directory)
- Right-click on `business-website.html`
- Select "Copy"
- Navigate to `/public_html/haunted/`
- Right-click and "Paste"
- Rename `business-website.html` to `index.html`

### 5. **Set Permissions** (if needed)
- Right-click on `index.html`
- Select "Change Permissions"
- Set to: 644 (rw-r--r--)
- Click "Change Permissions"

### 6. **Test Your Site**
- Visit: `https://haunted.phantomgear.it.com`
- Should show your Haunted Empire website

---

## 🚨 Common cPanel Issues:

**Problem:** Subdomain shows "cPanel default page"
**Solution:** Make sure `index.html` exists in the subdomain root folder

**Problem:** Permission denied errors  
**Solution:** Set file permissions to 644 and folder permissions to 755

**Problem:** DNS not working
**Solution:** Wait 24 hours for propagation, or contact hosting provider

---

## ✅ Success Checklist:
- [ ] Subdomain created in cPanel
- [ ] `index.html` uploaded to subdomain folder  
- [ ] File permissions set correctly (644)
- [ ] Website loads at subdomain URL
- [ ] All sections and styling work properly
