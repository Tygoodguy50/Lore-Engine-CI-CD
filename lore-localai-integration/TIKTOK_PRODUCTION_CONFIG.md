# 🎬 TikTok Production App Configuration Guide

## 📋 TikTok Developer App Settings

### 1. **App Basic Information**

**App Name:** `Phantom Gear Viral Tracker`
**App Description:** 
```
AI-powered viral marketing automation platform that tracks and amplifies 
user-generated content for gaming and technology communities. 
Automatically detects viral fragments, analyzes engagement metrics, and 
triggers cross-platform promotion for high-performing content.
```

**Category:** `Entertainment` or `Business Tools`
**App Icon:** Upload your Phantom Gear logo (512x512px PNG)
**Website URL:** `https://phantomgear.it.com`
**Privacy Policy URL:** `https://phantomgear.it.com/privacy`
**Terms of Service URL:** `https://phantomgear.it.com/terms`

### 1.5. **Domain Verification (DNS Method)**

**Domain to Verify:** `phantomgear.it.com`
**Verification Method:** DNS record
**Benefits:** Ownership of all URLs under the domain and its subdomains

**DNS Configuration Steps:**
1. **✅ Your TikTok verification code:** `tiktok-developers-site-verification=H2ZI9TEEsYMZx3AnzhuZMaOnNsm07t62`
2. Add a TXT record to your DNS settings:
   ```
   Type: TXT
   Name: @ (or root domain)
   Value: tiktok-developers-site-verification=H2ZI9TEEsYMZx3AnzhuZMaOnNsm07t62
   TTL: 3600 (or default)
   ```
3. Wait for DNS propagation (5-60 minutes)
4. Click "Verify" in TikTok Developer Dashboard

**Verified Domains Coverage:**
- ✅ `phantomgear.it.com`
- ✅ `api.phantomgear.it.com` 
- ✅ `dashboard.phantomgear.it.com`
- ✅ `www.phantomgear.it.com`
- ✅ All subdomains under `*.phantomgear.it.com`

### 2. **OAuth Settings (Login Kit)**

**Redirect URIs:**
```
https://api.phantomgear.it.com/auth/tiktok/callback
https://dashboard.phantomgear.it.com/auth/tiktok/callback
https://phantomgear.it.com/auth/tiktok/callback
```

**Required Scopes:**
- ✅ `user.info.basic` - Get basic user information
- ✅ `video.list` - Access user's video list
- ✅ `video.upload` - Track video uploads (if available)
- ✅ `user.info.profile` - Get user profile data
- ✅ `user.info.stats` - Get user statistics

### 3. **Webhook Configuration**

**Primary Webhook URL:**
```
https://api.phantomgear.it.com/api/webhooks/tiktok
```

**Backup Webhook URL:**
```
https://phantomgear.it.com/api/webhooks/tiktok
```

**Webhook Events to Subscribe:**
- ✅ `video.upload` - When users upload videos
- ✅ `video.analytics` - Performance metrics updates
- ✅ `user.follow` - New followers
- ✅ `video.share` - When content is shared
- ✅ `video.comment` - New comments (if available)
- ✅ `user.mention` - When your brand is mentioned

**Webhook Verification Token:**
Generate a secure random string for webhook verification:
```bash
# Generate a secure webhook secret
openssl rand -base64 32
```

## 🔐 Production Environment Variables

Update your production `.env` file with these values:

```env
# TikTok Production Configuration
TIKTOK_ENABLED=true
TIKTOK_WEBHOOK_URL=https://api.phantomgear.it.com/api/webhooks/tiktok

# Get these from your TikTok Developer Dashboard
TIKTOK_CLIENT_KEY=your_production_client_key_here
TIKTOK_CLIENT_SECRET=your_production_client_secret_here
TIKTOK_API_KEY=your_production_api_key_here
TIKTOK_WEBHOOK_SECRET=your_generated_webhook_secret_here

# Example format (replace with your actual values):
# TIKTOK_CLIENT_KEY=aw1234567890abcdef
# TIKTOK_CLIENT_SECRET=1234567890abcdef1234567890abcdef
# TIKTOK_API_KEY=tt_api_1234567890abcdef
# TIKTOK_WEBHOOK_SECRET=Xy9Kl2Mn8Qr5Tv6Wz3Bc7Df1Gh4Jk0P
```

## 🎯 App Permissions & Features

### **Required Permissions:**
1. **Video Data Access** - To track viral fragments
2. **User Profile Access** - For creator attribution
3. **Analytics Access** - Performance metrics
4. **Webhook Notifications** - Real-time event processing

