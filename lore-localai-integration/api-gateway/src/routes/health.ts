import { Router } from 'express';
import { config } from '../config';
import { logger } from '../utils/logger';

const router = Router();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: await checkDatabase(),
        redis: await checkRedis(),
        localai: await checkLocalAI(),
      },
    };

    // If any service is down, return 503
    const allServicesHealthy = Object.values(healthStatus.services).every(
      service => service.status === 'healthy'
    );

    if (!allServicesHealthy) {
      return res.status(503).json({
        success: false,
        data: healthStatus,
      });
    }

    res.json({
      success: true,
      data: healthStatus,
    });
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Health check failed',
        code: 'HEALTH_CHECK_ERROR',
      },
    });
  }
});

// Ready check endpoint
router.get('/ready', async (req, res) => {
  try {
    // Check if all critical services are ready
    const services = {
      database: await checkDatabase(),
      redis: await checkRedis(),
      localai: await checkLocalAI(),
    };

    const allServicesReady = Object.values(services).every(
      service => service.status === 'healthy'
    );

    if (!allServicesReady) {
      return res.status(503).json({
        success: false,
        message: 'Service not ready',
        services,
      });
    }

    res.json({
      success: true,
      message: 'Service is ready',
      services,
    });
  } catch (error) {
    logger.error('Ready check error:', error);
    res.status(503).json({
      success: false,
      error: {
        message: 'Ready check failed',
        code: 'READY_CHECK_ERROR',
      },
    });
  }
});

// Live check endpoint
router.get('/live', (req, res) => {
  res.json({
    success: true,
    message: 'Service is live',
    timestamp: new Date().toISOString(),
  });
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    const detailedHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
      version: process.env.npm_package_version || '1.0.0',
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      services: {
        database: await checkDatabase(),
        redis: await checkRedis(),
        localai: await checkLocalAI(),
      },
      features: {
        conflictDetection: config.features.conflictDetection,
        sentimentAnalysis: config.features.sentimentAnalysis,
        marketplace: config.features.marketplace,
        webhooks: config.features.webhooks,
        rateLimiting: config.features.rateLimiting,
        caching: config.features.caching,
      },
      integrations: {
        discord: config.integrations.discord.enabled,
        tiktok: config.integrations.tiktok.enabled,
        langchain: config.integrations.langchain.enabled,
        stripe: config.marketplace.stripe.enabled,
      },
    };

    res.json({
      success: true,
      data: detailedHealth,
    });
  } catch (error) {
    logger.error('Detailed health check error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Detailed health check failed',
        code: 'DETAILED_HEALTH_CHECK_ERROR',
      },
    });
  }
});

// Database health check
async function checkDatabase() {
  try {
    // TODO: Implement actual database connection check
    return {
      status: 'healthy',
      responseTime: Math.random() * 100,
      lastCheck: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Database check failed',
      lastCheck: new Date().toISOString(),
    };
  }
}

// Redis health check
async function checkRedis() {
  try {
    // TODO: Implement actual Redis connection check
    return {
      status: 'healthy',
      responseTime: Math.random() * 50,
      lastCheck: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Redis check failed',
      lastCheck: new Date().toISOString(),
    };
  }
}

// LocalAI health check
async function checkLocalAI() {
  try {
    // TODO: Implement actual LocalAI connection check
    return {
      status: 'healthy',
      responseTime: Math.random() * 200,
      lastCheck: new Date().toISOString(),
      models: ['haunted-model', 'fantasy-model'],
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'LocalAI check failed',
      lastCheck: new Date().toISOString(),
    };
  }
}

export default router;
