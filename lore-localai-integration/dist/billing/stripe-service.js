"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeService = exports.StripeService = exports.SUBSCRIPTION_TIERS = void 0;
const stripe_1 = __importDefault(require("stripe"));
const environment_1 = require("../config/environment");
const logger_1 = require("../utils/logger");
const events_1 = require("events");
exports.SUBSCRIPTION_TIERS = [
    {
        id: 'basic',
        name: 'Lore Observer',
        description: 'Perfect for individuals exploring the lore realm',
        price: 9.99,
        interval: 'month',
        features: [
            'Real-time lore processing',
            'Discord notifications',
            'Basic conflict detection',
            'Community dashboard access',
            'Email support'
        ],
        limits: {
            eventsPerMonth: 1000,
            conflictDetections: 100,
            realtimeConnections: 5,
            apiCallsPerMinute: 60,
            webhookEndpoints: 2,
            dashboardAccess: true,
            prioritySupport: false,
            customIntegrations: false
        },
        stripePriceId: process.env.STRIPE_BASIC_PRICE_ID || 'price_basic'
    },
    {
        id: 'pro',
        name: 'Lore Architect',
        description: 'For creators building immersive lore experiences',
        price: 29.99,
        interval: 'month',
        features: [
            'Multi-platform dispatch (Discord, TikTok, Markdown)',
            'Advanced conflict detection & resolution',
            'Real-time WebSocket feeds',
            'Sentiment analysis & filtering',
            'Custom webhook endpoints',
            'Analytics dashboard',
            'Priority support'
        ],
        limits: {
            eventsPerMonth: 10000,
            conflictDetections: 1000,
            realtimeConnections: 25,
            apiCallsPerMinute: 300,
            webhookEndpoints: 10,
            dashboardAccess: true,
            prioritySupport: true,
            customIntegrations: false
        },
        stripePriceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro'
    },
    {
        id: 'enterprise',
        name: 'Lore Master',
        description: 'For studios and enterprises scaling lore universes',
        price: 99.99,
        interval: 'month',
        features: [
            'Unlimited event processing',
            'Custom agent plugins',
            'White-label dashboard',
            'Advanced integrations (LangChain, n8n)',
            'Real-time collaboration tools',
            'Custom SLA & dedicated support',
            'On-premise deployment options'
        ],
        limits: {
            eventsPerMonth: -1,
            conflictDetections: -1,
            realtimeConnections: 100,
            apiCallsPerMinute: 1000,
            webhookEndpoints: 50,
            dashboardAccess: true,
            prioritySupport: true,
            customIntegrations: true
        },
        stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise'
    }
];
class StripeService extends events_1.EventEmitter {
    constructor() {
        super();
        this.stripe = new stripe_1.default(environment_1.config.stripe.secretKey, {
            apiVersion: '2023-08-16'
        });
    }
    async createCheckoutSession(tierID, customerEmail, successUrl, cancelUrl) {
        try {
            const tier = exports.SUBSCRIPTION_TIERS.find(t => t.id === tierID);
            if (!tier) {
                throw new Error(`Invalid subscription tier: ${tierID}`);
            }
            logger_1.logger.info('Creating Stripe checkout session', {
                tier: tier.name,
                email: customerEmail,
                price: tier.price
            });
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                customer_email: customerEmail,
                line_items: [
                    {
                        price: tier.stripePriceId,
                        quantity: 1
                    }
                ],
                mode: 'subscription',
                success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: cancelUrl,
                metadata: {
                    tier: tierID,
                    email: customerEmail
                },
                subscription_data: {
                    metadata: {
                        tier: tierID,
                        email: customerEmail
                    }
                }
            });
            return {
                url: session.url,
                sessionId: session.id
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to create checkout session', { error, tierID, customerEmail });
            throw error;
        }
    }
    async handleSuccessfulPayment(sessionId) {
        try {
            const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
                expand: ['subscription', 'customer']
            });
            if (!session.subscription || !session.customer) {
                throw new Error('Invalid session - missing subscription or customer');
            }
            const subscription = session.subscription;
            const customer = session.customer;
            const tierID = session.metadata?.tier;
            if (!tierID) {
                throw new Error('Missing tier information in session metadata');
            }
            logger_1.logger.info('Provisioning customer services', {
                customerId: customer.id,
                subscriptionId: subscription.id,
                tier: tierID
            });
            const apiKey = this.generateApiKey(customer.id, tierID);
            const newCustomer = {
                id: customer.id,
                stripeCustomerId: customer.id,
                email: customer.email,
                subscriptionTier: tierID,
                subscriptionStatus: subscription.status,
                subscriptionId: subscription.id,
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                createdAt: new Date(),
                apiKey,
                usageStats: {
                    eventsThisMonth: 0,
                    conflictsDetected: 0,
                    lastApiCall: new Date()
                }
            };
            this.emit('customer:created', newCustomer);
            this.emit('email:welcome', {
                customer: newCustomer,
                tier: exports.SUBSCRIPTION_TIERS.find(t => t.id === tierID)
            });
            logger_1.logger.info('Customer successfully provisioned', {
                customerId: customer.id,
                tier: tierID,
                apiKey: apiKey.substring(0, 8) + '...'
            });
            return newCustomer;
        }
        catch (error) {
            logger_1.logger.error('Failed to handle successful payment', { error, sessionId });
            throw error;
        }
    }
    async updateSubscription(customerId, newTierID) {
        try {
            const customer = await this.getCustomerByStripeId(customerId);
            if (!customer?.subscriptionId) {
                throw new Error('Customer has no active subscription');
            }
            const newTier = exports.SUBSCRIPTION_TIERS.find(t => t.id === newTierID);
            if (!newTier) {
                throw new Error(`Invalid tier: ${newTierID}`);
            }
            const subscription = await this.stripe.subscriptions.retrieve(customer.subscriptionId);
            const updatedSubscription = await this.stripe.subscriptions.update(subscription.id, {
                items: [
                    {
                        id: subscription.items.data[0].id,
                        price: newTier.stripePriceId
                    }
                ],
                metadata: {
                    tier: newTierID
                }
            });
            logger_1.logger.info('Subscription updated', {
                customerId,
                oldTier: customer.subscriptionTier,
                newTier: newTierID,
                subscriptionId: subscription.id
            });
            this.emit('subscription:updated', {
                customer,
                oldTier: customer.subscriptionTier,
                newTier: newTierID
            });
            return updatedSubscription;
        }
        catch (error) {
            logger_1.logger.error('Failed to update subscription', { error, customerId, newTierID });
            throw error;
        }
    }
    async cancelSubscription(customerId) {
        try {
            const customer = await this.getCustomerByStripeId(customerId);
            if (!customer?.subscriptionId) {
                throw new Error('Customer has no active subscription');
            }
            await this.stripe.subscriptions.update(customer.subscriptionId, {
                cancel_at_period_end: true
            });
            logger_1.logger.info('Subscription cancelled', {
                customerId,
                subscriptionId: customer.subscriptionId
            });
            this.emit('subscription:cancelled', customer);
        }
        catch (error) {
            logger_1.logger.error('Failed to cancel subscription', { error, customerId });
            throw error;
        }
    }
    async handleWebhook(event) {
        try {
            logger_1.logger.info('Processing Stripe webhook', { type: event.type, id: event.id });
            switch (event.type) {
                case 'customer.subscription.updated':
                    await this.handleSubscriptionUpdated(event.data.object);
                    break;
                case 'customer.subscription.deleted':
                    await this.handleSubscriptionDeleted(event.data.object);
                    break;
                case 'invoice.payment_failed':
                    await this.handlePaymentFailed(event.data.object);
                    break;
                case 'invoice.payment_succeeded':
                    await this.handlePaymentSucceeded(event.data.object);
                    break;
                default:
                    logger_1.logger.debug('Unhandled webhook event', { type: event.type });
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to process webhook', { error, eventType: event.type });
            throw error;
        }
    }
    validateUsage(customer, requestType) {
        const tier = exports.SUBSCRIPTION_TIERS.find(t => t.id === customer.subscriptionTier);
        if (!tier)
            return false;
        switch (requestType) {
            case 'api_call':
                return true;
            case 'event_processing':
                if (tier.limits.eventsPerMonth === -1)
                    return true;
                return customer.usageStats.eventsThisMonth < tier.limits.eventsPerMonth;
            case 'conflict_detection':
                if (tier.limits.conflictDetections === -1)
                    return true;
                return customer.usageStats.conflictsDetected < tier.limits.conflictDetections;
            case 'webhook_endpoint':
                return true;
            case 'dashboard_access':
                return tier.limits.dashboardAccess;
            default:
                return false;
        }
    }
    async getUsageStats(customerId) {
        const customer = await this.getCustomerByStripeId(customerId);
        if (!customer)
            throw new Error('Customer not found');
        const tier = exports.SUBSCRIPTION_TIERS.find(t => t.id === customer.subscriptionTier);
        return {
            customer: {
                id: customer.id,
                email: customer.email,
                tier: tier?.name,
                status: customer.subscriptionStatus
            },
            usage: customer.usageStats,
            limits: tier?.limits,
            billingInfo: {
                currentPeriodEnd: customer.currentPeriodEnd,
                nextBillingAmount: tier?.price
            }
        };
    }
    generateApiKey(customerId, tier) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2);
        return `lore_${tier}_${timestamp}_${random}`;
    }
    async getCustomerByStripeId(stripeCustomerId) {
        return new Promise((resolve) => {
            this.emit('customer:lookup', stripeCustomerId, resolve);
        });
    }
    async handleSubscriptionUpdated(subscription) {
        logger_1.logger.info('Subscription updated', { subscriptionId: subscription.id });
        this.emit('subscription:updated', subscription);
    }
    async handleSubscriptionDeleted(subscription) {
        logger_1.logger.info('Subscription deleted', { subscriptionId: subscription.id });
        this.emit('subscription:deleted', subscription);
    }
    async handlePaymentFailed(invoice) {
        logger_1.logger.warn('Payment failed', {
            customerId: invoice.customer,
            invoiceId: invoice.id,
            amount: invoice.amount_due
        });
        this.emit('payment:failed', invoice);
    }
    async handlePaymentSucceeded(invoice) {
        logger_1.logger.info('Payment succeeded', {
            customerId: invoice.customer,
            invoiceId: invoice.id,
            amount: invoice.amount_paid
        });
        this.emit('payment:succeeded', invoice);
    }
}
exports.StripeService = StripeService;
exports.stripeService = new StripeService();
//# sourceMappingURL=stripe-service.js.map