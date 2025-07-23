const WebSocket = require('ws');
const axios = require('axios');

console.log('🚀 Lore Engine Multi-Agent System - Production Integration Test');
console.log('================================================================================');

// Test configuration
const services = {
  loreDispatcher: {
    name: 'Lore Dispatcher',
    baseUrl: 'http://localhost:8084',
    healthEndpoint: '/health',
    wsEndpoint: 'ws://localhost:8084'
  },
  conflictDetection: {
    name: 'Conflict Detection', 
    baseUrl: 'http://localhost:8083',
    healthEndpoint: '/health',
    wsEndpoint: 'ws://localhost:8083'
  },
  realtimeWs: {
    name: 'Real-time WebSocket',
    baseUrl: 'http://localhost:8082',
    healthEndpoint: '/api/health',
    wsEndpoint: 'ws://localhost:8082'
  }
};

// Test results tracking
let testResults = {
  healthChecks: 0,
  apiTests: 0,
  wsConnections: 0,
  integrationTests: 0,
  totalTests: 0,
  passedTests: 0,
  failedTests: 0
};

// Health check function
async function testHealthCheck(service) {
  try {
    console.log(`\n🏥 Testing ${service.name} Health Check...`);
    const response = await axios.get(service.baseUrl + service.healthEndpoint);
    
    if (response.status === 200) {
      console.log(`✅ ${service.name} is healthy`);
      console.log(`   Status: ${response.data.status || 'unknown'}`);
      console.log(`   Service: ${response.data.service || 'unknown'}`);
      testResults.passedTests++;
    } else {
      console.log(`❌ ${service.name} health check failed (Status: ${response.status})`);
      testResults.failedTests++;
    }
    testResults.healthChecks++;
    testResults.totalTests++;
  } catch (error) {
    console.log(`❌ ${service.name} health check error: ${error.message}`);
    testResults.failedTests++;
    testResults.healthChecks++;
    testResults.totalTests++;
  }
}

// API test function
async function testLoreDispatcherAPI() {
  try {
    console.log('\n🎭 Testing Lore Dispatcher API...');
    
    // Test lore response
    const loreResponse = await axios.post('http://localhost:8084/lore/response', {
      content: 'The ancient scrolls reveal secrets of the multiverse...',
      user_id: 'test_user',
      channel_id: 'test_channel',
      lore_level: 9,
      priority: 8,
      tags: ['ancient', 'scrolls', 'multiverse']
    });
    
    if (loreResponse.status === 200) {
      console.log('✅ Lore response API test passed');
      testResults.passedTests++;
    } else {
      console.log('❌ Lore response API test failed');
      testResults.failedTests++;
    }
    
    // Test statistics
    const statsResponse = await axios.get('http://localhost:8084/lore/stats');
    if (statsResponse.status === 200) {
      console.log('✅ Statistics API test passed');
      console.log(`   Total Events: ${statsResponse.data.TotalEvents}`);
      console.log(`   Successful Dispatches: ${statsResponse.data.SuccessfulDispatches}`);
      testResults.passedTests++;
    } else {
      console.log('❌ Statistics API test failed');
      testResults.failedTests++;
    }
    
    testResults.apiTests += 2;
    testResults.totalTests += 2;
    
  } catch (error) {
    console.log(`❌ Lore Dispatcher API test error: ${error.message}`);
    testResults.failedTests += 2;
    testResults.apiTests += 2;
    testResults.totalTests += 2;
  }
}

// Conflict Detection API test
async function testConflictDetectionAPI() {
  try {
    console.log('\n🚨 Testing Conflict Detection API...');
    
    const conflictEvent = {
      Type: 'cursed_output',
      Content: 'Reality fractures detected across multiple dimensional planes!',
      Priority: 10,
      CursedLevel: 9,
      Tags: ['critical', 'reality_fracture'],
      Metadata: {
        emergency_level: 'critical',
        dimensional_instability: true
      }
    };
    
    const response = await axios.post('http://localhost:8083/lore/conflicts/analyze', conflictEvent);
    
    if (response.status === 200 && response.data.result?.conflict_detected) {
      console.log('✅ Conflict detection API test passed');
      console.log(`   Conflict Type: ${response.data.result.conflict_type}`);
      console.log(`   Severity: ${response.data.result.severity}`);
      testResults.passedTests++;
    } else {
      console.log('❌ Conflict detection API test failed');
      testResults.failedTests++;
    }
    
    testResults.apiTests++;
    testResults.totalTests++;
    
  } catch (error) {
    console.log(`❌ Conflict Detection API test error: ${error.message}`);
    testResults.failedTests++;
    testResults.apiTests++;
    testResults.totalTests++;
  }
}

