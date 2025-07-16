package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const baseURL = "http://localhost:8081"

// TestSessionEnrichment tests the session-based lore scaling functionality
func testSessionEnrichment() {
	fmt.Println("🔮 Testing Session Enrichment & Contextual Lore Scaling")
	
	// Test session with multiple events to see scaling in action
	sessionID := "test_session_123"
	userID := "test_user"
	channelID := "test_channel"
	
	// Send multiple lore events to see scaling progression
	for i := 1; i <= 5; i++ {
		fmt.Printf("\n--- Event %d ---\n", i)
		
		// Create lore response event
		loreEvent := map[string]interface{}{
			"content":     fmt.Sprintf("The lore deepens... Event %d in the session", i),
			"user_id":     userID,
			"channel_id":  channelID,
			"session_id":  sessionID,
			"lore_level":  3, // Base level - should scale up with session progress
			"priority":    5,
			"tags":        []string{"test", "session", "scaling"},
			"metadata": map[string]interface{}{
				"test_session": true,
				"event_number": i,
			},
		}
		
		// Send the event
		err := sendLoreEvent("/lore/response", loreEvent)
		if err != nil {
			fmt.Printf("Error sending lore event %d: %v\n", i, err)
			continue
		}
		
		// Small delay to see session progression
		time.Sleep(100 * time.Millisecond)
	}
	
	// Now test cursed output scaling
	fmt.Println("\n--- Testing Cursed Output Scaling ---")
	for i := 1; i <= 3; i++ {
		cursedEvent := map[string]interface{}{
			"content":       fmt.Sprintf("The darkness grows... Cursed event %d", i),
			"user_id":       userID,
			"channel_id":    channelID,
			"session_id":    sessionID,
			"cursed_level":  4, // Base level - should scale with session
			"priority":      6,
			"tags":          []string{"cursed", "darkness", "scaling"},
			"metadata": map[string]interface{}{
				"cursed_test": true,
				"event_number": i,
			},
		}
		
		err := sendLoreEvent("/lore/cursed", cursedEvent)
		if err != nil {
			fmt.Printf("Error sending cursed event %d: %v\n", i, err)
			continue
		}
		
		time.Sleep(100 * time.Millisecond)
	}
	
	// Test reactive dialogue scaling
	fmt.Println("\n--- Testing Reactive Dialogue Scaling ---")
	for i := 1; i <= 2; i++ {
		reactiveEvent := map[string]interface{}{
			"content":     fmt.Sprintf("The system responds... Reactive event %d", i),
			"user_id":     userID,
			"channel_id":  channelID,
			"session_id":  sessionID,
			"priority":    7,
			"sentiment":   0.5,
			"tags":        []string{"reactive", "response", "scaling"},
			"metadata": map[string]interface{}{
				"reactive_test": true,
				"event_number": i,
			},
		}
		
		err := sendLoreEvent("/lore/reactive", reactiveEvent)
		if err != nil {
			fmt.Printf("Error sending reactive event %d: %v\n", i, err)
			continue
		}
		
		time.Sleep(100 * time.Millisecond)
	}
	
	// Wait for processing
	time.Sleep(2 * time.Second)
	
	// Check session statistics
	fmt.Println("\n--- Session Statistics ---")
	sessionStats, err := getSessionStats()
	if err != nil {
		fmt.Printf("Error getting session stats: %v\n", err)
	} else {
		fmt.Printf("Session Stats: %+v\n", sessionStats)
	}
	
	// Check specific session details
	fmt.Println("\n--- Session Details ---")
	sessionDetails, err := getSessionDetails(sessionID)
	if err != nil {
		fmt.Printf("Error getting session details: %v\n", err)
	} else {
		fmt.Printf("Session Details: %+v\n", sessionDetails)
	}
	
	// Check lore dispatcher statistics
	fmt.Println("\n--- Lore Dispatcher Statistics ---")
	loreStats, err := getLoreStats()
	if err != nil {
		fmt.Printf("Error getting lore stats: %v\n", err)
	} else {
		fmt.Printf("Lore Stats: %+v\n", loreStats)
	}
}

