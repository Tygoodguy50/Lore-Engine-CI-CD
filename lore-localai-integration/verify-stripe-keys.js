#!/usr/bin/env node
/**
 * 🧪 Stripe Live API Key Verification Tool
 * Test your live Stripe keys before full deployment
 */

const https = require('https');
require('dotenv').config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

console.log('🧪 Stripe Live API Key Verification');
console.log('===================================');
console.log('');

if (!STRIPE_SECRET_KEY) {
    console.log('❌ No STRIPE_SECRET_KEY found in environment');
    console.log('   Run: node setup-live-stripe.js to configure');
    process.exit(1);
}

if (!STRIPE_SECRET_KEY.startsWith('sk_live_')) {
    console.log('⚠️  Warning: Using test key, not live key');
} else {
    console.log('✅ Live key detected');
}

console.log(`🔑 Key: ${STRIPE_SECRET_KEY.substring(0, 12)}...`);
console.log('');

// Test Stripe API connection
function testStripeAPI() {
    return new Promise((resolve, reject) => {
        console.log('🔍 Testing Stripe API connection...');
        
        const options = {
            hostname: 'api.stripe.com',
            port: 443,
            path: '/v1/balance',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
                'Stripe-Version': '2023-10-16'
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    
                    if (res.statusCode === 200) {
                        console.log('✅ Stripe API connection successful!');
                        console.log('');
                        console.log('💰 Account Balance:');
                        
                        data.available.forEach(balance => {
                            const amount = (balance.amount / 100).toFixed(2);
                            console.log(`   ${balance.currency.toUpperCase()}: $${amount}`);
                        });
                        
                        data.pending.forEach(balance => {
                            const amount = (balance.amount / 100).toFixed(2);
                            console.log(`   Pending ${balance.currency.toUpperCase()}: $${amount}`);
                        });
                        
                        resolve(data);
                    } else {
                        console.log('❌ Stripe API Error:');
                        console.log(`   Status: ${res.statusCode}`);
                        console.log(`   Message: ${data.error?.message || 'Unknown error'}`);
                        reject(new Error(data.error?.message || 'API Error'));
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.log('❌ Network error:', error.message);
            reject(error);
        });

        req.setTimeout(10000, () => {
            console.log('❌ Request timeout');
            reject(new Error('Timeout'));
        });

        req.end();
    });
}

// Test webhook configuration
function testWebhookConfig() {
    console.log('');
    console.log('🪝 Webhook Configuration Check:');
    
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret && webhookSecret.startsWith('whsec_')) {
        console.log('✅ Webhook secret configured');
        console.log(`   Secret: ${webhookSecret.substring(0, 12)}...`);
    } else {
        console.log('⚠️  Webhook secret not configured');
        console.log('   Add STRIPE_WEBHOOK_SECRET to your .env file');
    }
    
    console.log('');
    console.log('📋 Required webhook events:');
    const requiredEvents = [
        'payment_intent.succeeded',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed'
    ];
    
    requiredEvents.forEach(event => {
        console.log(`   • ${event}`);
    });
    
    console.log('');
    console.log('🌐 Configure webhook endpoint in Stripe Dashboard:');
    console.log('   URL: http://your-domain.com:8090/webhooks/stripe');
}

// Test creator tier multipliers
function testTierMultipliers() {
    console.log('');
    console.log('🎯 Creator Tier Multipliers:');
    
    const multipliers = {
        Ghost: process.env.GHOST_MULTIPLIER || '1.0',
        Phantom: process.env.PHANTOM_MULTIPLIER || '1.25', 
        Wraith: process.env.WRAITH_MULTIPLIER || '1.5',
        Demon: process.env.DEMON_MULTIPLIER || '2.0'
    };
    
    Object.entries(multipliers).forEach(([tier, multiplier]) => {
        console.log(`   ${tier}: ${multiplier}x revenue`);
    });
}

// Service status check
function checkServices() {
    console.log('');
    console.log('🚀 Service Configuration:');
    console.log(`   Creator Leaderboards: Port ${process.env.PORT_CREATOR_LEADERBOARDS || '8085'}`);
    console.log(`   Stripe Payments: Port ${process.env.PORT_STRIPE_PAYMENTS || '8090'}`);
    console.log(`   Analytics Dashboard: Port ${process.env.PORT_STRIPE_DASHBOARD || '3003'}`);
    console.log('');
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Test Mode: ${process.env.STRIPE_TEST_MODE === 'true' ? 'Enabled' : 'Disabled'}`);
    console.log(`   Currency: ${process.env.STRIPE_CURRENCY || 'usd'}`);
}

// Main verification
async function verify() {
    try {
        await testStripeAPI();
        testWebhookConfig();
        testTierMultipliers();
        checkServices();
        
        console.log('');
        console.log('🎉 Verification Complete!');
        console.log('');
        console.log('📋 Next Steps:');
        console.log('1. Test with a small transaction');
        console.log('2. Monitor the analytics dashboard');
        console.log('3. Check webhook deliveries in Stripe');
        console.log('4. Verify creator revenue calculations');
        console.log('');
        console.log('🔗 Quick Links:');
        console.log('   • Analytics: http://localhost:3003');
        console.log('   • API Status: http://localhost:8090/stats');
        console.log('   • Stripe Dashboard: https://dashboard.stripe.com');
        
    } catch (error) {
        console.log('');
        console.log('❌ Verification failed:', error.message);
        console.log('');
        console.log('🔧 Troubleshooting:');
        console.log('1. Check your API key is correct and active');
        console.log('2. Ensure your Stripe account is activated');
        console.log('3. Verify network connectivity');
        console.log('4. Check account permissions');
        process.exit(1);
    }
}

verify();
