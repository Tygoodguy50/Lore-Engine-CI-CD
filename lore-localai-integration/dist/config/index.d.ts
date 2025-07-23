interface DatabaseConfig {
    url: string;
    poolSize: number;
    ssl: boolean;
}
interface RedisConfig {
    url: string;
    password?: string | undefined;
    db: number;
}
interface LocalAIConfig {
    url: string;
    apiKey?: string | undefined;
    modelsPath: string;
    defaultModel: string;
    hauntedModelPath: string;
    fantasyModelPath: string;
}
interface ConflictDetectionConfig {
    enabled: boolean;
    threshold: number;
    cursedLevelThreshold: number;
    priorityEscalationThreshold: number;
}
interface IntegrationConfig {
    discord: {
        enabled: boolean;
        token?: string | undefined;
        webhookUrl?: string | undefined;
        channelId?: string | undefined;
    };
    tiktok: {
        enabled: boolean;
        webhookUrl?: string | undefined;
        apiKey?: string | undefined;
    };
    langchain: {
        enabled: boolean;
        url?: string | undefined;
        apiKey?: string | undefined;
    };
}
interface MarketplaceConfig {
    enabled: boolean;
    commissionRate: number;
    currency: string;
    stripe: {
        enabled: boolean;
        secretKey?: string | undefined;
        publishableKey?: string | undefined;
        webhookSecret?: string | undefined;
    };
}
interface RateLimitConfig {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
    skipFailedRequests: boolean;
    tiers: {
        free: number;
        standard: number;
        premium: number;
        enterprise: number;
    };
}
interface SecurityConfig {
    jwt: {
        secret: string;
        expiresIn: string;
        issuer: string;
    };
    apiKey: {
        header: string;
        required: boolean;
    };
    cors: {
        origin: string;
        methods: string;
        headers: string;
    };
}
interface MonitoringConfig {
    healthCheck: {
        enabled: boolean;
        interval: number;
        timeout: number;
    };
    metrics: {
        enabled: boolean;
        port: number;
        path: string;
    };
    logging: {
        format: string;
        timestamp: boolean;
        colors: boolean;
    };
}
interface FeatureFlags {
    conflictDetection: boolean;
    sentimentAnalysis: boolean;
    marketplace: boolean;
    webhooks: boolean;
    rateLimiting: boolean;
    caching: boolean;
    experimental: {
        langchain: boolean;
        advancedRouting: boolean;
        aiScaling: boolean;
    };
}
interface AppConfig {
    nodeEnv: string;
    port: number;
    logLevel: string;
    debug: boolean;
    database: DatabaseConfig;
    redis: RedisConfig;
    localai: LocalAIConfig;
    conflictDetection: ConflictDetectionConfig;
    sentimentAnalysis: {
        enabled: boolean;
        thresholdPositive: number;
        thresholdNegative: number;
    };
    integrations: IntegrationConfig;
    marketplace: MarketplaceConfig;
    rateLimiting: RateLimitConfig;
    security: SecurityConfig;
    monitoring: MonitoringConfig;
    features: FeatureFlags;
}
export declare const appConfig: AppConfig;
export declare function initializeConfig(): void;
export declare const databaseConfig: DatabaseConfig, redisConfig: RedisConfig, localaiConfig: LocalAIConfig, conflictDetectionConfig: ConflictDetectionConfig, integrationsConfig: IntegrationConfig, marketplaceConfig: MarketplaceConfig, rateLimitingConfig: RateLimitConfig, securityConfig: SecurityConfig, monitoringConfig: MonitoringConfig, featureFlags: FeatureFlags;
export {};
//# sourceMappingURL=index.d.ts.map