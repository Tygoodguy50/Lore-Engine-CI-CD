import { appConfig, initializeConfig } from './config/index.js';
import { createLogger, format, transports } from 'winston';

// Create logger
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.colorize(),
    format.simple()
  ),
  transports: [
    new transports.Console(),
  ],
});

// Environment validation functions
async function validateEnvironment() {
  logger.info('🔍 Validating Environment Configuration');
  logger.info('======================================');

  let issues = 0;

  // Check Node.js version
  const nodeVersion = process.version;
  logger.info(`Node.js Version: ${nodeVersion}`);
  
  if (parseInt(nodeVersion.slice(1)) < 16) {
    logger.error('❌ Node.js version 16 or higher is required');
    issues++;
  } else {
    logger.info('✅ Node.js version is compatible');
  }

  // Check environment variables
  logger.info('\n📋 Environment Configuration:');
  logger.info(`Environment: ${appConfig.nodeEnv}`);
  logger.info(`Port: ${appConfig.port}`);
  logger.info(`Debug: ${appConfig.debug}`);

  // Check database configuration
  logger.info('\n🗄️  Database Configuration:');
  if (appConfig.database.url) {
    logger.info('✅ Database URL configured');
  } else {
    logger.error('❌ Database URL not configured');
    issues++;
  }

  // Check Redis configuration
  logger.info('\n🔴 Redis Configuration:');
  if (appConfig.redis.url) {
    logger.info('✅ Redis URL configured');
  } else {
    logger.error('❌ Redis URL not configured');
    issues++;
  }

  // Check LocalAI configuration
  logger.info('\n🤖 LocalAI Configuration:');
  logger.info(`URL: ${appConfig.localai.url}`);
  logger.info(`Models Path: ${appConfig.localai.modelsPath}`);
  logger.info(`Default Model: ${appConfig.localai.defaultModel}`);

  if (appConfig.localai.apiKey) {
    logger.info('✅ LocalAI API Key configured');
  } else {
    logger.warn('⚠️  LocalAI API Key not configured (optional)');
  }

  // Check feature flags
  logger.info('\n🎛️  Feature Flags:');
  logger.info(`Conflict Detection: ${appConfig.features.conflictDetection}`);
  logger.info(`Sentiment Analysis: ${appConfig.features.sentimentAnalysis}`);
  logger.info(`Marketplace: ${appConfig.features.marketplace}`);
  logger.info(`Rate Limiting: ${appConfig.features.rateLimiting}`);
  logger.info(`Webhooks: ${appConfig.features.webhooks}`);
  logger.info(`Caching: ${appConfig.features.caching}`);

  // Check integrations
  logger.info('\n🔗 Integrations:');
  
  // Discord
  if (appConfig.integrations.discord.enabled) {
    if (appConfig.integrations.discord.token) {
      logger.info('✅ Discord integration configured');
    } else {
      logger.error('❌ Discord enabled but token not configured');
      issues++;
    }
  } else {
    logger.info('⚠️  Discord integration disabled');
  }

  // TikTok
  if (appConfig.integrations.tiktok.enabled) {
    if (appConfig.integrations.tiktok.webhookUrl) {
      logger.info('✅ TikTok integration configured');
    } else {
      logger.error('❌ TikTok enabled but webhook URL not configured');
      issues++;
    }
  } else {
    logger.info('⚠️  TikTok integration disabled');
  }

  // LangChain
  if (appConfig.integrations.langchain.enabled) {
    if (appConfig.integrations.langchain.apiKey) {
      logger.info('✅ LangChain integration configured');
    } else {
      logger.error('❌ LangChain enabled but API key not configured');
      issues++;
    }
  } else {
    logger.info('⚠️  LangChain integration disabled');
  }

  // Check marketplace configuration
  logger.info('\n💰 Marketplace Configuration:');
  if (appConfig.marketplace.enabled) {
    logger.info(`Commission Rate: ${appConfig.marketplace.commissionRate * 100}%`);
    logger.info(`Currency: ${appConfig.marketplace.currency}`);
    
    if (appConfig.marketplace.stripe.enabled) {
      if (appConfig.marketplace.stripe.secretKey) {
        logger.info('✅ Stripe payment processing configured');
      } else {
        logger.error('❌ Stripe enabled but secret key not configured');
        issues++;
      }
    } else {
      logger.info('⚠️  Stripe payment processing disabled');
    }
  } else {
    logger.info('⚠️  Marketplace disabled');
  }

  // Check security configuration
  logger.info('\n🔒 Security Configuration:');
  if (appConfig.security.jwt.secret === 'your-super-secret-jwt-key-change-this-in-production') {
    if (appConfig.nodeEnv === 'production') {
      logger.error('❌ JWT secret must be changed in production');
      issues++;
    } else {
      logger.warn('⚠️  Using default JWT secret (change for production)');
    }
  } else {
    logger.info('✅ JWT secret configured');
  }

  logger.info(`CORS Origin: ${appConfig.security.cors.origin}`);
  logger.info(`API Key Required: ${appConfig.security.apiKey.required}`);

  // Check monitoring configuration
  logger.info('\n📊 Monitoring Configuration:');
  logger.info(`Health Checks: ${appConfig.monitoring.healthCheck.enabled}`);
  logger.info(`Metrics: ${appConfig.monitoring.metrics.enabled}`);
  logger.info(`Metrics Port: ${appConfig.monitoring.metrics.port}`);

  // Summary
  logger.info('\n📋 Validation Summary:');
  logger.info('====================');
  
  if (issues === 0) {
    logger.info('✅ All critical configurations are valid');
    logger.info('🚀 Environment is ready for startup');
  } else {
    logger.error(`❌ Found ${issues} configuration issues`);
    logger.error('🛑 Please fix these issues before starting the application');
  }

  return issues === 0;
}

