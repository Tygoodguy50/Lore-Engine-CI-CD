#!/usr/bin/env node

/**
 * Test script to verify API endpoints match the Go test requirements
 * This script tests the conflict detection API endpoints
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3002';

// Test data that matches the Go test requirements
const testLoreEvent = {
  type: 'lore-event',
  content: 'Test lore event with potential conflict',
  timestamp: new Date().toISOString(),
  source: 'test-script',
  priority: 8,
  tags: ['test', 'conflict', 'lore'],
  userId: 'test-user-123',
  channelId: 'test-channel-456',
  loreLevel: 8
};

async function testAPIEndpoints() {
  console.log('🧪 Testing Lore-LocalAI Integration API Endpoints\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('   ✅ Health check passed:', healthResponse.data.status);

    // Test 2: Conflict Detection Health
    console.log('\n2. Testing Conflict Detection Health...');
    const conflictHealthResponse = await axios.get(`${API_BASE_URL}/lore/conflicts/health`);
    console.log('   ✅ Conflict detection health:', conflictHealthResponse.data.status);

    // Test 3: Conflict Analysis
    console.log('\n3. Testing Conflict Analysis...');
    const analysisResponse = await axios.post(`${API_BASE_URL}/lore/conflicts/analyze`, testLoreEvent);
    console.log('   ✅ Conflict analysis result:', analysisResponse.data.result.conflictDetected);
    console.log('   📊 Severity:', analysisResponse.data.result.severity);

    // Test 4: Conflict Statistics
    console.log('\n4. Testing Conflict Statistics...');
    const statsResponse = await axios.get(`${API_BASE_URL}/lore/conflicts/stats`);
    console.log('   ✅ Total conflicts:', statsResponse.data.data.totalConflicts);
    console.log('   📈 Resolved conflicts:', statsResponse.data.data.resolvedConflicts);

    // Test 5: Conflict History
    console.log('\n5. Testing Conflict History...');
    const historyResponse = await axios.get(`${API_BASE_URL}/lore/conflicts/history`);
    console.log('   ✅ History retrieved:', historyResponse.data.status);

    console.log('\n🎉 All API endpoints are working correctly!');
    console.log('\n📝 API Summary:');
    console.log('   - Health Check: ✅ Available');
    console.log('   - Conflict Analysis: ✅ Available');
    console.log('   - Conflict Statistics: ✅ Available');
    console.log('   - Conflict History: ✅ Available');
    console.log('   - Conflict Detection Health: ✅ Available');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

// Run the tests
testAPIEndpoints();
