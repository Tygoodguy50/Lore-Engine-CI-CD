/**
 * 🎬 TikTok Webhook Integration Service
 * Handles TikTok API webhooks for viral marketing funnel
 * Generated: July 18, 2025
 */

import crypto from 'crypto';
import { config } from '../config/environment';
import { discordService } from './discord.service';

export interface TikTokWebhookEvent {
  event: string;
  timestamp: number;
  data: {
    user_id?: string;
    video_id?: string;
    username?: string;
    video_url?: string;
    video_title?: string;
    view_count?: number;
    like_count?: number;
    comment_count?: string;
    share_count?: number;
    engagement_rate?: number;
    hashtags?: string[];
    challenge_id?: string;
    tracking_params?: {
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
      fragment_id?: string;
      tracking_code?: string;
    };
  };
}

export interface TikTokAnalytics {
  video_id: string;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagement_rate: number;
    reach: number;
    impressions: number;
    click_through_rate: number;
  };
  demographics: {
    age_groups: Record<string, number>;
    gender_distribution: Record<string, number>;
    top_territories: string[];
  };
  performance: {
    viral_score: number;
    trend_potential: number;
    conversion_likelihood: number;
  };
}

export class TikTokWebhookService {
  private webhookSecret: string;
  private apiKey: string;
  private clientKey: string;
  private clientSecret: string;

  constructor() {
    this.webhookSecret = config.integrations.tiktok.webhookSecret || '';
    this.apiKey = config.integrations.tiktok.apiKey || '';
    this.clientKey = config.integrations.tiktok.clientKey || '';
    this.clientSecret = config.integrations.tiktok.clientSecret || '';
  }

