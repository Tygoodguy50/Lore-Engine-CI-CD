package main

import (
	"bytes"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"time"
)

// 🧼 Input Normalization Pre-Filter
// Normalizes and validates input before dispatching to avoid untagged/malformed events

type InputFilter struct {
	config FilterConfig
}

type FilterConfig struct {
	RequiredFields   []string                  `json:"required_fields"`
	DefaultTags      []string                  `json:"default_tags"`
	TagPatterns      map[string]*regexp.Regexp `json:"-"` // Compiled patterns
	ContentFilters   []string                  `json:"content_filters"`
	MaxContentLength int                       `json:"max_content_length"`
	MinLoreLevel     int                       `json:"min_lore_level"`
	MaxLoreLevel     int                       `json:"max_lore_level"`
	AutoEnhance      bool                      `json:"auto_enhance"`
	StrictMode       bool                      `json:"strict_mode"`
}

type LoreEvent struct {
	Type         string                 `json:"type"`
	Content      string                 `json:"content"`
	UserID       string                 `json:"user_id"`
	ChannelID    string                 `json:"channel_id"`
	LoreLevel    int                    `json:"lore_level"`
	CursedLevel  int                    `json:"cursed_level"`
	Priority     int                    `json:"priority"`
	Sentiment    float64                `json:"sentiment"`
	Tags         []string               `json:"tags"`
	Metadata     map[string]interface{} `json:"metadata"`
	SessionID    string                 `json:"session_id"`
	Timestamp    time.Time              `json:"timestamp"`
	ReferralCode string                 `json:"referral_code,omitempty"`
	Normalized   bool                   `json:"normalized"`
	FilteredBy   string                 `json:"filtered_by"`
}

type FilterResult struct {
	Success      bool       `json:"success"`
	Event        *LoreEvent `json:"event,omitempty"`
	Errors       []string   `json:"errors,omitempty"`
	Warnings     []string   `json:"warnings,omitempty"`
	Enhancements []string   `json:"enhancements,omitempty"`
	FilterID     string     `json:"filter_id"`
}

// NewInputFilter creates a new input filter with default configuration
func NewInputFilter() *InputFilter {
	config := FilterConfig{
		RequiredFields:   []string{"content", "user_id", "type"},
		DefaultTags:      []string{"lore", "filtered", "normalized"},
		ContentFilters:   []string{"spam", "bot", "duplicate"},
		MaxContentLength: 5000,
		MinLoreLevel:     1,
		MaxLoreLevel:     10,
		AutoEnhance:      true,
		StrictMode:       false,
		TagPatterns:      make(map[string]*regexp.Regexp),
	}

	// Compile tag patterns
	config.TagPatterns["cosmic"] = regexp.MustCompile(`(?i)(cosmic|void|ancient|eternal|infinite)`)
	config.TagPatterns["cursed"] = regexp.MustCompile(`(?i)(cursed|dark|shadow|nightmare|horror)`)
	config.TagPatterns["viral"] = regexp.MustCompile(`(?i)(viral|trending|popular|spread|share)`)
	config.TagPatterns["engagement"] = regexp.MustCompile(`(?i)(like|comment|follow|subscribe)`)

	return &InputFilter{config: config}
}

// NormalizeEvent processes and normalizes a lore event
func (f *InputFilter) NormalizeEvent(rawEvent map[string]interface{}) *FilterResult {
	result := &FilterResult{
		FilterID:     f.generateFilterID(),
		Success:      true,
		Errors:       []string{},
		Warnings:     []string{},
		Enhancements: []string{},
	}

	// Convert raw event to structured event
	event, err := f.convertToLoreEvent(rawEvent)
	if err != nil {
		result.Success = false
		result.Errors = append(result.Errors, fmt.Sprintf("Event conversion failed: %v", err))
		return result
	}

	// Validate required fields
	if !f.validateRequiredFields(event, result) {
		result.Success = false
		return result
	}

	// Normalize content
	f.normalizeContent(event, result)

	// Auto-generate missing fields
	f.autoGenerateFields(event, result)

	// Auto-tag based on content
	f.autoTagContent(event, result)

	// Validate ranges
	f.validateRanges(event, result)

	// Generate session ID if missing
	f.ensureSessionID(event, result)

	// Add referral code if configured
	f.addReferralCode(event, result)

	// Mark as normalized
	event.Normalized = true
	event.FilteredBy = result.FilterID
	event.Timestamp = time.Now()

	result.Event = event
	return result
}

