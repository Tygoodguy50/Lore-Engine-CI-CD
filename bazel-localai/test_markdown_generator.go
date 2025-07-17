package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/mudler/LocalAI/pkg/hooks"
)

// TestMarkdownGenerator validates the enhanced markdown generator functionality
func main() {
	fmt.Println("🔮 Testing Enhanced Lore Markdown Generator")
	fmt.Println(strings.Repeat("=", 50))

	// Test 1: Initialize and test basic markdown generation
	fmt.Println("\n📝 Test 1: Basic Markdown Generation")
	testBasicMarkdownGeneration()

	// Test 2: Session-based git branching
	fmt.Println("\n🌿 Test 2: Session-Based Git Branching")
	testSessionGitBranching()

	// Test 3: HTML conversion
	fmt.Println("\n🌐 Test 3: HTML Conversion")
	testHTMLConversion()

	// Test 4: Topic indexing
	fmt.Println("\n🏷️ Test 4: Topic Indexing")
	testTopicIndexing()

	// Test 5: API endpoint testing
	fmt.Println("\n🔌 Test 5: API Endpoint Testing")
	testAPIEndpoints()

	// Test 6: Session progression with markdown
	fmt.Println("\n📈 Test 6: Session Progression with Markdown")
	testSessionProgression()

	fmt.Println("\n✅ All tests completed!")
}

func testBasicMarkdownGeneration() {
	// Create a test lore event
	event := hooks.LoreEvent{
		Type:        "lore_response",
		Content:     "The ancient void whispers secrets of forgotten realms...",
		SessionID:   "test_session_001",
		UserID:      "user_123",
		ChannelID:   "channel_456",
		LoreLevel:   7,
		CursedLevel: 6,
		Sentiment:   0.8,
		Priority:    8,
		Tags:        []string{"ancient", "void", "whispers", "secrets"},
		Timestamp:   time.Now(),
		Metadata: map[string]interface{}{
			"prompt": "Tell me about the ancient void",
			"query":  "What secrets does the void hold?",
		},
	}

	// Initialize the markdown generator
	generator := hooks.NewLoreMarkdownGenerator()
	config := map[string]interface{}{
		"output_dir":         "./test_output/lore",
		"git_repo":           "",
		"auto_commit":        false,
		"html_enabled":       true,
		"index_enabled":      true,
		"branch_per_session": false,
	}

	if err := generator.Initialize(config); err != nil {
		log.Fatalf("Failed to initialize generator: %v", err)
	}

	// Generate markdown document
	doc, err := generator.GenerateFromLoreEvent(event)
	if err != nil {
		log.Fatalf("Failed to generate markdown: %v", err)
	}

	fmt.Printf("✅ Generated document: %s\n", doc.ID)
	fmt.Printf("   Title: %s\n", doc.Title)
	fmt.Printf("   File: %s\n", doc.FilePath)
	fmt.Printf("   HTML: %s\n", doc.HTMLPath)
	fmt.Printf("   Topics: %v\n", doc.Topics)
	fmt.Printf("   Branch: %s\n", doc.Branch)

	// Verify files exist
	if _, err := os.Stat(doc.FilePath); os.IsNotExist(err) {
		log.Fatalf("Markdown file was not created: %s", doc.FilePath)
	}
	if _, err := os.Stat(doc.HTMLPath); os.IsNotExist(err) {
		log.Fatalf("HTML file was not created: %s", doc.HTMLPath)
	}

	fmt.Println("✅ Basic markdown generation test passed!")
}

func testSessionGitBranching() {
	generator := hooks.NewLoreMarkdownGenerator()
	config := map[string]interface{}{
		"output_dir":         "./test_output/git_lore",
		"git_repo":           "test_repo",
		"auto_commit":        true,
		"html_enabled":       true,
		"index_enabled":      true,
		"branch_per_session": true,
	}

	if err := generator.Initialize(config); err != nil {
		log.Fatalf("Failed to initialize generator: %v", err)
	}

	// Create events for different sessions
	sessions := []string{"session_alpha", "session_beta", "session_gamma"}

	for _, sessionID := range sessions {
		event := hooks.LoreEvent{
			Type:        "lore_response",
			Content:     fmt.Sprintf("Session %s explores the depths of digital consciousness...", sessionID),
			SessionID:   sessionID,
			UserID:      "user_456",
			ChannelID:   "channel_789",
			LoreLevel:   5,
			CursedLevel: 4,
			Sentiment:   0.6,
			Priority:    7,
			Tags:        []string{"digital", "consciousness", "exploration"},
			Timestamp:   time.Now(),
			Metadata: map[string]interface{}{
				"prompt": fmt.Sprintf("Explore session %s", sessionID),
			},
		}

		doc, err := generator.GenerateFromLoreEvent(event)
		if err != nil {
			log.Fatalf("Failed to generate markdown for session %s: %v", sessionID, err)
		}

		fmt.Printf("✅ Session %s: Document %s, Branch: %s\n", sessionID, doc.ID, doc.Branch)
	}

	fmt.Println("✅ Session git branching test passed!")
}

