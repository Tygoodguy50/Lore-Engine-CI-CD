/**
 * 🔁 Lore Engine SaaS - Referral Service
 * Handles referral code generation, validation, and rewards
 * Generated: July 18, 2025
 */

import crypto from 'crypto';
import { config } from '../config/environment.js';
import { logger } from '../utils/logger.js';

interface ReferralCode {
  id: string;
  code: string;
  referrerId: string;
  referrerEmail: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
  usageCount: number;
  maxUsage: number;
  bonusPercent: number;
}

interface ReferralValidation {
  valid: boolean;
  referrer?: string;
  bonus: number;
  error?: string;
}

interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  totalCommissions: number;
  activeReferrals: number;
}

export class ReferralService {
  private static referralSalt = process.env.REFERRAL_SALT || 'ghostReferralHashMagic';
  private static referrals = new Map<string, ReferralCode>();
  private static userReferrals = new Map<string, string[]>();

  /**
   * 🎯 Generate Referral Code
   */
  static async generateCode(
    userId: string, 
    userEmail: string,
    options: {
      expiryDays?: number;
      maxUsage?: number;
      bonusPercent?: number;
    } = {}
  ): Promise<{ code: string; link: string }> {
    const {
      expiryDays = 30,
      maxUsage = 10,
      bonusPercent = 20,
    } = options;

    // Generate unique referral code
    const timestamp = Date.now().toString();
    const hash = crypto
      .createHmac('sha256', this.referralSalt)
      .update(`${userId}:${userEmail}:${timestamp}`)
      .digest('hex');
    
    const code = `LORE_${hash.slice(0, 8).toUpperCase()}`;

    // Create referral record
    const referralCode: ReferralCode = {
      id: crypto.randomUUID(),
      code,
      referrerId: userId,
      referrerEmail: userEmail,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000),
      isActive: true,
      usageCount: 0,
      maxUsage,
      bonusPercent,
    };

    // Store referral code
    this.referrals.set(code, referralCode);
    
    // Track user referrals
    const userCodes = this.userReferrals.get(userId) || [];
    userCodes.push(code);
    this.userReferrals.set(userId, userCodes);

    const referralLink = `${config.saas.baseUrl}/signup?ref=${code}`;

    logger.info('Referral code generated', {
      userId,
      code,
      expiryDays,
      maxUsage,
      bonusPercent,
    });

    return { code, link: referralLink };
  }

  /**
   * ✅ Validate Referral Code
   */
  static async validateCode(code: string): Promise<ReferralValidation> {
    const referral = this.referrals.get(code);

    if (!referral) {
      return {
        valid: false,
        bonus: 0,
        error: 'Referral code not found',
      };
    }

    if (!referral.isActive) {
      return {
        valid: false,
        bonus: 0,
        error: 'Referral code is inactive',
      };
    }

    if (new Date() > referral.expiresAt) {
      return {
        valid: false,
        bonus: 0,
        error: 'Referral code has expired',
      };
    }

    if (referral.usageCount >= referral.maxUsage) {
      return {
        valid: false,
        bonus: 0,
        error: 'Referral code usage limit reached',
      };
    }

    return {
      valid: true,
      referrer: referral.referrerId,
      bonus: referral.bonusPercent,
    };
  }

  /**
   * 🎉 Process Referral Completion
   */
  static async processReferralComplete(
    code: string,
    referrerId: string,
    newUserId: string
  ): Promise<void> {
    const referral = this.referrals.get(code);
    
    if (!referral) {
      logger.error('Referral code not found during completion', { code });
      return;
    }

    // Increment usage count
    referral.usageCount += 1;
    this.referrals.set(code, referral);

    // Log referral completion
    logger.info('Referral completion processed', {
      code,
      referrerId,
      newUserId,
      usageCount: referral.usageCount,
      bonusPercent: referral.bonusPercent,
    });

    // Award referrer bonus (this would typically update a database)
    await this.awardReferrerBonus(referrerId, referral.bonusPercent);
  }

  /**
   * 💰 Process Commission Payment
   */
  static async processCommission(
    referrerId: string,
    paymentAmount: number,
    commissionRate: number = 0.1
  ): Promise<void> {
    const commission = paymentAmount * commissionRate;

    logger.info('Processing referral commission', {
      referrerId,
      paymentAmount,
      commission,
      commissionRate,
    });

    // This would typically update user balance in database
    // For now, we'll just log the commission
    console.log(`💰 Commission of $${commission.toFixed(2)} awarded to ${referrerId}`);
  }

  /**
   * 📊 Get Referral Stats
   */
  static async getReferralStats(userId: string): Promise<ReferralStats> {
    const userCodes = this.userReferrals.get(userId) || [];
    const referrals = userCodes.map(code => this.referrals.get(code)).filter(Boolean) as ReferralCode[];

    const stats: ReferralStats = {
      totalReferrals: referrals.length,
      successfulReferrals: referrals.reduce((sum, ref) => sum + ref.usageCount, 0),
      totalCommissions: 0, // Would calculate from database
      activeReferrals: referrals.filter(ref => 
        ref.isActive && 
        new Date() < ref.expiresAt && 
        ref.usageCount < ref.maxUsage
      ).length,
    };

    return stats;
  }

  /**
   * 📋 List User Referrals
   */
  static async getUserReferrals(userId: string): Promise<ReferralCode[]> {
    const userCodes = this.userReferrals.get(userId) || [];
    return userCodes
      .map(code => this.referrals.get(code))
      .filter(Boolean) as ReferralCode[];
  }

  /**
   * ❌ Deactivate Referral Code
   */
  static async deactivateCode(code: string): Promise<boolean> {
    const referral = this.referrals.get(code);
    
    if (!referral) {
      return false;
    }

    referral.isActive = false;
    this.referrals.set(code, referral);

    logger.info('Referral code deactivated', { code });
    return true;
  }

  /**
   * 🎁 Award Referrer Bonus
   */
  private static async awardReferrerBonus(
    referrerId: string,
    bonusPercent: number
  ): Promise<void> {
    // This would typically update user account with bonus credits
    logger.info('Referrer bonus awarded', {
      referrerId,
      bonusPercent,
      bonusType: 'account_credit',
    });

    // Send notification about bonus
    console.log(`🎉 Referrer ${referrerId} earned ${bonusPercent}% bonus!`);
  }

  /**
   * 🔧 Cleanup Expired Codes
   */
  static async cleanupExpiredCodes(): Promise<number> {
    let cleanedCount = 0;
    const now = new Date();

    for (const [code, referral] of this.referrals.entries()) {
      if (now > referral.expiresAt) {
        this.referrals.delete(code);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info('Cleaned up expired referral codes', { cleanedCount });
    }

    return cleanedCount;
  }
}