// validateRequiredFields ensures all required fields are present
func (f *InputFilter) validateRequiredFields(event *LoreEvent, result *FilterResult) bool {
	for _, field := range f.config.RequiredFields {
		switch field {
		case "content":
			if event.Content == "" {
				result.Errors = append(result.Errors, "Content field is required")
				return false
			}
		case "user_id":
			if event.UserID == "" {
				result.Errors = append(result.Errors, "UserID field is required")
				return false
			}
		case "type":
			if event.Type == "" {
				result.Errors = append(result.Errors, "Type field is required")
				return false
			}
		case "channel_id":
			if event.ChannelID == "" {
				result.Errors = append(result.Errors, "ChannelID field is required")
				return false
			}
		}
	}
	return true
}

// normalizeContent cleans and validates content
func (f *InputFilter) normalizeContent(event *LoreEvent, result *FilterResult) {
	original := event.Content

	// Trim whitespace
	event.Content = strings.TrimSpace(event.Content)

	// Check max length
	if len(event.Content) > f.config.MaxContentLength {
		event.Content = event.Content[:f.config.MaxContentLength] + "..."
		result.Warnings = append(result.Warnings, "Content truncated to max length")
	}

	// Remove excessive whitespace
	re := regexp.MustCompile(`\s+`)
	event.Content = re.ReplaceAllString(event.Content, " ")

	// Filter spam patterns (basic implementation)
	spamPatterns := []string{
		`(?i)click\s+here`,
		`(?i)free\s+money`,
		`(?i)buy\s+now`,
		`(?i)limited\s+time`,
	}

	for _, pattern := range spamPatterns {
		re := regexp.MustCompile(pattern)
		if re.MatchString(event.Content) {
			result.Warnings = append(result.Warnings, "Content contains potential spam patterns")
			break
		}
	}

	if original != event.Content {
		result.Enhancements = append(result.Enhancements, "Content normalized and cleaned")
	}
}

// autoGenerateFields generates missing fields with defaults
func (f *InputFilter) autoGenerateFields(event *LoreEvent, result *FilterResult) {
	if event.ChannelID == "" {
		event.ChannelID = "auto_generated"
		result.Enhancements = append(result.Enhancements, "Auto-generated channel_id")
	}

	if event.LoreLevel == 0 {
		event.LoreLevel = f.estimateLoreLevel(event.Content)
		result.Enhancements = append(result.Enhancements, fmt.Sprintf("Auto-estimated lore_level: %d", event.LoreLevel))
	}

	if event.Priority == 0 {
		event.Priority = f.estimatePriority(event.Content, event.LoreLevel)
		result.Enhancements = append(result.Enhancements, fmt.Sprintf("Auto-estimated priority: %d", event.Priority))
	}

	if event.CursedLevel == 0 && event.Type == "cursed_output" {
		event.CursedLevel = f.estimateCursedLevel(event.Content)
		result.Enhancements = append(result.Enhancements, fmt.Sprintf("Auto-estimated cursed_level: %d", event.CursedLevel))
	}

	// Initialize metadata if nil
	if event.Metadata == nil {
		event.Metadata = make(map[string]interface{})
		result.Enhancements = append(result.Enhancements, "Initialized metadata object")
	}

	// Add filter metadata
	event.Metadata["filter_version"] = "v1.0"
	event.Metadata["filtered_at"] = time.Now().Unix()
	event.Metadata["content_hash"] = f.generateContentHash(event.Content)
}