// WebSocket connection test
async function testWebSocketConnections() {
  console.log('\n🔌 Testing WebSocket Connections...');
  
  const wsPromises = Object.values(services).map(service => {
    return new Promise((resolve) => {
      try {
        const ws = new WebSocket(service.wsEndpoint);
        
        ws.on('open', () => {
          console.log(`✅ ${service.name} WebSocket connected`);
          testResults.passedTests++;
          ws.close();
          resolve();
        });
        
        ws.on('error', (error) => {
          console.log(`❌ ${service.name} WebSocket connection failed: ${error.message}`);
          testResults.failedTests++;
          resolve();
        });
        
        // Timeout after 5 seconds
        setTimeout(() => {
          if (ws.readyState === WebSocket.CONNECTING) {
            console.log(`⚠️  ${service.name} WebSocket connection timeout`);
            testResults.failedTests++;
            ws.close();
            resolve();
          }
        }, 5000);
        
      } catch (error) {
        console.log(`❌ ${service.name} WebSocket test error: ${error.message}`);
        testResults.failedTests++;
        resolve();
      }
    });
  });
  
  await Promise.all(wsPromises);
  testResults.wsConnections += services.length;
  testResults.totalTests += services.length;
}

// Integration flow test
async function testIntegrationFlow() {
  try {
    console.log('\n🔄 Testing Full Integration Flow...');
    
    // Step 1: Send event to Lore Dispatcher
    console.log('📤 Step 1: Dispatching high-priority lore event...');
    const dispatchResponse = await axios.post('http://localhost:8084/lore/cursed', {
      content: 'SYSTEM ALERT: Multi-dimensional breach detected in sector 7',
      user_id: 'system_monitor',
      channel_id: 'emergency',
      cursed_level: 10,
      priority: 10,
      tags: ['system_alert', 'dimensional_breach', 'emergency']
    });
    
    if (dispatchResponse.status === 200) {
      console.log('✅ Event dispatched successfully');
      
      // Step 2: Check if conflict was detected
      console.log('🔍 Step 2: Checking for conflict detection...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const conflictStats = await axios.get('http://localhost:8083/lore/conflicts/stats');
      if (conflictStats.status === 200) {
        console.log('✅ Conflict detection system responded');
        console.log(`   Total Conflicts: ${conflictStats.data.stats?.total_conflicts || 0}`);
        testResults.passedTests++;
      }
      
      // Step 3: Check dispatcher statistics
      console.log('📊 Step 3: Verifying dispatcher statistics...');
      const dispatcherStats = await axios.get('http://localhost:8084/lore/stats');
      if (dispatcherStats.status === 200) {
        console.log('✅ Dispatcher statistics updated');
        console.log(`   Total Events: ${dispatcherStats.data.TotalEvents}`);
        console.log(`   Discord Dispatches: ${dispatcherStats.data.DiscordDispatches}`);
        testResults.passedTests++;
      }
      
    } else {
      console.log('❌ Integration flow failed at dispatch step');
      testResults.failedTests++;
    }
    
    testResults.integrationTests++;
    testResults.totalTests++;
    
  } catch (error) {
    console.log(`❌ Integration flow test error: ${error.message}`);
    testResults.failedTests++;
    testResults.integrationTests++;
    testResults.totalTests++;
  }
}

// Main test execution
async function runProductionTests() {
  try {
    console.log('🧪 Starting Production Integration Tests...\n');
    
    // Test 1: Health checks for all services
    for (const service of Object.values(services)) {
      await testHealthCheck(service);
    }
    
    // Test 2: API functionality
    await testLoreDispatcherAPI();
    await testConflictDetectionAPI();
    
    // Test 3: WebSocket connections
    await testWebSocketConnections();
    
    // Test 4: Full integration flow
    await testIntegrationFlow();
    
    // Final results
    console.log('\n================================================================================');
    console.log('🎉 Production Integration Test Results');
    console.log('================================================================================');
    console.log(`📊 Total Tests: ${testResults.totalTests}`);
    console.log(`✅ Passed: ${testResults.passedTests}`);
    console.log(`❌ Failed: ${testResults.failedTests}`);
    console.log(`📈 Success Rate: ${((testResults.passedTests / testResults.totalTests) * 100).toFixed(1)}%`);
    console.log('');
    console.log('Test Breakdown:');
    console.log(`   🏥 Health Checks: ${testResults.healthChecks} tests`);
    console.log(`   🎯 API Tests: ${testResults.apiTests} tests`);
    console.log(`   🔌 WebSocket Tests: ${testResults.wsConnections} tests`);
    console.log(`   🔄 Integration Tests: ${testResults.integrationTests} tests`);
    console.log('');
    
    if (testResults.failedTests === 0) {
      console.log('🚀 All tests passed! Production system is ready for deployment!');
    } else if (testResults.passedTests > testResults.failedTests) {
      console.log('⚠️  Most tests passed. Review failed tests before production deployment.');
    } else {
      console.log('❌ Multiple test failures detected. System needs attention before deployment.');
    }
    
    console.log('================================================================================');
    
  } catch (error) {
    console.error('❌ Production test runner error:', error);
  }
}

// Start tests
runProductionTests();
