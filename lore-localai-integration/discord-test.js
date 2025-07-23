/**
 * 🧪 Discord Integration Test Script
 * Test Discord webhook notifications for Lore Engine SaaS
 * Generated: July 18, 2025
 */

import { discordService } from './src/services/discord.service';

async function testDiscordIntegration() {
  console.log('🎮 Testing Discord Integration...\n');

  try {
    // Test basic connection
    console.log('1️⃣ Testing basic webhook connection...');
    const connectionTest = await discordService.testConnection();
    console.log(`   Result: ${connectionTest ? '✅ Success' : '❌ Failed'}\n`);

    // Test user registration notification
    console.log('2️⃣ Testing user registration notification...');
    const userRegistrationTest = await discordService.notifyUserRegistration({
      email: 'test.user@example.com',
      plan: 'Pro Plan',
      signupMethod: 'Google OAuth',
    });
    console.log(`   Result: ${userRegistrationTest ? '✅ Success' : '❌ Failed'}\n`);

    // Test subscription event notification
    console.log('3️⃣ Testing subscription event notification...');
    const subscriptionTest = await discordService.notifySubscriptionEvent({
      type: 'created',
      customerEmail: 'customer@example.com',
      plan: 'Enterprise Plan',
      amount: 9999, // $99.99 in cents
      currency: 'usd',
    });
    console.log(`   Result: ${subscriptionTest ? '✅ Success' : '❌ Failed'}\n`);

    // Test system alert notification
    console.log('4️⃣ Testing system alert notification...');
    const alertTest = await discordService.notifySystemAlert({
      level: 'info',
      title: 'Test System Alert',
      message: 'This is a test system alert to verify monitoring notifications.',
      service: 'Lore Engine API',
    });
    console.log(`   Result: ${alertTest ? '✅ Success' : '❌ Failed'}\n`);

    // Test revenue milestone notification
    console.log('5️⃣ Testing revenue milestone notification...');
    const milestoneTest = await discordService.notifyRevenueMilestone({
      milestone: 10000,
      currency: 'USD',
      totalCustomers: 150,
      period: 'monthly',
    });
    console.log(`   Result: ${milestoneTest ? '✅ Success' : '❌ Failed'}\n`);

    console.log('🎉 Discord integration test completed!');
    console.log('Check your Discord channel to see the test notifications.');

  } catch (error) {
    console.error('❌ Discord integration test failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testDiscordIntegration().catch(console.error);
}

export { testDiscordIntegration };
