/**
 * 🔧 Lore Engine SaaS - User Service
 * Handles user account management and subscription tiers
 * Generated: July 18, 2025
 */

import crypto from 'crypto';
import Stripe from 'stripe';
import { logger } from '../utils/logger.js';
import { config } from '../config/environment.js';

export interface User {
  id: string;
  email: string;
  stripeCustomerId: string;
  subscriptionTier: 'free' | 'observer' | 'architect' | 'master';
  apiKey: string;
  createdAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface SubscriptionTierLimits {
  eventsPerMonth: number;
  conflictDetections: number;
  realtimeConnections: number;
  apiCallsPerMinute: number;
  features: string[];
}

export class UserService {
  private static users = new Map<string, User>();
  private static emailToUserId = new Map<string, string>();

  private static readonly tierLimits: Record<string, SubscriptionTierLimits> = {
    free: {
      eventsPerMonth: 100,
      conflictDetections: 50,
      realtimeConnections: 1,
      apiCallsPerMinute: 10,
      features: ['basic_dashboard'],
    },
    observer: {
      eventsPerMonth: 1000,
      conflictDetections: 500,
      realtimeConnections: 5,
      apiCallsPerMinute: 60,
      features: ['basic_dashboard', 'email_support'],
    },
    architect: {
      eventsPerMonth: 10000,
      conflictDetections: 5000,
      realtimeConnections: 25,
      apiCallsPerMinute: 300,
      features: ['advanced_analytics', 'priority_support', 'custom_integrations'],
    },
    master: {
      eventsPerMonth: -1, // unlimited
      conflictDetections: -1, // unlimited
      realtimeConnections: 100,
      apiCallsPerMinute: 1000,
      features: ['everything', 'dedicated_support', 'sla_guarantees', 'white_label'],
    },
  };

  /**
   * 👤 Create User from Stripe Session
   */
  static async createFromStripeSession(
    session: Stripe.Checkout.Session,
    customer: Stripe.Customer
  ): Promise<User> {
    const userId = crypto.randomUUID();
    const apiKey = this.generateApiKey(userId);

    const user: User = {
      id: userId,
      email: customer.email!,
      stripeCustomerId: customer.id,
      subscriptionTier: 'free', // Will be updated when subscription is processed
      apiKey,
      createdAt: new Date(),
      isActive: true,
      metadata: {
        signupSource: 'stripe_checkout',
        sessionId: session.id,
        referralCode: session.metadata?.referralCode,
      },
    };

    this.users.set(userId, user);
    this.emailToUserId.set(customer.email!, userId);

    logger.info('User created from Stripe session', {
      userId,
      email: customer.email,
      customerId: customer.id,
    });

    return user;
  }

  /**
   * 🎯 Update Subscription Tier
   */
  static async updateSubscriptionTier(
    stripeCustomerId: string,
    stripePriceId: string
  ): Promise<void> {
    const user = this.findUserByStripeId(stripeCustomerId);
    if (!user) {
      logger.error('User not found for subscription update', { stripeCustomerId });
      return;
    }

    // Map Stripe price ID to tier
    const tier = this.mapPriceIdToTier(stripePriceId);
    user.subscriptionTier = tier;

    this.users.set(user.id, user);

    logger.info('User subscription tier updated', {
      userId: user.id,
      email: user.email,
      newTier: tier,
      stripePriceId,
    });
  }

  /**
   * ⬇️ Downgrade to Free Tier
   */
  static async downgradeToFreeTier(stripeCustomerId: string): Promise<void> {
    const user = this.findUserByStripeId(stripeCustomerId);
    if (!user) {
      logger.error('User not found for downgrade', { stripeCustomerId });
      return;
    }

    user.subscriptionTier = 'free';
    this.users.set(user.id, user);

    logger.info('User downgraded to free tier', {
      userId: user.id,
      email: user.email,
    });
  }

