/**
 * 🔮 Lore Engine SaaS - Stripe Payment Service
 * Automated payment processing and subscription management
 * Generated: July 18, 2025
 */

import Stripe from 'stripe';
import { config } from '../config/environment';
import { logger } from '../utils/logger';
import { EventEmitter } from 'events';

export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    eventsPerMonth: number;
    conflictDetections: number;
    realtimeConnections: number;
    apiCallsPerMinute: number;
    webhookEndpoints: number;
    dashboardAccess: boolean;
    prioritySupport: boolean;
    customIntegrations: boolean;
  };
  stripePriceId: string;
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'basic',
    name: 'Lore Observer',
    description: 'Perfect for individuals exploring the lore realm',
    price: 9.99,
    interval: 'month',
    features: [
      'Real-time lore processing',
      'Discord notifications',
      'Basic conflict detection',
      'Community dashboard access',
      'Email support'
    ],
    limits: {
      eventsPerMonth: 1000,
      conflictDetections: 100,
      realtimeConnections: 5,
      apiCallsPerMinute: 60,
      webhookEndpoints: 2,
      dashboardAccess: true,
      prioritySupport: false,
      customIntegrations: false
    },
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID || 'price_basic'
  },
  {
    id: 'pro',
    name: 'Lore Architect',
    description: 'For creators building immersive lore experiences',
    price: 29.99,
    interval: 'month',
    features: [
      'Multi-platform dispatch (Discord, TikTok, Markdown)',
      'Advanced conflict detection & resolution',
      'Real-time WebSocket feeds',
      'Sentiment analysis & filtering',
      'Custom webhook endpoints',
      'Analytics dashboard',
      'Priority support'
    ],
    limits: {
      eventsPerMonth: 10000,
      conflictDetections: 1000,
      realtimeConnections: 25,
      apiCallsPerMinute: 300,
      webhookEndpoints: 10,
      dashboardAccess: true,
      prioritySupport: true,
      customIntegrations: false
    },
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro'
  },
  {
    id: 'enterprise',
    name: 'Lore Master',
    description: 'For studios and enterprises scaling lore universes',
    price: 99.99,
    interval: 'month',
    features: [
      'Unlimited event processing',
      'Custom agent plugins',
      'White-label dashboard',
      'Advanced integrations (LangChain, n8n)',
      'Real-time collaboration tools',
      'Custom SLA & dedicated support',
      'On-premise deployment options'
    ],
    limits: {
      eventsPerMonth: -1, // Unlimited
      conflictDetections: -1,
      realtimeConnections: 100,
      apiCallsPerMinute: 1000,
      webhookEndpoints: 50,
      dashboardAccess: true,
      prioritySupport: true,
      customIntegrations: true
    },
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise'
  }
];

export interface Customer {
  id: string;
  stripeCustomerId: string;
  email: string;
  subscriptionTier: string;
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'incomplete';
  subscriptionId?: string;
  currentPeriodEnd: Date;
  createdAt: Date;
  apiKey: string;
  usageStats: {
    eventsThisMonth: number;
    conflictsDetected: number;
    lastApiCall: Date;
  };
}

export class StripeService extends EventEmitter {
  private stripe: Stripe;

  constructor() {
    super();
    this.stripe = new Stripe(config.stripe.secretKey, {
      apiVersion: '2023-08-16'
    });
  }

  /**
   * Create a new customer and redirect to Stripe Checkout
   */
  async createCheckoutSession(
    tierID: string,
    customerEmail: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ url: string; sessionId: string }> {
    try {
      const tier = SUBSCRIPTION_TIERS.find(t => t.id === tierID);
      if (!tier) {
        throw new Error(`Invalid subscription tier: ${tierID}`);
      }

      logger.info('Creating Stripe checkout session', {
        tier: tier.name,
        email: customerEmail,
        price: tier.price
      });

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: customerEmail,
        line_items: [
          {
            price: tier.stripePriceId,
            quantity: 1
          }
        ],
        mode: 'subscription',
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        metadata: {
          tier: tierID,
          email: customerEmail
        },
        subscription_data: {
          metadata: {
            tier: tierID,
            email: customerEmail
          }
        }
      });

