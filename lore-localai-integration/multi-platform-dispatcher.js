#!/usr/bin/env node
/**
 * Multi-Platform Dispatcher - Phase IV
 * Cross-platform content distribution and engagement tracking
 */

const http = require('http');
const PORT = 8088;

// Platform configurations and stats
let platforms = [
    {
        id: 'tiktok',
        name: 'TikTok',
        icon: '🎵',
        status: 'active',
        followers: 125400,
        engagementRate: 12.8,
        postsToday: 23,
        viralThreshold: 50000,
        apiLimit: 10000,
        apiUsed: 3420,
        revenue: 2840,
        topHashtags: ['#haunted', '#scary', '#viral', '#ghost', '#horror'],
        bestPostTime: '21:00-23:00',
        avgViews: 45200,
        totalPosts: 1247
    },
    {
        id: 'youtube',
        name: 'YouTube Shorts',
        icon: '📺',
        status: 'active',
        followers: 89600,
        engagementRate: 8.4,
        postsToday: 12,
        viralThreshold: 100000,
        apiLimit: 5000,
        apiUsed: 2156,
        revenue: 3650,
        topHashtags: ['#shorts', '#horror', '#haunted', '#mystery', '#viral'],
        bestPostTime: '19:00-21:00',
        avgViews: 78500,
        totalPosts: 432
    },
    {
        id: 'instagram',
        name: 'Instagram Reels',
        icon: '📸',
        status: 'active',
        followers: 67800,
        engagementRate: 9.7,
        postsToday: 18,
        viralThreshold: 25000,
        apiLimit: 8000,
        apiUsed: 4890,
        revenue: 1920,
        topHashtags: ['#reels', '#horror', '#haunted', '#spooky', '#viral'],
        bestPostTime: '20:00-22:00',
        avgViews: 34200,
        totalPosts: 856
    },
    {
        id: 'telegram',
        name: 'Telegram',
        icon: '✈️',
        status: 'active',
        followers: 23400,
        engagementRate: 15.2,
        postsToday: 8,
        viralThreshold: 5000,
        apiLimit: 3000,
        apiUsed: 890,
        revenue: 680,
        topHashtags: ['#ghost', '#stories', '#haunted', '#mystery', '#paranormal'],
        bestPostTime: '22:00-24:00',
        avgViews: 12800,
        totalPosts: 245
    },
    {
        id: 'reddit',
        name: 'Reddit',
        icon: '🤖',
        status: 'active',
        followers: 45200,
        engagementRate: 6.9,
        postsToday: 15,
        viralThreshold: 10000,
        apiLimit: 2000,
        apiUsed: 1234,
        revenue: 820,
        topHashtags: ['r/nosleep', 'r/horror', 'r/creepy', 'r/paranormal', 'r/ghoststories'],
        bestPostTime: '14:00-16:00',
        avgViews: 18600,
        totalPosts: 198
    },
    {
        id: 'discord',
        name: 'Discord',
        icon: '💬',
        status: 'active',
        followers: 18900,
        engagementRate: 22.4,
        postsToday: 45,
        viralThreshold: 1000,
        apiLimit: 5000,
        apiUsed: 2890,
        revenue: 1240,
        topHashtags: ['#horror-stories', '#ghost-chat', '#paranormal', '#viral-content', '#haunted-tales'],
        bestPostTime: '20:00-02:00',
        avgViews: 890,
        totalPosts: 1456
    }
];

