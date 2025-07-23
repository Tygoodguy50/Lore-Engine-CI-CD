/**
 * 🎮 Lore Engine SaaS - Discord Webhook Service
 * Handles Discord notifications for subscriptions, referrals, and events
 * Generated: July 18, 2025
 */

import { config } from '../config/environment.js';
import { logger } from '../utils/logger.js';

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

export class DiscordWebhookService {
  private static readonly webhookUrl = config.integrations.discord.webhookUrl;
  private static readonly botName = '🔮 Lore Engine SaaS';
  private static readonly avatarUrl = 'https://cdn.discordapp.com/emojis/🔮.png';

  // Discord color codes
  private static readonly colors = {
    success: 0x00ff00,    // Green
    warning: 0xffaa00,    // Orange
    error: 0xff0000,      // Red
    info: 0x0099ff,       // Blue
    referral: 0x9900ff,   // Purple
  };

  /**
   * 💳 Send Subscription Notification
   */
  static async sendSubscriptionNotification(notification: SubscriptionNotification): Promise<void> {
    if (!this.webhookUrl) {
      logger.warn('Discord webhook URL not configured');
      return;
    }

    try {
      let embed: DiscordEmbed;

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
          logger.warn('Unknown subscription event type', { event: notification.event });
          return;
      }

      await this.sendToDiscord({
        embeds: [embed],
        username: this.botName,
        avatar_url: this.avatarUrl,
      });

      logger.info('Discord subscription notification sent', {
        event: notification.event,
        user: notification.user || notification.customerId,
      });

    } catch (error) {
      logger.error('Failed to send Discord subscription notification:', error);
    }
  }

  /**
   * ❌ Send Payment Failed Notification
   */
  static async sendPaymentFailedNotification(notification: PaymentFailedNotification): Promise<void> {
    if (!this.webhookUrl) {
      logger.warn('Discord webhook URL not configured');
      return;
    }

    try {
      const embed: DiscordEmbed = {
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

      logger.info('Discord payment failed notification sent', {
        customerId: notification.customerId,
        amount: notification.amount,
      });

    } catch (error) {
      logger.error('Failed to send Discord payment failed notification:', error);
    }
  }

  /**
   * 🔁 Send Referral Notification
   */
  static async sendReferralNotification(notification: ReferralNotification): Promise<void> {
    if (!this.webhookUrl) {
      logger.warn('Discord webhook URL not configured');
      return;
    }

    try {
      let embed: DiscordEmbed;

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
          logger.warn('Unknown referral event type', { event: notification.event });
          return;
      }

      await this.sendToDiscord({
        embeds: [embed],
        username: this.botName,
        avatar_url: this.avatarUrl,
      });

      logger.info('Discord referral notification sent', {
        event: notification.event,
        referralCode: notification.referralCode,
      });

    } catch (error) {
      logger.error('Failed to send Discord referral notification:', error);
    }
  }

  /**
   * 📊 Send Daily Stats Summary
   */
  static async sendDailySummary(stats: {
    newSubscriptions: number;
    revenue: number;
    referralsUsed: number;
    activeUsers: number;
  }): Promise<void> {
    if (!this.webhookUrl) {
      logger.warn('Discord webhook URL not configured');
      return;
    }

    try {
      const embed: DiscordEmbed = {
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

      logger.info('Discord daily summary sent', stats);

    } catch (error) {
      logger.error('Failed to send Discord daily summary:', error);
    }
  }

  /**
   * 🆕 Create New Subscription Embed
   */
  private static createNewSubscriptionEmbed(notification: SubscriptionNotification): DiscordEmbed {
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

  /**
   * 🔄 Create Subscription Updated Embed
   */
  private static createSubscriptionUpdatedEmbed(notification: SubscriptionNotification): DiscordEmbed {
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

  /**
   * ❌ Create Subscription Canceled Embed
   */
  private static createSubscriptionCanceledEmbed(notification: SubscriptionNotification): DiscordEmbed {
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

  /**
   * 🎯 Create Referral Generated Embed
   */
  private static createReferralGeneratedEmbed(notification: ReferralNotification): DiscordEmbed {
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

  /**
   * 🎯 Create Referral Used Embed
   */
  private static createReferralUsedEmbed(notification: ReferralNotification): DiscordEmbed {
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

  /**
   * 💰 Create Referral Completed Embed
   */
  private static createReferralCompletedEmbed(notification: ReferralNotification): DiscordEmbed {
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

  /**
   * 📤 Send Message to Discord
   */
  static async sendToDiscord(message: DiscordMessage): Promise<void> {
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

  /**
   * 🧪 Test Discord Connection
   */
  static async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.sendToDiscord({
        content: '🔮 Lore Engine SaaS Discord integration test - working perfectly!',
        username: this.botName,
        avatar_url: this.avatarUrl,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
