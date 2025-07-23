#!/usr/bin/env node
/**
 * Revenue Multipliers Service - Phase IV
 * Monetization & payout system with tier-based multipliers
 */

const http = require('http');
const PORT = 8087;

// Revenue streams and multipliers
let revenueStreams = [
    {
        id: 'sub_monthly',
        name: 'Monthly Subscriptions',
        baseRevenue: 4850,
        multiplier: 1.0,
        tierMultiplier: 1.2,
        growth: 8.5,
        subscribers: 162,
        churn: 3.2,
        arpu: 29.94
    },
    {
        id: 'templates',
        name: 'Horror Templates',
        baseRevenue: 2340,
        multiplier: 1.0,
        tierMultiplier: 1.5,
        growth: 12.3,
        sales: 78,
        avgPrice: 30.00,
        conversionRate: 4.2
    },
    {
        id: 'referrals',
        name: 'Creator Referrals',
        baseRevenue: 1890,
        multiplier: 1.0,
        tierMultiplier: 1.8,
        growth: 22.1,
        conversions: 45,
        commission: 0.15,
        avgValue: 420.00
    },
    {
        id: 'premium',
        name: 'AI Agent Premium',
        baseRevenue: 3420,
        multiplier: 1.0,
        tierMultiplier: 1.3,
        growth: 15.7,
        users: 89,
        features: 12,
        retention: 92.3
    },
    {
        id: 'consulting',
        name: 'Viral Strategy',
        baseRevenue: 1680,
        multiplier: 1.0,
        tierMultiplier: 2.0,
        growth: 18.9,
        sessions: 14,
        avgSession: 120.00,
        satisfaction: 4.8
    }
];

// Payout tiers with multipliers
const payoutTiers = [
    {
        tier: 'Shadow',
        minRevenue: 0,
        maxRevenue: 249,
        multiplier: 1.0,
        badge: '🌙',
        color: '#64748b',
        benefits: ['Basic analytics', 'Standard support']
    },
    {
        tier: 'Possessed',
        minRevenue: 250,
        maxRevenue: 749,
        multiplier: 1.2,
        badge: '👻',
        color: '#8b5cf6',
        benefits: ['Advanced analytics', 'Priority support', 'Custom templates']
    },
    {
        tier: 'Wraith',
        minRevenue: 750,
        maxRevenue: 1999,
        multiplier: 1.5,
        badge: '🔮',
        color: '#06d6a0',
        benefits: ['Premium analytics', 'Dedicated support', 'AI optimization', 'Revenue insights']
    },
    {
        tier: 'Ghost',
        minRevenue: 2000,
        maxRevenue: Infinity,
        multiplier: 2.0,
        badge: '👑',
        color: '#ffd60a',
        benefits: ['Elite analytics', 'Personal success manager', 'Custom AI models', 'Revenue optimization']
    }
];

// Revenue projections and calculations
let revenueMetrics = {
    totalWeeklyRevenue: 0,
    totalMonthlyRevenue: 0,
    projectedYearlyRevenue: 0,
    averageGrowthRate: 0,
    totalMultiplierBonus: 0,
    activeStreams: revenueStreams.length,
    lastUpdated: new Date().toISOString()
};

// Calculate current revenue metrics
function calculateRevenueMetrics() {
    const totalBase = revenueStreams.reduce((sum, stream) => sum + stream.baseRevenue, 0);
    const totalWithMultipliers = revenueStreams.reduce((sum, stream) => 
        sum + (stream.baseRevenue * stream.multiplier * stream.tierMultiplier), 0);
    const avgGrowth = revenueStreams.reduce((sum, stream) => sum + stream.growth, 0) / revenueStreams.length;
    
    revenueMetrics = {
        totalWeeklyRevenue: Math.round(totalWithMultipliers),
        totalMonthlyRevenue: Math.round(totalWithMultipliers * 4.33),
        projectedYearlyRevenue: Math.round(totalWithMultipliers * 52 * (1 + avgGrowth / 100)),
        averageGrowthRate: Math.round(avgGrowth * 100) / 100,
        totalMultiplierBonus: Math.round(totalWithMultipliers - totalBase),
        activeStreams: revenueStreams.length,
        lastUpdated: new Date().toISOString()
    };
}

// Simulate real-time revenue updates
function updateRevenueData() {
    revenueStreams.forEach(stream => {
        // Base revenue fluctuation
        const baseChange = (Math.random() - 0.45) * stream.baseRevenue * 0.02;
        stream.baseRevenue = Math.max(100, stream.baseRevenue + baseChange);
        
        // Growth rate changes
        const growthChange = (Math.random() - 0.5) * 2;
        stream.growth = Math.max(0, stream.growth + growthChange);
        
        // Multiplier adjustments based on performance
        const performanceBoost = stream.growth > 15 ? 0.01 : -0.005;
        stream.multiplier = Math.max(0.8, Math.min(1.5, stream.multiplier + performanceBonus));
        
        // Update stream-specific metrics
        switch (stream.id) {
            case 'sub_monthly':
                const subChange = Math.floor((Math.random() - 0.3) * 5);
                stream.subscribers = Math.max(0, stream.subscribers + subChange);
                stream.arpu = Math.round((stream.baseRevenue / stream.subscribers) * 100) / 100;
                break;
                
            case 'templates':
                const salesChange = Math.floor((Math.random() - 0.4) * 3);
                stream.sales = Math.max(0, stream.sales + salesChange);
                stream.avgPrice = Math.round((stream.baseRevenue / stream.sales) * 100) / 100;
                break;
                
            case 'referrals':
                const convChange = Math.floor((Math.random() - 0.3) * 2);
                stream.conversions = Math.max(0, stream.conversions + convChange);
                break;
                
            case 'premium':
                const userChange = Math.floor((Math.random() - 0.2) * 3);
                stream.users = Math.max(0, stream.users + userChange);
                break;
                
            case 'consulting':
                if (Math.random() < 0.1) {
                    stream.sessions += 1;
                }
                break;
        }
    });
    
    calculateRevenueMetrics();
}

