"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUsage = exports.validateApiKey = exports.billingRouter = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const stripe_service_1 = require("../billing/stripe-service");
const customer_service_1 = require("../billing/customer-service");
const logger_1 = require("../utils/logger");
const environment_1 = require("../config/environment");
exports.billingRouter = (0, express_1.Router)();
exports.billingRouter.get('/tiers', (req, res) => {
    try {
        const tiers = stripe_service_1.SUBSCRIPTION_TIERS.map(tier => ({
            id: tier.id,
            name: tier.name,
            description: tier.description,
            price: tier.price,
            interval: tier.interval,
            features: tier.features,
            limits: tier.limits
        }));
        res.json({
            success: true,
            tiers
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get subscription tiers', { error });
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.billingRouter.post('/subscribe', [
    (0, express_validator_1.body)('tier').isIn(stripe_service_1.SUBSCRIPTION_TIERS.map(t => t.id)).withMessage('Invalid subscription tier'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('metadata').optional().isObject().withMessage('Metadata must be an object')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { tier, email, metadata } = req.body;
        logger_1.logger.info('Creating subscription', { tier, email });
        const checkout = await customer_service_1.customerService.createSubscription(tier, email, metadata);
        res.json({
            success: true,
            checkout_url: checkout.checkoutUrl,
            session_id: checkout.sessionId
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to create subscription', { error });
        res.status(500).json({
            success: false,
            error: 'Failed to create subscription'
        });
    }
});
exports.billingRouter.post('/onboarding/complete', [
    (0, express_validator_1.body)('session_id').notEmpty().withMessage('Session ID is required')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { session_id } = req.body;
        const onboarding = await customer_service_1.customerService.completeOnboarding(session_id);
        res.json({
            success: true,
            customer: {
                id: onboarding.customer.id,
                email: onboarding.customer.email,
                tier: onboarding.customer.subscriptionTier,
                status: onboarding.customer.subscriptionStatus
            },
            api_key: onboarding.apiKey,
            dashboard_url: onboarding.dashboardUrl,
            message: 'Welcome to Lore Engine! Your account is ready.'
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to complete onboarding', { error });
        res.status(500).json({
            success: false,
            error: 'Failed to complete onboarding'
        });
    }
});
exports.billingRouter.get('/dashboard/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        const dashboard = await customer_service_1.customerService.getCustomerDashboard(customerId);
        res.json({
            success: true,
            dashboard
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get customer dashboard', { error });
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve dashboard data'
        });
    }
});
exports.billingRouter.post('/subscription/change', [
    (0, express_validator_1.body)('customer_id').notEmpty().withMessage('Customer ID is required'),
    (0, express_validator_1.body)('new_tier').isIn(stripe_service_1.SUBSCRIPTION_TIERS.map(t => t.id)).withMessage('Invalid subscription tier')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { customer_id, new_tier } = req.body;
        await customer_service_1.customerService.changeSubscription(customer_id, new_tier);
        const newTierInfo = stripe_service_1.SUBSCRIPTION_TIERS.find(t => t.id === new_tier);
        res.json({
            success: true,
            message: `Subscription upgraded to ${newTierInfo?.name}`,
            new_tier: newTierInfo
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to change subscription', { error });
        res.status(500).json({
            success: false,
            error: 'Failed to change subscription'
        });
    }
});
exports.billingRouter.post('/subscription/cancel', [
    (0, express_validator_1.body)('customer_id').notEmpty().withMessage('Customer ID is required')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { customer_id } = req.body;
        await customer_service_1.customerService.cancelSubscription(customer_id);
        res.json({
            success: true,
            message: 'Subscription will be cancelled at the end of the current billing period'
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to cancel subscription', { error });
        res.status(500).json({
            success: false,
            error: 'Failed to cancel subscription'
        });
    }
});
exports.billingRouter.post('/api-keys', [
    (0, express_validator_1.body)('customer_id').notEmpty().withMessage('Customer ID is required'),
    (0, express_validator_1.body)('name').notEmpty().withMessage('Key name is required'),
    (0, express_validator_1.body)('permissions').isArray().withMessage('Permissions must be an array')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { customer_id, name, permissions, custom_limits } = req.body;
        const apiKey = await customer_service_1.customerService.createApiKey(customer_id, {
            name,
            permissions,
            customLimits: custom_limits
        });
        res.json({
            success: true,
            api_key: {
                id: apiKey.id,
                key: apiKey.key,
                name: apiKey.name,
                permissions: apiKey.permissions,
                rate_limit: apiKey.rateLimit,
                created_at: apiKey.createdAt
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to create API key', { error });
        res.status(500).json({
            success: false,
            error: 'Failed to create API key'
        });
    }
});
exports.billingRouter.post('/webhooks/stripe', async (req, res) => {
    try {
        const signature = req.headers['stripe-signature'];
        if (!signature) {
            logger_1.logger.warn('Stripe webhook missing signature');
            return res.status(400).send('Missing signature');
        }
        if (environment_1.config.app.env === 'production' && environment_1.config.stripe.webhookSecret) {
        }
        const event = req.body;
        logger_1.logger.info('Processing Stripe webhook', {
            type: event.type,
            id: event.id
        });
        await stripe_service_1.stripeService.handleWebhook(event);
        res.json({ received: true });
    }
    catch (error) {
        logger_1.logger.error('Failed to process Stripe webhook', { error });
        res.status(500).json({
            success: false,
            error: 'Webhook processing failed'
        });
    }
});
const validateApiKey = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];
        if (!apiKey) {
            return res.status(401).json({
                success: false,
                error: 'API key required'
            });
        }
        const validation = await customer_service_1.customerService.validateApiRequest(apiKey, 'api_call');
        if (!validation.allowed) {
            return res.status(validation.reason?.includes('quota') ? 429 : 401).json({
                success: false,
                error: validation.reason
            });
        }
        req.customer = validation.customer;
        req.apiKey = apiKey;
        next();
    }
    catch (error) {
        logger_1.logger.error('API key validation failed', { error });
        res.status(500).json({
            success: false,
            error: 'Authentication failed'
        });
    }
};
exports.validateApiKey = validateApiKey;
const validateUsage = (requestType) => {
    return async (req, res, next) => {
        try {
            const apiKey = req.apiKey || req.headers['x-api-key'];
            if (!apiKey) {
                return res.status(401).json({
                    success: false,
                    error: 'API key required'
                });
            }
            const validation = await customer_service_1.customerService.validateApiRequest(apiKey, requestType);
            if (!validation.allowed) {
                return res.status(429).json({
                    success: false,
                    error: validation.reason,
                    quota_exceeded: true,
                    upgrade_url: `${environment_1.config.saas.baseUrl}/pricing`
                });
            }
            next();
        }
        catch (error) {
            logger_1.logger.error('Usage validation failed', { error, requestType });
            res.status(500).json({
                success: false,
                error: 'Usage validation failed'
            });
        }
    };
};
exports.validateUsage = validateUsage;
//# sourceMappingURL=billing.js.map