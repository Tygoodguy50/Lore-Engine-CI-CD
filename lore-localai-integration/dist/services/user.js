"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const logger_js_1 = require("../utils/logger.js");
const environment_js_1 = require("../config/environment.js");
class UserService {
    static async createFromStripeSession(session, customer) {
        const userId = crypto_1.default.randomUUID();
        const apiKey = this.generateApiKey(userId);
        const user = {
            id: userId,
            email: customer.email,
            stripeCustomerId: customer.id,
            subscriptionTier: 'free',
            apiKey,
            createdAt: new Date(),
            isActive: true,
            metadata: {
                signupSource: 'stripe_checkout',
                sessionId: session.id,
                referralCode: session.metadata?.referralCode,
            },
        };
        this.users.set(userId, user);
        this.emailToUserId.set(customer.email, userId);
        logger_js_1.logger.info('User created from Stripe session', {
            userId,
            email: customer.email,
            customerId: customer.id,
        });
        return user;
    }
    static async updateSubscriptionTier(stripeCustomerId, stripePriceId) {
        const user = this.findUserByStripeId(stripeCustomerId);
        if (!user) {
            logger_js_1.logger.error('User not found for subscription update', { stripeCustomerId });
            return;
        }
        const tier = this.mapPriceIdToTier(stripePriceId);
        user.subscriptionTier = tier;
        this.users.set(user.id, user);
        logger_js_1.logger.info('User subscription tier updated', {
            userId: user.id,
            email: user.email,
            newTier: tier,
            stripePriceId,
        });
    }
    static async downgradeToFreeTier(stripeCustomerId) {
        const user = this.findUserByStripeId(stripeCustomerId);
        if (!user) {
            logger_js_1.logger.error('User not found for downgrade', { stripeCustomerId });
            return;
        }
        user.subscriptionTier = 'free';
        this.users.set(user.id, user);
        logger_js_1.logger.info('User downgraded to free tier', {
            userId: user.id,
            email: user.email,
        });
    }
    static async extendAccess(stripeCustomerId) {
        const user = this.findUserByStripeId(stripeCustomerId);
        if (!user) {
            logger_js_1.logger.error('User not found for access extension', { stripeCustomerId });
            return;
        }
        user.isActive = true;
        user.lastLoginAt = new Date();
        this.users.set(user.id, user);
        logger_js_1.logger.info('User access extended', {
            userId: user.id,
            email: user.email,
        });
    }
    static async startDunningProcess(stripeCustomerId) {
        const user = this.findUserByStripeId(stripeCustomerId);
        if (!user) {
            logger_js_1.logger.error('User not found for dunning process', { stripeCustomerId });
            return;
        }
        logger_js_1.logger.info('Dunning process started', {
            userId: user.id,
            email: user.email,
        });
    }
    static generateApiKey(userId) {
        const timestamp = Date.now().toString();
        const hash = crypto_1.default
            .createHmac('sha256', environment_js_1.config.security.jwtSecret)
            .update(`${userId}:${timestamp}`)
            .digest('hex');
        return `lore_sk_${hash.slice(0, 32)}`;
    }
    static mapPriceIdToTier(priceId) {
        switch (priceId) {
            case environment_js_1.config.stripe.priceIds.basic:
                return 'observer';
            case environment_js_1.config.stripe.priceIds.pro:
                return 'architect';
            case environment_js_1.config.stripe.priceIds.enterprise:
                return 'master';
            default:
                logger_js_1.logger.warn('Unknown price ID, defaulting to free tier', { priceId });
                return 'free';
        }
    }
    static findUserByStripeId(stripeCustomerId) {
        for (const user of this.users.values()) {
            if (user.stripeCustomerId === stripeCustomerId) {
                return user;
            }
        }
        return undefined;
    }
    static async getUserById(userId) {
        return this.users.get(userId);
    }
    static async getUserByEmail(email) {
        const userId = this.emailToUserId.get(email);
        return userId ? this.users.get(userId) : undefined;
    }
    static async getUserByApiKey(apiKey) {
        for (const user of this.users.values()) {
            if (user.apiKey === apiKey) {
                return user;
            }
        }
        return undefined;
    }
    static getSubscriptionLimits(tier) {
        return this.tierLimits[tier] || this.tierLimits.free;
    }
    static hasFeatureAccess(user, feature) {
        const limits = this.getSubscriptionLimits(user.subscriptionTier);
        return limits.features.includes(feature) || limits.features.includes('everything');
    }
    static async getAllUsers() {
        return Array.from(this.users.values());
    }
    static async updateUser(userId, updates) {
        const user = this.users.get(userId);
        if (!user) {
            return undefined;
        }
        const updatedUser = { ...user, ...updates };
        this.users.set(userId, updatedUser);
        if (updates.email && updates.email !== user.email) {
            this.emailToUserId.delete(user.email);
            this.emailToUserId.set(updates.email, userId);
        }
        logger_js_1.logger.info('User updated', { userId, updates: Object.keys(updates) });
        return updatedUser;
    }
    static async deleteUser(userId) {
        const user = this.users.get(userId);
        if (!user) {
            return false;
        }
        this.users.delete(userId);
        this.emailToUserId.delete(user.email);
        logger_js_1.logger.info('User deleted', { userId, email: user.email });
        return true;
    }
}
exports.UserService = UserService;
UserService.users = new Map();
UserService.emailToUserId = new Map();
UserService.tierLimits = {
    free: {
        eventsPerMonth: 100,
        conflictDetections: 50,
        realtimeConnections: 1,
        apiCallsPerMinute: 10,
        features: ['basic_dashboard'],
    },
    observer: {
        eventsPerMonth: 1000,
        conflictDetections: 500,
        realtimeConnections: 5,
        apiCallsPerMinute: 60,
        features: ['basic_dashboard', 'email_support'],
    },
    architect: {
        eventsPerMonth: 10000,
        conflictDetections: 5000,
        realtimeConnections: 25,
        apiCallsPerMinute: 300,
        features: ['advanced_analytics', 'priority_support', 'custom_integrations'],
    },
    master: {
        eventsPerMonth: -1,
        conflictDetections: -1,
        realtimeConnections: 100,
        apiCallsPerMinute: 1000,
        features: ['everything', 'dedicated_support', 'sla_guarantees', 'white_label'],
    },
};
//# sourceMappingURL=user.js.map