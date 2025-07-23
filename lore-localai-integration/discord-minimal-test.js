/**
 * 🧪 Minimal Discord Webhook Test
 * Test Discord webhook with minimal payload
 */

const https = require('https');
require('dotenv').config();

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

console.log('🎮 Testing Discord webhook...');
console.log('Webhook URL:', webhookUrl ? 'Configured' : 'NOT CONFIGURED');

if (!webhookUrl) {
  console.error('❌ No Discord webhook URL found in environment variables');
  process.exit(1);
}

// Parse webhook URL
const url = new URL(webhookUrl);
console.log('Target:', url.hostname + url.pathname);

// Minimal test payload
const payload = JSON.stringify({
  content: "🧪 Hello from Lore Engine SaaS! Discord integration test successful."
});

const options = {
  hostname: url.hostname,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Lore-Engine-SaaS/1.0',
    'Content-Length': Buffer.byteLength(payload)
  }
};

console.log('📡 Sending request...');

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode, res.statusMessage);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 204) {
      console.log('✅ SUCCESS! Discord webhook working correctly!');
    } else {
      console.log('Response body:', data);
      console.log('❌ Unexpected response code');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error);
});

req.write(payload);
req.end();
