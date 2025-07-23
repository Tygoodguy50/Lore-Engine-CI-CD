#!/usr/bin/env node
/**
 * 🔐 Stripe Live API Key Setup Utility
 * Securely configure your Haunted Empire with live Stripe integration
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🔐 Haunted Empire - Stripe Live Configuration Setup');
console.log('================================================');
console.log('');
console.log('⚠️  SECURITY WARNING: This will configure LIVE Stripe keys!');
console.log('   Only proceed if you are ready for real payments.');
console.log('');

function askQuestion(question) {
    return new Promise(resolve => rl.question(question, resolve));
}

async function setupStripeKeys() {
    try {
        console.log('📋 Please provide your Stripe API keys from https://dashboard.stripe.com/apikeys');
        console.log('');

        // Get Stripe keys
        const secretKey = await askQuestion('🔑 Enter your LIVE secret key (sk_live_...): ');
        if (!secretKey.startsWith('sk_live_')) {
            console.log('❌ Invalid secret key format. Must start with sk_live_');
            process.exit(1);
        }

        const publishableKey = await askQuestion('🔑 Enter your LIVE publishable key (pk_live_...): ');
        if (!publishableKey.startsWith('pk_live_')) {
            console.log('❌ Invalid publishable key format. Must start with pk_live_');
            process.exit(1);
        }

        const webhookSecret = await askQuestion('🪝 Enter your webhook secret (whsec_...): ');
        if (!webhookSecret.startsWith('whsec_')) {
            console.log('❌ Invalid webhook secret format. Must start with whsec_');
            process.exit(1);
        }

        console.log('');
        console.log('⚙️  Additional Configuration:');

        const currency = await askQuestion('💰 Currency code (default: usd): ') || 'usd';
        const minAmount = await askQuestion('📉 Minimum transaction amount in cents (default: 50): ') || '50';
        const maxAmount = await askQuestion('📈 Maximum transaction amount in cents (default: 500000): ') || '500000';

        console.log('');
        console.log('🎯 Creator Tier Multipliers:');
        const ghostMultiplier = await askQuestion('👻 Ghost tier multiplier (default: 1.0): ') || '1.0';
        const phantomMultiplier = await askQuestion('🌫️  Phantom tier multiplier (default: 1.25): ') || '1.25';
        const wraithMultiplier = await askQuestion('💀 Wraith tier multiplier (default: 1.5): ') || '1.5';
        const demonMultiplier = await askQuestion('😈 Demon tier multiplier (default: 2.0): ') || '2.0';

        // Create .env file
        const envContent = `# Haunted Empire - Live Stripe Configuration
# Generated on ${new Date().toISOString()}

# === STRIPE LIVE API KEYS ===
STRIPE_SECRET_KEY=${secretKey}
STRIPE_PUBLISHABLE_KEY=${publishableKey}
STRIPE_WEBHOOK_SECRET=${webhookSecret}

# === API CONFIGURATION ===
STRIPE_API_VERSION=2023-10-16
STRIPE_ENABLED=true
STRIPE_TEST_MODE=false

# === TRANSACTION LIMITS ===
STRIPE_CURRENCY=${currency}
STRIPE_MIN_AMOUNT=${minAmount}
STRIPE_MAX_AMOUNT=${maxAmount}

# === CREATOR TIER MULTIPLIERS ===
GHOST_MULTIPLIER=${ghostMultiplier}
PHANTOM_MULTIPLIER=${phantomMultiplier}
WRAITH_MULTIPLIER=${wraithMultiplier}
DEMON_MULTIPLIER=${demonMultiplier}

# === WEBHOOK EVENTS ===
STRIPE_WEBHOOK_EVENTS=payment_intent.succeeded,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.payment_succeeded,invoice.payment_failed

# === PAYOUT CONFIGURATION ===
PAYOUT_SCHEDULE=weekly
MINIMUM_PAYOUT_AMOUNT=25.00

# === SERVICE CONFIGURATION ===
NODE_ENV=production
PORT_CREATOR_LEADERBOARDS=8085
PORT_STRIPE_PAYMENTS=8090
PORT_STRIPE_DASHBOARD=3003
`;

        // Write .env file
        fs.writeFileSync(path.join(__dirname, '.env'), envContent);

        console.log('');
        console.log('✅ Configuration saved to .env file');
        console.log('');
        console.log('🚀 Next Steps:');
        console.log('1. Restart your services to load the new configuration');
        console.log('2. Test with a small transaction first');
        console.log('3. Set up webhook endpoint in your Stripe dashboard');
        console.log('4. Monitor your dashboard for live transactions');
        console.log('');
        console.log('🌐 Webhook URL to configure in Stripe:');
        console.log('   http://your-domain.com:8090/webhooks/stripe');
        console.log('');
        console.log('📊 Access your dashboards at:');
        console.log('   • Payment Analytics: http://localhost:3003');
        console.log('   • Creator Leaderboards: http://localhost:8085/stats');
        console.log('   • Stripe Service: http://localhost:8090/stats');
        console.log('');

        const confirm = await askQuestion('🔄 Restart services now? (y/n): ');
        if (confirm.toLowerCase() === 'y') {
            console.log('🔄 Restarting Haunted Empire services...');
            
            // Kill existing node processes on our ports
            const { exec } = require('child_process');
            
            const killCommands = [
                'for /f "tokens=5" %a in (\'netstat -aon ^| findstr :8085\') do taskkill /f /pid %a',
                'for /f "tokens=5" %a in (\'netstat -aon ^| findstr :8090\') do taskkill /f /pid %a',
                'for /f "tokens=5" %a in (\'netstat -aon ^| findstr :3003\') do taskkill /f /pid %a'
            ];

            for (const cmd of killCommands) {
                exec(cmd, (error) => {
                    // Ignore errors - processes might not be running
                });
            }

            setTimeout(() => {
                console.log('🚀 Starting services with live configuration...');
                
                // Start services
                exec('start "Creator Leaderboards" node creator-leaderboards.js');
                exec('start "Stripe Payments" node stripe-payment-service.js');
                exec('start "Analytics Dashboard" node stripe-dashboard.js');
                
                console.log('✅ Services restarted with live Stripe configuration!');
                process.exit(0);
            }, 2000);
        } else {
            console.log('ℹ️  Manual restart required to apply changes');
            process.exit(0);
        }

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

// Security check
async function securityCheck() {
    console.log('🛡️  Security Check:');
    const confirm1 = await askQuestion('   Are you on a secure, trusted network? (y/n): ');
    if (confirm1.toLowerCase() !== 'y') {
        console.log('❌ Please run this setup on a secure network only.');
        process.exit(1);
    }

    const confirm2 = await askQuestion('   Do you have your Stripe live keys ready? (y/n): ');
    if (confirm2.toLowerCase() !== 'y') {
        console.log('ℹ️  Get your keys from https://dashboard.stripe.com/apikeys first');
        process.exit(1);
    }

    const confirm3 = await askQuestion('   Ready to enable LIVE payments (real money)? (y/n): ');
    if (confirm3.toLowerCase() !== 'y') {
        console.log('ℹ️  Setup cancelled. Use test keys for development.');
        process.exit(1);
    }

    console.log('✅ Security check passed. Proceeding with live configuration...');
    console.log('');
}

// Main execution
async function main() {
    await securityCheck();
    await setupStripeKeys();
}

main().catch(console.error).finally(() => rl.close());
