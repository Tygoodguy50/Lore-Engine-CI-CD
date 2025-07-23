"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerService = exports.CustomerService = void 0;
const stripe_service_1 = require("./stripe-service");
const logger_1 = require("../utils/logger");
const environment_1 = require("../config/environment");
const events_1 = require("events");
class CustomerService extends events_1.EventEmitter {
    constructor() {
        super();
        this.customers = new Map();
        this.apiKeys = new Map();
        this.usage = new Map();
        this.setupStripeEventHandlers();
        this.startUsageResetTask();
    }
    setupStripeEventHandlers() {
        stripe_service_1.stripeService.on('customer:created', (customer) => {
            this.handleCustomerCreated(customer);
        });
        stripe_service_1.stripeService.on('customer:lookup', (stripeCustomerId, callback) => {
            const customer = Array.from(this.customers.values())
                .find(c => c.stripeCustomerId === stripeCustomerId);
            callback(customer || null);
        });
        stripe_service_1.stripeService.on('subscription:updated', (data) => {
            this.handleSubscriptionUpdated(data);
        });
        stripe_service_1.stripeService.on('subscription:cancelled', (customer) => {
            this.handleSubscriptionCancelled(customer);
        });
        stripe_service_1.stripeService.on('payment:failed', (invoice) => {
            this.handlePaymentFailed(invoice);
        });
        stripe_service_1.stripeService.on('email:welcome', (data) => {
            this.sendWelcomeEmail(data.customer, data.tier);
        });
    }
    async createSubscription(tierID, customerEmail, metadata) {
        try {
            logger_1.logger.info('Creating new subscription', { tier: tierID, email: customerEmail });
            const baseUrl = environment_1.config.saas.baseUrl;
            const successUrl = `${environment_1.config.saas.dashboardUrl}/onboarding/success`;
            const cancelUrl = `${environment_1.config.saas.dashboardUrl}/pricing`;
            const checkout = await stripe_service_1.stripeService.createCheckoutSession(tierID, customerEmail, successUrl, cancelUrl);
            logger_1.logger.info('Checkout session created', {
                sessionId: checkout.sessionId,
                tier: tierID
            });
            return {
                checkoutUrl: checkout.url,
                sessionId: checkout.sessionId
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to create subscription', { error, tierID, customerEmail });
            throw error;
        }
    }
    async completeOnboarding(sessionId) {
        try {
            const customer = await stripe_service_1.stripeService.handleSuccessfulPayment(sessionId);
            const apiKey = await this.createApiKey(customer.id, {
                name: 'Primary API Key',
                permissions: ['all']
            });
            this.initializeUsageTracking(customer.id);
            logger_1.logger.info('Customer onboarding completed', {
                customerId: customer.id,
                tier: customer.subscriptionTier
            });
            return {
                customer,
                apiKey: apiKey.key,
                dashboardUrl: `${environment_1.config.saas.dashboardUrl}/dashboard?api_key=${apiKey.key}`
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to complete onboarding', { error, sessionId });
            throw error;
        }
    }
    async getCustomerByApiKey(apiKey) {
        const keyRecord = this.apiKeys.get(apiKey);
        if (!keyRecord || !keyRecord.isActive) {
            return null;
        }
        keyRecord.lastUsed = new Date();
        return this.customers.get(keyRecord.customerId) || null;
    }
    async validateApiRequest(apiKey, requestType) {
        const customer = await this.getCustomerByApiKey(apiKey);
        if (!customer) {
            return { allowed: false, reason: 'Invalid API key' };
        }
        if (customer.subscriptionStatus !== 'active') {
            return { allowed: false, reason: 'Subscription not active' };
        }
        const isAllowed = stripe_service_1.stripeService.validateUsage(customer, requestType);
        if (!isAllowed) {
            return {
                allowed: false,
                customer,
                reason: `${requestType} quota exceeded for ${customer.subscriptionTier} tier`
            };
        }
        await this.incrementUsage(customer.id, requestType);
        return { allowed: true, customer };
    }
    async createApiKey(customerId, options) {
        const customer = this.customers.get(customerId);
        if (!customer) {
            throw new Error('Customer not found');
        }
        const keyId = this.generateId();
        const keyValue = this.generateApiKeyValue(customerId, keyId);
        const apiKey = {
            id: keyId,
            customerId,
            key: keyValue,
            name: options.name,
            permissions: options.permissions,
            isActive: true,
            createdAt: new Date(),
            rateLimit: {
                requestsPerMinute: options.customLimits?.requestsPerMinute || 60,
                requestsPerHour: options.customLimits?.requestsPerHour || 3600,
                requestsPerDay: options.customLimits?.requestsPerDay || 86400,
            }
        };
        this.apiKeys.set(keyValue, apiKey);
        logger_1.logger.info('API key created', {
            customerId,
            keyId,
            name: options.name
        });
        return apiKey;
    }
    async getCustomerDashboard(customerId) {
        const customer = this.customers.get(customerId);
        if (!customer) {
            throw new Error('Customer not found');
        }
        const currentMonth = new Date().toISOString().slice(0, 7);
        const usage = this.usage.get(`${customerId}:${currentMonth}`) || {
            customerId,
            month: currentMonth,
            eventsProcessed: 0,
            conflictsDetected: 0,
            apiCalls: 0,
            webhooksDelivered: 0,
            realtimeMinutes: 0
        };
        const billing = await stripe_service_1.stripeService.getUsageStats(customer.stripeCustomerId);
        const customerApiKeys = Array.from(this.apiKeys.values())
            .filter(key => key.customerId === customerId);
        return {
            customer,
            usage,
            billing,
            apiKeys: customerApiKeys
        };
    }
    async changeSubscription(customerId, newTierID) {
        const customer = this.customers.get(customerId);
        if (!customer) {
            throw new Error('Customer not found');
        }
        await stripe_service_1.stripeService.updateSubscription(customer.stripeCustomerId, newTierID);
        customer.subscriptionTier = newTierID;
        this.customers.set(customerId, customer);
        logger_1.logger.info('Subscription changed', {
            customerId,
            newTier: newTierID
        });
    }
    async cancelSubscription(customerId) {
        const customer = this.customers.get(customerId);
        if (!customer) {
            throw new Error('Customer not found');
        }
        await stripe_service_1.stripeService.cancelSubscription(customer.stripeCustomerId);
        logger_1.logger.info('Subscription cancelled', { customerId });
    }
    async handleCustomerCreated(customer) {
        this.customers.set(customer.id, customer);
        this.initializeUsageTracking(customer.id);
        logger_1.logger.info('Customer provisioned', {
            customerId: customer.id,
            tier: customer.subscriptionTier
        });
    }
    async handleSubscriptionUpdated(data) {
        logger_1.logger.info('Subscription updated via webhook', data);
    }
    async handleSubscriptionCancelled(customer) {
        customer.subscriptionStatus = 'canceled';
        this.customers.set(customer.id, customer);
        setTimeout(() => {
            this.deactivateCustomerApiKeys(customer.id);
        }, environment_1.config.saas.gracePeriodDays * 24 * 60 * 60 * 1000);
    }
    async handlePaymentFailed(invoice) {
        logger_1.logger.warn('Payment failed for customer', {
            customerId: invoice.customer,
            amount: invoice.amount_due
        });
        this.emit('notification:payment_failed', {
            customerId: invoice.customer,
            amount: invoice.amount_due
        });
    }
    async sendWelcomeEmail(customer, tier) {
        logger_1.logger.info('Sending welcome email', {
            customerId: customer.id,
            email: customer.email
        });
        this.emit('email:send', {
            to: customer.email,
            template: 'welcome',
            data: {
                customer,
                tier,
                dashboardUrl: environment_1.config.saas.dashboardUrl,
                apiKey: customer.apiKey,
                supportEmail: environment_1.config.saas.supportEmail
            }
        });
    }
    initializeUsageTracking(customerId) {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const usageKey = `${customerId}:${currentMonth}`;
        if (!this.usage.has(usageKey)) {
            this.usage.set(usageKey, {
                customerId,
                month: currentMonth,
                eventsProcessed: 0,
                conflictsDetected: 0,
                apiCalls: 0,
                webhooksDelivered: 0,
                realtimeMinutes: 0
            });
        }
    }
    async incrementUsage(customerId, type) {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const usageKey = `${customerId}:${currentMonth}`;
        const usage = this.usage.get(usageKey);
        if (usage) {
            switch (type) {
                case 'event_processing':
                    usage.eventsProcessed++;
                    break;
                case 'conflict_detection':
                    usage.conflictsDetected++;
                    break;
                case 'api_call':
                    usage.apiCalls++;
                    break;
                case 'webhook':
                    usage.webhooksDelivered++;
                    break;
                case 'realtime':
                    usage.realtimeMinutes++;
                    break;
            }
            this.usage.set(usageKey, usage);
        }
    }
    deactivateCustomerApiKeys(customerId) {
        Array.from(this.apiKeys.entries()).forEach(([key, apiKey]) => {
            if (apiKey.customerId === customerId) {
                apiKey.isActive = false;
                this.apiKeys.set(key, apiKey);
            }
        });
    }
    startUsageResetTask() {
        setInterval(() => {
            const now = new Date();
            if (now.getDate() === 1 && now.getHours() === 0) {
                this.resetMonthlyUsage();
            }
        }, 60 * 60 * 1000);
    }
    resetMonthlyUsage() {
        const currentMonth = new Date().toISOString().slice(0, 7);
        Array.from(this.customers.keys()).forEach(customerId => {
            this.initializeUsageTracking(customerId);
        });
        logger_1.logger.info('Monthly usage counters reset', { month: currentMonth });
    }
    generateId() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
    generateApiKeyValue(customerId, keyId) {
        const prefix = 'lore';
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2);
        return `${prefix}_${timestamp}_${random}_${keyId.substring(0, 8)}`;
    }
}
exports.CustomerService = CustomerService;
exports.customerService = new CustomerService();
//# sourceMappingURL=customer-service.js.map