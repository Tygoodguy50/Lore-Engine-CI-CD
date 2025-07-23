export interface EscalationRule {
    priority: number;
    cursedLevel: number;
    channels: string[];
    immediate: boolean;
    requiresHuman: boolean;
}
export interface EscalationConfig {
    discord: {
        enabled: boolean;
        webhookUrl?: string | undefined;
        token?: string | undefined;
    };
    tiktok: {
        enabled: boolean;
        webhookUrl?: string | undefined;
        apiKey?: string | undefined;
    };
    langchain: {
        enabled: boolean;
        apiUrl?: string | undefined;
        apiKey?: string | undefined;
    };
}
export interface LoreEvent {
    type: string;
    content: string;
    timestamp: Date;
    source: string;
    priority: number;
    tags: string[];
    userId: string;
    channelId: string;
    loreLevel: number;
    sentiment: number;
    cursedLevel: number;
    sessionId: string;
    sessionEventCount: number;
    metadata: Record<string, any>;
}
export interface ConflictAnalysisResult {
    conflictDetected: boolean;
    conflictType?: string | undefined;
    severity: 'low' | 'medium' | 'high' | 'critical';
    analysis: string;
    confidence: number;
    recommendations: string[];
    relatedEvents: string[];
    escalationRequired: boolean;
    escalationChannels: string[];
    timestamp: Date;
}
export interface ConflictHistory {
    id: string;
    eventId: string;
    conflictType: string;
    severity: string;
    resolved: boolean;
    resolvedAt?: Date;
    createdAt: Date;
    metadata: Record<string, any>;
}
export interface ConflictStatistics {
    totalConflicts: number;
    resolvedConflicts: number;
    pendingConflicts: number;
    conflictsByType: Record<string, number>;
    conflictsBySeverity: Record<string, number>;
    averageResolutionTime: number;
    lastConflictDetected?: Date | undefined;
}
export interface HealthStatus {
    healthy: boolean;
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: {
        database: boolean;
        redis: boolean;
        localai: boolean;
        discord: boolean;
        tiktok: boolean;
        langchain: boolean;
    };
    uptime: number;
    lastCheck: Date;
}
export interface EscalationConfig {
    priority: number;
    cursedLevel: number;
    channels: string[];
    immediate: boolean;
    requiresHuman: boolean;
}
export interface RouteConfig {
    discord: {
        enabled: boolean;
        webhookUrl?: string;
        token?: string;
    };
    tiktok: {
        enabled: boolean;
        webhookUrl?: string;
        apiKey?: string;
    };
    langchain: {
        enabled: boolean;
        apiUrl?: string;
        apiKey?: string;
    };
}
//# sourceMappingURL=lore-types.d.ts.map