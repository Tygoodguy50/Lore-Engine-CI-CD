#!/usr/bin/env node
/**
 * Quick Dashboard Launcher - Run this directly!
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3002; // Using 3002 since 3000 (main API) and 3001 (Grafana) are taken

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css', 
    '.js': 'text/javascript',
    '.json': 'application/json'
};

const server = http.createServer((req, res) => {
    console.log(`📡 ${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, 'dashboard', filePath.substring(1));
    
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'text/plain';
    
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.log(`❌ Error serving ${filePath}:`, err.code);
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end(`
                <html>
                    <head><title>404 - File Not Found</title></head>
                    <body style="background: #0a0a0a; color: #00ff41; font-family: monospace; text-align: center; padding: 50px;">
                        <h1>👻 404 - Haunted File Not Found</h1>
                        <p>The requested file <code>${req.url}</code> could not be summoned from the void.</p>
                        <p><a href="/" style="color: #8b5cf6;">Return to Dashboard</a></p>
                    </body>
                </html>
            `);
        } else {
            res.writeHead(200, {'Content-Type': contentType});
            res.end(data);
        }
    });
});

server.listen(PORT, () => {
    console.log('');
    console.log('👻 HAUNTED DASHBOARD STARTED!');
    console.log('=====================================');
    console.log(`🌐 Dashboard URL: http://localhost:${PORT}`);
    console.log(`📁 Serving from: ${path.join(__dirname, 'dashboard')}`);
    console.log('');
    console.log('🎭 Your haunted payout dashboard is now live!');
    console.log('   Visit the URL above to see viral scores, revenue tracking,');
    console.log('   creator performance, and referral analytics.');
    console.log('');
    console.log('   Note: Dashboard will show mock data until Phase IV services');
    console.log('   are running on ports 8085-8089');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
    console.log('');
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. The dashboard might already be running.`);
        console.error(`   Try visiting: http://localhost:${PORT}`);
    } else {
        console.error('❌ Server error:', err);
    }
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down haunted dashboard...');
    server.close(() => {
        console.log('✅ Dashboard server stopped');
        process.exit(0);
    });
});

process.on('SIGTERM', () => process.kill(process.pid, 'SIGINT'));