// sendLoreEvent sends a lore event to the specified endpoint
func sendLoreEvent(endpoint string, event map[string]interface{}) error {
	jsonData, err := json.Marshal(event)
	if err != nil {
		return err
	}
	
	resp, err := http.Post(baseURL+endpoint, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))
	}
	
	fmt.Printf("✅ Successfully sent event to %s\n", endpoint)
	return nil
}

// getSessionStats retrieves session statistics
func getSessionStats() (map[string]interface{}, error) {
	resp, err := http.Get(baseURL + "/lore/sessions/stats")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))
	}
	
	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}
	
	return result, nil
}

// getSessionDetails retrieves details for a specific session
func getSessionDetails(sessionID string) (map[string]interface{}, error) {
	resp, err := http.Get(baseURL + "/lore/sessions/" + sessionID)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))
	}
	
	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}
	
	return result, nil
}

// getLoreStats retrieves lore dispatcher statistics
func getLoreStats() (map[string]interface{}, error) {
	resp, err := http.Get(baseURL + "/lore/stats")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))
	}
	
	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}
	
	return result, nil
}

// testSessionArchives tests session archiving functionality
func testSessionArchives() {
	fmt.Println("\n🗂️ Testing Session Archives")
	
	// Create a session with multiple events
	sessionID := "archive_test_session"
	userID := "archive_user"
	channelID := "archive_channel"
	
	// Send events with different lore levels
	events := []map[string]interface{}{
		{
			"content":     "Initial lore event - should be level 3",
			"user_id":     userID,
			"channel_id":  channelID,
			"session_id":  sessionID,
			"lore_level":  3,
			"priority":    5,
			"tags":        []string{"initial", "archive"},
		},
		{
			"content":     "Mid-session lore - should scale up",
			"user_id":     userID,
			"channel_id":  channelID,
			"session_id":  sessionID,
			"lore_level":  4,
			"priority":    6,
			"tags":        []string{"mid", "archive"},
		},
		{
			"content":     "Final lore event - should be highly scaled",
			"user_id":     userID,
			"channel_id":  channelID,
			"session_id":  sessionID,
			"lore_level":  5,
			"priority":    7,
			"tags":        []string{"final", "archive"},
		},
	}
	
	for i, event := range events {
		fmt.Printf("Sending archive event %d...\n", i+1)
		err := sendLoreEvent("/lore/response", event)
		if err != nil {
			fmt.Printf("Error: %v\n", err)
		}
		time.Sleep(500 * time.Millisecond)
	}
	
	// Wait for processing
	time.Sleep(2 * time.Second)
	
	// Get session archive
	fmt.Println("\n--- Session Archive ---")
	sessionDetails, err := getSessionDetails(sessionID)
	if err != nil {
		fmt.Printf("Error getting session archive: %v\n", err)
	} else {
		if session, ok := sessionDetails["session"].(map[string]interface{}); ok {
			fmt.Printf("Session ID: %v\n", session["session_id"])
			fmt.Printf("Event Count: %v\n", session["event_count"])
			fmt.Printf("Scaling Factor: %v\n", session["scaling_factor"])
			fmt.Printf("Base Lore Level: %v\n", session["base_lore_level"])
			fmt.Printf("Max Lore Level: %v\n", session["max_lore_level"])
			
			if events, ok := session["lore_events"].([]interface{}); ok {
				fmt.Printf("Archived Events: %d\n", len(events))
				for i, event := range events {
					if e, ok := event.(map[string]interface{}); ok {
						fmt.Printf("  Event %d: Level %v, Type %v\n", i+1, e["lore_level"], e["type"])
					}
				}
			}
		}
	}
}

func runSessionEnrichmentTests() {
	fmt.Println("🌟 Session Enrichment Testing Suite")
	fmt.Println("===================================")
	
	// Test session enrichment and scaling
	testSessionEnrichment()
	
	// Test session archives
	testSessionArchives()
	
	fmt.Println("\n🎯 Session enrichment testing completed!")
}

func main() {
	runSessionEnrichmentTests()
}
