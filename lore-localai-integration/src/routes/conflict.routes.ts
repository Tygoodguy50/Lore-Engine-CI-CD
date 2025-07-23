import { Router } from 'express';
import { ConflictController } from '../controllers/conflict.controller';

const router = Router();
const conflictController = new ConflictController();

// POST /lore/conflicts/analyze - Analyze lore event for conflicts
router.post('/analyze', conflictController.analyzeConflict.bind(conflictController));

// GET /lore/conflicts/history - Get conflict history
router.get('/history', conflictController.getHistory.bind(conflictController));

// GET /lore/conflicts/stats - Get conflict statistics
router.get('/stats', conflictController.getStatistics.bind(conflictController));

// GET /lore/conflicts/health - Health check
router.get('/health', conflictController.healthCheck.bind(conflictController));

export default router;
