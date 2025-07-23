"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'staging', 'production']).default('development'),
    PORT: zod_1.z.string().default('3000'),
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    DATABASE_URL: zod_1.z.string().optional(),
    REDIS_URL: zod_1.z.string().optional(),
    STRIPE_PUBLISHABLE_KEY: zod_1.z.string().optional(),
    STRIPE_SECRET_KEY: zod_1.z.string().optional(),
    STRIPE_WEBHOOK_SECRET: zod_1.z.string().optional(),
    STRIPE_BASIC_PRICE_ID: zod_1.z.string().optional(),
    STRIPE_PRO_PRICE_ID: zod_1.z.string().optional(),
    STRIPE_ENTERPRISE_PRICE_ID: zod_1.z.string().optional(),
    LORE_DISPATCHER_URL: zod_1.z.string().default('http://localhost:8084'),
    CONFLICT_API_URL: zod_1.z.string().default('http://localhost:8083'),
    REALTIME_WS_URL: zod_1.z.string().default('ws://localhost:8082'),
    DISCORD_WEBHOOK_URL: zod_1.z.string().optional(),
    TIKTOK_WEBHOOK_URL: zod_1.z.string().optional(),
    LANGCHAIN_URL: zod_1.z.string().optional(),
    LANGCHAIN_API_KEY: zod_1.z.string().optional(),
    N8N_WEBHOOK_URL: zod_1.z.string().optional(),
    JWT_SECRET: zod_1.z.string().default('your-super-secret-jwt-key-change-in-production'),
    API_RATE_LIMIT_WINDOW_MS: zod_1.z.string().default('900000'),
    API_RATE_LIMIT_MAX_REQUESTS: zod_1.z.string().default('100'),
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.string().optional(),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    FROM_EMAIL: zod_1.z.string().default('noreply@lore-engine.com'),
    SENTRY_DSN: zod_1.z.string().optional(),
    PROMETHEUS_ENABLED: zod_1.z.string().default('true'),
});
const env = envSchema.parse(process.env);
exports.config = {
    app: {
        env: env.NODE_ENV,
        port: parseInt(env.PORT),
        logLevel: env.LOG_LEVEL,
    },
    database: {
        url: env.DATABASE_URL || `postgresql://localhost:5432/lore_engine_${env.NODE_ENV}`,
    },
    redis: {
        url: env.REDIS_URL || 'redis://localhost:6379',
    },
    stripe: {
        publishableKey: env.STRIPE_PUBLISHABLE_KEY || 'pk_test_...',
        secretKey: env.STRIPE_SECRET_KEY || 'sk_test_...',
        webhookSecret: env.STRIPE_WEBHOOK_SECRET || 'whsec_...',
        priceIds: {
            basic: env.STRIPE_BASIC_PRICE_ID || 'price_basic_test',
            pro: env.STRIPE_PRO_PRICE_ID || 'price_pro_test',
            enterprise: env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_test',
        },
    },
    loreEngine: {
        dispatcherUrl: env.LORE_DISPATCHER_URL,
        conflictApiUrl: env.CONFLICT_API_URL,
        realtimeWsUrl: env.REALTIME_WS_URL,
    },
    integrations: {
        discord: {
            webhookUrl: env.DISCORD_WEBHOOK_URL,
        },
        tiktok: {
            webhookUrl: env.TIKTOK_WEBHOOK_URL,
        },
        langchain: {
            url: env.LANGCHAIN_URL,
            apiKey: env.LANGCHAIN_API_KEY,
        },
        n8n: {
            webhookUrl: env.N8N_WEBHOOK_URL,
        },
    },
    security: {
        jwtSecret: env.JWT_SECRET,
        rateLimiting: {
            windowMs: parseInt(env.API_RATE_LIMIT_WINDOW_MS),
            maxRequests: parseInt(env.API_RATE_LIMIT_MAX_REQUESTS),
        },
    },
    email: {
        smtp: {
            host: env.SMTP_HOST || 'localhost',
            port: parseInt(env.SMTP_PORT || '587'),
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
        },
        from: env.FROM_EMAIL,
    },
    monitoring: {
        sentryDsn: env.SENTRY_DSN,
        prometheusEnabled: env.PROMETHEUS_ENABLED === 'true',
    },
    saas: {
        trialPeriodDays: 14,
        gracePeriodDays: 3,
        baseUrl: env.NODE_ENV === 'production'
            ? 'https://api.lore-engine.com'
            : `http://localhost:${env.PORT}`,
        dashboardUrl: env.NODE_ENV === 'production'
            ? 'https://dashboard.lore-engine.com'
            : `http://localhost:${parseInt(env.PORT) + 1}`,
        supportEmail: 'support@lore-engine.com',
    },
};
//# sourceMappingURL=environment.js.map