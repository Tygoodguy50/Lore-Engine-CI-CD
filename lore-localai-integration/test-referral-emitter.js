// Test the Referral Emitter in Node.js environment
const fs = require('fs');
const path = require('path');

// Simple test of referral code generation
function testReferralEmitter() {
    console.log('🧬 Referral Emitter - Standalone Test');
    console.log('====================================');
    
    // Simulate referral code generation
    const platform = 'tiktok';
    const prefix = platform === 'tiktok' ? 'TT' : 'LR';
    const timestamp = Date.now().toString(36);
    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomSuffix = '';
    
    for (let i = 0; i < 4; i++) {
        randomSuffix += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    
    const referralCode = `${prefix}${timestamp}${randomSuffix}`.toUpperCase();
    
    console.log(`Platform: ${platform}`);
    console.log(`Generated referral code: ${referralCode}`);
    console.log(`Tracking URL: https://18e5cda9df96.ngrok-free.app/ref/${referralCode}`);
    
    // Test content injection
    const originalContent = "The ancient whispers speak of mysteries beyond comprehension...";
    const injectionPatterns = [
        `${originalContent}\n\n🔮 The ancient code speaks: ${referralCode}`,
        `${originalContent}\n\n✨ Those who seek deeper mysteries... use ${referralCode}`,
        `${originalContent}\n\n👁️ The watchers have left a sign: ${referralCode}`
    ];
    
    const enhancedContent = injectionPatterns[Math.floor(Math.random() * injectionPatterns.length)];
    
    console.log('\nOriginal content:');
    console.log(originalContent);
    console.log('\nEnhanced content with referral:');
    console.log(enhancedContent);
    
    // Test metrics structure
    const metrics = {
        clicks: 0,
        signups: 0,
        conversions: 0,
        viral_coefficient: 0.0
    };
    
    console.log('\nInitial metrics:', metrics);
    console.log('✅ Referral emitter test completed!');
}

testReferralEmitter();
