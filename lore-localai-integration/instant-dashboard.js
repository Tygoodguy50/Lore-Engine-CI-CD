#!/usr/bin/env node
/**
 * INSTANT DASHBOARD LAUNCHER
 * Run this with: node instant-dashboard.js
 */

console.log('👻 STARTING HAUNTED DASHBOARD...');
console.log('=================================');
console.log('');

// Import required modules
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3002;

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css', 
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
};

// Create the HTTP server
const server = http.createServer((req, res) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    console.log(`📡 [${timestamp}] ${req.method} ${req.url}`);
    
    let filePath = req.url === '/' ? '/index.html' : req.url;
    
    // Remove query parameters
    const urlPath = filePath.split('?')[0];
    
    // Construct file path
    filePath = path.join(__dirname, 'dashboard', urlPath.substring(1));
    
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
    
    // Check if file exists and serve it
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.log(`❌ Error serving ${filePath}: ${err.code}`);
            
            // Serve 404 page
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>👻 404 - Haunted File Not Found</title>
                    <style>
                        body { 
                            background: #0a0a0a; 
                            color: #00ff41; 
                            font-family: 'Courier New', monospace; 
                            text-align: center; 
                            padding: 50px;
                            margin: 0;
                        }
                        h1 { color: #8b5cf6; text-shadow: 0 0 10px #8b5cf6; }
                        a { color: #00ff41; text-decoration: none; }
                        a:hover { text-shadow: 0 0 5px #00ff41; }
                        .ghost { font-size: 4em; margin: 20px; }
                    </style>
                </head>
                <body>
                    <div class="ghost">👻</div>
                    <h1>404 - Haunted File Not Found</h1>
                    <p>The requested file <code>${req.url}</code> could not be summoned from the void.</p>
                    <p><a href="/">Return to Haunted Dashboard</a></p>
                    <p><small>The spirits are restless, but the dashboard awaits...</small></p>
                </body>
                </html>
            `);
        } else {
            res.writeHead(200, {'Content-Type': contentType});
            res.end(data);
        }
    });
});

// Error handling
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use!`);
        console.error(`   Another service might be running on this port.`);
        console.error(`   Try visiting http://localhost:${PORT} to see if it's already working.`);
        process.exit(1);
    } else {
        console.error('❌ Server error:', err.message);
        process.exit(1);
    }
});

// Start the server
server.listen(PORT, () => {
    console.log('');
    console.log('🎉 HAUNTED DASHBOARD STARTED SUCCESSFULLY!');
    console.log('==========================================');
    console.log(`🌐 Dashboard URL: http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${path.join(__dirname, 'dashboard')}`);
    console.log(`🕐 Started at: ${new Date().toLocaleString()}`);
    console.log('');
    console.log('🎭 Features Available:');
    console.log('   💰 Real-time revenue tracking');
    console.log('   🧮 Viral coefficient engine');
    console.log('   🎭 Creator performance matrix');
    console.log('   🔗 Referral chain analytics');
    console.log('   📊 Fragment performance table');
    console.log('');
    console.log('📝 Note: Dashboard will show mock data until Phase IV services');
    console.log('   are running on ports 8085-8089');
    console.log('');
    console.log('🔧 To stop the server: Press Ctrl+C');
    console.log('');
    console.log('✨ READY FOR HAUNTED ANALYTICS!');
    console.log('');
    
    // Try to open in browser after a short delay
    setTimeout(() => {
        const { exec } = require('child_process');
        exec(`start http://localhost:${PORT}`, (err) => {
            if (err) {
                console.log('💡 Tip: Open your browser and visit the URL above');
            } else {
                console.log('🚀 Opening dashboard in your default browser...');
            }
        });
    }, 2000);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('');
    console.log('🛑 Shutting down haunted dashboard server...');
    server.close(() => {
        console.log('✅ Dashboard server stopped gracefully');
        console.log('👻 Thanks for using the haunted dashboard!');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    process.kill(process.pid, 'SIGINT');
});
