import Stripe from 'stripe';
import { User } from './user.js';
export interface UserCredentials {
    apiKey: string;
    endpoints: {
        loreStats: string;
        conflictDetection: string;
        realtimeWebSocket: string;
        dashboard: string;
    };
    limits: {
        eventsPerMonth: number;
        apiCallsPerMinute: number;
        realtimeConnections: number;
    };
    features: string[];
}
export interface ProvisioningResult {
    success: boolean;
    credentials?: UserCredentials;
    error?: string;
}
export declare class ProvisioningService {
    private static userSessions;
    static provisionUser(user: User, subscription: Stripe.Subscription): Promise<UserCredentials>;
    static enableRealtimeAccess(stripeCustomerId: string): Promise<void>;
    static scheduleAccessRevocation(stripeCustomerId: string, gracePeriodDays: number): Promise<void>;
    static revokeAccess(userId: string): Promise<void>;
    private static configureRateLimiting;
    private static setupUserMonitoring;
    private static findUserByStripeId;
    static getUserUsageStats(userId: string): Promise<{
        eventsThisMonth: number;
        apiCallsThisMinute: number;
        activeConnections: number;
        limits: {
            eventsPerMonth: number;
            apiCallsPerMinute: number;
            realtimeConnections: number;
        };
        usagePercentage: {
            events: number;
            apiCalls: number;
            connections: number;
        };
    }>;
    static refreshCredentials(userId: string): Promise<UserCredentials | null>;
    private static generateNewApiKey;
    static validateApiAccess(apiKey: string, endpoint: string): Promise<{
        valid: boolean;
        user?: User;
        remaining?: number;
        resetTime?: Date;
    }>;
}
//# sourceMappingURL=provisioning.d.ts.map