// Content distribution queue
let distributionQueue = [
    {
        id: 'dist_001',
        title: 'Midnight Mirror Ritual',
        content: 'What happens when you perform the mirror ritual at 3 AM...',
        creator: 'ShadowWhisper',
        targetPlatforms: ['tiktok', 'youtube', 'instagram'],
        status: 'scheduled',
        scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        priority: 'high',
        expectedViralScore: 6.8,
        adaptations: {
            tiktok: { duration: 60, hashtags: ['#haunted', '#mirror', '#3am', '#viral'] },
            youtube: { duration: 120, hashtags: ['#shorts', '#horror', '#mirror', '#ritual'] },
            instagram: { duration: 90, hashtags: ['#reels', '#haunted', '#mirror', '#spooky'] }
        }
    },
    {
        id: 'dist_002',
        title: 'Abandoned Hospital Discovery',
        content: 'Exploring the forgotten wing of the old psychiatric hospital...',
        creator: 'NightmareQueen',
        targetPlatforms: ['youtube', 'instagram', 'reddit'],
        status: 'processing',
        scheduledTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        priority: 'medium',
        expectedViralScore: 5.2,
        adaptations: {
            youtube: { duration: 180, hashtags: ['#shorts', '#abandoned', '#hospital', '#exploration'] },
            instagram: { duration: 90, hashtags: ['#reels', '#abandoned', '#creepy', '#explore'] },
            reddit: { duration: 0, hashtags: ['r/abandoned', 'r/creepy', 'r/urbanexploration'] }
        }
    },
    {
        id: 'dist_003',
        title: 'Ghost Stories Collection',
        content: 'Three spine-chilling tales from our community...',
        creator: 'SpectralStoryteller',
        targetPlatforms: ['telegram', 'discord', 'reddit'],
        status: 'ready',
        scheduledTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
        priority: 'high',
        expectedViralScore: 4.9,
        adaptations: {
            telegram: { duration: 0, hashtags: ['#ghost', '#stories', '#paranormal'] },
            discord: { duration: 0, hashtags: ['#horror-stories', '#ghost-chat', '#paranormal'] },
            reddit: { duration: 0, hashtags: ['r/nosleep', 'r/ghoststories', 'r/paranormal'] }
        }
    }
];

// Platform performance tracking
let platformMetrics = {
    totalFollowers: 0,
    totalPosts: 0,
    avgEngagement: 0,
    totalRevenue: 0,
    postsScheduled: distributionQueue.length,
    activePlatforms: 0,
    lastSync: new Date().toISOString()
};

// Calculate platform metrics
function calculatePlatformMetrics() {
    const activePlatforms = platforms.filter(p => p.status === 'active');
    
    platformMetrics = {
        totalFollowers: platforms.reduce((sum, p) => sum + p.followers, 0),
        totalPosts: platforms.reduce((sum, p) => sum + p.totalPosts, 0),
        avgEngagement: platforms.reduce((sum, p) => sum + p.engagementRate, 0) / platforms.length,
        totalRevenue: platforms.reduce((sum, p) => sum + p.revenue, 0),
        postsScheduled: distributionQueue.filter(d => d.status === 'scheduled').length,
        activePlatforms: activePlatforms.length,
        lastSync: new Date().toISOString()
    };
}

// Simulate real-time platform updates
function updatePlatformData() {
    platforms.forEach(platform => {
        // Follower growth
        const followerGrowth = Math.floor(Math.random() * 50) - 10;
        platform.followers = Math.max(0, platform.followers + followerGrowth);
        
        // Engagement rate fluctuation
        const engagementChange = (Math.random() - 0.5) * 0.5;
        platform.engagementRate = Math.max(0.1, platform.engagementRate + engagementChange);
        
        // Posts today updates
        if (Math.random() < 0.2) {
            platform.postsToday += 1;
            platform.totalPosts += 1;
        }
        
        // Revenue updates
        const revenueChange = Math.floor((Math.random() - 0.4) * 50);
        platform.revenue = Math.max(0, platform.revenue + revenueChange);
        
        // API usage fluctuation
        const apiChange = Math.floor((Math.random() - 0.3) * 100);
        platform.apiUsed = Math.max(0, Math.min(platform.apiLimit, platform.apiUsed + apiChange));
        
        // Average views update
        const viewsChange = Math.floor((Math.random() - 0.3) * 2000);
        platform.avgViews = Math.max(100, platform.avgViews + viewsChange);
    });
    
    // Update distribution queue status
    distributionQueue.forEach(item => {
        if (item.status === 'scheduled' && new Date(item.scheduledTime) <= new Date()) {
            item.status = 'processing';
        }
        if (item.status === 'processing' && Math.random() < 0.3) {
            item.status = 'completed';
        }
    });
    
    calculatePlatformMetrics();
}

// Generate optimal posting schedule
function generateOptimalSchedule(platforms = [], contentType = 'general') {
    const schedule = [];
    const now = new Date();
    
    platforms.forEach(platformId => {
        const platform = platforms.find(p => p.id === platformId);
        if (!platform) return;
        
        const [startHour, endHour] = platform.bestPostTime.split('-').map(time => 
            parseInt(time.split(':')[0])
        );
        
        // Generate next optimal time for this platform
        const optimalTime = new Date(now);
        optimalTime.setHours(startHour + Math.floor(Math.random() * (endHour - startHour)));
        optimalTime.setMinutes(Math.floor(Math.random() * 60));
        
        if (optimalTime <= now) {
            optimalTime.setDate(optimalTime.getDate() + 1);
        }
        
        schedule.push({
            platform: platform.name,
            platformId: platform.id,
            optimalTime: optimalTime.toISOString(),
            expectedEngagement: platform.engagementRate,
            estimatedReach: Math.floor(platform.followers * (platform.engagementRate / 100) * 1.2)
        });
    });
    
    return schedule.sort((a, b) => new Date(a.optimalTime) - new Date(b.optimalTime));
}