// autoTagContent automatically tags content based on patterns
func (f *InputFilter) autoTagContent(event *LoreEvent, result *FilterResult) {
	if event.Tags == nil {
		event.Tags = []string{}
	}

	// Add default tags
	event.Tags = append(event.Tags, f.config.DefaultTags...)

	// Auto-tag based on content patterns
	for tagName, pattern := range f.config.TagPatterns {
		if pattern.MatchString(event.Content) {
			if !f.containsTag(event.Tags, tagName) {
				event.Tags = append(event.Tags, tagName)
				result.Enhancements = append(result.Enhancements, fmt.Sprintf("Auto-tagged: %s", tagName))
			}
		}
	}

	// Type-specific tags
	if !f.containsTag(event.Tags, event.Type) {
		event.Tags = append(event.Tags, event.Type)
		result.Enhancements = append(result.Enhancements, fmt.Sprintf("Added type tag: %s", event.Type))
	}

	// Remove duplicates
	event.Tags = f.removeDuplicateTags(event.Tags)
}

// validateRanges ensures numeric fields are within valid ranges
func (f *InputFilter) validateRanges(event *LoreEvent, result *FilterResult) {
	// Validate lore level
	if event.LoreLevel < f.config.MinLoreLevel {
		event.LoreLevel = f.config.MinLoreLevel
		result.Warnings = append(result.Warnings, fmt.Sprintf("Lore level adjusted to minimum: %d", f.config.MinLoreLevel))
	}
	if event.LoreLevel > f.config.MaxLoreLevel {
		event.LoreLevel = f.config.MaxLoreLevel
		result.Warnings = append(result.Warnings, fmt.Sprintf("Lore level adjusted to maximum: %d", f.config.MaxLoreLevel))
	}

	// Validate priority (1-10)
	if event.Priority < 1 {
		event.Priority = 1
		result.Warnings = append(result.Warnings, "Priority adjusted to minimum: 1")
	}
	if event.Priority > 10 {
		event.Priority = 10
		result.Warnings = append(result.Warnings, "Priority adjusted to maximum: 10")
	}

	// Validate cursed level (1-10)
	if event.CursedLevel < 0 {
		event.CursedLevel = 0
	}
	if event.CursedLevel > 10 {
		event.CursedLevel = 10
		result.Warnings = append(result.Warnings, "Cursed level adjusted to maximum: 10")
	}

	// Validate sentiment (-1.0 to 1.0)
	if event.Sentiment < -1.0 {
		event.Sentiment = -1.0
		result.Warnings = append(result.Warnings, "Sentiment adjusted to minimum: -1.0")
	}
	if event.Sentiment > 1.0 {
		event.Sentiment = 1.0
		result.Warnings = append(result.Warnings, "Sentiment adjusted to maximum: 1.0")
	}
}

// ensureSessionID generates session ID if missing
func (f *InputFilter) ensureSessionID(event *LoreEvent, result *FilterResult) {
	if event.SessionID == "" {
		event.SessionID = f.generateSessionID(event.UserID, event.ChannelID)
		result.Enhancements = append(result.Enhancements, "Generated session ID")
	}
}

// addReferralCode adds referral code for viral tracking
func (f *InputFilter) addReferralCode(event *LoreEvent, result *FilterResult) {
	if event.ReferralCode == "" && f.config.AutoEnhance {
		event.ReferralCode = f.generateReferralCode(event.Type)
		result.Enhancements = append(result.Enhancements, "Generated referral code")
	}
}

// Helper functions for estimation
func (f *InputFilter) estimateLoreLevel(content string) int {
	length := len(content)
	mysticalWords := f.countMysticalWords(content)

	// Base level from content length
	level := 3
	if length > 500 {
		level = 5
	}
	if length > 1000 {
		level = 7
	}

	// Bonus for mystical content
	level += mysticalWords

	if level > 10 {
		level = 10
	}
	if level < 1 {
		level = 1
	}

	return level
}

