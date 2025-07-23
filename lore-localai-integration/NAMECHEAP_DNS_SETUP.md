# 🌐 Namecheap DNS Setup for TikTok Domain Verification

## 📋 Your Domain Configuration

**Domain:** `phantomgear.it.com`
**Provider:** Namecheap
**TikTok Verification Code:** `tiktok-developers-site-verification=H2ZI9TEEsYMZx3AnzhuZMaOnNsm07t62`

## 🔧 Step-by-Step Namecheap DNS Setup

### 1. **Log into Namecheap Account**
1. Go to [namecheap.com](https://namecheap.com)
2. Click "Sign In" and log into your account
3. Navigate to "Domain List" from the left sidebar

### 2. **Access DNS Management**
1. Find your domain `phantomgear.it.com` in the list
2. Click the "Manage" button next to your domain
3. Click on the "Advanced DNS" tab

### 3. **Add TikTok Verification TXT Record**

**Click "Add New Record" and enter:**

```
Type: TXT Record
Host: @
Value: tiktok-developers-site-verification=H2ZI9TEEsYMZx3AnzhuZMaOnNsm07t62
TTL: Automatic (or 30 min)
```

**Detailed Steps:**
1. Click the "+ Add New Record" button
2. From the dropdown, select "TXT Record"
3. In the "Host" field, enter: `@` (this represents the root domain)
4. In the "Value" field, paste: `tiktok-developers-site-verification=H2ZI9TEEsYMZx3AnzhuZMaOnNsm07t62`
5. Leave TTL as "Automatic" (or set to 1800 seconds)
6. Click the green checkmark to save

### 4. **Verify Your Configuration**

Your DNS records should now include:
```
Host: @
Type: TXT Record
Value: tiktok-developers-site-verification=H2ZI9TEEsYMZx3AnzhuZMaOnNsm07t62
TTL: Automatic
```

### 5. **Wait for DNS Propagation**

**Typical Propagation Time:** 15-60 minutes
**Maximum Time:** Up to 24 hours

## 🧪 Test DNS Propagation

### **Command Line Testing:**
```bash
# Windows PowerShell
nslookup -type=TXT phantomgear.it.com

# Expected output should include:
# phantomgear.it.com text = "tiktok-developers-site-verification=H2ZI9TEEsYMZx3AnzhuZMaOnNsm07t62"
```

### **Online DNS Checker Tools:**
- [DNSChecker.org](https://dnschecker.org/) - Enter `phantomgear.it.com` and select "TXT"
- [WhatsMyDNS.net](https://whatsmydns.net/) - Check TXT records globally
- [NSLookup.io](https://www.nslookup.io/) - Quick DNS lookup tool

## ✅ Complete TikTok Verification

### **After DNS Propagation:**
1. Return to your TikTok Developer Dashboard
2. Go to your app settings
3. Find "Domain Verification" section
4. Enter domain: `phantomgear.it.com`
5. Click "Verify" button
6. ✅ Success! You now own all `*.phantomgear.it.com` subdomains

## 🌐 Verified Subdomains

Once verified, these URLs will be automatically trusted by TikTok:

- ✅ `phantomgear.it.com`
- ✅ `api.phantomgear.it.com`
- ✅ `dashboard.phantomgear.it.com`
- ✅ `www.phantomgear.it.com`
- ✅ `webhook.phantomgear.it.com`
- ✅ Any subdomain under `*.phantomgear.it.com`

## 🔄 Update Environment Variables

Update your `.env` file with your verified domain:

```env
# TikTok Production Configuration
TIKTOK_ENABLED=true
TIKTOK_WEBHOOK_URL=https://api.phantomgear.it.com/api/webhooks/tiktok
TIKTOK_CLIENT_KEY=your_production_client_key_here
TIKTOK_CLIENT_SECRET=your_production_client_secret_here
TIKTOK_WEBHOOK_SECRET=your_generated_webhook_secret_here
```

## 🚨 Troubleshooting

### **TXT Record Not Found:**
- Double-check the Host field is set to `@`
- Verify the Value field has the exact verification code
- Wait longer for DNS propagation (up to 24 hours)
- Try clearing DNS cache: `ipconfig /flushdns` (Windows)

### **Verification Still Failing:**
- Check for typos in the verification code
- Ensure no quotes are added around the TXT value
- Contact Namecheap support if DNS changes aren't saving
- Try adding the record again if it disappeared

### **Multiple TXT Records:**
- It's okay to have multiple TXT records on the same domain
- Don't delete existing TXT records unless you're sure they're not needed
- Each TXT record serves a different purpose (email, verification, etc.)

## 🎯 Next Steps

1. **✅ Add DNS TXT Record** - Follow steps above
2. **⏳ Wait for Propagation** - 15-60 minutes typically
3. **🧪 Test with DNS Checker** - Verify record is visible globally
4. **✅ Complete TikTok Verification** - Click verify in TikTok dashboard
5. **🚀 Deploy Your Webhook** - Use verified domain for webhook URLs

## 📞 Support Resources

- **Namecheap DNS Help:** [support.namecheap.com](https://support.namecheap.com)
- **TikTok Developer Portal:** [developers.tiktok.com](https://developers.tiktok.com)
- **DNS Propagation Checker:** [dnschecker.org](https://dnschecker.org)

---

## 🎊 You're All Set!

Once the DNS verification is complete, your TikTok app will be able to use:
- `https://api.phantomgear.it.com/api/webhooks/tiktok` for webhooks
- `https://phantomgear.it.com/auth/tiktok/callback` for OAuth
- Any other subdomains you need for your viral marketing system

Your Phantom Gear viral marketing automation is ready to dominate TikTok! 🚀🎮
