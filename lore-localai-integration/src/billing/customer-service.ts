/**
 * 🔮 Lore Engine SaaS - Customer Management Service
 * Complete customer lifecycle and subscription management
 * Generated: July 18, 2025
 */

import { Customer, stripeService } from './stripe-service';
import { logger } from '../utils/logger';
import { config } from '../config/environment';
import { EventEmitter } from 'events';

export interface CustomerUsage {
  customerId: string;
  month: string; // YYYY-MM format
  eventsProcessed: number;
  conflictsDetected: number;
  apiCalls: number;
  webhooksDelivered: number;
  realtimeMinutes: number;
}

export interface ApiKey {
  id: string;
  customerId: string;
  key: string;
  name: string;
  permissions: string[];
  isActive: boolean;
  lastUsed?: Date;
  createdAt: Date;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
}

export class CustomerService extends EventEmitter {
  private customers: Map<string, Customer> = new Map();
  private apiKeys: Map<string, ApiKey> = new Map();
  private usage: Map<string, CustomerUsage> = new Map();

  constructor() {
    super();
    this.setupStripeEventHandlers();
    this.startUsageResetTask();
  }

  /**
   * Setup Stripe service event handlers
   */
  private setupStripeEventHandlers(): void {
    stripeService.on('customer:created', (customer: Customer) => {
      this.handleCustomerCreated(customer);
    });

    stripeService.on('customer:lookup', (stripeCustomerId: string, callback: (customer: Customer | null) => void) => {
      const customer = Array.from(this.customers.values())
        .find(c => c.stripeCustomerId === stripeCustomerId);
      callback(customer || null);
    });

    stripeService.on('subscription:updated', (data: any) => {
      this.handleSubscriptionUpdated(data);
    });

    stripeService.on('subscription:cancelled', (customer: Customer) => {
      this.handleSubscriptionCancelled(customer);
    });

    stripeService.on('payment:failed', (invoice: any) => {
      this.handlePaymentFailed(invoice);
    });

    stripeService.on('email:welcome', (data: { customer: Customer; tier: any }) => {
      this.sendWelcomeEmail(data.customer, data.tier);
    });
  }

  /**
   * Create a new customer subscription
   */
  async createSubscription(
    tierID: string,
    customerEmail: string,
    metadata?: Record<string, any>
  ): Promise<{ checkoutUrl: string; sessionId: string }> {
    try {
      logger.info('Creating new subscription', { tier: tierID, email: customerEmail });

      const baseUrl = config.saas.baseUrl;
      const successUrl = `${config.saas.dashboardUrl}/onboarding/success`;
      const cancelUrl = `${config.saas.dashboardUrl}/pricing`;

      const checkout = await stripeService.createCheckoutSession(
        tierID,
        customerEmail,
        successUrl,
        cancelUrl
      );

      logger.info('Checkout session created', {
        sessionId: checkout.sessionId,
        tier: tierID
      });

      return {
        checkoutUrl: checkout.url,
        sessionId: checkout.sessionId
      };
    } catch (error) {
      logger.error('Failed to create subscription', { error, tierID, customerEmail });
      throw error;
    }
  }

  /**
   * Complete customer onboarding after successful payment
   */
  async completeOnboarding(sessionId: string): Promise<{
    customer: Customer;
    apiKey: string;
    dashboardUrl: string;
  }> {
    try {
      const customer = await stripeService.handleSuccessfulPayment(sessionId);
      
      // Generate API key
      const apiKey = await this.createApiKey(customer.id, {
        name: 'Primary API Key',
        permissions: ['all']
      });

      // Initialize usage tracking
      this.initializeUsageTracking(customer.id);

      logger.info('Customer onboarding completed', {
        customerId: customer.id,
        tier: customer.subscriptionTier
      });

      return {
        customer,
        apiKey: apiKey.key,
        dashboardUrl: `${config.saas.dashboardUrl}/dashboard?api_key=${apiKey.key}`
      };
    } catch (error) {
      logger.error('Failed to complete onboarding', { error, sessionId });
      throw error;
    }
  }

