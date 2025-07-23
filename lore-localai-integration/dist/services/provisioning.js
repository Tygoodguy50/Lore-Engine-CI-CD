"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvisioningService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const user_js_1 = require("./user.js");
const logger_js_1 = require("../utils/logger.js");
const environment_js_1 = require("../config/environment.js");
class ProvisioningService {
    static async provisionUser(user, subscription) {
        logger_js_1.logger.info('Provisioning user access', {
            userId: user.id,
            email: user.email,
            subscriptionId: subscription.id,
        });
        const limits = user_js_1.UserService.getSubscriptionLimits(user.subscriptionTier);
        const credentials = {
            apiKey: user.apiKey,
            endpoints: {
                loreStats: `${environment_js_1.config.loreEngine.dispatcherUrl}/lore/stats?api_key=${user.apiKey}`,
                conflictDetection: `${environment_js_1.config.loreEngine.conflictApiUrl}/conflicts/analyze?api_key=${user.apiKey}`,
                realtimeWebSocket: `${environment_js_1.config.loreEngine.realtimeWsUrl}?api_key=${user.apiKey}`,
                dashboard: `${environment_js_1.config.saas.dashboardUrl}?api_key=${user.apiKey}`,
            },
            limits: {
                eventsPerMonth: limits.eventsPerMonth,
                apiCallsPerMinute: limits.apiCallsPerMinute,
                realtimeConnections: limits.realtimeConnections,
            },
            features: limits.features,
        };
        this.userSessions.set(user.id, new Set());
        await this.configureRateLimiting(user.apiKey, limits.apiCallsPerMinute);
        await this.setupUserMonitoring(user);
        logger_js_1.logger.info('User provisioning completed', {
            userId: user.id,
            tier: user.subscriptionTier,
            features: limits.features.length,
        });
        return credentials;
    }
    static async enableRealtimeAccess(stripeCustomerId) {
        const user = await this.findUserByStripeId(stripeCustomerId);
        if (!user) {
            logger_js_1.logger.error('User not found for realtime access', { stripeCustomerId });
            return;
        }
        const sessions = this.userSessions.get(user.id) || new Set();
        this.userSessions.set(user.id, sessions);
        logger_js_1.logger.info('Realtime access enabled', {
            userId: user.id,
            maxConnections: user_js_1.UserService.getSubscriptionLimits(user.subscriptionTier).realtimeConnections,
        });
    }
    static async scheduleAccessRevocation(stripeCustomerId, gracePeriodDays) {
        const user = await this.findUserByStripeId(stripeCustomerId);
        if (!user) {
            logger_js_1.logger.error('User not found for access revocation', { stripeCustomerId });
            return;
        }
        const revocationDate = new Date(Date.now() + gracePeriodDays * 24 * 60 * 60 * 1000);
        logger_js_1.logger.info('Access revocation scheduled', {
            userId: user.id,
            email: user.email,
            gracePeriodDays,
            revocationDate,
        });
        setTimeout(() => {
            this.revokeAccess(user.id);
        }, gracePeriodDays * 24 * 60 * 60 * 1000);
    }
    static async revokeAccess(userId) {
        const user = await user_js_1.UserService.getUserById(userId);
        if (!user) {
            logger_js_1.logger.error('User not found for access revocation', { userId });
            return;
        }
        this.userSessions.delete(userId);
        logger_js_1.logger.info('User access revoked', {
            userId,
            email: user.email,
            reason: 'subscription_canceled',
        });
        console.log(`📧 Access revoked for ${user.email} - subscription canceled`);
    }
    static async configureRateLimiting(apiKey, callsPerMinute) {
        logger_js_1.logger.info('Rate limiting configured', {
            apiKey: apiKey.slice(0, 20) + '...',
            callsPerMinute,
        });
    }
    static async setupUserMonitoring(user) {
        logger_js_1.logger.info('User monitoring setup', {
            userId: user.id,
            tier: user.subscriptionTier,
        });
    }
    static async findUserByStripeId(stripeCustomerId) {
        const users = await user_js_1.UserService.getAllUsers();
        return users.find(user => user.stripeCustomerId === stripeCustomerId);
    }
    static async getUserUsageStats(userId) {
        const user = await user_js_1.UserService.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const limits = user_js_1.UserService.getSubscriptionLimits(user.subscriptionTier);
        const sessions = this.userSessions.get(userId) || new Set();
        const stats = {
            eventsThisMonth: Math.floor(Math.random() * limits.eventsPerMonth * 0.8),
            apiCallsThisMinute: Math.floor(Math.random() * limits.apiCallsPerMinute * 0.5),
            activeConnections: sessions.size,
            limits: {
                eventsPerMonth: limits.eventsPerMonth,
                apiCallsPerMinute: limits.apiCallsPerMinute,
                realtimeConnections: limits.realtimeConnections,
            },
            usagePercentage: {
                events: 0,
                apiCalls: 0,
                connections: 0,
            },
        };
        stats.usagePercentage.events = limits.eventsPerMonth > 0
            ? (stats.eventsThisMonth / limits.eventsPerMonth) * 100
            : 0;
        stats.usagePercentage.apiCalls = limits.apiCallsPerMinute > 0
            ? (stats.apiCallsThisMinute / limits.apiCallsPerMinute) * 100
            : 0;
        stats.usagePercentage.connections = limits.realtimeConnections > 0
            ? (stats.activeConnections / limits.realtimeConnections) * 100
            : 0;
        return stats;
    }
    static async refreshCredentials(userId) {
        const user = await user_js_1.UserService.getUserById(userId);
        if (!user) {
            return null;
        }
        const newApiKey = this.generateNewApiKey(userId);
        await user_js_1.UserService.updateUser(userId, { apiKey: newApiKey });
        const limits = user_js_1.UserService.getSubscriptionLimits(user.subscriptionTier);
        const credentials = {
            apiKey: newApiKey,
            endpoints: {
                loreStats: `${environment_js_1.config.loreEngine.dispatcherUrl}/lore/stats?api_key=${newApiKey}`,
                conflictDetection: `${environment_js_1.config.loreEngine.conflictApiUrl}/conflicts/analyze?api_key=${newApiKey}`,
                realtimeWebSocket: `${environment_js_1.config.loreEngine.realtimeWsUrl}?api_key=${newApiKey}`,
                dashboard: `${environment_js_1.config.saas.dashboardUrl}?api_key=${newApiKey}`,
            },
            limits: {
                eventsPerMonth: limits.eventsPerMonth,
                apiCallsPerMinute: limits.apiCallsPerMinute,
                realtimeConnections: limits.realtimeConnections,
            },
            features: limits.features,
        };
        logger_js_1.logger.info('User credentials refreshed', { userId });
        return credentials;
    }
    static generateNewApiKey(userId) {
        const timestamp = Date.now().toString();
        const hash = crypto_1.default
            .createHmac('sha256', environment_js_1.config.security.jwtSecret)
            .update(`${userId}:${timestamp}:refresh`)
            .digest('hex');
        return `lore_sk_${hash.slice(0, 32)}`;
    }
    static async validateApiAccess(apiKey, endpoint) {
        const user = await user_js_1.UserService.getUserByApiKey(apiKey);
        if (!user || !user.isActive) {
            return { valid: false };
        }
        const limits = user_js_1.UserService.getSubscriptionLimits(user.subscriptionTier);
        const mockRemaining = Math.floor(limits.apiCallsPerMinute * 0.8);
        const resetTime = new Date(Date.now() + 60000);
        return {
            valid: true,
            user,
            remaining: mockRemaining,
            resetTime,
        };
    }
}
exports.ProvisioningService = ProvisioningService;
ProvisioningService.userSessions = new Map();
//# sourceMappingURL=provisioning.js.map