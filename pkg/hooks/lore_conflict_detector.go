package hooks

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
)

// LoreConflictDetector analyzes lore events for contradictions and overlapping artifacts
type LoreConflictDetector struct {
	logger         *logrus.Logger
	langChainURL   string
	apiKey         string
	enabled        bool
	conflictThreshold float64
	
	// Conflict detection settings
	maxAnalysisEvents    int
	conflictWindow       time.Duration
	priorityEscalation   bool
	realTimeResolution   bool
	
	// Event storage and analysis
	eventHistory      []LoreEvent
	conflictCache     map[string]*ConflictAnalysis
	artifactIndex     map[string][]string
	topicConflicts    map[string][]*ConflictResult
	mutex             sync.RWMutex
	
	// Integration channels
	discordEnabled    bool
	tiktokEnabled     bool
	
	// Statistics
	totalAnalyses     int64
	conflictsDetected int64
	escalatedEvents   int64
	resolvedConflicts int64
}

// ConflictAnalysis represents a comprehensive conflict analysis
type ConflictAnalysis struct {
	ID              string                 `json:"id"`
	Timestamp       time.Time              `json:"timestamp"`
	Events          []LoreEvent            `json:"events"`
	ConflictType    string                 `json:"conflict_type"`
	Severity        float64                `json:"severity"`
	Contradictions  []ContradictionPair    `json:"contradictions"`
	Overlaps        []ArtifactOverlap      `json:"overlaps"`
	Resolution      *ConflictResolution    `json:"resolution"`
	Status          string                 `json:"status"`
	Priority        int                    `json:"priority"`
	Metadata        map[string]interface{} `json:"metadata"`
}

// ContradictionPair represents conflicting lore elements
type ContradictionPair struct {
	Event1         string    `json:"event1_id"`
	Event2         string    `json:"event2_id"`
	ConflictField  string    `json:"conflict_field"`
	Value1         string    `json:"value1"`
	Value2         string    `json:"value2"`
	Confidence     float64   `json:"confidence"`
	Severity       string    `json:"severity"`
	DetectedAt     time.Time `json:"detected_at"`
	Context        string    `json:"context"`
}

// ArtifactOverlap represents overlapping lore artifacts
type ArtifactOverlap struct {
	ArtifactType   string    `json:"artifact_type"`
	Events         []string  `json:"event_ids"`
	OverlapScore   float64   `json:"overlap_score"`
	Description    string    `json:"description"`
	Implications   []string  `json:"implications"`
	DetectedAt     time.Time `json:"detected_at"`
}

// ConflictResolution represents a proposed resolution
type ConflictResolution struct {
	ID               string                 `json:"id"`
	Strategy         string                 `json:"strategy"`
	Confidence       float64                `json:"confidence"`
	Actions          []ResolutionAction     `json:"actions"`
	EstimatedImpact  string                 `json:"estimated_impact"`
	RequiredApproval bool                   `json:"required_approval"`
	CreatedAt        time.Time              `json:"created_at"`
	Status           string                 `json:"status"`
}

// ResolutionAction represents a specific action to resolve conflicts
type ResolutionAction struct {
	Type        string                 `json:"type"`
	Target      string                 `json:"target"`
	Description string                 `json:"description"`
	Parameters  map[string]interface{} `json:"parameters"`
	Priority    int                    `json:"priority"`
}

// ConflictResult represents the result of conflict detection
type ConflictResult struct {
	ConflictDetected bool               `json:"conflict_detected"`
	Analysis         *ConflictAnalysis  `json:"analysis"`
	EscalationEvent  *LoreEvent         `json:"escalation_event"`
	Error            error              `json:"error,omitempty"`
}

// LangChainRequest represents a request to the LangChain API
type LangChainRequest struct {
	Model       string                 `json:"model"`
	Messages    []LangChainMessage     `json:"messages"`
	Temperature float64                `json:"temperature"`
	MaxTokens   int                    `json:"max_tokens"`
	Metadata    map[string]interface{} `json:"metadata"`
}

// LangChainMessage represents a message in the LangChain conversation
type LangChainMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// LangChainResponse represents the response from LangChain API
type LangChainResponse struct {
	Choices []LangChainChoice `json:"choices"`
	Usage   map[string]int    `json:"usage"`
	Error   string            `json:"error,omitempty"`
}

// LangChainChoice represents a choice in the LangChain response
type LangChainChoice struct {
	Message      LangChainMessage `json:"message"`
	FinishReason string           `json:"finish_reason"`
	Index        int              `json:"index"`
}

