#!/usr/bin/env node

/**
 * 🔮 Lore Engine SaaS - Startup Script
 * Production-ready launcher with dependency checks
 * Generated: July 18, 2025
 */

import { spawn } from 'child_process';
import { config } from './config/environment.js';
import { logger } from './utils/logger.js';

// Environment validation
const requiredEnvVars = [
  'STRIPE_SECRET_KEY',
  'DISCORD_WEBHOOK_URL',
  'JWT_SECRET',
  'LORE_ENGINE_API_URL',
];

function validateEnvironment(): boolean {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n💡 Create a .env file with these variables or set them in your environment.');
    return false;
  }
  
  return true;
}

// Dependency check
function checkDependencies(): boolean {
  try {
    require('express');
    require('stripe');
    require('cors');
    require('winston');
    require('zod');
    return true;
  } catch (error) {
    console.error('❌ Missing dependencies. Run: npm install');
    return false;
  }
}

// Start server with health monitoring
function startServer(): void {
  console.log(`
🔮 =======================================
   LORE ENGINE SAAS - STARTUP SEQUENCE
=======================================`);

  console.log('🔍 Validating environment...');
  if (!validateEnvironment()) {
    process.exit(1);
  }
  console.log('✅ Environment validation passed');

  console.log('📦 Checking dependencies...');
  if (!checkDependencies()) {
    process.exit(1);
  }
  console.log('✅ Dependencies validated');

  console.log('🚀 Starting SaaS server...');
  
  const serverProcess = spawn('node', ['./dist/server.js'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: config.app.env }
  });

  serverProcess.on('error', (error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });

  serverProcess.on('close', (code) => {
    if (code !== 0) {
      logger.error(`Server exited with code ${code}`);
      process.exit(code);
    }
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    serverProcess.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    serverProcess.kill('SIGTERM');
  });
}

// Development mode with auto-restart
function startDevelopment(): void {
  console.log('🔄 Starting in development mode with auto-restart...');
  
  const nodemonProcess = spawn('npx', ['nodemon', '--exec', 'tsx', './src/server.ts'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });

  nodemonProcess.on('error', (error) => {
    console.error('Failed to start development server:', error);
    process.exit(1);
  });
}

// Main execution
const args = process.argv.slice(2);
const isDevelopment = args.includes('--dev') || config.app.env === 'development';

console.log(`
🔮 Lore Engine SaaS Launcher
Environment: ${config.app.env}
Mode: ${isDevelopment ? 'Development (auto-restart)' : 'Production'}
Port: ${config.app.port}
`);

if (isDevelopment) {
  startDevelopment();
} else {
  startServer();
}
