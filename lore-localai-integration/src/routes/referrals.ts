/**
 * 🔁 Lore Engine SaaS - Referral Routes
 * RESTful API for referral management
 * Generated: July 18, 2025
 */

import express, { Request, Response } from 'express';
import { ReferralService } from '../services/referral.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/environment.js';

const router = express.Router();

interface GenerateReferralRequest {
  userId: string;
  userEmail: string;
  expiryDays?: number;
  maxUsage?: number;
  bonusPercent?: number;
}

interface ValidateReferralQuery {
  ref: string;
}

/**
 * 🎯 Generate Referral Code
 * POST /api/referrals/generate
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      userEmail,
      expiryDays = 30,
      maxUsage = 10,
      bonusPercent = 20,
    }: GenerateReferralRequest = req.body;

    if (!userId || !userEmail) {
      return res.status(400).json({
        error: 'userId and userEmail are required',
      });
    }

    const result = await ReferralService.generateCode(userId, userEmail, {
      expiryDays,
      maxUsage,
      bonusPercent,
    });

    logger.info('Referral code generated via API', {
      userId,
      userEmail,
      code: result.code,
    });

    res.json({
      success: true,
      referralCode: result.code,
      referralLink: result.link,
      expiryDays,
      maxUsage,
      bonusPercent,
      shareMessage: `🔮 Join Lore Engine with my referral code ${result.code} and get ${bonusPercent}% off your first month! ${result.link}`,
    });

  } catch (error) {
    logger.error('Error generating referral code:', error);
    res.status(500).json({
      error: 'Failed to generate referral code',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * ✅ Validate Referral Code
 * GET /api/referrals/validate?ref=CODE
 */
router.get('/validate', async (req: Request, res: Response) => {
  try {
    const { ref }: ValidateReferralQuery = req.query as any;

    if (!ref) {
      return res.status(400).json({
        error: 'Referral code (ref) is required',
      });
    }

    const validation = await ReferralService.validateCode(ref);

    logger.info('Referral code validated', {
      code: ref,
      valid: validation.valid,
      bonus: validation.bonus,
    });

    res.json({
      valid: validation.valid,
      bonus: validation.bonus,
      referrer: validation.referrer,
      error: validation.error,
      discountMessage: validation.valid 
        ? `🎉 Valid referral! You'll get ${validation.bonus}% off your first month!`
        : validation.error,
    });

  } catch (error) {
    logger.error('Error validating referral code:', error);
    res.status(500).json({
      error: 'Failed to validate referral code',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 📊 Get User Referral Stats
 * GET /api/referrals/stats/:userId
 */
router.get('/stats/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const stats = await ReferralService.getReferralStats(userId);
    const referrals = await ReferralService.getUserReferrals(userId);

    logger.info('Referral stats retrieved', { userId });

    res.json({
      stats,
      referrals: referrals.map(ref => ({
        code: ref.code,
        createdAt: ref.createdAt,
        expiresAt: ref.expiresAt,
        usageCount: ref.usageCount,
        maxUsage: ref.maxUsage,
        bonusPercent: ref.bonusPercent,
        isActive: ref.isActive,
        link: `${config.saas.baseUrl}/signup?ref=${ref.code}`,
      })),
    });

  } catch (error) {
    logger.error('Error retrieving referral stats:', error);
    res.status(500).json({
      error: 'Failed to retrieve referral stats',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 📋 List All User Referrals
 * GET /api/referrals/user/:userId
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const referrals = await ReferralService.getUserReferrals(userId);

    res.json({
      referrals: referrals.map(ref => ({
        id: ref.id,
        code: ref.code,
        createdAt: ref.createdAt,
        expiresAt: ref.expiresAt,
        usageCount: ref.usageCount,
        maxUsage: ref.maxUsage,
        bonusPercent: ref.bonusPercent,
        isActive: ref.isActive,
        isExpired: new Date() > ref.expiresAt,
        link: `${config.saas.baseUrl}/signup?ref=${ref.code}`,
        shareText: `🔮 Join Lore Engine with my referral code ${ref.code} and get ${ref.bonusPercent}% off!`,
      })),
    });

  } catch (error) {
    logger.error('Error listing user referrals:', error);
    res.status(500).json({
      error: 'Failed to list referrals',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * ❌ Deactivate Referral Code
 * DELETE /api/referrals/:code
 */
router.delete('/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    const success = await ReferralService.deactivateCode(code);

    if (success) {
      logger.info('Referral code deactivated via API', { code });
      res.json({
        success: true,
        message: 'Referral code deactivated successfully',
      });
    } else {
      res.status(404).json({
        error: 'Referral code not found',
      });
    }

  } catch (error) {
    logger.error('Error deactivating referral code:', error);
    res.status(500).json({
      error: 'Failed to deactivate referral code',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 🧹 Cleanup Expired Codes
 * POST /api/referrals/cleanup
 */
router.post('/cleanup', async (req: Request, res: Response) => {
  try {
    const cleanedCount = await ReferralService.cleanupExpiredCodes();

    logger.info('Referral cleanup completed', { cleanedCount });

    res.json({
      success: true,
      cleanedCount,
      message: `Cleaned up ${cleanedCount} expired referral codes`,
    });

  } catch (error) {
    logger.error('Error during referral cleanup:', error);
    res.status(500).json({
      error: 'Failed to cleanup referral codes',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