// NewLoreConflictDetector creates a new lore conflict detector
func NewLoreConflictDetector() *LoreConflictDetector {
	return &LoreConflictDetector{
		logger:              logrus.New(),
		conflictThreshold:   0.7,
		maxAnalysisEvents:   100,
		conflictWindow:      24 * time.Hour,
		priorityEscalation:  true,
		realTimeResolution:  true,
		eventHistory:        make([]LoreEvent, 0),
		conflictCache:       make(map[string]*ConflictAnalysis),
		artifactIndex:       make(map[string][]string),
		topicConflicts:      make(map[string][]*ConflictResult),
	}
}

// Initialize sets up the conflict detector
func (lcd *LoreConflictDetector) Initialize(config map[string]interface{}) error {
	lcd.logger.Info("🔍 Initializing Lore Conflict Detector")

	// Configure LangChain connection
	if url, ok := config["langchain_url"].(string); ok && url != "" {
		lcd.langChainURL = url
		lcd.enabled = true
	} else {
		lcd.logger.Warn("LangChain URL not configured, conflict detection disabled")
		lcd.enabled = false
		return nil
	}

	if apiKey, ok := config["api_key"].(string); ok {
		lcd.apiKey = apiKey
	}

	// Configure thresholds and settings
	if threshold, ok := config["conflict_threshold"].(float64); ok {
		lcd.conflictThreshold = threshold
	}

	if maxEvents, ok := config["max_analysis_events"].(int); ok {
		lcd.maxAnalysisEvents = maxEvents
	}

	if window, ok := config["conflict_window"].(time.Duration); ok {
		lcd.conflictWindow = window
	}

	if escalation, ok := config["priority_escalation"].(bool); ok {
		lcd.priorityEscalation = escalation
	}

	if realTime, ok := config["real_time_resolution"].(bool); ok {
		lcd.realTimeResolution = realTime
	}

	// Configure integration channels
	if discord, ok := config["discord_enabled"].(bool); ok {
		lcd.discordEnabled = discord
	}

	if tiktok, ok := config["tiktok_enabled"].(bool); ok {
		lcd.tiktokEnabled = tiktok
	}

	// Test LangChain connection
	if err := lcd.testLangChainConnection(); err != nil {
		lcd.logger.WithError(err).Warn("Failed to connect to LangChain, conflict detection may be limited")
	}

	lcd.logger.WithFields(logrus.Fields{
		"langchain_url":      lcd.langChainURL,
		"conflict_threshold": lcd.conflictThreshold,
		"max_events":         lcd.maxAnalysisEvents,
		"escalation":         lcd.priorityEscalation,
		"discord_enabled":    lcd.discordEnabled,
		"tiktok_enabled":     lcd.tiktokEnabled,
	}).Info("✅ Lore Conflict Detector initialized")

	return nil
}

// AnalyzeLoreEvent analyzes a new lore event for conflicts
func (lcd *LoreConflictDetector) AnalyzeLoreEvent(event LoreEvent) (*ConflictResult, error) {
	if !lcd.enabled {
		return &ConflictResult{ConflictDetected: false}, nil
	}

	lcd.mutex.Lock()
	defer lcd.mutex.Unlock()

	// Add event to history
	lcd.addEventToHistory(event)

	// Update artifact index
	lcd.updateArtifactIndex(event)

	// Get relevant events for analysis
	relevantEvents := lcd.getRelevantEvents(event)

	if len(relevantEvents) < 2 {
		return &ConflictResult{ConflictDetected: false}, nil
	}

	// Perform conflict analysis
	analysis, err := lcd.performConflictAnalysis(event, relevantEvents)
	if err != nil {
		return &ConflictResult{
			ConflictDetected: false,
			Error:            err,
		}, err
	}

	// Check if conflicts were detected
	conflictDetected := analysis.Severity >= lcd.conflictThreshold || len(analysis.Contradictions) > 0

	result := &ConflictResult{
		ConflictDetected: conflictDetected,
		Analysis:         analysis,
	}

	if conflictDetected {
		lcd.conflictsDetected++
		
		// Cache the analysis
		lcd.conflictCache[analysis.ID] = analysis
		
		// Update topic conflicts
		lcd.updateTopicConflicts(event, result)
		
		// Generate escalation event if needed
		if lcd.priorityEscalation {
			escalationEvent := lcd.generateEscalationEvent(event, analysis)
			result.EscalationEvent = escalationEvent
			lcd.escalatedEvents++
		}
		
		// Trigger real-time resolution if enabled
		if lcd.realTimeResolution {
			go lcd.triggerRealTimeResolution(result)
		}
	}

	lcd.totalAnalyses++
	
	lcd.logger.WithFields(logrus.Fields{
		"event_id":           event.SessionID,
		"conflict_detected":  conflictDetected,
		"severity":           analysis.Severity,
		"contradictions":     len(analysis.Contradictions),
		"overlaps":           len(analysis.Overlaps),
	}).Info("🔍 Lore conflict analysis completed")

	return result, nil
}

