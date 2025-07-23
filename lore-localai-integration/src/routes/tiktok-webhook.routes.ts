/**
 * 🎬 TikTok Webhook Routes
 * Express routes for handling TikTok API webhooks
 * Generated: July 18, 2025
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { tiktokWebhookService, TikTokWebhookEvent } from '../services/tiktok-webhook.service';
import { discordService } from '../services/discord.service';

const router = Router();

/**
 * 🔐 Middleware to verify TikTok webhook signature
 */
const verifyTikTokSignature = (req: Request, res: Response, next: NextFunction): void => {
  const signature = req.headers['x-tiktok-signature'] as string;
  const payload = JSON.stringify(req.body);

  if (!signature) {
    res.status(401).json({ 
      error: 'Missing TikTok signature',
      code: 'MISSING_SIGNATURE' 
    });
    return;
  }

  const isValid = tiktokWebhookService.verifyWebhookSignature(payload, signature);
  
  if (!isValid) {
    console.warn('⚠️ Invalid TikTok webhook signature');
    res.status(401).json({ 
      error: 'Invalid signature',
      code: 'INVALID_SIGNATURE' 
    });
    return;
  }

  next();
};

/**
 * 🎯 Main TikTok webhook endpoint
 * POST /api/webhooks/tiktok
 */
router.post('/tiktok', 
  verifyTikTokSignature,
  [
    body('event').isString().notEmpty(),
    body('timestamp').isNumeric(),
    body('data').isObject(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
        return;
      }

      const webhookEvent: TikTokWebhookEvent = req.body;

      // Log webhook received
      console.log(`🎬 TikTok webhook received: ${webhookEvent.event}`);

      // Process the webhook event
      await tiktokWebhookService.processWebhookEvent(webhookEvent);

      // Send success response
      res.status(200).json({
        success: true,
        message: 'Webhook processed successfully',
        event: webhookEvent.event,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('❌ TikTok webhook processing error:', error);
      
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * 🔄 TikTok webhook verification endpoint (for setup)
 * GET /api/webhooks/tiktok/verify
 */
router.get('/tiktok/verify', (req: Request, res: Response): void => {
  const challenge = req.query.challenge as string;
  
  if (!challenge) {
    res.status(400).json({
      error: 'Missing challenge parameter',
    });
    return;
  }

  // TikTok webhook verification
  res.status(200).send(challenge);
});

/**
 * 📊 TikTok analytics endpoint
 * POST /api/webhooks/tiktok/analytics
 */
router.post('/tiktok/analytics',
  verifyTikTokSignature,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const analyticsData = req.body;

      await discordService.sendMessage({
        embeds: [
          {
            title: '📊 TikTok Analytics Received',
            description: 'Analytics data processed successfully',
            color: 3447003, // Blue
            fields: [
              {
                name: '🎥 Video ID',
                value: analyticsData.video_id || 'N/A',
                inline: true,
              },
              {
                name: '👀 Views',
                value: (analyticsData.views || 0).toLocaleString(),
                inline: true,
              },
              {
                name: '📈 Engagement',
                value: `${(analyticsData.engagement_rate || 0).toFixed(2)}%`,
                inline: true,
              },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      });

      res.status(200).json({
        success: true,
        message: 'Analytics processed',
      });

    } catch (error) {
      console.error('❌ TikTok analytics error:', error);
      res.status(500).json({
        error: 'Analytics processing failed',
      });
    }
  }
);

/**
 * 🎬 Manual fragment tracking endpoint
 * POST /api/webhooks/tiktok/track-fragment
 */
router.post('/tiktok/track-fragment',
  [
    body('video_url').isURL(),
    body('fragment_id').isString().notEmpty(),
    body('username').isString().optional(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { video_url, fragment_id, username, tracking_code } = req.body;

      // Create tracking event
      const trackingEvent: TikTokWebhookEvent = {
        event: 'video.viral',
        timestamp: Date.now(),
        data: {
          video_url,
          username,
          tracking_params: {
            fragment_id,
            tracking_code,
            utm_source: 'tiktok',
            utm_medium: 'viral_fragment',
            utm_campaign: 'haunted_engine_viral',
          },
        },
      };

      await tiktokWebhookService.trackViralContent(trackingEvent);

      res.status(200).json({
        success: true,
        message: 'Fragment tracked successfully',
        fragment_id,
        tracking_code,
      });

    } catch (error) {
      console.error('❌ Fragment tracking error:', error);
      res.status(500).json({
        error: 'Fragment tracking failed',
      });
    }
  }
);

/**
 * 🔄 Test TikTok webhook endpoint
 * POST /api/webhooks/tiktok/test
 */
router.post('/tiktok/test', async (req: Request, res: Response) => {
  try {
    // Create test webhook event
    const testEvent: TikTokWebhookEvent = {
      event: 'video.upload',
      timestamp: Date.now(),
      data: {
        user_id: 'test_user_123',
        video_id: 'test_video_456',
        username: 'haunted_engine_test',
        video_url: 'https://tiktok.com/test_video',
        video_title: 'Test Haunted Engine Fragment',
        view_count: 15000,
        like_count: 2500,
        comment_count: '150',
        share_count: 400,
        hashtags: ['#hauntedengine', '#ai', '#viral', '#test'],
        tracking_params: {
          fragment_id: 'test_fragment_789',
          tracking_code: 'tk_test_123',
          utm_source: 'tiktok',
          utm_medium: 'viral_test',
          utm_campaign: 'haunted_engine_test',
        },
      },
    };

    await tiktokWebhookService.processWebhookEvent(testEvent);

    res.status(200).json({
      success: true,
      message: 'Test webhook processed successfully',
      test_event: testEvent,
    });

  } catch (error) {
    console.error('❌ Test webhook error:', error);
    res.status(500).json({
      error: 'Test webhook failed',
    });
  }
});

/**
 * 📋 Get TikTok webhook status
 * GET /api/webhooks/tiktok/status
 */
router.get('/tiktok/status', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'active',
    service: 'TikTok Webhook Integration',
    version: '1.0.0',
    endpoints: {
      main: '/api/webhooks/tiktok',
      verify: '/api/webhooks/tiktok/verify',
      analytics: '/api/webhooks/tiktok/analytics',
      track: '/api/webhooks/tiktok/track-fragment',
      test: '/api/webhooks/tiktok/test',
      status: '/api/webhooks/tiktok/status',
    },
    features: [
      'Video upload tracking',
      'Analytics processing',
      'Viral fragment detection',
      'Follow-up generation',
      'Discord notifications',
      'Signature verification',
    ],
    timestamp: new Date().toISOString(),
  });
});

export default router;
