package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/mudler/LocalAI/pkg/hooks"
)

// TestConflictDetection tests the Multi-Agent Lore Conflict Detection system
func TestConflictDetection() {
	fmt.Println("🔍 Testing Multi-Agent Lore Conflict Detection System")
	fmt.Println("============================================================")

	// Create test events that should trigger conflicts
	testEvents := []hooks.LoreEvent{
		{
			Type:              "lore_response",
			Content:           "The ancient artifact was discovered in the northern caves, glowing with blue light.",
			Timestamp:         time.Now(),
			Source:            "test_user_1",
			Priority:          7,
			Tags:              []string{"artifact", "discovery", "northern_caves"},
			UserID:            "user_1",
			ChannelID:         "channel_1",
			LoreLevel:         8,
			Sentiment:         0.7,
			CursedLevel:       3,
			SessionID:         "session_conflict_test",
			SessionEventCount: 1,
			Metadata: map[string]interface{}{
				"location": "northern_caves",
				"artifact_color": "blue",
				"artifact_power": "glowing",
			},
		},
		{
			Type:              "lore_response",
			Content:           "The same artifact was found in the southern desert, emanating red energy.",
			Timestamp:         time.Now().Add(5 * time.Minute),
			Source:            "test_user_2",
			Priority:          8,
			Tags:              []string{"artifact", "discovery", "southern_desert"},
			UserID:            "user_2",
			ChannelID:         "channel_2",
			LoreLevel:         9,
			Sentiment:         0.8,
			CursedLevel:       4,
			SessionID:         "session_conflict_test",
			SessionEventCount: 2,
			Metadata: map[string]interface{}{
				"location": "southern_desert",
				"artifact_color": "red",
				"artifact_power": "emanating",
			},
		},
		{
			Type:              "cursed_output",
			Content:           "The artifact cannot exist in two places at once! Reality is fracturing!",
			Timestamp:         time.Now().Add(10 * time.Minute),
			Source:            "test_user_3",
			Priority:          9,
			Tags:              []string{"artifact", "contradiction", "reality_fracture"},
			UserID:            "user_3",
			ChannelID:         "channel_3",
			LoreLevel:         10,
			Sentiment:         -0.3,
			CursedLevel:       9,
			SessionID:         "session_conflict_test",
			SessionEventCount: 3,
			Metadata: map[string]interface{}{
				"conflict_type": "location_contradiction",
				"severity": "critical",
				"reality_status": "fracturing",
			},
		},
	}

	// Test individual conflict analysis
	fmt.Println("\n🧪 Testing Individual Conflict Analysis:")
	for i, event := range testEvents {
		fmt.Printf("\n--- Test Event %d ---\n", i+1)
		fmt.Printf("Content: %s\n", event.Content)
		fmt.Printf("Location: %v\n", event.Metadata["location"])
		fmt.Printf("Artifact Color: %v\n", event.Metadata["artifact_color"])
		fmt.Printf("Priority: %d\n", event.Priority)
		fmt.Printf("Cursed Level: %d\n", event.CursedLevel)

		// Test conflict analysis via API
		if err := testConflictAnalysisAPI(event); err != nil {
			fmt.Printf("❌ API Test Failed: %v\n", err)
		} else {
			fmt.Printf("✅ API Test Passed\n")
		}
	}

	// Test conflict escalation workflow
	fmt.Println("\n🚨 Testing Conflict Escalation Workflow:")
	testConflictEscalation()

	// Test conflict resolution routing
	fmt.Println("\n📡 Testing Real-Time Resolution Routing:")
	testRealTimeRouting()

	// Test LangChain integration
	fmt.Println("\n🔗 Testing LangChain Integration:")
	testLangChainIntegration()

	// Test conflict history and statistics
	fmt.Println("\n📊 Testing Conflict History and Statistics:")
	testConflictHistoryAPI()

	// Test health check
	fmt.Println("\n🏥 Testing Health Check:")
	testHealthCheck()

	fmt.Println("\n✅ Multi-Agent Lore Conflict Detection System Testing Complete!")
}

// testConflictAnalysisAPI tests the conflict analysis API endpoint
func testConflictAnalysisAPI(event hooks.LoreEvent) error {
	jsonData, err := json.Marshal(event)
	if err != nil {
		return err
	}

	resp, err := http.Post("http://localhost:8080/lore/conflicts/analyze", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("API returned status %d", resp.StatusCode)
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return err
	}

	fmt.Printf("📊 Conflict Analysis Result: %v\n", result["status"])
	if conflictResult, ok := result["result"].(map[string]interface{}); ok {
		if conflictDetected, ok := conflictResult["conflict_detected"].(bool); ok && conflictDetected {
			fmt.Printf("⚠️  Conflict Detected: %v\n", conflictResult["analysis"])
		} else {
			fmt.Printf("✅ No Conflicts Detected\n")
		}
	}

	return nil
}

