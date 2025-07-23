import Stripe from 'stripe';
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
export declare class UserService {
    private static users;
    private static emailToUserId;
    private static readonly tierLimits;
    static createFromStripeSession(session: Stripe.Checkout.Session, customer: Stripe.Customer): Promise<User>;
    static updateSubscriptionTier(stripeCustomerId: string, stripePriceId: string): Promise<void>;
    static downgradeToFreeTier(stripeCustomerId: string): Promise<void>;
    static extendAccess(stripeCustomerId: string): Promise<void>;
    static startDunningProcess(stripeCustomerId: string): Promise<void>;
    private static generateApiKey;
    private static mapPriceIdToTier;
    private static findUserByStripeId;
    static getUserById(userId: string): Promise<User | undefined>;
    static getUserByEmail(email: string): Promise<User | undefined>;
    static getUserByApiKey(apiKey: string): Promise<User | undefined>;
    static getSubscriptionLimits(tier: User['subscriptionTier']): SubscriptionTierLimits;
    static hasFeatureAccess(user: User, feature: string): boolean;
    static getAllUsers(): Promise<User[]>;
    static updateUser(userId: string, updates: Partial<User>): Promise<User | undefined>;
    static deleteUser(userId: string): Promise<boolean>;
}
//# sourceMappingURL=user.d.ts.map