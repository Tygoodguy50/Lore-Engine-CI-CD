import winston from 'winston';
import { config } from '../config';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston about the colors
winston.addColors(colors);

// Create the logger
export const logger = winston.createLogger({
  level: config.logging.level,
  levels,
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss:ms',
    }),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
    config.logging.format === 'json'
      ? winston.format.json()
      : winston.format.combine(
          winston.format.colorize({ all: config.logging.colors }),
          winston.format.printf(
            (info) => `${info.timestamp} [${info.level}]: ${info.message}`
          )
        )
  ),
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true,
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      handleExceptions: true,
      handleRejections: true,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
  exitOnError: false,
});

// Create a stream for Morgan HTTP logging
logger.stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Override console methods in development
if (config.nodeEnv === 'development') {
  console.log = (...args: any[]) => logger.info(args.join(' '));
  console.error = (...args: any[]) => logger.error(args.join(' '));
  console.warn = (...args: any[]) => logger.warn(args.join(' '));
  console.info = (...args: any[]) => logger.info(args.join(' '));
  console.debug = (...args: any[]) => logger.debug(args.join(' '));
}

export default logger;
