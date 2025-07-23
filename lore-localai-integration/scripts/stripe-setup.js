/**
 * 🔮 Lore Engine SaaS - Stripe Account Setup
 * Automatically creates products and prices in your Stripe account
 * Generated: July 18, 2025
 */

require('dotenv').config();
const Stripe = require('stripe');

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20'
});

// Base URL for webhooks
const baseUrl = process.env.NODE_ENV === 'production' 
  ? 'https://api.lore-engine.com'
  : `http://localhost:${process.env.PORT || 3000}`;

// Subscription tier configurations
const SUBSCRIPTION_TIERS = {
  starter: {
    name: '🌟 Lore Engine Starter',
    description: 'Perfect for indie creators and small projects',
    price: 999, // $9.99 in cents
    features: [
      '1,000 API calls per month',
      'Basic story generation',
      'Standard support',
      'Email notifications',
      'Basic analytics'
    ]
  },
  pro: {
    name: '⚡ Lore Engine Pro',
    description: 'For professional creators and growing teams',
    price: 2999, // $29.99 in cents
    features: [
      '10,000 API calls per month',
      'Advanced story generation',
      'Priority support',
      'Discord integration',
      'Advanced analytics',
      'Custom templates',
      'Viral tracking'
    ]
  },
  enterprise: {
    name: '🚀 Lore Engine Enterprise',
    description: 'For large teams and enterprise users',
    price: 9999, // $99.99 in cents
    features: [
      '100,000 API calls per month',
      'Unlimited story generation',
      'Dedicated support',
      'Custom integrations',
      'White-label options',
      'Advanced viral analytics',
      'Custom Discord bots',
      'Priority processing'
    ]
  }
};

async function createStripeProducts() {
  console.log('🔮 Setting up Stripe products for Lore Engine SaaS...\n');

  const results = {
    products: {},
    prices: {},
    webhookEndpoint: null
  };

  try {
    // Create products and prices for each tier
    for (const [tierKey, tierConfig] of Object.entries(SUBSCRIPTION_TIERS)) {
      console.log(`Creating ${tierConfig.name}...`);

      // Create product
      const product = await stripe.products.create({
        name: tierConfig.name,
        description: tierConfig.description,
        metadata: {
          tier: tierKey,
          features: tierConfig.features.join(', ')
        }
      });

      console.log(`✅ Product created: ${product.id}`);

      // Create recurring price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: tierConfig.price,
        currency: 'usd',
        recurring: {
          interval: 'month'
        },
        metadata: {
          tier: tierKey
        }
      });

      console.log(`✅ Price created: ${price.id}`);
      console.log(`   💰 ${tierConfig.name}: $${tierConfig.price / 100}/month\n`);

      results.products[tierKey] = product.id;
      results.prices[tierKey] = price.id;
    }

    // Create webhook endpoint
    console.log('Setting up webhook endpoint...');
    const webhookEndpoint = await stripe.webhookEndpoints.create({
      url: `${baseUrl}/api/stripe/webhook`,
      enabled_events: [
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
        'checkout.session.completed'
      ]
    });

    console.log(`✅ Webhook endpoint created: ${webhookEndpoint.id}`);
    console.log(`   🔗 URL: ${webhookEndpoint.url}`);
    
    results.webhookEndpoint = {
      id: webhookEndpoint.id,
      secret: webhookEndpoint.secret
    };

    // Generate .env updates
    console.log('\n🔧 Add these to your .env file:');
    console.log('=' .repeat(50));
    console.log(`STRIPE_BASIC_PRICE_ID=${results.prices.starter}`);
    console.log(`STRIPE_PRO_PRICE_ID=${results.prices.pro}`);
    console.log(`STRIPE_ENTERPRISE_PRICE_ID=${results.prices.enterprise}`);
    console.log(`STRIPE_WEBHOOK_SECRET=${results.webhookEndpoint.secret}`);
    console.log('=' .repeat(50));

    // Generate update script for .env
    const envUpdates = `
# Updated Stripe Configuration - ${new Date().toISOString()}
STRIPE_BASIC_PRICE_ID=${results.prices.starter}
STRIPE_PRO_PRICE_ID=${results.prices.pro}
STRIPE_ENTERPRISE_PRICE_ID=${results.prices.enterprise}
STRIPE_WEBHOOK_SECRET=${results.webhookEndpoint.secret}
`;

    // Write to a separate file
    const fs = require('fs');
    await fs.promises.writeFile('.env.stripe-update', envUpdates.trim());
    console.log('\n✅ Stripe configuration saved to .env.stripe-update');

    console.log('\n🎯 Next Steps:');
    console.log('1. Copy the price IDs and webhook secret to your .env file');
    console.log('2. Start your SaaS server: npm run dev');
    console.log('3. Test a subscription: http://localhost:3000');
    console.log('4. Monitor payments in Stripe Dashboard');

    console.log('\n🔮 Your automated revenue system is ready!');
    console.log('💰 "Plug in your account and watch it grow!"');

    return results;

  } catch (error) {
    console.error('❌ Error setting up Stripe:', error.message);
    
    if (error.code === 'api_key_invalid') {
      console.error('\n💡 Check your STRIPE_SECRET_KEY in .env file');
    }
    
    throw error;
  }
}

// Test Stripe connection
async function testStripeConnection() {
  try {
    console.log('🔍 Testing Stripe connection...');
    const account = await stripe.accounts.retrieve();
    console.log(`✅ Connected to Stripe account: ${account.email || account.id}`);
    console.log(`   Business name: ${account.business_profile?.name || 'Not set'}`);
    console.log(`   Country: ${account.country}`);
    console.log(`   Charges enabled: ${account.charges_enabled}`);
    console.log(`   Payouts enabled: ${account.payouts_enabled}\n`);
    return true;
  } catch (error) {
    console.error('❌ Stripe connection failed:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔮 Lore Engine SaaS - Stripe Setup\n');

  // Test connection first
  const connectionOk = await testStripeConnection();
  if (!connectionOk) {
    console.error('Please check your Stripe configuration and try again.');
    process.exit(1);
  }

  // Create products and prices
  await createStripeProducts();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createStripeProducts, testStripeConnection };
