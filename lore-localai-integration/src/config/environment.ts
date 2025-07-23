/**
 * 🔮 Lore Engine SaaS - Environment Configuration
 * Centralized configuration management for all services
 * Generated: July 18, 2025
 */

import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment schema validation
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.string().default('3000'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Database
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),

  // Stripe Configuration
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_BASIC_PRICE_ID: z.string().optional(),
  STRIPE_PRO_PRICE_ID: z.string().optional(),
  STRIPE_ENTERPRISE_PRICE_ID: z.string().optional(),

  // Lore Engine Services
  LORE_DISPATCHER_URL: z.string().default('http://localhost:8084'),
  CONFLICT_API_URL: z.string().default('http://localhost:8083'),
  REALTIME_WS_URL: z.string().default('ws://localhost:8082'),

  // External Integrations
  DISCORD_WEBHOOK_URL: z.string().optional(),
  TIKTOK_WEBHOOK_URL: z.string().optional(),
  TIKTOK_API_KEY: z.string().optional(),
  TIKTOK_CLIENT_KEY: z.string().optional(),
  TIKTOK_CLIENT_SECRET: z.string().optional(),
  TIKTOK_WEBHOOK_SECRET: z.string().optional(),
  LANGCHAIN_URL: z.string().optional(),
  LANGCHAIN_API_KEY: z.string().optional(),
  N8N_WEBHOOK_URL: z.string().optional(),

  // Security
  JWT_SECRET: z.string().default('your-super-secret-jwt-key-change-in-production'),
  API_RATE_LIMIT_WINDOW_MS: z.string().default('900000'), // 15 minutes
  API_RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),

  // Email Service (for notifications)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().default('noreply@lore-engine.com'),

  // Monitoring
  SENTRY_DSN: z.string().optional(),
  PROMETHEUS_ENABLED: z.string().default('true'),
});

// Validate environment variables
const env = envSchema.parse(process.env);

export const config = {
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
      apiKey: env.TIKTOK_API_KEY,
      clientKey: env.TIKTOK_CLIENT_KEY,
      clientSecret: env.TIKTOK_CLIENT_SECRET,
      webhookSecret: env.TIKTOK_WEBHOOK_SECRET,
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

  // SaaS-specific configuration
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
} as const;

export type Config = typeof config;
