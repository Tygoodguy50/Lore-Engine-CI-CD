#!/usr/bin/env node
/**
 * Phase IV Service Status Checker
 * Verifies all backend services are operational
 */

const http = require('http');

console.log('🔍 PHASE IV SERVICE STATUS CHECK');
console.log('================================');
console.log('');

const services = [
    { name: 'Creator Leaderboards', port: 8085, icon: '👑' },
    { name: 'Fragment Remix Engine', port: 8086, icon: '🧬' },
    { name: 'Revenue Multipliers', port: 8087, icon: '💰' },
    { name: 'Multi-Platform Dispatcher', port: 8088, icon: '🌐' },
    { name: 'Sentiment & Lore Evolution', port: 8089, icon: '🧠' },
    { name: 'Stripe Payment Service', port: 8090, icon: '💳' }
];

function checkService(service) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: service.port,
            path: '/stats',
            method: 'GET',
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve({
                        ...service,
                        status: 'operational',
                        uptime: response.uptime || 0,
                        data: response
                    });
                } catch (error) {
                    resolve({
                        ...service,
                        status: 'error',
                        error: 'Invalid JSON response'
                    });
                }
            });
        });

        req.on('error', (error) => {
            resolve({
                ...service,
                status: 'offline',
                error: error.message
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                ...service,
                status: 'timeout',
                error: 'Request timed out'
            });
        });

        req.end();
    });
}

async function checkAllServices() {
    console.log('Checking Phase IV services...');
    console.log('');

    const results = await Promise.all(services.map(checkService));
    
    let operational = 0;
    let total = results.length;
    
    results.forEach(result => {
        const statusIcon = result.status === 'operational' ? '✅' : 
                          result.status === 'offline' ? '❌' : '⚠️';
        
        console.log(`${result.icon} ${statusIcon} ${result.name}`);
        console.log(`   Port: ${result.port}`);
        console.log(`   Status: ${result.status}`);
        
        if (result.status === 'operational') {
            operational++;
            console.log(`   Uptime: ${Math.round(result.uptime)} seconds`);
            console.log(`   URL: http://localhost:${result.port}/stats`);
        } else {
            console.log(`   Error: ${result.error}`);
        }
        console.log('');
    });
    
    console.log('================================');
    console.log(`📊 SUMMARY: ${operational}/${total} services operational`);
    
    if (operational === total) {
        console.log('🎉 All Phase IV services are running!');
        console.log('🎭 Dashboard ready: http://localhost:3002');
    } else if (operational > 0) {
        console.log('⚠️  Some services need attention');
        console.log('💡 Try running: node [service-file].js');
    } else {
        console.log('❌ No services are running');
        console.log('🚀 Start them with: ./launch-phase-iv.ps1');
    }
    
    console.log('');
    return {
        operational,
        total,
        results
    };
}

// Run the check
checkAllServices().catch(console.error);
