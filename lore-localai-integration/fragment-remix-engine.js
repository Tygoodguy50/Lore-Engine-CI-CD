#!/usr/bin/env node
/**
 * Fragment Remix Engine - Phase IV
 * AI-powered content evolution and viral variation system
 */

const http = require('http');
const PORT = 8086;

// Mock fragment data with viral performance tracking
let fragments = [
    {
        id: 'frag_001',
        title: 'Haunted Mirror Revelation',
        content: 'What happens when you look into an antique mirror at 3 AM...',
        originalCreator: 'ShadowWhisper',
        viralScore: 8.4,
        remixCount: 23,
        platforms: ['tiktok', 'youtube', 'instagram'],
        totalViews: 2400000,
        engagement: 15.2,
        revenue: 1240,
        createdAt: '2024-07-10T03:00:00Z',
        lastRemixed: new Date().toISOString(),
        variations: [
            { id: 'var_001a', title: 'Mirror Horror Challenge', viralScore: 6.8, views: 890000 },
            { id: 'var_001b', title: 'Antique Shop Mysteries', viralScore: 5.2, views: 650000 },
            { id: 'var_001c', title: '3AM Mirror Ritual', viralScore: 9.1, views: 1200000 }
        ],
        tags: ['horror', 'supernatural', 'mirror', 'scary'],
        sentiment: 'thrilling',
        aiConfidence: 0.92
    },
    {
        id: 'frag_002',
        title: 'Abandoned Hospital Exploration',
        content: 'Every step echoes in the empty corridors of this forgotten place...',
        originalCreator: 'NightmareQueen',
        viralScore: 6.7,
        remixCount: 18,
        platforms: ['youtube', 'tiktok'],
        totalViews: 1800000,
        engagement: 11.8,
        revenue: 920,
        createdAt: '2024-07-08T14:30:00Z',
        lastRemixed: new Date().toISOString(),
        variations: [
            { id: 'var_002a', title: 'Hospital Night Shift', viralScore: 7.2, views: 740000 },
            { id: 'var_002b', title: 'Medical Mystery Tour', viralScore: 5.8, views: 520000 },
            { id: 'var_002c', title: 'Ghost Patient Stories', viralScore: 8.1, views: 980000 }
        ],
        tags: ['exploration', 'hospital', 'abandoned', 'mystery'],
        sentiment: 'eerie',
        aiConfidence: 0.88
    },
    {
        id: 'frag_003',
        title: 'Midnight Forest Ritual',
        content: 'Ancient symbols carved in moonlit trees reveal their secrets...',
        originalCreator: 'SpectralStoryteller',
        viralScore: 5.9,
        remixCount: 15,
        platforms: ['instagram', 'tiktok', 'youtube'],
        totalViews: 1350000,
        engagement: 9.4,
        revenue: 680,
        createdAt: '2024-07-05T23:45:00Z',
        lastRemixed: new Date().toISOString(),
        variations: [
            { id: 'var_003a', title: 'Forest Witch Legends', viralScore: 6.3, views: 480000 },
            { id: 'var_003b', title: 'Moonlight Mysteries', viralScore: 4.8, views: 420000 },
            { id: 'var_003c', title: 'Ancient Symbol Decoder', viralScore: 7.1, views: 650000 }
        ],
        tags: ['forest', 'ritual', 'symbols', 'witchcraft'],
        sentiment: 'mystical',
        aiConfidence: 0.85
    },
    {
        id: 'frag_004',
        title: 'Cursed Antique Collection',
        content: 'Each item in this collection carries a dark history...',
        originalCreator: 'GhostlyGamer',
        viralScore: 4.2,
        remixCount: 12,
        platforms: ['youtube', 'instagram'],
        totalViews: 890000,
        engagement: 7.6,
        revenue: 420,
        createdAt: '2024-07-03T16:20:00Z',
        lastRemixed: new Date().toISOString(),
        variations: [
            { id: 'var_004a', title: 'Antique Store Hauntings', viralScore: 4.8, views: 320000 },
            { id: 'var_004b', title: 'Cursed Object Reviews', viralScore: 3.9, views: 280000 },
            { id: 'var_004c', title: 'Historical Horror Items', viralScore: 5.1, views: 390000 }
        ],
        tags: ['antiques', 'cursed', 'collection', 'history'],
        sentiment: 'ominous',
        aiConfidence: 0.79
    }
];

