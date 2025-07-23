#!/usr/bin/env node
/**
 * Sentiment & Lore Evolution Service - Phase IV
 * Community-driven content evolution based on audience sentiment
 */

const http = require('http');
const PORT = 8089;

// Sentiment tracking data
let sentimentData = [
    {
        id: 'sent_001',
        content: 'Midnight Mirror Ritual',
        creator: 'ShadowWhisper',
        sentimentScore: 8.4,
        emotions: {
            fear: 45,
            excitement: 35,
            curiosity: 20,
            disgust: 5,
            anticipation: 40
        },
        community_feedback: [
            { emotion: 'fear', intensity: 9, comment: 'This gave me chills!' },
            { emotion: 'excitement', intensity: 8, comment: 'Want to try this myself!' },
            { emotion: 'curiosity', intensity: 7, comment: 'What happens if you break the mirror?' }
        ],
        evolution_suggestions: [
            'Add variations for different types of mirrors',
            'Create a series with mirror mythology from different cultures',
            'Develop interactive mirror ritual experiences'
        ],
        viral_factors: ['timing (3AM)', 'interactive element', 'visual horror', 'community challenge'],
        trend_alignment: 0.92,
        last_analyzed: new Date().toISOString()
    },
    {
        id: 'sent_002',
        content: 'Abandoned Hospital Stories',
        creator: 'NightmareQueen',
        sentimentScore: 7.1,
        emotions: {
            fear: 55,
            excitement: 25,
            curiosity: 30,
            disgust: 15,
            anticipation: 35
        },
        community_feedback: [
            { emotion: 'fear', intensity: 8, comment: 'Hospitals are the worst for horror!' },
            { emotion: 'curiosity', intensity: 9, comment: 'Need more backstory on the patients' },
            { emotion: 'anticipation', intensity: 7, comment: 'When is the next episode?' }
        ],
        evolution_suggestions: [
            'Include historical records and real patient stories',
            'Create virtual hospital tours with narrative',
            'Develop medical horror mythology'
        ],
        viral_factors: ['location authenticity', 'historical elements', 'visual exploration', 'mystery narrative'],
        trend_alignment: 0.87,
        last_analyzed: new Date().toISOString()
    },
    {
        id: 'sent_003',
        content: 'Forest Ritual Mysteries',
        creator: 'SpectralStoryteller',
        sentimentScore: 6.8,
        emotions: {
            fear: 30,
            excitement: 20,
            curiosity: 45,
            disgust: 5,
            anticipation: 50
        },
        community_feedback: [
            { emotion: 'curiosity', intensity: 9, comment: 'What do those symbols mean?' },
            { emotion: 'anticipation', intensity: 8, comment: 'Please decode more symbols!' },
            { emotion: 'fear', intensity: 6, comment: 'Forest rituals are so creepy' }
        ],
        evolution_suggestions: [
            'Create symbol decoder tools and apps',
            'Develop forest mythology encyclopedia',
            'Build community symbol discovery challenges'
        ],
        viral_factors: ['mystery elements', 'educational content', 'community engagement', 'symbol decoding'],
        trend_alignment: 0.83,
        last_analyzed: new Date().toISOString()
    }
];

// Lore evolution tracking
let loreEvolution = {
    themes: [
        {
            name: 'Mirror Horror',
            popularity: 92,
            growth: 15.4,
            content_count: 47,
            evolution_stage: 'viral_expansion',
            community_contributions: 23,
            variations: ['3AM ritual', 'broken mirror curse', 'antique shop mysteries', 'mirror dimension']
        },
        {
            name: 'Abandoned Places',
            popularity: 87,
            growth: 8.2,
            content_count: 34,
            evolution_stage: 'established_trend',
            community_contributions: 19,
            variations: ['hospital exploration', 'school haunting', 'factory mysteries', 'asylum stories']
        },
        {
            name: 'Forest Mysteries',
            popularity: 76,
            growth: 22.1,
            content_count: 28,
            evolution_stage: 'emerging_viral',
            community_contributions: 15,
            variations: ['symbol decoding', 'ritual sites', 'witch legends', 'creature sightings']
        },
        {
            name: 'Cursed Objects',
            popularity: 68,
            growth: 5.7,
            content_count: 22,
            evolution_stage: 'stable_niche',
            community_contributions: 12,
            variations: ['antique collections', 'family heirlooms', 'found objects', 'auction mysteries']
        }
    ],
    community_sentiment: {
        overall_engagement: 85.4,
        content_satisfaction: 91.2,
        creator_trust: 88.7,
        platform_loyalty: 79.3,
        recommendation_rate: 94.1
    },
    trending_elements: [
        { element: 'Interactive challenges', score: 94, growth: '+18%' },
        { element: 'Historical accuracy', score: 87, growth: '+12%' },
        { element: 'Visual storytelling', score: 91, growth: '+9%' },
        { element: 'Community participation', score: 89, growth: '+15%' },
        { element: 'Educational content', score: 82, growth: '+21%' }
    ]
};