### **App Features to Enable:**
- ✅ **Login Kit** - User authentication
- ✅ **Webhooks** - Real-time notifications
- ✅ **Research API** (if available) - Enhanced analytics
- ✅ **Business API** (if eligible) - Advanced features

## 📊 TikTok Business Verification

For enhanced features, consider TikTok Business verification:

**Business Information:**
- **Company Name:** `Phantom Gear LLC` (or your entity name)
- **Business Type:** `Technology/Software`
- **Industry:** `Gaming Technology`
- **Use Case:** `Viral Marketing Automation & Content Analytics`

**Required Documents:**
- Business registration certificate
- Tax ID documentation
- Company website verification
- Use case documentation

## Production Deployment Checklist

### **Before Going Live:**

- [ ] TikTok app approved and in production mode
- [ ] All webhook endpoints are HTTPS and publicly accessible
- [ ] Webhook signature verification is working
- [ ] Environment variables are set in production
- [ ] Discord notifications are configured
- [ ] Rate limiting is implemented
- [ ] Error handling and logging are in place
- [ ] Backup webhook URL is configured

### **Post-Deployment Verification:**

- [ ] Test webhook delivery with TikTok's webhook testing tool
- [ ] Verify signature verification is working
- [ ] Check Discord notifications are being sent
- [ ] Monitor webhook delivery success rates
- [ ] Test viral score calculation with real data
- [ ] Verify follow-up generation is triggering

## 🎬 Viral Fragment Tracking Setup


### **Hashtag Strategy:**

Configure your app to track these hashtags:

- `#phantomgear`
- `#phantomgearit`
- `#gamingtech`
- `#phantomtech`
- `#gearai`

utm_source=tiktok
utm_medium=viral_fragment
utm_campaign=phantom_gear_viral
fragment_id=frag_[unique_id]
tracking_code=tk_[unique_code]

### **Tracking Parameters:**

Your viral fragments should include these UTM parameters:

```env
utm_source=tiktok
utm_medium=viral_fragment
utm_campaign=phantom_gear_viral
fragment_id=frag_[unique_id]
tracking_code=tk_[unique_code]
```

## 📈 Analytics Dashboard Integration


**Metrics to Track:**

- Video upload frequency
- Viral score distribution
- Engagement rate trends
- Conversion attribution
- Revenue impact from TikTok traffic


**KPIs to Monitor:**

- Webhook delivery success rate (>95%)
- Average viral score of tracked content
- Time to viral detection (should be <5 minutes)
- Follow-up generation rate for high-scoring content

## 🔐 Security Best Practices


### **Webhook Security:**

- Always verify TikTok's signature on incoming webhooks
- Use HTTPS for all webhook endpoints
- Implement rate limiting (max 1000 requests/hour)
- Log all webhook events for audit trail


### **API Security:**

- Store all secrets in environment variables
- Use different credentials for staging vs production
- Rotate webhook secrets quarterly
- Monitor for suspicious activity patterns

## 🛠️ Troubleshooting Common Issues


### **Webhook Not Receiving Events:**

1. Verify your webhook URL is publicly accessible
2. Check HTTPS certificate is valid
3. Ensure webhook returns 200 status for TikTok's test requests
4. Verify app is in production mode (not sandbox)


### **Signature Verification Failing:**

1. Check `TIKTOK_WEBHOOK_SECRET` matches TikTok dashboard
2. Verify request body is being read correctly
3. Ensure no middleware is modifying the request body
4. Check for encoding issues (UTF-8)


### **Missing Events:**

1. Verify all required events are subscribed in TikTok dashboard
2. Check user has granted necessary permissions
3. Ensure content meets TikTok's webhook trigger criteria
4. Verify app has not hit rate limits

## 📞 Support Resources


- **TikTok Developer Portal:** <https://developers.tiktok.com>
- **TikTok Developer Community:** <https://developers.tiktok.com/community>
- **Webhook Documentation:** <https://developers.tiktok.com/doc/webhooks>
- **API Rate Limits:** <https://developers.tiktok.com/doc/rate-limits>

---

## 🎊 Ready for Production

Once you've configured all these settings, your TikTok viral marketing automation will be ready to:

1. **Track viral fragments** in real-time
2. **Calculate viral scores** automatically
3. **Generate follow-up content** suggestions
4. **Send Discord notifications** for all events
5. **Attribute revenue** back to TikTok sources
6. **Scale viral content** across platforms

Your complete viral marketing funnel from TikTok to bank account is ready! 🚀🎬
