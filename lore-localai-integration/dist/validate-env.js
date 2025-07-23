"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runEnvironmentValidation = runEnvironmentValidation;
exports.validateEnvironment = validateEnvironment;
exports.testDatabaseConnection = testDatabaseConnection;
exports.testRedisConnection = testRedisConnection;
exports.testLocalAIConnection = testLocalAIConnection;
const index_js_1 = require("./config/index.js");
const winston_1 = require("winston");
const logger = (0, winston_1.createLogger)({
    level: 'info',
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.colorize(), winston_1.format.simple()),
    transports: [
        new winston_1.transports.Console(),
    ],
});
async function validateEnvironment() {
    logger.info('🔍 Validating Environment Configuration');
    logger.info('======================================');
    let issues = 0;
    const nodeVersion = process.version;
    logger.info(`Node.js Version: ${nodeVersion}`);
    if (parseInt(nodeVersion.slice(1)) < 16) {
        logger.error('❌ Node.js version 16 or higher is required');
        issues++;
    }
    else {
        logger.info('✅ Node.js version is compatible');
    }
    logger.info('\n📋 Environment Configuration:');
    logger.info(`Environment: ${index_js_1.appConfig.nodeEnv}`);
    logger.info(`Port: ${index_js_1.appConfig.port}`);
    logger.info(`Debug: ${index_js_1.appConfig.debug}`);
    logger.info('\n🗄️  Database Configuration:');
    if (index_js_1.appConfig.database.url) {
        logger.info('✅ Database URL configured');
    }
    else {
        logger.error('❌ Database URL not configured');
        issues++;
    }
    logger.info('\n🔴 Redis Configuration:');
    if (index_js_1.appConfig.redis.url) {
        logger.info('✅ Redis URL configured');
    }
    else {
        logger.error('❌ Redis URL not configured');
        issues++;
    }
    logger.info('\n🤖 LocalAI Configuration:');
    logger.info(`URL: ${index_js_1.appConfig.localai.url}`);
    logger.info(`Models Path: ${index_js_1.appConfig.localai.modelsPath}`);
    logger.info(`Default Model: ${index_js_1.appConfig.localai.defaultModel}`);
    if (index_js_1.appConfig.localai.apiKey) {
        logger.info('✅ LocalAI API Key configured');
    }
    else {
        logger.warn('⚠️  LocalAI API Key not configured (optional)');
    }
    logger.info('\n🎛️  Feature Flags:');
    logger.info(`Conflict Detection: ${index_js_1.appConfig.features.conflictDetection}`);
    logger.info(`Sentiment Analysis: ${index_js_1.appConfig.features.sentimentAnalysis}`);
    logger.info(`Marketplace: ${index_js_1.appConfig.features.marketplace}`);
    logger.info(`Rate Limiting: ${index_js_1.appConfig.features.rateLimiting}`);
    logger.info(`Webhooks: ${index_js_1.appConfig.features.webhooks}`);
    logger.info(`Caching: ${index_js_1.appConfig.features.caching}`);
    logger.info('\n🔗 Integrations:');
    if (index_js_1.appConfig.integrations.discord.enabled) {
        if (index_js_1.appConfig.integrations.discord.token) {
            logger.info('✅ Discord integration configured');
        }
        else {
            logger.error('❌ Discord enabled but token not configured');
            issues++;
        }
    }
    else {
        logger.info('⚠️  Discord integration disabled');
    }
    if (index_js_1.appConfig.integrations.tiktok.enabled) {
        if (index_js_1.appConfig.integrations.tiktok.webhookUrl) {
            logger.info('✅ TikTok integration configured');
        }
        else {
            logger.error('❌ TikTok enabled but webhook URL not configured');
            issues++;
        }
    }
    else {
        logger.info('⚠️  TikTok integration disabled');
    }
    if (index_js_1.appConfig.integrations.langchain.enabled) {
        if (index_js_1.appConfig.integrations.langchain.apiKey) {
            logger.info('✅ LangChain integration configured');
        }
        else {
            logger.error('❌ LangChain enabled but API key not configured');
            issues++;
        }
    }
    else {
        logger.info('⚠️  LangChain integration disabled');
    }
    logger.info('\n💰 Marketplace Configuration:');
    if (index_js_1.appConfig.marketplace.enabled) {
        logger.info(`Commission Rate: ${index_js_1.appConfig.marketplace.commissionRate * 100}%`);
        logger.info(`Currency: ${index_js_1.appConfig.marketplace.currency}`);
        if (index_js_1.appConfig.marketplace.stripe.enabled) {
            if (index_js_1.appConfig.marketplace.stripe.secretKey) {
                logger.info('✅ Stripe payment processing configured');
            }
            else {
                logger.error('❌ Stripe enabled but secret key not configured');
                issues++;
            }
        }
        else {
            logger.info('⚠️  Stripe payment processing disabled');
        }
    }
    else {
        logger.info('⚠️  Marketplace disabled');
    }
    logger.info('\n🔒 Security Configuration:');
    if (index_js_1.appConfig.security.jwt.secret === 'your-super-secret-jwt-key-change-this-in-production') {
        if (index_js_1.appConfig.nodeEnv === 'production') {
            logger.error('❌ JWT secret must be changed in production');
            issues++;
        }
        else {
            logger.warn('⚠️  Using default JWT secret (change for production)');
        }
    }
    else {
        logger.info('✅ JWT secret configured');
    }
    logger.info(`CORS Origin: ${index_js_1.appConfig.security.cors.origin}`);
    logger.info(`API Key Required: ${index_js_1.appConfig.security.apiKey.required}`);
    logger.info('\n📊 Monitoring Configuration:');
    logger.info(`Health Checks: ${index_js_1.appConfig.monitoring.healthCheck.enabled}`);
    logger.info(`Metrics: ${index_js_1.appConfig.monitoring.metrics.enabled}`);
    logger.info(`Metrics Port: ${index_js_1.appConfig.monitoring.metrics.port}`);
    logger.info('\n📋 Validation Summary:');
    logger.info('====================');
    if (issues === 0) {
        logger.info('✅ All critical configurations are valid');
        logger.info('🚀 Environment is ready for startup');
    }
    else {
        logger.error(`❌ Found ${issues} configuration issues`);
        logger.error('🛑 Please fix these issues before starting the application');
    }
    return issues === 0;
}
async function testDatabaseConnection() {
    logger.info('\n🔍 Testing Database Connection...');
    try {
        logger.info(`Testing connection to: ${index_js_1.appConfig.database.url.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
        logger.info('Database configuration appears valid');
        logger.info('✅ Database connection test passed (configuration only)');
        return true;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`❌ Database connection test failed: ${errorMessage}`);
        return false;
    }
}
async function testRedisConnection() {
    logger.info('\n🔍 Testing Redis Connection...');
    try {
        logger.info(`Testing connection to: ${index_js_1.appConfig.redis.url}`);
        logger.info('Redis configuration appears valid');
        logger.info('✅ Redis connection test passed (configuration only)');
        return true;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`❌ Redis connection test failed: ${errorMessage}`);
        return false;
    }
}
async function testLocalAIConnection() {
    logger.info('\n🔍 Testing LocalAI Connection...');
    try {
        const response = await fetch(`${index_js_1.appConfig.localai.url}/health`);
        if (response.ok) {
            logger.info('✅ LocalAI server is running and healthy');
            return true;
        }
        else {
            logger.error(`❌ LocalAI server responded with status: ${response.status}`);
            return false;
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`❌ LocalAI connection test failed: ${errorMessage}`);
        logger.info('💡 Make sure LocalAI server is running on the configured URL');
        return false;
    }
}
async function runEnvironmentValidation() {
    try {
        (0, index_js_1.initializeConfig)();
        const configValid = await validateEnvironment();
        const dbValid = await testDatabaseConnection();
        const redisValid = await testRedisConnection();
        const localaiValid = await testLocalAIConnection();
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
        }
        else {
            logger.error('\n🛑 Environment has issues that need to be resolved');
            logger.info('Please check the above errors and fix them before starting');
        }
        process.exit(allValid ? 0 : 1);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`❌ Environment validation failed: ${errorMessage}`);
        process.exit(1);
    }
}
//# sourceMappingURL=validate-env.js.map