// AI sentiment analysis simulation
function analyzeSentiment(content, comments = []) {
    const positiveWords = ['amazing', 'love', 'awesome', 'incredible', 'fantastic', 'chilling', 'thrilling'];
    const negativeWords = ['boring', 'hate', 'terrible', 'awful', 'disappointing', 'scary', 'disturbing'];
    const fearWords = ['creepy', 'terrifying', 'haunting', 'spine-chilling', 'nightmare', 'horror'];
    
    let score = 5.0; // Neutral starting point
    let emotions = { fear: 0, excitement: 0, curiosity: 0, disgust: 0, anticipation: 0 };
    
    // Analyze content and comments
    const allText = (content + ' ' + comments.join(' ')).toLowerCase();
    
    positiveWords.forEach(word => {
        const matches = (allText.match(new RegExp(word, 'g')) || []).length;
        score += matches * 0.5;
        emotions.excitement += matches * 5;
    });
    
    negativeWords.forEach(word => {
        const matches = (allText.match(new RegExp(word, 'g')) || []).length;
        score -= matches * 0.3;
        emotions.disgust += matches * 3;
    });
    
    fearWords.forEach(word => {
        const matches = (allText.match(new RegExp(word, 'g')) || []).length;
        score += matches * 0.2; // Fear can be positive in horror content
        emotions.fear += matches * 8;
    });
    
    // Add randomness and normalize
    score = Math.max(0, Math.min(10, score + (Math.random() - 0.5)));
    emotions.curiosity = Math.random() * 50 + 10;
    emotions.anticipation = Math.random() * 60 + 5;
    
    return { score, emotions };
}

// Generate evolution suggestions based on sentiment
function generateEvolutionSuggestions(sentimentItem) {
    const suggestions = [];
    
    if (sentimentItem.emotions.curiosity > 40) {
        suggestions.push('Create educational deep-dives and lore explanations');
        suggestions.push('Develop interactive mystery-solving elements');
    }
    
    if (sentimentItem.emotions.fear > 50) {
        suggestions.push('Amplify horror elements and jump scares');
        suggestions.push('Create immersive fear-based experiences');
    }
    
    if (sentimentItem.emotions.excitement > 30) {
        suggestions.push('Build community challenges and participation');
        suggestions.push('Create shareable and remixable content formats');
    }
    
    if (sentimentItem.emotions.anticipation > 35) {
        suggestions.push('Develop episodic content series');
        suggestions.push('Create cliffhangers and narrative hooks');
    }
    
    return suggestions;
}

// Simulate real-time sentiment updates
function updateSentimentData() {
    sentimentData.forEach(item => {
        // Fluctuate sentiment scores
        const scoreChange = (Math.random() - 0.5) * 0.3;
        item.sentimentScore = Math.max(0, Math.min(10, item.sentimentScore + scoreChange));
        
        // Update emotions with some variability
        Object.keys(item.emotions).forEach(emotion => {
            const change = (Math.random() - 0.5) * 5;
            item.emotions[emotion] = Math.max(0, Math.min(100, item.emotions[emotion] + change));
        });
        
        // Update trend alignment
        item.trend_alignment = Math.max(0.5, Math.min(1.0, item.trend_alignment + (Math.random() - 0.5) * 0.05));
        
        // Refresh evolution suggestions
        item.evolution_suggestions = generateEvolutionSuggestions(item);
        item.last_analyzed = new Date().toISOString();
    });
    
    // Update lore evolution themes
    loreEvolution.themes.forEach(theme => {
        const growthChange = (Math.random() - 0.4) * 2;
        theme.growth = Math.max(0, theme.growth + growthChange);
        
        const popularityChange = (Math.random() - 0.5) * 3;
        theme.popularity = Math.max(0, Math.min(100, theme.popularity + popularityChange));
        
        // Occasionally add content
        if (Math.random() < 0.15) {
            theme.content_count += 1;
        }
    });
    
    // Update community sentiment
    Object.keys(loreEvolution.community_sentiment).forEach(metric => {
        const change = (Math.random() - 0.5) * 2;
        loreEvolution.community_sentiment[metric] = 
            Math.max(0, Math.min(100, loreEvolution.community_sentiment[metric] + change));
    });
    
    // Update trending elements
    loreEvolution.trending_elements.forEach(element => {
        const scoreChange = (Math.random() - 0.5) * 2;
        element.score = Math.max(0, Math.min(100, element.score + scoreChange));
    });
}

