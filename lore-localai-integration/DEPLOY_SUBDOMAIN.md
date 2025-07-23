# 🌐 Deploy to Subdomain: haunted.phantomgear.it.com

## 🎯 Goal: Deploy business website to subdomain for Stripe verification

We'll deploy your `business-website.html` to `https://haunted.phantomgear.it.com` (or similar subdomain).

---

## 📋 Step-by-Step Deployment

### Step 1: Choose Your Subdomain
Pick one of these options:
- `haunted.phantomgear.it.com` ✨ (Matches branding)
- `payments.phantomgear.it.com` 💳 (Clear purpose)
- `business.phantomgear.it.com` 🏢 (Professional)

### Step 2: DNS Configuration

Add this DNS record to phantomgear.it.com:

**If using shared hosting (cPanel/Cloudflare):**
```
Type: CNAME
Name: haunted
Value: phantomgear.it.com
TTL: 3600 (or Auto)
```

**If using custom server/VPS:**
```
Type: A
Name: haunted  
Value: YOUR_SERVER_IP
TTL: 3600
```

### Step 3: Hosting Setup

#### Option A: cPanel/Shared Hosting
1. **Create Subdomain:**
   - Login to cPanel
   - Go to "Subdomains"
   - Create: `haunted.phantomgear.it.com`
   - Document Root: `/public_html/haunted/`

2. **Upload Files:**
   - Navigate to File Manager → `/public_html/haunted/`
   - Upload `business-website.html`
   - Rename to `index.html`

#### Option B: GitHub/Netlify/Vercel
1. **Create Repository:**
   ```bash
   mkdir haunted-empire-website
   cd haunted-empire-website
   # Copy business-website.html as index.html
   git init && git add . && git commit -m "Initial website"
   ```

2. **Deploy:**
   - Push to GitHub
   - Connect to Netlify/Vercel
   - Set custom domain: `haunted.phantomgear.it.com`

#### Option C: Manual Server Setup
1. **Create Virtual Host:**
   ```apache
   <VirtualHost *:80>
       ServerName haunted.phantomgear.it.com
       DocumentRoot /var/www/haunted
   </VirtualHost>
   ```

2. **Upload Files:**
   ```bash
   mkdir /var/www/haunted
   # Upload business-website.html as index.html
   ```

---

## 🧪 Testing Your Deployment

### 1. DNS Propagation Check
```bash
# Check if DNS is working
nslookup haunted.phantomgear.it.com
```

### 2. Website Accessibility Test
Visit: `https://haunted.phantomgear.it.com`

**Should show:**
- ✅ Haunted Empire header
- ✅ PhantomGear Technologies branding  
- ✅ Contact: support@phantomgear.it.com
- ✅ Professional business information

### 3. Stripe Requirements Check
- [ ] Website loads without errors
- [ ] Contact information visible
- [ ] Business name: "PhantomGear Technologies"
- [ ] Services clearly described
- [ ] Terms/Privacy/Refund policies accessible

---

## 🔧 Update Your Configuration

Once deployed, update your `.env` file:

```env
# Update with your actual subdomain URL
BUSINESS_WEBSITE=https://haunted.phantomgear.it.com
BUSINESS_EMAIL=support@phantomgear.it.com
BUSINESS_NAME=PhantomGear Technologies
BUSINESS_DOMAIN=phantomgear.it.com
```

---

## 🏢 Update Stripe Account

### 1. Go to Stripe Dashboard
Visit: https://dashboard.stripe.com/account/details

### 2. Update Business Information
- **Website:** `https://haunted.phantomgear.it.com`
- **Business name:** `PhantomGear Technologies`
- **Industry:** `Technology/Software`
- **Description:** `Creator monetization platform`

### 3. Complete Verification
- Add bank account details
- Complete tax information  
- Upload any required documents
- Wait for verification approval

---

## ⚡ Quick Commands

```bash
# Test current setup
node setup-phantomgear.js

# Verify Stripe keys (after getting real ones)
node verify-stripe-keys.js

# Start your services once verified
node creator-leaderboards.js    # Port 8085
node stripe-payment-service.js  # Port 8090  
node stripe-dashboard.js        # Port 3003
```

---

## 🚨 Common Issues & Solutions

### DNS not propagating?
- Wait up to 24 hours for global propagation
- Use online DNS checker tools
- Clear your local DNS cache

### Website shows cPanel default page?
- Ensure `index.html` exists in subdomain folder
- Check file permissions (644 for files, 755 for folders)
- Verify subdomain document root path

### Stripe still rejecting website?
- Ensure all required pages are accessible
- Check that contact information is visible
- Verify business information matches exactly
- Make sure website loads over HTTPS

---

## 🎉 Success Checklist

Once everything is working:

- [ ] Subdomain `haunted.phantomgear.it.com` loads successfully
- [ ] Business website shows PhantomGear Technologies branding
- [ ] Stripe account updated with website URL
- [ ] Real Stripe API keys obtained and configured
- [ ] Services running and processing test payments
- [ ] Ready for Stripe business verification

**You'll be ready to process real payments once Stripe approves your business verification!** 🚀

---

## 📞 Need Help?

If you run into issues:
1. Check the DNS propagation
2. Verify file upload locations
3. Test website accessibility
4. Update Stripe account information
5. Get your real API keys from Stripe dashboard

**Ready to proceed? Let me know which hosting method you're using (cPanel, GitHub, or custom server) and I'll help with the specific steps!**
