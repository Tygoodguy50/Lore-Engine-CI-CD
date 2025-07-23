const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.url === '/' || req.url === '/index.html') {
        const html = `<!DOCTYPE html>
<html>
<head>
    <title>👻 Haunted Dashboard</title>
    <style>
        body { background: linear-gradient(135deg, #1a0033, #000); color: #00ff41; font-family: monospace; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .title { font-size: 3rem; text-shadow: 0 0 20px #8b5cf6; }
        .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .card { background: rgba(139,92,246,0.1); border: 1px solid #8b5cf6; padding: 20px; border-radius: 10px; }
        .value { font-size: 2rem; color: #00ff41; font-weight: bold; }
        .status { margin-top: 30px; text-align: center; padding: 15px; background: rgba(0,0,0,0.8); border: 1px solid #8b5cf6; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">👻 Haunted Empire</h1>
        <p>Phase IV Dashboard - Live Data</p>
    </div>
    
    <div class="metrics">
        <div class="card">
            <div>📈 Total Revenue</div>
            <div class="value" id="revenue">$0</div>
        </div>
        <div class="card">
            <div>👥 Active Creators</div>
            <div class="value" id="creators">0</div>
        </div>
        <div class="card">
            <div>🔥 Avg Viral Score</div>
            <div class="value" id="viral">0.0</div>
        </div>
        <div class="card">
            <div>⚡ Services</div>
            <div class="value" id="services">0/5</div>
        </div>
    </div>
    
    <div class="status">
        <strong>Dashboard Status:</strong> <span style="color: #00ff41;">OPERATIONAL</span> | 
        <strong>Last Update:</strong> <span id="lastUpdate">Never</span>
    </div>

    <script>
        async function updateDashboard() {
            try {
                // Check services
                let operational = 0;
                const ports = [8085, 8086, 8087, 8088, 8089];
                
                for (const port of ports) {
                    try {
                        const response = await fetch(\`http://localhost:\${port}/stats\`);
                        if (response.ok) operational++;
                    } catch (e) {}
                }
                
                document.getElementById('services').textContent = \`\${operational}/5\`;
                
                // Get creator data
                try {
                    const response = await fetch('http://localhost:8085/creators');
                    if (response.ok) {
                        const data = await response.json();
                        const creators = data.creators || [];
                        
                        const totalRevenue = creators.reduce((sum, c) => sum + c.weeklyRevenue, 0);
                        const avgViral = creators.length > 0 ? creators.reduce((sum, c) => sum + c.viralScore, 0) / creators.length : 0;
                        
                        document.getElementById('revenue').textContent = \`$\${totalRevenue.toLocaleString()}\`;
                        document.getElementById('creators').textContent = creators.length;
                        document.getElementById('viral').textContent = avgViral.toFixed(1);
                    }
                } catch (e) {
                    console.log('Creator service unavailable');
                }
                
                document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
                
            } catch (error) {
                console.error('Update error:', error);
            }
        }
        
        // Update every 5 seconds
        updateDashboard();
        setInterval(updateDashboard, 5000);
    </script>
</body>
</html>`;
        
        res.setHeader('Content-Type', 'text/html');
        res.writeHead(200);
        res.end(html);
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(3002, () => {
    console.log('🎭 Dashboard server running on port 3002');
    console.log('🔗 Access: http://localhost:3002');
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error('❌ Port 3002 is already in use');
    } else {
        console.error('❌ Server error:', err);
    }
});