      return {
        url: session.url!,
        sessionId: session.id
      };
    } catch (error) {
      logger.error('Failed to create checkout session', { error, tierID, customerEmail });
      throw error;
    }
  }

  /**
   * Handle successful payment - provision services
   */
  async handleSuccessfulPayment(sessionId: string): Promise<Customer> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription', 'customer']
      });

      if (!session.subscription || !session.customer) {
        throw new Error('Invalid session - missing subscription or customer');
      }

      const subscription = session.subscription as Stripe.Subscription;
      const customer = session.customer as Stripe.Customer;
      const tierID = session.metadata?.tier;

      if (!tierID) {
        throw new Error('Missing tier information in session metadata');
      }

      logger.info('Provisioning customer services', {
        customerId: customer.id,
        subscriptionId: subscription.id,
        tier: tierID
      });

      // Generate API key for the customer
      const apiKey = this.generateApiKey(customer.id, tierID);

      // Create customer record
      const newCustomer: Customer = {
        id: customer.id,
        stripeCustomerId: customer.id,
        email: customer.email!,
        subscriptionTier: tierID,
        subscriptionStatus: subscription.status as any,
        subscriptionId: subscription.id,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        createdAt: new Date(),
        apiKey,
        usageStats: {
          eventsThisMonth: 0,
          conflictsDetected: 0,
          lastApiCall: new Date()
        }
      };

      // Emit event for customer provisioning
      this.emit('customer:created', newCustomer);

      // Send welcome email with API credentials
      this.emit('email:welcome', {
        customer: newCustomer,
        tier: SUBSCRIPTION_TIERS.find(t => t.id === tierID)
      });

      logger.info('Customer successfully provisioned', {
        customerId: customer.id,
        tier: tierID,
        apiKey: apiKey.substring(0, 8) + '...'
      });

      return newCustomer;
    } catch (error) {
      logger.error('Failed to handle successful payment', { error, sessionId });
      throw error;
    }
  }

  /**
   * Handle subscription updates (upgrades/downgrades)
   */
  async updateSubscription(
    customerId: string,
    newTierID: string
  ): Promise<Stripe.Subscription> {
    try {
      const customer = await this.getCustomerByStripeId(customerId);
      if (!customer?.subscriptionId) {
        throw new Error('Customer has no active subscription');
      }

      const newTier = SUBSCRIPTION_TIERS.find(t => t.id === newTierID);
      if (!newTier) {
        throw new Error(`Invalid tier: ${newTierID}`);
      }

      const subscription = await this.stripe.subscriptions.retrieve(customer.subscriptionId);
      
      const updatedSubscription = await this.stripe.subscriptions.update(subscription.id, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newTier.stripePriceId
          }
        ],
        metadata: {
          tier: newTierID
        }
      });

      logger.info('Subscription updated', {
        customerId,
        oldTier: customer.subscriptionTier,
        newTier: newTierID,
        subscriptionId: subscription.id
      });

      // Emit event for subscription change
      this.emit('subscription:updated', {
        customer,
        oldTier: customer.subscriptionTier,
        newTier: newTierID
      });

      return updatedSubscription;
    } catch (error) {
      logger.error('Failed to update subscription', { error, customerId, newTierID });
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(customerId: string): Promise<void> {
    try {
      const customer = await this.getCustomerByStripeId(customerId);
      if (!customer?.subscriptionId) {
        throw new Error('Customer has no active subscription');
      }

      await this.stripe.subscriptions.update(customer.subscriptionId, {
        cancel_at_period_end: true
      });

      logger.info('Subscription cancelled', {
        customerId,
        subscriptionId: customer.subscriptionId
      });

      this.emit('subscription:cancelled', customer);
    } catch (error) {
      logger.error('Failed to cancel subscription', { error, customerId });
      throw error;
    }
  }

  /**
   * Handle webhook events from Stripe
   */
  async handleWebhook(event: Stripe.Event): Promise<void> {
    try {
      logger.info('Processing Stripe webhook', { type: event.type, id: event.id });

      switch (event.type) {
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        default:
          logger.debug('Unhandled webhook event', { type: event.type });
      }
    } catch (error) {
      logger.error('Failed to process webhook', { error, eventType: event.type });
      throw error;
    }
  }

  /**
   * Validate customer's API usage against their tier limits
   */
  validateUsage(customer: Customer, requestType: string): boolean {
    const tier = SUBSCRIPTION_TIERS.find(t => t.id === customer.subscriptionTier);
    if (!tier) return false;

    switch (requestType) {
      case 'api_call':
        // Rate limiting is handled by express-rate-limit
        return true;

      case 'event_processing':
        if (tier.limits.eventsPerMonth === -1) return true;
        return customer.usageStats.eventsThisMonth < tier.limits.eventsPerMonth;

      case 'conflict_detection':
        if (tier.limits.conflictDetections === -1) return true;
        return customer.usageStats.conflictsDetected < tier.limits.conflictDetections;

      case 'webhook_endpoint':
        return true; // Handled during webhook creation

      case 'dashboard_access':
        return tier.limits.dashboardAccess;

      default:
        return false;
    }
  }

  /**
   * Get customer usage statistics for billing/monitoring
   */
  async getUsageStats(customerId: string): Promise<any> {
    const customer = await this.getCustomerByStripeId(customerId);
    if (!customer) throw new Error('Customer not found');

    const tier = SUBSCRIPTION_TIERS.find(t => t.id === customer.subscriptionTier);
    
    return {
      customer: {
        id: customer.id,
        email: customer.email,
        tier: tier?.name,
        status: customer.subscriptionStatus
      },
      usage: customer.usageStats,
      limits: tier?.limits,
      billingInfo: {
        currentPeriodEnd: customer.currentPeriodEnd,
        nextBillingAmount: tier?.price
      }
    };
  }

  // Private helper methods
  private generateApiKey(customerId: string, tier: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `lore_${tier}_${timestamp}_${random}`;
  }

  private async getCustomerByStripeId(stripeCustomerId: string): Promise<Customer | null> {
    // This would typically query your database
    // For now, emit an event to let the service layer handle it
    return new Promise((resolve) => {
      this.emit('customer:lookup', stripeCustomerId, resolve);
    });
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    logger.info('Subscription updated', { subscriptionId: subscription.id });
    this.emit('subscription:updated', subscription);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    logger.info('Subscription deleted', { subscriptionId: subscription.id });
    this.emit('subscription:deleted', subscription);
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    logger.warn('Payment failed', { 
      customerId: invoice.customer,
      invoiceId: invoice.id,
      amount: invoice.amount_due
    });
    this.emit('payment:failed', invoice);
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    logger.info('Payment succeeded', { 
      customerId: invoice.customer,
      invoiceId: invoice.id,
      amount: invoice.amount_paid
    });
    this.emit('payment:succeeded', invoice);
  }
}

export const stripeService = new StripeService();