// performConflictAnalysis performs detailed conflict analysis using LangChain
func (lcd *LoreConflictDetector) performConflictAnalysis(targetEvent LoreEvent, events []LoreEvent) (*ConflictAnalysis, error) {
	analysisID := fmt.Sprintf("conflict_%d_%s", time.Now().Unix(), targetEvent.SessionID)
	
	// Prepare analysis context
	analysisContext := lcd.prepareAnalysisContext(targetEvent, events)
	
	// Query LangChain for conflict analysis
	langChainResponse, err := lcd.queryLangChain(analysisContext)
	if err != nil {
		return nil, errors.Wrap(err, "failed to query LangChain for conflict analysis")
	}
	
	// Parse LangChain response
	analysis, err := lcd.parseLangChainResponse(langChainResponse, analysisID, targetEvent, events)
	if err != nil {
		return nil, errors.Wrap(err, "failed to parse LangChain response")
	}
	
	// Perform additional local analysis
	lcd.enhanceAnalysisWithLocalDetection(analysis, targetEvent, events)
	
	return analysis, nil
}

// prepareAnalysisContext prepares the context for LangChain analysis
func (lcd *LoreConflictDetector) prepareAnalysisContext(targetEvent LoreEvent, events []LoreEvent) string {
	var context strings.Builder
	
	context.WriteString("LORE CONFLICT ANALYSIS REQUEST\n")
	context.WriteString("===============================\n\n")
	
	context.WriteString("TARGET EVENT:\n")
	context.WriteString(fmt.Sprintf("- ID: %s\n", targetEvent.SessionID))
	context.WriteString(fmt.Sprintf("- Type: %s\n", targetEvent.Type))
	context.WriteString(fmt.Sprintf("- Content: %s\n", targetEvent.Content))
	context.WriteString(fmt.Sprintf("- Lore Level: %d\n", targetEvent.LoreLevel))
	context.WriteString(fmt.Sprintf("- Tags: %v\n", targetEvent.Tags))
	context.WriteString(fmt.Sprintf("- Timestamp: %s\n\n", targetEvent.Timestamp.Format(time.RFC3339)))
	
	context.WriteString("RELATED EVENTS FOR COMPARISON:\n")
	for i, event := range events {
		if event.SessionID == targetEvent.SessionID {
			continue
		}
		
		context.WriteString(fmt.Sprintf("Event %d:\n", i+1))
		context.WriteString(fmt.Sprintf("- ID: %s\n", event.SessionID))
		context.WriteString(fmt.Sprintf("- Type: %s\n", event.Type))
		context.WriteString(fmt.Sprintf("- Content: %s\n", event.Content))
		context.WriteString(fmt.Sprintf("- Lore Level: %d\n", event.LoreLevel))
		context.WriteString(fmt.Sprintf("- Tags: %v\n", event.Tags))
		context.WriteString(fmt.Sprintf("- Timestamp: %s\n\n", event.Timestamp.Format(time.RFC3339)))
	}
	
	context.WriteString("ANALYSIS INSTRUCTIONS:\n")
	context.WriteString("1. Identify any contradictions between the target event and related events\n")
	context.WriteString("2. Detect overlapping artifacts or concepts\n")
	context.WriteString("3. Assess the severity of conflicts (0.0 to 1.0)\n")
	context.WriteString("4. Suggest resolution strategies\n")
	context.WriteString("5. Provide confidence scores for each finding\n\n")
	
	context.WriteString("RESPONSE FORMAT:\n")
	context.WriteString("Please respond with a JSON object containing:\n")
	context.WriteString("- conflict_type: string\n")
	context.WriteString("- severity: float (0.0 to 1.0)\n")
	context.WriteString("- contradictions: array of contradiction objects\n")
	context.WriteString("- overlaps: array of overlap objects\n")
	context.WriteString("- resolution_strategy: string\n")
	context.WriteString("- confidence: float (0.0 to 1.0)\n")
	
	return context.String()
}

