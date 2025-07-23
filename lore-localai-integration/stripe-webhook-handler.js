/**
 * 🪝 Stripe Webhook Handler with Discord Integration
 * Automated notifications for subscription events
 * Generated: July 18, 2025
 */

const express = require('express');
const Stripe = require('stripe');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Import Discord service (assuming it's compiled or using ts-node)
let discordService;
try {
  const discordModule = require('./src/services/discord.service');
  discordService = discordModule.discordService;
} catch (error) {
  console.warn('⚠️ Could not load Discord service. Discord notifications disabled.');
}

// Middleware for Stripe webhook verification
app.use('/webhook', express.raw({ type: 'application/json' }));

/**
 * Stripe webhook endpoint with Discord notifications
 */
app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  if (!sig) {
    console.error('❌ Missing Stripe signature');
    return res.status(400).send('Missing signature');
  }

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err}`);
  }

  console.log(`📨 Received Stripe webhook event: ${event.type}`);

  try {
    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'customer.created':
        await handleCustomerCreated(event.data.object);
        break;

      default:
        console.log(`🔍 Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    
    // Send Discord alert for webhook processing errors
    if (discordService) {
      await discordService.notifySystemAlert({
        level: 'error',
        title: 'Stripe Webhook Error',
        message: `Failed to process webhook event: ${event.type}`,
        service: 'Stripe Integration',
      });
    }

    res.status(500).send('Webhook processing failed');
  }
});

/**
 * Handle new subscription creation
 */
async function handleSubscriptionCreated(subscription) {
  console.log('💰 New subscription created:', subscription.id);

  try {
    // Get customer details
    const customer = await stripe.customers.retrieve(subscription.customer);
    const customerEmail = customer.email || 'Unknown';

    // Get plan name from price ID
    const planName = getPlanNameFromPriceId(subscription.items.data[0]?.price.id);

    // Send Discord notification
    if (discordService) {
      await discordService.notifySubscriptionEvent({
        type: 'created',
        customerEmail,
        plan: planName,
        amount: subscription.items.data[0]?.price.unit_amount || 0,
        currency: subscription.items.data[0]?.price.currency || 'usd',
      });
    }

    console.log('✅ Subscription created notification sent to Discord');
  } catch (error) {
    console.error('❌ Error handling subscription creation:', error);
  }
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(subscription) {
  console.log('🔄 Subscription updated:', subscription.id);

  try {
    const customer = await stripe.customers.retrieve(subscription.customer);
    const customerEmail = customer.email || 'Unknown';

    const planName = getPlanNameFromPriceId(subscription.items.data[0]?.price.id);

    if (discordService) {
      await discordService.notifySubscriptionEvent({
        type: 'updated',
        customerEmail,
        plan: planName,
        amount: subscription.items.data[0]?.price.unit_amount || 0,
        currency: subscription.items.data[0]?.price.currency || 'usd',
      });
    }

    console.log('✅ Subscription updated notification sent to Discord');
  } catch (error) {
    console.error('❌ Error handling subscription update:', error);
  }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCancelled(subscription) {
  console.log('❌ Subscription cancelled:', subscription.id);

  try {
    const customer = await stripe.customers.retrieve(subscription.customer);
    const customerEmail = customer.email || 'Unknown';

    const planName = getPlanNameFromPriceId(subscription.items.data[0]?.price.id);

    if (discordService) {
      await discordService.notifySubscriptionEvent({
        type: 'cancelled',
        customerEmail,
        plan: planName,
      });
    }

    console.log('✅ Subscription cancelled notification sent to Discord');
  } catch (error) {
    console.error('❌ Error handling subscription cancellation:', error);
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice) {
  console.log('💳 Payment succeeded:', invoice.id);

  // Only notify for subscription payments, not one-time charges
  if (invoice.subscription) {
    try {
      const customer = await stripe.customers.retrieve(invoice.customer);
      const customerEmail = customer.email || 'Unknown';

      console.log(`✅ Payment of $${(invoice.amount_paid / 100).toFixed(2)} received from ${customerEmail}`);
    } catch (error) {
      console.error('❌ Error handling payment success:', error);
    }
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice) {
  console.log('⚠️ Payment failed:', invoice.id);

  try {
    const customer = await stripe.customers.retrieve(invoice.customer);
    const customerEmail = customer.email || 'Unknown';

    if (discordService) {
      await discordService.notifySubscriptionEvent({
        type: 'payment_failed',
        customerEmail,
        plan: 'Unknown Plan',
        amount: invoice.amount_due,
        currency: invoice.currency,
      });
    }

    console.log('✅ Payment failed notification sent to Discord');
  } catch (error) {
    console.error('❌ Error handling payment failure:', error);
  }
}

/**
 * Handle new customer creation
 */
async function handleCustomerCreated(customer) {
  console.log('👤 New customer created:', customer.id);

  try {
    if (discordService) {
      await discordService.notifyUserRegistration({
        email: customer.email || 'Unknown',
        plan: 'Free Trial', // Default for new customers
        signupMethod: 'Stripe Checkout',
      });
    }

    console.log('✅ New customer notification sent to Discord');
  } catch (error) {
    console.error('❌ Error handling customer creation:', error);
  }
}

/**
 * Get plan name from Stripe price ID
 */
function getPlanNameFromPriceId(priceId) {
  if (!priceId) return 'Unknown Plan';

  if (priceId === process.env.STRIPE_BASIC_PRICE_ID) return 'Starter Plan';
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'Pro Plan';
  if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) return 'Enterprise Plan';

  return 'Custom Plan';
}

// Add health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Stripe Webhook Handler',
    timestamp: new Date().toISOString(),
    discord: !!process.env.DISCORD_WEBHOOK_URL,
    stripe: !!process.env.STRIPE_SECRET_KEY,
  });
});

// Start server
const PORT = process.env.WEBHOOK_PORT || 3001;
app.listen(PORT, () => {
  console.log(`🪝 Stripe webhook handler running on port ${PORT}`);
  console.log(`🎮 Discord notifications: ${process.env.DISCORD_WEBHOOK_URL ? 'Enabled' : 'Disabled'}`);
  console.log(`📍 Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️ STRIPE_SECRET_KEY not configured!');
  }
  
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn('⚠️ STRIPE_WEBHOOK_SECRET not configured!');
  }
});

module.exports = app;
