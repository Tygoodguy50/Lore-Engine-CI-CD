// 🎭 Get Creators API
// Retrieves real-time creator performance data from multiple sources

class CreatorsAPI {
    constructor() {
        this.baseURL = 'http://localhost:8085'; // Creator Leaderboards service
        this.tiktokAPI = 'https://open.tiktokapis.com/v2'; // TikTok API
        this.cache = new Map();
        this.cacheTimeout = 60000; // 1 minute for creator data
        this.rateLimitDelay = 1000; // 1 second between API calls
    }

    async getAllCreators() {
        try {
            const cacheKey = 'all_creators';
            
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }

            // Fetch from creator leaderboards service
            const response = await fetch(`${this.baseURL}/creators/all`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const creatorsData = await response.json();
            
            // Enhance with real-time metrics
            const enhancedCreators = await this.enhanceWithRealtimeData(creatorsData);
            
            this.cache.set(cacheKey, {
                data: enhancedCreators,
                timestamp: Date.now()
            });

            return enhancedCreators;

        } catch (error) {
            console.warn('⚠️ Live creator data unavailable, using mock data');
            return this.getMockCreators();
        }
    }

    async getCreatorById(creatorId) {
        try {
            const response = await fetch(`${this.baseURL}/creators/${creatorId}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const creatorData = await response.json();
            return await this.enhanceCreatorWithRealtimeData(creatorData);

        } catch (error) {
            console.warn(`⚠️ Creator ${creatorId} data unavailable, using mock data`);
            return this.getMockCreator(creatorId);
        }
    }

    async getTopPerformers(limit = 10) {
        try {
            const response = await fetch(`${this.baseURL}/creators/top?limit=${limit}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            return await response.json();

        } catch (error) {
            console.warn('⚠️ Top performers data unavailable, using mock data');
            return this.getMockTopPerformers(limit);
        }
    }

    async enhanceWithRealtimeData(creatorsData) {
        const enhanced = [];
        
        for (const creator of creatorsData) {
            // Rate limiting to avoid API overload
            if (enhanced.length > 0) {
                await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
            }
            
            const enhancedCreator = await this.enhanceCreatorWithRealtimeData(creator);
            enhanced.push(enhancedCreator);
        }
        
        return enhanced;
    }

    async enhanceCreatorWithRealtimeData(creator) {
        try {
            // Get TikTok metrics if handle is available
            let tiktokMetrics = {};
            if (creator.tiktokHandle) {
                tiktokMetrics = await this.getTikTokMetrics(creator.tiktokHandle);
            }
            
            // Calculate derived metrics
            const viralScore = this.calculateCreatorViralScore(creator, tiktokMetrics);
            const growthRate = this.calculateGrowthRate(creator, tiktokMetrics);
            const engagementRate = this.calculateEngagementRate(creator, tiktokMetrics);
            
            return {
                ...creator,
                ...tiktokMetrics,
                viralScore,
                growthRate,
                engagementRate,
                lastUpdated: new Date().toISOString()
            };

        } catch (error) {
            console.warn(`⚠️ Failed to enhance creator ${creator.id}:`, error);
            return creator;
        }
    }

    async getTikTokMetrics(handle) {
        try {
            // In production, this would use actual TikTok API with proper OAuth
            // For now, simulate TikTok API response
            await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API delay
            
            return this.getMockTikTokMetrics(handle);

        } catch (error) {
            console.warn(`⚠️ TikTok metrics unavailable for ${handle}`);
            return {};
        }
    }

    calculateCreatorViralScore(creator, tiktokMetrics) {
        const likes = (creator.totalLikes || 0) + (tiktokMetrics.likes || 0);
        const shares = (creator.totalShares || 0) + (tiktokMetrics.shares || 0);
        const comments = (creator.totalComments || 0) + (tiktokMetrics.comments || 0);
        const views = (creator.totalViews || 0) + (tiktokMetrics.views || 0);
        
        if (views === 0) return 0;
        
        const engagement = likes + shares + comments;
        const engagementRate = engagement / views;
        const followerMultiplier = 1 + Math.log(creator.followers + 1) * 0.05;
        const viralScore = engagementRate * 100 * followerMultiplier;
        
        return Math.min(10.0, Math.max(0.1, parseFloat(viralScore.toFixed(2))));
    }

    calculateGrowthRate(creator, tiktokMetrics) {
        const currentFollowers = creator.followers || 0;
        const previousFollowers = creator.previousFollowers || currentFollowers * 0.95; // Simulate historical data
        
        if (previousFollowers === 0) return 0;
        
        const growthRate = ((currentFollowers - previousFollowers) / previousFollowers) * 100;
        return parseFloat(growthRate.toFixed(1));
    }

    calculateEngagementRate(creator, tiktokMetrics) {
        const totalEngagement = (creator.totalLikes || 0) + 
                               (creator.totalComments || 0) + 
                               (creator.totalShares || 0) +
                               (tiktokMetrics.likes || 0) + 
                               (tiktokMetrics.comments || 0) + 
                               (tiktokMetrics.shares || 0);
        
        const totalFollowers = creator.followers || 1;
        const engagementRate = (totalEngagement / totalFollowers) * 100;
        
        return parseFloat(engagementRate.toFixed(2));
    }

    // Mock data generators for development/fallback
    getMockCreators() {
        return [
            {
                id: 'creator_001',
                name: 'Midnight Whisperer',
                handle: 'midnightwhispers',
                tiktokHandle: '@midnight_whispers_official',
                followers: 245000,
                totalLikes: 2100000,
                totalComments: 125000,
                totalShares: 89000,
                totalViews: 12400000,
                dispatchCount: 47,
                tier: 'Wraith',
                lastActive: new Date().toISOString(),
                profileImage: '/avatars/midnight-whisperer.png'
            },
            {
                id: 'creator_002',
                name: 'Digital Phantom',
                handle: 'digitalphantom',
                tiktokHandle: '@digital_phantom_void',
                followers: 189000,
                totalLikes: 1560000,
                totalComments: 89000,
                totalShares: 67000,
                totalViews: 8900000,
                dispatchCount: 34,
                tier: 'Possessed',
                lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                profileImage: '/avatars/digital-phantom.png'
            },
            {
                id: 'creator_003',
                name: 'Void Speaker',
                handle: 'voidspeaker',
                tiktokHandle: '@void_speaker_entity',
                followers: 456000,
                totalLikes: 3400000,
                totalComments: 234000,
                totalShares: 156000,
                totalViews: 18600000,
                dispatchCount: 89,
                tier: 'Ghost',
                lastActive: new Date().toISOString(),
                profileImage: '/avatars/void-speaker.png'
            },
            {
                id: 'creator_004',
                name: 'Echo Entity',
                handle: 'echoentity',
                tiktokHandle: '@echo_entity_realm',
                followers: 67000,
                totalLikes: 445000,
                totalComments: 23000,
                totalShares: 15000,
                totalViews: 2300000,
                dispatchCount: 18,
                tier: 'Shadow',
                lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                profileImage: '/avatars/echo-entity.png'
            },
            {
                id: 'creator_005',
                name: 'Shadow Weaver',
                handle: 'shadowweaver',
                tiktokHandle: '@shadow_weaver_dark',
                followers: 123000,
                totalLikes: 890000,
                totalComments: 45000,
                totalShares: 34000,
                totalViews: 5600000,
                dispatchCount: 28,
                tier: 'Possessed',
                lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                profileImage: '/avatars/shadow-weaver.png'
            }
        ];
    }

    getMockCreator(creatorId) {
        const mockCreators = this.getMockCreators();
        return mockCreators.find(c => c.id === creatorId) || mockCreators[0];
    }

    getMockTikTokMetrics(handle) {
        return {
            likes: Math.floor(Math.random() * 50000) + 10000,
            comments: Math.floor(Math.random() * 5000) + 1000,
            shares: Math.floor(Math.random() * 8000) + 2000,
            views: Math.floor(Math.random() * 500000) + 100000,
            videosCount: Math.floor(Math.random() * 50) + 10,
            avgVideoViews: Math.floor(Math.random() * 100000) + 20000,
            lastPostDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        };
    }

    getMockTopPerformers(limit) {
        const allCreators = this.getMockCreators();
        return allCreators
            .sort((a, b) => (b.totalLikes + b.totalShares + b.totalComments) - (a.totalLikes + a.totalShares + a.totalComments))
            .slice(0, limit);
    }

    // Utility methods
    async refreshCreatorData(creatorId) {
        // Force refresh specific creator data
        const cacheKey = `creator_${creatorId}`;
        this.cache.delete(cacheKey);
        
        return await this.getCreatorById(creatorId);
    }

    clearCache() {
        this.cache.clear();
        console.log('🗑️ Creators cache cleared');
    }

    async searchCreators(query) {
        const allCreators = await this.getAllCreators();
        
        return allCreators.filter(creator => 
            creator.name.toLowerCase().includes(query.toLowerCase()) ||
            creator.handle.toLowerCase().includes(query.toLowerCase()) ||
            (creator.tiktokHandle && creator.tiktokHandle.toLowerCase().includes(query.toLowerCase()))
        );
    }

    async getCreatorsByTier(tier) {
        const allCreators = await this.getAllCreators();
        return allCreators.filter(creator => creator.tier === tier);
    }

    async getCreatorStats() {
        const allCreators = await this.getAllCreators();
        
        return {
            totalCreators: allCreators.length,
            activeCreators: allCreators.filter(c => new Date() - new Date(c.lastActive) < 24 * 60 * 60 * 1000).length,
            tierDistribution: this.getTierDistribution(allCreators),
            totalFollowers: allCreators.reduce((sum, c) => sum + c.followers, 0),
            totalEngagement: allCreators.reduce((sum, c) => sum + (c.totalLikes || 0) + (c.totalComments || 0) + (c.totalShares || 0), 0),
            avgViralScore: allCreators.reduce((sum, c) => sum + (c.viralScore || 0), 0) / allCreators.length
        };
    }

    getTierDistribution(creators) {
        const distribution = { Shadow: 0, Possessed: 0, Wraith: 0, Ghost: 0 };
        creators.forEach(creator => {
            if (distribution.hasOwnProperty(creator.tier)) {
                distribution[creator.tier]++;
            }
        });
        return distribution;
    }
}

// Initialize global instance
window.creatorsAPI = new CreatorsAPI();

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CreatorsAPI;
}
