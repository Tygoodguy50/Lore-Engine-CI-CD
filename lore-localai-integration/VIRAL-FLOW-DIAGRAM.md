# 🔮 Lore Engine SaaS - Complete Viral Revenue Flow

## 🎬 TikTok Fragment → 📧 Signup → 💰 Revenue Flow Diagram

```
🎬 TikTok Creator                 📱 TikTok Viewer                🌐 Lore Engine Platform
┌─────────────────┐              ┌─────────────────┐             ┌──────────────────────┐
│                 │              │                 │             │                      │
│ 1. Creates      │              │ 2. Sees content │             │ 3. Visits signup     │
│    content with │─────────────▶│    with referral│────────────▶│    page with ref     │
│    referral     │              │    code         │             │    code              │
│    code         │              │                 │             │                      │
└─────────────────┘              └─────────────────┘             └──────────────────────┘
         │                                │                                 │
         │                                │                                 │
         ▼                                ▼                                 ▼
🎯 Discord Embed                  📊 View Tracking              💳 Stripe Checkout
┌─────────────────┐              ┌─────────────────┐             ┌──────────────────────┐
│ "New TikTok     │              │ Fragment views  │             │ Subscription with    │
│  Fragment       │              │ increment       │             │ referral discount    │
│  Created!"      │              │                 │             │                      │
└─────────────────┘              └─────────────────┘             └──────────────────────┘
                                           │                                 │
                                           │                                 │
                                           ▼                                 ▼
                                  📧 Signup Event                  🔔 Stripe Webhook
                                  ┌─────────────────┐             ┌──────────────────────┐
                                  │ Email + Ref +   │             │ Payment success      │
                                  │ TikTok Fragment │             │ triggers             │
                                  │ ID tracked      │             │ provisioning         │
                                  └─────────────────┘             └──────────────────────┘
                                           │                                 │
                                           │                                 │
                                           ▼                                 ▼
                                  🎮 Discord Embed                🚀 User Provisioning
                                  ┌─────────────────┐             ┌──────────────────────┐
                                  │ "TikTok to      │             │ • API key generation │
                                  │  Signup Flow!"  │             │ • Access permissions │
                                  └─────────────────┘             │ • Usage limits set   │
                                                                  └──────────────────────┘
                                                                           │
                                                                           │
                                                                           ▼
                                                                  🎉 Complete Flow Embed
                                                                  ┌──────────────────────┐
                                                                  │ "VIRAL SUCCESS!"     │
                                                                  │ TikTok→Signup→💰    │
                                                                  │ Revenue Generated!   │
                                                                  └──────────────────────┘
```

## 🔄 API Endpoint Flow

### 1. 🎬 TikTok Fragment Creation
```bash
POST /api/discord/tiktok-fragment
{
  "userId": "creator123",
  "content": "🔮 Just discovered Lore Engine - it's like having a AI narrative assistant that prevents plot holes! Use my code LORE_ABC123 for 20% off! #LoreEngine #AI #WritingTools",
  "hashtags": ["#LoreEngine", "#AI", "#WritingTools", "#IndieGame"],
  "referralCode": "LORE_ABC123"
}

Response:
{
  "success": true,
  "fragmentId": "tt_1642534567890_abc123def",
  "trackingUrl": "https://lore-engine.com/signup?ref=LORE_ABC123&tt=tt_1642534567890_abc123def"
}
```

### 2. 📧 Signup Event Tracking
```bash
POST /api/discord/signup-event
{
  "email": "newuser@example.com",
  "referralCode": "LORE_ABC123",
  "source": "tiktok",
  "fragmentId": "tt_1642534567890_abc123def"
}

Response:
{
  "success": true,
  "message": "Signup tracked successfully",
  "viralFlow": "tiktok_to_signup"
}
```

### 3. 💳 Stripe Checkout (with referral)
```bash
POST /api/stripe/checkout
{
  "priceId": "price_architect_monthly",
  "email": "newuser@example.com",
  "referralCode": "LORE_ABC123",
  "metadata": {
    "source": "tiktok",
    "fragmentId": "tt_1642534567890_abc123def"
  }
}

Response:
{
  "url": "https://checkout.stripe.com/pay/cs_live_...",
  "sessionId": "cs_live_...",
  "referralBonus": 20
}
```

