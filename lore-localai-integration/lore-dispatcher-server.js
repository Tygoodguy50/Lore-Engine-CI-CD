const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Port configuration for Lore Dispatcher
const PORT = process.env.LORE_DISPATCHER_PORT || 8084;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`🕸️ ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Dispatcher Statistics
let dispatcherStats = {
  TotalEvents: 0,
  SuccessfulDispatches: 0,
  FailedDispatches: 0,
  DiscordDispatches: 0,
  TikTokDispatches: 0,
  MarkdownDispatches: 0,
  N8NDispatches: 0,
  LastEventTime: new Date().toISOString()
};

// Event storage for tracking
let events = [];

// Helper function to process and dispatch events
function processLoreEvent(eventData, eventType) {
  try {
    // Update statistics
    dispatcherStats.TotalEvents++;
    dispatcherStats.LastEventTime = new Date().toISOString();

    // Create event object
    const event = {
      id: events.length + 1,
      type: eventType,
      timestamp: new Date().toISOString(),
      data: eventData,
      status: 'processed'
    };

    // Store event
    events.push(event);

    // Simulate dispatching to different platforms based on content and priority
    const dispatches = [];

    // Discord dispatch for high priority or cursed content
    if (eventData.priority >= 7 || eventData.cursed_level >= 7 || eventType === 'cursed') {
      dispatches.push('discord');
      dispatcherStats.DiscordDispatches++;
      console.log(`📱 Dispatching to Discord: ${eventType}`);
    }

    // TikTok dispatch for viral or reactive content
    if (eventData.priority >= 8 || eventType === 'reactive' || eventData.lore_level >= 8) {
      dispatches.push('tiktok');
      dispatcherStats.TikTokDispatches++;
      console.log(`🎬 Dispatching to TikTok: ${eventType}`);
    }

    // Markdown dispatch for documentation
    if (eventData.lore_level >= 6) {
      dispatches.push('markdown');
      dispatcherStats.MarkdownDispatches++;
      console.log(`📝 Dispatching to Markdown: ${eventType}`);
    }

    // n8n dispatch for automation workflows
    if (eventData.priority >= 9 || eventData.metadata?.trigger_type) {
      dispatches.push('n8n');
      dispatcherStats.N8NDispatches++;
      console.log(`🔗 Dispatching to n8n: ${eventType}`);
    }

    // Broadcast real-time event via WebSocket
    io.emit('lore_event', {
      event: event,
      dispatches: dispatches,
      timestamp: new Date().toISOString()
    });

    dispatcherStats.SuccessfulDispatches++;

    console.log(`✅ Successfully processed ${eventType} event (ID: ${event.id})`);
    console.log(`📊 Dispatched to: ${dispatches.join(', ')}`);

    return {
      success: true,
      event_id: event.id,
      dispatches: dispatches,
      message: `${eventType} event processed and dispatched successfully`
    };

  } catch (error) {
    dispatcherStats.FailedDispatches++;
    console.error(`❌ Failed to process ${eventType} event:`, error);
    
    return {
      success: false,
      error: error.message,
      message: `Failed to process ${eventType} event`
    };
  }
}

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'lore-dispatcher-system',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Lore Response Endpoint
app.post('/lore/response', (req, res) => {
  console.log('🎭 Processing Lore Response...');
  const result = processLoreEvent(req.body, 'lore_response');
  
  if (result.success) {
    res.status(200).json({
      status: 'success',
      message: 'Lore response dispatched successfully',
      event_id: result.event_id,
      dispatches: result.dispatches
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: result.message,
      error: result.error
    });
  }
});

// Cursed Output Endpoint
app.post('/lore/cursed', (req, res) => {
  console.log('👹 Processing Cursed Output...');
  const result = processLoreEvent(req.body, 'cursed_output');
  
  if (result.success) {
    res.status(200).json({
      status: 'success',
      message: 'Cursed output dispatched successfully',
      event_id: result.event_id,
      dispatches: result.dispatches
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: result.message,
      error: result.error
    });
  }
});

// Reactive Dialogue Endpoint
app.post('/lore/reactive', (req, res) => {
  console.log('💬 Processing Reactive Dialogue...');
  const result = processLoreEvent(req.body, 'reactive_dialogue');
  
  if (result.success) {
    res.status(200).json({
      status: 'success',
      message: 'Reactive dialogue dispatched successfully',
      event_id: result.event_id,
      dispatches: result.dispatches
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: result.message,
      error: result.error
    });
  }
});

// Statistics Endpoint
app.get('/lore/stats', (req, res) => {
  console.log('📊 Retrieving Dispatcher Statistics...');
  res.json(dispatcherStats);
});

// Events History Endpoint
app.get('/lore/events', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  
  const eventHistory = events
    .slice(offset, offset + limit)
    .map(event => ({
      id: event.id,
      type: event.type,
      timestamp: event.timestamp,
      status: event.status,
      content_preview: event.data.content ? event.data.content.substring(0, 100) + '...' : 'N/A'
    }));

  res.json({
    events: eventHistory,
    total: events.length,
    offset: offset,
    limit: limit
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected to Lore Dispatcher real-time feed');
  
  socket.emit('connection_established', {
    message: 'Connected to Lore Dispatcher System',
    timestamp: new Date().toISOString(),
    stats: dispatcherStats
  });

  socket.on('get_stats', () => {
    socket.emit('stats_update', dispatcherStats);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected from Lore Dispatcher real-time feed');
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: err.message
  });
});

// Start server
server.listen(PORT, () => {
  console.log('🕸️ Lore Dispatcher System - Production Server');
  console.log('================================================================================');
  console.log(`🌐 Server running on port ${PORT}`);
  console.log('🎭 Lore Response Processing: ACTIVE');
  console.log('👹 Cursed Output Processing: ACTIVE');
  console.log('💬 Reactive Dialogue Processing: ACTIVE');
  console.log('📡 Real-time WebSocket Support: ENABLED');
  console.log('🎯 API Endpoints:');
  console.log(`   • Health: http://localhost:${PORT}/health`);
  console.log(`   • Lore Response: http://localhost:${PORT}/lore/response`);
  console.log(`   • Cursed Output: http://localhost:${PORT}/lore/cursed`);
  console.log(`   • Reactive Dialogue: http://localhost:${PORT}/lore/reactive`);
  console.log(`   • Statistics: http://localhost:${PORT}/lore/stats`);
  console.log(`   • Events History: http://localhost:${PORT}/lore/events`);
  console.log('================================================================================');
  console.log('🔄 Ready for multi-platform lore dispatching!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Lore Dispatcher Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Lore Dispatcher Server closed');
    process.exit(0);
  });
});
