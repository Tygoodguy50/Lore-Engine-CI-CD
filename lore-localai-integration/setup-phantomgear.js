#!/usr/bin/env node

/**
 * 🔧 Quick Setup Helper for PhantomGear Stripe Integration
 * This script helps you configure your Stripe keys correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🔰 PhantomGear Stripe Setup Helper\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (!envExists) {
    console.log('❌ No .env file found!');
    console.log('📝 Creating template .env file...\n');
    
    const envTemplate = `# 🔥 Haunted Empire - PhantomGear Stripe Configuration
# Domain: phantomgear.it.com
# Business: PhantomGear Technologies

# 🎯 Mode Configuration
STRIPE_TEST_MODE=true
NODE_ENV=development

# 🔑 Stripe API Keys (Get from: https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_51...YOUR_ACTUAL_TEST_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_51...YOUR_ACTUAL_TEST_KEY_HERE

# 🌐 Business Information
BUSINESS_WEBSITE=https://phantomgear.it.com/haunted-empire/
BUSINESS_EMAIL=support@phantomgear.it.com
BUSINESS_NAME=PhantomGear Technologies
BUSINESS_DOMAIN=phantomgear.it.com

# 🖥️ Service Configuration
CREATOR_LEADERBOARDS_PORT=8085
STRIPE_PAYMENT_PORT=8090
STRIPE_DASHBOARD_PORT=3003

# 🎨 Branding
THEME=haunted-empire
BRAND_COLOR=#800080
ACCENT_COLOR=#ff6b35

# 💰 Payment Configuration
DEFAULT_CURRENCY=usd
MIN_PAYMENT_AMOUNT=0.50
MAX_PAYMENT_AMOUNT=10000.00
TIER_MULTIPLIERS={"platinum": 2.5, "gold": 2.0, "silver": 1.5, "bronze": 1.0}
`;

    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ Created .env template file!');
    console.log('🔧 Please update with your actual Stripe test keys\n');
}

console.log('📋 Setup Checklist:\n');

console.log('1. 🔑 Get Your Stripe Test Keys:');
console.log('   → Go to: https://dashboard.stripe.com/test/apikeys');
console.log('   → Copy: sk_test_51... (Secret key)');
console.log('   → Copy: pk_test_51... (Publishable key)');
console.log('   → Update your .env file\n');

console.log('2. 🌐 Deploy Business Website:');
console.log('   → Upload business-website.html to phantomgear.it.com');
console.log('   → Make it accessible (subdomain or subdirectory)');
console.log('   → Update BUSINESS_WEBSITE in .env with actual URL\n');

console.log('3. 🏢 Complete Stripe Business Profile:');
console.log('   → Business name: PhantomGear Technologies');
console.log('   → Website: Your deployed site URL'); 
console.log('   → Add bank account for payouts');
console.log('   → Complete tax information\n');

console.log('4. 🧪 Test Integration:');
console.log('   → Run: node verify-stripe-keys.js');
console.log('   → Start services: node creator-leaderboards.js');
console.log('   → Test payments through dashboard\n');

console.log('5. 🚀 Go Live (After Verification):');
console.log('   → Set STRIPE_TEST_MODE=false in .env');
console.log('   → Update with live API keys');
console.log('   → Process real payments!\n');

// Check current .env status
if (envExists) {
    console.log('📊 Current Configuration Status:\n');
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const checkKey = (keyName, pattern) => {
        const match = envContent.match(new RegExp(`${keyName}=(.+)`));
        const value = match ? match[1].trim() : '';
        
        if (value && value !== '' && !value.includes('YOUR_') && !value.includes('...')) {
            console.log(`   ✅ ${keyName}: Configured`);
            return true;
        } else {
            console.log(`   ❌ ${keyName}: Needs your actual key`);
            return false;
        }
    };
    
    const secretOk = checkKey('STRIPE_SECRET_KEY');
    const publishableOk = checkKey('STRIPE_PUBLISHABLE_KEY');
    const websiteOk = checkKey('BUSINESS_WEBSITE');
    
    console.log('');
    
    if (secretOk && publishableOk) {
        console.log('🎉 API Keys configured! Ready to test.');
        console.log('▶️  Run: node verify-stripe-keys.js');
    } else {
        console.log('⏳ Please add your actual Stripe test keys to .env');
        console.log('🔗 Get them from: https://dashboard.stripe.com/test/apikeys');
    }
}

console.log('\n🌟 Need help? Check DEPLOY_TO_PHANTOMGEAR.md for detailed instructions!');
