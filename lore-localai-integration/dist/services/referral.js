"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const environment_js_1 = require("../config/environment.js");
const logger_js_1 = require("../utils/logger.js");
class ReferralService {
    static async generateCode(userId, userEmail, options = {}) {
        const { expiryDays = 30, maxUsage = 10, bonusPercent = 20, } = options;
        const timestamp = Date.now().toString();
        const hash = crypto_1.default
            .createHmac('sha256', this.referralSalt)
            .update(`${userId}:${userEmail}:${timestamp}`)
            .digest('hex');
        const code = `LORE_${hash.slice(0, 8).toUpperCase()}`;
        const referralCode = {
            id: crypto_1.default.randomUUID(),
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
        this.referrals.set(code, referralCode);
        const userCodes = this.userReferrals.get(userId) || [];
        userCodes.push(code);
        this.userReferrals.set(userId, userCodes);
        const referralLink = `${environment_js_1.config.saas.baseUrl}/signup?ref=${code}`;
        logger_js_1.logger.info('Referral code generated', {
            userId,
            code,
            expiryDays,
            maxUsage,
            bonusPercent,
        });
        return { code, link: referralLink };
    }
    static async validateCode(code) {
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
    static async processReferralComplete(code, referrerId, newUserId) {
        const referral = this.referrals.get(code);
        if (!referral) {
            logger_js_1.logger.error('Referral code not found during completion', { code });
            return;
        }
        referral.usageCount += 1;
        this.referrals.set(code, referral);
        logger_js_1.logger.info('Referral completion processed', {
            code,
            referrerId,
            newUserId,
            usageCount: referral.usageCount,
            bonusPercent: referral.bonusPercent,
        });
        await this.awardReferrerBonus(referrerId, referral.bonusPercent);
    }
    static async processCommission(referrerId, paymentAmount, commissionRate = 0.1) {
        const commission = paymentAmount * commissionRate;
        logger_js_1.logger.info('Processing referral commission', {
            referrerId,
            paymentAmount,
            commission,
            commissionRate,
        });
        console.log(`💰 Commission of $${commission.toFixed(2)} awarded to ${referrerId}`);
    }
    static async getReferralStats(userId) {
        const userCodes = this.userReferrals.get(userId) || [];
        const referrals = userCodes.map(code => this.referrals.get(code)).filter(Boolean);
        const stats = {
            totalReferrals: referrals.length,
            successfulReferrals: referrals.reduce((sum, ref) => sum + ref.usageCount, 0),
            totalCommissions: 0,
            activeReferrals: referrals.filter(ref => ref.isActive &&
                new Date() < ref.expiresAt &&
                ref.usageCount < ref.maxUsage).length,
        };
        return stats;
    }
    static async getUserReferrals(userId) {
        const userCodes = this.userReferrals.get(userId) || [];
        return userCodes
            .map(code => this.referrals.get(code))
            .filter(Boolean);
    }
    static async deactivateCode(code) {
        const referral = this.referrals.get(code);
        if (!referral) {
            return false;
        }
        referral.isActive = false;
        this.referrals.set(code, referral);
        logger_js_1.logger.info('Referral code deactivated', { code });
        return true;
    }
    static async awardReferrerBonus(referrerId, bonusPercent) {
        logger_js_1.logger.info('Referrer bonus awarded', {
            referrerId,
            bonusPercent,
            bonusType: 'account_credit',
        });
        console.log(`🎉 Referrer ${referrerId} earned ${bonusPercent}% bonus!`);
    }
    static async cleanupExpiredCodes() {
        let cleanedCount = 0;
        const now = new Date();
        for (const [code, referral] of this.referrals.entries()) {
            if (now > referral.expiresAt) {
                this.referrals.delete(code);
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            logger_js_1.logger.info('Cleaned up expired referral codes', { cleanedCount });
        }
        return cleanedCount;
    }
}
exports.ReferralService = ReferralService;
ReferralService.referralSalt = process.env.REFERRAL_SALT || 'ghostReferralHashMagic';
ReferralService.referrals = new Map();
ReferralService.userReferrals = new Map();
//# sourceMappingURL=referral.js.map