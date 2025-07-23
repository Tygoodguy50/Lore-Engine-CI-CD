# 🔮 Stripe Account Setup Guide

## 📋 Complete Setup Checklist

### Step 1: Get Your Stripe API Keys 🔑

1. **Go to Stripe Dashboard**: [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. **Create account** if you don't have one (it's free!)
3. **Navigate to API Keys**: 
   - Click "Developers" in left sidebar
   - Click "API keys"
4. **Copy your keys**:
   - **Publishable key**: `pk_test_...` (for testing) or `pk_live_...` (for production)
   - **Secret key**: `sk_test_...` (for testing) or `sk_live_...` (for production)

### Step 2: Update Your .env File 📝

Open your `.env` file and replace these values:

```bash
# Replace these with your actual Stripe keys
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE
```

### Step 3: Run Automatic Setup 🤖

I've created a script that automatically sets up your products, prices, and webhooks:

```bash
# Install Stripe dependency first
npm install stripe

# Run the setup script
node setup-stripe.js
```

This script will:
- ✅ Create 3 subscription products (Starter $9.99, Pro $29.99, Enterprise $99.99)
- ✅ Generate price IDs for each tier
- ✅ Set up webhook endpoints for automated billing
- ✅ Give you the exact values to paste in your .env file

### Step 4: Set Up Discord Webhook (Optional but Recommended) 🎮

For viral marketing tracking:

1. **Create Discord server** or use existing one
2. **Go to channel settings** → Integrations → Webhooks
3. **Create New Webhook**
4. **Copy webhook URL** and add to .env:
   ```bash
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL
   ```

### Step 5: Test Your Setup 🧪

```bash
# Start your development server
npm run dev

# Test health endpoint
curl http://localhost:3000/health

# Test Stripe integration
curl -X POST http://localhost:3000/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{"priceId": "price_your_starter_price_id", "customerId": "test_customer"}'
```

### Step 6: Go Live! 🚀

When ready for production:

1. **Switch to live keys** in Stripe dashboard
2. **Update .env** with live keys (pk_live_... and sk_live_...)
3. **Set NODE_ENV=production**
4. **Deploy your server**

## 🎯 What You Get

After setup, your automated revenue system includes:

### 💳 **3-Tier Subscription Model**
- **Starter ($9.99/month)**: 1,000 API calls, Basic features
- **Pro ($29.99/month)**: 10,000 API calls, Advanced features  
- **Enterprise ($99.99/month)**: 100,000 API calls, All features

### 🔄 **Automated Billing**
- Stripe handles all payments automatically
- Webhook events trigger user provisioning
- Failed payments trigger access suspension
- Subscription changes update user limits instantly

### 🎬 **Viral Marketing Tracking**
- TikTok content creation → Discord notifications
- Signup events with referral tracking
- Revenue milestones and celebrations
- Real-time conversion analytics

### 🚀 **Auto-Provisioning**
- New subscribers get instant API access
- Usage limits enforced automatically  
- Rate limiting by subscription tier
- Seamless upgrade/downgrade flow

## 🆘 Troubleshooting

### "Authentication Error" 
- ❌ Check your Stripe secret key in .env
- ❌ Make sure you're using the right key (test vs live)

### "Webhook Not Receiving Events"
- ❌ Check webhook URL in Stripe dashboard
- ❌ Ensure your server is publicly accessible
- ❌ Verify webhook secret matches .env

### "Products Not Created"
- ❌ Check Stripe account is activated
- ❌ Verify you have permission to create products
- ❌ Ensure API key has write permissions

## 📞 Need Help?

- **Stripe Documentation**: [https://stripe.com/docs](https://stripe.com/docs)
- **Test with Stripe CLI**: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- **Check server logs** for detailed error messages

---

🔮 **"Your automated revenue system awaits!"** 

Once configured, every TikTok video, Discord signup, and viral referral can generate real revenue flowing directly to your bank account! 💰
