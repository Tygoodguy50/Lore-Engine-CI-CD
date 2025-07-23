#!/usr/bin/env node
/**
 * 🧪 Simple Stripe API Test
 */

const https = require('https');
require('dotenv').config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

console.log('🧪 Testing Stripe API Connection');
console.log('================================');
console.log('');

if (!STRIPE_SECRET_KEY) {
    console.log('❌ No STRIPE_SECRET_KEY found');
    process.exit(1);
}

console.log(`🔑 Using key: ${STRIPE_SECRET_KEY.substring(0, 15)}...${STRIPE_SECRET_KEY.slice(-4)}`);
console.log('');

// Test basic API connectivity
const options = {
    hostname: 'api.stripe.com',
    port: 443,
    path: '/v1/balance',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Stripe-Version': '2023-10-16',
        'User-Agent': 'HauntedEmpire/1.0'
    }
};

console.log('🔍 Making API request...');

const req = https.request(options, (res) => {
    let body = '';
    
    console.log(`📡 Response status: ${res.statusCode}`);
    console.log(`📋 Response headers:`, res.headers);
    
    res.on('data', (chunk) => {
        body += chunk;
    });
    
    res.on('end', () => {
        console.log('');
        console.log('📄 Response body:');
        console.log(body);
        
        try {
            const data = JSON.parse(body);
            
            if (res.statusCode === 200) {
                console.log('');
                console.log('✅ Success! API connection working');
                console.log('💰 Account balance:', data);
            } else {
                console.log('');
                console.log('❌ API Error:', data.error);
                if (data.error?.code === 'api_key_expired') {
                    console.log('💡 Your API key may have expired');
                } else if (data.error?.code === 'testmode_charges_only') {
                    console.log('💡 Account is in test mode only');
                } else if (data.error?.type === 'authentication_error') {
                    console.log('💡 Authentication failed - check key validity');
                }
            }
        } catch (parseError) {
            console.log('❌ Failed to parse response:', parseError.message);
        }
    });
});

req.on('error', (error) => {
    console.log('❌ Request failed:', error.message);
    if (error.code === 'ENOTFOUND') {
        console.log('💡 DNS resolution failed - check internet connection');
    } else if (error.code === 'ECONNREFUSED') {
        console.log('💡 Connection refused - check firewall/proxy');
    }
});

req.setTimeout(10000, () => {
    console.log('❌ Request timeout');
    req.destroy();
});

req.end();
