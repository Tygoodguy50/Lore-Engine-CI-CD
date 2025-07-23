#!/usr/bin/env node

/**
 * 🔮 Stripe Account Setup Script
 * Automatically creates products and prices for Lore Engine SaaS
 * Run this after adding your Stripe API keys to .env
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

const products = [
  {
    name: '🔮 Lore Engine - Starter',
    description: 'Perfect for indie creators and small projects. Get started with AI-powered storytelling.',
    price: 999, // $9.99 in cents
    interval: 'month',
    features: [
      '1,000 API calls per month',
      'Basic story generation',
      'Standard support',
      'Discord community access'
    ]
  },
  {
    name: '🔮 Lore Engine - Pro',
    description: 'For professional creators and growing businesses. Advanced features and priority support.',
    price: 2999, // $29.99 in cents
    interval: 'month',
    features: [
      '10,000 API calls per month',
      'Advanced story generation',
      'Conflict detection',
      'Priority support',
      'Custom webhooks'
    ]
  },
  {
    name: '🔮 Lore Engine - Enterprise',
    description: 'For large teams and enterprises. Unlimited power with custom integrations.',
    price: 9999, // $99.99 in cents
    interval: 'month',
    features: [
      '100,000 API calls per month',
      'All features included',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantees'
    ]
  }
];

async function setupStripeAccount() {
  console.log('🔮 Setting up Stripe account for Lore Engine SaaS...\n');

  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('REPLACE')) {
    console.error('❌ Please add your Stripe secret key to .env file first!');
    console.log('📝 Edit .env and replace STRIPE_SECRET_KEY with your actual key from Stripe dashboard.');
    process.exit(1);
  }

  const priceIds = {};

  try {
    for (const productData of products) {
      console.log(`📦 Creating product: ${productData.name}`);
      
      // Create product
      const product = await stripe.products.create({
        name: productData.name,
        description: productData.description,
        metadata: {
          features: productData.features.join(', '),
          created_by: 'lore_engine_saas_setup'
        }
      });

      console.log(`✅ Product created: ${product.id}`);

      // Create price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: productData.price,
        currency: 'usd',
        recurring: {
          interval: productData.interval
        },
        metadata: {
          tier: productData.name.toLowerCase().includes('starter') ? 'basic' :
                productData.name.toLowerCase().includes('pro') ? 'pro' : 'enterprise'
        }
      });

      console.log(`💰 Price created: ${price.id} ($${productData.price / 100}/${productData.interval})\n`);

      // Store price ID for later
      const tier = productData.name.toLowerCase().includes('starter') ? 'BASIC' :
                   productData.name.toLowerCase().includes('pro') ? 'PRO' : 'ENTERPRISE';
      priceIds[`STRIPE_${tier}_PRICE_ID`] = price.id;
    }

    // Create webhook endpoint
    console.log('🪝 Setting up webhook endpoint...');
    const webhook = await stripe.webhookEndpoints.create({
      url: `${process.env.BASE_URL || 'http://localhost:3000'}/api/stripe/webhook`,
      enabled_events: [
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
        'checkout.session.completed'
      ],
      metadata: {
        created_by: 'lore_engine_saas_setup'
      }
    });

    console.log(`✅ Webhook created: ${webhook.id}`);
    console.log(`🔗 Webhook URL: ${webhook.url}`);
    console.log(`🔑 Webhook Secret: ${webhook.secret}\n`);

    // Output configuration
    console.log('🎯 SUCCESS! Your Stripe account is configured.');
    console.log('📝 Update your .env file with these values:\n');
    
    Object.entries(priceIds).forEach(([key, value]) => {
      console.log(`${key}=${value}`);
    });
    console.log(`STRIPE_WEBHOOK_SECRET=${webhook.secret}\n`);

    console.log('🚀 Next steps:');
    console.log('1. Copy the price IDs above to your .env file');
    console.log('2. Copy the webhook secret to your .env file');
    console.log('3. Start your SaaS server: npm run dev');
    console.log('4. Test with: curl http://localhost:3000/health\n');

    console.log('🔮 Your automated revenue system is ready!');
    console.log('"Plug in an account and watch it grow" 💰');

  } catch (error) {
    console.error('❌ Error setting up Stripe:', error.message);
    
    if (error.type === 'StripeAuthenticationError') {
      console.log('🔑 Please check your Stripe API key in .env file');
    } else if (error.type === 'StripePermissionError') {
      console.log('🔒 Please check your Stripe account permissions');
    }
    
    process.exit(1);
  }
}

// Run setup
setupStripeAccount();
