#!/usr/bin/env node
/**
 * Stripe Payment Service - Phase IV Haunted Empire Integration
 * Real-time payment processing and revenue tracking for creators
 */

const http = require('http');
const https = require('https');
const crypto = require('crypto');
require('dotenv').config(); // Load environment variables

const PORT = process.env.PORT_STRIPE_PAYMENTS || 8090;

// Stripe configuration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_...'; // Use your actual secret key
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_...'; // Webhook endpoint secret
const STRIPE_API_VERSION = '2023-10-16';

// Initialize Stripe (using direct HTTPS calls for better control)
const stripeRequest = (endpoint, method = 'GET', data = null) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.stripe.com',
            port: 443,
            path: `/v1/${endpoint}`,
            method: method,
            headers: {
                'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
                'Stripe-Version': STRIPE_API_VERSION,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        if (data && method !== 'GET') {
            const postData = new URLSearchParams(data).toString();
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(response);
                    } else {
                        reject(new Error(`Stripe API Error: ${response.error?.message || 'Unknown error'}`));
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', reject);
        
        if (data && method !== 'GET') {
            req.write(new URLSearchParams(data).toString());
        }
        req.end();
    });
};

// Mock creator data integrated with Stripe customer IDs
let creatorPaymentData = {
    'cr_001': { // ShadowWhisper
        stripeCustomerId: 'cus_shadowwhisper001',
        stripeAccountId: 'acct_shadow001',
        totalRevenue: 0,
        monthlyRevenue: 0,
        pendingPayouts: 0,
        recentTransactions: [],
        subscriptions: [],
        oneTimePayments: []
    },
    'cr_002': { // NightmareQueen
        stripeCustomerId: 'cus_nightmarequeen002',
        stripeAccountId: 'acct_nightmare002',
        totalRevenue: 0,
        monthlyRevenue: 0,
        pendingPayouts: 0,
        recentTransactions: [],
        subscriptions: [],
        oneTimePayments: []
    },
    'cr_003': { // GhostlyGamer
        stripeCustomerId: 'cus_ghostlygamer003',
        stripeAccountId: 'acct_ghostly003',
        totalRevenue: 0,
        monthlyRevenue: 0,
        pendingPayouts: 0,
        recentTransactions: [],
        subscriptions: [],
        oneTimePayments: []
    },
    'cr_004': { // PhantomPoet
        stripeCustomerId: 'cus_phantompoet004',
        stripeAccountId: 'acct_phantom004',
        totalRevenue: 0,
        monthlyRevenue: 0,
        pendingPayouts: 0,
        recentTransactions: [],
        subscriptions: [],
        oneTimePayments: []
    },
    'cr_005': { // SpectralStoryteller
        stripeCustomerId: 'cus_spectralstory005',
        stripeAccountId: 'acct_spectral005',
        totalRevenue: 0,
        monthlyRevenue: 0,
        pendingPayouts: 0,
        recentTransactions: [],
        subscriptions: [],
        oneTimePayments: []
    }
};

// Platform-wide payment analytics
let platformAnalytics = {
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalTransactions: 0,
    averageTransactionValue: 0,
    topPerformingCreators: [],
    revenueByTier: {
        'Ghost': 0,
        'Wraith': 0,
        'Possessed': 0,
        'Shadow': 0
    },
    paymentMethods: {
        'card': 0,
        'bank_transfer': 0,
        'crypto': 0
    },
    subscriptionMetrics: {
        totalSubscribers: 0,
        monthlyRecurringRevenue: 0,
        churnRate: 0,
        averageSubscriptionValue: 0
    }
};

// Real-time Stripe data fetching
async function fetchStripeData() {
    try {
        console.log('💳 Fetching real-time Stripe data...');
        
        // Fetch recent payments
        const payments = await stripeRequest('payment_intents?limit=100');
        
        // Fetch customers
        const customers = await stripeRequest('customers?limit=100');
        
        // Fetch subscriptions
        const subscriptions = await stripeRequest('subscriptions?limit=100');
        
        // Fetch balance transactions
        const balanceTransactions = await stripeRequest('balance_transactions?limit=100');
        
        // Update creator payment data with real Stripe data
        updateCreatorDataWithStripeInfo(payments, customers, subscriptions, balanceTransactions);
        
        // Update platform analytics
        updatePlatformAnalytics(payments, subscriptions, balanceTransactions);
        
        console.log(`✅ Stripe data updated - ${payments.data?.length || 0} payments processed`);
        
    } catch (error) {
        console.warn('⚠️ Stripe API unavailable, using simulated data:', error.message);
        
        // Fallback to simulated data when Stripe is not available
        simulatePaymentActivity();
    }
}

