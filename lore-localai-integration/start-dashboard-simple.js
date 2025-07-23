const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3002;
const DASHBOARD_DIR = path.join(__dirname, 'dashboard');

console.log('🎭 Starting Haunted Dashboard Server...');
console.log('📁 Dashboard directory:', DASHBOARD_DIR);

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(DASHBOARD_DIR, filePath);
    
    // Security check
    if (!filePath.startsWith(DASHBOARD_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }
        
        // Set content type
        const ext = path.extname(filePath);
        const contentTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json'
        };
        
        res.setHeader('Content-Type', contentTypes[ext] || 'text/plain');
        res.writeHead(200);
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`✅ Dashboard server running on port ${PORT}`);
    console.log(`🔗 Access your dashboard at: http://localhost:${PORT}`);
    console.log('👻 Haunted Empire Dashboard ready!');
});

server.on('error', (err) => {
    console.error('❌ Server error:', err.message);
});
