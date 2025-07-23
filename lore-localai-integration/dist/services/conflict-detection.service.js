"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictDetectionService = void 0;
const logger_1 = require("../utils/logger");
const config_1 = require("../config");
class ConflictDetectionService {
    constructor() {
        this.conflictHistory = [];
        this.escalationConfigs = [];
        this.routeConfig = {
            discord: { enabled: false },
            tiktok: { enabled: false },
            langchain: { enabled: false }
        };
        this.initializeEscalationConfigs();
        this.initializeRouteConfig();
    }
    async analyzeEvent(event) {
        logger_1.logger.info(`Analyzing event: ${event.type}`, {
            sessionId: event.sessionId,
            priority: event.priority,
            cursedLevel: event.cursedLevel
        });
        const analysis = await this.performConflictAnalysis(event);
        if (analysis.escalationRequired) {
            await this.escalateConflict(event, analysis);
        }
        await this.storeConflictHistory(event, analysis);
        return analysis;
    }
    async performConflictAnalysis(event) {
        const conflicts = await this.detectConflicts(event);
        const severity = this.calculateSeverity(event, conflicts);
        const escalationRequired = this.shouldEscalate(event, severity);
        return {
            conflictDetected: conflicts.length > 0,
            conflictType: conflicts.length > 0 ? conflicts[0].type : undefined,
            severity,
            analysis: this.generateAnalysis(event, conflicts),
            confidence: this.calculateConfidence(conflicts),
            recommendations: this.generateRecommendations(conflicts),
            relatedEvents: this.findRelatedEvents(event),
            escalationRequired,
            escalationChannels: escalationRequired ? this.getEscalationChannels(event) : [],
            timestamp: new Date()
        };
    }
    async detectConflicts(event) {
        const conflicts = [];
        if (event.metadata?.location) {
            const locationConflicts = await this.detectLocationConflicts(event);
            conflicts.push(...locationConflicts);
        }
        if (event.metadata?.timeline || event.timestamp) {
            const timelineConflicts = await this.detectTimelineConflicts(event);
            conflicts.push(...timelineConflicts);
        }
        if (event.metadata?.character) {
            const characterConflicts = await this.detectCharacterConflicts(event);
            conflicts.push(...characterConflicts);
        }
        if (event.cursedLevel >= 8) {
            conflicts.push({
                type: 'cursed_escalation',
                severity: 'high',
                description: `High cursed level detected: ${event.cursedLevel}`
            });
        }
        if (event.content.toLowerCase().includes('reality') && event.content.toLowerCase().includes('fractur')) {
            conflicts.push({
                type: 'reality_fracture',
                severity: 'critical',
                description: 'Reality fracture detected in content'
            });
        }
        return conflicts;
    }
    calculateSeverity(event, conflicts) {
        if (conflicts.some(c => c.severity === 'critical') || event.cursedLevel >= 9) {
            return 'critical';
        }
        if (conflicts.some(c => c.severity === 'high') || event.cursedLevel >= 7) {
            return 'high';
        }
        if (conflicts.some(c => c.severity === 'medium') || event.cursedLevel >= 5) {
            return 'medium';
        }
        return 'low';
    }
    shouldEscalate(event, severity) {
        return event.priority >= 8 || event.cursedLevel >= 8 || severity === 'critical';
    }
    getEscalationChannels(event) {
        const channels = [];
        if (event.priority >= 9 || event.cursedLevel >= 9) {
            channels.push('discord', 'tiktok', 'langchain');
        }
        else if (event.priority >= 8 || event.cursedLevel >= 8) {
            channels.push('discord', 'langchain');
        }
        else if (event.priority >= 7) {
            channels.push('discord');
        }
        return channels;
    }
    async escalateConflict(event, analysis) {
        logger_1.logger.warn(`Escalating conflict: ${analysis.conflictType}`, {
            severity: analysis.severity,
            channels: analysis.escalationChannels
        });
        for (const channel of analysis.escalationChannels) {
            try {
                await this.routeToChannel(channel, event, analysis);
            }
            catch (error) {
                logger_1.logger.error(`Failed to escalate to ${channel}:`, error);
            }
        }
    }
    async routeToChannel(channel, event, analysis) {
        switch (channel) {
            case 'discord':
                await this.routeToDiscord(event, analysis);
                break;
            case 'tiktok':
                await this.routeToTikTok(event, analysis);
                break;
            case 'langchain':
                await this.routeToLangChain(event, analysis);
                break;
            default:
                logger_1.logger.warn(`Unknown escalation channel: ${channel}`);
        }
    }
    async routeToDiscord(event, analysis) {
        if (!this.routeConfig.discord.enabled) {
            logger_1.logger.info('Discord routing disabled');
            return;
        }
        logger_1.logger.info('Routing conflict to Discord', {
            conflictType: analysis.conflictType,
            severity: analysis.severity
        });
    }
    async routeToTikTok(event, analysis) {
        if (!this.routeConfig.tiktok.enabled) {
            logger_1.logger.info('TikTok routing disabled');
            return;
        }
        logger_1.logger.info('Routing conflict to TikTok', {
            conflictType: analysis.conflictType,
            severity: analysis.severity
        });
    }
    async routeToLangChain(event, analysis) {
        if (!this.routeConfig.langchain.enabled) {
            logger_1.logger.info('LangChain routing disabled');
            return;
        }
        logger_1.logger.info('Routing conflict to LangChain', {
            conflictType: analysis.conflictType,
            severity: analysis.severity
        });
    }
    async getConflictHistory(limit = 50, offset = 0) {
        return this.conflictHistory.slice(offset, offset + limit);
    }
    async getConflictStatistics() {
        const totalConflicts = this.conflictHistory.length;
        const resolvedConflicts = this.conflictHistory.filter(h => h.resolved).length;
        const pendingConflicts = totalConflicts - resolvedConflicts;
        const conflictsByType = {};
        const conflictsBySeverity = {};
        this.conflictHistory.forEach(conflict => {
            conflictsByType[conflict.conflictType] = (conflictsByType[conflict.conflictType] || 0) + 1;
            conflictsBySeverity[conflict.severity] = (conflictsBySeverity[conflict.severity] || 0) + 1;
        });
        return {
            totalConflicts,
            resolvedConflicts,
            pendingConflicts,
            conflictsByType,
            conflictsBySeverity,
            averageResolutionTime: this.calculateAverageResolutionTime(),
            lastConflictDetected: this.conflictHistory.length > 0 ? this.conflictHistory[0].createdAt : undefined
        };
    }
    async getHealthStatus() {
        const components = {
            database: await this.checkDatabaseHealth(),
            redis: await this.checkRedisHealth(),
            localai: await this.checkLocalAIHealth(),
            discord: this.routeConfig.discord.enabled && !!this.routeConfig.discord.token,
            tiktok: this.routeConfig.tiktok.enabled && !!this.routeConfig.tiktok.webhookUrl,
            langchain: this.routeConfig.langchain.enabled && !!this.routeConfig.langchain.apiKey
        };
        const allHealthy = Object.values(components).every(Boolean);
        const someHealthy = Object.values(components).some(Boolean);
        return {
            healthy: allHealthy,
            status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
            components,
            uptime: process.uptime(),
            lastCheck: new Date()
        };
    }
    async detectLocationConflicts(event) {
        return [];
    }
    async detectTimelineConflicts(event) {
        return [];
    }
    async detectCharacterConflicts(event) {
        return [];
    }
    generateAnalysis(event, conflicts) {
        if (conflicts.length === 0) {
            return 'No conflicts detected in this lore event.';
        }
        return `${conflicts.length} conflict(s) detected: ${conflicts.map(c => c.description).join(', ')}`;
    }
    calculateConfidence(conflicts) {
        if (conflicts.length === 0)
            return 0.9;
        return Math.min(0.95, 0.6 + (conflicts.length * 0.1));
    }
    generateRecommendations(conflicts) {
        const recommendations = [];
        if (conflicts.some(c => c.type === 'location_contradiction')) {
            recommendations.push('Review location consistency in lore events');
        }
        if (conflicts.some(c => c.type === 'reality_fracture')) {
            recommendations.push('Immediate intervention required for reality stability');
        }
        if (conflicts.some(c => c.severity === 'critical')) {
            recommendations.push('Escalate to human moderators immediately');
        }
        return recommendations;
    }
    findRelatedEvents(event) {
        return [];
    }
    async storeConflictHistory(event, analysis) {
        if (analysis.conflictDetected) {
            const historyEntry = {
                id: `conflict_${Date.now()}`,
                eventId: event.sessionId,
                conflictType: analysis.conflictType || 'unknown',
                severity: analysis.severity,
                resolved: false,
                createdAt: new Date(),
                metadata: {
                    priority: event.priority,
                    cursedLevel: event.cursedLevel,
                    escalationChannels: analysis.escalationChannels
                }
            };
            this.conflictHistory.unshift(historyEntry);
        }
    }
    calculateAverageResolutionTime() {
        const resolved = this.conflictHistory.filter(h => h.resolved && h.resolvedAt);
        if (resolved.length === 0)
            return 0;
        const totalTime = resolved.reduce((sum, conflict) => {
            return sum + (conflict.resolvedAt.getTime() - conflict.createdAt.getTime());
        }, 0);
        return totalTime / resolved.length;
    }
    initializeEscalationConfigs() {
        this.escalationConfigs = [
            { priority: 10, cursedLevel: 10, channels: ['discord', 'tiktok', 'langchain'], immediate: true, requiresHuman: true },
            { priority: 9, cursedLevel: 9, channels: ['discord', 'tiktok'], immediate: true, requiresHuman: true },
            { priority: 8, cursedLevel: 8, channels: ['discord', 'langchain'], immediate: false, requiresHuman: false },
            { priority: 7, cursedLevel: 7, channels: ['discord'], immediate: false, requiresHuman: false }
        ];
    }
    initializeRouteConfig() {
        this.routeConfig = {
            discord: {
                enabled: !!config_1.integrationsConfig.discord.token,
                ...(config_1.integrationsConfig.discord.token && { token: config_1.integrationsConfig.discord.token }),
                ...(config_1.integrationsConfig.discord.webhookUrl && { webhookUrl: config_1.integrationsConfig.discord.webhookUrl })
            },
            tiktok: {
                enabled: !!config_1.integrationsConfig.tiktok.webhookUrl,
                ...(config_1.integrationsConfig.tiktok.webhookUrl && { webhookUrl: config_1.integrationsConfig.tiktok.webhookUrl }),
                ...(config_1.integrationsConfig.tiktok.apiKey && { apiKey: config_1.integrationsConfig.tiktok.apiKey })
            },
            langchain: {
                enabled: !!config_1.integrationsConfig.langchain.apiKey,
                ...(config_1.integrationsConfig.langchain.url && { apiUrl: config_1.integrationsConfig.langchain.url }),
                ...(config_1.integrationsConfig.langchain.apiKey && { apiKey: config_1.integrationsConfig.langchain.apiKey })
            }
        };
    }
    async checkDatabaseHealth() {
        return true;
    }
    async checkRedisHealth() {
        return true;
    }
    async checkLocalAIHealth() {
        return true;
    }
}
exports.ConflictDetectionService = ConflictDetectionService;
//# sourceMappingURL=conflict-detection.service.js.map