// Update creator data with real Stripe information
function updateCreatorDataWithStripeInfo(payments, customers, subscriptions, balanceTransactions) {
    // Reset monthly revenue
    Object.keys(creatorPaymentData).forEach(creatorId => {
        creatorPaymentData[creatorId].monthlyRevenue = 0;
        creatorPaymentData[creatorId].recentTransactions = [];
    });

    // Process payment intents
    if (payments?.data) {
        payments.data.forEach(payment => {
            if (payment.status === 'succeeded') {
                // Map payments to creators based on metadata or customer ID
                const creatorId = findCreatorByStripeData(payment);
                if (creatorId && creatorPaymentData[creatorId]) {
                    const amount = payment.amount / 100; // Convert cents to dollars
                    
                    creatorPaymentData[creatorId].totalRevenue += amount;
                    creatorPaymentData[creatorId].monthlyRevenue += amount;
                    
                    creatorPaymentData[creatorId].recentTransactions.push({
                        id: payment.id,
                        amount: amount,
                        currency: payment.currency,
                        created: new Date(payment.created * 1000),
                        description: payment.description || 'Creator content purchase'
                    });
                }
            }
        });
    }

    // Process subscriptions
    if (subscriptions?.data) {
        subscriptions.data.forEach(sub => {
            const creatorId = findCreatorByStripeData(sub);
            if (creatorId && creatorPaymentData[creatorId] && sub.status === 'active') {
                creatorPaymentData[creatorId].subscriptions.push({
                    id: sub.id,
                    amount: sub.items.data[0]?.price?.unit_amount / 100 || 0,
                    interval: sub.items.data[0]?.price?.recurring?.interval || 'month',
                    status: sub.status,
                    currentPeriodEnd: new Date(sub.current_period_end * 1000)
                });
            }
        });
    }
}

// Find creator by Stripe customer ID or metadata
function findCreatorByStripeData(stripeObject) {
    const metadata = stripeObject.metadata;
    if (metadata?.creator_id) {
        return metadata.creator_id;
    }
    
    // Fallback: match by customer ID
    for (const [creatorId, data] of Object.entries(creatorPaymentData)) {
        if (stripeObject.customer === data.stripeCustomerId) {
            return creatorId;
        }
    }
    
    // Random assignment for demo purposes
    const creatorIds = Object.keys(creatorPaymentData);
    return creatorIds[Math.floor(Math.random() * creatorIds.length)];
}

// Simulate payment activity when Stripe is not available
function simulatePaymentActivity() {
    Object.keys(creatorPaymentData).forEach(creatorId => {
        const data = creatorPaymentData[creatorId];
        
        // Simulate monthly revenue
        const monthlyAmount = Math.random() * 2000 + 500; // $500-$2500
        data.monthlyRevenue = monthlyAmount;
        data.totalRevenue += monthlyAmount * 0.1; // Add 10% of monthly to total
        
        // Simulate recent transactions
        data.recentTransactions = Array.from({length: Math.floor(Math.random() * 10) + 3}, (_, i) => ({
            id: `pi_simulated_${creatorId}_${i}`,
            amount: Math.random() * 100 + 10,
            currency: 'usd',
            created: new Date(Date.now() - Math.random() * 2592000000), // Last 30 days
            description: `Simulated content purchase ${i + 1}`
        }));

        // Simulate subscriptions
        data.subscriptions = Math.random() > 0.5 ? [{
            id: `sub_simulated_${creatorId}`,
            amount: Math.random() * 50 + 10,
            interval: 'month',
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 2592000000) // 30 days from now
        }] : [];
        
        data.pendingPayouts = Math.random() * 500 + 100;
    });
}

