"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const conflict_detection_service_1 = require("./services/conflict-detection.service");
const logger_1 = require("./utils/logger");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.REALTIME_PORT || 8080;
const conflictService = new conflict_detection_service_1.ConflictDetectionService();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const activeConnections = new Map();
const conflictHistory = [];
const eventStream = [];
app.post('/lore/conflicts/analyze', async (req, res) => {
    try {
        const event = req.body;
        logger_1.logger.info('Real-time conflict analysis requested', { event: event.type, priority: event.priority });
        eventStream.push(event);
        const result = await conflictService.analyzeEvent(event);
        if (result.conflictDetected) {
            conflictHistory.push(result);
            io.emit('conflict_detected', {
                event,
                result,
                timestamp: new Date().toISOString()
            });
            logger_1.logger.warn('Real-time conflict detected and broadcasted', {
                type: result.conflictType,
                severity: result.severity,
                channels: result.escalationChannels
            });
        }
        io.emit('conflict_analysis', {
            event,
            result,
            timestamp: new Date().toISOString()
        });
        res.json({
            status: 'success',
            result
        });
    }
    catch (error) {
        logger_1.logger.error('Real-time conflict analysis failed', { error: error.message });
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
    }
    catch (error) {
        logger_1.logger.error('Failed to get conflict statistics', { error: error.message });
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
    }
    catch (error) {
        logger_1.logger.error('Health check failed', { error: error.message });
        res.status(500).json({
            healthy: false,
            status: 'error',
            error: error.message
        });
    }
});
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
io.on('connection', (socket) => {
    const clientId = socket.id;
    logger_1.logger.info('Real-time client connected', { clientId });
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
        logger_1.logger.info('Client subscribed to channels', { clientId, channels });
        channels.forEach((channel) => {
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
        logger_1.logger.info('Real-time client disconnected', { clientId });
        activeConnections.delete(clientId);
    });
    const connection = activeConnections.get(clientId);
    if (connection) {
        connection.eventsReceived++;
        activeConnections.set(clientId, connection);
    }
});
setInterval(() => {
    io.emit('system_status', {
        timestamp: new Date().toISOString(),
        connections: activeConnections.size,
        conflicts_detected: conflictHistory.length,
        events_processed: eventStream.length,
        uptime: process.uptime()
    });
}, 30000);
setInterval(() => {
    if (eventStream.length > 1000) {
        eventStream.splice(0, eventStream.length - 1000);
    }
    if (conflictHistory.length > 500) {
        conflictHistory.splice(0, conflictHistory.length - 500);
    }
}, 60000);
server.listen(PORT, () => {
    logger_1.logger.info(`🚀 Real-Time Conflict Detection server running on port ${PORT}`);
    logger_1.logger.info(`📊 Health check: http://localhost:${PORT}/health`);
    logger_1.logger.info(`🔌 WebSocket: ws://localhost:${PORT}`);
    logger_1.logger.info(`⚡ Real-time conflict detection active`);
});
exports.default = app;
//# sourceMappingURL=realtime-server.js.map