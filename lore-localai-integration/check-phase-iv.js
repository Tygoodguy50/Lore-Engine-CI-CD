#!/usr/bin/env node
/**
 * Phase IV Status Checker
 * Quick verification of haunted ecosystem status
 */

const http = require('http');

console.log('🎭 Phase IV: Scale the Haunt - Status Check');
console.log('==========================================');
console.log('');

// Core Services
const coreServices = [
    { name: 'Main Application', url: 'http://localhost:8080/stats', essential: true },
    { name: 'Haunted Dashboard', url: 'http://localhost:3002', essential: true },
    { name: 'LocalAI', url: 'http://localhost:8081/health', essential: false }
];

// Phase IV Services
const phaseIVServices = [
    { name: 'Creator Leaderboards', url: 'http://localhost:8085/stats', port: 8085 },
    { name: 'Fragment Remix Engine', url: 'http://localhost:8086/stats', port: 8086 },
    { name: 'Revenue Multipliers', url: 'http://localhost:8087/stats', port: 8087 },
    { name: 'Multi-Platform Dispatcher', url: 'http://localhost:8088/stats', port: 8088 },
    { name: 'Sentiment & Lore Evolution', url: 'http://localhost:8089/stats', port: 8089 }
];

function checkService(service, timeout = 3000) {
    return new Promise((resolve) => {
        const url = new URL(service.url);
        const req = http.request({
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: 'GET',
            timeout: timeout
        }, (res) => {
            resolve({
                name: service.name,
                status: res.statusCode < 400 ? 'healthy' : 'error',
                code: res.statusCode,
                url: service.url
            });
        });

        req.on('error', () => {
            resolve({
                name: service.name,
                status: 'offline',
                url: service.url,
                port: service.port
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                name: service.name,
                status: 'timeout',
                url: service.url
            });
        });

        req.end();
    });
}

async function checkAllServices() {
    console.log('🔍 Checking Core Services...');
    console.log('');
    
    let healthyCore = 0;
    for (const service of coreServices) {
        const result = await checkService(service);
        const icon = result.status === 'healthy' ? '✅' : 
                    result.status === 'offline' ? '❌' : '⚠️';
        console.log(`${icon} ${result.name}: ${result.status}`);
        if (result.status === 'healthy') healthyCore++;
    }
    
    console.log('');
    console.log('🎭 Checking Phase IV Services...');
    console.log('');
    
    let healthyPhaseIV = 0;
    for (const service of phaseIVServices) {
        const result = await checkService(service);
        const icon = result.status === 'healthy' ? '✅' : 
                    result.status === 'offline' ? '❌' : '⚠️';
        console.log(`${icon} ${result.name}: ${result.status} (port ${service.port})`);
        if (result.status === 'healthy') healthyPhaseIV++;
    }
    
    console.log('');
    console.log('==========================================');
    console.log(`📊 System Status:`);
    console.log(`   Core Services: ${healthyCore}/${coreServices.length} healthy`);
    console.log(`   Phase IV: ${healthyPhaseIV}/${phaseIVServices.length} healthy`);
    
    if (healthyCore >= 2 && healthyPhaseIV === 0) {
        console.log('');
        console.log('🎯 Next Steps:');
        console.log('   1. Phase IV services need to be started');
        console.log('   2. Run: node launch-phase-iv.js');
        console.log('   3. Visit dashboard: http://localhost:3000');
    } else if (healthyPhaseIV > 0) {
        console.log('');
        console.log('🎉 Phase IV is operational!');
        console.log('   👻 Dashboard: http://localhost:3002');
    } else if (healthyCore < 2) {
        console.log('');
        console.log('⚠️  Core services need attention first');
        console.log('   Ensure main application and dashboard are running');
    }
    
    console.log('');
}

checkAllServices().catch(console.error);