// Update data every 25 seconds
setInterval(updateSentimentData, 25000);

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
            const avgSentiment = sentimentData.reduce((sum, item) => sum + item.sentimentScore, 0) / sentimentData.length;
            
            res.writeHead(200);
            res.end(JSON.stringify({
                service: 'Sentiment & Lore Evolution',
                status: 'operational',
                port: PORT,
                uptime: process.uptime(),
                contentAnalyzed: sentimentData.length,
                averageSentiment: Math.round(avgSentiment * 100) / 100,
                themes: loreEvolution.themes.length,
                timestamp: new Date().toISOString()
            }));
            
        } else if (url.pathname === '/sentiment') {
            const sortBy = url.searchParams.get('sort') || 'sentimentScore';
            let sortedData = [...sentimentData];
            
            sortedData.sort((a, b) => {
                switch (sortBy) {
                    case 'trend': return b.trend_alignment - a.trend_alignment;
                    case 'recent': return new Date(b.last_analyzed) - new Date(a.last_analyzed);
                    default: return b.sentimentScore - a.sentimentScore;
                }
            });
            
            res.writeHead(200);
            res.end(JSON.stringify({
                sentiment: sortedData,
                sortBy,
                timestamp: new Date().toISOString()
            }));
            
        } else if (url.pathname.startsWith('/sentiment/')) {
            const contentId = url.pathname.split('/')[2];
            const sentimentItem = sentimentData.find(s => s.id === contentId);
            
            if (sentimentItem) {
                res.writeHead(200);
                res.end(JSON.stringify({
                    sentiment: sentimentItem,
                    timestamp: new Date().toISOString()
                }));
            } else {
                res.writeHead(404);
                res.end(JSON.stringify({
                    error: 'Sentiment data not found',
                    contentId
                }));
            }
            
        } else if (url.pathname === '/lore-evolution') {
            res.writeHead(200);
            res.end(JSON.stringify({
                evolution: loreEvolution,
                timestamp: new Date().toISOString()
            }));
            
        } else if (url.pathname === '/themes') {
            const sortBy = url.searchParams.get('sort') || 'popularity';
            let sortedThemes = [...loreEvolution.themes];
            
            sortedThemes.sort((a, b) => {
                switch (sortBy) {
                    case 'growth': return b.growth - a.growth;
                    case 'content': return b.content_count - a.content_count;
                    case 'community': return b.community_contributions - a.community_contributions;
                    default: return b.popularity - a.popularity;
                }
            });
            
            res.writeHead(200);
            res.end(JSON.stringify({
                themes: sortedThemes,
                sortBy,
                timestamp: new Date().toISOString()
            }));
            
        } else if (url.pathname === '/analyze') {
            // Endpoint for real-time sentiment analysis
            if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                
                req.on('end', () => {
                    try {
                        const { content, comments = [] } = JSON.parse(body);
                        const analysis = analyzeSentiment(content, comments);
                        
                        res.writeHead(200);
                        res.end(JSON.stringify({
                            analysis,
                            suggestions: generateEvolutionSuggestions({
                                emotions: analysis.emotions
                            }),
                            timestamp: new Date().toISOString()
                        }));
                    } catch (error) {
                        res.writeHead(400);
                        res.end(JSON.stringify({
                            error: 'Invalid JSON body',
                            message: error.message
                        }));
                    }
                });
            } else {
                res.writeHead(405);
                res.end(JSON.stringify({
                    error: 'Method not allowed',
                    allowedMethods: ['POST']
                }));
            }
            
        } else if (url.pathname === '/trending') {
            res.writeHead(200);
            res.end(JSON.stringify({
                elements: loreEvolution.trending_elements,
                community_sentiment: loreEvolution.community_sentiment,
                timestamp: new Date().toISOString()
            }));
            
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({
                error: 'Endpoint not found',
                availableEndpoints: ['/stats', '/sentiment', '/sentiment/:id', '/lore-evolution', '/themes', '/analyze', '/trending']
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
    console.log(`🧠 Sentiment & Lore Evolution running on port ${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/stats`);
    console.log(`📊 Sentiment: http://localhost:${PORT}/sentiment`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
    } else {
        console.error('❌ Server error:', err);
    }
    process.exit(1);
});
