#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const environment_js_1 = require("./config/environment.js");
const logger_js_1 = require("./utils/logger.js");
const requiredEnvVars = [
    'STRIPE_SECRET_KEY',
    'DISCORD_WEBHOOK_URL',
    'JWT_SECRET',
    'LORE_ENGINE_API_URL',
];
function validateEnvironment() {
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
function checkDependencies() {
    try {
        require('express');
        require('stripe');
        require('cors');
        require('winston');
        require('zod');
        return true;
    }
    catch (error) {
        console.error('❌ Missing dependencies. Run: npm install');
        return false;
    }
}
function startServer() {
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
    const serverProcess = (0, child_process_1.spawn)('node', ['./dist/server.js'], {
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: environment_js_1.config.app.env }
    });
    serverProcess.on('error', (error) => {
        logger_js_1.logger.error('Failed to start server:', error);
        process.exit(1);
    });
    serverProcess.on('close', (code) => {
        if (code !== 0) {
            logger_js_1.logger.error(`Server exited with code ${code}`);
            process.exit(code);
        }
    });
    process.on('SIGINT', () => {
        console.log('\n🛑 Received SIGINT, shutting down gracefully...');
        serverProcess.kill('SIGINT');
    });
    process.on('SIGTERM', () => {
        console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
        serverProcess.kill('SIGTERM');
    });
}
function startDevelopment() {
    console.log('🔄 Starting in development mode with auto-restart...');
    const nodemonProcess = (0, child_process_1.spawn)('npx', ['nodemon', '--exec', 'tsx', './src/server.ts'], {
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'development' }
    });
    nodemonProcess.on('error', (error) => {
        console.error('Failed to start development server:', error);
        process.exit(1);
    });
}
const args = process.argv.slice(2);
const isDevelopment = args.includes('--dev') || environment_js_1.config.app.env === 'development';
console.log(`
🔮 Lore Engine SaaS Launcher
Environment: ${environment_js_1.config.app.env}
Mode: ${isDevelopment ? 'Development (auto-restart)' : 'Production'}
Port: ${environment_js_1.config.app.port}
`);
if (isDevelopment) {
    startDevelopment();
}
else {
    startServer();
}
//# sourceMappingURL=start.js.map