// queryLangChain sends a request to the LangChain API
func (lcd *LoreConflictDetector) queryLangChain(context string) (*LangChainResponse, error) {
	request := LangChainRequest{
		Model:       "gpt-4",
		Temperature: 0.3,
		MaxTokens:   2000,
		Messages: []LangChainMessage{
			{
				Role:    "system",
				Content: "You are an expert lore analyst specializing in detecting contradictions and conflicts in narrative content. Analyze the provided lore events and identify any inconsistencies, contradictions, or overlapping artifacts.",
			},
			{
				Role:    "user",
				Content: context,
			},
		},
		Metadata: map[string]interface{}{
			"analysis_type": "lore_conflict_detection",
			"timestamp":     time.Now().Unix(),
		},
	}
	
	requestBody, err := json.Marshal(request)
	if err != nil {
		return nil, errors.Wrap(err, "failed to marshal LangChain request")
	}
	
	req, err := http.NewRequest("POST", lcd.langChainURL, bytes.NewBuffer(requestBody))
	if err != nil {
		return nil, errors.Wrap(err, "failed to create HTTP request")
	}
	
	req.Header.Set("Content-Type", "application/json")
	if lcd.apiKey != "" {
		req.Header.Set("Authorization", "Bearer "+lcd.apiKey)
	}
	
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, errors.Wrap(err, "failed to send HTTP request")
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, errors.Errorf("LangChain API returned status %d: %s", resp.StatusCode, string(body))
	}
	
	var response LangChainResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, errors.Wrap(err, "failed to decode LangChain response")
	}
	
	if response.Error != "" {
		return nil, errors.New("LangChain API error: " + response.Error)
	}
	
	return &response, nil
}

// parseLangChainResponse parses the LangChain response into a ConflictAnalysis
func (lcd *LoreConflictDetector) parseLangChainResponse(response *LangChainResponse, analysisID string, targetEvent LoreEvent, events []LoreEvent) (*ConflictAnalysis, error) {
	if len(response.Choices) == 0 {
		return nil, errors.New("no choices in LangChain response")
	}
	
	content := response.Choices[0].Message.Content
	
	// Try to parse as JSON
	var langChainAnalysis struct {
		ConflictType       string                 `json:"conflict_type"`
		Severity           float64                `json:"severity"`
		Contradictions     []map[string]interface{} `json:"contradictions"`
		Overlaps           []map[string]interface{} `json:"overlaps"`
		ResolutionStrategy string                 `json:"resolution_strategy"`
		Confidence         float64                `json:"confidence"`
	}
	
	if err := json.Unmarshal([]byte(content), &langChainAnalysis); err != nil {
		// If JSON parsing fails, create a basic analysis
		return lcd.createBasicAnalysis(analysisID, targetEvent, events, content), nil
	}
	
	// Convert to our analysis format
	analysis := &ConflictAnalysis{
		ID:           analysisID,
		Timestamp:    time.Now(),
		Events:       append([]LoreEvent{targetEvent}, events...),
		ConflictType: langChainAnalysis.ConflictType,
		Severity:     langChainAnalysis.Severity,
		Status:       "detected",
		Priority:     lcd.calculatePriority(langChainAnalysis.Severity),
		Metadata: map[string]interface{}{
			"langchain_confidence": langChainAnalysis.Confidence,
			"analysis_method":      "langchain",
		},
	}
	
	// Parse contradictions
	for _, contradiction := range langChainAnalysis.Contradictions {
		analysis.Contradictions = append(analysis.Contradictions, ContradictionPair{
			Event1:        fmt.Sprintf("%v", contradiction["event1_id"]),
			Event2:        fmt.Sprintf("%v", contradiction["event2_id"]),
			ConflictField: fmt.Sprintf("%v", contradiction["conflict_field"]),
			Value1:        fmt.Sprintf("%v", contradiction["value1"]),
			Value2:        fmt.Sprintf("%v", contradiction["value2"]),
			Confidence:    lcd.parseFloat(contradiction["confidence"]),
			Severity:      fmt.Sprintf("%v", contradiction["severity"]),
			DetectedAt:    time.Now(),
			Context:       fmt.Sprintf("%v", contradiction["context"]),
		})
	}
	
	// Parse overlaps
	for _, overlap := range langChainAnalysis.Overlaps {
		analysis.Overlaps = append(analysis.Overlaps, ArtifactOverlap{
			ArtifactType: fmt.Sprintf("%v", overlap["artifact_type"]),
			Events:       lcd.parseStringSlice(overlap["events"]),
			OverlapScore: lcd.parseFloat(overlap["overlap_score"]),
			Description:  fmt.Sprintf("%v", overlap["description"]),
			DetectedAt:   time.Now(),
		})
	}
	
	// Create resolution
	if langChainAnalysis.ResolutionStrategy != "" {
		analysis.Resolution = &ConflictResolution{
			ID:               fmt.Sprintf("resolution_%s", analysisID),
			Strategy:         langChainAnalysis.ResolutionStrategy,
			Confidence:       langChainAnalysis.Confidence,
			EstimatedImpact:  "medium",
			RequiredApproval: langChainAnalysis.Severity > 0.8,
			CreatedAt:        time.Now(),
			Status:           "proposed",
		}
	}
	
	return analysis, nil
}