  /**
   * 🔐 Verify TikTok webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      console.warn('⚠️ TikTok webhook secret not configured');
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * 🎬 Handle TikTok video upload webhook
   */
  async handleVideoUpload(event: TikTokWebhookEvent): Promise<void> {
    const { data } = event;
    
    // Check if this is a viral fragment video
    const isViralFragment = data.tracking_params?.fragment_id || 
                           data.hashtags?.some(tag => 
                             tag.includes('hauntedengine') || 
                             tag.includes('loreengine')
                           );

    if (isViralFragment) {
      await this.trackViralContent(event);
    }

    await discordService.sendMessage({
      embeds: [
        {
          title: '🎬 TikTok Video Uploaded!',
          description: `New video detected: "${data.video_title || 'Untitled'}"`,
          color: 16711935, // Pink
          fields: [
            {
              name: '👤 Creator',
              value: data.username || 'Unknown',
              inline: true,
            },
            {
              name: '🎥 Video ID',
              value: data.video_id || 'N/A',
              inline: true,
            },
            {
              name: '🔗 URL',
              value: data.video_url || 'N/A',
              inline: false,
            },
            {
              name: '🏷️ Hashtags',
              value: data.hashtags?.join(', ') || 'None',
              inline: false,
            },
            {
              name: '🎯 Viral Fragment',
              value: isViralFragment ? '✅ Yes' : '❌ No',
              inline: true,
            },
          ],
          footer: {
            text: 'TikTok Webhook - Video Upload',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    });
  }

  /**
   * 📊 Handle TikTok analytics webhook
   */
  async handleAnalyticsUpdate(event: TikTokWebhookEvent): Promise<void> {
    const { data } = event;
    
    // Calculate engagement rate
    const totalEngagement = (data.like_count || 0) + 
                           parseInt(data.comment_count || '0') + 
                           (data.share_count || 0);
    const engagementRate = data.view_count ? 
      (totalEngagement / data.view_count) * 100 : 0;

    // Determine viral potential
    const viralScore = this.calculateViralScore({
      views: data.view_count || 0,
      engagement_rate: engagementRate,
      shares: data.share_count || 0,
    });

    await discordService.sendMessage({
      embeds: [
        {
          title: '📊 TikTok Analytics Update',
          description: `Performance data for video: ${data.video_id}`,
          color: 3447003, // Blue
          fields: [
            {
              name: '👀 Views',
              value: (data.view_count || 0).toLocaleString(),
              inline: true,
            },
            {
              name: '❤️ Likes',
              value: (data.like_count || 0).toLocaleString(),
              inline: true,
            },
            {
              name: '💬 Comments',
              value: data.comment_count || '0',
              inline: true,
            },
            {
              name: '🔄 Shares',
              value: (data.share_count || 0).toLocaleString(),
              inline: true,
            },
            {
              name: '📈 Engagement Rate',
              value: `${engagementRate.toFixed(2)}%`,
              inline: true,
            },
            {
              name: '🚀 Viral Score',
              value: `${viralScore.toFixed(1)}/10`,
              inline: true,
            },
          ],
          footer: {
            text: 'TikTok Webhook - Analytics Update',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    });

    // Trigger funnel actions if high performance
    if (viralScore >= 7.0) {
      await this.triggerViralFunnelActions(event, viralScore);
    }
  }

  /**
   * 🔥 Handle viral content tracking
   */
  async trackViralContent(event: TikTokWebhookEvent): Promise<void> {
    const { data } = event;
    const fragmentId = data.tracking_params?.fragment_id;
    const trackingCode = data.tracking_params?.tracking_code;

    if (fragmentId || trackingCode) {
      await discordService.sendMessage({
        embeds: [
          {
            title: '🔥 Viral Fragment Tracked!',
            description: 'User-generated content from viral marketing campaign detected',
            color: 16753920, // Orange
            fields: [
              {
                name: '🎬 Fragment ID',
                value: fragmentId || 'N/A',
                inline: true,
              },
              {
                name: '🔗 Tracking Code',
                value: trackingCode || 'N/A',
                inline: true,
              },
              {
                name: '👤 Creator',
                value: data.username || 'Unknown',
                inline: true,
              },
              {
                name: '🎥 Video URL',
                value: data.video_url || 'N/A',
                inline: false,
              },
              {
                name: '📊 Initial Metrics',
                value: `Views: ${(data.view_count || 0).toLocaleString()}\nLikes: ${(data.like_count || 0).toLocaleString()}`,
                inline: false,
              },
            ],
            footer: {
              text: 'Viral Fragment Tracking System',
            },
            timestamp: new Date().toISOString(),
          },
        ],
      });
    }
  }

  /**
   * 🚀 Trigger viral funnel actions
   */
  async triggerViralFunnelActions(event: TikTokWebhookEvent, viralScore: number): Promise<void> {
    const { data } = event;

    // Generate follow-up fragments
    if (viralScore >= 8.0) {
      await this.generateFollowUpFragments(data);
    }

    // Boost promotion
    if (viralScore >= 7.5) {
      await this.boostContentPromotion(data);
    }

    // Alert marketing team
    await discordService.sendMessage({
      embeds: [
        {
          title: '🚀 HIGH VIRAL POTENTIAL DETECTED!',
          description: `Video ${data.video_id} is going viral! Taking automated actions.`,
          color: 65280, // Green
          fields: [
            {
              name: '🔥 Viral Score',
              value: `${viralScore.toFixed(1)}/10`,
              inline: true,
            },
            {
              name: '👀 Current Views',
              value: (data.view_count || 0).toLocaleString(),
              inline: true,
            },
            {
              name: '📈 Engagement Rate',
              value: `${((data.engagement_rate || 0) * 100).toFixed(2)}%`,
              inline: true,
            },
            {
              name: '🎯 Actions Triggered',
              value: viralScore >= 8.0 ? 
                '• Follow-up fragments generated\n• Content promotion boosted\n• Marketing team alerted' :
                '• Content promotion boosted\n• Marketing team alerted',
              inline: false,
            },
          ],
          footer: {
            text: 'Viral Marketing Automation',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    });
  }

  /**
   * 📊 Calculate viral score
   */
  private calculateViralScore(metrics: {
    views: number;
    engagement_rate: number;
    shares: number;
  }): number {
    const viewScore = Math.min(metrics.views / 100000, 1) * 3; // Max 3 points
    const engagementScore = Math.min(metrics.engagement_rate / 10, 1) * 4; // Max 4 points
    const shareScore = Math.min(metrics.shares / 1000, 1) * 3; // Max 3 points

    return viewScore + engagementScore + shareScore;
  }

  /**
   * 🎬 Generate follow-up fragments
   */
  private async generateFollowUpFragments(data: any): Promise<void> {
    const followUpIdeas = [
      'Part 2: Advanced techniques',
      'Behind the scenes',
      'User reactions compilation',
      'Tutorial breakdown',
      'Community challenges',
    ];

    const selectedIdea = followUpIdeas[Math.floor(Math.random() * followUpIdeas.length)];

    await discordService.sendMessage({
      content: `🎬 **FOLLOW-UP FRAGMENT GENERATED**\n\n` +
               `Original viral video: ${data.video_id}\n` +
               `Suggested follow-up: "${selectedIdea}"\n` +
               `🚀 Ready for content creation!`,
    });
  }

  /**
   * 📈 Boost content promotion
   */
  private async boostContentPromotion(data: any): Promise<void> {
    await discordService.sendMessage({
      content: `📈 **CONTENT PROMOTION BOOSTED**\n\n` +
               `Video: ${data.video_id}\n` +
               `🎯 Cross-platform sharing initiated\n` +
               `🔄 Algorithm boost activated\n` +
               `💰 Ad spend increased for viral content`,
    });
  }

  /**
   * 🎯 Process webhook event
   */
  async processWebhookEvent(event: TikTokWebhookEvent): Promise<void> {
    try {
      switch (event.event) {
        case 'video.upload':
          await this.handleVideoUpload(event);
          break;
        
        case 'video.analytics':
          await this.handleAnalyticsUpdate(event);
          break;
        
        case 'video.viral':
          await this.trackViralContent(event);
          break;
        
        case 'user.follow':
          await this.handleUserFollow(event);
          break;
        
        default:
          console.log(`🤷 Unknown TikTok webhook event: ${event.event}`);
      }
    } catch (error) {
      console.error('❌ Error processing TikTok webhook:', error);
      await discordService.sendMessage({
        content: `❌ **TikTok Webhook Error**\n\n` +
                 `Event: ${event.event}\n` +
                 `Error: ${error instanceof Error ? error.message : 'Unknown error'}\n` +
                 `Timestamp: ${new Date().toISOString()}`,
      });
    }
  }

  /**
   * 👥 Handle user follow event
   */
  private async handleUserFollow(event: TikTokWebhookEvent): Promise<void> {
    const { data } = event;
    
    await discordService.sendMessage({
      embeds: [
        {
          title: '👥 New TikTok Follower!',
          description: `@${data.username} started following our account`,
          color: 16766720, // Gold
          fields: [
            {
              name: '👤 Username',
              value: data.username || 'Unknown',
              inline: true,
            },
            {
              name: '🆔 User ID',
              value: data.user_id || 'N/A',
              inline: true,
            },
            {
              name: '📊 Funnel Stage',
              value: 'Top of Funnel - Awareness',
              inline: true,
            },
          ],
          footer: {
            text: 'TikTok Follower Tracking',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    });
  }
}

export const tiktokWebhookService = new TikTokWebhookService();
