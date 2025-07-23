"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const conflict_controller_1 = require("../controllers/conflict.controller");
const router = (0, express_1.Router)();
const conflictController = new conflict_controller_1.ConflictController();
router.post('/analyze', conflictController.analyzeConflict.bind(conflictController));
router.get('/history', conflictController.getHistory.bind(conflictController));
router.get('/stats', conflictController.getStatistics.bind(conflictController));
router.get('/health', conflictController.healthCheck.bind(conflictController));
exports.default = router;
//# sourceMappingURL=conflict.routes.js.map