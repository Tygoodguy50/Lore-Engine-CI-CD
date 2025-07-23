"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictController = void 0;
const conflict_detection_service_1 = require("../services/conflict-detection.service");
const logger_1 = require("../utils/logger");
class ConflictController {
    constructor() {
        this.conflictService = new conflict_detection_service_1.ConflictDetectionService();
    }
    async analyzeConflict(req, res) {
        try {
            const event = req.body;
            if (!event || !event.content || !event.type) {
                res.status(400).json({
                    status: 'error',
                    message: 'Invalid lore event data'
                });
                return;
            }
            logger_1.logger.info(`Analyzing conflict for event: ${event.type}`, {
                eventId: event.sessionId,
                priority: event.priority,
                cursedLevel: event.cursedLevel
            });
            const result = await this.conflictService.analyzeEvent(event);
            res.json({
                status: 'success',
                result: result,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            logger_1.logger.error('Error in conflict analysis:', error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error during conflict analysis'
            });
        }
    }
    async getHistory(req, res) {
        try {
            const { limit = 50, offset = 0 } = req.query;
            const history = await this.conflictService.getConflictHistory(Number(limit), Number(offset));
            res.json({
                status: 'success',
                data: history,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            logger_1.logger.error('Error retrieving conflict history:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to retrieve conflict history'
            });
        }
    }
    async getStatistics(req, res) {
        try {
            const stats = await this.conflictService.getConflictStatistics();
            res.json({
                status: 'success',
                data: stats,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            logger_1.logger.error('Error retrieving conflict statistics:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to retrieve conflict statistics'
            });
        }
    }
    async healthCheck(req, res) {
        try {
            const health = await this.conflictService.getHealthStatus();
            res.json({
                healthy: health.healthy,
                status: health.status,
                components: health.components,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            logger_1.logger.error('Error in conflict system health check:', error);
            res.status(500).json({
                healthy: false,
                status: 'error',
                message: 'Health check failed'
            });
        }
    }
}
exports.ConflictController = ConflictController;
//# sourceMappingURL=conflict.controller.js.map