interface DiscordEmbed {
    title: string;
    description?: string;
    color: number;
    fields?: Array<{
        name: string;
        value: string;
        inline?: boolean;
    }>;
    thumbnail?: {
        url: string;
    };
    footer?: {
        text: string;
        icon_url?: string;
    };
    timestamp?: string;
}
interface DiscordMessage {
    content?: string;
    embeds?: DiscordEmbed[];
    username?: string;
    avatar_url?: string;
}
interface SubscriptionNotification {
    event: 'new_subscription' | 'subscription_updated' | 'subscription_canceled';
    user?: string;
    customerId?: string;
    plan: string;
    amount?: number;
    status?: string;
    referralCode?: string;
}
interface PaymentFailedNotification {
    customerId: string;
    amount: number;
    attemptCount: number;
}
interface ReferralNotification {
    event: 'referral_generated' | 'referral_used' | 'referral_completed';
    referrerEmail: string;
    referralCode: string;
    newUserEmail?: string;
    bonusAmount?: number;
}
export declare class DiscordWebhookService {
    private static readonly webhookUrl;
    private static readonly botName;
    private static readonly avatarUrl;
    private static readonly colors;
    static sendSubscriptionNotification(notification: SubscriptionNotification): Promise<void>;
    static sendPaymentFailedNotification(notification: PaymentFailedNotification): Promise<void>;
    static sendReferralNotification(notification: ReferralNotification): Promise<void>;
    static sendDailySummary(stats: {
        newSubscriptions: number;
        revenue: number;
        referralsUsed: number;
        activeUsers: number;
    }): Promise<void>;
    private static createNewSubscriptionEmbed;
    private static createSubscriptionUpdatedEmbed;
    private static createSubscriptionCanceledEmbed;
    private static createReferralGeneratedEmbed;
    private static createReferralUsedEmbed;
    private static createReferralCompletedEmbed;
    static sendToDiscord(message: DiscordMessage): Promise<void>;
    static testConnection(): Promise<{
        success: boolean;
        error?: string;
    }>;
}
export {};
//# sourceMappingURL=discord.d.ts.map