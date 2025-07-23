// Create Stripe Products for Lore Engine SaaS
require('dotenv').config();
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createProducts() {
  console.log('🔮 Creating Lore Engine SaaS products...\n');

  try {
    // 1. Create Starter Product
    console.log('Creating Starter tier...');
    const starterProduct = await stripe.products.create({
      name: '🌟 Lore Engine Starter',
      description: 'Perfect for indie creators and small projects - 1,000 API calls per month'
    });

    const starterPrice = await stripe.prices.create({
      product: starterProduct.id,
      unit_amount: 999, // $9.99
      currency: 'usd',
      recurring: { interval: 'month' }
    });

    console.log(`✅ Starter Product: ${starterProduct.id}`);
    console.log(`✅ Starter Price: ${starterPrice.id} ($9.99/month)\n`);

    // 2. Create Pro Product
    console.log('Creating Pro tier...');
    const proProduct = await stripe.products.create({
      name: '⚡ Lore Engine Pro', 
      description: 'For professional creators - 10,000 API calls per month with Discord integration'
    });

    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 2999, // $29.99
      currency: 'usd',
      recurring: { interval: 'month' }
    });

    console.log(`✅ Pro Product: ${proProduct.id}`);
    console.log(`✅ Pro Price: ${proPrice.id} ($29.99/month)\n`);

    // 3. Create Enterprise Product
    console.log('Creating Enterprise tier...');
    const enterpriseProduct = await stripe.products.create({
      name: '🚀 Lore Engine Enterprise',
      description: 'For large teams - 100,000 API calls per month with custom integrations'
    });

    const enterprisePrice = await stripe.prices.create({
      product: enterpriseProduct.id,
      unit_amount: 9999, // $99.99
      currency: 'usd',
      recurring: { interval: 'month' }
    });

    console.log(`✅ Enterprise Product: ${enterpriseProduct.id}`);
    console.log(`✅ Enterprise Price: ${enterprisePrice.id} ($99.99/month)\n`);

    // 4. Create Webhook Endpoint
    console.log('Creating webhook endpoint...');
    const webhook = await stripe.webhookEndpoints.create({
      url: 'http://localhost:3000/api/stripe/webhook',
      enabled_events: [
        'customer.subscription.created',
        'customer.subscription.updated', 
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
        'checkout.session.completed'
      ]
    });

    console.log(`✅ Webhook: ${webhook.id}`);
    console.log(`✅ Webhook Secret: ${webhook.secret}\n`);

    // Generate .env updates
    console.log('🔧 ADD THESE TO YOUR .env FILE:');
    console.log('='.repeat(60));
    console.log(`STRIPE_BASIC_PRICE_ID=${starterPrice.id}`);
    console.log(`STRIPE_PRO_PRICE_ID=${proPrice.id}`);
    console.log(`STRIPE_ENTERPRISE_PRICE_ID=${enterprisePrice.id}`);
    console.log(`STRIPE_WEBHOOK_SECRET=${webhook.secret}`);
    console.log('='.repeat(60));

    // Save to file
    const fs = require('fs');
    const updates = `
# 💰 Stripe Price IDs - Created ${new Date().toISOString()}
STRIPE_BASIC_PRICE_ID=${starterPrice.id}
STRIPE_PRO_PRICE_ID=${proPrice.id}
STRIPE_ENTERPRISE_PRICE_ID=${enterprisePrice.id}
STRIPE_WEBHOOK_SECRET=${webhook.secret}
`;
    
    fs.writeFileSync('stripe-prices.txt', updates.trim());
    console.log('\n✅ Price IDs saved to stripe-prices.txt');

    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Copy the price IDs above to your .env file');
    console.log('2. Start your server: npm run dev');
    console.log('3. Test subscriptions at: http://localhost:3000');
    console.log('\n🔮 Your automated revenue system is ready! 💰');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createProducts();
