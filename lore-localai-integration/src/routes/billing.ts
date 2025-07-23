/**
 * 🔮 Lore Engine SaaS - Billing API Routes
 * Complete subscription management and payment endpoints
 * Generated: July 18, 2025
 */

import { Router, Request, Response } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { stripeService, SUBSCRIPTION_TIERS } from '../billing/stripe-service';
import { customerService } from '../billing/customer-service';
import { logger } from '../utils/logger';
import { config } from '../config/environment';

export const billingRouter = Router();

/**
 * Get available subscription tiers
 */
billingRouter.get('/tiers', (req, res) => {
  try {
    const tiers = SUBSCRIPTION_TIERS.map(tier => ({
      id: tier.id,
      name: tier.name,
      description: tier.description,
      price: tier.price,
      interval: tier.interval,
      features: tier.features,
      limits: tier.limits
    }));

    res.json({
      success: true,
      tiers
    });
  } catch (error) {
    logger.error('Failed to get subscription tiers', { error });
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Create a new subscription
 */
billingRouter.post('/subscribe',
  [
    body('tier').isIn(SUBSCRIPTION_TIERS.map(t => t.id)).withMessage('Invalid subscription tier'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('metadata').optional().isObject().withMessage('Metadata must be an object')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { tier, email, metadata } = req.body;

      logger.info('Creating subscription', { tier, email });

      const checkout = await customerService.createSubscription(tier, email, metadata);

      res.json({
        success: true,
        checkout_url: checkout.checkoutUrl,
        session_id: checkout.sessionId
      });
    } catch (error) {
      logger.error('Failed to create subscription', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to create subscription'
      });
    }
  }
);

/**
 * Complete onboarding after successful payment
 */
billingRouter.post('/onboarding/complete',
  [
    body('session_id').notEmpty().withMessage('Session ID is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { session_id } = req.body;

      const onboarding = await customerService.completeOnboarding(session_id);

      res.json({
        success: true,
        customer: {
          id: onboarding.customer.id,
          email: onboarding.customer.email,
          tier: onboarding.customer.subscriptionTier,
          status: onboarding.customer.subscriptionStatus
        },
        api_key: onboarding.apiKey,
        dashboard_url: onboarding.dashboardUrl,
        message: 'Welcome to Lore Engine! Your account is ready.'
      });
    } catch (error) {
      logger.error('Failed to complete onboarding', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to complete onboarding'
      });
    }
  }
);

/**
 * Get customer dashboard data
 */
billingRouter.get('/dashboard/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const dashboard = await customerService.getCustomerDashboard(customerId);

    res.json({
      success: true,
      dashboard
    });
  } catch (error) {
    logger.error('Failed to get customer dashboard', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard data'
    });
  }
});

/**
 * Change subscription tier
 */
billingRouter.post('/subscription/change',
  [
    body('customer_id').notEmpty().withMessage('Customer ID is required'),
    body('new_tier').isIn(SUBSCRIPTION_TIERS.map(t => t.id)).withMessage('Invalid subscription tier')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { customer_id, new_tier } = req.body;

      await customerService.changeSubscription(customer_id, new_tier);

      const newTierInfo = SUBSCRIPTION_TIERS.find(t => t.id === new_tier);

      res.json({
        success: true,
        message: `Subscription upgraded to ${newTierInfo?.name}`,
        new_tier: newTierInfo
      });
    } catch (error) {
      logger.error('Failed to change subscription', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to change subscription'
      });
    }
  }
);

/**
 * Cancel subscription
 */
billingRouter.post('/subscription/cancel',
  [
    body('customer_id').notEmpty().withMessage('Customer ID is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { customer_id } = req.body;

      await customerService.cancelSubscription(customer_id);

      res.json({
        success: true,
        message: 'Subscription will be cancelled at the end of the current billing period'
      });
    } catch (error) {
      logger.error('Failed to cancel subscription', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to cancel subscription'
      });
    }
  }
);

/**
 * Create additional API key
 */
billingRouter.post('/api-keys',
  [
    body('customer_id').notEmpty().withMessage('Customer ID is required'),
    body('name').notEmpty().withMessage('Key name is required'),
    body('permissions').isArray().withMessage('Permissions must be an array')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { customer_id, name, permissions, custom_limits } = req.body;

      const apiKey = await customerService.createApiKey(customer_id, {
        name,
        permissions,
        customLimits: custom_limits
      });

      res.json({
        success: true,
        api_key: {
          id: apiKey.id,
          key: apiKey.key,
          name: apiKey.name,
          permissions: apiKey.permissions,
          rate_limit: apiKey.rateLimit,
          created_at: apiKey.createdAt
        }
      });
    } catch (error) {
      logger.error('Failed to create API key', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to create API key'
      });
    }
  }
);

/**
 * Stripe webhook handler
 */
billingRouter.post('/webhooks/stripe', async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    
    if (!signature) {
      logger.warn('Stripe webhook missing signature');
      return res.status(400).send('Missing signature');
    }

    // Verify webhook signature (in production)
    if (config.app.env === 'production' && config.stripe.webhookSecret) {
      // Stripe webhook signature verification would go here
    }

    const event = req.body;

    logger.info('Processing Stripe webhook', {
      type: event.type,
      id: event.id
    });

    await stripeService.handleWebhook(event);

    res.json({ received: true });
  } catch (error) {
    logger.error('Failed to process Stripe webhook', { error });
    res.status(500).json({
      success: false,
      error: 'Webhook processing failed'
    });
  }
});

/**
 * Validate API key middleware
 */
export const validateApiKey = async (req: any, res: any, next: any) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API key required'
      });
    }

    const validation = await customerService.validateApiRequest(apiKey, 'api_call');
    
    if (!validation.allowed) {
      return res.status(validation.reason?.includes('quota') ? 429 : 401).json({
        success: false,
        error: validation.reason
      });
    }

    // Add customer info to request
    req.customer = validation.customer;
    req.apiKey = apiKey;

    next();
  } catch (error) {
    logger.error('API key validation failed', { error });
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Usage validation middleware for specific request types
 */
export const validateUsage = (requestType: string) => {
  return async (req: any, res: any, next: any) => {
    try {
      const apiKey = req.apiKey || req.headers['x-api-key'];
      
      if (!apiKey) {
        return res.status(401).json({
          success: false,
          error: 'API key required'
        });
      }

      const validation = await customerService.validateApiRequest(apiKey, requestType as any);
      
      if (!validation.allowed) {
        return res.status(429).json({
          success: false,
          error: validation.reason,
          quota_exceeded: true,
          upgrade_url: `${config.saas.baseUrl}/pricing`
        });
      }

      next();
    } catch (error) {
      logger.error('Usage validation failed', { error, requestType });
      res.status(500).json({
        success: false,
        error: 'Usage validation failed'
      });
    }
  };
};
