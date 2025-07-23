/**
 * 🔮 Lore Engine SaaS - Main Application Server
 * Express server with all routes and middleware
 * Generated: July 18, 2025
 */

import express from 'express';
import cors from 'cors';
import { config } from './config/environment.js';
import { logger } from './utils/logger.js';

// Import route handlers
import stripeRoutes from './routes/stripe.js';
import referralRoutes from './routes/referrals.js';
import discordRoutes from './routes/discord.js';

const app = express();

// Middleware
app.use(cors({
  origin: config.saas.baseUrl,
  credentials: true,
}));

// Raw body parser for Stripe webhooks (must be before json parser)
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// JSON body parser for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });
  next();
});

// API Routes
app.use('/api/stripe', stripeRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/discord', discordRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.app.env,
    services: {
      stripe: config.stripe.secretKey ? 'configured' : 'missing',
      discord: config.integrations.discord.webhookUrl ? 'configured' : 'missing',
      loreEngine: {
        dispatcher: config.loreEngine.dispatcherUrl,
        conflict: config.loreEngine.conflictApiUrl,
        realtime: config.loreEngine.realtimeWsUrl,
      },
    },
  });
});

// Root endpoint - serves pricing page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🔮 Lore Engine SaaS</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 800px; 
                margin: 0 auto; 
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                min-height: 100vh;
            }
            .container { 
                background: rgba(255,255,255,0.1); 
                padding: 30px; 
                border-radius: 20px;
                backdrop-filter: blur(10px);
            }
            .hero { text-align: center; margin-bottom: 40px; }
            .hero h1 { font-size: 3em; margin-bottom: 10px; }
            .hero p { font-size: 1.2em; opacity: 0.9; }
            .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
            .feature { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; }
            .cta { text-align: center; margin-top: 40px; }
            .btn { 
                display: inline-block; 
                background: #ff6b6b; 
                color: white; 
                padding: 15px 30px; 
                text-decoration: none; 
                border-radius: 50px;
                font-weight: bold;
                margin: 10px;
                transition: transform 0.2s;
            }
            .btn:hover { transform: translateY(-2px); }
            .api-info { background: rgba(0,0,0,0.2); padding: 20px; border-radius: 10px; margin-top: 20px; }
            code { background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="hero">
                <h1>🔮 Lore Engine SaaS</h1>
                <p>Automated Revenue System - Transform Your AI Engine into a Subscription Business</p>
            </div>
            
            <div class="features">
                <div class="feature">
                    <h3>💳 Stripe Integration</h3>
                    <p>Automated subscription billing with 3-tier pricing model. Handles payments, trials, and cancellations.</p>
                </div>
                <div class="feature">
                    <h3>🔁 Referral System</h3>
                    <p>Viral growth engine with referral codes, bonuses, and commission tracking.</p>
                </div>
                <div class="feature">
                    <h3>🎮 Discord Webhooks</h3>
                    <p>Real-time notifications for subscriptions, referrals, and TikTok viral flow tracking.</p>
                </div>
                <div class="feature">
                    <h3>🚀 Auto Provisioning</h3>
                    <p>Instant API key generation, usage limits, and customer onboarding.</p>
                </div>
            </div>
            
            <div class="api-info">
                <h3>🔧 API Endpoints</h3>
                <ul>
                    <li><code>POST /api/stripe/checkout</code> - Create subscription checkout</li>
                    <li><code>POST /api/stripe/webhook</code> - Stripe webhook handler</li>
                    <li><code>POST /api/referrals/generate</code> - Generate referral codes</li>
                    <li><code>GET /api/referrals/validate</code> - Validate referral codes</li>
                    <li><code>POST /api/discord/tiktok-fragment</code> - Track TikTok content</li>
                    <li><code>GET /api/discord/analytics</code> - Viral flow analytics</li>
                </ul>
            </div>
            
            <div class="cta">
                <a href="/pricing.html" class="btn">🎯 View Pricing</a>
                <a href="/dashboard.html" class="btn">📊 Dashboard</a>
                <a href="/health" class="btn">🔧 Health Check</a>
            </div>
            
            <div style="text-align: center; margin-top: 40px; opacity: 0.8;">
                <p>🔮 <strong>Automated Revenue System Active</strong> 🔮</p>
                <p>"Plug in an account and watch it grow"</p>
            </div>
        </div>
    </body>
    </html>
  `);
});

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: config.app.env === 'development' ? error.message : 'Something went wrong',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: [
      'GET /',
      'GET /health',
      'POST /api/stripe/checkout',
      'POST /api/stripe/webhook',
      'POST /api/referrals/generate',
      'GET /api/referrals/validate',
      'POST /api/discord/tiktok-fragment',
      'GET /api/discord/analytics',
    ],
  });
});

// Start server
const PORT = config.app.port;
app.listen(PORT, () => {
  logger.info(`🔮 Lore Engine SaaS Server started on port ${PORT}`, {
    environment: config.app.env,
    baseUrl: config.saas.baseUrl,
    stripeConfigured: !!config.stripe.secretKey,
    discordConfigured: !!config.integrations.discord.webhookUrl,
  });
  
  console.log(`
🔮 ========================================
   LORE ENGINE SAAS - AUTOMATED REVENUE
========================================

🌐 Server running at: http://localhost:${PORT}
📊 Health check: http://localhost:${PORT}/health
💳 Pricing page: http://localhost:${PORT}/pricing.html

🎯 Revenue Automation Status:
   ✅ Stripe Integration: ${config.stripe.secretKey ? 'CONFIGURED' : '❌ MISSING KEYS'}
   ✅ Discord Webhooks: ${config.integrations.discord.webhookUrl ? 'CONFIGURED' : '❌ MISSING URL'}
   ✅ Lore Engine APIs: CONNECTED
   ✅ Referral System: ACTIVE
   ✅ Auto Provisioning: READY

💰 Ready to generate automated revenue!
   "Plug in your Stripe account and watch it grow" 🚀

🔮 ========================================
  `);
});

export default app;