func (f *InputFilter) estimatePriority(content string, loreLevel int) int {
	priority := loreLevel/2 + 2 // Base priority from lore level

	urgentWords := []string{"urgent", "emergency", "critical", "viral", "trending"}
	for _, word := range urgentWords {
		if strings.Contains(strings.ToLower(content), word) {
			priority += 2
			break
		}
	}

	if priority > 10 {
		priority = 10
	}
	if priority < 1 {
		priority = 1
	}

	return priority
}

func (f *InputFilter) estimateCursedLevel(content string) int {
	cursedWords := []string{"cursed", "dark", "nightmare", "horror", "evil", "demon", "666", "hell"}
	level := 3 // Base cursed level

	for _, word := range cursedWords {
		if strings.Contains(strings.ToLower(content), word) {
			level += 1
		}
	}

	if level > 10 {
		level = 10
	}

	return level
}

func (f *InputFilter) countMysticalWords(content string) int {
	mysticalWords := []string{"ancient", "cosmic", "void", "eternal", "whisper", "shadow", "mystery", "awakening"}
	count := 0

	for _, word := range mysticalWords {
		if strings.Contains(strings.ToLower(content), word) {
			count++
		}
	}

	return count
}

// Utility functions
func (f *InputFilter) containsTag(tags []string, tag string) bool {
	for _, t := range tags {
		if t == tag {
			return true
		}
	}
	return false
}

func (f *InputFilter) removeDuplicateTags(tags []string) []string {
	seen := make(map[string]bool)
	result := []string{}

	for _, tag := range tags {
		if !seen[tag] {
			seen[tag] = true
			result = append(result, tag)
		}
	}

	return result
}

func (f *InputFilter) generateFilterID() string {
	hash := md5.Sum([]byte(fmt.Sprintf("%d", time.Now().UnixNano())))
	return fmt.Sprintf("filter_%s", hex.EncodeToString(hash[:])[:8])
}

func (f *InputFilter) generateSessionID(userID, channelID string) string {
	hash := md5.Sum([]byte(fmt.Sprintf("%s:%s:%d", userID, channelID, time.Now().Unix())))
	return fmt.Sprintf("session_%s", hex.EncodeToString(hash[:])[:8])
}

func (f *InputFilter) generateReferralCode(eventType string) string {
	prefix := "LR"
	if eventType == "tiktok" {
		prefix = "TT"
	}
	timestamp := time.Now().Unix()
	hash := md5.Sum([]byte(fmt.Sprintf("%s:%d", eventType, timestamp)))
	return fmt.Sprintf("%s%s", prefix, hex.EncodeToString(hash[:])[:6])
}

func (f *InputFilter) generateContentHash(content string) string {
	hash := md5.Sum([]byte(content))
	return hex.EncodeToString(hash[:])
}

func (f *InputFilter) convertToLoreEvent(rawEvent map[string]interface{}) (*LoreEvent, error) {
	event := &LoreEvent{}

	// Convert fields with type checking
	if v, ok := rawEvent["type"].(string); ok {
		event.Type = v
	}
	if v, ok := rawEvent["content"].(string); ok {
		event.Content = v
	}
	if v, ok := rawEvent["user_id"].(string); ok {
		event.UserID = v
	}
	if v, ok := rawEvent["channel_id"].(string); ok {
		event.ChannelID = v
	}
	if v, ok := rawEvent["session_id"].(string); ok {
		event.SessionID = v
	}

	// Convert numeric fields
	if v, ok := rawEvent["lore_level"].(float64); ok {
		event.LoreLevel = int(v)
	} else if v, ok := rawEvent["lore_level"].(int); ok {
		event.LoreLevel = v
	}

	if v, ok := rawEvent["cursed_level"].(float64); ok {
		event.CursedLevel = int(v)
	} else if v, ok := rawEvent["cursed_level"].(int); ok {
		event.CursedLevel = v
	}

	if v, ok := rawEvent["priority"].(float64); ok {
		event.Priority = int(v)
	} else if v, ok := rawEvent["priority"].(int); ok {
		event.Priority = v
	}

	if v, ok := rawEvent["sentiment"].(float64); ok {
		event.Sentiment = v
	}

	// Convert tags array
	if v, ok := rawEvent["tags"].([]interface{}); ok {
		for _, tag := range v {
			if tagStr, ok := tag.(string); ok {
				event.Tags = append(event.Tags, tagStr)
			}
		}
	}

	// Convert metadata
	if v, ok := rawEvent["metadata"].(map[string]interface{}); ok {
		event.Metadata = v
	}

	return event, nil
}