// Get tier for revenue amount
function getTierForRevenue(weeklyRevenue) {
    return payoutTiers.find(tier => 
        weeklyRevenue >= tier.minRevenue && weeklyRevenue <= tier.maxRevenue
    ) || payoutTiers[0];
}

// Generate revenue forecast
function generateRevenueForecast(weeks = 12) {
    const forecast = [];
    let currentRevenue = revenueMetrics.totalWeeklyRevenue;
    const avgGrowthRate = revenueMetrics.averageGrowthRate / 100;
    
    for (let week = 1; week <= weeks; week++) {
        // Apply growth with some randomness
        const weeklyGrowth = avgGrowthRate + (Math.random() - 0.5) * 0.02;
        currentRevenue *= (1 + weeklyGrowth);
        
        forecast.push({
            week,
            projectedRevenue: Math.round(currentRevenue),
            tier: getTierForRevenue(currentRevenue).tier,
            multiplier: getTierForRevenue(currentRevenue).multiplier,
            confidence: Math.max(0.5, 0.95 - (week * 0.03))
        });
    }
    
    return forecast;
}

// Update data every 30 seconds
setInterval(updateRevenueData, 30000);
calculateRevenueMetrics();

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
                service: 'Revenue Multipliers',
                status: 'operational',
                port: PORT,
                uptime: process.uptime(),
                metrics: revenueMetrics,
                timestamp: new Date().toISOString()
            }));
            
        } else if (url.pathname === '/revenue') {
            res.writeHead(200);
            res.end(JSON.stringify({
                streams: revenueStreams,
                metrics: revenueMetrics,
                timestamp: new Date().toISOString()
            }));
            
        } else if (url.pathname === '/tiers') {
            res.writeHead(200);
            res.end(JSON.stringify({
                tiers: payoutTiers,
                currentTier: getTierForRevenue(revenueMetrics.totalWeeklyRevenue),
                timestamp: new Date().toISOString()
            }));
            
        } else if (url.pathname === '/forecast') {
            const weeks = parseInt(url.searchParams.get('weeks')) || 12;
            const forecast = generateRevenueForecast(weeks);
            
            res.writeHead(200);
            res.end(JSON.stringify({
                forecast,
                currentRevenue: revenueMetrics.totalWeeklyRevenue,
                weeks,
                timestamp: new Date().toISOString()
            }));
            
        } else if (url.pathname.startsWith('/streams/')) {
            const streamId = url.pathname.split('/')[2];
            const stream = revenueStreams.find(s => s.id === streamId);
            
            if (stream) {
                res.writeHead(200);
                res.end(JSON.stringify({
                    stream,
                    tier: getTierForRevenue(stream.baseRevenue * stream.multiplier * stream.tierMultiplier),
                    timestamp: new Date().toISOString()
                }));
            } else {
                res.writeHead(404);
                res.end(JSON.stringify({
                    error: 'Revenue stream not found',
                    streamId
                }));
            }
            
        } else if (url.pathname === '/multipliers') {
            const multiplierAnalysis = {
                baseRevenue: revenueStreams.reduce((sum, s) => sum + s.baseRevenue, 0),
                withMultipliers: revenueStreams.reduce((sum, s) => sum + (s.baseRevenue * s.multiplier), 0),
                withTierBonus: revenueStreams.reduce((sum, s) => sum + (s.baseRevenue * s.multiplier * s.tierMultiplier), 0),
                totalMultiplierEffect: 0,
                streamsBreakdown: revenueStreams.map(stream => ({
                    name: stream.name,
                    base: stream.baseRevenue,
                    afterMultiplier: stream.baseRevenue * stream.multiplier,
                    afterTierBonus: stream.baseRevenue * stream.multiplier * stream.tierMultiplier,
                    totalBoost: ((stream.multiplier * stream.tierMultiplier - 1) * 100).toFixed(1) + '%'
                }))
            };
            
            multiplierAnalysis.totalMultiplierEffect = 
                ((multiplierAnalysis.withTierBonus / multiplierAnalysis.baseRevenue - 1) * 100).toFixed(1) + '%';
            
            res.writeHead(200);
            res.end(JSON.stringify({
                analysis: multiplierAnalysis,
                timestamp: new Date().toISOString()
            }));
            
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({
                error: 'Endpoint not found',
                availableEndpoints: ['/stats', '/revenue', '/tiers', '/forecast', '/streams/:id', '/multipliers']
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
    console.log(`💰 Revenue Multipliers Service running on port ${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/stats`);
    console.log(`📊 Revenue: http://localhost:${PORT}/revenue`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
    } else {
        console.error('❌ Server error:', err);
    }
    process.exit(1);
});
