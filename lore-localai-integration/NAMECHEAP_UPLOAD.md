# 🟦 Namecheap Hosting Upload Guide

## Step-by-Step Namecheap Process

### **Phase 1: Access Your Hosting**

1. **Login to Namecheap**
   - Go to: https://www.namecheap.com
   - Click "Sign In" 
   - Enter your Namecheap credentials

2. **Find Your Hosting**
   - Go to "Account" → "Dashboard"
   - Look for "Products" or "Hosting List"
   - Find `phantomgear.it.com` hosting package
   - Click "Manage" or "cPanel"

### **Phase 2: Create Subdomain**

3. **Open cPanel**
   - You should see the cPanel interface
   - Look for "Subdomains" icon (usually in "Domains" section)

4. **Create haunted Subdomain**
   - Click "Subdomains"
   - **Subdomain:** `haunted`
   - **Domain:** `phantomgear.it.com` (should auto-fill)
   - **Document Root:** `/public_html/haunted/` (auto-fills)
   - Click "Create"
   - ✅ You should see confirmation: "haunted.phantomgear.it.com has been created"

### **Phase 3: Upload Website**

5. **Open File Manager**
   - Back in cPanel, find "File Manager" icon
   - Click it to open file browser

6. **Navigate to Subdomain Folder**
   - You'll see folders like: `public_html`, `etc`, `logs`
   - Open: `public_html` folder
   - Open: `haunted` folder (created in step 4)
   - This is where your website files go

7. **Upload index.html**
   - Click "Upload" button (top toolbar)
   - Click "Select File" 
   - Choose your `index.html` from computer
   - Wait for "Upload Complete" message
   - Close upload window

### **Phase 4: Test & Configure**

8. **Set Permissions** (if needed)
   - Right-click on `index.html`
   - Select "Change Permissions"
   - Set to: `644` 
   - Click "Change Permissions"

9. **Test Your Website**
   - Open new browser tab
   - Go to: `https://haunted.phantomgear.it.com`
   - Should show your Haunted Empire website! 🎉

---

## 🚨 **Namecheap-Specific Troubleshooting**

**Problem: "This domain is for sale" page**
- **Solution:** Wait 24-48 hours for DNS propagation, or check subdomain was created correctly

**Problem: cPanel login not working**  
- **Solution:** Use "Forgot Password" or contact Namecheap support

**Problem: File Manager shows permission errors**
- **Solution:** Make sure you're in the correct `/public_html/haunted/` folder

**Problem: Website shows blank page**
- **Solution:** Ensure file is named exactly `index.html` (not `index.html.txt`)

---

## 📋 **Namecheap Success Checklist**

- [ ] Logged into Namecheap account
- [ ] Accessed cPanel for phantomgear.it.com
- [ ] Created subdomain: haunted.phantomgear.it.com  
- [ ] Uploaded index.html to /public_html/haunted/
- [ ] Set file permissions to 644
- [ ] Website loads at https://haunted.phantomgear.it.com
- [ ] All styling and content appears correctly

---

## 🎯 **Next Steps After Upload**

Once your website is live:

1. **Update Stripe Account**
   - Go to: https://dashboard.stripe.com/account/details
   - Website: `https://haunted.phantomgear.it.com`
   - Business: PhantomGear Technologies

2. **Get Real Stripe Keys**
   - Go to: https://dashboard.stripe.com/test/apikeys
   - Copy your actual test keys
   - Update your `.env` file

3. **Test Integration**
   ```bash
   node verify-stripe-keys.js
   ```

**You're almost ready for Stripe business verification!** 🚀
