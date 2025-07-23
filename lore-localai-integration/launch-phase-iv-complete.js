#!/usr/bin/env node
/**
 * Phase IV Complete Launch System
 * Starts all 5 backend services for live data integration
 */

const { spawn } = require('child_process');
const http = require('http');

console.log('🎭 PHASE IV: SCALE THE HAUNT - COMPLETE LAUNCH');
console.log('==============================================');
console.log('');

// Phase IV Services Configuration
const services = [
    {
        name: 'Creator Leaderboards',
        file: 'creator-leaderboards.js',
        port: 8085,
        icon: '👑',
        description: 'Gamified creator ranking system'
    },
    {
        name: 'Fragment Remix Engine', 
        file: 'fragment-remix-engine.js',
        port: 8086,
        icon: '🧬',
        description: 'AI-powered content evolution'
    },
    {
        name: 'Revenue Multipliers',
        file: 'revenue-multipliers.js', 
        port: 8087,
        icon: '💰',
        description: 'Monetization & payout system'
    },
    {
        name: 'Multi-Platform Dispatcher',
        file: 'multi-platform-dispatcher.js',
        port: 8088,
        icon: '🌐',
        description: 'Cross-platform content distribution'
    },
    {
        name: 'Sentiment & Lore Evolution',
        file: 'sentiment-lore-evolution.js',
        port: 8089,
        icon: '🧠',
        description: 'Community-driven content evolution'
    }
];

const runningServices = [];

// Test if a port is available
function testPort(port) {
    return new Promise((resolve) => {
        const server = http.createServer();
        server.listen(port, () => {
            server.close(() => resolve(true));
        });
        server.on('error', () => resolve(false));
    });
}

// Start a single service
async function startService(service, index) {
    console.log(`${service.icon} [${index + 1}/5] Starting ${service.name}...`);
    
    // Check if port is available
    const portAvailable = await testPort(service.port);
    if (!portAvailable) {
        console.log(`   ⚠️  Port ${service.port} already in use - service may already be running`);
        return null;
    }
    
    return new Promise((resolve) => {
        const child = spawn('node', [service.file], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: __dirname
        });

        let isReady = false;
        let output = '';

        // Capture stdout
        child.stdout.on('data', (data) => {
            const message = data.toString();
            output += message;
            
            if (message.includes(`running on port ${service.port}`) && !isReady) {
                console.log(`   ✅ ${service.name} operational at http://localhost:${service.port}`);
                console.log(`   📝 ${service.description}`);
                isReady = true;
                resolve({
                    name: service.name,
                    port: service.port,
                    process: child,
                    icon: service.icon
                });
            }
        });

        // Capture stderr
        child.stderr.on('data', (data) => {
            const error = data.toString();
            if (error.includes('ENOENT')) {
                console.log(`   ❌ Service file not found: ${service.file}`);
                console.log(`   🔍 Make sure the file exists in the current directory`);
                resolve(null);
            } else if (error.includes('EADDRINUSE')) {
                console.log(`   ⚠️  Port ${service.port} already in use`);
                resolve(null);
            } else {
                console.log(`   ⚠️  Warning: ${error.trim()}`);
            }
        });

        // Handle process exit
        child.on('exit', (code) => {
            if (!isReady) {
                console.log(`   ❌ ${service.name} failed to start (exit code: ${code})`);
                resolve(null);
            }
        });

        // Timeout after 15 seconds
        setTimeout(() => {
            if (!isReady) {
                console.log(`   ⏱️  Timeout starting ${service.name}`);
                child.kill();
                resolve(null);
            }
        }, 15000);
    });
}

// Start all services sequentially
async function launchAllServices() {
    console.log('🚀 Launching Phase IV Services...');
    console.log('');

    for (let i = 0; i < services.length; i++) {
        const service = services[i];
        const result = await startService(service, i);
        
        if (result) {
            runningServices.push(result);
        }
        
        console.log('');
        
        // Small delay between services
        if (i < services.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    // Final status report
    console.log('==============================================');
    console.log(`📊 PHASE IV LAUNCH COMPLETE!`);
    console.log(`   Services Started: ${runningServices.length}/${services.length}`);
    console.log('');
    
    if (runningServices.length > 0) {
        console.log('✅ OPERATIONAL SERVICES:');
        runningServices.forEach(service => {
            console.log(`   ${service.icon} ${service.name}: http://localhost:${service.port}/stats`);
        });
        console.log('');
        console.log('🎭 DASHBOARD INTEGRATION:');
        console.log('   👻 Haunted Dashboard: http://localhost:3002');
        console.log('   🔄 Dashboard will now switch from mock to LIVE data');
        console.log('');
        console.log('🎉 Phase IV: Scale the Haunt is FULLY OPERATIONAL!');
        console.log('');
        console.log('💡 What you can now do:');
        console.log('   • Watch real-time viral score fluctuations');
        console.log('   • See live creator performance updates');
        console.log('   • Monitor actual revenue calculations');
        console.log('   • Track cross-platform distribution');
        console.log('   • Analyze community sentiment evolution');
        
    } else {
        console.log('❌ No services started successfully.');
        console.log('');
        console.log('🔧 Troubleshooting:');
        console.log('   1. Ensure all Phase IV service files exist');
        console.log('   2. Check that ports 8085-8089 are available');
        console.log('   3. Verify Node.js is properly installed');
    }
    
    console.log('');
    console.log('Press Ctrl+C to stop all services');
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('');
    console.log('🛑 Shutting down Phase IV services...');
    
    runningServices.forEach(service => {
        if (service.process && !service.process.killed) {
            console.log(`   Stopping ${service.name}...`);
            service.process.kill('SIGTERM');
        }
    });
    
    setTimeout(() => {
        console.log('');
        console.log('✅ All Phase IV services stopped');
        console.log('👻 The haunted empire rests... until next time');
        process.exit(0);
    }, 3000);
});

process.on('SIGTERM', () => process.kill(process.pid, 'SIGINT'));

// Start the launch sequence
launchAllServices().catch(console.error);