  /**
   * ⏰ Extend Access Period
   */
  static async extendAccess(stripeCustomerId: string): Promise<void> {
    const user = this.findUserByStripeId(stripeCustomerId);
    if (!user) {
      logger.error('User not found for access extension', { stripeCustomerId });
      return;
    }

    user.isActive = true;
    user.lastLoginAt = new Date();
    this.users.set(user.id, user);

    logger.info('User access extended', {
      userId: user.id,
      email: user.email,
    });
  }

  /**
   * 💸 Start Dunning Process
   */
  static async startDunningProcess(stripeCustomerId: string): Promise<void> {
    const user = this.findUserByStripeId(stripeCustomerId);
    if (!user) {
      logger.error('User not found for dunning process', { stripeCustomerId });
      return;
    }

    // In a real implementation, this would:
    // 1. Send email notifications
    // 2. Gradually reduce access
    // 3. Eventually suspend account

    logger.info('Dunning process started', {
      userId: user.id,
      email: user.email,
    });
  }

  /**
   * 🔑 Generate API Key
   */
  private static generateApiKey(userId: string): string {
    const timestamp = Date.now().toString();
    const hash = crypto
      .createHmac('sha256', config.security.jwtSecret)
      .update(`${userId}:${timestamp}`)
      .digest('hex');
    
    return `lore_sk_${hash.slice(0, 32)}`;
  }

  /**
   * 🗺️ Map Price ID to Tier
   */
  private static mapPriceIdToTier(priceId: string): User['subscriptionTier'] {
    switch (priceId) {
      case config.stripe.priceIds.basic:
        return 'observer';
      case config.stripe.priceIds.pro:
        return 'architect';
      case config.stripe.priceIds.enterprise:
        return 'master';
      default:
        logger.warn('Unknown price ID, defaulting to free tier', { priceId });
        return 'free';
    }
  }

  /**
   * 🔍 Find User by Stripe ID
   */
  private static findUserByStripeId(stripeCustomerId: string): User | undefined {
    for (const user of this.users.values()) {
      if (user.stripeCustomerId === stripeCustomerId) {
        return user;
      }
    }
    return undefined;
  }

  /**
   * 📊 Get User by ID
   */
  static async getUserById(userId: string): Promise<User | undefined> {
    return this.users.get(userId);
  }

  /**
   * 📧 Get User by Email
   */
  static async getUserByEmail(email: string): Promise<User | undefined> {
    const userId = this.emailToUserId.get(email);
    return userId ? this.users.get(userId) : undefined;
  }

  /**
   * 🔑 Get User by API Key
   */
  static async getUserByApiKey(apiKey: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.apiKey === apiKey) {
        return user;
      }
    }
    return undefined;
  }

  /**
   * 📋 Get Subscription Limits
   */
  static getSubscriptionLimits(tier: User['subscriptionTier']): SubscriptionTierLimits {
    return this.tierLimits[tier] || this.tierLimits.free;
  }

  /**
   * ✅ Check Feature Access
   */
  static hasFeatureAccess(user: User, feature: string): boolean {
    const limits = this.getSubscriptionLimits(user.subscriptionTier);
    return limits.features.includes(feature) || limits.features.includes('everything');
  }

  /**
   * 📊 Get All Users (Admin)
   */
  static async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  /**
   * 🔄 Update User
   */
  static async updateUser(userId: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) {
      return undefined;
    }

    const updatedUser = { ...user, ...updates };
    this.users.set(userId, updatedUser);

    // Update email mapping if email changed
    if (updates.email && updates.email !== user.email) {
      this.emailToUserId.delete(user.email);
      this.emailToUserId.set(updates.email, userId);
    }

    logger.info('User updated', { userId, updates: Object.keys(updates) });
    return updatedUser;
  }

  /**
   * ❌ Delete User
   */
  static async deleteUser(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) {
      return false;
    }

    this.users.delete(userId);
    this.emailToUserId.delete(user.email);

    logger.info('User deleted', { userId, email: user.email });
    return true;
  }
}
