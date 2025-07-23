import { Request, Response } from 'express';
import { LoreEvent, ConflictAnalysisResult } from '../types/lore-types';
import { ConflictDetectionService } from '../services/conflict-detection.service';
import { logger } from '../utils/logger';

export class ConflictController {
  private conflictService: ConflictDetectionService;

  constructor() {
    this.conflictService = new ConflictDetectionService();
  }

  /**
   * Analyze a lore event for conflicts
   * POST /lore/conflicts/analyze
   */
  async analyzeConflict(req: Request, res: Response): Promise<void> {
    try {
      const event: LoreEvent = req.body;
      
      // Validate input
      if (!event || !event.content || !event.type) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid lore event data'
        });
        return;
      }

      logger.info(`Analyzing conflict for event: ${event.type}`, {
        eventId: event.sessionId,
        priority: event.priority,
        cursedLevel: event.cursedLevel
      });

      // Perform conflict analysis
      const result = await this.conflictService.analyzeEvent(event);

      res.json({
        status: 'success',
        result: result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error in conflict analysis:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error during conflict analysis'
      });
    }
  }

  /**
   * Get conflict history
   * GET /lore/conflicts/history
   */
  async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 50, offset = 0 } = req.query;
      
      const history = await this.conflictService.getConflictHistory(
        Number(limit),
        Number(offset)
      );

      res.json({
        status: 'success',
        data: history,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error retrieving conflict history:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve conflict history'
      });
    }
  }

  /**
   * Get conflict statistics
   * GET /lore/conflicts/stats
   */
  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.conflictService.getConflictStatistics();

      res.json({
        status: 'success',
        data: stats,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error retrieving conflict statistics:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve conflict statistics'
      });
    }
  }

  /**
   * Health check for conflict detection system
   * GET /lore/conflicts/health
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const health = await this.conflictService.getHealthStatus();

      res.json({
        healthy: health.healthy,
        status: health.status,
        components: health.components,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error in conflict system health check:', error);
      res.status(500).json({
        healthy: false,
        status: 'error',
        message: 'Health check failed'
      });
    }
  }
}
