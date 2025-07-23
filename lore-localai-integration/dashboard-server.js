const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3002;

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Serve the dashboard HTML file
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile('haunted-dashboard.html', 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading dashboard');
                return;
            }
            
            res.setHeader('Content-Type', 'text/html');
            res.writeHead(200);
            res.end(data);
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`🎭 Haunted Dashboard Server running on port ${PORT}`);
    console.log(`🔗 Access your dashboard at: http://localhost:${PORT}`);
    console.log('👻 Phase IV Dashboard ready!');
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
    } else {
        console.error('❌ Server error:', err);
    }
    process.exit(1);
});
