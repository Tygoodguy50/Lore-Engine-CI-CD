"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordWebhookService = void 0;
const environment_js_1 = require("../config/environment.js");
const logger_js_1 = require("../utils/logger.js");
class DiscordWebhookService {
    static async sendSubscriptionNotification(notification) {
        if (!this.webhookUrl) {
            logger_js_1.logger.warn('Discord webhook URL not configured');
            return;
        }
        try {
            let embed;
            switch (notification.event) {
                case 'new_subscription':
                    embed = this.createNewSubscriptionEmbed(notification);
                    break;
                case 'subscription_updated':
                    embed = this.createSubscriptionUpdatedEmbed(notification);
                    break;
                case 'subscription_canceled':
                    embed = this.createSubscriptionCanceledEmbed(notification);
                    break;
                default:
                    logger_js_1.logger.warn('Unknown subscription event type', { event: notification.event });
                    return;
            }
            await this.sendToDiscord({
                embeds: [embed],
                username: this.botName,
                avatar_url: this.avatarUrl,
            });
            logger_js_1.logger.info('Discord subscription notification sent', {
                event: notification.event,
                user: notification.user || notification.customerId,
            });
        }
        catch (error) {
            logger_js_1.logger.error('Failed to send Discord subscription notification:', error);
        }
    }
    static async sendPaymentFailedNotification(notification) {
        if (!this.webhookUrl) {
            logger_js_1.logger.warn('Discord webhook URL not configured');
            return;
        }
        try {
            const embed = {
                title: '💳 Payment Failed',
                description: `Payment failure requires attention`,
                color: this.colors.error,
                fields: [
                    {
                        name: '👤 Customer',
                        value: notification.customerId,
                        inline: true,
                    },
                    {
                        name: '💰 Amount',
                        value: `$${notification.amount.toFixed(2)}`,
                        inline: true,
                    },
                    {
                        name: '🔄 Attempt',
                        value: `${notification.attemptCount}`,
                        inline: true,
                    },
                ],
                footer: {
                    text: 'Lore Engine SaaS - Payment Processing',
                },
                timestamp: new Date().toISOString(),
            };
            await this.sendToDiscord({
                embeds: [embed],
                username: this.botName,
                avatar_url: this.avatarUrl,
            });
            logger_js_1.logger.info('Discord payment failed notification sent', {
                customerId: notification.customerId,
                amount: notification.amount,
            });
        }
        catch (error) {
            logger_js_1.logger.error('Failed to send Discord payment failed notification:', error);
        }
    }
    static async sendReferralNotification(notification) {
        if (!this.webhookUrl) {
            logger_js_1.logger.warn('Discord webhook URL not configured');
            return;
        }
        try {
            let embed;
            switch (notification.event) {
                case 'referral_generated':
                    embed = this.createReferralGeneratedEmbed(notification);
                    break;
                case 'referral_used':
                    embed = this.createReferralUsedEmbed(notification);
                    break;
                case 'referral_completed':
                    embed = this.createReferralCompletedEmbed(notification);
                    break;
                default:
                    logger_js_1.logger.warn('Unknown referral event type', { event: notification.event });
                    return;
            }
            await this.sendToDiscord({
                embeds: [embed],
                username: this.botName,
                avatar_url: this.avatarUrl,
            });
            logger_js_1.logger.info('Discord referral notification sent', {
                event: notification.event,
                referralCode: notification.referralCode,
            });
        }
        catch (error) {
            logger_js_1.logger.error('Failed to send Discord referral notification:', error);
        }
    }
    static async sendDailySummary(stats) {
        if (!this.webhookUrl) {
            logger_js_1.logger.warn('Discord webhook URL not configured');
            return;
        }
        try {
            const embed = {
                title: '📊 Daily Summary',
                description: 'Your Lore Engine SaaS daily performance',
                color: this.colors.info,
                fields: [
                    {
                        name: '🆕 New Subscriptions',
                        value: `${stats.newSubscriptions}`,
                        inline: true,
                    },
                    {
                        name: '💰 Revenue',
                        value: `$${stats.revenue.toFixed(2)}`,
                        inline: true,
                    },
                    {
                        name: '🔁 Referrals Used',
                        value: `${stats.referralsUsed}`,
                        inline: true,
                    },
                    {
                        name: '👥 Active Users',
                        value: `${stats.activeUsers}`,
                        inline: true,
                    },
                ],
                footer: {
                    text: 'Lore Engine SaaS - Daily Report',
                },
                timestamp: new Date().toISOString(),
            };
            await this.sendToDiscord({
                embeds: [embed],
                username: this.botName,
                avatar_url: this.avatarUrl,
            });
            logger_js_1.logger.info('Discord daily summary sent', stats);
        }
        catch (error) {
            logger_js_1.logger.error('Failed to send Discord daily summary:', error);
        }
    }
    static createNewSubscriptionEmbed(notification) {
        const fields = [
            {
                name: '📧 User',
                value: notification.user || 'Unknown',
                inline: true,
            },
            {
                name: '🎯 Plan',
                value: notification.plan,
                inline: true,
            },
        ];
        if (notification.amount) {
            fields.push({
                name: '💰 Amount',
                value: `$${notification.amount.toFixed(2)}/month`,
                inline: true,
            });
        }
        if (notification.referralCode) {
            fields.push({
                name: '🔁 Referral',
                value: notification.referralCode,
                inline: true,
            });
        }
        return {
            title: '🎉 New Subscription!',
            description: 'A new customer just subscribed to Lore Engine!',
            color: this.colors.success,
            fields,
            footer: {
                text: 'Lore Engine SaaS - New Customer',
            },
            timestamp: new Date().toISOString(),
        };
    }
    static createSubscriptionUpdatedEmbed(notification) {
        return {
            title: '🔄 Subscription Updated',
            description: 'A customer subscription has been modified',
            color: this.colors.info,
            fields: [
                {
                    name: '👤 Customer',
                    value: notification.customerId || 'Unknown',
                    inline: true,
                },
                {
                    name: '🎯 New Plan',
                    value: notification.plan,
                    inline: true,
                },
                {
                    name: '📊 Status',
                    value: notification.status || 'Active',
                    inline: true,
                },
            ],
            footer: {
                text: 'Lore Engine SaaS - Subscription Update',
            },
            timestamp: new Date().toISOString(),
        };
    }
    static createSubscriptionCanceledEmbed(notification) {
        return {
            title: '😢 Subscription Canceled',
            description: 'A customer has canceled their subscription',
            color: this.colors.warning,
            fields: [
                {
                    name: '👤 Customer',
                    value: notification.customerId || 'Unknown',
                    inline: true,
                },
                {
                    name: '🎯 Plan',
                    value: notification.plan,
                    inline: true,
                },
            ],
            footer: {
                text: 'Lore Engine SaaS - Cancellation',
            },
            timestamp: new Date().toISOString(),
        };
    }
    static createReferralGeneratedEmbed(notification) {
        return {
            title: '🔗 Referral Code Generated',
            description: 'A user created a new referral code',
            color: this.colors.referral,
            fields: [
                {
                    name: '👤 Referrer',
                    value: notification.referrerEmail,
                    inline: true,
                },
                {
                    name: '🎫 Code',
                    value: notification.referralCode,
                    inline: true,
                },
            ],
            footer: {
                text: 'Lore Engine SaaS - Referral System',
            },
            timestamp: new Date().toISOString(),
        };
    }
    static createReferralUsedEmbed(notification) {
        return {
            title: '🎉 Referral Code Used!',
            description: 'Someone signed up using a referral code',
            color: this.colors.referral,
            fields: [
                {
                    name: '👤 Referrer',
                    value: notification.referrerEmail,
                    inline: true,
                },
                {
                    name: '🆕 New User',
                    value: notification.newUserEmail || 'Unknown',
                    inline: true,
                },
                {
                    name: '🎫 Code',
                    value: notification.referralCode,
                    inline: true,
                },
            ],
            footer: {
                text: 'Lore Engine SaaS - Referral Success',
            },
            timestamp: new Date().toISOString(),
        };
    }
    static createReferralCompletedEmbed(notification) {
        const fields = [
            {
                name: '👤 Referrer',
                value: notification.referrerEmail,
                inline: true,
            },
            {
                name: '🎫 Code',
                value: notification.referralCode,
                inline: true,
            },
        ];
        if (notification.bonusAmount) {
            fields.push({
                name: '🎁 Bonus',
                value: `$${notification.bonusAmount.toFixed(2)}`,
                inline: true,
            });
        }
        return {
            title: '💰 Referral Bonus Awarded!',
            description: 'Referrer earned their bonus commission',
            color: this.colors.success,
            fields,
            footer: {
                text: 'Lore Engine SaaS - Commission Paid',
            },
            timestamp: new Date().toISOString(),
        };
    }
    static async sendToDiscord(message) {
        if (!this.webhookUrl) {
            throw new Error('Discord webhook URL not configured');
        }
        const response = await fetch(this.webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Discord webhook failed: ${response.status} ${errorText}`);
        }
    }
    static async testConnection() {
        try {
            await this.sendToDiscord({
                content: '🔮 Lore Engine SaaS Discord integration test - working perfectly!',
                username: this.botName,
                avatar_url: this.avatarUrl,
            });
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}
exports.DiscordWebhookService = DiscordWebhookService;
DiscordWebhookService.webhookUrl = environment_js_1.config.integrations.discord.webhookUrl;
DiscordWebhookService.botName = '🔮 Lore Engine SaaS';
DiscordWebhookService.avatarUrl = 'https://cdn.discordapp.com/emojis/🔮.png';
DiscordWebhookService.colors = {
    success: 0x00ff00,
    warning: 0xffaa00,
    error: 0xff0000,
    info: 0x0099ff,
    referral: 0x9900ff,
};
//# sourceMappingURL=discord.js.map