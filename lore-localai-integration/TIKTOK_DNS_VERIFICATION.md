# 🌐 TikTok Domain Verification - DNS Setup Guide

## 📋 Domain Verification Overview

**Domain to Verify:** `hauntedengine.com`
**Verification Method:** DNS record (TXT)
**Benefits:** Ownership verification for all URLs under the domain and subdomains

## 🔧 DNS Configuration Steps

### 1. Get Verification Code from TikTok
1. Go to your TikTok Developer Dashboard
2. Navigate to your app settings
3. Find "Domain Verification" section
4. Enter your domain: `hauntedengine.com`
5. Select "DNS record" as verification method
6. **✅ Your TikTok verification code:**
   ```
   tiktok-developers-site-verification=302v8fvobC9RzTVNRi5FZrIsn8xvAioo
   ```

### 2. Add TXT Record to Your DNS

**DNS Record Details:**
```
Type: TXT
Name: @ (root domain) or hauntedengine.com
Value: tiktok-developers-site-verification=302v8fvobC9RzTVNRi5FZrIsn8xvAioo
TTL: 3600 seconds (1 hour)
```

### 3. DNS Provider Instructions

#### **Cloudflare:**
1. Log into Cloudflare dashboard
2. Select your domain: `hauntedengine.com`
3. Go to DNS > Records
4. Click "Add record"
5. Type: `TXT`
6. Name: `@`
7. Content: `tiktok-developers-site-verification=302v8fvobC9RzTVNRi5FZrIsn8xvAioo`
8. TTL: `Auto` or `3600`
9. Click "Save"

#### **GoDaddy:**
1. Log into GoDaddy account
2. Go to My Products > DNS
3. Select your domain
4. Click "Add" in DNS Records
5. Type: `TXT`
6. Host: `@`
7. Value: `tiktok-developers-site-verification=302v8fvobC9RzTVNRi5FZrIsn8xvAioo`
8. TTL: `1 Hour`
9. Click "Save"

#### **Namecheap:**
1. Log into Namecheap account
2. Go to Domain List > Manage
3. Advanced DNS tab
4. Add New Record
5. Type: `TXT Record`
6. Host: `@`
7. Value: `tiktok-developers-site-verification=302v8fvobC9RzTVNRi5FZrIsn8xvAioo`
8. TTL: `Automatic`
9. Save changes

#### **Route 53 (AWS):**
1. Go to Route 53 console
2. Select hosted zone for `hauntedengine.com`
3. Create record
4. Record type: `TXT`
5. Name: leave blank (root domain)
6. Value: `"tiktok-developers-site-verification=302v8fvobC9RzTVNRi5FZrIsn8xvAioo"`
7. TTL: `300`
8. Create records

### 4. Verify DNS Propagation

**Check DNS propagation using command line:**
```bash
# Check TXT record
nslookup -type=TXT hauntedengine.com

# Or using dig
dig TXT hauntedengine.com

# Expected output should include:
# hauntedengine.com. 3600 IN TXT "tiktok-developers-site-verification=302v8fvobC9RzTVNRi5FZrIsn8xvAioo"
```

**Online DNS Checker Tools:**
- https://dnschecker.org/
- https://whatsmydns.net/
- https://www.nslookup.io/

### 5. Complete Verification in TikTok

1. Wait for DNS propagation (5-60 minutes)
2. Return to TikTok Developer Dashboard
3. Click "Verify" button
4. TikTok will check for the TXT record
5. Upon success, you'll see "Domain Verified" status

## ✅ Verified Domain Benefits

Once verified, you'll have ownership of:

- ✅ `hauntedengine.com`
- ✅ `www.hauntedengine.com`
- ✅ `api.hauntedengine.com`
- ✅ `dashboard.hauntedengine.com`
- ✅ `webhooks.hauntedengine.com`
- ✅ All subdomains: `*.hauntedengine.com`

## 🎯 Webhook URLs Now Allowed

With domain verification, these webhook URLs are automatically trusted:

```
✅ https://hauntedengine.com/api/webhooks/tiktok
✅ https://api.hauntedengine.com/api/webhooks/tiktok
✅ https://dashboard.hauntedengine.com/api/webhooks/tiktok
✅ https://webhooks.hauntedengine.com/tiktok
```

## 🔄 Redirect URI Updates

Your OAuth redirect URIs are also automatically verified:

```
✅ https://hauntedengine.com/auth/tiktok/callback
✅ https://api.hauntedengine.com/auth/tiktok/callback
✅ https://dashboard.hauntedengine.com/auth/tiktok/callback
```

## 🛠️ Troubleshooting

### DNS Record Not Found
- Wait longer for propagation (up to 48 hours)
- Check TTL is not too high (use 3600 or less)
- Verify record was added correctly
- Try different DNS checker tools

### Verification Failing
- Ensure exact match of verification code
- No extra spaces or quotes in TXT record
- Record name should be `@` or root domain
- Clear browser cache and try again

### Record Already Exists
- Some providers don't allow duplicate TXT records
- Combine values: `"existing-txt-value" "tiktok-site-verification=abc123"`
- Or remove existing record temporarily

## 📞 Support Resources

- **TikTok Developer Support:** https://developers.tiktok.com/help/
- **DNS Propagation Checker:** https://dnschecker.org/
- **TikTok Domain Verification Docs:** https://developers.tiktok.com/doc/domain-verification/

---

## 🎊 Domain Verification Complete!

Once your domain is verified, your TikTok app will have enhanced trust and security, allowing seamless webhook and OAuth integration across all your subdomains! 🚀🌐
