#!/usr/bin/env node

/**
 * 🚀 Quick Subdomain Deployment Helper
 * Prepares your business website for subdomain deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🌐 Subdomain Deployment Helper for phantomgear.it.com\n');

// Suggested subdomains
const subdomains = [
    'haunted.phantomgear.it.com ✨ (Matches your brand)',
    'payments.phantomgear.it.com 💳 (Clear purpose)', 
    'business.phantomgear.it.com 🏢 (Professional)'
];

console.log('🎯 Recommended subdomains:');
subdomains.forEach((sub, i) => {
    console.log(`   ${i + 1}. ${sub}`);
});
console.log('');

// Check if business website exists
const websitePath = path.join(__dirname, 'business-website.html');
if (!fs.existsSync(websitePath)) {
    console.log('❌ business-website.html not found!');
    console.log('📄 Please ensure the file exists in this directory.');
    process.exit(1);
}

console.log('✅ business-website.html found and ready for deployment\n');

// Create a deployment-ready copy
const deployPath = path.join(__dirname, 'deploy');
if (!fs.existsSync(deployPath)) {
    fs.mkdirSync(deployPath);
}

// Copy as index.html for deployment
const indexPath = path.join(deployPath, 'index.html');
fs.copyFileSync(websitePath, indexPath);

console.log('📁 Created deployment folder: ./deploy/');
console.log('📄 Copied business-website.html → deploy/index.html\n');

// Instructions
console.log('📋 Next Steps:\n');

console.log('1. 🌐 DNS Setup (Choose your subdomain):');
console.log('   → Login to your domain registrar/DNS provider');
console.log('   → Add CNAME record: haunted → phantomgear.it.com');
console.log('   → Wait for DNS propagation (up to 24 hours)\n');

console.log('2. 📤 Upload Files:');
console.log('   → Upload the contents of ./deploy/ folder');
console.log('   → To your subdomain document root');
console.log('   → Make sure index.html is in the root\n');

console.log('3. 🧪 Test Your Site:');
console.log('   → Visit: https://haunted.phantomgear.it.com');
console.log('   → Check all sections load properly');
console.log('   → Verify contact information shows correctly\n');

console.log('4. 📊 Update Stripe Account:');
console.log('   → Go to: https://dashboard.stripe.com/account/details');
console.log('   → Website: https://haunted.phantomgear.it.com');
console.log('   → Business: PhantomGear Technologies\n');

// Environment update suggestion
console.log('5. ⚙️  Update Environment:');
console.log('   → Update BUSINESS_WEBSITE in .env');
console.log('   → Get real Stripe test keys');
console.log('   → Run: node verify-stripe-keys.js\n');

// Create an environment update template
const envUpdate = `
# Add these lines to your .env file after deployment:
BUSINESS_WEBSITE=https://haunted.phantomgear.it.com
BUSINESS_EMAIL=support@phantomgear.it.com
BUSINESS_NAME=PhantomGear Technologies
BUSINESS_DOMAIN=phantomgear.it.com

# SSL/HTTPS Settings
ENABLE_HTTPS=true
SECURE_HEADERS=true
`;

fs.writeFileSync(path.join(deployPath, 'env-update.txt'), envUpdate.trim());

console.log('📝 Created: deploy/env-update.txt (environment settings to add)\n');

// Hosting-specific instructions
console.log('🖥️  Hosting Method Instructions:\n');

console.log('📁 cPanel/Shared Hosting:');
console.log('   1. Create subdomain in cPanel');
console.log('   2. Upload deploy/index.html to subdomain folder');
console.log('   3. Test subdomain URL\n');

console.log('🐙 GitHub/Netlify:');
console.log('   1. Create new repo with deploy/index.html');
console.log('   2. Connect to Netlify/Vercel');
console.log('   3. Set custom domain to your subdomain\n');

console.log('🖧 Custom Server:');
console.log('   1. Create virtual host config');
console.log('   2. Upload deploy/index.html to document root');
console.log('   3. Restart web server\n');

console.log('🔑 Getting Your Real Stripe Keys:\n');
console.log('📊 Test Keys (for development):');
console.log('   → https://dashboard.stripe.com/test/apikeys');
console.log('   → Copy both secret and publishable keys');
console.log('   → Update your .env file\n');

console.log('🚀 Live Keys (after business verification):');
console.log('   → https://dashboard.stripe.com/apikeys');
console.log('   → Available once Stripe approves your business\n');

// Quick test command
console.log('🧪 Quick Test Commands:\n');
console.log('# Test your current setup');
console.log('node setup-phantomgear.js\n');
console.log('# Test Stripe connection (after getting real keys)');
console.log('node verify-stripe-keys.js\n');
console.log('# Start your services');
console.log('node creator-leaderboards.js');
console.log('node stripe-payment-service.js');
console.log('node stripe-dashboard.js\n');

console.log('🎉 Ready for deployment! Choose your hosting method and follow the steps above.');
console.log('📞 Need help? Check DEPLOY_SUBDOMAIN.md for detailed instructions.');
