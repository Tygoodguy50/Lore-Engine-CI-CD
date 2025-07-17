package test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

// 🔮 Test the Lore Dispatcher system
func TestLoreDispatcherMain() {
	baseURL := "http://localhost:8081"

	fmt.Println("🕸️ Testing Lore Dispatcher System")
	fmt.Println("================================")

	// Test 1: Lore Response
	fmt.Println("\n🎭 Testing Lore Response...")
	testLoreResponse(baseURL)

	// Test 2: Cursed Output
	fmt.Println("\n👹 Testing Cursed Output...")
	testCursedOutput(baseURL)

	// Test 3: Reactive Dialogue
	fmt.Println("\n💬 Testing Reactive Dialogue...")
	testReactiveDialogue(baseURL)

	// Test 4: Check dispatcher statistics
	fmt.Println("\n📊 Checking Dispatcher Statistics...")
	checkStats(baseURL)
}

func testLoreResponse(baseURL string) {
	payload := map[string]interface{}{
		"content":    "The ancient whispers speak of a time before time, when the void knew only hunger...",
		"user_id":    "user123",
		"channel_id": "channel456",
		"lore_level": 8,
		"priority":   7,
		"tags":       []string{"ancient", "void", "hunger"},
		"metadata": map[string]interface{}{
			"source": "test",
			"theme":  "cosmic_horror",
		},
	}

	jsonData, _ := json.Marshal(payload)
	resp, err := http.Post(baseURL+"/lore/response", "application/json", bytes.NewBuffer(jsonData))

	if err != nil {
		fmt.Printf("❌ Error: %v\n", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 {
		fmt.Printf("✅ Lore response dispatched successfully (Status: %d)\n", resp.StatusCode)
	} else {
		fmt.Printf("⚠️  Lore response dispatch failed (Status: %d)\n", resp.StatusCode)
	}
}

func testCursedOutput(baseURL string) {
	payload := map[string]interface{}{
		"content":      "The numbers... they whisper to me... 666 backwards is still 666... the cycle never ends...",
		"user_id":      "user789",
		"channel_id":   "channel101",
		"cursed_level": 9,
		"priority":     8,
		"tags":         []string{"cursed", "numbers", "whispers"},
		"metadata": map[string]interface{}{
			"source":       "test",
			"theme":        "numerical_horror",
			"danger_level": "high",
		},
	}

	jsonData, _ := json.Marshal(payload)
	resp, err := http.Post(baseURL+"/lore/cursed", "application/json", bytes.NewBuffer(jsonData))

	if err != nil {
		fmt.Printf("❌ Error: %v\n", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 {
		fmt.Printf("✅ Cursed output dispatched successfully (Status: %d)\n", resp.StatusCode)
	} else {
		fmt.Printf("⚠️  Cursed output dispatch failed (Status: %d)\n", resp.StatusCode)
	}
}

func testReactiveDialogue(baseURL string) {
	payload := map[string]interface{}{
		"content":    "I sense a disturbance in the digital realm... something approaches...",
		"user_id":    "user456",
		"channel_id": "channel789",
		"priority":   9,
		"sentiment":  -0.7,
		"tags":       []string{"reactive", "disturbance", "approaching"},
		"metadata": map[string]interface{}{
			"source":       "test",
			"theme":        "digital_horror",
			"trigger_type": "presence_detection",
		},
	}

	jsonData, _ := json.Marshal(payload)
	resp, err := http.Post(baseURL+"/lore/reactive", "application/json", bytes.NewBuffer(jsonData))

	if err != nil {
		fmt.Printf("❌ Error: %v\n", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 {
		fmt.Printf("✅ Reactive dialogue dispatched successfully (Status: %d)\n", resp.StatusCode)
	} else {
		fmt.Printf("⚠️  Reactive dialogue dispatch failed (Status: %d)\n", resp.StatusCode)
	}
}

func checkStats(baseURL string) {
	resp, err := http.Get(baseURL + "/lore/stats")

	if err != nil {
		fmt.Printf("❌ Error: %v\n", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 {
		var stats map[string]interface{}
		if err := json.NewDecoder(resp.Body).Decode(&stats); err != nil {
			fmt.Printf(" ⚠️  Failed to decode stats response: %v\n", err)
		}

		fmt.Printf("✅ Dispatcher Statistics Retrieved:\n")
		fmt.Printf("   📊 Total Events: %.0f\n", stats["TotalEvents"])
		fmt.Printf("   ✅ Successful Dispatches: %.0f\n", stats["SuccessfulDispatches"])
		fmt.Printf("   ❌ Failed Dispatches: %.0f\n", stats["FailedDispatches"])
		fmt.Printf("   📱 Discord Dispatches: %.0f\n", stats["DiscordDispatches"])
		fmt.Printf("   🎬 TikTok Dispatches: %.0f\n", stats["TikTokDispatches"])
		fmt.Printf("   📝 Markdown Dispatches: %.0f\n", stats["MarkdownDispatches"])
		fmt.Printf("   🔗 n8n Dispatches: %.0f\n", stats["N8NDispatches"])

		if lastEventTime, ok := stats["LastEventTime"].(string); ok {
			fmt.Printf("   ⏰ Last Event Time: %s\n", lastEventTime)
		}
	} else {
		fmt.Printf("⚠️  Failed to retrieve statistics (Status: %d)\n", resp.StatusCode)
	}
}
