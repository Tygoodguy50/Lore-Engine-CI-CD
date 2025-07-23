const http = require('http');
const httpProxy = require('http-proxy-middleware');
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');

// Create Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.REALTIME_PORT || 8080;
const TARGET_API_PORT = process.env.TARGET_PORT || 3002;

// Enable CORS
app.use(cors());
app.use(express.json());

// Store active connections
const activeConnections = new Map();
const conflictHistory = [];

// Proxy middleware to forward requests to the main API
const apiProxy = httpProxy.createProxyMiddleware({
  target: `http://localhost:${TARGET_API_PORT}`,
  changeOrigin: true,
  onProxyRes: (proxyRes, req, res) => {
    // Intercept conflict analysis responses
    if (req.path === '/lore/conflicts/analyze' && req.method === 'POST') {
      let body = '';
      proxyRes.on('data', (chunk) => {
        body += chunk;
      });
      proxyRes.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.result && result.result.conflictDetected) {
            // Broadcast conflict to all connected clients
            io.emit('conflict_detected', {
              event: req.body,
              result: result.result,
              timestamp: new Date().toISOString()
            });
            
            console.log('🚨 Real-time conflict detected and broadcasted');
          }
          
          // Always broadcast analysis result
          io.emit('conflict_analysis', {
            event: req.body,
            result: result.result,
            timestamp: new Date().toISOString()
          });
        } catch (e) {
          console.error('Error parsing conflict analysis response:', e);
        }
      });
    }
  }
});

// Simple proxy for conflict analysis
app.post('/lore/conflicts/analyze', async (req, res) => {
  try {
    const axios = require('axios');
    const response = await axios.post(`http://localhost:${TARGET_API_PORT}/lore/conflicts/analyze`, req.body);
    
    // Check if conflict detected and broadcast
    if (response.data.result && response.data.result.conflictDetected) {
      io.emit('conflict_detected', {
        event: req.body,
        result: response.data.result,
        timestamp: new Date().toISOString()
      });
      
      console.log('🚨 Real-time conflict detected and broadcasted');
    }
    
    // Always broadcast analysis result
    io.emit('conflict_analysis', {
      event: req.body,
      result: response.data.result,
      timestamp: new Date().toISOString()
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ error: 'Proxy error' });
  }
});

// Route other requests to the main server
app.use('/lore/conflicts', apiProxy);
app.use('/health', apiProxy);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Lore Real-Time Conflict Detection Proxy',
    version: '1.0.0',
    realtime: true,
    websocket: true,
    proxy_target: `http://localhost:${TARGET_API_PORT}`,
    endpoints: {
      health: '/health',
      conflicts: {
        analyze: '/lore/conflicts/analyze',
        history: '/lore/conflicts/history',
        stats: '/lore/conflicts/stats',
        health: '/lore/conflicts/health'
      },
      websocket: {
        events: ['conflict_detected', 'conflict_analysis', 'system_status'],
        connection: `ws://localhost:${PORT}`
      }
    }
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  const clientId = socket.id;
  console.log(`🔌 Real-time client connected: ${clientId}`);
  
  activeConnections.set(clientId, {
    socket,
    connectedAt: new Date().toISOString(),
    eventsReceived: 0
  });
  
  // Send connection acknowledgment
  socket.emit('connected', {
    clientId,
    timestamp: new Date().toISOString(),
    conflictsInHistory: conflictHistory.length,
    message: 'Connected to real-time conflict detection proxy'
  });
  
  // Handle subscription to specific channels
  socket.on('subscribe', (data) => {
    const { channels } = data;
    console.log(`📡 Client ${clientId} subscribed to channels:`, channels);
    
    channels.forEach(channel => {
      socket.join(channel);
    });
    
    socket.emit('subscribed', { channels, timestamp: new Date().toISOString() });
  });
  
  // Handle client requests for conflict history
  socket.on('get_conflicts', (data) => {
    socket.emit('conflict_history', {
      conflicts: conflictHistory.slice(-50),
      total: conflictHistory.length,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`🔌 Real-time client disconnected: ${clientId}`);
    activeConnections.delete(clientId);
  });
});

// Broadcast system status every 30 seconds
setInterval(() => {
  io.emit('system_status', {
    timestamp: new Date().toISOString(),
    connections: activeConnections.size,
    conflicts_detected: conflictHistory.length,
    uptime: process.uptime()
  });
}, 30000);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Real-Time Conflict Detection Proxy running on port ${PORT}`);
  console.log(`📡 Proxying to main API on port ${TARGET_API_PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`⚡ Real-time conflict detection active`);
});