// Update data every 20 seconds
setInterval(updatePlatformData, 20000);
calculatePlatformMetrics();

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    const url = new URL(req.url, `http://localhost:${PORT}`);
    
    try {
        if (url.pathname === '/stats') {
            res.writeHead(200);
            res.end(JSON.stringify({
                service: 'Multi-Platform Dispatcher',
                status: 'operational',
                port: PORT,
                uptime: process.uptime(),
                metrics: platformMetrics,
                timestamp: new Date().toISOString()
            }));
            
        } else if (url.pathname === '/platforms') {
            const status = url.searchParams.get('status');
            let filteredPlatforms = platforms;
            
            if (status) {
                filteredPlatforms = platforms.filter(p => p.status === status);
            }
            
            res.writeHead(200);
            res.end(JSON.stringify({
                platforms: filteredPlatforms,
                total: filteredPlatforms.length,
                metrics: platformMetrics,
                timestamp: new Date().toISOString()
            }));
            
        } else if (url.pathname.startsWith('/platforms/')) {
            const platformId = url.pathname.split('/')[2];
            const platform = platforms.find(p => p.id === platformId);
            
            if (platform) {
                res.writeHead(200);
                res.end(JSON.stringify({
                    platform,
                    timestamp: new Date().toISOString()
                }));
            } else {
                res.writeHead(404);
                res.end(JSON.stringify({
                    error: 'Platform not found',
                    platformId
                }));
            }
            
        } else if (url.pathname === '/distribution') {
            const status = url.searchParams.get('status');
            let filteredQueue = distributionQueue;
            
            if (status) {
                filteredQueue = distributionQueue.filter(d => d.status === status);
            }
            
            res.writeHead(200);
            res.end(JSON.stringify({
                queue: filteredQueue,
                total: filteredQueue.length,
                timestamp: new Date().toISOString()
            }));
            
        } else if (url.pathname === '/schedule') {
            const platformIds = url.searchParams.get('platforms')?.split(',') || 
                               platforms.filter(p => p.status === 'active').map(p => p.id);
            const contentType = url.searchParams.get('type') || 'general';
            
            const schedule = generateOptimalSchedule(platformIds, contentType);
            
            res.writeHead(200);
            res.end(JSON.stringify({
                schedule,
                platforms: platformIds,
                contentType,
                timestamp: new Date().toISOString()
            }));
            
        } else if (url.pathname === '/analytics') {
            const topPlatforms = [...platforms]
                .sort((a, b) => b.engagementRate - a.engagementRate)
                .slice(0, 3);
            
            const analytics = {
                topPerformers: topPlatforms,
                totalReach: platforms.reduce((sum, p) => sum + p.followers, 0),
                avgEngagement: platformMetrics.avgEngagement,
                contentDistribution: distributionQueue.reduce((acc, item) => {
                    acc[item.status] = (acc[item.status] || 0) + 1;
                    return acc;
                }, {}),
                platformBreakdown: platforms.map(p => ({
                    name: p.name,
                    followers: p.followers,
                    engagement: p.engagementRate,
                    revenue: p.revenue,
                    posts: p.totalPosts,
                    efficiency: Math.round((p.revenue / p.totalPosts) * 100) / 100
                }))
            };
            
            res.writeHead(200);
            res.end(JSON.stringify({
                analytics,
                timestamp: new Date().toISOString()
            }));
            
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({
                error: 'Endpoint not found',
                availableEndpoints: ['/stats', '/platforms', '/platforms/:id', '/distribution', '/schedule', '/analytics']
            }));
        }
        
    } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({
            error: 'Internal server error',
            message: error.message
        }));
    }
});

server.listen(PORT, () => {
    console.log(`🌐 Multi-Platform Dispatcher running on port ${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/stats`);
    console.log(`📊 Platforms: http://localhost:${PORT}/platforms`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
    } else {
        console.error('❌ Server error:', err);
    }
    process.exit(1);
});
