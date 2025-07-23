export declare const config: {
    readonly app: {
        readonly env: "production" | "development" | "staging";
        readonly port: number;
        readonly logLevel: "info" | "error" | "warn" | "debug";
    };
    readonly database: {
        readonly url: string;
    };
    readonly redis: {
        readonly url: string;
    };
    readonly stripe: {
        readonly publishableKey: string;
        readonly secretKey: string;
        readonly webhookSecret: string;
        readonly priceIds: {
            readonly basic: string;
            readonly pro: string;
            readonly enterprise: string;
        };
    };
    readonly loreEngine: {
        readonly dispatcherUrl: string;
        readonly conflictApiUrl: string;
        readonly realtimeWsUrl: string;
    };
    readonly integrations: {
        readonly discord: {
            readonly webhookUrl: string | undefined;
        };
        readonly tiktok: {
            readonly webhookUrl: string | undefined;
        };
        readonly langchain: {
            readonly url: string | undefined;
            readonly apiKey: string | undefined;
        };
        readonly n8n: {
            readonly webhookUrl: string | undefined;
        };
    };
    readonly security: {
        readonly jwtSecret: string;
        readonly rateLimiting: {
            readonly windowMs: number;
            readonly maxRequests: number;
        };
    };
    readonly email: {
        readonly smtp: {
            readonly host: string;
            readonly port: number;
            readonly user: string | undefined;
            readonly pass: string | undefined;
        };
        readonly from: string;
    };
    readonly monitoring: {
        readonly sentryDsn: string | undefined;
        readonly prometheusEnabled: boolean;
    };
    readonly saas: {
        readonly trialPeriodDays: 14;
        readonly gracePeriodDays: 3;
        readonly baseUrl: string;
        readonly dashboardUrl: string;
        readonly supportEmail: "support@lore-engine.com";
    };
};
export type Config = typeof config;
//# sourceMappingURL=environment.d.ts.map