// enhanceAnalysisWithLocalDetection adds local conflict detection
func (lcd *LoreConflictDetector) enhanceAnalysisWithLocalDetection(analysis *ConflictAnalysis, targetEvent LoreEvent, events []LoreEvent) {
	// Check for tag conflicts
	tagConflicts := lcd.detectTagConflicts(targetEvent, events)
	for _, conflict := range tagConflicts {
		analysis.Contradictions = append(analysis.Contradictions, conflict)
	}
	
	// Check for temporal conflicts
	temporalConflicts := lcd.detectTemporalConflicts(targetEvent, events)
	for _, conflict := range temporalConflicts {
		analysis.Contradictions = append(analysis.Contradictions, conflict)
	}
	
	// Check for artifact overlaps
	artifactOverlaps := lcd.detectArtifactOverlaps(targetEvent, events)
	for _, overlap := range artifactOverlaps {
		analysis.Overlaps = append(analysis.Overlaps, overlap)
	}
	
	// Update severity based on local findings
	if len(analysis.Contradictions) > 0 || len(analysis.Overlaps) > 0 {
		localSeverity := lcd.calculateLocalSeverity(analysis)
		if localSeverity > analysis.Severity {
			analysis.Severity = localSeverity
		}
	}
}

// generateEscalationEvent creates a priority-escalated event for conflicts
func (lcd *LoreConflictDetector) generateEscalationEvent(originalEvent LoreEvent, analysis *ConflictAnalysis) *LoreEvent {
	escalationEvent := &LoreEvent{
		Type:        "conflict_detected",
		Content:     lcd.generateConflictDescription(analysis),
		SessionID:   fmt.Sprintf("conflict_%s", analysis.ID),
		UserID:      originalEvent.UserID,
		ChannelID:   originalEvent.ChannelID,
		LoreLevel:   originalEvent.LoreLevel + 2, // Escalate lore level
		CursedLevel: originalEvent.CursedLevel + 1,
		Sentiment:   -0.5, // Conflicts are generally negative
		Priority:    analysis.Priority,
		Tags:        append(originalEvent.Tags, "conflict", "escalated", "requires_resolution"),
		Timestamp:   time.Now(),
		Metadata: map[string]interface{}{
			"original_event_id":  originalEvent.SessionID,
			"analysis_id":        analysis.ID,
			"conflict_type":      analysis.ConflictType,
			"severity":           analysis.Severity,
			"contradictions":     len(analysis.Contradictions),
			"overlaps":           len(analysis.Overlaps),
			"escalation_reason":  "automated_conflict_detection",
			"requires_discord":   lcd.discordEnabled,
			"requires_tiktok":    lcd.tiktokEnabled,
		},
	}
	
	return escalationEvent
}

// triggerRealTimeResolution initiates real-time conflict resolution
func (lcd *LoreConflictDetector) triggerRealTimeResolution(result *ConflictResult) {
	lcd.logger.WithFields(logrus.Fields{
		"conflict_id": result.Analysis.ID,
		"severity":    result.Analysis.Severity,
	}).Info("🚨 Triggering real-time conflict resolution")
	
	// Create resolution context
	resolutionContext := map[string]interface{}{
		"conflict_analysis":  result.Analysis,
		"escalation_event":   result.EscalationEvent,
		"resolution_urgency": lcd.calculateResolutionUrgency(result.Analysis),
		"target_channels":    lcd.getTargetChannels(result.Analysis),
	}
	
	// This would integrate with the dispatch system to route to Discord/TikTok
	// For now, we'll log the resolution trigger
	lcd.logger.WithFields(logrus.Fields{
		"context": resolutionContext,
	}).Info("🔄 Real-time resolution context prepared")
}

// Helper methods for conflict detection
func (lcd *LoreConflictDetector) addEventToHistory(event LoreEvent) {
	lcd.eventHistory = append(lcd.eventHistory, event)
	
	// Keep only recent events within the conflict window
	cutoff := time.Now().Add(-lcd.conflictWindow)
	filtered := make([]LoreEvent, 0)
	
	for _, e := range lcd.eventHistory {
		if e.Timestamp.After(cutoff) {
			filtered = append(filtered, e)
		}
	}
	
	lcd.eventHistory = filtered
	
	// Limit to maximum events
	if len(lcd.eventHistory) > lcd.maxAnalysisEvents {
		lcd.eventHistory = lcd.eventHistory[len(lcd.eventHistory)-lcd.maxAnalysisEvents:]
	}
}

