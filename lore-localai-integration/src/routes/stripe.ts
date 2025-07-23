/**
 * 🔮 Lore Engine SaaS - Stripe Billing Routes
 * Handles subscription checkout, webhooks, and provisioning
 * Generated: July 18, 2025
 */

import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { config } from '../config/environment.js';
import { logger } from '../utils/logger.js';
import { ReferralService } from '../services/referral.js';
import { UserService } from '../services/user.js';
import { ProvisioningService } from '../services/provisioning.js';
import { DiscordWebhookService } from '../services/discord.js';

const router = express.Router();
const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-08-16',
});

interface CheckoutRequest {
  priceId: string;
  customerId?: string;
  referralCode?: string;
  metadata?: Record<string, string>;
  email?: string;
}

/**
 * 💳 Create Stripe Checkout Session
 * Creates subscription checkout with referral tracking
 */
router.post('/checkout', async (req: Request, res: Response): Promise<void> => {
  try {
    const { priceId, customerId, referralCode, metadata = {}, email }: CheckoutRequest = req.body;

    // Validate price ID against configured tiers
    const validPriceIds = Object.values(config.stripe.priceIds);
    if (!validPriceIds.includes(priceId)) {
      res.status(400).json({ 
        error: 'Invalid price ID',
        validPrices: validPriceIds 
      });
      return;
    }

    // Validate referral code if provided
    let referralBonus = 0;
    let referrer = null;
    if (referralCode) {
      const referralValidation = await ReferralService.validateCode(referralCode);
      if (referralValidation.valid) {
        referralBonus = referralValidation.bonus;
        referrer = referralValidation.referrer;
        metadata.referralCode = referralCode;
        metadata.referrer = referrer;
      }
    }

    // Create Stripe checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      subscription_data: {
        metadata,
        trial_period_days: config.saas.trialPeriodDays,
      },
      success_url: `${config.saas.baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.saas.baseUrl}/cancel`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      metadata: {
        ...metadata,
        environment: config.app.env,
        source: 'lore_engine_saas',
      },
    };

    // Add customer or email
    if (customerId) {
      sessionParams.customer = customerId;
    } else if (email) {
      sessionParams.customer_email = email;
    }

    // Add discount if referral bonus exists
    if (referralBonus > 0) {
      const couponId = await createReferralCoupon(referralBonus);
      sessionParams.discounts = [{ coupon: couponId }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    logger.info('Stripe checkout session created', {
      sessionId: session.id,
      priceId,
      referralCode,
      customerId,
    });

    res.json({ 
      url: session.url,
      sessionId: session.id,
      referralBonus,
    });

  } catch (error) {
    logger.error('Stripe checkout error:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 🔔 Stripe Webhook Handler
 * Processes subscription events and triggers provisioning
 */
router.post('/webhook', 
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response): Promise<void> => {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        config.stripe.webhookSecret
      );
    } catch (error) {
      logger.error('Stripe webhook signature verification failed:', error);
      res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return;
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'customer.subscription.created':
          await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_succeeded':
          await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          logger.info(`Unhandled webhook event type: ${event.type}`);
      }

      res.status(200).json({ received: true });

    } catch (error) {
      logger.error('Webhook processing error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

/**
 * 📊 Get Customer Billing Info
 */
router.get('/customer/:customerId', async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    
    const customer = await stripe.customers.retrieve(customerId);
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
    });

    res.json({
      customer,
      subscriptions: subscriptions.data,
    });

  } catch (error) {
    logger.error('Error fetching customer data:', error);
    res.status(500).json({ error: 'Failed to fetch customer data' });
  }
});

/**
 * ⚙️ Handle Checkout Completion
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  logger.info('Processing checkout completion', { sessionId: session.id });

  const customer = await stripe.customers.retrieve(session.customer as string);
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

  // Create user account and provision services
  const user = await UserService.createFromStripeSession(session, customer as Stripe.Customer);
  
  // Generate API keys and provision access
  const credentials = await ProvisioningService.provisionUser(user, subscription);

  // Process referral bonus if applicable
  if (session.metadata?.referralCode) {
    await ReferralService.processReferralComplete(
      session.metadata.referralCode,
      session.metadata.referrer,
      user.id
    );
  }

  // Send Discord notification
  await DiscordWebhookService.sendSubscriptionNotification({
    event: 'new_subscription',
    user: user.email,
    plan: subscription.items.data[0].price.nickname || 'Unknown',
    amount: subscription.items.data[0].price.unit_amount! / 100,
    referralCode: session.metadata?.referralCode,
  });

  logger.info('User provisioned successfully', {
    userId: user.id,
    customerId: customer.id,
    subscriptionId: subscription.id,
  });
}

/**
 * 🚀 Handle Subscription Created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  logger.info('Processing subscription creation', { subscriptionId: subscription.id });

  // Update user tier and permissions
  await UserService.updateSubscriptionTier(
    subscription.customer as string,
    subscription.items.data[0].price.id
  );

  // Enable real-time features
  await ProvisioningService.enableRealtimeAccess(subscription.customer as string);
}

/**
 * 🔄 Handle Subscription Updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  logger.info('Processing subscription update', { subscriptionId: subscription.id });

  // Update user permissions based on new tier
  await UserService.updateSubscriptionTier(
    subscription.customer as string,
    subscription.items.data[0].price.id
  );

  // Send Discord notification for upgrades/downgrades
  await DiscordWebhookService.sendSubscriptionNotification({
    event: 'subscription_updated',
    customerId: subscription.customer as string,
    plan: subscription.items.data[0].price.nickname || 'Unknown',
    status: subscription.status,
  });
}

/**
 * ❌ Handle Subscription Canceled
 */
async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  logger.info('Processing subscription cancellation', { subscriptionId: subscription.id });

  // Downgrade user to free tier
  await UserService.downgradeToFreeTier(subscription.customer as string);

  // Revoke API access after grace period
  await ProvisioningService.scheduleAccessRevocation(
    subscription.customer as string,
    config.saas.gracePeriodDays
  );

  // Send cancellation notification
  await DiscordWebhookService.sendSubscriptionNotification({
    event: 'subscription_canceled',
    customerId: subscription.customer as string,
    plan: subscription.items.data[0].price.nickname || 'Unknown',
  });
}

/**
 * ✅ Handle Payment Succeeded
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  logger.info('Processing successful payment', { invoiceId: invoice.id });

  // Extend access period
  await UserService.extendAccess(invoice.customer as string);

  // Process referral commissions if applicable
  if (invoice.subscription_details?.metadata?.referrer) {
    await ReferralService.processCommission(
      invoice.subscription_details.metadata.referrer,
      invoice.amount_paid / 100
    );
  }
}

/**
 * ❌ Handle Payment Failed
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  logger.error('Payment failed', { invoiceId: invoice.id });

  // Start dunning process
  await UserService.startDunningProcess(invoice.customer as string);

  // Send notification to Discord
  await DiscordWebhookService.sendPaymentFailedNotification({
    customerId: invoice.customer as string,
    amount: invoice.amount_due / 100,
    attemptCount: invoice.attempt_count,
  });
}

/**
 * 🎁 Create Referral Coupon
 */
async function createReferralCoupon(discountPercent: number): Promise<string> {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercent,
    duration: 'once',
    name: `Referral Bonus ${discountPercent}%`,
    metadata: {
      type: 'referral_bonus',
      created_by: 'lore_engine_saas',
    },
  });

  return coupon.id;
}

export default router;
