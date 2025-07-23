const http = require('http');

// Test Creator Leaderboards with Stripe Integration
async function testCreatorStripeService() {
    console.log('🧪 Testing Creator Leaderboards with Stripe Integration...\n');
    
    const tests = [
        { name: 'Service Stats', url: 'http://localhost:8085/stats' },
        { name: 'Creator List', url: 'http://localhost:8085/creators?limit=3' },
        { name: 'Leaderboard', url: 'http://localhost:8085/leaderboard?limit=5' }
    ];
    
    for (const test of tests) {
        try {
            console.log(`📊 Testing ${test.name}...`);
            
            const response = await new Promise((resolve, reject) => {
                const req = http.get(test.url, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        try {
                            resolve(JSON.parse(data));
                        } catch (e) {
                            resolve(data);
                        }
                    });
                });
                
                req.on('error', reject);
                req.setTimeout(5000, () => reject(new Error('Timeout')));
            });
            
            console.log(`✅ ${test.name}: Success`);
            if (test.name === 'Service Stats') {
                console.log(`   📈 Service: ${response.service}`);
                console.log(`   👥 Creators: ${response.creators}`);
                console.log(`   💳 Stripe Configured: ${response.stripe_integration?.configured}`);
                console.log(`   🔄 Last Sync: ${response.stripe_integration?.last_sync || 'Never'}`);
            } else if (test.name === 'Creator List' && response.creators) {
                console.log(`   👑 First Creator: ${response.creators[0]?.name} (${response.creators[0]?.tier})`);
                console.log(`   💰 Stripe Revenue: $${response.creators[0]?.stripeRevenue || 0}`);
            } else if (test.name === 'Leaderboard' && response.leaderboard) {
                console.log(`   🏆 Top Creator: ${response.leaderboard[0]?.name} (${response.leaderboard[0]?.totalPoints} points)`);
                console.log(`   💳 Stripe Revenue: $${response.leaderboard[0]?.stripeRevenue || 0}`);
            }
            console.log('');
            
        } catch (error) {
            console.log(`❌ ${test.name}: ${error.message}\n`);
        }
    }
    
    // Test Stripe sync endpoint
    try {
        console.log('🔄 Testing Stripe Sync...');
        const syncData = JSON.stringify({ creator_id: null }); // Sync all creators
        
        const syncResponse = await new Promise((resolve, reject) => {
            const options = {
                hostname: 'localhost',
                port: 8085,
                path: '/creators/stripe-sync',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': syncData.length
                }
            };
            
            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve(data);
                    }
                });
            });
            
            req.on('error', reject);
            req.setTimeout(10000, () => reject(new Error('Timeout')));
            req.write(syncData);
            req.end();
        });
        
        console.log('✅ Stripe Sync: Success');
        console.log(`   📊 Synced Creators: ${syncResponse.synced_creators}`);
        console.log('');
        
    } catch (error) {
        console.log(`❌ Stripe Sync: ${error.message}\n`);
    }
    
    console.log('🎯 Creator Leaderboards with Stripe Integration test completed!');
}

// Run the test
testCreatorStripeService().catch(console.error);
