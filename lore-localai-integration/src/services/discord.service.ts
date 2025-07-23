/**
 * 🎮 Discord Integration Service
 * Real-time notifications for Lore Engine events
 * Generated: July 18, 2025
 */

import { config } from '../config/environment';

export interface DiscordMessage {
  content?: string;
  embeds?: DiscordEmbed[];
  username?: string;
  avatar_url?: string;
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: DiscordEmbedField[];
  footer?: {
    text: string;
    icon_url?: string;
  };
  timestamp?: string;
  url?: string;
  author?: {
    name: string;
    icon_url?: string;
    url?: string;
  };
  image?: {
    url: string;
  };
  thumbnail?: {
    url: string;
  };
}

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export class DiscordNotificationService {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = config.integrations.discord.webhookUrl || '';
    
    if (!this.webhookUrl) {
      console.warn('⚠️ Discord webhook URL not configured. Discord notifications disabled.');
    }
  }

  /**
   * Send a message to Discord webhook
   */
  async sendMessage(message: DiscordMessage): Promise<boolean> {
    if (!this.webhookUrl) {
      console.log('🔇 Discord notifications disabled - no webhook URL configured');
      return false;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`);
      }

      console.log('✅ Discord notification sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to send Discord notification:', error);
      return false;
    }
  }

  /**
   * Send a user registration notification
   */
  async notifyUserRegistration(userData: {
    email: string;
    plan: string;
    signupMethod: string;
  }): Promise<boolean> {
    const embed: DiscordEmbed = {
      title: '🎉 New User Registration',
      color: 0x00ff00, // Green
      fields: [
        {
          name: '📧 Email',
          value: userData.email,
          inline: true,
        },
        {
          name: '💳 Plan',
          value: userData.plan,
          inline: true,
        },
        {
          name: '🔗 Signup Method',
          value: userData.signupMethod,
          inline: true,
        },
      ],
      footer: {
        text: 'Lore Engine SaaS',
      },
      timestamp: new Date().toISOString(),
    };

    return this.sendMessage({
      embeds: [embed],
    });
  }

  /**
   * Send a subscription event notification
   */
  async notifySubscriptionEvent(eventData: {
    type: 'created' | 'updated' | 'cancelled' | 'payment_failed';
    customerEmail: string;
    plan: string;
    amount?: number;
    currency?: string;
  }): Promise<boolean> {
    const colorMap = {
      created: 0x00ff00,     // Green
      updated: 0x0099ff,     // Blue
      cancelled: 0xff9900,   // Orange
      payment_failed: 0xff0000, // Red
    };

    const titleMap = {
      created: '💰 New Subscription',
      updated: '🔄 Subscription Updated',
      cancelled: '❌ Subscription Cancelled',
      payment_failed: '⚠️ Payment Failed',
    };

    const embed: DiscordEmbed = {
      title: titleMap[eventData.type],
      color: colorMap[eventData.type],
      fields: [
        {
          name: '👤 Customer',
          value: eventData.customerEmail,
          inline: true,
        },
        {
          name: '📦 Plan',
          value: eventData.plan,
          inline: true,
        },
      ],
      footer: {
        text: 'Stripe Integration',
      },
      timestamp: new Date().toISOString(),
    };

    if (eventData.amount && eventData.currency) {
      embed.fields?.push({
        name: '💵 Amount',
        value: `${eventData.amount / 100} ${eventData.currency.toUpperCase()}`,
        inline: true,
      });
    }

    return this.sendMessage({
      embeds: [embed],
    });
  }

  /**
   * Send a system alert notification
   */
  async notifySystemAlert(alertData: {
    level: 'info' | 'warning' | 'error' | 'critical';
    title: string;
    message: string;
    service?: string;
  }): Promise<boolean> {
    const colorMap = {
      info: 0x0099ff,       // Blue
      warning: 0xff9900,    // Orange
      error: 0xff0000,      // Red
      critical: 0x8b0000,   // Dark Red
    };

    const emojiMap = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      critical: '🚨',
    };

    const embed: DiscordEmbed = {
      title: `${emojiMap[alertData.level]} ${alertData.title}`,
      description: alertData.message,
      color: colorMap[alertData.level],
      footer: {
        text: 'Lore Engine Monitoring',
      },
      timestamp: new Date().toISOString(),
    };

    if (alertData.service) {
      embed.fields = [
        {
          name: '🔧 Service',
          value: alertData.service,
          inline: true,
        },
      ];
    }

    return this.sendMessage({
      embeds: [embed],
    });
  }

  /**
   * Send revenue milestone notification
   */
  async notifyRevenueMilestone(milestoneData: {
    milestone: number;
    currency: string;
    totalCustomers: number;
    period: string;
  }): Promise<boolean> {
    const embed: DiscordEmbed = {
      title: '🎯 Revenue Milestone Reached!',
      description: `Congratulations! Lore Engine SaaS has reached $${milestoneData.milestone.toLocaleString()} in ${milestoneData.period} revenue!`,
      color: 0xffd700, // Gold
      fields: [
        {
          name: '💰 Revenue',
          value: `$${milestoneData.milestone.toLocaleString()} ${milestoneData.currency}`,
          inline: true,
        },
        {
          name: '👥 Total Customers',
          value: milestoneData.totalCustomers.toString(),
          inline: true,
        },
        {
          name: '📅 Period',
          value: milestoneData.period,
          inline: true,
        },
      ],
      footer: {
        text: 'Revenue Tracking',
      },
      timestamp: new Date().toISOString(),
    };

    return this.sendMessage({
      embeds: [embed],
    });
  }

  /**
   * Test the Discord webhook connection
   */
  async testConnection(): Promise<boolean> {
    const embed: DiscordEmbed = {
      title: '🧪 Discord Integration Test',
      description: 'This is a test message to verify Discord webhook integration is working correctly.',
      color: 0x7289da, // Discord Blurple
      fields: [
        {
          name: '⚡ Status',
          value: 'Connection Successful',
          inline: true,
        },
        {
          name: '🕐 Time',
          value: new Date().toLocaleString(),
          inline: true,
        },
      ],
      footer: {
        text: 'Lore Engine SaaS - Discord Integration',
      },
      timestamp: new Date().toISOString(),
    };

    return this.sendMessage({
      content: '🎮 **Discord Integration Test**',
      embeds: [embed],
    });
  }
}

// Export singleton instance
export const discordService = new DiscordNotificationService();