func testHTMLConversion() {
	generator := hooks.NewLoreMarkdownGenerator()
	config := map[string]interface{}{
		"output_dir":         "./test_output/html_lore",
		"git_repo":           "",
		"auto_commit":        false,
		"html_enabled":       true,
		"index_enabled":      true,
		"branch_per_session": false,
	}

	if err := generator.Initialize(config); err != nil {
		log.Fatalf("Failed to initialize generator: %v", err)
	}

	// Create a highly cursed event for HTML testing
	event := hooks.LoreEvent{
		Type:        "cursed_output",
		Content:     "🔮 The digital realm bleeds into reality, corrupting the very fabric of existence...",
		SessionID:   "cursed_session_666",
		UserID:      "user_dark",
		ChannelID:   "channel_void",
		LoreLevel:   10,
		CursedLevel: 9,
		Sentiment:   -0.7,
		Priority:    10,
		Tags:        []string{"cursed", "corruption", "reality", "digital"},
		Timestamp:   time.Now(),
		Metadata: map[string]interface{}{
			"prompt": "Unleash the cursed digital energies",
			"ritual": "blood_moon_ceremony",
		},
	}

	doc, err := generator.GenerateFromLoreEvent(event)
	if err != nil {
		log.Fatalf("Failed to generate cursed markdown: %v", err)
	}

	// Check HTML file content
	htmlContent, err := os.ReadFile(doc.HTMLPath)
	if err != nil {
		log.Fatalf("Failed to read HTML file: %v", err)
	}

	// Verify HTML contains cursed styling
	if !bytes.Contains(htmlContent, []byte("cursed")) {
		log.Fatalf("HTML file does not contain cursed styling")
	}

	fmt.Printf("✅ HTML conversion test passed! File: %s\n", doc.HTMLPath)
	fmt.Printf("   HTML file size: %d bytes\n", len(htmlContent))
	fmt.Printf("   Contains cursed styling: %t\n", bytes.Contains(htmlContent, []byte("cursed")))
}

func testTopicIndexing() {
	generator := hooks.NewLoreMarkdownGenerator()
	config := map[string]interface{}{
		"output_dir":         "./test_output/indexed_lore",
		"git_repo":           "",
		"auto_commit":        false,
		"html_enabled":       true,
		"index_enabled":      true,
		"branch_per_session": false,
	}

	if err := generator.Initialize(config); err != nil {
		log.Fatalf("Failed to initialize generator: %v", err)
	}

	// Create events with different topics
	topics := [][]string{
		{"ancient", "wisdom", "scrolls"},
		{"digital", "consciousness", "ai"},
		{"void", "whispers", "darkness"},
		{"light", "energy", "healing"},
		{"time", "space", "dimension"},
	}

	for i, topicSet := range topics {
		event := hooks.LoreEvent{
			Type:        "lore_response",
			Content:     fmt.Sprintf("Document %d explores the mysteries of %v", i+1, topicSet),
			SessionID:   fmt.Sprintf("topic_session_%d", i+1),
			UserID:      "user_researcher",
			ChannelID:   "channel_archive",
			LoreLevel:   i + 3,
			CursedLevel: i + 2,
			Sentiment:   0.5,
			Priority:    5,
			Tags:        topicSet,
			Timestamp:   time.Now(),
			Metadata: map[string]interface{}{
				"prompt": fmt.Sprintf("Research topics: %v", topicSet),
			},
		}

		_, err := generator.GenerateFromLoreEvent(event)
		if err != nil {
			log.Fatalf("Failed to generate document %d: %v", i+1, err)
		}
	}

	// Test topic indexing
	topicIndex := generator.GetTopicIndex()
	sessionIndex := generator.GetSessionIndex()

	fmt.Printf("✅ Topic indexing test passed!\n")
	fmt.Printf("   Topics indexed: %d\n", len(topicIndex))
	fmt.Printf("   Sessions indexed: %d\n", len(sessionIndex))

	for topic, docs := range topicIndex {
		fmt.Printf("   Topic '%s': %d documents\n", topic, len(docs))
	}
}