// AI-powered content generation templates
const remixTemplates = [
    { type: 'perspective_shift', pattern: 'What if {original} but from the perspective of {entity}?' },
    { type: 'time_variation', pattern: '{original} happening in {time_period}' },
    { type: 'location_remix', pattern: 'Imagine {original} but in {location}' },
    { type: 'twist_ending', pattern: '{original} with a shocking revelation about {element}' },
    { type: 'crossover', pattern: 'Combining {original} with elements of {genre}' }
];

const entities = ['the ghost', 'a skeptical investigator', 'the original owner', 'a child', 'security camera'];
const timePeriods = ['the 1800s', 'the future', 'medieval times', 'the 1950s', 'ancient Rome'];
const locations = ['underwater', 'in space', 'underground', 'in a city', 'in the clouds'];
const elements = ['the narrator', 'the location', 'the time', 'the witnesses', 'the evidence'];
const genres = ['comedy', 'romance', 'sci-fi', 'documentary', 'musical'];

// Simulate real-time fragment performance updates
function updateFragmentData() {
    fragments.forEach(fragment => {
        // Viral score fluctuation
        const scoreChange = (Math.random() - 0.5) * 0.4;
        fragment.viralScore = Math.max(0.1, fragment.viralScore + scoreChange);
        
        // View growth
        const viewGrowth = Math.floor(Math.random() * 5000);
        fragment.totalViews += viewGrowth;
        
        // Engagement updates
        const engagementChange = (Math.random() - 0.5) * 0.3;
        fragment.engagement = Math.max(0.1, fragment.engagement + engagementChange);
        
        // Revenue updates
        const revenueGrowth = Math.floor(Math.random() * 20);
        fragment.revenue += revenueGrowth;
        
        // Occasionally add new remixes
        if (Math.random() < 0.1) {
            fragment.remixCount += 1;
            fragment.lastRemixed = new Date().toISOString();
        }
        
        // Update variations
        fragment.variations.forEach(variation => {
            const varViewGrowth = Math.floor(Math.random() * 2000);
            variation.views += varViewGrowth;
            
            const varScoreChange = (Math.random() - 0.5) * 0.2;
            variation.viralScore = Math.max(0.1, variation.viralScore + varScoreChange);
        });
    });
    
    // Sort by viral score
    fragments.sort((a, b) => b.viralScore - a.viralScore);
}

// Generate AI-powered remix suggestion
function generateRemixSuggestion(fragment) {
    const template = remixTemplates[Math.floor(Math.random() * remixTemplates.length)];
    let suggestion = template.pattern.replace('{original}', fragment.title);
    
    if (suggestion.includes('{entity}')) {
        suggestion = suggestion.replace('{entity}', entities[Math.floor(Math.random() * entities.length)]);
    }
    if (suggestion.includes('{time_period}')) {
        suggestion = suggestion.replace('{time_period}', timePeriods[Math.floor(Math.random() * timePeriods.length)]);
    }
    if (suggestion.includes('{location}')) {
        suggestion = suggestion.replace('{location}', locations[Math.floor(Math.random() * locations.length)]);
    }
    if (suggestion.includes('{element}')) {
        suggestion = suggestion.replace('{element}', elements[Math.floor(Math.random() * elements.length)]);
    }
    if (suggestion.includes('{genre}')) {
        suggestion = suggestion.replace('{genre}', genres[Math.floor(Math.random() * genres.length)]);
    }
    
    return {
        type: template.type,
        suggestion,
        estimatedViralScore: Math.random() * 3 + fragment.viralScore * 0.7,
        confidence: Math.random() * 0.3 + 0.6
    };
}

