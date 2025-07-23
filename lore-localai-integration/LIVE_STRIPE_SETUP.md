# 🚀 HAUNTED EMPIRE - LIVE STRIPE API SETUP GUIDE

## 🎯 Ready to Go Live!

Your Haunted Empire Stripe integration is ready for live API keys! Follow this guide to safely configure production payment processing.

---

## 📋 Quick Setup (Recommended)

### Option 1: Automated Setup
```bash
node setup-live-stripe.js
```
This interactive script will guide you through the entire setup process.

### Option 2: Manual Setup
1. Copy `stripe-live-config.env` to `.env`
2. Replace placeholder values with your live Stripe keys
3. Restart your services

---

## 🔑 Getting Your Stripe Keys

### 1. Access Stripe Dashboard
- Go to: https://dashboard.stripe.com/apikeys
- Make sure you're in **LIVE mode** (not Test mode)

### 2. Get Your Keys
You need these three keys:

**Secret Key (Server-side)**
```
sk_live_51ABC123...
```

**Publishable Key (Client-side)**  
```
pk_live_pk_live_51ABC123...
```

**Webhook Secret**
- Go to: https://dashboard.stripe.com/webhooks
- Add endpoint: `http://your-domain.com:8090/webhooks/stripe`
- Copy the signing secret: `whsec_ABC123...`

---

## ⚙️ Configuration Example

Create `.env` file in your project root:

```env
# === STRIPE LIVE API KEYS ===
STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_SECRET_HERE

# === CONFIGURATION ===
STRIPE_API_VERSION=2023-10-16
STRIPE_ENABLED=true
STRIPE_TEST_MODE=false
STRIPE_CURRENCY=usd

# === CREATOR TIER MULTIPLIERS ===
GHOST_MULTIPLIER=1.0
PHANTOM_MULTIPLIER=1.25
WRAITH_MULTIPLIER=1.5
DEMON_MULTIPLIER=2.0
```

---

## 🧪 Verification Steps

### 1. Test Your Keys
```bash
node verify-stripe-keys.js
```

### 2. Start Services
```bash
# Start all services
node creator-leaderboards.js    # Port 8085
node stripe-payment-service.js  # Port 8090  
node stripe-dashboard.js        # Port 3003
```

### 3. Check Service Status
- Creator API: http://localhost:8085/stats
- Payment API: http://localhost:8090/stats  
- Dashboard: http://localhost:3003

---

## 🔄 Webhook Configuration

### Required Webhook Events
Configure these events in your Stripe webhook:
- `payment_intent.succeeded`
- `customer.subscription.created`  
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### Webhook URL
```
http://your-domain.com:8090/webhooks/stripe
```

---

## 🧪 Testing Your Live Setup

### 1. Small Test Transaction
- Use a small amount ($1.00) for first test
- Check dashboard for real-time updates
- Verify creator revenue attribution

### 2. Creator Payment Flow
```bash
# Test payment creation
curl -X POST http://localhost:8085/creators/create-payment \\
  -H "Content-Type: application/json" \\
  -d '{"creator_id": "cr_001", "amount": 5.00, "description": "Test purchase"}'
```

### 3. Stripe Data Sync
```bash  
# Manually sync Stripe data
curl -X POST http://localhost:8085/creators/stripe-sync \\
  -H "Content-Type: application/json" \\
  -d '{}'
```

---

## 📊 Monitor Your Integration

### Real-time Analytics
- **Dashboard**: http://localhost:3003
- **Revenue tracking**: Automatic with tier multipliers
- **Creator payouts**: Calculated with pending amounts

### Stripe Dashboard Monitoring
- Payments: https://dashboard.stripe.com/payments
- Customers: https://dashboard.stripe.com/customers
- Webhooks: https://dashboard.stripe.com/webhooks

---

## 🛡️ Security Best Practices

### ✅ Environment Security
- Never commit `.env` file to version control
- Use different keys for development/production
- Regularly rotate webhook secrets

### ✅ API Key Management  
- Store keys in environment variables only
- Use principle of least privilege
- Monitor API key usage in Stripe

### ✅ Transaction Monitoring
- Set up Stripe radar for fraud detection
- Monitor unusual transaction patterns
- Implement rate limiting

---

## 🚨 Troubleshooting

### Common Issues

**❌ "Invalid API Key"**
- Check key format: `sk_live_` for live, `sk_test_` for test
- Verify key is copied completely
- Check account activation status

**❌ "Webhook Signature Invalid"**
- Verify webhook secret is correct
- Check webhook endpoint URL
- Ensure webhook is receiving POST requests

**❌ "Service Not Responding"**  
- Check if ports 8085, 8090, 3003 are available
- Verify services are running with `netstat -ano | findstr :808`
- Check console logs for errors

### Getting Help
1. Check service logs in terminal
2. Verify Stripe dashboard for errors
3. Test with curl commands
4. Review webhook delivery logs

---

## 🎉 You're Ready!

Once configured, your Haunted Empire will have:

✅ **Live Payment Processing** - Real Stripe API integration  
✅ **Creator Revenue Tracking** - Tier-based multipliers  
✅ **Real-time Analytics** - Live payment dashboard  
✅ **Webhook Processing** - Automatic event handling  
✅ **Secure Configuration** - Production-ready setup  

### 🚀 Launch Commands

```bash
# 1. Setup (one time)
node setup-live-stripe.js

# 2. Verify (before going live)  
node verify-stripe-keys.js

# 3. Start services
node creator-leaderboards.js &
node stripe-payment-service.js &  
node stripe-dashboard.js &

# 4. Check status
curl http://localhost:8085/stats
```

**Your Haunted Empire is ready to accept live payments! 👑💰**

---

*Generated by GitHub Copilot - Haunted Empire Phase IV*  
*Last Updated: ${new Date().toISOString().split('T')[0]}*
