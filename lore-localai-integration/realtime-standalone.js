const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.REALTIME_PORT || 8082;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Store data
const activeConnections = new Map();
const conflictHistory = [];
const eventHistory = [];

// Simple conflict detection logic
function analyzeConflict(event) {
  const result = {
    conflictDetected: false,
    conflictType: undefined,
    severity: 'low',
    analysis: 'No conflicts detected',
    confidence: 0.1,
    recommendations: [],
    relatedEvents: [],
    escalationRequired: false,
    escalationChannels: [],
    timestamp: new Date()
  };

  // Check for high priority/cursed level
  if (event.priority >= 9 || event.cursedLevel >= 9) {
    result.conflictDetected = true;
    result.conflictType = 'high_priority_event';
    result.severity = 'critical';
    result.analysis = `High priority event detected with priority ${event.priority} and cursed level ${event.cursedLevel}`;
    result.confidence = 0.9;
    result.escalationRequired = true;
    result.escalationChannels = ['discord', 'tiktok', 'langchain'];
    result.recommendations = ['Immediate escalation required', 'Multi-channel notification'];
  } else if (event.priority >= 7 || event.cursedLevel >= 7) {
    result.conflictDetected = true;
    result.conflictType = 'medium_priority_event';
    result.severity = 'medium';
    result.analysis = `Medium priority event detected with priority ${event.priority} and cursed level ${event.cursedLevel}`;
    result.confidence = 0.7;
    result.escalationRequired = true;
    result.escalationChannels = ['discord'];
    result.recommendations = ['Monitor for escalation', 'Discord notification'];
  }

  // Check for location conflicts
  if (event.content && event.content.includes('multiple locations')) {
    result.conflictDetected = true;
    result.conflictType = 'location_conflict';
    result.severity = 'high';
    result.analysis = 'Multiple location conflict detected in content';
    result.confidence = 0.8;
    result.escalationRequired = true;
    result.escalationChannels = ['discord', 'langchain'];
    result.recommendations = ['Investigate location inconsistencies', 'Cross-reference with lore database'];
  }

  // Check for contradiction keywords
  const contradictionKeywords = ['cannot', 'impossible', 'contradiction', 'fracturing', 'breaking'];
  if (contradictionKeywords.some(keyword => event.content.toLowerCase().includes(keyword))) {
    result.conflictDetected = true;
    result.conflictType = 'contradiction_detected';
    result.severity = 'high';
    result.analysis = 'Contradiction detected in event content';
    result.confidence = 0.75;
    result.escalationRequired = true;
    result.escalationChannels = ['discord', 'langchain'];
    result.recommendations = ['Resolve contradiction', 'Update lore consistency'];
  }

  return result;
}

// API Endpoints
app.post('/lore/conflicts/analyze', (req, res) => {
  try {
    const event = req.body;
    console.log(`📊 Analyzing conflict for event: ${event.type} (priority: ${event.priority})`);
    
    // Store event
    eventHistory.push(event);
    
    // Analyze conflict
    const result = analyzeConflict(event);
    
    // Store in history if conflict detected
    if (result.conflictDetected) {
      conflictHistory.push(result);
      
      // Broadcast to all connected clients
      io.emit('conflict_detected', {
        event,
        result,
        timestamp: new Date().toISOString()
      });
      
      console.log(`🚨 Conflict detected: ${result.conflictType} (${result.severity})`);
    }
    
    // Always broadcast analysis result
    io.emit('conflict_analysis', {
      event,
      result,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      status: 'success',
      result
    });
    
  } catch (error) {
    console.error('Conflict analysis error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Conflict analysis failed'
    });
  }
});

app.get('/lore/conflicts/history', (req, res) => {
  res.json({
    status: 'success',
    data: conflictHistory,
    timestamp: new Date().toISOString()
  });
});

app.get('/lore/conflicts/stats', (req, res) => {
  const stats = {
    totalConflicts: conflictHistory.length,
    resolvedConflicts: conflictHistory.filter(c => c.resolved).length,
    pendingConflicts: conflictHistory.filter(c => !c.resolved).length,
    conflictsByType: {},
    conflictsBySeverity: {
      low: conflictHistory.filter(c => c.severity === 'low').length,
      medium: conflictHistory.filter(c => c.severity === 'medium').length,
      high: conflictHistory.filter(c => c.severity === 'high').length,
      critical: conflictHistory.filter(c => c.severity === 'critical').length
    },
    averageResolutionTime: 0,
    lastConflictDetected: conflictHistory.length > 0 ? conflictHistory[conflictHistory.length - 1].timestamp : null
  };
  
  // Count by type
  conflictHistory.forEach(conflict => {
    if (conflict.conflictType) {
      stats.conflictsByType[conflict.conflictType] = (stats.conflictsByType[conflict.conflictType] || 0) + 1;
    }
  });
  
  res.json({
    status: 'success',
    data: stats
  });
});

app.get('/lore/conflicts/health', (req, res) => {
  res.json({
    healthy: true,
    status: 'healthy',
    components: {
      websocket: true,
      analysis: true,
      storage: true
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'lore-realtime-conflict-detection',
    version: '1.0.0',
    connections: activeConnections.size,
    conflicts_detected: conflictHistory.length,
    events_processed: eventHistory.length
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Lore Real-Time Conflict Detection API',
    version: '1.0.0',
    realtime: true,
    websocket: true,
    port: PORT,
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

// WebSocket handling
io.on('connection', (socket) => {
  const clientId = socket.id;
  console.log(`🔌 Real-time client connected: ${clientId}`);
  
  activeConnections.set(clientId, {
    socket,
    connectedAt: new Date().toISOString(),
    eventsReceived: 0
  });
  
  socket.emit('connected', {
    clientId,
    timestamp: new Date().toISOString(),
    conflictsInHistory: conflictHistory.length,
    message: 'Connected to real-time conflict detection'
  });
  
  socket.on('subscribe', (data) => {
    const { channels } = data;
    console.log(`📡 Client ${clientId} subscribed to channels:`, channels);
    
    channels.forEach(channel => {
      socket.join(channel);
    });
    
    socket.emit('subscribed', { channels, timestamp: new Date().toISOString() });
  });
  
  socket.on('get_conflicts', (data) => {
    socket.emit('conflict_history', {
      conflicts: conflictHistory.slice(-50),
      total: conflictHistory.length,
      timestamp: new Date().toISOString()
    });
  });
  
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
    events_processed: eventHistory.length,
    uptime: process.uptime()
  });
}, 30000);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Real-Time Conflict Detection server running on port ${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`⚡ Real-time conflict detection active`);
  console.log(`📡 Ready to analyze lore conflicts in real-time`);
});
