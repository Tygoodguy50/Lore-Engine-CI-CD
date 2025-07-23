#!/usr/bin/env node
/**
 * 🔍 Stripe API Key Format Checker
 */

require('dotenv').config();

const key = process.env.STRIPE_SECRET_KEY;

console.log('🔍 Stripe Key Format Check');
console.log('==========================');
console.log('');

if (!key) {
    console.log('❌ No STRIPE_SECRET_KEY found in environment');
    process.exit(1);
}

console.log(`📏 Key length: ${key.length} characters`);
console.log(`🔤 Starts with: ${key.substring(0, 15)}...`);
console.log(`🔤 Ends with: ...${key.substring(key.length - 5)}`);
console.log('');

// Check format
if (key.startsWith('sk_live_')) {
    console.log('✅ Correct live key prefix');
} else if (key.startsWith('sk_test_')) {
    console.log('⚠️  Test key detected (should be sk_live_ for production)');
} else {
    console.log('❌ Invalid key prefix (should start with sk_live_ or sk_test_)');
}

// Check length (Stripe keys are typically around 107-108 characters)
if (key.length >= 100 && key.length <= 120) {
    console.log('✅ Key length looks correct');
} else {
    console.log(`❌ Key length unusual (${key.length} chars, expected ~107)`);
    console.log('   Check if key was truncated or has extra characters');
}

// Check for common issues
if (key.includes(' ')) {
    console.log('❌ Key contains spaces - remove all whitespace');
}

if (key.includes('\n') || key.includes('\r')) {
    console.log('❌ Key contains newlines - should be single line');
}

console.log('');
console.log('💡 Tips:');
console.log('1. Copy key directly from Stripe dashboard');
console.log('2. Make sure no extra characters are added');
console.log('3. Key should be one continuous string');
console.log('4. Check if your Stripe account is fully activated');