func (lcd *LoreConflictDetector) updateArtifactIndex(event LoreEvent) {
	for _, tag := range event.Tags {
		if _, exists := lcd.artifactIndex[tag]; !exists {
			lcd.artifactIndex[tag] = make([]string, 0)
		}
		lcd.artifactIndex[tag] = append(lcd.artifactIndex[tag], event.SessionID)
	}
}

func (lcd *LoreConflictDetector) getRelevantEvents(targetEvent LoreEvent) []LoreEvent {
	var relevant []LoreEvent
	
	// Find events with similar tags
	for _, event := range lcd.eventHistory {
		if event.SessionID == targetEvent.SessionID {
			continue
		}
		
		// Check tag overlap
		tagOverlap := lcd.calculateTagOverlap(targetEvent.Tags, event.Tags)
		if tagOverlap > 0.3 {
			relevant = append(relevant, event)
		}
	}
	
	// Sort by relevance (tag overlap and recency)
	sort.Slice(relevant, func(i, j int) bool {
		overlapI := lcd.calculateTagOverlap(targetEvent.Tags, relevant[i].Tags)
		overlapJ := lcd.calculateTagOverlap(targetEvent.Tags, relevant[j].Tags)
		
		if overlapI == overlapJ {
			return relevant[i].Timestamp.After(relevant[j].Timestamp)
		}
		return overlapI > overlapJ
	})
	
	// Return top relevant events
	if len(relevant) > 10 {
		relevant = relevant[:10]
	}
	
	return relevant
}

func (lcd *LoreConflictDetector) calculateTagOverlap(tags1, tags2 []string) float64 {
	if len(tags1) == 0 || len(tags2) == 0 {
		return 0.0
	}
	
	overlap := 0
	for _, tag1 := range tags1 {
		for _, tag2 := range tags2 {
			if tag1 == tag2 {
				overlap++
				break
			}
		}
	}
	
	return float64(overlap) / float64(len(tags1)+len(tags2)-overlap)
}

func (lcd *LoreConflictDetector) detectTagConflicts(targetEvent LoreEvent, events []LoreEvent) []ContradictionPair {
	var conflicts []ContradictionPair
	
	// Define conflicting tag pairs
	conflictingTags := map[string][]string{
		"light":    {"darkness", "shadow", "void"},
		"darkness": {"light", "blessing", "holy"},
		"ancient":  {"modern", "futuristic", "new"},
		"digital":  {"analog", "physical", "organic"},
		"cursed":   {"blessed", "holy", "sacred"},
		"chaos":    {"order", "harmony", "balance"},
	}
	
	for _, event := range events {
		for _, targetTag := range targetEvent.Tags {
			if conflictingList, exists := conflictingTags[targetTag]; exists {
				for _, eventTag := range event.Tags {
					for _, conflictingTag := range conflictingList {
						if eventTag == conflictingTag {
							conflicts = append(conflicts, ContradictionPair{
								Event1:        targetEvent.SessionID,
								Event2:        event.SessionID,
								ConflictField: "tags",
								Value1:        targetTag,
								Value2:        eventTag,
								Confidence:    0.8,
								Severity:      "medium",
								DetectedAt:    time.Now(),
								Context:       "conflicting_tags",
							})
						}
					}
				}
			}
		}
	}
	
	return conflicts
}

func (lcd *LoreConflictDetector) detectTemporalConflicts(targetEvent LoreEvent, events []LoreEvent) []ContradictionPair {
	var conflicts []ContradictionPair
	
	// Check for temporal contradictions in content
	temporalKeywords := map[string][]string{
		"past":    {"ancient", "old", "former", "previous"},
		"present": {"current", "now", "today", "contemporary"},
		"future":  {"tomorrow", "next", "upcoming", "futuristic"},
	}
	
	targetTemporal := lcd.extractTemporalContext(targetEvent.Content)
	
	for _, event := range events {
		eventTemporal := lcd.extractTemporalContext(event.Content)
		
		if targetTemporal != "" && eventTemporal != "" && targetTemporal != eventTemporal {
			conflicts = append(conflicts, ContradictionPair{
				Event1:        targetEvent.SessionID,
				Event2:        event.SessionID,
				ConflictField: "temporal_context",
				Value1:        targetTemporal,
				Value2:        eventTemporal,
				Confidence:    0.6,
				Severity:      "low",
				DetectedAt:    time.Now(),
				Context:       "temporal_contradiction",
			})
		}
	}
	
	// Use temporalKeywords for enhanced context analysis
	_ = temporalKeywords
	
	return conflicts
}