  /**
   * Get customer by API key
   */
  async getCustomerByApiKey(apiKey: string): Promise<Customer | null> {
    const keyRecord = this.apiKeys.get(apiKey);
    if (!keyRecord || !keyRecord.isActive) {
      return null;
    }

    // Update last used timestamp
    keyRecord.lastUsed = new Date();

    return this.customers.get(keyRecord.customerId) || null;
  }

  /**
   * Validate API request against customer limits
   */
  async validateApiRequest(
    apiKey: string,
    requestType: 'event_processing' | 'conflict_detection' | 'api_call' | 'webhook' | 'realtime'
  ): Promise<{
    allowed: boolean;
    customer?: Customer;
    reason?: string;
    remainingQuota?: number;
  }> {
    const customer = await this.getCustomerByApiKey(apiKey);
    
    if (!customer) {
      return { allowed: false, reason: 'Invalid API key' };
    }

    if (customer.subscriptionStatus !== 'active') {
      return { allowed: false, reason: 'Subscription not active' };
    }

    // Check usage limits
    const isAllowed = stripeService.validateUsage(customer, requestType);
    if (!isAllowed) {
      return { 
        allowed: false, 
        customer,
        reason: `${requestType} quota exceeded for ${customer.subscriptionTier} tier`
      };
    }

    // Increment usage counters
    await this.incrementUsage(customer.id, requestType);

    return { allowed: true, customer };
  }

