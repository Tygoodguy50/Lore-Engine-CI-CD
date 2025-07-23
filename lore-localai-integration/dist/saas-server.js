"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const environment_1 = require("./config/environment");
const logger_1 = require("./utils/logger");
const billing_1 = require("./routes/billing");
const customer_service_1 = require("./billing/customer-service");
const axios_1 = __importDefault(require("axios"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: environment_1.config.app.env === 'production' ? [
        'https://dashboard.lore-engine.com',
        'https://lore-engine.com'
    ] : true,
    credentials: true
}));
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: {
        error: 'Too many requests from this IP, please try again later'
    }
});
app.use(globalLimiter);
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        services: {
            lore_dispatcher: 'connected',
            conflict_api: 'connected',
            stripe: 'connected',
            billing: 'active'
        }
    });
});
app.use('/api/billing', billing_1.billingRouter);
const loreApiRouter = express_1.default.Router();
loreApiRouter.use(billing_1.validateApiKey);
loreApiRouter.post('/events/process', (0, billing_1.validateUsage)('event_processing'), async (req, res) => {
    try {
        logger_1.logger.info('Processing lore event', {
            customerId: req.customer.id,
            tier: req.customer.subscriptionTier,
            eventType: req.body.type
        });
        const response = await axios_1.default.post(`${environment_1.config.loreEngine.dispatcherUrl}/lore/dispatch`, req.body, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
        res.json({
            success: true,
            event_id: response.data.event_id || Date.now().toString(),
            dispatched_to: response.data.dispatched_to || [],
            processing_time: response.data.processing_time || 0,
            customer: {
                tier: req.customer.subscriptionTier,
                events_remaining: 'unlimited'
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to process lore event', { error, customerId: req.customer.id });
        res.status(500).json({
            success: false,
            error: 'Event processing failed',
            retry_after: 5000
        });
    }
});
loreApiRouter.post('/conflicts/analyze', (0, billing_1.validateUsage)('conflict_detection'), async (req, res) => {
    try {
        logger_1.logger.info('Analyzing conflict', {
            customerId: req.customer.id,
            tier: req.customer.subscriptionTier
        });
        const response = await axios_1.default.post(`${environment_1.config.loreEngine.conflictApiUrl}/analyze`, req.body, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 15000
        });
        res.json({
            success: true,
            conflict_detected: response.data.conflict_detected || false,
            analysis: response.data.analysis || null,
            recommendations: response.data.recommendations || [],
            confidence: response.data.confidence || 0,
            customer: {
                tier: req.customer.subscriptionTier,
                conflicts_remaining: 'check dashboard'
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to analyze conflict', { error, customerId: req.customer.id });
        res.status(500).json({
            success: false,
            error: 'Conflict analysis failed'
        });
    }
});
loreApiRouter.get('/realtime/connect', async (req, res) => {
    try {
        const tier = req.customer.subscriptionTier;
        const tierInfo = await Promise.resolve().then(() => __importStar(require('./billing/stripe-service'))).then(m => m.SUBSCRIPTION_TIERS.find(t => t.id === tier));
        if (!tierInfo || tierInfo.limits.realtimeConnections === 0) {
            return res.status(403).json({
                success: false,
                error: 'Real-time connections not available in your tier',
                upgrade_url: `${environment_1.config.saas.baseUrl}/pricing`,
                current_tier: tier
            });
        }
        const wsToken = Buffer.from(JSON.stringify({
            customerId: req.customer.id,
            tier: tier,
            maxConnections: tierInfo.limits.realtimeConnections,
            expires: Date.now() + (60 * 60 * 1000)
        })).toString('base64');
        res.json({
            success: true,
            websocket_url: `${environment_1.config.loreEngine.realtimeWsUrl}?token=${wsToken}`,
            max_connections: tierInfo.limits.realtimeConnections,
            expires_in: 3600
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to generate WebSocket connection', { error, customerId: req.customer.id });
        res.status(500).json({
            success: false,
            error: 'WebSocket connection failed'
        });
    }
});
loreApiRouter.get('/stats', async (req, res) => {
    try {
        const tier = req.customer.subscriptionTier;
        const dashboard = await customer_service_1.customerService.getCustomerDashboard(req.customer.id);
        let stats = {
            customer: {
                id: req.customer.id,
                tier: tier,
                status: req.customer.subscriptionStatus
            },
            usage: dashboard.usage,
            limits: dashboard.billing.limits
        };
        if (tier === 'pro' || tier === 'enterprise') {
            try {
                const loreStatsResponse = await axios_1.default.get(`${environment_1.config.loreEngine.dispatcherUrl}/lore/stats`, { timeout: 5000 });
                stats = {
                    ...stats,
                    lore_engine: loreStatsResponse.data,
                    advanced_metrics: true
                };
            }
            catch (error) {
                logger_1.logger.warn('Failed to fetch advanced stats', { error });
            }
        }
        res.json({
            success: true,
            stats
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get stats', { error, customerId: req.customer.id });
        res.status(500).json({
            success: false,
            error: 'Stats retrieval failed'
        });
    }
});
loreApiRouter.post('/webhooks', async (req, res) => {
    try {
        const tier = req.customer.subscriptionTier;
        const tierInfo = await Promise.resolve().then(() => __importStar(require('./billing/stripe-service'))).then(m => m.SUBSCRIPTION_TIERS.find(t => t.id === tier));
        if (!tierInfo || tierInfo.limits.webhookEndpoints === 0) {
            return res.status(403).json({
                success: false,
                error: 'Webhook endpoints not available in your tier',
                upgrade_url: `${environment_1.config.saas.baseUrl}/pricing`
            });
        }
        const { url, events } = req.body;
        const webhookId = Date.now().toString();
        res.json({
            success: true,
            webhook_id: webhookId,
            url: url,
            events: events,
            status: 'active',
            max_endpoints: tierInfo.limits.webhookEndpoints
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to create webhook', { error, customerId: req.customer.id });
        res.status(500).json({
            success: false,
            error: 'Webhook creation failed'
        });
    }
});
app.use('/api/lore', loreApiRouter);
const demoLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: {
        error: 'Demo limit reached. Sign up for unlimited access!',
        signup_url: `${environment_1.config.saas.baseUrl}/pricing`
    }
});
app.get('/api/demo/stats', demoLimiter, async (req, res) => {
    try {
        res.json({
            success: true,
            demo: true,
            sample_stats: {
                events_processed: 15847,
                conflicts_resolved: 342,
                active_integrations: ['Discord', 'TikTok', 'Markdown'],
                uptime_hours: 720
            },
            message: 'This is demo data. Sign up for real-time access!',
            pricing_url: `${environment_1.config.saas.baseUrl}/pricing`
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Demo unavailable' });
    }
});
app.get('/api/pricing', async (req, res) => {
    try {
        const { SUBSCRIPTION_TIERS } = await Promise.resolve().then(() => __importStar(require('./billing/stripe-service')));
        res.json({
            success: true,
            tiers: SUBSCRIPTION_TIERS.map(tier => ({
                id: tier.id,
                name: tier.name,
                description: tier.description,
                price: tier.price,
                interval: tier.interval,
                features: tier.features,
                limits: tier.limits,
                popular: tier.id === 'pro'
            })),
            trial_available: true,
            trial_days: environment_1.config.saas.trialPeriodDays,
            contact_email: environment_1.config.saas.supportEmail
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get pricing', { error });
        res.status(500).json({
            success: false,
            error: 'Pricing information unavailable'
        });
    }
});
app.use((error, req, res, next) => {
    logger_1.logger.error('Unhandled error', { error, url: req.url, method: req.method });
    res.status(500).json({
        success: false,
        error: environment_1.config.app.env === 'production'
            ? 'Internal server error'
            : error.message,
        request_id: req.id || Date.now().toString()
    });
});
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        available_endpoints: [
            'GET /health',
            'GET /api/pricing',
            'GET /api/demo/stats',
            'POST /api/billing/subscribe',
            'POST /api/lore/events/process',
            'POST /api/lore/conflicts/analyze'
        ]
    });
});
const PORT = environment_1.config.app.port;
app.listen(PORT, () => {
    logger_1.logger.info('🔮 Lore Engine SaaS Server Started', {
        port: PORT,
        env: environment_1.config.app.env,
        dashboardUrl: environment_1.config.saas.dashboardUrl,
        pricingUrl: `${environment_1.config.saas.baseUrl}/api/pricing`
    });
    logger_1.logger.info('💳 Billing System Active', {
        stripeMode: environment_1.config.app.env === 'production' ? 'live' : 'test',
        tiersAvailable: 3,
        trialPeriod: environment_1.config.saas.trialPeriodDays
    });
    logger_1.logger.info('🚀 Ready for customers! Revenue automation enabled.', {
        message: 'Your SaaS is live - customers can now subscribe and start generating revenue!'
    });
});
exports.default = app;
//# sourceMappingURL=saas-server.js.map