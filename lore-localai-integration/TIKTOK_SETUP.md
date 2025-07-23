# 🎬 TikTok Webhook Integration Setup Guide

This guide will help you set up TikTok webhooks for your viral marketing funnel automation.

## 📋 Prerequisites

1. **TikTok for Developers Account**: Register at [developers.tiktok.com](https://developers.tiktok.com)
2. **TikTok Business Account**: Required for webhook access
3. **Public HTTPS Endpoint**: Your webhook URL must be publicly accessible and use HTTPS

## 🔧 Setup Steps

### 1. Register Your TikTok App

1. Go to [TikTok for Developers](https://developers.tiktok.com)
2. Click "Manage apps" → "Create an app"
3. Fill in your app details:
   - **App name**: "Haunted Engine Viral Tracker"
   - **App description**: "AI-powered viral marketing automation"
   - **Category**: "Entertainment" or "Business Tools"

### 2. Configure OAuth Settings

1. In your app dashboard, go to "Login Kit"
2. Add your redirect URI: `https://your-domain.com/auth/tiktok/callback`
3. Select required scopes:
   - `user.info.basic`
   - `video.list`
   - `video.upload` (if available)

### 3. Set Up Webhooks

1. Navigate to "Webhooks" in your app dashboard
2. Add webhook endpoint: `https://your-domain.com/api/webhooks/tiktok`
3. Select events to subscribe to:
   - ✅ **Video Upload** - Track when users upload content
   - ✅ **Video Analytics** - Get performance metrics
   - ✅ **User Follow** - Track new followers
   - ✅ **Video Share** - Monitor viral sharing

### 4. Configure Environment Variables

Update your `.env` file with your TikTok app credentials:

```env
# TikTok Integration
TIKTOK_ENABLED=true
TIKTOK_WEBHOOK_URL=https://your-domain.com/api/webhooks/tiktok
TIKTOK_API_KEY=your_tiktok_api_key_here
TIKTOK_CLIENT_KEY=your_app_client_key
TIKTOK_CLIENT_SECRET=your_app_client_secret
TIKTOK_WEBHOOK_SECRET=your_webhook_verification_secret
```

## 🎯 Available Webhook Events

### Video Upload Event
```json
{
  "event": "video.upload",
  "timestamp": 1642780800000,
  "data": {
    "user_id": "user123",
    "video_id": "video456",
    "username": "haunted_creator",
    "video_url": "https://tiktok.com/@user/video/123",
    "video_title": "Amazing AI Horror Story!",
    "hashtags": ["#hauntedengine", "#ai", "#horror"],
    "tracking_params": {
      "fragment_id": "frag_123",
      "tracking_code": "tk_viral_456"
    }
  }
}
```

### Analytics Update Event
```json
{
  "event": "video.analytics",
  "timestamp": 1642784400000,
  "data": {
    "video_id": "video456",
    "view_count": 15000,
    "like_count": 2500,
    "comment_count": "150",
    "share_count": 400,
    "engagement_rate": 0.195
  }
}
```

## 🚀 Testing Your Integration

### 1. Test Webhook Endpoint

```bash
# Test webhook connectivity
curl -X GET https://your-domain.com/api/webhooks/tiktok/status

# Test webhook verification
curl -X GET "https://your-domain.com/api/webhooks/tiktok/verify?challenge=test123"
```

### 2. Send Test Event

```bash
# Send test webhook event
curl -X POST https://your-domain.com/api/webhooks/tiktok/test \
  -H "Content-Type: application/json"
```

### 3. Manual Fragment Tracking

```bash
# Track a viral fragment manually
curl -X POST https://your-domain.com/api/webhooks/tiktok/track-fragment \
  -H "Content-Type: application/json" \
  -d '{
    "video_url": "https://tiktok.com/@user/video/123",
    "fragment_id": "frag_test_123",
    "username": "test_creator",
    "tracking_code": "tk_manual_456"
  }'
```

## 🔐 Security Considerations

### Webhook Signature Verification
Every webhook request includes an `X-TikTok-Signature` header that should be verified:

```javascript
// Verification is handled automatically by the verifyTikTokSignature middleware
const signature = req.headers['x-tiktok-signature'];
const isValid = tiktokWebhookService.verifyWebhookSignature(payload, signature);
```

### Rate Limiting
- TikTok webhooks are rate-limited
- Implement exponential backoff for retries
- Monitor webhook delivery success rates

## 📊 Viral Marketing Automation Features

### 🎬 Fragment Tracking
- Automatically detect videos using your tracking codes
- Monitor hashtag usage (`#hauntedengine`, `#loreengine`)
- Track viral coefficient and engagement rates

### 🚀 Auto-Response System
- **Viral Score ≥ 7.0**: Boost content promotion
- **Viral Score ≥ 8.0**: Generate follow-up fragments
- **High Engagement**: Alert marketing team via Discord

### 📈 Analytics Dashboard
- Real-time performance metrics
- Conversion attribution from TikTok to signups
- Revenue tracking from viral content

## 🎯 Integration with Viral Funnel

The TikTok webhook seamlessly integrates with your existing viral marketing funnel:

1. **TikTok Video Upload** → Webhook detects viral fragment
2. **Analytics Updates** → Track performance metrics
3. **High Viral Score** → Trigger automated actions:
   - Generate follow-up content ideas
   - Boost cross-platform promotion
   - Alert Discord channel
   - Create landing page variations

## 🔄 Webhook Event Flow

```
TikTok User Uploads Video
        ↓
TikTok Sends Webhook
        ↓
Signature Verification
        ↓
Process Event Type
        ↓
Update Analytics Dashboard
        ↓
Check Viral Potential
        ↓
Trigger Automated Actions
        ↓
Discord Notifications
        ↓
Revenue Attribution
```

## 🛠️ Troubleshooting

### Common Issues

1. **Webhook Not Receiving Events**
   - Verify HTTPS certificate
   - Check TikTok app webhook configuration
   - Ensure endpoint returns 200 status

2. **Signature Verification Failed**
   - Verify `TIKTOK_WEBHOOK_SECRET` is correct
   - Check request body is being read properly
   - Ensure timing attacks protection

3. **Missing Analytics Data**
   - Verify app has analytics permissions
   - Check user granted required scopes
   - Ensure business account is connected

### Debug Commands

```bash
# Check webhook status
curl https://your-domain.com/api/webhooks/tiktok/status

# View recent webhook logs
tail -f logs/tiktok-webhooks.log

# Test Discord integration
node viral-funnel-demo.js
```

## 📚 Additional Resources

- [TikTok for Developers Documentation](https://developers.tiktok.com/doc/)
- [TikTok Business API](https://business-api.tiktok.com/)
- [Webhook Best Practices](https://developers.tiktok.com/doc/webhooks-getting-started/)

## 🎉 Success Metrics

Once configured, you should see:

- ✅ Real-time TikTok video upload notifications in Discord
- ✅ Automated viral score calculations
- ✅ Follow-up fragment generation for high-performing content
- ✅ Complete funnel attribution from TikTok → Revenue

Your viral marketing automation is now connected to TikTok! 🚀🎬
