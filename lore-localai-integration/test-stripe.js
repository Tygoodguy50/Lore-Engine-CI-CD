// Quick Stripe test
require('dotenv').config();
console.log('🔮 Testing Stripe connection...');
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Found' : 'Missing');

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function test() {
  try {
    const account = await stripe.accounts.retrieve();
    console.log('✅ Stripe connected successfully!');
    console.log('Account:', account.id);
    console.log('Email:', account.email);
    console.log('Country:', account.country);
  } catch (error) {
    console.error('❌ Stripe error:', error.message);
  }
}

test();