### 4. 🔔 Stripe Webhook Processing
```bash
# Stripe sends webhook to /api/stripe/webhook
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_live_...",
      "customer": "cus_...",
      "subscription": "sub_...",
      "metadata": {
        "referralCode": "LORE_ABC123",
        "source": "tiktok",
        "fragmentId": "tt_1642534567890_abc123def"
      }
    }
  }
}
```

### 5. 🚀 Provisioning Complete
```bash
POST /api/discord/provisioning-complete
{
  "userId": "user_456",
  "email": "newuser@example.com",
  "subscriptionTier": "architect",
  "apiKey": "lore_sk_abcd1234...",
  "referralCode": "LORE_ABC123",
  "source": "tiktok"
}

Response:
{
  "success": true,
  "message": "Provisioning completion tracked",
  "viralFlow": "complete_tiktok_flow"
}
```

## 🎮 Discord Embed Progression

### Phase 1: TikTok Content Created
```json
{
  "title": "🎬 New TikTok Fragment Created!",
  "description": "A user just created viral content for Lore Engine",
  "color": 16711760,
  "fields": [
    {"name": "👤 Creator", "value": "creator123"},
    {"name": "📝 Content Preview", "value": "🔮 Just discovered Lore Engine - it's like having a AI narrative assistant..."},
    {"name": "🔗 Referral Code", "value": "LORE_ABC123"}
  ]
}
```

### Phase 2: TikTok → Signup
```json
{
  "title": "🎬➡️📧 TikTok to Signup Flow!",
  "description": "Someone discovered Lore Engine through TikTok and signed up!",
  "color": 16711760,
  "fields": [
    {"name": "📧 New User", "value": "newuser@example.com"},
    {"name": "🌐 Source", "value": "TIKTOK"},
    {"name": "🎬 Original Content", "value": "🔮 Just discovered Lore Engine..."},
    {"name": "👀 Fragment Views", "value": "1"}
  ]
}
```

### Phase 3: Complete Viral Flow
```json
{
  "title": "🎉 VIRAL SUCCESS! TikTok Content Converted to Revenue!",
  "description": "🎬➡️📧➡️💰 Complete viral flow achieved!",
  "color": 16766720,
  "fields": [
    {"name": "🎬 Original TikTok Content", "value": "🔮 Just discovered Lore Engine..."},
    {"name": "💰 Revenue Generated", "value": "$29.99/month"},
    {"name": "📊 Conversion Rate", "value": "100.00%"},
    {"name": "🔗 Referral Bonus", "value": "$5.99 commission"}
  ]
}
```

## 📊 Analytics Dashboard

### GET /api/discord/analytics Response
```json
{
  "tiktokFragments": 5,
  "totalViews": 150,
  "tiktokSignups": 12,
  "referralSignups": 8,
  "conversionRate": "8.00",
  "topPerformingFragments": [
    {
      "id": "tt_1642534567890_abc123def",
      "content": "🔮 Just discovered Lore Engine - it's like having...",
      "views": 50,
      "hashtags": ["#LoreEngine", "#AI", "#WritingTools"]
    }
  ],
  "recentSignups": [
    {
      "email": "newuser@example.com",
      "source": "tiktok",
      "hasReferral": true,
      "isViral": true
    }
  ]
}
```

## 🎯 Revenue Automation Benefits

### 💰 Direct Revenue Impact
- **Automated customer acquisition** through viral TikTok content
- **Referral bonuses** incentivize content creation
- **Real-time tracking** from content to revenue
- **Zero manual intervention** required

### 📊 Viral Analytics
- **Conversion tracking** from TikTok views to paid subscribers
- **Content performance** analysis for optimization
- **Referral ROI** calculation and commission tracking
- **Real-time Discord notifications** for team visibility

### 🚀 Scalable Growth Engine
- **User-generated content** drives acquisition
- **Automated provisioning** ensures instant access
- **Viral coefficient tracking** for growth optimization
- **Revenue attribution** to specific content pieces

## 🔮 The Complete Automated Revenue Machine

This system creates a **fully automated revenue pipeline** where:

1. **Content Creators** make TikTok videos with referral codes
2. **Viewers** discover Lore Engine and sign up with discounts
3. **Stripe** processes payments automatically
4. **Users** get instant API access and provisioning
5. **Referrers** earn commissions automatically
6. **Revenue** flows directly to your bank account
7. **Discord** keeps you informed of every conversion

**Result**: A self-sustaining viral growth engine that converts social media engagement into recurring subscription revenue with zero manual intervention! 🚀💰