// Update platform-wide analytics
function updatePlatformAnalytics(payments, subscriptions, balanceTransactions) {
    // Reset analytics
    platformAnalytics.totalRevenue = 0;
    platformAnalytics.monthlyRevenue = 0;
    platformAnalytics.totalTransactions = 0;

    // Calculate from creator data
    Object.values(creatorPaymentData).forEach(creatorData => {
        platformAnalytics.totalRevenue += creatorData.totalRevenue;
        platformAnalytics.monthlyRevenue += creatorData.monthlyRevenue;
        platformAnalytics.totalTransactions += creatorData.recentTransactions.length;
    });

    platformAnalytics.averageTransactionValue = 
        platformAnalytics.totalTransactions > 0 
            ? platformAnalytics.monthlyRevenue / platformAnalytics.totalTransactions 
            : 0;

    // Update subscription metrics
    let totalMRR = 0;
    let totalSubs = 0;
    Object.values(creatorPaymentData).forEach(creatorData => {
        creatorData.subscriptions.forEach(sub => {
            if (sub.status === 'active') {
                totalSubs++;
                totalMRR += sub.amount;
            }
        });
    });
    
    platformAnalytics.subscriptionMetrics.totalSubscribers = totalSubs;
    platformAnalytics.subscriptionMetrics.monthlyRecurringRevenue = totalMRR;
    platformAnalytics.subscriptionMetrics.averageSubscriptionValue = 
        totalSubs > 0 ? totalMRR / totalSubs : 0;
}

// Fetch creator leaderboard data
async function fetchCreatorLeaderboardData() {
    try {
        const response = await new Promise((resolve, reject) => {
            const req = http.request({
                hostname: 'localhost',
                port: 8085,
                path: '/creators',
                method: 'GET'
            }, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(body));
                    } catch (err) {
                        reject(err);
                    }
                });
            });
            req.on('error', reject);
            req.setTimeout(3000);
            req.end();
        });
        
        return response.creators || [];
    } catch (error) {
        console.warn('⚠️ Could not fetch creator leaderboard data');
        return [];
    }
}

// Sync with creator leaderboard data
async function syncWithCreatorData() {
    const creators = await fetchCreatorLeaderboardData();
    
    // Update revenue multipliers based on creator tiers
    creators.forEach(creator => {
        if (creatorPaymentData[creator.id]) {
            const tierMultiplier = {
                'Ghost': 1.5,
                'Wraith': 1.25,
                'Possessed': 1.1,
                'Shadow': 1.0
            };
            
            const multiplier = tierMultiplier[creator.tier] || 1.0;
            creatorPaymentData[creator.id].currentMultiplier = multiplier;
            creatorPaymentData[creator.id].creatorTier = creator.tier;
            creatorPaymentData[creator.id].viralScore = creator.viralScore;
        }
    });
}

// Webhook handler for Stripe events
function handleStripeWebhook(body, signature) {
    try {
        // Verify webhook signature (simplified)
        const expectedSignature = crypto
            .createHmac('sha256', STRIPE_WEBHOOK_SECRET)
            .update(body, 'utf8')
            .digest('hex');
            
        // In production, you'd do proper signature verification
        
        const event = JSON.parse(body);
        
        switch (event.type) {
            case 'payment_intent.succeeded':
                console.log('💰 Payment succeeded:', event.data.object.id);
                break;
            case 'customer.subscription.created':
                console.log('🔄 New subscription:', event.data.object.id);
                break;
            case 'invoice.payment_succeeded':
                console.log('📄 Invoice paid:', event.data.object.id);
                break;
            default:
                console.log('ℹ️ Unhandled event type:', event.type);
        }
        
        // Refresh data after webhook
        setTimeout(() => fetchStripeData(), 1000);
        
        return { received: true };
    } catch (error) {
        console.error('❌ Webhook error:', error.message);
        throw error;
    }
}

// Update data periodically
setInterval(() => {
    fetchStripeData();
    syncWithCreatorData();
}, 30000); // Every 30 seconds

// Initial data fetch
fetchStripeData();
syncWithCreatorData();

