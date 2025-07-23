import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { logger } from '../utils/logger';

interface RateLimitInfo {
  count: number;
  resetTime: number;
  tier: string;
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitInfo>();

export const rateLimitMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!config.rateLimit.enabled) {
    return next();
  }

  try {
    const user = (req as any).user;
    const ip = req.ip || req.connection.remoteAddress;
    const key = user ? `user:${user.id}` : `ip:${ip}`;
    
    // Get user tier or default to free
    const tier = user?.tier || 'free';
    const now = Date.now();
    const windowMs = config.rateLimit.windowMs;
    
    // Get rate limit for user tier
    const maxRequests = config.rateLimit.tiers[tier as keyof typeof config.rateLimit.tiers] || config.rateLimit.tiers.free;
    
    // Get current rate limit info
    let rateLimitInfo = rateLimitStore.get(key);
    
    if (!rateLimitInfo || now > rateLimitInfo.resetTime) {
      // Create new rate limit window
      rateLimitInfo = {
        count: 0,
        resetTime: now + windowMs,
        tier,
      };
    }
    
    // Increment request count
    rateLimitInfo.count++;
    rateLimitStore.set(key, rateLimitInfo);
    
    // Set response headers
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, maxRequests - rateLimitInfo.count).toString(),
      'X-RateLimit-Reset': Math.ceil(rateLimitInfo.resetTime / 1000).toString(),
      'X-RateLimit-Tier': tier,
    });
    
    // Check if rate limit exceeded
    if (rateLimitInfo.count > maxRequests) {
      logger.warn('Rate limit exceeded:', {
        key,
        tier,
        count: rateLimitInfo.count,
        maxRequests,
        ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });
      
      return res.status(429).json({
        success: false,
        error: {
          message: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          details: {
            tier,
            limit: maxRequests,
            resetTime: rateLimitInfo.resetTime,
            retryAfter: Math.ceil((rateLimitInfo.resetTime - now) / 1000),
          },
        },
      });
    }
    
    logger.debug('Rate limit check passed:', {
      key,
      tier,
      count: rateLimitInfo.count,
      maxRequests,
      remaining: maxRequests - rateLimitInfo.count,
    });
    
    next();
  } catch (error) {
    logger.error('Rate limit middleware error:', error);
    // Don't block requests if rate limiting fails
    next();
  }
};

// Cleanup old rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [key, info] of rateLimitStore.entries()) {
    if (now > info.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

export const createRateLimitMiddleware = (options: {
  windowMs?: number;
  maxRequests?: number;
  tier?: string;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const ip = req.ip || req.connection.remoteAddress;
    const key = user ? `user:${user.id}` : `ip:${ip}`;
    
    const tier = options.tier || user?.tier || 'free';
    const now = Date.now();
    const windowMs = options.windowMs || config.rateLimit.windowMs;
    const maxRequests = options.maxRequests || config.rateLimit.tiers[tier as keyof typeof config.rateLimit.tiers] || config.rateLimit.tiers.free;
    
    let rateLimitInfo = rateLimitStore.get(key);
    
    if (!rateLimitInfo || now > rateLimitInfo.resetTime) {
      rateLimitInfo = {
        count: 0,
        resetTime: now + windowMs,
        tier,
      };
    }
    
    rateLimitInfo.count++;
    rateLimitStore.set(key, rateLimitInfo);
    
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, maxRequests - rateLimitInfo.count).toString(),
      'X-RateLimit-Reset': Math.ceil(rateLimitInfo.resetTime / 1000).toString(),
      'X-RateLimit-Tier': tier,
    });
    
    if (rateLimitInfo.count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: {
          message: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          details: {
            tier,
            limit: maxRequests,
            resetTime: rateLimitInfo.resetTime,
            retryAfter: Math.ceil((rateLimitInfo.resetTime - now) / 1000),
          },
        },
      });
    }
    
    next();
  };
};