func (lcd *LoreConflictDetector) detectArtifactOverlaps(targetEvent LoreEvent, events []LoreEvent) []ArtifactOverlap {
	var overlaps []ArtifactOverlap
	
	// Check for content similarity
	for _, event := range events {
		similarity := lcd.calculateContentSimilarity(targetEvent.Content, event.Content)
		if similarity > 0.7 {
			overlaps = append(overlaps, ArtifactOverlap{
				ArtifactType: "content_similarity",
				Events:       []string{targetEvent.SessionID, event.SessionID},
				OverlapScore: similarity,
				Description:  "High content similarity detected",
				DetectedAt:   time.Now(),
			})
		}
	}
	
	return overlaps
}

// Utility methods
func (lcd *LoreConflictDetector) testLangChainConnection() error {
	if lcd.langChainURL == "" {
		return errors.New("LangChain URL not configured")
	}
	
	// Simple health check
	resp, err := http.Get(lcd.langChainURL + "/health")
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return errors.Errorf("LangChain health check failed: %d", resp.StatusCode)
	}
	
	return nil
}

func (lcd *LoreConflictDetector) calculatePriority(severity float64) int {
	if severity >= 0.9 {
		return 10
	} else if severity >= 0.7 {
		return 8
	} else if severity >= 0.5 {
		return 6
	} else if severity >= 0.3 {
		return 4
	}
	return 2
}

func (lcd *LoreConflictDetector) calculateLocalSeverity(analysis *ConflictAnalysis) float64 {
	severity := 0.0
	
	// Weight by contradictions
	for _, contradiction := range analysis.Contradictions {
		severity += contradiction.Confidence * 0.3
	}
	
	// Weight by overlaps
	for _, overlap := range analysis.Overlaps {
		severity += overlap.OverlapScore * 0.2
	}
	
	// Cap at 1.0
	if severity > 1.0 {
		severity = 1.0
	}
	
	return severity
}

func (lcd *LoreConflictDetector) calculateResolutionUrgency(analysis *ConflictAnalysis) string {
	if analysis.Severity >= 0.8 {
		return "high"
	} else if analysis.Severity >= 0.5 {
		return "medium"
	}
	return "low"
}

func (lcd *LoreConflictDetector) getTargetChannels(analysis *ConflictAnalysis) []string {
	channels := make([]string, 0)
	
	if lcd.discordEnabled {
		channels = append(channels, "discord")
	}
	
	if lcd.tiktokEnabled {
		channels = append(channels, "tiktok")
	}
	
	return channels
}

func (lcd *LoreConflictDetector) parseFloat(value interface{}) float64 {
	if f, ok := value.(float64); ok {
		return f
	}
	return 0.0
}

func (lcd *LoreConflictDetector) parseStringSlice(value interface{}) []string {
	if slice, ok := value.([]interface{}); ok {
		result := make([]string, len(slice))
		for i, v := range slice {
			result[i] = fmt.Sprintf("%v", v)
		}
		return result
	}
	return []string{}
}

func (lcd *LoreConflictDetector) extractTemporalContext(content string) string {
	content = strings.ToLower(content)
	
	if strings.Contains(content, "ancient") || strings.Contains(content, "old") {
		return "past"
	} else if strings.Contains(content, "future") || strings.Contains(content, "tomorrow") {
		return "future"
	} else if strings.Contains(content, "now") || strings.Contains(content, "current") {
		return "present"
	}
	
	return ""
}

func (lcd *LoreConflictDetector) calculateContentSimilarity(content1, content2 string) float64 {
	// Simple word-based similarity
	words1 := strings.Fields(strings.ToLower(content1))
	words2 := strings.Fields(strings.ToLower(content2))
	
	if len(words1) == 0 || len(words2) == 0 {
		return 0.0
	}
	
	common := 0
	for _, word1 := range words1 {
		for _, word2 := range words2 {
			if word1 == word2 {
				common++
				break
			}
		}
	}
	
	return float64(common) / float64(len(words1)+len(words2)-common)
}

