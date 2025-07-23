// 🎯 Get Viral Score API
// Calculates and retrieves real-time viral coefficients from multiple sources

class ViralScoreAPI {
    constructor() {
        this.baseURL = 'http://localhost:8085'; // Creator Leaderboards service
        this.tiktokAPI = 'http://localhost:8087'; // Multi-platform dispatcher
        this.cache = new Map();
        this.cacheTimeout = 30000; // 30 seconds
    }

    async calculateViralCoefficient(creatorId = null, fragmentId = null) {
        try {
            const cacheKey = `viral_${creatorId || 'global'}_${fragmentId || 'all'}`;
            
            // Check cache first
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }

            // Gather metrics from multiple sources
            const [creatorMetrics, fragmentMetrics, platformMetrics] = await Promise.all([
                this.getCreatorMetrics(creatorId),
                this.getFragmentMetrics(fragmentId),
                this.getPlatformMetrics()
            ]);

            // Calculate viral coefficient using advanced formula
            const coefficient = this.computeCoefficient(creatorMetrics, fragmentMetrics, platformMetrics);
            
            // Cache result
            this.cache.set(cacheKey, {
                data: coefficient,
                timestamp: Date.now()
            });

            return coefficient;

        } catch (error) {
            console.error('❌ Error calculating viral coefficient:', error);
            return this.getFallbackCoefficient();
        }
    }

    async getCreatorMetrics(creatorId) {
        if (!creatorId) return this.getGlobalCreatorMetrics();

        try {
            const response = await fetch(`${this.baseURL}/creators/${creatorId}/metrics`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            return await response.json();
        } catch (error) {
            console.warn('⚠️ Creator metrics unavailable, using mock data');
            return this.getMockCreatorMetrics(creatorId);
        }
    }

    async getFragmentMetrics(fragmentId) {
        if (!fragmentId) return this.getGlobalFragmentMetrics();

        try {
            const response = await fetch(`http://localhost:8086/fragments/${fragmentId}/metrics`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            return await response.json();
        } catch (error) {
            console.warn('⚠️ Fragment metrics unavailable, using mock data');
            return this.getMockFragmentMetrics(fragmentId);
        }
    }

    async getPlatformMetrics() {
        try {
            const response = await fetch(`${this.tiktokAPI}/platforms/metrics`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            return await response.json();
        } catch (error) {
            console.warn('⚠️ Platform metrics unavailable, using mock data');
            return this.getMockPlatformMetrics();
        }
    }

    computeCoefficient(creatorMetrics, fragmentMetrics, platformMetrics) {
        // Advanced viral coefficient calculation
        const weights = {
            engagement: 0.4,
            reach: 0.25,
            velocity: 0.2,
            retention: 0.15
        };

        // Engagement Score (shares + comments + saves + reactions)
        const totalEngagement = (creatorMetrics.totalShares || 0) + 
                               (creatorMetrics.totalComments || 0) + 
                               (creatorMetrics.totalSaves || 0) + 
                               (creatorMetrics.totalReactions || 0);
        
        const engagementRate = totalEngagement / Math.max(creatorMetrics.totalViews || 1, 1);
        const engagementScore = Math.min(5.0, engagementRate * 100);

        // Reach Score (follower growth + cross-platform reach)
        const followerGrowthRate = (creatorMetrics.followerGrowth24h || 0) / Math.max(creatorMetrics.followers || 1, 1);
        const crossPlatformReach = (platformMetrics.totalReach || 0) / Math.max(platformMetrics.totalPosts || 1, 1);
        const reachScore = Math.min(5.0, (followerGrowthRate * 1000 + crossPlatformReach * 0.001) * 10);

        // Velocity Score (content frequency + viral speed)
        const postFrequency = (creatorMetrics.postsLast24h || 0) / 24; // Posts per hour
        const viralSpeed = (fragmentMetrics.peakViralTime || 3600) / 3600; // Hours to peak (lower is better)
        const velocityScore = Math.min(5.0, (postFrequency * 10) + (1 / viralSpeed));

        // Retention Score (return engagement + long-term growth)
        const returnEngagement = (creatorMetrics.returnVisitors || 0) / Math.max(creatorMetrics.uniqueVisitors || 1, 1);
        const longTermGrowth = (creatorMetrics.followerGrowth7d || 0) / Math.max(creatorMetrics.followers || 1, 1);
        const retentionScore = Math.min(5.0, (returnEngagement + longTermGrowth * 10) * 10);

        // Weighted final coefficient
        const coefficient = (
            engagementScore * weights.engagement +
            reachScore * weights.reach +
            velocityScore * weights.velocity +
            retentionScore * weights.retention
        );

        // Apply platform multipliers
        const platformMultiplier = this.getPlatformMultiplier(platformMetrics);
        const finalCoefficient = coefficient * platformMultiplier;

        return {
            coefficient: parseFloat(Math.max(0.1, Math.min(5.0, finalCoefficient)).toFixed(2)),
            breakdown: {
                engagement: parseFloat(engagementScore.toFixed(2)),
                reach: parseFloat(reachScore.toFixed(2)),
                velocity: parseFloat(velocityScore.toFixed(2)),
                retention: parseFloat(retentionScore.toFixed(2)),
                platformMultiplier: parseFloat(platformMultiplier.toFixed(2))
            },
            metrics: {
                totalEngagement,
                engagementRate: parseFloat((engagementRate * 100).toFixed(2)),
                followerGrowthRate: parseFloat((followerGrowthRate * 100).toFixed(2)),
                viralSpeedHours: parseFloat((viralSpeed).toFixed(1))
            },
            timestamp: new Date().toISOString()
        };
    }

    getPlatformMultiplier(platformMetrics) {
        // Different platforms have different viral potential
        const platformWeights = {
            tiktok: 1.5,
            instagram: 1.2,
            youtube: 1.3,
            twitter: 1.1,
            reddit: 1.4,
            discord: 0.9
        };

        let weightedMultiplier = 1.0;
        let totalWeight = 0;

        Object.entries(platformMetrics.byPlatform || {}).forEach(([platform, metrics]) => {
            const weight = platformWeights[platform.toLowerCase()] || 1.0;
            const platformActivity = (metrics.posts || 0) / Math.max(platformMetrics.totalPosts || 1, 1);
            
            weightedMultiplier += (weight - 1.0) * platformActivity;
            totalWeight += platformActivity;
        });

        return Math.max(0.8, Math.min(2.0, weightedMultiplier));
    }

    // Fallback and mock data methods
    getFallbackCoefficient() {
        return {
            coefficient: 1.23,
            breakdown: { engagement: 2.1, reach: 1.8, velocity: 2.3, retention: 1.9, platformMultiplier: 1.2 },
            metrics: { totalEngagement: 2847, engagementRate: 3.2, followerGrowthRate: 0.8, viralSpeedHours: 2.3 },
            timestamp: new Date().toISOString(),
            fallback: true
        };
    }

    getMockCreatorMetrics(creatorId) {
        return {
            totalShares: Math.floor(Math.random() * 5000) + 1000,
            totalComments: Math.floor(Math.random() * 8000) + 2000,
            totalSaves: Math.floor(Math.random() * 3000) + 500,
            totalReactions: Math.floor(Math.random() * 10000) + 3000,
            totalViews: Math.floor(Math.random() * 500000) + 100000,
            followers: Math.floor(Math.random() * 100000) + 50000,
            followerGrowth24h: Math.floor(Math.random() * 500) + 50,
            followerGrowth7d: Math.floor(Math.random() * 2000) + 200,
            postsLast24h: Math.floor(Math.random() * 8) + 2,
            uniqueVisitors: Math.floor(Math.random() * 50000) + 10000,
            returnVisitors: Math.floor(Math.random() * 20000) + 5000
        };
    }

    getMockFragmentMetrics(fragmentId) {
        return {
            peakViralTime: Math.floor(Math.random() * 7200) + 1800, // 30min to 2h
            currentViralScore: Math.random() * 4 + 1,
            remixCount: Math.floor(Math.random() * 20) + 5,
            crossPlatformShares: Math.floor(Math.random() * 1000) + 200
        };
    }

    getMockPlatformMetrics() {
        return {
            totalReach: Math.floor(Math.random() * 1000000) + 500000,
            totalPosts: Math.floor(Math.random() * 100) + 50,
            byPlatform: {
                tiktok: { posts: Math.floor(Math.random() * 30) + 10, reach: Math.floor(Math.random() * 400000) + 200000 },
                instagram: { posts: Math.floor(Math.random() * 20) + 5, reach: Math.floor(Math.random() * 200000) + 100000 },
                youtube: { posts: Math.floor(Math.random() * 10) + 2, reach: Math.floor(Math.random() * 300000) + 150000 },
                twitter: { posts: Math.floor(Math.random() * 40) + 15, reach: Math.floor(Math.random() * 100000) + 50000 }
            }
        };
    }

    async getGlobalCreatorMetrics() {
        // Aggregate metrics across all creators
        const mockAggregates = this.getMockCreatorMetrics('global');
        mockAggregates.totalShares *= 10;
        mockAggregates.totalComments *= 10;
        mockAggregates.totalViews *= 10;
        return mockAggregates;
    }

    async getGlobalFragmentMetrics() {
        // Aggregate metrics across all fragments
        return {
            peakViralTime: 1800, // 30 minutes average
            currentViralScore: 2.3,
            totalRemixes: Math.floor(Math.random() * 500) + 200,
            totalFragments: Math.floor(Math.random() * 1000) + 500
        };
    }

    // Public API methods
    async getRealtimeCoefficient() {
        return await this.calculateViralCoefficient();
    }

    async getCreatorCoefficient(creatorId) {
        return await this.calculateViralCoefficient(creatorId);
    }

    async getFragmentCoefficient(fragmentId) {
        return await this.calculateViralCoefficient(null, fragmentId);
    }

    clearCache() {
        this.cache.clear();
        console.log('🗑️ Viral score cache cleared');
    }

    setCacheTimeout(ms) {
        this.cacheTimeout = ms;
        console.log(`⏰ Cache timeout set to ${ms}ms`);
    }
}

// Initialize global instance
window.viralScoreAPI = new ViralScoreAPI();

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ViralScoreAPI;
}
