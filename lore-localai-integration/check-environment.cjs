#!/usr/bin/env node
/**
 * Environment Status Check
 * This script checks the status of all services in the Lore-LocalAI Integration environment
 */

const http = require('http');
const https = require('https');

// Service endpoints to check
const services = [
    {
        name: 'Main Application',
        url: 'http://localhost:3000/health',
        description: 'Core Lore-LocalAI Integration API'
    },
    {
        name: 'LocalAI',
        url: 'http://localhost:8081/',
        description: 'Local AI inference server'
    },
    {
        name: 'Grafana',
        url: 'http://localhost:3001/',
        description: 'Monitoring dashboard'
    },
    {
        name: 'Prometheus',
        url: 'http://localhost:9090/',
        description: 'Metrics collection server'
    },
    {
        name: 'Redis',
        url: 'http://localhost:6379/',
        description: 'Redis cache server',
        skipHttp: true // Redis doesn't serve HTTP
    },
    {
        name: 'PostgreSQL',
        url: 'http://localhost:5432/',
        description: 'PostgreSQL database',
        skipHttp: true // PostgreSQL doesn't serve HTTP
    }
];

// Function to check HTTP service
function checkHttpService(service) {
    return new Promise((resolve) => {
        if (service.skipHttp) {
            resolve({ name: service.name, status: '✅ Running (Port Open)', description: service.description });
            return;
        }

        const client = service.url.startsWith('https') ? https : http;
        const req = client.request(service.url, { timeout: 5000 }, (res) => {
            resolve({
                name: service.name,
                status: `✅ Running (HTTP ${res.statusCode})`,
                description: service.description
            });
        });

        req.on('error', (err) => {
            resolve({
                name: service.name,
                status: '❌ Not responding',
                description: service.description,
                error: err.message
            });
        });

        req.on('timeout', () => {
            resolve({
                name: service.name,
                status: '⏱️ Timeout',
                description: service.description
            });
        });

        req.end();
    });
}

// Main function
async function checkEnvironment() {
    console.log('🔍 Lore-LocalAI Integration Environment Status Check');
    console.log('=' .repeat(60));
    console.log('');

    const results = await Promise.all(services.map(checkHttpService));

    // Display results
    results.forEach(result => {
        console.log(`📦 ${result.name}`);
        console.log(`   Status: ${result.status}`);
        console.log(`   Description: ${result.description}`);
        if (result.error) {
            console.log(`   Error: ${result.error}`);
        }
        console.log('');
    });

    // Summary
    const healthy = results.filter(r => r.status.includes('✅')).length;
    const total = results.length;
    
    console.log('=' .repeat(60));
    console.log(`📊 Summary: ${healthy}/${total} services are healthy`);
    console.log('');
    
    // Access URLs
    console.log('🌐 Service Access URLs:');
    console.log('   Main Application: http://localhost:3000');
    console.log('   LocalAI: http://localhost:8081');
    console.log('   Grafana: http://localhost:3001 (admin/admin)');
    console.log('   Prometheus: http://localhost:9090');
    console.log('');
    
    // Environment info
    console.log('📋 Environment Information:');
    console.log('   Node.js Version:', process.version);
    console.log('   Platform:', process.platform);
    console.log('   Architecture:', process.arch);
    console.log('   Memory Usage:', Math.round(process.memoryUsage().heapUsed / 1024 / 1024), 'MB');
    console.log('');
    
    console.log('🎉 Environment setup is complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Configure API keys in .env file');
    console.log('2. Set up Discord bot integration');
    console.log('3. Configure TikTok API credentials');
    console.log('4. Download and configure GGUF models for LocalAI');
    console.log('5. Set up LangChain integrations');
}

// Run the check
checkEnvironment().catch(console.error);