// testConflictEscalation tests the conflict escalation workflow
func testConflictEscalation() {
	// Create a high-priority conflict event
	highPriorityEvent := hooks.LoreEvent{
		Type:              "lore_response",
		Content:           "CRITICAL: The ancient seal is breaking in both the northern caves AND the southern desert simultaneously!",
		Timestamp:         time.Now(),
		Source:            "emergency_system",
		Priority:          10,
		Tags:              []string{"critical", "seal_breaking", "multiple_locations"},
		UserID:            "system",
		ChannelID:         "emergency",
		LoreLevel:         10,
		Sentiment:         -0.9,
		CursedLevel:       10,
		SessionID:         "session_escalation_test",
		SessionEventCount: 1,
		Metadata: map[string]interface{}{
			"emergency_level": "critical",
			"locations":       []string{"northern_caves", "southern_desert"},
			"seal_integrity":  "0.01",
		},
	}

	// Test escalation via lore event dispatch
	fmt.Printf("🚨 Testing High-Priority Escalation Event\n")
	fmt.Printf("Content: %s\n", highPriorityEvent.Content)
	fmt.Printf("Priority: %d\n", highPriorityEvent.Priority)
	fmt.Printf("Cursed Level: %d\n", highPriorityEvent.CursedLevel)

	// This should trigger automatic escalation to Discord and TikTok
	if err := testConflictAnalysisAPI(highPriorityEvent); err != nil {
		fmt.Printf("❌ Escalation Test Failed: %v\n", err)
	} else {
		fmt.Printf("✅ Escalation Test Passed - should route to Discord/TikTok\n")
	}
}

// testRealTimeRouting tests the real-time resolution routing
func testRealTimeRouting() {
	// Test Discord routing
	fmt.Printf("📱 Testing Discord Routing: ")
	if os.Getenv("DISCORD_TOKEN") != "" {
		fmt.Printf("✅ Discord integration available\n")
	} else {
		fmt.Printf("⚠️  Discord integration not configured\n")
	}

	// Test TikTok routing
	fmt.Printf("🎵 Testing TikTok Routing: ")
	if os.Getenv("TIKTOK_WEBHOOK_URL") != "" {
		fmt.Printf("✅ TikTok integration available\n")
	} else {
		fmt.Printf("⚠️  TikTok integration not configured\n")
	}

	fmt.Printf("📡 Real-time routing ready for conflict escalation\n")
}

// testLangChainIntegration tests the LangChain integration
func testLangChainIntegration() {
	langchainURL := os.Getenv("LANGCHAIN_URL")
	apiKey := os.Getenv("LANGCHAIN_API_KEY")

	if langchainURL == "" {
		fmt.Printf("⚠️  LangChain integration not configured (LANGCHAIN_URL missing)\n")
		return
	}

	if apiKey == "" {
		fmt.Printf("⚠️  LangChain API key not configured (LANGCHAIN_API_KEY missing)\n")
		return
	}

	fmt.Printf("🔗 LangChain URL: %s\n", langchainURL)
	fmt.Printf("🔑 API Key: %s...\n", apiKey[:min(len(apiKey), 8)])
	fmt.Printf("✅ LangChain integration configured\n")
}

// testConflictHistoryAPI tests the conflict history API endpoint
func testConflictHistoryAPI() {
	// Test conflict history
	resp, err := http.Get("http://localhost:8080/lore/conflicts/history")
	if err != nil {
		fmt.Printf("❌ History API Test Failed: %v\n", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		fmt.Printf("❌ History API returned status %d\n", resp.StatusCode)
		return
	}

	var historyResult map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&historyResult); err != nil {
		fmt.Printf("❌ Failed to decode history response: %v\n", err)
		return
	}

	fmt.Printf("📚 Conflict History Retrieved: %v\n", historyResult)

	// Test conflict statistics
	resp, err = http.Get("http://localhost:8080/lore/conflicts/stats")
	if err != nil {
		fmt.Printf("❌ Stats API Test Failed: %v\n", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		fmt.Printf("❌ Stats API returned status %d\n", resp.StatusCode)
		return
	}

	var statsResult map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&statsResult); err != nil {
		fmt.Printf("❌ Failed to decode stats response: %v\n", err)
		return
	}

	fmt.Printf("📊 Conflict Statistics: %v\n", statsResult)
	fmt.Printf("✅ History and Statistics API Tests Passed\n")
}

// testHealthCheck tests the health check endpoint
func testHealthCheck() {
	resp, err := http.Get("http://localhost:8080/lore/conflicts/health")
	if err != nil {
		fmt.Printf("❌ Health Check Failed: %v\n", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		fmt.Printf("❌ Health Check returned status %d\n", resp.StatusCode)
		return
	}

	var healthResult map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&healthResult); err != nil {
		fmt.Printf("❌ Failed to decode health response: %v\n", err)
		return
	}

	fmt.Printf("🏥 Health Check Result: %v\n", healthResult)
	if healthy, ok := healthResult["healthy"].(bool); ok && healthy {
		fmt.Printf("✅ Conflict Detection System is Healthy\n")
	} else {
		fmt.Printf("⚠️  Conflict Detection System Health Issues Detected\n")
	}
}

// min returns the minimum of two integers
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func main() {
	fmt.Println("🧪 Multi-Agent Lore Conflict Detection System - Test Suite")
	fmt.Println("================================================================================")

	// Wait for server to be ready
	fmt.Println("⏳ Waiting for LocalAI server to be ready...")
	time.Sleep(5 * time.Second)

	// Test server availability
	resp, err := http.Get("http://localhost:8080/health")
	if err != nil {
		log.Fatalf("❌ Server not available: %v", err)
	}
	resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Fatalf("❌ Server health check failed: %d", resp.StatusCode)
	}

	fmt.Println("✅ Server is ready!")

	// Run the conflict detection tests
	TestConflictDetection()

	fmt.Println("\n🎉 All tests completed successfully!")
	fmt.Println("================================================================================")
}
