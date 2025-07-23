"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const referral_js_1 = require("../services/referral.js");
const logger_js_1 = require("../utils/logger.js");
const environment_js_1 = require("../config/environment.js");
const router = express_1.default.Router();
router.post('/generate', async (req, res) => {
    try {
        const { userId, userEmail, expiryDays = 30, maxUsage = 10, bonusPercent = 20, } = req.body;
        if (!userId || !userEmail) {
            return res.status(400).json({
                error: 'userId and userEmail are required',
            });
        }
        const result = await referral_js_1.ReferralService.generateCode(userId, userEmail, {
            expiryDays,
            maxUsage,
            bonusPercent,
        });
        logger_js_1.logger.info('Referral code generated via API', {
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
    }
    catch (error) {
        logger_js_1.logger.error('Error generating referral code:', error);
        res.status(500).json({
            error: 'Failed to generate referral code',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
router.get('/validate', async (req, res) => {
    try {
        const { ref } = req.query;
        if (!ref) {
            return res.status(400).json({
                error: 'Referral code (ref) is required',
            });
        }
        const validation = await referral_js_1.ReferralService.validateCode(ref);
        logger_js_1.logger.info('Referral code validated', {
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
    }
    catch (error) {
        logger_js_1.logger.error('Error validating referral code:', error);
        res.status(500).json({
            error: 'Failed to validate referral code',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
router.get('/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const stats = await referral_js_1.ReferralService.getReferralStats(userId);
        const referrals = await referral_js_1.ReferralService.getUserReferrals(userId);
        logger_js_1.logger.info('Referral stats retrieved', { userId });
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
                link: `${environment_js_1.config.saas.baseUrl}/signup?ref=${ref.code}`,
            })),
        });
    }
    catch (error) {
        logger_js_1.logger.error('Error retrieving referral stats:', error);
        res.status(500).json({
            error: 'Failed to retrieve referral stats',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const referrals = await referral_js_1.ReferralService.getUserReferrals(userId);
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
                link: `${environment_js_1.config.saas.baseUrl}/signup?ref=${ref.code}`,
                shareText: `🔮 Join Lore Engine with my referral code ${ref.code} and get ${ref.bonusPercent}% off!`,
            })),
        });
    }
    catch (error) {
        logger_js_1.logger.error('Error listing user referrals:', error);
        res.status(500).json({
            error: 'Failed to list referrals',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
router.delete('/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const success = await referral_js_1.ReferralService.deactivateCode(code);
        if (success) {
            logger_js_1.logger.info('Referral code deactivated via API', { code });
            res.json({
                success: true,
                message: 'Referral code deactivated successfully',
            });
        }
        else {
            res.status(404).json({
                error: 'Referral code not found',
            });
        }
    }
    catch (error) {
        logger_js_1.logger.error('Error deactivating referral code:', error);
        res.status(500).json({
            error: 'Failed to deactivate referral code',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
router.post('/cleanup', async (req, res) => {
    try {
        const cleanedCount = await referral_js_1.ReferralService.cleanupExpiredCodes();
        logger_js_1.logger.info('Referral cleanup completed', { cleanedCount });
        res.json({
            success: true,
            cleanedCount,
            message: `Cleaned up ${cleanedCount} expired referral codes`,
        });
    }
    catch (error) {
        logger_js_1.logger.error('Error during referral cleanup:', error);
        res.status(500).json({
            error: 'Failed to cleanup referral codes',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
exports.default = router;
//# sourceMappingURL=referrals.js.map