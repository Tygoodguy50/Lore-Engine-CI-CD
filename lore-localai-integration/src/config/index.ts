import { config } from 'dotenv';
import { createLogger, format, transports } from 'winston';

// Load environment variables
config();

// Create logger for config module
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
  ],
});

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

// Helper function to parse boolean values
function parseBoolean(value: string | undefined, defaultValue: boolean = false): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

// Helper function to parse number values
function parseNumber(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Helper function to parse float values
function parseFloatValue(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Create and export configuration
export const appConfig: AppConfig = {
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

// Validate critical configuration
function validateConfig(): void {
  const errors: string[] = [];

  // Validate required configurations
  if (!appConfig.database.url) {
    errors.push('DATABASE_URL is required');
  }

  if (!appConfig.security.jwt.secret || appConfig.security.jwt.secret === 'your-super-secret-jwt-key-change-this-in-production') {
    if (appConfig.nodeEnv === 'production') {
      errors.push('JWT_SECRET must be set to a secure value in production');
    }
  }

  if (appConfig.marketplace.stripe.enabled && !appConfig.marketplace.stripe.secretKey) {
    errors.push('STRIPE_SECRET_KEY is required when Stripe is enabled');
  }

  if (appConfig.integrations.discord.enabled && !appConfig.integrations.discord.token) {
    errors.push('DISCORD_TOKEN is required when Discord integration is enabled');
  }

  if (appConfig.integrations.langchain.enabled && !appConfig.integrations.langchain.apiKey) {
    errors.push('LANGCHAIN_API_KEY is required when LangChain integration is enabled');
  }

  if (errors.length > 0) {
    logger.error('Configuration validation failed:', { errors });
    process.exit(1);
  }
}

// Initialize configuration
export function initializeConfig(): void {
  logger.info('Loading configuration...', {
    nodeEnv: appConfig.nodeEnv,
    port: appConfig.port,
    features: appConfig.features,
  });

  validateConfig();

  logger.info('Configuration loaded successfully', {
    database: { configured: !!appConfig.database.url },
    redis: { configured: !!appConfig.redis.url },
    localai: { configured: !!appConfig.localai.url },
    integrations: {
      discord: appConfig.integrations.discord.enabled,
      tiktok: appConfig.integrations.tiktok.enabled,
      langchain: appConfig.integrations.langchain.enabled,
    },
    marketplace: appConfig.marketplace.enabled,
    features: appConfig.features,
  });
}

// Export individual configurations for convenience
export const {
  database: databaseConfig,
  redis: redisConfig,
  localai: localaiConfig,
  conflictDetection: conflictDetectionConfig,
  integrations: integrationsConfig,
  marketplace: marketplaceConfig,
  rateLimiting: rateLimitingConfig,
  security: securityConfig,
  monitoring: monitoringConfig,
  features: featureFlags,
} = appConfig;
