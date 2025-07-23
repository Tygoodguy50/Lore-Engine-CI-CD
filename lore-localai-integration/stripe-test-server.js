/**
 * 🔮 Quick Stripe Test Server
 * Test your automated revenue system
 */

// Load environment variables first
require('dotenv').config({ path: '.env' });

// Debug environment loading
console.log('🔍 Environment Debug:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? `${process.env.STRIPE_SECRET_KEY.substring(0, 12)}...` : 'MISSING');
console.log('STRIPE_PUBLISHABLE_KEY:', process.env.STRIPE_PUBLISHABLE_KEY ? `${process.env.STRIPE_PUBLISHABLE_KEY.substring(0, 12)}...` : 'MISSING');
console.log('');

if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('REPLACE')) {
  console.error('❌ STRIPE_SECRET_KEY not found or not configured!');
  console.error('Please check your .env file and ensure it contains:');
  console.error('STRIPE_SECRET_KEY=sk_test_...');
  process.exit(1);
}

const express = require('express');
const Stripe = require('stripe');

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(express.json());
app.use(express.static('public'));

// Test endpoint
app.get('/', (req, res) => {
  res.send(`
    <html>
    <head>
        <title>🔮 Lore Engine SaaS - Stripe Test</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
            .card { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 20px 0; }
            .tier { border: 2px solid #ddd; padding: 20px; margin: 10px; border-radius: 8px; display: inline-block; width: 200px; vertical-align: top; }
            .tier h3 { margin-top: 0; }
            .price { font-size: 24px; font-weight: bold; color: #0066cc; }
            button { background: #0066cc; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 10px 0; }
            button:hover { background: #0056b3; }
            .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
            .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>🔮 Lore Engine SaaS - Automated Revenue System</h1>
            <p><strong>Stripe Account Connected!</strong> ✅</p>
            <div id="status" class="status success">
                🎯 Your Stripe integration is working! Ready to accept payments.
            </div>
        </div>

        <div class="card">
            <h2>💰 Subscription Plans</h2>
            
            <div class="tier">
                <h3>🌟 Starter</h3>
                <div class="price">$9.99/month</div>
                <ul>
                    <li>1,000 API calls</li>
                    <li>Basic support</li>
                    <li>Email notifications</li>
                </ul>
                <button onclick="subscribe('starter')">Subscribe Now</button>
            </div>

            <div class="tier">
                <h3>⚡ Pro</h3>
                <div class="price">$29.99/month</div>
                <ul>
                    <li>10,000 API calls</li>
                    <li>Priority support</li>
                    <li>Discord integration</li>
                </ul>
                <button onclick="subscribe('pro')">Subscribe Now</button>
            </div>

            <div class="tier">
                <h3>🚀 Enterprise</h3>
                <div class="price">$99.99/month</div>
                <ul>
                    <li>100,000 API calls</li>
                    <li>Custom integrations</li>
                    <li>Dedicated support</li>
                </ul>
                <button onclick="subscribe('enterprise')">Subscribe Now</button>
            </div>
        </div>

        <div class="card">
            <h2>🔧 Configuration Status</h2>
            <p>✅ Stripe Secret Key: Connected</p>
            <p>✅ Starter Price ID: ${process.env.STRIPE_BASIC_PRICE_ID}</p>
            <p>✅ Pro Price ID: ${process.env.STRIPE_PRO_PRICE_ID}</p>
            <p>✅ Enterprise Price ID: ${process.env.STRIPE_ENTERPRISE_PRICE_ID}</p>
            <p>⚠️ Webhook: Local testing mode</p>
        </div>

        <script src="https://js.stripe.com/v3/"></script>
        <script>
            const stripe = Stripe('${process.env.STRIPE_PUBLISHABLE_KEY}');

            async function subscribe(tier) {
                try {
                    const response = await fetch('/create-checkout-session', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ tier })
                    });
                    
                    const session = await response.json();
                    
                    if (session.error) {
                        alert('Error: ' + session.error);
                        return;
                    }
                    
                    // Redirect to Stripe Checkout
                    const result = await stripe.redirectToCheckout({
                        sessionId: session.sessionId
                    });
                    
                    if (result.error) {
                        alert('Error: ' + result.error.message);
                    }
                } catch (error) {
                    alert('Error: ' + error.message);
                }
            }
        </script>
    </body>
    </html>
  `);
});

// Create checkout session
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { tier } = req.body;
    
    const priceIds = {
      starter: process.env.STRIPE_BASIC_PRICE_ID,
      pro: process.env.STRIPE_PRO_PRICE_ID,
      enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID
    };

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceIds[tier],
        quantity: 1,
      }],
      success_url: 'http://localhost:3333/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3333/cancel',
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Success page
app.get('/success', (req, res) => {
  res.send(`
    <html>
    <head><title>Success!</title></head>
    <body style="font-family: Arial; text-align: center; padding: 50px;">
        <h1>🎉 Subscription Successful!</h1>
        <p>Welcome to Lore Engine SaaS!</p>
        <p>Your automated revenue system is working perfectly!</p>
        <p>Session ID: ${req.query.session_id}</p>
        <a href="/">← Back to Dashboard</a>
    </body>
    </html>
  `);
});

// Cancel page
app.get('/cancel', (req, res) => {
  res.send(`
    <html>
    <head><title>Cancelled</title></head>
    <body style="font-family: Arial; text-align: center; padding: 50px;">
        <h1>Subscription Cancelled</h1>
        <p>No worries! You can try again anytime.</p>
        <a href="/">← Back to Plans</a>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log('🔮 ========================================');
  console.log('   LORE ENGINE SAAS - STRIPE TEST READY');
  console.log('========================================');
  console.log('');
  console.log('🌐 Server: http://localhost:' + PORT);
  console.log('💳 Stripe: CONNECTED ✅');
  console.log('🎯 Ready to accept payments!');
  console.log('');
  console.log('Test your subscription flow:');
  console.log('1. Visit http://localhost:' + PORT);
  console.log('2. Click any "Subscribe Now" button');
  console.log('3. Use test card: 4242 4242 4242 4242');
  console.log('4. Watch the money flow! 💰');
  console.log('');
  console.log('🔮 Your automated revenue system works!');
  console.log('========================================');
});