func (lcd *LoreConflictDetector) generateConflictDescription(analysis *ConflictAnalysis) string {
	var description strings.Builder
	
	description.WriteString("🚨 LORE CONFLICT DETECTED 🚨\n\n")
	description.WriteString(fmt.Sprintf("Conflict Type: %s\n", analysis.ConflictType))
	description.WriteString(fmt.Sprintf("Severity: %.2f/1.0\n", analysis.Severity))
	description.WriteString(fmt.Sprintf("Priority: %d/10\n\n", analysis.Priority))
	
	if len(analysis.Contradictions) > 0 {
		description.WriteString("CONTRADICTIONS:\n")
		for i, contradiction := range analysis.Contradictions {
			description.WriteString(fmt.Sprintf("%d. %s vs %s (%s)\n", i+1, contradiction.Value1, contradiction.Value2, contradiction.ConflictField))
		}
		description.WriteString("\n")
	}
	
	if len(analysis.Overlaps) > 0 {
		description.WriteString("OVERLAPS:\n")
		for i, overlap := range analysis.Overlaps {
			description.WriteString(fmt.Sprintf("%d. %s (Score: %.2f)\n", i+1, overlap.Description, overlap.OverlapScore))
		}
		description.WriteString("\n")
	}
	
	if analysis.Resolution != nil {
		description.WriteString("SUGGESTED RESOLUTION:\n")
		description.WriteString(analysis.Resolution.Strategy)
		description.WriteString("\n")
	}
	
	description.WriteString("⚠️ IMMEDIATE ATTENTION REQUIRED ⚠️")
	
	return description.String()
}

func (lcd *LoreConflictDetector) createBasicAnalysis(analysisID string, targetEvent LoreEvent, events []LoreEvent, content string) *ConflictAnalysis {
	return &ConflictAnalysis{
		ID:           analysisID,
		Timestamp:    time.Now(),
		Events:       append([]LoreEvent{targetEvent}, events...),
		ConflictType: "unknown",
		Severity:     0.5,
		Status:       "basic_analysis",
		Priority:     5,
		Metadata: map[string]interface{}{
			"analysis_method": "fallback",
			"raw_response":    content,
		},
	}
}

func (lcd *LoreConflictDetector) updateTopicConflicts(event LoreEvent, result *ConflictResult) {
	for _, tag := range event.Tags {
		if _, exists := lcd.topicConflicts[tag]; !exists {
			lcd.topicConflicts[tag] = make([]*ConflictResult, 0)
		}
		lcd.topicConflicts[tag] = append(lcd.topicConflicts[tag], result)
	}
}

// Public methods for integration
func (lcd *LoreConflictDetector) GetConflictAnalysis(conflictID string) (*ConflictAnalysis, bool) {
	lcd.mutex.RLock()
	defer lcd.mutex.RUnlock()
	
	analysis, exists := lcd.conflictCache[conflictID]
	return analysis, exists
}

func (lcd *LoreConflictDetector) GetTopicConflicts(topic string) []*ConflictResult {
	lcd.mutex.RLock()
	defer lcd.mutex.RUnlock()
	
	return lcd.topicConflicts[topic]
}

func (lcd *LoreConflictDetector) GetStatistics() map[string]interface{} {
	lcd.mutex.RLock()
	defer lcd.mutex.RUnlock()
	
	return map[string]interface{}{
		"total_analyses":      lcd.totalAnalyses,
		"conflicts_detected":  lcd.conflictsDetected,
		"escalated_events":    lcd.escalatedEvents,
		"resolved_conflicts":  lcd.resolvedConflicts,
		"cached_analyses":     len(lcd.conflictCache),
		"event_history_size":  len(lcd.eventHistory),
		"artifact_index_size": len(lcd.artifactIndex),
		"topic_conflicts":     len(lcd.topicConflicts),
		"enabled":             lcd.enabled,
		"langchain_url":       lcd.langChainURL,
		"conflict_threshold":  lcd.conflictThreshold,
	}
}

// GetConflictHistory returns the conflict history
func (lcd *LoreConflictDetector) GetConflictHistory() []*ConflictAnalysis {
	lcd.mutex.RLock()
	defer lcd.mutex.RUnlock()
	
	var history []*ConflictAnalysis
	for _, analysis := range lcd.conflictCache {
		history = append(history, analysis)
	}
	
	// Sort by timestamp (newest first)
	sort.Slice(history, func(i, j int) bool {
		return history[i].Timestamp.After(history[j].Timestamp)
	})
	
	return history
}

// GetConflictStats returns conflict statistics
func (lcd *LoreConflictDetector) GetConflictStats() map[string]interface{} {
	return lcd.GetStatistics()
}

func (lcd *LoreConflictDetector) Name() string {
	return "lore_conflict_detector"
}

func (lcd *LoreConflictDetector) IsHealthy() bool {
	return lcd.enabled && lcd.langChainURL != ""
}