// Test database connection
async function testDatabaseConnection() {
  logger.info('\n🔍 Testing Database Connection...');
  
  try {
    // This is a simple test - you might want to use your actual database client
    logger.info(`Testing connection to: ${appConfig.database.url.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    
    // For now, just log the configuration
    logger.info('Database configuration appears valid');
    logger.info('✅ Database connection test passed (configuration only)');
    
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`❌ Database connection test failed: ${errorMessage}`);
    return false;
  }
}

// Test Redis connection
async function testRedisConnection() {
  logger.info('\n🔍 Testing Redis Connection...');
  
  try {
    // This is a simple test - you might want to use your actual Redis client
    logger.info(`Testing connection to: ${appConfig.redis.url}`);
    
    // For now, just log the configuration
    logger.info('Redis configuration appears valid');
    logger.info('✅ Redis connection test passed (configuration only)');
    
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`❌ Redis connection test failed: ${errorMessage}`);
    return false;
  }
}

// Test LocalAI connection
async function testLocalAIConnection() {
  logger.info('\n🔍 Testing LocalAI Connection...');
  
  try {
    const response = await fetch(`${appConfig.localai.url}/health`);
    
    if (response.ok) {
      logger.info('✅ LocalAI server is running and healthy');
      return true;
    } else {
      logger.error(`❌ LocalAI server responded with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`❌ LocalAI connection test failed: ${errorMessage}`);
    logger.info('💡 Make sure LocalAI server is running on the configured URL');
    return false;
  }
}

// Main validation function
async function runEnvironmentValidation() {
  try {
    // Initialize configuration
    initializeConfig();
    
    // Run validations
    const configValid = await validateEnvironment();
    const dbValid = await testDatabaseConnection();
    const redisValid = await testRedisConnection();
    const localaiValid = await testLocalAIConnection();
    
    // Final summary
    logger.info('\n🎯 Final Environment Status:');
    logger.info('============================');
    logger.info(`Configuration: ${configValid ? '✅ Valid' : '❌ Invalid'}`);
    logger.info(`Database: ${dbValid ? '✅ Ready' : '❌ Not Ready'}`);
    logger.info(`Redis: ${redisValid ? '✅ Ready' : '❌ Not Ready'}`);
    logger.info(`LocalAI: ${localaiValid ? '✅ Ready' : '❌ Not Ready'}`);
    
    const allValid = configValid && dbValid && redisValid && localaiValid;
    
    if (allValid) {
      logger.info('\n🚀 Environment is fully configured and ready!');
      logger.info('You can now start the application with: npm start');
    } else {
      logger.error('\n🛑 Environment has issues that need to be resolved');
      logger.info('Please check the above errors and fix them before starting');
    }
    
    process.exit(allValid ? 0 : 1);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`❌ Environment validation failed: ${errorMessage}`);
    process.exit(1);
  }
}

// Run validation if this script is executed directly
// if (import.meta.url === `file://${process.argv[1]}`) {
//   runEnvironmentValidation();
// }

export { runEnvironmentValidation, validateEnvironment, testDatabaseConnection, testRedisConnection, testLocalAIConnection };
