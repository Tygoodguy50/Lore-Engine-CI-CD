# 🌐 Deploy Haunted Empire Business Site to phantomgear.it.com

## 🎯 Goal: Use Your Existing Domain for Stripe Verification

Using `phantomgear.it.com` is perfect for Stripe business verification since you already own the domain and it's established with TikTok development.

---

## 📋 Quick Deployment Options

### Option 1: Subdomain (Recommended)
Deploy to a subdomain like:
- `https://haunted.phantomgear.it.com`
- `https://payments.phantomgear.it.com` 
- `https://business.phantomgear.it.com`

### Option 2: Subdirectory
Deploy to a path like:
- `https://phantomgear.it.com/haunted-empire`
- `https://phantomgear.it.com/business`

---

## 🚀 Deployment Steps

### Step 1: Choose Your Hosting Method

#### A. If phantomgear.it.com uses cPanel/File Manager:
```bash
# 1. Create a subdirectory: /public_html/haunted-empire/
# 2. Upload business-website.html as index.html
# 3. Access at: https://phantomgear.it.com/haunted-empire/
```

#### B. If phantomgear.it.com uses GitHub/Netlify/Vercel:
```bash
# 1. Add business-website.html to your existing repo
# 2. Set up subdomain DNS
# 3. Deploy to subdomain
```

#### C. If you have server access:
```bash
# 1. Create virtual host for subdomain
# 2. Upload files to subdomain document root
# 3. Configure DNS A record
```

---

## 🔧 DNS Configuration (If Using Subdomain)

Add these DNS records to phantomgear.it.com:

```
Type: CNAME
Name: haunted (or your chosen subdomain)
Value: your-hosting-provider.com
TTL: 3600
```

Or for direct IP:
```
Type: A
Name: haunted
Value: YOUR_SERVER_IP
TTL: 3600
```

---

## 📝 Stripe Account Update Steps

### 1. Complete Business Profile
Go to: https://dashboard.stripe.com/account/details

**Business Information:**
- Business name: `PhantomGear Technologies`
- Business type: `Technology/Software`
- Industry: `Digital services`
- Website: `https://phantomgear.it.com/haunted-empire/` (or your chosen URL)
- Description: `Creator monetization platform providing payment processing for digital content creators`

### 2. Business Address
- Use your real business/personal address
- This must be accurate for tax purposes

### 3. Tax Information
- Add your Tax ID (SSN or EIN)
- Complete tax interview if prompted

### 4. Bank Account
- Add business or personal bank account
- Verify with micro-deposits

---

## 🧪 Get Your Real Stripe Keys

### Test Keys (For Development)
Go to: https://dashboard.stripe.com/test/apikeys
```env
STRIPE_SECRET_KEY=sk_test_51...YOUR_TEST_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_51...YOUR_TEST_KEY
```

### Live Keys (After Verification)
Go to: https://dashboard.stripe.com/apikeys
```env
STRIPE_SECRET_KEY=sk_live_51...YOUR_LIVE_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_51...YOUR_LIVE_KEY
```

---

## ⚡ Quick Setup Script

Let me create a simple deployment script for you:

```bash
# Update your .env with correct test keys first
# Then run this to test:
node verify-stripe-keys.js
```

---

## 📊 Immediate Next Steps

### 1. Deploy Business Website
- Upload `business-website.html` to phantomgear.it.com
- Make it accessible at a clean URL
- Test that all links work

### 2. Update Stripe Account  
- Add website URL to Stripe dashboard
- Complete all required business information
- Upload any required documents

### 3. Get Correct API Keys
- Copy your actual test keys from Stripe dashboard
- Update `.env` file with real keys
- Test the integration

### 4. Test Everything
```bash
# Start your services
node creator-leaderboards.js    # Port 8085
node stripe-payment-service.js  # Port 8090
node stripe-dashboard.js        # Port 3003

# Test payment creation
curl -X POST http://localhost:8085/creators/create-payment \
  -H "Content-Type: application/json" \
  -d '{"creator_id": "cr_001", "amount": 1.00}'
```

---

## 🎯 Website Content for Stripe

Your deployed site should clearly show:

✅ **What you do**: Creator monetization platform  
✅ **Who you serve**: Horror/digital content creators  
✅ **Services offered**: Payment processing, analytics  
✅ **Contact info**: support@phantomgear.it.com  
✅ **Legal pages**: Terms, Privacy, Refund policies  
✅ **Business name**: PhantomGear Technologies  

---

## 📞 Support & Troubleshooting

### Common Issues:

**Website not accessible?**
- Check DNS propagation (up to 24 hours)
- Verify file permissions
- Test from different networks

**Stripe still rejecting?**
- Ensure website loads properly
- All required pages must be accessible
- Business information must be complete

**API keys not working?**
- Double-check you copied the full key
- Make sure account is in correct mode (test/live)
- Verify account activation status

---

## 🔄 Once Website is Live

Update your `.env` with the website info:
```env
BUSINESS_WEBSITE=https://phantomgear.it.com/haunted-empire/
BUSINESS_EMAIL=support@phantomgear.it.com
BUSINESS_NAME=PhantomGear Technologies
```

Then update Stripe account and get your verification approved!

**Ready to deploy? Let me know which hosting method you're using and I'll help with the specific steps!** 🚀
