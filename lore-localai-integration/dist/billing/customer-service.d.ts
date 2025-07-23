import { Customer } from './stripe-service';
import { EventEmitter } from 'events';
export interface CustomerUsage {
    customerId: string;
    month: string;
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
export declare class CustomerService extends EventEmitter {
    private customers;
    private apiKeys;
    private usage;
    constructor();
    private setupStripeEventHandlers;
    createSubscription(tierID: string, customerEmail: string, metadata?: Record<string, any>): Promise<{
        checkoutUrl: string;
        sessionId: string;
    }>;
    completeOnboarding(sessionId: string): Promise<{
        customer: Customer;
        apiKey: string;
        dashboardUrl: string;
    }>;
    getCustomerByApiKey(apiKey: string): Promise<Customer | null>;
    validateApiRequest(apiKey: string, requestType: 'event_processing' | 'conflict_detection' | 'api_call' | 'webhook' | 'realtime'): Promise<{
        allowed: boolean;
        customer?: Customer;
        reason?: string;
        remainingQuota?: number;
    }>;
    createApiKey(customerId: string, options: {
        name: string;
        permissions: string[];
        customLimits?: {
            requestsPerMinute?: number;
            requestsPerHour?: number;
            requestsPerDay?: number;
        };
    }): Promise<ApiKey>;
    getCustomerDashboard(customerId: string): Promise<{
        customer: Customer;
        usage: CustomerUsage;
        billing: any;
        apiKeys: ApiKey[];
    }>;
    changeSubscription(customerId: string, newTierID: string): Promise<void>;
    cancelSubscription(customerId: string): Promise<void>;
    private handleCustomerCreated;
    private handleSubscriptionUpdated;
    private handleSubscriptionCancelled;
    private handlePaymentFailed;
    private sendWelcomeEmail;
    private initializeUsageTracking;
    private incrementUsage;
    private deactivateCustomerApiKeys;
    private startUsageResetTask;
    private resetMonthlyUsage;
    private generateId;
    private generateApiKeyValue;
}
export declare const customerService: CustomerService;
//# sourceMappingURL=customer-service.d.ts.map