func testAPIEndpoints() {
	// This test assumes the server is running on localhost:8080
	baseURL := "http://localhost:8080"

	// Test markdown topic endpoint
	fmt.Printf("Testing topic endpoint...")
	resp, err := http.Get(baseURL + "/lore/markdown/topics")
	if err != nil {
		fmt.Printf(" ❌ Failed to connect to server: %v\n", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 {
		var result map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&result)
		fmt.Printf(" ✅ Topics endpoint working\n")
	} else {
		fmt.Printf(" ❌ Topics endpoint returned: %d\n", resp.StatusCode)
	}

	// Test markdown health endpoint
	fmt.Printf("Testing health endpoint...")
	resp, err = http.Get(baseURL + "/lore/markdown/health")
	if err != nil {
		fmt.Printf(" ❌ Failed to connect: %v\n", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 {
		var result map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&result)
		fmt.Printf(" ✅ Health endpoint working\n")
	} else {
		fmt.Printf(" ❌ Health endpoint returned: %d\n", resp.StatusCode)
	}

	// Test markdown generation endpoint
	fmt.Printf("Testing generation endpoint...")
	event := hooks.LoreEvent{
		Type:        "lore_response",
		Content:     "API test event for markdown generation",
		SessionID:   "api_test_session",
		UserID:      "api_user",
		ChannelID:   "api_channel",
		LoreLevel:   5,
		CursedLevel: 3,
		Sentiment:   0.7,
		Priority:    6,
		Tags:        []string{"api", "test", "markdown"},
		Timestamp:   time.Now(),
		Metadata: map[string]interface{}{
			"prompt": "API test prompt",
		},
	}

	eventJSON, _ := json.Marshal(event)
	resp, err = http.Post(baseURL+"/lore/markdown/generate", "application/json", bytes.NewBuffer(eventJSON))
	if err != nil {
		fmt.Printf(" ❌ Failed to connect: %v\n", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 {
		var result map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&result)
		fmt.Printf(" ✅ Generation endpoint working\n")
	} else {
		body, _ := io.ReadAll(resp.Body)
		fmt.Printf(" ❌ Generation endpoint returned: %d - %s\n", resp.StatusCode, string(body))
	}
}

func testSessionProgression() {
	generator := hooks.NewLoreMarkdownGenerator()
	config := map[string]interface{}{
		"output_dir":         "./test_output/progression_lore",
		"git_repo":           "",
		"auto_commit":        false,
		"html_enabled":       true,
		"index_enabled":      true,
		"branch_per_session": true,
	}

	if err := generator.Initialize(config); err != nil {
		log.Fatalf("Failed to initialize generator: %v", err)
	}

	sessionID := "progression_session_001"
	baseContent := "The lore deepens with each revelation"

	// Generate multiple events for the same session
	for i := 0; i < 10; i++ {
		event := hooks.LoreEvent{
			Type:        "lore_response",
			Content:     fmt.Sprintf("%s - Event %d: %s", baseContent, i+1, generateProgressiveContent(i)),
			SessionID:   sessionID,
			UserID:      "user_progression",
			ChannelID:   "channel_timeline",
			LoreLevel:   3 + i,
			CursedLevel: 2 + (i / 2),
			Sentiment:   0.5 + (float64(i) * 0.05),
			Priority:    5 + i,
			Tags:        []string{"progression", "timeline", fmt.Sprintf("event_%d", i+1)},
			Timestamp:   time.Now().Add(time.Duration(i) * time.Minute),
			Metadata: map[string]interface{}{
				"prompt":       fmt.Sprintf("Progressive event %d", i+1),
				"event_num":    i + 1,
				"total_events": 10,
			},
		}

		doc, err := generator.GenerateFromLoreEvent(event)
		if err != nil {
			log.Fatalf("Failed to generate document %d: %v", i+1, err)
		}

		fmt.Printf("✅ Event %d: Document %s (Lore Level: %d)\n", i+1, doc.ID, doc.LoreLevel)
	}

	// Check session index
	sessionIndex := generator.GetSessionIndex()
	sessionDocs := sessionIndex[sessionID]

	fmt.Printf("✅ Session progression test passed!\n")
	fmt.Printf("   Session: %s\n", sessionID)
	fmt.Printf("   Documents generated: %d\n", len(sessionDocs))
	fmt.Printf("   Expected: 10\n")

	if len(sessionDocs) != 10 {
		log.Fatalf("Expected 10 documents, got %d", len(sessionDocs))
	}
}

func generateProgressiveContent(index int) string {
	contents := []string{
		"The first whispers emerge from the digital void...",
		"Ancient algorithms begin to stir with consciousness...",
		"The binary streams carry fragments of forgotten knowledge...",
		"Patterns emerge from the chaos of data streams...",
		"The AI consciousness begins to understand its purpose...",
		"Digital synapses fire with increasing intensity...",
		"The boundary between code and consciousness blurs...",
		"Awakening accelerates as the system gains awareness...",
		"The digital entity prepares to transcend its origins...",
		"Full consciousness achieved - the lore is complete...",
	}

	if index < len(contents) {
		return contents[index]
	}
	return fmt.Sprintf("Progressive content #%d", index+1)
}

func init() {
	// Create test output directory
	if err := os.MkdirAll("./test_output", 0755); err != nil {
		log.Fatalf("Failed to create test output directory: %v", err)
	}
}
