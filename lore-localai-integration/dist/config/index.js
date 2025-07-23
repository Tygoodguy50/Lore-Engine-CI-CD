"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureFlags = exports.monitoringConfig = exports.securityConfig = exports.rateLimitingConfig = exports.marketplaceConfig = exports.integrationsConfig = exports.conflictDetectionConfig = exports.localaiConfig = exports.redisConfig = exports.databaseConfig = exports.appConfig = void 0;
exports.initializeConfig = initializeConfig;
const dotenv_1 = require("dotenv");
const winston_1 = require("winston");
(0, dotenv_1.config)();
const logger = (0, winston_1.createLogger)({
    level: 'info',
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json()),
    transports: [
        new winston_1.transports.Console(),
    ],
});
function parseBoolean(value, defaultValue = false) {
    if (!value)
        return defaultValue;
    return value.toLowerCase() === 'true' || value === '1';
}
function parseNumber(value, defaultValue) {
    if (!value)
        return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
}
function parseFloatValue(value, defaultValue) {
    if (!value)
        return defaultValue;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
}
exports.appConfig = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseNumber(process.env.PORT, 3000),
    logLevel: process.env.LOG_LEVEL || 'info',
    debug: parseBoolean(process.env.DEBUG, false),
    database: {
        url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/lore_db',
        poolSize: parseNumber(process.env.DATABASE_POOL_SIZE, 20),
        ssl: parseBoolean(process.env.DATABASE_SSL, false),
    },
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        password: process.env.REDIS_PASSWORD,
        db: parseNumber(process.env.REDIS_DB, 0),
    },
    localai: {
        url: process.env.LOCALAI_URL || 'http://localhost:8080',
        apiKey: process.env.LOCALAI_API_KEY,
        modelsPath: process.env.LOCALAI_MODELS_PATH || './localai-hosting/models',
        defaultModel: process.env.DEFAULT_MODEL || 'haunted-model',
        hauntedModelPath: process.env.HAUNTED_MODEL_PATH || './models/haunted-model.yaml',
        fantasyModelPath: process.env.FANTASY_MODEL_PATH || './models/fantasy-model.yaml',
    },
    conflictDetection: {
        enabled: parseBoolean(process.env.CONFLICT_DETECTION_ENABLED, true),
        threshold: parseFloatValue(process.env.CONFLICT_THRESHOLD, 0.7),
        cursedLevelThreshold: parseNumber(process.env.CURSED_LEVEL_THRESHOLD, 8),
        priorityEscalationThreshold: parseNumber(process.env.PRIORITY_ESCALATION_THRESHOLD, 9),
    },
    sentimentAnalysis: {
        enabled: parseBoolean(process.env.SENTIMENT_ANALYSIS_ENABLED, true),
        thresholdPositive: parseFloatValue(process.env.SENTIMENT_THRESHOLD_POSITIVE, 0.5),
        thresholdNegative: parseFloatValue(process.env.SENTIMENT_THRESHOLD_NEGATIVE, -0.5),
    },
    integrations: {
        discord: {
            enabled: parseBoolean(process.env.DISCORD_ENABLED, false),
            token: process.env.DISCORD_TOKEN,
            webhookUrl: process.env.DISCORD_WEBHOOK_URL,
            channelId: process.env.DISCORD_CHANNEL_ID,
        },
        tiktok: {
            enabled: parseBoolean(process.env.TIKTOK_ENABLED, false),
            webhookUrl: process.env.TIKTOK_WEBHOOK_URL,
            apiKey: process.env.TIKTOK_API_KEY,
        },
        langchain: {
            enabled: parseBoolean(process.env.LANGCHAIN_ENABLED, false),
            url: process.env.LANGCHAIN_URL || 'https://api.langchain.com',
            apiKey: process.env.LANGCHAIN_API_KEY,
        },
    },
    marketplace: {
        enabled: parseBoolean(process.env.MARKETPLACE_ENABLED, true),
        commissionRate: parseFloatValue(process.env.MARKETPLACE_COMMISSION_RATE, 0.15),
        currency: process.env.MARKETPLACE_CURRENCY || 'USD',
        stripe: {
            enabled: parseBoolean(process.env.STRIPE_ENABLED, false),
            secretKey: process.env.STRIPE_SECRET_KEY,
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        },
    },
    rateLimiting: {
        enabled: parseBoolean(process.env.RATE_LIMIT_ENABLED, true),
        windowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 60000),
        maxRequests: parseNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 100),
        skipFailedRequests: parseBoolean(process.env.RATE_LIMIT_SKIP_FAILED_REQUESTS, true),
        tiers: {
            free: parseNumber(process.env.TIER_FREE_LIMIT, 1000),
            standard: parseNumber(process.env.TIER_STANDARD_LIMIT, 10000),
            premium: parseNumber(process.env.TIER_PREMIUM_LIMIT, 100000),
            enterprise: parseNumber(process.env.TIER_ENTERPRISE_LIMIT, 1000000),
        },
    },
    security: {
        jwt: {
            secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
            expiresIn: process.env.JWT_EXPIRES_IN || '24h',
            issuer: process.env.JWT_ISSUER || 'lore-engine',
        },
        apiKey: {
            header: process.env.API_KEY_HEADER || 'X-API-Key',
            required: parseBoolean(process.env.API_KEY_REQUIRED, false),
        },
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            methods: process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,OPTIONS',
            headers: process.env.CORS_HEADERS || 'Content-Type,Authorization,X-API-Key',
        },
    },
    monitoring: {
        healthCheck: {
            enabled: parseBoolean(process.env.HEALTH_CHECK_ENABLED, true),
            interval: parseNumber(process.env.HEALTH_CHECK_INTERVAL, 30000),
            timeout: parseNumber(process.env.HEALTH_CHECK_TIMEOUT, 5000),
        },
        metrics: {
            enabled: parseBoolean(process.env.METRICS_ENABLED, true),
            port: parseNumber(process.env.METRICS_PORT, 3001),
            path: process.env.METRICS_PATH || '/metrics',
        },
        logging: {
            format: process.env.LOG_FORMAT || 'json',
            timestamp: parseBoolean(process.env.LOG_TIMESTAMP, true),
            colors: parseBoolean(process.env.LOG_COLORS, true),
        },
    },
    features: {
        conflictDetection: parseBoolean(process.env.FEATURE_CONFLICT_DETECTION, true),
        sentimentAnalysis: parseBoolean(process.env.FEATURE_SENTIMENT_ANALYSIS, true),
        marketplace: parseBoolean(process.env.FEATURE_MARKETPLACE, true),
        webhooks: parseBoolean(process.env.FEATURE_WEBHOOKS, true),
        rateLimiting: parseBoolean(process.env.FEATURE_RATE_LIMITING, true),
        caching: parseBoolean(process.env.FEATURE_CACHING, true),
        experimental: {
            langchain: parseBoolean(process.env.EXPERIMENTAL_LANGCHAIN, false),
            advancedRouting: parseBoolean(process.env.EXPERIMENTAL_ADVANCED_ROUTING, false),
            aiScaling: parseBoolean(process.env.EXPERIMENTAL_AI_SCALING, false),
        },
    },
};
function validateConfig() {
    const errors = [];
    if (!exports.appConfig.database.url) {
        errors.push('DATABASE_URL is required');
    }
    if (!exports.appConfig.security.jwt.secret || exports.appConfig.security.jwt.secret === 'your-super-secret-jwt-key-change-this-in-production') {
        if (exports.appConfig.nodeEnv === 'production') {
            errors.push('JWT_SECRET must be set to a secure value in production');
        }
    }
    if (exports.appConfig.marketplace.stripe.enabled && !exports.appConfig.marketplace.stripe.secretKey) {
        errors.push('STRIPE_SECRET_KEY is required when Stripe is enabled');
    }
    if (exports.appConfig.integrations.discord.enabled && !exports.appConfig.integrations.discord.token) {
        errors.push('DISCORD_TOKEN is required when Discord integration is enabled');
    }
    if (exports.appConfig.integrations.langchain.enabled && !exports.appConfig.integrations.langchain.apiKey) {
        errors.push('LANGCHAIN_API_KEY is required when LangChain integration is enabled');
    }
    if (errors.length > 0) {
        logger.error('Configuration validation failed:', { errors });
        process.exit(1);
    }
}
function initializeConfig() {
    logger.info('Loading configuration...', {
        nodeEnv: exports.appConfig.nodeEnv,
        port: exports.appConfig.port,
        features: exports.appConfig.features,
    });
    validateConfig();
    logger.info('Configuration loaded successfully', {
        database: { configured: !!exports.appConfig.database.url },
        redis: { configured: !!exports.appConfig.redis.url },
        localai: { configured: !!exports.appConfig.localai.url },
        integrations: {
            discord: exports.appConfig.integrations.discord.enabled,
            tiktok: exports.appConfig.integrations.tiktok.enabled,
            langchain: exports.appConfig.integrations.langchain.enabled,
        },
        marketplace: exports.appConfig.marketplace.enabled,
        features: exports.appConfig.features,
    });
}
exports.databaseConfig = exports.appConfig.database, exports.redisConfig = exports.appConfig.redis, exports.localaiConfig = exports.appConfig.localai, exports.conflictDetectionConfig = exports.appConfig.conflictDetection, exports.integrationsConfig = exports.appConfig.integrations, exports.marketplaceConfig = exports.appConfig.marketplace, exports.rateLimitingConfig = exports.appConfig.rateLimiting, exports.securityConfig = exports.appConfig.security, exports.monitoringConfig = exports.appConfig.monitoring, exports.featureFlags = exports.appConfig.features;
//# sourceMappingURL=index.js.map