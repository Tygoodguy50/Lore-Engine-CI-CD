#!/usr/bin/env node
/**
 * Phase IV: Scale the Haunt - Service Launcher
 * Launches all Phase IV services for the haunted ecosystem
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🎭 Phase IV: Scale the Haunt - Service Launcher');
console.log('============================================');
console.log('');

// Phase IV Services
const services = [
    {
        name: 'Creator Leaderboards',
        file: 'creator-leaderboards.js',
        port: 8085,
        description: 'Gamified creator ranking system'
    },
    {
        name: 'Fragment Remix Engine', 
        file: 'fragment-remix-engine.js',
        port: 8086,
        description: 'AI-powered content evolution'
    },
    {
        name: 'Revenue Multipliers',
        file: 'revenue-multipliers.js', 
        port: 8087,
        description: 'Monetization & payout system'
    },
    {
        name: 'Multi-Platform Dispatcher',
        file: 'multi-platform-dispatcher.js',
        port: 8088,
        description: 'Cross-platform content distribution'
    },
    {
        name: 'Sentiment & Lore Evolution',
        file: 'sentiment-lore-evolution.js',
        port: 8089,
        description: 'Community-driven content evolution'
    }
];

const processes = [];

async function launchService(service) {
    return new Promise((resolve) => {
        console.log(`🚀 Starting ${service.name} on port ${service.port}...`);
        
        const child = spawn('node', [service.file], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: __dirname
        });

        let isReady = false;

        child.stdout.on('data', (data) => {
            const output = data.toString();
            if (output.includes(`listening on port ${service.port}`) && !isReady) {
                console.log(`✅ ${service.name} ready at http://localhost:${service.port}`);
                isReady = true;
                resolve(child);
            }
        });

        child.stderr.on('data', (data) => {
            const error = data.toString();
            if (error.includes('ENOENT')) {
                console.log(`⚠️  ${service.name} file not found (${service.file})`);
                console.log(`   Create the service file first, then run this launcher`);
                resolve(null);
            } else if (error.includes('EADDRINUSE')) {
                console.log(`⚠️  Port ${service.port} already in use for ${service.name}`);
                resolve(null);
            } else {
                console.log(`❌ Error starting ${service.name}:`, error.trim());
                resolve(null);
            }
        });

        child.on('exit', (code) => {
            if (!isReady) {
                console.log(`⚠️  ${service.name} exited with code ${code}`);
                resolve(null);
            }
        });

        processes.push({ name: service.name, process: child });
        
        // Timeout after 10 seconds
        setTimeout(() => {
            if (!isReady) {
                console.log(`⏱️  Timeout starting ${service.name}`);
                resolve(null);
            }
        }, 10000);
    });
}

async function launchAllServices() {
    console.log('Starting Phase IV services...\n');

    for (const service of services) {
        const process = await launchService(service);
        if (process) {
            console.log(`   ${service.description}`);
        }
        console.log('');
        
        // Small delay between service starts
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const runningCount = processes.filter(p => p.process && !p.process.killed).length;
    
    console.log('============================================');
    console.log(`📊 Phase IV Status: ${runningCount}/${services.length} services running`);
    console.log('');
    
    if (runningCount > 0) {
        console.log('🌐 Service URLs:');
        services.forEach(service => {
            console.log(`   ${service.name}: http://localhost:${service.port}/stats`);
        });
        console.log('');
        console.log('👻 Haunted Dashboard: http://localhost:3000');
        console.log('   (Dashboard will now connect to live services instead of mock data)');
        console.log('');
        
        console.log('🎉 Phase IV: Scale the Haunt is operational!');
        console.log('');
        console.log('Press Ctrl+C to stop all services');
    } else {
        console.log('❌ No services started successfully.');
        console.log('');
        console.log('Next steps:');
        console.log('1. Ensure Phase IV service files exist in this directory');
        console.log('2. Run: node launch-phase-iv.js');
        console.log('3. Access dashboard at http://localhost:3000');
    }
}

// Handle cleanup on exit
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Phase IV services...');
    
    processes.forEach(({ name, process }) => {
        if (process && !process.killed) {
            console.log(`   Stopping ${name}...`);
            process.kill('SIGTERM');
        }
    });
    
    setTimeout(() => {
        console.log('✅ All services stopped');
        process.exit(0);
    }, 2000);
});

process.on('SIGTERM', () => process.kill(process.pid, 'SIGINT'));

// Launch services
launchAllServices().catch(console.error);
