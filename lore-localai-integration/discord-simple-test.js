/**
 * 🧪 Simple Discord Webhook Test
 * Test Discord notification with your webhook URL
 * Generated: July 18, 2025
 */

const https = require('https');
const url = require('url');
require('dotenv').config();

// Discord webhook URL from environment
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

/**
 * Send a message to Discord webhook
 */
function sendDiscordMessage(message) {
  return new Promise((resolve, reject) => {
    if (!DISCORD_WEBHOOK_URL) {
      console.error('❌ Discord webhook URL not configured in .env file');
      reject(new Error('No webhook URL configured'));
      return;
    }

    const webhookUrl = new URL(DISCORD_WEBHOOK_URL);
    const data = JSON.stringify(message);

    const options = {
      hostname: webhookUrl.hostname,
      path: webhookUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 204 || (res.statusCode >= 200 && res.statusCode < 300)) {
          console.log('✅ Discord message sent successfully!');
          resolve(responseData);
        } else {
          console.error(`❌ Discord webhook failed: ${res.statusCode} ${res.statusMessage}`);
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Failed to send Discord message:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

/**
 * Add delay between messages to respect rate limits
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Test Discord integration
 */
async function testDiscordIntegration() {
  console.log('🎮 Testing Discord Integration...\n');

  try {
    // Test 1: Basic connection test
    console.log('1️⃣ Testing basic webhook connection...');
    await sendDiscordMessage({
      content: '🧪 **Discord Integration Test** - Basic connection test from Lore Engine SaaS!',
    });
    await delay(1000); // Respect rate limits

    // Test 2: Rich embed test
    console.log('2️⃣ Testing rich embed message...');
    await sendDiscordMessage({
      content: '🎮 **Lore Engine SaaS Notifications**',
      embeds: [
        {
          title: '🧪 Discord Integration Test',
          description: 'This is a test message to verify Discord webhook integration is working correctly.',
          color: 7506394, // Discord Blurple
          fields: [
            {
              name: '⚡ Status',
              value: 'Connection Successful',
              inline: true,
            },
            {
              name: '🕐 Time',
              value: new Date().toLocaleString(),
              inline: true,
            },
          ],
          footer: {
            text: 'Lore Engine SaaS - Discord Integration',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    });
    await delay(1000);

    // Test 3: User registration notification
    console.log('3️⃣ Testing user registration notification...');
    await sendDiscordMessage({
      embeds: [
        {
          title: '🎉 New User Registration',
          color: 65280, // Green
          fields: [
            {
              name: '📧 Email',
              value: 'test.user@example.com',
              inline: true,
            },
            {
              name: '💳 Plan',
              value: 'Pro Plan',
              inline: true,
            },
            {
              name: '🔗 Signup Method',
              value: 'Google OAuth',
              inline: true,
            },
          ],
          footer: {
            text: 'Lore Engine SaaS',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    });
    await delay(1000);

    // Test 4: Subscription event notification
    console.log('4️⃣ Testing subscription event notification...');
    await sendDiscordMessage({
      embeds: [
        {
          title: '💰 New Subscription',
          color: 65280, // Green
          fields: [
            {
              name: '👤 Customer',
              value: 'customer@example.com',
              inline: true,
            },
            {
              name: '📦 Plan',
              value: 'Enterprise Plan',
              inline: true,
            },
            {
              name: '💵 Amount',
              value: '$99.99 USD',
              inline: true,
            },
          ],
          footer: {
            text: 'Stripe Integration',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    });
    await delay(1000);

    // Test 5: Revenue milestone notification
    console.log('5️⃣ Testing revenue milestone notification...');
    await sendDiscordMessage({
      embeds: [
        {
          title: '🎯 Revenue Milestone Reached!',
          description: 'Congratulations! Lore Engine SaaS has reached $10,000 in monthly revenue!',
          color: 16766720, // Gold
          fields: [
            {
              name: '💰 Revenue',
              value: '$10,000 USD',
              inline: true,
            },
            {
              name: '👥 Total Customers',
              value: '150',
              inline: true,
            },
            {
              name: '📅 Period',
              value: 'monthly',
              inline: true,
            },
          ],
          footer: {
            text: 'Revenue Tracking',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    });

    console.log('\n🎉 Discord integration test completed successfully!');
    console.log('✅ All notifications sent to your Discord channel.');
    console.log('💡 Check your Discord server to see the test messages.');

  } catch (error) {
    console.error('\n❌ Discord integration test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify your Discord webhook URL is correct in .env file');
    console.log('2. Check that the Discord channel exists and webhook is active');
    console.log('3. Ensure you have permission to send messages to the channel');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testDiscordIntegration();
}

module.exports = { sendDiscordMessage, testDiscordIntegration };