// Update data every 15 seconds
setInterval(updateFragmentData, 15000);

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
            const totalViews = fragments.reduce((sum, f) => sum + f.totalViews, 0);
            const totalRemixes = fragments.reduce((sum, f) => sum + f.remixCount, 0);
            const avgViralScore = fragments.reduce((sum, f) => sum + f.viralScore, 0) / fragments.length;
            
            res.writeHead(200);
            res.end(JSON.stringify({
                service: 'Fragment Remix Engine',
                status: 'operational',
                port: PORT,
                uptime: process.uptime(),
                fragments: fragments.length,
                totalViews,
                totalRemixes,
                avgViralScore: Math.round(avgViralScore * 100) / 100,
                timestamp: new Date().toISOString()
            }));
            
        } else if (url.pathname === '/fragments') {
            const limit = parseInt(url.searchParams.get('limit')) || 10;
            const offset = parseInt(url.searchParams.get('offset')) || 0;
            const sortBy = url.searchParams.get('sort') || 'viralScore';
            
            let sortedFragments = [...fragments];
            sortedFragments.sort((a, b) => {
                switch (sortBy) {
                    case 'views': return b.totalViews - a.totalViews;
                    case 'remixes': return b.remixCount - a.remixCount;
                    case 'revenue': return b.revenue - a.revenue;
                    case 'recent': return new Date(b.lastRemixed) - new Date(a.lastRemixed);
                    default: return b.viralScore - a.viralScore;
                }
            });
            
            const paginatedFragments = sortedFragments.slice(offset, offset + limit);
            
            res.writeHead(200);
            res.end(JSON.stringify({
                fragments: paginatedFragments,
                total: fragments.length,
                limit,
                offset,
                sortBy,
                timestamp: new Date().toISOString()
            }));
            
        } else if (url.pathname.startsWith('/fragments/') && url.pathname !== '/fragments/') {
            const fragmentId = url.pathname.split('/')[2];
            const fragment = fragments.find(f => f.id === fragmentId);
            
            if (fragment) {
                res.writeHead(200);
                res.end(JSON.stringify({
                    fragment,
                    remixSuggestion: generateRemixSuggestion(fragment),
                    timestamp: new Date().toISOString()
                }));
            } else {
                res.writeHead(404);
                res.end(JSON.stringify({
                    error: 'Fragment not found',
                    fragmentId
                }));
            }
            
        } else if (url.pathname === '/remix-suggestions') {
            const fragmentId = url.searchParams.get('fragmentId');
            const count = parseInt(url.searchParams.get('count')) || 3;
            
            if (fragmentId) {
                const fragment = fragments.find(f => f.id === fragmentId);
                if (fragment) {
                    const suggestions = [];
                    for (let i = 0; i < count; i++) {
                        suggestions.push(generateRemixSuggestion(fragment));
                    }
                    
                    res.writeHead(200);
                    res.end(JSON.stringify({
                        fragmentId,
                        suggestions,
                        timestamp: new Date().toISOString()
                    }));
                } else {
                    res.writeHead(404);
                    res.end(JSON.stringify({
                        error: 'Fragment not found',
                        fragmentId
                    }));
                }
            } else {
                // Generate suggestions for top fragments
                const topFragments = fragments.slice(0, 3);
                const suggestions = topFragments.map(fragment => ({
                    fragmentId: fragment.id,
                    fragmentTitle: fragment.title,
                    suggestion: generateRemixSuggestion(fragment)
                }));
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    suggestions,
                    timestamp: new Date().toISOString()
                }));
            }
            
        } else if (url.pathname === '/viral-analysis') {
            const viralFragments = fragments.filter(f => f.viralScore >= 5.0);
            const superViralFragments = fragments.filter(f => f.viralScore >= 7.5);
            
            res.writeHead(200);
            res.end(JSON.stringify({
                totalFragments: fragments.length,
                viralFragments: viralFragments.length,
                superViralFragments: superViralFragments.length,
                viralThreshold: 5.0,
                superViralThreshold: 7.5,
                topPerformers: fragments.slice(0, 5),
                timestamp: new Date().toISOString()
            }));
            
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({
                error: 'Endpoint not found',
                availableEndpoints: ['/stats', '/fragments', '/fragments/:id', '/remix-suggestions', '/viral-analysis']
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
    console.log(`🧬 Fragment Remix Engine running on port ${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/stats`);
    console.log(`🎭 Fragments: http://localhost:${PORT}/fragments`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
    } else {
        console.error('❌ Server error:', err);
    }
    process.exit(1);
});
