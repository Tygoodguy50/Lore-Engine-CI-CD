import Stripe from 'stripe';
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
export declare const SUBSCRIPTION_TIERS: SubscriptionTier[];
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
export declare class StripeService extends EventEmitter {
    private stripe;
    constructor();
    createCheckoutSession(tierID: string, customerEmail: string, successUrl: string, cancelUrl: string): Promise<{
        url: string;
        sessionId: string;
    }>;
    handleSuccessfulPayment(sessionId: string): Promise<Customer>;
    updateSubscription(customerId: string, newTierID: string): Promise<Stripe.Subscription>;
    cancelSubscription(customerId: string): Promise<void>;
    handleWebhook(event: Stripe.Event): Promise<void>;
    validateUsage(customer: Customer, requestType: string): boolean;
    getUsageStats(customerId: string): Promise<any>;
    private generateApiKey;
    private getCustomerByStripeId;
    private handleSubscriptionUpdated;
    private handleSubscriptionDeleted;
    private handlePaymentFailed;
    private handlePaymentSucceeded;
}
export declare const stripeService: StripeService;
//# sourceMappingURL=stripe-service.d.ts.map