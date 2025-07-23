/**
 * 🎮 Lore Engine SaaS - Discord Integration with TikTok Tracking
 * Complete Discord embed generation with viral flow tracking
 * Generated: July 18, 2025
 */

import express, { Request, Response } from 'express';
import { DiscordWebhookService } from '../services/discord.js';
import { ReferralService } from '../services/referral.js';
import { UserService } from '../services/user.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/environment.js';

const router = express.Router();

interface TikTokFragment {
  id: string;
  userId: string;
  content: string;
  hashtags: string[];
  viewCount: number;
  referralCode?: string;
  createdAt: Date;
}

interface SignupEvent {
  email: string;
  referralCode?: string;
  source: 'tiktok' | 'discord' | 'direct' | 'organic';
  fragmentId?: string;
}

interface ProvisioningEvent {
  userId: string;
  email: string;
  subscriptionTier: string;
  apiKey: string;
  referralCode?: string;
  source?: string;
}

// In-memory storage for demo (use database in production)
const tiktokFragments = new Map<string, TikTokFragment>();
const signupEvents = new Map<string, SignupEvent>();

/**
 * 🎬 Track TikTok Fragment Creation
 * POST /api/discord/tiktok-fragment
 */
router.post('/tiktok-fragment', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, content, hashtags, referralCode } = req.body;

    const fragment: TikTokFragment = {
      id: `tt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      content: content.slice(0, 200), // Truncate for Discord
      hashtags: hashtags || [],
      viewCount: 0,
      referralCode,
      createdAt: new Date(),
    };

    tiktokFragments.set(fragment.id, fragment);

    // Send Discord notification about new TikTok content
    const embed = {
      title: '🎬 New TikTok Fragment Created!',
      description: `A user just created viral content for Lore Engine`,
      color: 0xff0050, // TikTok pink
      fields: [
        {
          name: '👤 Creator',
          value: userId,
          inline: true,
        },
        {
          name: '📝 Content Preview',
          value: content.slice(0, 100) + (content.length > 100 ? '...' : ''),
          inline: false,
        },
        {
          name: '🏷️ Hashtags',
          value: hashtags.join(' ') || 'None',
          inline: true,
        },
        {
          name: '🔗 Referral Code',
          value: referralCode || 'None',
          inline: true,
        },
        {
          name: '🔗 Tracking ID',
          value: fragment.id,
          inline: true,
        },
      ],
      footer: {
        text: 'Lore Engine SaaS - TikTok Viral Tracking',
      },
      timestamp: new Date().toISOString(),
    };

    await DiscordWebhookService.sendToDiscord({
      embeds: [embed],
      username: '🔮 Lore Engine TikTok Tracker',
    });

    logger.info('TikTok fragment tracked', {
      fragmentId: fragment.id,
      userId,
      hashtagCount: hashtags.length,
    });

    res.json({
      success: true,
      fragmentId: fragment.id,
      trackingUrl: `${config.saas.baseUrl}/signup?ref=${referralCode}&tt=${fragment.id}`,
    });

  } catch (error) {
    logger.error('Error tracking TikTok fragment:', error);
    res.status(500).json({
      error: 'Failed to track TikTok fragment',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 📊 Track Signup from TikTok
 * POST /api/discord/signup-event
 */
router.post('/signup-event', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, referralCode, source, fragmentId }: SignupEvent = req.body;

    const signupEvent: SignupEvent = {
      email,
      ...(referralCode && { referralCode }),
      source: source || 'direct',
      ...(fragmentId && { fragmentId }),
    };

    signupEvents.set(email, signupEvent);

    // Update TikTok fragment view count if applicable
    if (fragmentId && tiktokFragments.has(fragmentId)) {
      const fragment = tiktokFragments.get(fragmentId)!;
      fragment.viewCount += 1;
      tiktokFragments.set(fragmentId, fragment);
    }

    // Create viral flow embed
    const embed = await createViralFlowEmbed(signupEvent, fragmentId);

    await DiscordWebhookService.sendToDiscord({
      embeds: [embed],
      username: '🔮 Lore Engine Viral Tracker',
    });

    logger.info('Signup event tracked', {
      email,
      source,
      fragmentId,
      referralCode,
    });

    res.json({
      success: true,
      message: 'Signup tracked successfully',
      viralFlow: fragmentId ? 'tiktok_to_signup' : 'direct_signup',
    });

  } catch (error) {
    logger.error('Error tracking signup event:', error);
    res.status(500).json({
      error: 'Failed to track signup event',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 🚀 Track Provisioning Completion
 * POST /api/discord/provisioning-complete
 */
router.post('/provisioning-complete', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, email, subscriptionTier, apiKey, referralCode, source }: ProvisioningEvent = req.body;

    // Get signup event for viral flow tracking
    const signupEvent = signupEvents.get(email);
    const fragmentId = signupEvent?.fragmentId;

    // Create provisioning complete embed
    const provisioningEvent: ProvisioningEvent = {
      userId,
      email,
      subscriptionTier,
      apiKey,
      ...(referralCode && { referralCode }),
      ...(source && { source }),
    };

    const embed = await createProvisioningCompleteEmbed(provisioningEvent, fragmentId);

    await DiscordWebhookService.sendToDiscord({
      embeds: [embed],
      username: '🔮 Lore Engine Revenue Bot',
    });

    // If this came from TikTok, send special viral success message
    if (fragmentId && tiktokFragments.has(fragmentId)) {
      await sendTikTokViralSuccessMessage(fragmentId, email, subscriptionTier);
    }

    // Process referral completion if applicable
    if (referralCode) {
      await ReferralService.processReferralComplete(referralCode, 'referrer_id', userId);
      
      // Send referral completion embed
      await DiscordWebhookService.sendReferralNotification({
        event: 'referral_completed',
        referrerEmail: 'referrer@example.com', // Would get from database
        referralCode,
        newUserEmail: email,
        bonusAmount: getTierValue(subscriptionTier) * 0.2, // 20% referral bonus
      });
    }

    logger.info('Provisioning completion tracked', {
      userId,
      email,
      subscriptionTier,
      viralSource: fragmentId ? 'tiktok' : 'direct',
    });

    res.json({
      success: true,
      message: 'Provisioning completion tracked',
      viralFlow: fragmentId ? 'complete_tiktok_flow' : 'direct_conversion',
    });

  } catch (error) {
    logger.error('Error tracking provisioning completion:', error);
    res.status(500).json({
      error: 'Failed to track provisioning completion',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 📊 Get Viral Flow Analytics
 * GET /api/discord/analytics
 */
router.get('/analytics', async (req: Request, res: Response): Promise<void> => {
  try {
    const fragments = Array.from(tiktokFragments.values());
    const signups = Array.from(signupEvents.values());

    // Calculate viral metrics
    const tiktokSignups = signups.filter(s => s.source === 'tiktok').length;
    const referralSignups = signups.filter(s => s.referralCode).length;
    const totalViews = fragments.reduce((sum, f) => sum + f.viewCount, 0);
    const conversionRate = totalViews > 0 ? (tiktokSignups / totalViews) * 100 : 0;

    const analytics = {
      tiktokFragments: fragments.length,
      totalViews,
      tiktokSignups,
      referralSignups,
      conversionRate: conversionRate.toFixed(2),
      topPerformingFragments: fragments
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 5)
        .map(f => ({
          id: f.id,
          content: f.content.slice(0, 50) + '...',
          views: f.viewCount,
          hashtags: f.hashtags,
        })),
      recentSignups: signups
        .slice(-10)
        .map(s => ({
          email: s.email,
          source: s.source,
          hasReferral: !!s.referralCode,
          isViral: !!s.fragmentId,
        })),
    };

    // Send analytics summary to Discord
    await sendAnalyticsSummaryToDiscord(analytics);

    res.json(analytics);

  } catch (error) {
    logger.error('Error generating analytics:', error);
    res.status(500).json({
      error: 'Failed to generate analytics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 🎬 Create Viral Flow Embed
 */
async function createViralFlowEmbed(signupEvent: SignupEvent, fragmentId?: string): Promise<any> {
  const fragment = fragmentId ? tiktokFragments.get(fragmentId) : null;
  
  const baseEmbed = {
    title: fragment ? '🎬➡️📧 TikTok to Signup Flow!' : '📧 New Signup Event',
    description: fragment 
      ? 'Someone discovered Lore Engine through TikTok and signed up!'
      : 'New user signed up for Lore Engine',
    color: fragment ? 0xff0050 : 0x00ff00,
    fields: [
      {
        name: '📧 New User',
        value: signupEvent.email,
        inline: true,
      },
      {
        name: '🌐 Source',
        value: signupEvent.source.toUpperCase(),
        inline: true,
      },
    ],
    footer: {
      text: 'Lore Engine SaaS - Viral Flow Tracking',
    },
    timestamp: new Date().toISOString(),
  };

  if (fragment) {
    baseEmbed.fields.push(
      {
        name: '🎬 Original Content',
        value: fragment.content.slice(0, 100) + '...',
        inline: false,
      },
      {
        name: '👀 Fragment Views',
        value: fragment.viewCount.toString(),
        inline: true,
      },
      {
        name: '🏷️ Hashtags',
        value: fragment.hashtags.join(' ') || 'None',
        inline: true,
      }
    );
  }

  if (signupEvent.referralCode) {
    baseEmbed.fields.push({
      name: '🔗 Referral Code',
      value: signupEvent.referralCode,
      inline: true,
    });
  }

  return baseEmbed;
}

/**
 * 🚀 Create Provisioning Complete Embed
 */
async function createProvisioningCompleteEmbed(event: ProvisioningEvent, fragmentId?: string): Promise<any> {
  const fragment = fragmentId ? tiktokFragments.get(fragmentId) : null;
  const tierValue = getTierValue(event.subscriptionTier);
  
  return {
    title: fragment ? '🎬➡️📧➡️💰 Complete TikTok Viral Flow!' : '💰 New Customer Provisioned!',
    description: fragment 
      ? 'Complete viral flow: TikTok → Signup → Payment → Provisioning!'
      : 'New customer successfully provisioned with API access',
    color: 0x00ff00, // Success green
    fields: [
      {
        name: '👤 Customer',
        value: event.email,
        inline: true,
      },
      {
        name: '🎯 Subscription Tier',
        value: event.subscriptionTier.toUpperCase(),
        inline: true,
      },
      {
        name: '💰 Monthly Value',
        value: `$${tierValue}/month`,
        inline: true,
      },
      {
        name: '🔑 API Key',
        value: `${event.apiKey.slice(0, 20)}...`,
        inline: true,
      },
      ...(fragment ? [{
        name: '🎬 Source Content',
        value: fragment.content.slice(0, 80) + '...',
        inline: false,
      }] : []),
      ...(event.referralCode ? [{
        name: '🔗 Referral Bonus',
        value: `$${(tierValue * 0.2).toFixed(2)} commission`,
        inline: true,
      }] : []),
    ],
    footer: {
      text: fragment 
        ? 'Lore Engine SaaS - Viral Revenue Complete!'
        : 'Lore Engine SaaS - Customer Provisioned',
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * 🎉 Send TikTok Viral Success Message
 */
async function sendTikTokViralSuccessMessage(fragmentId: string, email: string, tier: string): Promise<void> {
  const fragment = tiktokFragments.get(fragmentId);
  if (!fragment) return;

  const embed = {
    title: '🎉 VIRAL SUCCESS! TikTok Content Converted to Revenue!',
    description: '🎬➡️📧➡️💰 Complete viral flow achieved!',
    color: 0xffd700, // Gold color for success
    fields: [
      {
        name: '🎬 Original TikTok Content',
        value: fragment.content,
        inline: false,
      },
      {
        name: '💰 Revenue Generated',
        value: `$${getTierValue(tier)}/month`,
        inline: true,
      },
      {
        name: '📊 Conversion Rate',
        value: `${((1 / fragment.viewCount) * 100).toFixed(2)}%`,
        inline: true,
      },
      {
        name: '👀 Total Views to Conversion',
        value: fragment.viewCount.toString(),
        inline: true,
      },
      {
        name: '🏷️ Hashtags Used',
        value: fragment.hashtags.join(' ') || 'None',
        inline: false,
      },
    ],
    footer: {
      text: '🔮 Lore Engine - Viral Revenue Engine Success!',
    },
    timestamp: new Date().toISOString(),
  };

  await DiscordWebhookService.sendToDiscord({
    content: '🎉 **VIRAL CONVERSION SUCCESS!** 🎉',
    embeds: [embed],
    username: '🔮 Lore Engine Viral Revenue Bot',
  });
}

/**
 * 📊 Send Analytics Summary to Discord
 */
async function sendAnalyticsSummaryToDiscord(analytics: any): Promise<void> {
  const embed = {
    title: '📊 Viral Flow Analytics Summary',
    description: 'Current performance of TikTok viral marketing',
    color: 0x0099ff, // Blue for analytics
    fields: [
      {
        name: '🎬 TikTok Fragments Created',
        value: analytics.tiktokFragments.toString(),
        inline: true,
      },
      {
        name: '👀 Total Views',
        value: analytics.totalViews.toString(),
        inline: true,
      },
      {
        name: '📧 TikTok Signups',
        value: analytics.tiktokSignups.toString(),
        inline: true,
      },
      {
        name: '🔗 Referral Signups',
        value: analytics.referralSignups.toString(),
        inline: true,
      },
      {
        name: '📈 Conversion Rate',
        value: `${analytics.conversionRate}%`,
        inline: true,
      },
      {
        name: '🏆 Top Fragment Views',
        value: analytics.topPerformingFragments.length > 0 
          ? analytics.topPerformingFragments[0].views.toString()
          : '0',
        inline: true,
      },
    ],
    footer: {
      text: 'Lore Engine SaaS - Viral Analytics',
    },
    timestamp: new Date().toISOString(),
  };

  await DiscordWebhookService.sendToDiscord({
    embeds: [embed],
    username: '📊 Lore Engine Analytics Bot',
  });
}

/**
 * 💰 Get Tier Value
 */
function getTierValue(tier: string): number {
  switch (tier.toLowerCase()) {
    case 'observer': return 9.99;
    case 'architect': return 29.99;
    case 'master': return 99.99;
    default: return 0;
  }
}

export default router;
