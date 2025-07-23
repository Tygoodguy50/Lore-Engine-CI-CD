import { LoreEvent, ConflictAnalysisResult, ConflictHistory, ConflictStatistics, HealthStatus } from '../types/lore-types';
export declare class ConflictDetectionService {
    private conflictHistory;
    private escalationConfigs;
    private routeConfig;
    constructor();
    analyzeEvent(event: LoreEvent): Promise<ConflictAnalysisResult>;
    private performConflictAnalysis;
    private detectConflicts;
    private calculateSeverity;
    private shouldEscalate;
    private getEscalationChannels;
    private escalateConflict;
    private routeToChannel;
    private routeToDiscord;
    private routeToTikTok;
    private routeToLangChain;
    getConflictHistory(limit?: number, offset?: number): Promise<ConflictHistory[]>;
    getConflictStatistics(): Promise<ConflictStatistics>;
    getHealthStatus(): Promise<HealthStatus>;
    private detectLocationConflicts;
    private detectTimelineConflicts;
    private detectCharacterConflicts;
    private generateAnalysis;
    private calculateConfidence;
    private generateRecommendations;
    private findRelatedEvents;
    private storeConflictHistory;
    private calculateAverageResolutionTime;
    private initializeEscalationConfigs;
    private initializeRouteConfig;
    private checkDatabaseHealth;
    private checkRedisHealth;
    private checkLocalAIHealth;
}
//# sourceMappingURL=conflict-detection.service.d.ts.map