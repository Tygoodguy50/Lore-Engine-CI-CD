import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/lore_db',
    poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '20', 10),
    ssl: process.env.DATABASE_SSL === 'true',
  },
  
  // Redis configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  
  // LocalAI configuration
  localai: {
    url: process.env.LOCALAI_URL || 'http://localhost:8080',
    apiKey: process.env.LOCALAI_API_KEY || '',
    modelsPath: process.env.LOCALAI_MODELS_PATH || './models',
    defaultModel: process.env.DEFAULT_MODEL || 'haunted-model',
  },
  
  // Lore Engine configuration
  lore: {
    conflictDetection: process.env.CONFLICT_DETECTION_ENABLED === 'true',
    conflictThreshold: parseFloat(process.env.CONFLICT_THRESHOLD || '0.7'),
    cursedLevelThreshold: parseInt(process.env.CURSED_LEVEL_THRESHOLD || '8', 10),
    priorityEscalationThreshold: parseInt(process.env.PRIORITY_ESCALATION_THRESHOLD || '9', 10),
    sentimentAnalysis: process.env.SENTIMENT_ANALYSIS_ENABLED === 'true',
    sentimentThresholdPositive: parseFloat(process.env.SENTIMENT_THRESHOLD_POSITIVE || '0.5'),
    sentimentThresholdNegative: parseFloat(process.env.SENTIMENT_THRESHOLD_NEGATIVE || '-0.5'),
  },
  
  // Integration configuration
  integrations: {
    discord: {
      enabled: process.env.DISCORD_ENABLED === 'true',
      token: process.env.DISCORD_TOKEN || '',
      webhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
      channelId: process.env.DISCORD_CHANNEL_ID || '',
    },
    tiktok: {
      enabled: process.env.TIKTOK_ENABLED === 'true',
      webhookUrl: process.env.TIKTOK_WEBHOOK_URL || '',
      apiKey: process.env.TIKTOK_API_KEY || '',
    },
    langchain: {
      enabled: process.env.LANGCHAIN_ENABLED === 'true',
      url: process.env.LANGCHAIN_URL || 'https://api.langchain.com',
      apiKey: process.env.LANGCHAIN_API_KEY || '',
    },
  },
  
  // Marketplace configuration
  marketplace: {
    enabled: process.env.MARKETPLACE_ENABLED === 'true',
    commissionRate: parseFloat(process.env.MARKETPLACE_COMMISSION_RATE || '0.15'),
    currency: process.env.MARKETPLACE_CURRENCY || 'USD',
    stripe: {
      enabled: process.env.STRIPE_ENABLED === 'true',
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    },
  },
  
  // Rate limiting configuration
  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED === 'true',
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    skipFailedRequests: process.env.RATE_LIMIT_SKIP_FAILED_REQUESTS === 'true',
    tiers: {
      free: parseInt(process.env.TIER_FREE_LIMIT || '1000', 10),
      standard: parseInt(process.env.TIER_STANDARD_LIMIT || '10000', 10),
      premium: parseInt(process.env.TIER_PREMIUM_LIMIT || '100000', 10),
      enterprise: parseInt(process.env.TIER_ENTERPRISE_LIMIT || '1000000', 10),
    },
  },
  
  // Security configuration
  security: {
    jwt: {
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      issuer: process.env.JWT_ISSUER || 'lore-engine',
    },
    apiKey: {
      header: process.env.API_KEY_HEADER || 'X-API-Key',
      required: process.env.API_KEY_REQUIRED === 'true',
    },
  },
  
  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,OPTIONS',
    headers: process.env.CORS_HEADERS || 'Content-Type,Authorization,X-API-Key',
  },
  
  // Monitoring configuration
  monitoring: {
    healthCheck: {
      enabled: process.env.HEALTH_CHECK_ENABLED === 'true',
      interval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000', 10),
      timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || '5000', 10),
    },
    metrics: {
      enabled: process.env.METRICS_ENABLED === 'true',
      port: parseInt(process.env.METRICS_PORT || '3001', 10),
      path: process.env.METRICS_PATH || '/metrics',
    },
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    timestamp: process.env.LOG_TIMESTAMP === 'true',
    colors: process.env.LOG_COLORS === 'true',
  },
  
  // Feature flags
  features: {
    conflictDetection: process.env.FEATURE_CONFLICT_DETECTION === 'true',
    sentimentAnalysis: process.env.FEATURE_SENTIMENT_ANALYSIS === 'true',
    marketplace: process.env.FEATURE_MARKETPLACE === 'true',
    webhooks: process.env.FEATURE_WEBHOOKS === 'true',
    rateLimiting: process.env.FEATURE_RATE_LIMITING === 'true',
    caching: process.env.FEATURE_CACHING === 'true',
  },
  
  // Development configuration
  development: {
    debug: process.env.DEBUG === 'true',
    debugNamespace: process.env.DEBUG_NAMESPACE || 'lore:*',
    hotReload: process.env.HOT_RELOAD === 'true',
    watchFiles: process.env.WATCH_FILES === 'true',
  },
};
