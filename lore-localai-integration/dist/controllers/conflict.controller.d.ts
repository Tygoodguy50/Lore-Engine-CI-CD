import { Request, Response } from 'express';
export declare class ConflictController {
    private conflictService;
    constructor();
    analyzeConflict(req: Request, res: Response): Promise<void>;
    getHistory(req: Request, res: Response): Promise<void>;
    getStatistics(req: Request, res: Response): Promise<void>;
    healthCheck(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=conflict.controller.d.ts.map