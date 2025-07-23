import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import our existing services
import { ConflictDetectionService } from './services/conflict-detection.service';
import { LoreEvent, ConflictAnalysisResult } from './types/lore-types';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.REALTIME_PORT || 8080;
const conflictService = new ConflictDetectionService();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store active connections and conflict history
const activeConnections = new Map<string, any>();
const conflictHistory: ConflictAnalysisResult[] = [];
const eventStream: LoreEvent[] = [];

// Real-time conflict detection endpoints
app.post('/lore/conflicts/analyze', async (req, res) => {
  try {
    const event: LoreEvent = req.body;
    logger.info('Real-time conflict analysis requested', { event: event.type, priority: event.priority });
    
    // Add to event stream
    eventStream.push(event);
    
    // Analyze for conflicts
    const result = await conflictService.analyzeEvent(event);
    
    // Store in history if conflict detected
    if (result.conflictDetected) {
      conflictHistory.push(result);
      
      // Broadcast to all connected clients
      io.emit('conflict_detected', {
        event,
        result,
        timestamp: new Date().toISOString()
      });
      
      logger.warn('Real-time conflict detected and broadcasted', {
        type: result.conflictType,
        severity: result.severity,
        channels: result.escalationChannels
      });
    }
    
    // Always broadcast the analysis result
    io.emit('conflict_analysis', {
      event,
      result,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      status: 'success',
      result
    });
    
  } catch (error: any) {
    logger.error('Real-time conflict analysis failed', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: 'Conflict analysis failed',
      error: error.message
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

app.get('/lore/conflicts/stats', async (req, res) => {
  try {
    const stats = await conflictService.getConflictStatistics();
    res.json({
      status: 'success',
      data: stats
    });
  } catch (error: any) {
    logger.error('Failed to get conflict statistics', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: 'Failed to get statistics'
    });
  }
});

app.get('/lore/conflicts/health', async (req, res) => {
  try {
    const health = await conflictService.getHealthStatus();
    res.json(health);
  } catch (error: any) {
    logger.error('Health check failed', { error: error.message });
    res.status(500).json({
      healthy: false,
      status: 'error',
      error: error.message
    });
  }
});

// General health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'lore-realtime-conflict-detection',
    version: '1.0.0',
    connections: activeConnections.size,
    conflicts_detected: conflictHistory.length,
    events_processed: eventStream.length
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Lore Real-Time Conflict Detection API',
    version: '1.0.0',
    realtime: true,
    websocket: true,
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
io.on('connection', (socket: any) => {
  const clientId = socket.id;
  logger.info('Real-time client connected', { clientId });
  
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
    message: 'Connected to real-time conflict detection'
  });
  
  // Handle subscription to specific channels
  socket.on('subscribe', (data: any) => {
    const { channels } = data;
    logger.info('Client subscribed to channels', { clientId, channels });
    
    channels.forEach((channel: string) => {
      socket.join(channel);
    });
    
    socket.emit('subscribed', { channels, timestamp: new Date().toISOString() });
  });
  
  // Handle client requests for conflict history
  socket.on('get_conflicts', (data: any) => {
    socket.emit('conflict_history', {
      conflicts: conflictHistory.slice(-50), // Last 50 conflicts
      total: conflictHistory.length,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle client disconnect
  socket.on('disconnect', () => {
    logger.info('Real-time client disconnected', { clientId });
    activeConnections.delete(clientId);
  });
  
  // Update client connection info
  const connection = activeConnections.get(clientId);
  if (connection) {
    connection.eventsReceived++;
    activeConnections.set(clientId, connection);
  }
});

// Real-time monitoring and background tasks
setInterval(() => {
  // Broadcast system status to all clients
  io.emit('system_status', {
    timestamp: new Date().toISOString(),
    connections: activeConnections.size,
    conflicts_detected: conflictHistory.length,
    events_processed: eventStream.length,
    uptime: process.uptime()
  });
}, 30000); // Every 30 seconds

// Cleanup old events (keep last 1000)
setInterval(() => {
  if (eventStream.length > 1000) {
    eventStream.splice(0, eventStream.length - 1000);
  }
  
  if (conflictHistory.length > 500) {
    conflictHistory.splice(0, conflictHistory.length - 500);
  }
}, 60000); // Every minute

// Start the real-time server
server.listen(PORT, () => {
  logger.info(`🚀 Real-Time Conflict Detection server running on port ${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`🔌 WebSocket: ws://localhost:${PORT}`);
  logger.info(`⚡ Real-time conflict detection active`);
});

export default app;
