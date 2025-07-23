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
export declare class ReferralService {
    private static referralSalt;
    private static referrals;
    private static userReferrals;
    static generateCode(userId: string, userEmail: string, options?: {
        expiryDays?: number;
        maxUsage?: number;
        bonusPercent?: number;
    }): Promise<{
        code: string;
        link: string;
    }>;
    static validateCode(code: string): Promise<ReferralValidation>;
    static processReferralComplete(code: string, referrerId: string, newUserId: string): Promise<void>;
    static processCommission(referrerId: string, paymentAmount: number, commissionRate?: number): Promise<void>;
    static getReferralStats(userId: string): Promise<ReferralStats>;
    static getUserReferrals(userId: string): Promise<ReferralCode[]>;
    static deactivateCode(code: string): Promise<boolean>;
    private static awardReferrerBonus;
    static cleanupExpiredCodes(): Promise<number>;
}
export {};
//# sourceMappingURL=referral.d.ts.map