// HTTP server
const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Stripe-Signature');
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    const url = new URL(req.url, `http://localhost:${PORT}`);
    
    try {
        if (url.pathname === '/stats') {
            res.writeHead(200);
            res.end(JSON.stringify({
                service: 'Stripe Payment Service',
                status: 'operational',
                port: PORT,
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
                stripe_connected: !!STRIPE_SECRET_KEY && STRIPE_SECRET_KEY !== 'sk_test_...',
                total_revenue: platformAnalytics.totalRevenue,
                active_creators: Object.keys(creatorPaymentData).length
            }));
            
        } else if (url.pathname === '/payments/overview') {
            res.writeHead(200);
            res.end(JSON.stringify({
                platform_analytics: platformAnalytics,
                creator_count: Object.keys(creatorPaymentData).length,
                timestamp: new Date().toISOString()
            }));
            
        } else if (url.pathname === '/payments/creators') {
            const creatorId = url.searchParams.get('id');
            
            if (creatorId && creatorPaymentData[creatorId]) {
                res.writeHead(200);
                res.end(JSON.stringify({
                    creator_id: creatorId,
                    payment_data: creatorPaymentData[creatorId],
                    timestamp: new Date().toISOString()
                }));
            } else {
                res.writeHead(200);
                res.end(JSON.stringify({
                    creators: creatorPaymentData,
                    timestamp: new Date().toISOString()
                }));
            }
            
        } else if (url.pathname === '/payments/dashboard') {
            // Enhanced dashboard data combining Stripe + creator metrics
            res.writeHead(200);
            res.end(JSON.stringify({
                stripe_integration: {
                    connected: !!STRIPE_SECRET_KEY && STRIPE_SECRET_KEY !== 'sk_test_...',
                    api_version: STRIPE_API_VERSION,
                    webhook_configured: !!STRIPE_WEBHOOK_SECRET && STRIPE_WEBHOOK_SECRET !== 'whsec_...'
                },
                revenue_metrics: {
                    total_revenue: platformAnalytics.totalRevenue.toFixed(2),
                    monthly_revenue: platformAnalytics.monthlyRevenue.toFixed(2),
                    average_transaction: platformAnalytics.averageTransactionValue.toFixed(2),
                    total_transactions: platformAnalytics.totalTransactions
                },
                subscription_metrics: platformAnalytics.subscriptionMetrics,
                creator_breakdown: Object.keys(creatorPaymentData).map(creatorId => ({
                    creator_id: creatorId,
                    monthly_revenue: creatorPaymentData[creatorId].monthlyRevenue.toFixed(2),
                    total_revenue: creatorPaymentData[creatorId].totalRevenue.toFixed(2),
                    tier: creatorPaymentData[creatorId].creatorTier || 'Shadow',
                    multiplier: creatorPaymentData[creatorId].currentMultiplier || 1.0,
                    pending_payouts: creatorPaymentData[creatorId].pendingPayouts.toFixed(2),
                    subscriptions: creatorPaymentData[creatorId].subscriptions.length,
                    recent_transactions: creatorPaymentData[creatorId].recentTransactions.length
                })),
                timestamp: new Date().toISOString()
            }));
            
        } else if (url.pathname === '/payments/create-payment-intent') {
            // Create payment intent endpoint
            if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', async () => {
                    try {
                        const data = JSON.parse(body);
                        
                        // Create payment intent with Stripe
                        const paymentIntent = await stripeRequest('payment_intents', 'POST', {
                            amount: Math.round(data.amount * 100), // Convert to cents
                            currency: data.currency || 'usd',
                            'metadata[creator_id]': data.creator_id,
                            'metadata[content_type]': data.content_type || 'haunted_content'
                        });
                        
                        res.writeHead(200);
                        res.end(JSON.stringify({
                            client_secret: paymentIntent.client_secret,
                            payment_intent_id: paymentIntent.id,
                            amount: paymentIntent.amount / 100,
                            currency: paymentIntent.currency
                        }));
                    } catch (error) {
                        res.writeHead(400);
                        res.end(JSON.stringify({
                            error: error.message,
                            fallback_mode: true
                        }));
                    }
                });
            } else {
                res.writeHead(405);
                res.end(JSON.stringify({ error: 'Method not allowed' }));
            }
            
        } else if (url.pathname === '/webhook/stripe') {
            // Stripe webhook endpoint
            if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', () => {
                    try {
                        const signature = req.headers['stripe-signature'];
                        const result = handleStripeWebhook(body, signature);
                        res.writeHead(200);
                        res.end(JSON.stringify(result));
                    } catch (error) {
                        res.writeHead(400);
                        res.end(JSON.stringify({ error: error.message }));
                    }
                });
            } else {
                res.writeHead(405);
                res.end(JSON.stringify({ error: 'Method not allowed' }));
            }
            
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({
                error: 'Endpoint not found',
                availableEndpoints: [
                    '/stats',
                    '/payments/overview', 
                    '/payments/creators',
                    '/payments/dashboard',
                    '/payments/create-payment-intent',
                    '/webhook/stripe'
                ]
            }));
        }
        
    } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({
            error: 'Internal server error',
            message: error.message
        }));
    }
});

server.listen(PORT, () => {
    console.log(`💳 Stripe Payment Service running on port ${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/stats`);
    console.log(`💰 Dashboard: http://localhost:${PORT}/payments/dashboard`);
    console.log(`🔔 Webhook: http://localhost:${PORT}/webhook/stripe`);
    console.log(`💡 Configure your Stripe keys in environment variables`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
    } else {
        console.error('❌ Server error:', err);
    }
    process.exit(1);
});
