/**
 * 🎬 TikTok Viral Marketing Funnel
 * Complete automation from fragment drop to revenue flow
 * Generated: July 18, 2025
 */

import { discordService } from '../services/discord.service';
import { config } from '../config/environment';

export interface TikTokFragment {
  id: string;
  title: string;
  contentType: 'lore' | 'template' | 'character' | 'world';
  creatorId: string;
  videoUrl: string;
  trackingCode: string;
  views: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface ReferralData {
  referralCode: string;
  sourceFragment: string;
  clickedAt: Date;
  ipAddress: string;
  userAgent: string;
  converted: boolean;
  conversionValue?: number;
}

export interface UserEngagement {
  userId: string;
  action: 'template_share' | 'lore_creation' | 'marketplace_purchase' | 'fragment_create';
  contentId: string;
  viralPotential: 'low' | 'medium' | 'high' | 'viral';
  timestamp: Date;
}

export class TikTokViralFunnelService {
  private fragments: Map<string, TikTokFragment> = new Map();
  private referrals: Map<string, ReferralData> = new Map();

  /**
   * 🎬 Step 1: Track TikTok Fragment Drop
   */
  async trackFragmentDrop(fragmentData: {
    title: string;
    contentType: TikTokFragment['contentType'];
    creatorId: string;
    videoUrl: string;
  }): Promise<string> {
    const fragmentId = `frag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const trackingCode = `tk_${fragmentId}`;

    const fragment: TikTokFragment = {
      id: fragmentId,
      title: fragmentData.title,
      contentType: fragmentData.contentType,
      creatorId: fragmentData.creatorId,
      videoUrl: fragmentData.videoUrl,
      trackingCode,
      views: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
    };

    this.fragments.set(fragmentId, fragment);

    // Notify team of new fragment drop
    await discordService.sendMessage({
      embeds: [
        {
          title: '🎬 New TikTok Fragment Dropped!',
          description: `New viral content deployed to TikTok ecosystem`,
          color: 16711935, // Pink/Magenta (TikTok colors)
          fields: [
            {
              name: '🎭 Content Title',
              value: fragmentData.title,
              inline: true,
            },
            {
              name: '📱 Content Type',
              value: fragmentData.contentType.toUpperCase(),
              inline: true,
            },
            {
              name: '🔗 Tracking Code',
              value: trackingCode,
              inline: true,
            },
            {
              name: '👤 Creator',
              value: fragmentData.creatorId,
              inline: true,
            },
            {
              name: '🎯 Landing Page',
              value: `${config.saas.baseUrl}/viral/${trackingCode}`,
              inline: false,
            },
          ],
          footer: {
            text: 'TikTok Viral Marketing',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    });

    console.log(`🎬 Fragment dropped: ${fragmentId} with tracking: ${trackingCode}`);
    return trackingCode;
  }

  /**
   * 👆 Step 2: Handle Viewer Click from TikTok
   */
  async handleViralClick(trackingCode: string, clickData: {
    ipAddress: string;
    userAgent: string;
    timestamp?: Date;
  }): Promise<string> {
    const fragment = Array.from(this.fragments.values()).find(f => f.trackingCode === trackingCode);
    
    if (!fragment) {
      console.warn(`🚫 Unknown tracking code: ${trackingCode}`);
      return '/';
    }

    // Update fragment metrics
    fragment.clicks++;
    this.fragments.set(fragment.id, fragment);

    // Generate referral code for this click
    const referralCode = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Store referral data
    const referralData: ReferralData = {
      referralCode,
      sourceFragment: fragment.id,
      clickedAt: clickData.timestamp || new Date(),
      ipAddress: clickData.ipAddress,
      userAgent: clickData.userAgent,
      converted: false,
    };

    this.referrals.set(referralCode, referralData);

    // High click volume alert
    if (fragment.clicks % 100 === 0) {
      await discordService.sendMessage({
        embeds: [
          {
            title: '🔥 Viral Fragment Going Hot!',
            description: `Fragment "${fragment.title}" is gaining traction!`,
            color: 16753920, // Orange
            fields: [
              {
                name: '📊 Total Clicks',
                value: fragment.clicks.toString(),
                inline: true,
              },
              {
                name: '🎯 Conversion Rate',
                value: `${((fragment.conversions / fragment.clicks) * 100).toFixed(2)}%`,
                inline: true,
              },
              {
                name: '💰 Revenue Generated',
                value: `$${fragment.revenue.toFixed(2)}`,
                inline: true,
              },
            ],
            footer: {
              text: 'Viral Performance Alert',
            },
            timestamp: new Date().toISOString(),
          },
        ],
      });
    }

    console.log(`👆 Click tracked: ${trackingCode} → ${referralCode}`);
    return `/onboarding?ref=${referralCode}`;
  }

  /**
   * 🎉 Step 3: Handle Signup Conversion
   */
  async handleSignupConversion(referralCode: string, userData: {
    userId: string;
    email: string;
    plan: string;
    signupMethod: string;
  }): Promise<void> {
    const referral = this.referrals.get(referralCode);
    
    if (!referral) {
      console.warn(`🚫 Unknown referral code: ${referralCode}`);
      return;
    }

    // Mark referral as converted
    referral.converted = true;
    this.referrals.set(referralCode, referral);

    // Update fragment conversion metrics
    const fragment = this.fragments.get(referral.sourceFragment);
    if (fragment) {
      fragment.conversions++;
      this.fragments.set(fragment.id, fragment);
    }

    // Notify successful viral conversion
    await discordService.notifyUserRegistration({
      email: userData.email,
      plan: userData.plan,
      signupMethod: `TikTok Viral (${fragment?.title || 'Unknown Fragment'})`,
    });

    // Special viral conversion notification
    await discordService.sendMessage({
      embeds: [
        {
          title: '🎉 Viral Conversion Success!',
          description: 'TikTok fragment successfully converted to paying customer!',
          color: 65280, // Green
          fields: [
            {
              name: '🎬 Source Fragment',
              value: fragment?.title || 'Unknown',
              inline: true,
            },
            {
              name: '👤 New Customer',
              value: userData.email,
              inline: true,
            },
            {
              name: '💳 Plan Selected',
              value: userData.plan,
              inline: true,
            },
            {
              name: '📈 Fragment Stats',
              value: `${fragment?.clicks} clicks → ${fragment?.conversions} conversions`,
              inline: false,
            },
          ],
          footer: {
            text: 'Viral Marketing Success',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    });

    console.log(`🎉 Conversion tracked: ${referralCode} → ${userData.userId}`);
  }

  /**
   * 💳 Step 4: Handle Stripe Billing & Agent Provisioning
   */
  async handleStripeProvisioning(userData: {
    userId: string;
    stripeCustomerId: string;
    subscriptionId: string;
    plan: string;
    amount: number;
    referralCode?: string;
  }): Promise<void> {
    // Track revenue attribution
    if (userData.referralCode) {
      const referral = this.referrals.get(userData.referralCode);
      if (referral) {
        referral.conversionValue = userData.amount;
        this.referrals.set(userData.referralCode, referral);

        // Add revenue to source fragment
        const fragment = this.fragments.get(referral.sourceFragment);
        if (fragment) {
          fragment.revenue += userData.amount / 100; // Convert cents to dollars
          this.fragments.set(fragment.id, fragment);
        }
      }
    }

    // Provision AI agent instance
    await this.provisionAgentInstance(userData.userId, userData.plan);

    // Revenue attribution notification
    await discordService.sendMessage({
      embeds: [
        {
          title: '💳 Stripe Billing & Agent Provisioned',
          description: 'Customer successfully billed and AI agent instance created',
          color: 3447003, // Blue
          fields: [
            {
              name: '👤 Customer',
              value: userData.userId,
              inline: true,
            },
            {
              name: '💰 Revenue',
              value: `$${(userData.amount / 100).toFixed(2)}`,
              inline: true,
            },
            {
              name: '🤖 Agent Plan',
              value: userData.plan,
              inline: true,
            },
            {
              name: '🔗 Attribution',
              value: userData.referralCode ? 'TikTok Viral' : 'Direct',
              inline: true,
            },
          ],
          footer: {
            text: 'Revenue & Provisioning',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    });

    console.log(`💳 Stripe provisioning completed for ${userData.userId}`);
  }

  /**
   * 🚀 Step 5: Track User Engagement & Viral Potential
   */
  async trackUserEngagement(engagement: UserEngagement): Promise<void> {
    // Analyze viral potential
    const viralScore = this.calculateViralScore(engagement);
    
    // High viral potential alert
    if (engagement.viralPotential === 'viral' || viralScore > 0.8) {
      await discordService.sendMessage({
        embeds: [
          {
            title: '🚀 High Viral Potential Detected!',
            description: 'User activity shows strong viral potential',
            color: 16711935, // Pink
            fields: [
              {
                name: '👤 User',
                value: engagement.userId,
                inline: true,
              },
              {
                name: '🎯 Action',
                value: engagement.action.replace('_', ' ').toUpperCase(),
                inline: true,
              },
              {
                name: '📊 Viral Score',
                value: `${(viralScore * 100).toFixed(1)}%`,
                inline: true,
              },
              {
                name: '💡 Recommendation',
                value: 'Consider featuring this content or user for amplification',
                inline: false,
              },
            ],
            footer: {
              text: 'Viral Potential Analysis',
            },
            timestamp: new Date().toISOString(),
          },
        ],
      });
    }

    // Auto-create TikTok fragment for viral content
    if (engagement.viralPotential === 'viral') {
      await this.autoCreateViralFragment(engagement);
    }

    console.log(`🚀 Engagement tracked: ${engagement.action} by ${engagement.userId}`);
  }

  /**
   * 🛒 Step 6: Handle Marketplace Sales & Fragment Triggers
   */
  async handleMarketplaceSale(saleData: {
    sellerId: string;
    buyerId: string;
    contentId: string;
    contentType: string;
    price: number;
    commission: number;
  }): Promise<void> {
    // Notify marketplace sale
    await discordService.sendMessage({
      embeds: [
        {
          title: '🛒 Marketplace Sale!',
          description: 'User-generated content sold on marketplace',
          color: 16766720, // Gold
          fields: [
            {
              name: '🎨 Content',
              value: saleData.contentId,
              inline: true,
            },
            {
              name: '💰 Sale Price',
              value: `$${saleData.price.toFixed(2)}`,
              inline: true,
            },
            {
              name: '🏦 Our Commission',
              value: `$${saleData.commission.toFixed(2)}`,
              inline: true,
            },
            {
              name: '👤 Seller',
              value: saleData.sellerId,
              inline: true,
            },
            {
              name: '🛍️ Buyer',
              value: saleData.buyerId,
              inline: true,
            },
            {
              name: '📱 Type',
              value: saleData.contentType,
              inline: true,
            },
          ],
          footer: {
            text: 'Marketplace Revenue',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    });

    // Check if this should trigger a new viral fragment
    await this.evaluateFragmentCreation(saleData);

    console.log(`🛒 Marketplace sale: ${saleData.contentId} for $${saleData.price}`);
  }

  /**
   * 💸 Step 7: Revenue Flow Tracking
   */
  async trackRevenueFlow(): Promise<void> {
    const totalRevenue = Array.from(this.fragments.values()).reduce((sum, f) => sum + f.revenue, 0);
    const totalConversions = Array.from(this.fragments.values()).reduce((sum, f) => sum + f.conversions, 0);
    const totalClicks = Array.from(this.fragments.values()).reduce((sum, f) => sum + f.clicks, 0);

    // Daily revenue flow summary
    await discordService.sendMessage({
      embeds: [
        {
          title: '💸 Daily Viral Revenue Flow',
          description: 'TikTok → Haunted Engine → Stripe → Bank Account',
          color: 65280, // Green
          fields: [
            {
              name: '🎬 Active Fragments',
              value: this.fragments.size.toString(),
              inline: true,
            },
            {
              name: '👆 Total Clicks',
              value: totalClicks.toLocaleString(),
              inline: true,
            },
            {
              name: '🎉 Conversions',
              value: totalConversions.toString(),
              inline: true,
            },
            {
              name: '💰 Viral Revenue',
              value: `$${totalRevenue.toFixed(2)}`,
              inline: true,
            },
            {
              name: '📈 Conversion Rate',
              value: totalClicks > 0 ? `${((totalConversions / totalClicks) * 100).toFixed(2)}%` : '0%',
              inline: true,
            },
            {
              name: '💸 Revenue per Click',
              value: totalClicks > 0 ? `$${(totalRevenue / totalClicks).toFixed(2)}` : '$0.00',
              inline: true,
            },
          ],
          footer: {
            text: 'Viral Marketing Analytics',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    });

    console.log(`💸 Revenue flow tracked: $${totalRevenue} from ${totalConversions} conversions`);
  }

  // Helper methods
  private async provisionAgentInstance(userId: string, plan: string): Promise<void> {
    // AI agent provisioning logic would go here
    console.log(`🤖 Provisioning ${plan} agent for ${userId}`);
  }

  private calculateViralScore(engagement: UserEngagement): number {
    const actionScores = {
      template_share: 0.7,
      lore_creation: 0.6,
      marketplace_purchase: 0.5,
      fragment_create: 0.9,
    };
    return actionScores[engagement.action] || 0.3;
  }

  private async autoCreateViralFragment(engagement: UserEngagement): Promise<void> {
    // Auto-create TikTok fragment for highly viral content
    console.log(`🎬 Auto-creating viral fragment for ${engagement.contentId}`);
  }

  private async evaluateFragmentCreation(saleData: any): Promise<void> {
    // Logic to determine if marketplace sale should trigger new fragment
    console.log(`🎯 Evaluating fragment creation for sale ${saleData.contentId}`);
  }

  // Public API methods
  getFragmentMetrics(fragmentId: string): TikTokFragment | undefined {
    return this.fragments.get(fragmentId);
  }

  getAllFragments(): TikTokFragment[] {
    return Array.from(this.fragments.values());
  }

  getReferralData(referralCode: string): ReferralData | undefined {
    return this.referrals.get(referralCode);
  }
}

// Export singleton instance
export const viralFunnelService = new TikTokViralFunnelService();