// TestInputFilter demonstrates the filter functionality
func TestInputFilter() {
	fmt.Println("🧼 Input Normalization Pre-Filter - Test Suite")
	fmt.Println("===============================================")

	filter := NewInputFilter()

	// Test cases
	testCases := []map[string]interface{}{
		// Valid event
		{
			"type":    "lore_response",
			"content": "The ancient cosmic void whispers secrets of eternity...",
			"user_id": "user123",
		},
		// Missing fields
		{
			"content": "Some mysterious content without proper fields",
		},
		// Malformed content
		{
			"type":    "cursed_output",
			"content": "   This content has    excessive     whitespace    and is very long... " + strings.Repeat("A", 6000),
			"user_id": "user456",
		},
		// Event needing enhancement
		{
			"type":    "reactive_dialogue",
			"content": "Dark shadows emerge from the nightmare realm",
			"user_id": "user789",
			"tags":    []interface{}{"test", "dark", "test"}, // Has duplicates
		},
	}

	for i, testCase := range testCases {
		fmt.Printf("\n🧪 Test Case %d:\n", i+1)
		result := filter.NormalizeEvent(testCase)

		fmt.Printf("  Success: %v\n", result.Success)
		if len(result.Errors) > 0 {
			fmt.Printf("  Errors: %v\n", result.Errors)
		}
		if len(result.Warnings) > 0 {
			fmt.Printf("  Warnings: %v\n", result.Warnings)
		}
		if len(result.Enhancements) > 0 {
			fmt.Printf("  Enhancements: %v\n", result.Enhancements)
		}

		if result.Event != nil {
			fmt.Printf("  Normalized Event:\n")
			fmt.Printf("    Type: %s\n", result.Event.Type)
			fmt.Printf("    Content: %.50s...\n", result.Event.Content)
			fmt.Printf("    Lore Level: %d\n", result.Event.LoreLevel)
			fmt.Printf("    Priority: %d\n", result.Event.Priority)
			fmt.Printf("    Tags: %v\n", result.Event.Tags)
			fmt.Printf("    Referral Code: %s\n", result.Event.ReferralCode)
		}
	}
}

// FilterAndDispatch integrates with the Lore Dispatcher
func FilterAndDispatch(rawEvent map[string]interface{}, loreDispatcherURL string) error {
	filter := NewInputFilter()
	result := filter.NormalizeEvent(rawEvent)

	if !result.Success {
		return fmt.Errorf("event filtering failed: %v", result.Errors)
	}

	// Send normalized event to Lore Dispatcher
	jsonData, err := json.Marshal(result.Event)
	if err != nil {
		return fmt.Errorf("failed to marshal filtered event: %v", err)
	}

	resp, err := http.Post(loreDispatcherURL+"/lore/dispatch", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to dispatch filtered event: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return fmt.Errorf("dispatcher returned status %d", resp.StatusCode)
	}

	fmt.Printf("✅ Filtered and dispatched event with %d enhancements\n", len(result.Enhancements))
	return nil
}

func main() {
	TestInputFilter()

	fmt.Println("\n🧼 Testing integration with Lore Dispatcher...")

	// Test integration
	testEvent := map[string]interface{}{
		"content": "The viral essence spreads through the digital realm, awakening ancient algorithms",
		"user_id": "test_user",
		"type":    "viral_lore",
	}

	err := FilterAndDispatch(testEvent, "http://localhost:8084")
	if err != nil {
		fmt.Printf("❌ Integration test failed: %v\n", err)
	} else {
		fmt.Printf("✅ Integration test successful!\n")
	}

	fmt.Println("\n✅ Input Normalization Pre-Filter test completed!")
}