  /**
   * Create a new API key for a customer
   */
  async createApiKey(
    customerId: string,
    options: {
      name: string;
      permissions: string[];
      customLimits?: {
        requestsPerMinute?: number;
        requestsPerHour?: number;
        requestsPerDay?: number;
      };
    }
  ): Promise<ApiKey> {
    const customer = this.customers.get(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const keyId = this.generateId();
    const keyValue = this.generateApiKeyValue(customerId, keyId);

    const apiKey: ApiKey = {
      id: keyId,
      customerId,
      key: keyValue,
      name: options.name,
      permissions: options.permissions,
      isActive: true,
      createdAt: new Date(),
      rateLimit: {
        requestsPerMinute: options.customLimits?.requestsPerMinute || 60,
        requestsPerHour: options.customLimits?.requestsPerHour || 3600,
        requestsPerDay: options.customLimits?.requestsPerDay || 86400,
      }
    };

    this.apiKeys.set(keyValue, apiKey);

    logger.info('API key created', {
      customerId,
      keyId,
      name: options.name
    });

    return apiKey;
  }

  /**
   * Get customer usage statistics and billing information
   */
  async getCustomerDashboard(customerId: string): Promise<{
    customer: Customer;
    usage: CustomerUsage;
    billing: any;
    apiKeys: ApiKey[];
  }> {
    const customer = this.customers.get(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const usage = this.usage.get(`${customerId}:${currentMonth}`) || {
      customerId,
      month: currentMonth,
      eventsProcessed: 0,
      conflictsDetected: 0,
      apiCalls: 0,
      webhooksDelivered: 0,
      realtimeMinutes: 0
    };

    const billing = await stripeService.getUsageStats(customer.stripeCustomerId);
    
    const customerApiKeys = Array.from(this.apiKeys.values())
      .filter(key => key.customerId === customerId);

    return {
      customer,
      usage,
      billing,
      apiKeys: customerApiKeys
    };
  }

  /**
   * Upgrade/downgrade customer subscription
   */
  async changeSubscription(customerId: string, newTierID: string): Promise<void> {
    const customer = this.customers.get(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    await stripeService.updateSubscription(customer.stripeCustomerId, newTierID);
    
    // Update local customer record
    customer.subscriptionTier = newTierID;
    this.customers.set(customerId, customer);

    logger.info('Subscription changed', {
      customerId,
      newTier: newTierID
    });
  }

  /**
   * Cancel customer subscription
   */
  async cancelSubscription(customerId: string): Promise<void> {
    const customer = this.customers.get(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    await stripeService.cancelSubscription(customer.stripeCustomerId);

    logger.info('Subscription cancelled', { customerId });
  }

  // Private helper methods
  private async handleCustomerCreated(customer: Customer): Promise<void> {
    this.customers.set(customer.id, customer);
    this.initializeUsageTracking(customer.id);
    
    logger.info('Customer provisioned', {
      customerId: customer.id,
      tier: customer.subscriptionTier
    });
  }

  private async handleSubscriptionUpdated(data: any): Promise<void> {
    // Handle subscription changes from Stripe webhooks
    logger.info('Subscription updated via webhook', data);
  }

  private async handleSubscriptionCancelled(customer: Customer): Promise<void> {
    // Handle subscription cancellation
    customer.subscriptionStatus = 'canceled';
    this.customers.set(customer.id, customer);
    
    // Deactivate API keys after grace period
    setTimeout(() => {
      this.deactivateCustomerApiKeys(customer.id);
    }, config.saas.gracePeriodDays * 24 * 60 * 60 * 1000);
  }

  private async handlePaymentFailed(invoice: any): Promise<void> {
    logger.warn('Payment failed for customer', {
      customerId: invoice.customer,
      amount: invoice.amount_due
    });
    
    // Send payment failed notification
    this.emit('notification:payment_failed', {
      customerId: invoice.customer,
      amount: invoice.amount_due
    });
  }

  private async sendWelcomeEmail(customer: Customer, tier: any): Promise<void> {
    logger.info('Sending welcome email', {
      customerId: customer.id,
      email: customer.email
    });

    // Emit event for email service to handle
    this.emit('email:send', {
      to: customer.email,
      template: 'welcome',
      data: {
        customer,
        tier,
        dashboardUrl: config.saas.dashboardUrl,
        apiKey: customer.apiKey,
        supportEmail: config.saas.supportEmail
      }
    });
  }

  private initializeUsageTracking(customerId: string): void {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const usageKey = `${customerId}:${currentMonth}`;
    
    if (!this.usage.has(usageKey)) {
      this.usage.set(usageKey, {
        customerId,
        month: currentMonth,
        eventsProcessed: 0,
        conflictsDetected: 0,
        apiCalls: 0,
        webhooksDelivered: 0,
        realtimeMinutes: 0
      });
    }
  }

  private async incrementUsage(customerId: string, type: string): Promise<void> {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const usageKey = `${customerId}:${currentMonth}`;
    const usage = this.usage.get(usageKey);
    
    if (usage) {
      switch (type) {
        case 'event_processing':
          usage.eventsProcessed++;
          break;
        case 'conflict_detection':
          usage.conflictsDetected++;
          break;
        case 'api_call':
          usage.apiCalls++;
          break;
        case 'webhook':
          usage.webhooksDelivered++;
          break;
        case 'realtime':
          usage.realtimeMinutes++;
          break;
      }
      
      this.usage.set(usageKey, usage);
    }
  }

  private deactivateCustomerApiKeys(customerId: string): void {
    Array.from(this.apiKeys.entries()).forEach(([key, apiKey]) => {
      if (apiKey.customerId === customerId) {
        apiKey.isActive = false;
        this.apiKeys.set(key, apiKey);
      }
    });
  }

  private startUsageResetTask(): void {
    // Reset usage counters monthly
    setInterval(() => {
      const now = new Date();
      if (now.getDate() === 1 && now.getHours() === 0) {
        this.resetMonthlyUsage();
      }
    }, 60 * 60 * 1000); // Check every hour
  }

  private resetMonthlyUsage(): void {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    Array.from(this.customers.keys()).forEach(customerId => {
      this.initializeUsageTracking(customerId);
    });

    logger.info('Monthly usage counters reset', { month: currentMonth });
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private generateApiKeyValue(customerId: string, keyId: string): string {
    const prefix = 'lore';
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `${prefix}_${timestamp}_${random}_${keyId.substring(0, 8)}`;
  }
}

export const customerService = new CustomerService();
