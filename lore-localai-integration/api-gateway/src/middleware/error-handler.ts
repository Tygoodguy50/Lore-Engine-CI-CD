import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface CustomError extends Error {
  status?: number;
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Default error
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.status || err.statusCode || 500,
    code: err.code || 'INTERNAL_ERROR',
    details: err.details || null,
  };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error = {
      message: 'Validation Error',
      status: 400,
      code: 'VALIDATION_ERROR',
      details: err.message,
    };
  }

  // Mongoose duplicate key error
  if (err.code === '11000') {
    error = {
      message: 'Duplicate field value entered',
      status: 400,
      code: 'DUPLICATE_ERROR',
      details: err.message,
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      status: 401,
      code: 'INVALID_TOKEN',
      details: null,
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      status: 401,
      code: 'TOKEN_EXPIRED',
      details: null,
    };
  }

  // Rate limit error
  if (err.name === 'RateLimitError') {
    error = {
      message: 'Rate limit exceeded',
      status: 429,
      code: 'RATE_LIMIT_EXCEEDED',
      details: err.details,
    };
  }

  // Database connection errors
  if (err.code === 'ECONNREFUSED') {
    error = {
      message: 'Database connection failed',
      status: 503,
      code: 'DATABASE_CONNECTION_ERROR',
      details: null,
    };
  }

  // Don't expose sensitive information in production
  if (process.env.NODE_ENV === 'production' && error.status === 500) {
    error.details = null;
  }

  res.status(error.status).json({
    success: false,
    error: {
      message: error.message,
      code: error.code,
      ...(error.details && { details: error.details }),
    },
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};
