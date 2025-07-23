#!/usr/bin/env node
console.log('🎭 Starting Haunted Dashboard Server...');

const http = require('http');
const fs = require('fs');
const PORT = 3002;

// Check if the HTML file exists
if (!fs.existsSync('haunted-dashboard.html')) {
    console.error('❌ haunted-dashboard.html not found!');
    process.exit(1);
}

console.log('✅ Dashboard HTML file found');

const server = http.createServer((req, res) => {
    console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Serve the dashboard
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile('haunted-dashboard.html', 'utf8', (err, data) => {
            if (err) {
                console.error('❌ Error reading dashboard file:', err);
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Error loading dashboard');
                return;
            }
            
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.writeHead(200);
            res.end(data);
            console.log('✅ Dashboard served successfully');
        });
    } else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Not Found');
        console.log('❌ 404 - File not found:', req.url);
    }
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use!`);
        console.log('💡 Try: netstat -ano | findstr :3002');
        console.log('💡 Kill process: taskkill /PID [PID] /F');
    } else {
        console.error('❌ Server error:', err);
    }
    process.exit(1);
});

server.listen(PORT, '127.0.0.1', () => {
    console.log('');
    console.log('🎉 SUCCESS! Dashboard server is running!');
    console.log(`🔗 Dashboard URL: http://localhost:${PORT}`);
    console.log(`🔗 Alternative: http://127.0.0.1:${PORT}`);
    console.log('');
    console.log('👻 Haunted Empire Dashboard is ready!');
    console.log('📊 Live data from Phase IV services');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down dashboard server...');
    server.close(() => {
        console.log('✅ Dashboard server stopped');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    process.kill(process.pid, 'SIGINT');
});
