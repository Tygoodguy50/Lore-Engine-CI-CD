package hooks

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
)

// LoreEvent represents a lore-specific event that needs to be dispatched
type LoreEvent struct {
	Type              string                 `json:"type"`                // lore_response, cursed_output, reactive_dialogue
	Content           string                 `json:"content"`             // The actual lore content
	Metadata          map[string]interface{} `json:"metadata"`            // Additional context
	Timestamp         time.Time              `json:"timestamp"`           // When the event occurred
	Source            string                 `json:"source"`              // Where the event came from
	Priority          int                    `json:"priority"`            // 1-10, higher is more important
	Tags              []string               `json:"tags"`                // Tags for categorization
	UserID            string                 `json:"user_id"`             // User who triggered the event
	ChannelID         string                 `json:"channel_id"`          // Channel/context where it happened
	LoreLevel         int                    `json:"lore_level"`          // Intensity level 1-10
	Sentiment         float64                `json:"sentiment"`           // Sentiment score -1 to 1
	CursedLevel       int                    `json:"cursed_level"`        // How cursed the content is 1-10
	SessionID         string                 `json:"session_id"`          // Session identifier for tracking
	SessionEventCount int                    `json:"session_event_count"` // Number of events in this session
}

// LoreDispatcher handles routing of lore events to appropriate integrations
type LoreDispatcher struct {
	discord               Integration
	tiktok                Integration
	markdown              Integration
	loreMarkdownGenerator *LoreMarkdownGenerator
	conflictDetector      *LoreConflictDetector
	loreLooper            *InteractiveLoreLooper
	liveMetrics           *LiveMetricsCollector
	n8n                   Integration
	eventChan             chan LoreEvent
	ctx                   context.Context
	cancel                context.CancelFunc
	wg                    sync.WaitGroup
	logger                *logrus.Logger
	config                *LoreDispatcherConfig
	stats                 *DispatcherStats
	sessionManager        *SessionManager
}

// LoreDispatcherConfig holds configuration for the dispatcher
type LoreDispatcherConfig struct {
	MaxConcurrentEvents int
	EventTimeout        time.Duration
	RetryAttempts       int
	LoreLevelDefault    int
	SentimentThreshold  float64
	MaxLoreTriggers     int
	CursedMode          bool
	DebugMode           bool

	// Routing configuration
	DiscordEnabled  bool
	TikTokEnabled   bool
	MarkdownEnabled bool
	N8NEnabled      bool

	// Event filtering
	MinLoreLevel   int
	MinPriority    int
	MaxCursedLevel int
}

// DispatcherStats tracks dispatcher performance
type DispatcherStats struct {
	TotalEvents          int64
	SuccessfulDispatches int64
	FailedDispatches     int64
	DiscordDispatches    int64
	TikTokDispatches     int64
	MarkdownDispatches   int64
	N8NDispatches        int64
	LastEventTime        time.Time
	mu                   sync.RWMutex
}

// SessionState tracks the state of a lore session
type SessionState struct {
	SessionID     string                 `json:"session_id"`
	UserID        string                 `json:"user_id"`
	ChannelID     string                 `json:"channel_id"`
	StartTime     time.Time              `json:"start_time"`
	LastActivity  time.Time              `json:"last_activity"`
	EventCount    int                    `json:"event_count"`
	LoreEvents    []LoreEvent            `json:"lore_events"`
	ScalingFactor float64                `json:"scaling_factor"`
	BaseLoreLevel int                    `json:"base_lore_level"`
	MaxLoreLevel  int                    `json:"max_lore_level"`
	Metadata      map[string]interface{} `json:"metadata"`
	Active        bool                   `json:"active"`
}

// SessionManager manages lore sessions and their scaling
type SessionManager struct {
	sessions       map[string]*SessionState
	mutex          sync.RWMutex
	maxSessions    int
	sessionTimeout time.Duration
	logger         *logrus.Logger
}

// NewLoreDispatcher creates a new lore dispatcher
func NewLoreDispatcher(discord, tiktok, markdown, n8n Integration) *LoreDispatcher {
	ctx, cancel := context.WithCancel(context.Background())

	config := &LoreDispatcherConfig{
		MaxConcurrentEvents: getEnvInt("MAX_CONCURRENT_EVENTS", 10),
		EventTimeout:        time.Duration(getEnvInt("EVENT_TIMEOUT_SECONDS", 30)) * time.Second,
		RetryAttempts:       getEnvInt("RETRY_ATTEMPTS", 3),
		LoreLevelDefault:    getEnvInt("LORE_LEVEL_DEFAULT", 5),
		SentimentThreshold:  getEnvFloat("SENTIMENT_THRESHOLD", 0.5),
		MaxLoreTriggers:     getEnvInt("MAX_LORE_TRIGGERS", 100),
		CursedMode:          getEnvBool("CURSED_MODE", true),
		DebugMode:           getEnvBool("HAUNTED_DEBUG", false),
		DiscordEnabled:      discord != nil,
		TikTokEnabled:       tiktok != nil,
		MarkdownEnabled:     markdown != nil,
		N8NEnabled:          n8n != nil,
		MinLoreLevel:        getEnvInt("MIN_LORE_LEVEL", 1),
		MinPriority:         getEnvInt("MIN_PRIORITY", 1),
		MaxCursedLevel:      getEnvInt("MAX_CURSED_LEVEL", 10),
	}

	logger := logrus.New()
	if config.DebugMode {
		logger.SetLevel(logrus.DebugLevel)
	}

	// Initialize the advanced markdown generator
	loreMarkdownGenerator := NewLoreMarkdownGenerator()
	markdownConfig := map[string]interface{}{
		"output_dir":         getEnvString("MARKDOWN_OUTPUT_DIR", "./docs/lore"),
		"git_repo":           getEnvString("MARKDOWN_GIT_REPO", ""),
		"auto_commit":        getEnvBool("MARKDOWN_AUTO_COMMIT", true),
		"html_enabled":       getEnvBool("MARKDOWN_HTML_ENABLED", true),
		"index_enabled":      getEnvBool("MARKDOWN_INDEX_ENABLED", true),
		"branch_per_session": getEnvBool("MARKDOWN_BRANCH_PER_SESSION", true),
	}

	if err := loreMarkdownGenerator.Initialize(markdownConfig); err != nil {
		logger.WithError(err).Warn("Failed to initialize lore markdown generator")
	}

	// Initialize the conflict detector
	conflictDetector := NewLoreConflictDetector()
	conflictConfig := map[string]interface{}{
		"langchain_url":        getEnvString("LANGCHAIN_URL", ""),
		"api_key":              getEnvString("LANGCHAIN_API_KEY", ""),
		"conflict_threshold":   getEnvFloat("CONFLICT_THRESHOLD", 0.7),
		"max_analysis_events":  getEnvInt("MAX_ANALYSIS_EVENTS", 100),
		"priority_escalation":  getEnvBool("PRIORITY_ESCALATION", true),
		"real_time_resolution": getEnvBool("REAL_TIME_RESOLUTION", true),
		"discord_enabled":      discord != nil,
		"tiktok_enabled":       tiktok != nil,
	}

	if err := conflictDetector.Initialize(conflictConfig); err != nil {
		logger.WithError(err).Warn("Failed to initialize conflict detector")
	}

	// Initialize the interactive lore looper
	loreLooper := NewInteractiveLoreLooper(logger)
	looperConfig := map[string]interface{}{
		"discord_enabled":  discord != nil,
		"tiktok_enabled":   tiktok != nil,
		"markdown_enabled": markdown != nil,
		"max_loop_depth":   getEnvInt("MAX_LOOP_DEPTH", 10),
		"loop_timeout":     getEnvString("LOOP_TIMEOUT", "30m"),
		"cooldown_period":  getEnvString("COOLDOWN_PERIOD", "5m"),
	}

	if err := loreLooper.Initialize(looperConfig); err != nil {
		logger.WithError(err).Warn("Failed to initialize interactive lore looper")
	}

	// Initialize the live metrics collector
	liveMetrics := NewLiveMetricsCollector(logger)
	metricsConfig := map[string]interface{}{
		"collect_interval":       getEnvString("METRICS_COLLECT_INTERVAL", "30s"),
		"retention_period":       getEnvString("METRICS_RETENTION_PERIOD", "24h"),
		"cursed_topic_tracking":  getEnvBool("CURSED_TOPIC_TRACKING", true),
		"sentiment_analysis":     getEnvBool("SENTIMENT_ANALYSIS_ENABLED", true),
		"evolution_tracking":     getEnvBool("EVOLUTION_TRACKING_ENABLED", true),
		"performance_monitoring": getEnvBool("PERFORMANCE_MONITORING", true),
	}

	if err := liveMetrics.Initialize(metricsConfig); err != nil {
		logger.WithError(err).Warn("Failed to initialize live metrics collector")
	}

	dispatcher := &LoreDispatcher{
		discord:               discord,
		tiktok:                tiktok,
		markdown:              markdown,
		loreMarkdownGenerator: loreMarkdownGenerator,
		conflictDetector:      conflictDetector,
		loreLooper:            loreLooper,
		liveMetrics:           liveMetrics,
		n8n:                   n8n,
		eventChan:             make(chan LoreEvent, config.MaxConcurrentEvents*2),
		ctx:                   ctx,
		cancel:                cancel,
		logger:                logger,
		config:                config,
		stats:                 &DispatcherStats{},
		sessionManager:        NewSessionManager(100, 30*time.Minute, logger),
	}

	// Start the dispatcher
	dispatcher.Start()

	return dispatcher
}

// Start begins processing events
func (ld *LoreDispatcher) Start() {
	ld.logger.Info("🕸️ Starting Lore Dispatcher...")

	// Start worker goroutines
	for i := 0; i < ld.config.MaxConcurrentEvents; i++ {
		ld.wg.Add(1)
		go ld.worker(i)
	}

	ld.logger.WithFields(logrus.Fields{
		"workers":  ld.config.MaxConcurrentEvents,
		"discord":  ld.config.DiscordEnabled,
		"tiktok":   ld.config.TikTokEnabled,
		"markdown": ld.config.MarkdownEnabled,
		"n8n":      ld.config.N8NEnabled,
	}).Info("🔮 Lore Dispatcher started successfully")
}

// Stop shuts down the dispatcher
func (ld *LoreDispatcher) Stop() {
	ld.logger.Info("🛑 Stopping Lore Dispatcher...")
	ld.cancel()
	close(ld.eventChan)
	ld.wg.Wait()
	ld.logger.Info("✅ Lore Dispatcher stopped")
}

// DispatchEvent sends a lore event for processing
func (ld *LoreDispatcher) DispatchEvent(event LoreEvent) error {
	// Validate event
	if err := ld.validateEvent(event); err != nil {
		return errors.Wrap(err, "invalid lore event")
	}

	// Set defaults if not provided
	if event.Timestamp.IsZero() {
		event.Timestamp = time.Now()
	}
	if event.Priority == 0 {
		event.Priority = 5
	}
	if event.LoreLevel == 0 {
		event.LoreLevel = ld.config.LoreLevelDefault
	}

	// Generate session ID if not provided
	if event.SessionID == "" {
		event.SessionID = generateSessionID(event.UserID, event.ChannelID)
	}

	// Manage session and apply contextual scaling
	session := ld.sessionManager.CreateOrGetSession(event.SessionID, event.UserID, event.ChannelID)

	// Apply contextual lore scaling based on session progress
	originalLoreLevel := event.LoreLevel
	scaledLoreLevel := ld.applyContextualScaling(event.LoreLevel, session)
	event.LoreLevel = scaledLoreLevel
	event.SessionEventCount = session.EventCount + 1

	// Update session with the processed event
	ld.sessionManager.UpdateSession(event.SessionID, event)

	// Update stats
	ld.stats.mu.Lock()
	ld.stats.TotalEvents++
	ld.stats.LastEventTime = time.Now()
	ld.stats.mu.Unlock()

	select {
	case ld.eventChan <- event:
		ld.logger.WithFields(logrus.Fields{
			"type":           event.Type,
			"priority":       event.Priority,
			"lore_level":     event.LoreLevel,
			"original_level": originalLoreLevel,
			"scaled_level":   scaledLoreLevel,
			"session_id":     event.SessionID,
			"session_events": event.SessionEventCount,
			"scaling_factor": session.ScalingFactor,
			"user_id":        event.UserID,
		}).Debug("📥 Event queued for dispatch")
		return nil
	case <-ld.ctx.Done():
		return errors.New("dispatcher is shutting down")
	default:
		return errors.New("event queue is full")
	}
}

// worker processes events from the queue
func (ld *LoreDispatcher) worker(id int) {
	defer ld.wg.Done()

	logger := ld.logger.WithField("worker", id)
	logger.Debug("🔧 Worker started")

	for {
		select {
		case event, ok := <-ld.eventChan:
			if !ok {
				logger.Debug("📤 Event channel closed, worker stopping")
				return
			}

			logger.WithFields(logrus.Fields{
				"type":       event.Type,
				"priority":   event.Priority,
				"lore_level": event.LoreLevel,
			}).Debug("⚡ Processing event")

			ld.processEvent(event)

		case <-ld.ctx.Done():
			logger.Debug("🛑 Context cancelled, worker stopping")
			return
		}
	}
}

// processEvent routes the event to appropriate integrations
func (ld *LoreDispatcher) processEvent(event LoreEvent) {
	ctx, cancel := context.WithTimeout(ld.ctx, ld.config.EventTimeout)
	defer cancel()

	// Filter events based on configuration
	if !ld.shouldProcessEvent(event) {
		ld.logger.WithFields(logrus.Fields{
			"type":       event.Type,
			"lore_level": event.LoreLevel,
			"priority":   event.Priority,
		}).Debug("🚫 Event filtered out")
		return
	}

	var wg sync.WaitGroup

	// Perform conflict detection first
	if ld.conflictDetector != nil {
		wg.Add(1)
		go func() {
			defer wg.Done()
			conflictResult, err := ld.conflictDetector.AnalyzeLoreEvent(event)
			if err != nil {
				ld.logger.WithError(err).Error("❌ Conflict detection failed")
				return
			}

			if conflictResult.ConflictDetected && conflictResult.Analysis != nil {
				ld.logger.WithFields(logrus.Fields{
					"conflict_type": conflictResult.Analysis.ConflictType,
					"severity":      conflictResult.Analysis.Severity,
					"priority":      conflictResult.Analysis.Priority,
					"user_id":       event.UserID,
					"session_id":    event.SessionID,
				}).Info("🔍 Detected lore conflict")

				// Process high-priority conflicts through escalation
				if conflictResult.Analysis.Priority >= 8 {
					escalationEvent := ld.conflictDetector.generateEscalationEvent(event, conflictResult.Analysis)
					ld.logger.WithFields(logrus.Fields{
						"conflict_type": conflictResult.Analysis.ConflictType,
						"severity":      conflictResult.Analysis.Severity,
						"priority":      conflictResult.Analysis.Priority,
						"user_id":       escalationEvent.UserID,
					}).Warn("⚠️ Escalating high-priority conflict")

					// Route to Discord and TikTok for real-time resolution
					if ld.config.DiscordEnabled {
						go ld.routeToDiscord(ctx, *escalationEvent)
					}
					if ld.config.TikTokEnabled {
						go ld.routeToTikTok(ctx, *escalationEvent)
					}
				}
			}
		}()
	}

	// Store lore fragment for potential reanimation
	if ld.loreLooper != nil {
		wg.Add(1)
		go func() {
			defer wg.Done()
			if _, err := ld.loreLooper.StoreLoreFragment(event); err != nil {
				ld.logger.WithError(err).Error("❌ Failed to store lore fragment")
			}
		}()
	}

	// Route to Discord
	if ld.config.DiscordEnabled && ld.shouldRouteToDiscord(event) {
		wg.Add(1)
		go func() {
			defer wg.Done()
			ld.routeToDiscord(ctx, event)
		}()
	}

	// Route to TikTok
	if ld.config.TikTokEnabled && ld.shouldRouteToTikTok(event) {
		wg.Add(1)
		go func() {
			defer wg.Done()
			ld.routeToTikTok(ctx, event)
		}()
	}

	// Route to Markdown
	if ld.config.MarkdownEnabled && ld.shouldRouteToMarkdown(event) {
		wg.Add(1)
		go func() {
			defer wg.Done()
			ld.routeToMarkdown(ctx, event)
		}()
	}

	// Route to n8n
	if ld.config.N8NEnabled && ld.shouldRouteToN8N(event) {
		wg.Add(1)
		go func() {
			defer wg.Done()
			ld.routeToN8N(ctx, event)
		}()
	}

	wg.Wait()
}

// shouldProcessEvent determines if an event should be processed
func (ld *LoreDispatcher) shouldProcessEvent(event LoreEvent) bool {
	// Check minimum lore level
	if event.LoreLevel < ld.config.MinLoreLevel {
		return false
	}

	// Check minimum priority
	if event.Priority < ld.config.MinPriority {
		return false
	}

	// Check maximum cursed level
	if event.CursedLevel > ld.config.MaxCursedLevel {
		return false
	}

	// Check if cursed mode is enabled for cursed content
	if event.Type == "cursed_output" && !ld.config.CursedMode {
		return false
	}

	return true
}

// shouldRouteToDiscord determines if an event should go to Discord
func (ld *LoreDispatcher) shouldRouteToDiscord(event LoreEvent) bool {
	switch event.Type {
	case "lore_response":
		return event.LoreLevel >= 3 // Only send significant lore
	case "cursed_output":
		return event.CursedLevel >= 5 // Only send properly cursed content
	case "reactive_dialogue":
		return event.Priority >= 7 // Only send high priority reactions
	default:
		return false
	}
}

// shouldRouteToTikTok determines if an event should go to TikTok
func (ld *LoreDispatcher) shouldRouteToTikTok(event LoreEvent) bool {
	switch event.Type {
	case "lore_response":
		return event.LoreLevel >= 7 && event.Sentiment > ld.config.SentimentThreshold
	case "cursed_output":
		return event.CursedLevel >= 8 // Only the most cursed content
	case "reactive_dialogue":
		return event.Priority >= 8 && event.Sentiment > 0.6 // High priority, positive sentiment
	default:
		return false
	}
}

// shouldRouteToMarkdown determines if an event should go to Markdown docs
func (ld *LoreDispatcher) shouldRouteToMarkdown(event LoreEvent) bool {
	switch event.Type {
	case "lore_response":
		return event.LoreLevel >= 5 // Document significant lore
	case "cursed_output":
		return event.CursedLevel >= 6 // Document cursed content
	case "reactive_dialogue":
		return event.Priority >= 6 // Document important reactions
	default:
		return false
	}
}

// shouldRouteToN8N determines if an event should go to n8n
func (ld *LoreDispatcher) shouldRouteToN8N(event LoreEvent) bool {
	// n8n gets all events for analysis and automation
	return true
}

// Helper functions for event conversion
func generateEventID() string {
	return strconv.FormatInt(time.Now().UnixNano(), 36)
}

func convertToStringMap(input map[string]interface{}) map[string]interface{} {
	if input == nil {
		return make(map[string]interface{})
	}
	return input
}

// generateSessionID creates a session ID from user and channel
func generateSessionID(userID, channelID string) string {
	if userID == "" {
		userID = "unknown"
	}
	if channelID == "" {
		channelID = "global"
	}
	return fmt.Sprintf("%s_%s_%d", userID, channelID, time.Now().Unix())
}

// applyContextualScaling applies session-based scaling to lore levels
func (ld *LoreDispatcher) applyContextualScaling(baseLoreLevel int, session *SessionState) int {
	// Calculate scaling based on session progress
	sessionProgress := float64(session.EventCount) / 20.0 // Scale over 20 events
	if sessionProgress > 1.0 {
		sessionProgress = 1.0
	}

	// Apply scaling factor: ramp from base level to max level
	scalingFactor := 1.0 + (sessionProgress * 2.0) // Scale from 1.0 to 3.0
	scaledLevel := float64(baseLoreLevel) * scalingFactor

	// Apply session-specific scaling
	if session.ScalingFactor > 0 {
		scaledLevel *= session.ScalingFactor
	}

	// Ensure we stay within bounds
	result := int(scaledLevel)
	if result < session.BaseLoreLevel {
		result = session.BaseLoreLevel
	}
	if result > session.MaxLoreLevel {
		result = session.MaxLoreLevel
	}

	return result
}

// routeToDiscord sends the event to Discord
func (ld *LoreDispatcher) routeToDiscord(ctx context.Context, event LoreEvent) {
	logger := ld.logger.WithField("integration", "discord")

	// Convert lore event to haunted event
	hauntedEvent := &HauntedEvent{
		ID:        generateEventID(),
		Type:      event.Type,
		Source:    "lore_dispatcher",
		Timestamp: event.Timestamp,
		Payload:   convertToStringMap(event.Metadata),
		Metadata:  make(map[string]string),
		Cursed:    event.CursedLevel > 5,
		Sentiment: event.Sentiment,
		LoreLevel: event.LoreLevel,
	}

	// Add lore-specific metadata
	hauntedEvent.Metadata["content"] = event.Content
	hauntedEvent.Metadata["user_id"] = event.UserID
	hauntedEvent.Metadata["channel_id"] = event.ChannelID
	hauntedEvent.Metadata["priority"] = strconv.Itoa(event.Priority)
	hauntedEvent.Metadata["cursed_level"] = strconv.Itoa(event.CursedLevel)
	hauntedEvent.Metadata["tags"] = strings.Join(event.Tags, ",")

	err := ld.discord.HandleEvent(hauntedEvent)
	if err != nil {
		logger.WithError(err).Error("❌ Failed to route event to Discord")
		ld.stats.mu.Lock()
		ld.stats.FailedDispatches++
		ld.stats.mu.Unlock()
	} else {
		logger.Debug("✅ Event routed to Discord successfully")
		ld.stats.mu.Lock()
		ld.stats.SuccessfulDispatches++
		ld.stats.DiscordDispatches++
		ld.stats.mu.Unlock()
	}
}

// routeToTikTok sends the event to TikTok
func (ld *LoreDispatcher) routeToTikTok(ctx context.Context, event LoreEvent) {
	logger := ld.logger.WithField("integration", "tiktok")

	// Convert lore event to haunted event
	hauntedEvent := &HauntedEvent{
		ID:        generateEventID(),
		Type:      event.Type,
		Source:    "lore_dispatcher",
		Timestamp: event.Timestamp,
		Payload:   convertToStringMap(event.Metadata),
		Metadata:  make(map[string]string),
		Cursed:    event.CursedLevel > 5,
		Sentiment: event.Sentiment,
		LoreLevel: event.LoreLevel,
	}

	// Add lore-specific metadata
	hauntedEvent.Metadata["content"] = event.Content
	hauntedEvent.Metadata["user_id"] = event.UserID
	hauntedEvent.Metadata["channel_id"] = event.ChannelID
	hauntedEvent.Metadata["priority"] = strconv.Itoa(event.Priority)
	hauntedEvent.Metadata["cursed_level"] = strconv.Itoa(event.CursedLevel)
	hauntedEvent.Metadata["tags"] = strings.Join(event.Tags, ",")

	err := ld.tiktok.HandleEvent(hauntedEvent)
	if err != nil {
		logger.WithError(err).Error("❌ Failed to route event to TikTok")
		ld.stats.mu.Lock()
		ld.stats.FailedDispatches++
		ld.stats.mu.Unlock()
	} else {
		logger.Debug("✅ Event routed to TikTok successfully")
		ld.stats.mu.Lock()
		ld.stats.SuccessfulDispatches++
		ld.stats.TikTokDispatches++
		ld.stats.mu.Unlock()
	}
}

// routeToMarkdown sends the event to Markdown
func (ld *LoreDispatcher) routeToMarkdown(ctx context.Context, event LoreEvent) {
	logger := ld.logger.WithField("integration", "markdown")

	// Use the new lore markdown generator
	if ld.loreMarkdownGenerator != nil {
		doc, err := ld.loreMarkdownGenerator.GenerateFromLoreEvent(event)
		if err != nil {
			logger.WithError(err).Error("❌ Failed to generate markdown with lore generator")
		} else {
			logger.WithFields(logrus.Fields{
				"document_id": doc.ID,
				"file_path":   doc.FilePath,
				"session_id":  doc.SessionID,
				"topics":      len(doc.Topics),
			}).Info("✅ Lore markdown document generated successfully")
		}
	}

	// Also route to the original markdown integration for backward compatibility
	if ld.markdown != nil {
		// Convert lore event to haunted event
		hauntedEvent := &HauntedEvent{
			ID:        generateEventID(),
			Type:      event.Type,
			Source:    "lore_dispatcher",
			Timestamp: event.Timestamp,
			Payload:   convertToStringMap(event.Metadata),
			Metadata:  make(map[string]string),
			Cursed:    event.CursedLevel > 5,
			Sentiment: event.Sentiment,
			LoreLevel: event.LoreLevel,
		}

		// Add lore-specific metadata
		hauntedEvent.Metadata["content"] = event.Content
		hauntedEvent.Metadata["user_id"] = event.UserID
		hauntedEvent.Metadata["channel_id"] = event.ChannelID
		hauntedEvent.Metadata["priority"] = strconv.Itoa(event.Priority)
		hauntedEvent.Metadata["cursed_level"] = strconv.Itoa(event.CursedLevel)
		hauntedEvent.Metadata["tags"] = strings.Join(event.Tags, ",")
		hauntedEvent.Metadata["session_id"] = event.SessionID
		hauntedEvent.Metadata["session_event_count"] = strconv.Itoa(event.SessionEventCount)

		err := ld.markdown.HandleEvent(hauntedEvent)
		if err != nil {
			logger.WithError(err).Error("❌ Failed to route event to legacy Markdown")
		} else {
			logger.Debug("✅ Event routed to legacy Markdown successfully")
		}
	}

	// Update stats
	ld.stats.mu.Lock()
	ld.stats.SuccessfulDispatches++
	ld.stats.MarkdownDispatches++
	ld.stats.mu.Unlock()
}

// routeToN8N sends the event to n8n
func (ld *LoreDispatcher) routeToN8N(ctx context.Context, event LoreEvent) {
	logger := ld.logger.WithField("integration", "n8n")

	// Convert lore event to haunted event
	hauntedEvent := &HauntedEvent{
		ID:        generateEventID(),
		Type:      event.Type,
		Source:    "lore_dispatcher",
		Timestamp: event.Timestamp,
		Payload:   convertToStringMap(event.Metadata),
		Metadata:  make(map[string]string),
		Cursed:    event.CursedLevel > 5,
		Sentiment: event.Sentiment,
		LoreLevel: event.LoreLevel,
	}

	// Add lore-specific metadata
	hauntedEvent.Metadata["content"] = event.Content
	hauntedEvent.Metadata["user_id"] = event.UserID
	hauntedEvent.Metadata["channel_id"] = event.ChannelID
	hauntedEvent.Metadata["priority"] = strconv.Itoa(event.Priority)
	hauntedEvent.Metadata["cursed_level"] = strconv.Itoa(event.CursedLevel)
	hauntedEvent.Metadata["tags"] = strings.Join(event.Tags, ",")

	err := ld.n8n.HandleEvent(hauntedEvent)
	if err != nil {
		logger.WithError(err).Error("❌ Failed to route event to n8n")
		ld.stats.mu.Lock()
		ld.stats.FailedDispatches++
		ld.stats.mu.Unlock()
	} else {
		logger.Debug("✅ Event routed to n8n successfully")
		ld.stats.mu.Lock()
		ld.stats.SuccessfulDispatches++
		ld.stats.N8NDispatches++
		ld.stats.mu.Unlock()
	}
}

// validateEvent validates a lore event
func (ld *LoreDispatcher) validateEvent(event LoreEvent) error {
	if event.Type == "" {
		return errors.New("event type is required")
	}

	if event.Content == "" {
		return errors.New("event content is required")
	}

	validTypes := []string{"lore_response", "cursed_output", "reactive_dialogue"}
	isValid := false
	for _, validType := range validTypes {
		if event.Type == validType {
			isValid = true
			break
		}
	}

	if !isValid {
		return errors.Errorf("invalid event type: %s", event.Type)
	}

	if event.Priority < 1 || event.Priority > 10 {
		return errors.New("priority must be between 1 and 10")
	}

	if event.LoreLevel < 1 || event.LoreLevel > 10 {
		return errors.New("lore level must be between 1 and 10")
	}

	if event.CursedLevel < 1 || event.CursedLevel > 10 {
		return errors.New("cursed level must be between 1 and 10")
	}

	if event.Sentiment < -1 || event.Sentiment > 1 {
		return errors.New("sentiment must be between -1 and 1")
	}

	return nil
}

// GetStats returns current dispatcher statistics
func (ld *LoreDispatcher) GetStats() *DispatcherStats {
	ld.stats.mu.RLock()
	defer ld.stats.mu.RUnlock()

	// Return a copy to avoid race conditions
	return &DispatcherStats{
		TotalEvents:          ld.stats.TotalEvents,
		SuccessfulDispatches: ld.stats.SuccessfulDispatches,
		FailedDispatches:     ld.stats.FailedDispatches,
		DiscordDispatches:    ld.stats.DiscordDispatches,
		TikTokDispatches:     ld.stats.TikTokDispatches,
		MarkdownDispatches:   ld.stats.MarkdownDispatches,
		N8NDispatches:        ld.stats.N8NDispatches,
		LastEventTime:        ld.stats.LastEventTime,
	}
}

// GetStatsJSON returns statistics as JSON
func (ld *LoreDispatcher) GetStatsJSON() ([]byte, error) {
	stats := ld.GetStats()
	return json.Marshal(stats)
}

// Helper functions for environment variables
func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvFloat(key string, defaultValue float64) float64 {
	if value := os.Getenv(key); value != "" {
		if floatValue, err := strconv.ParseFloat(value, 64); err == nil {
			return floatValue
		}
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}

func getEnvString(key string, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// NewSessionManager creates a new session manager
func NewSessionManager(maxSessions int, sessionTimeout time.Duration, logger *logrus.Logger) *SessionManager {
	return &SessionManager{
		sessions:       make(map[string]*SessionState),
		maxSessions:    maxSessions,
		sessionTimeout: sessionTimeout,
		logger:         logger,
	}
}

// CreateOrGetSession creates a new session or retrieves an existing one
func (sm *SessionManager) CreateOrGetSession(sessionID, userID, channelID string) *SessionState {
	sm.mutex.Lock()
	defer sm.mutex.Unlock()

	// Check if session exists
	if session, exists := sm.sessions[sessionID]; exists {
		session.LastActivity = time.Now()
		return session
	}

	// Create new session
	session := &SessionState{
		SessionID:     sessionID,
		UserID:        userID,
		ChannelID:     channelID,
		StartTime:     time.Now(),
		LastActivity:  time.Now(),
		EventCount:    0,
		LoreEvents:    make([]LoreEvent, 0),
		ScalingFactor: 1.0,
		BaseLoreLevel: 3,
		MaxLoreLevel:  10,
		Metadata:      make(map[string]interface{}),
		Active:        true,
	}

	// Check if we need to evict old sessions
	if len(sm.sessions) >= sm.maxSessions {
		sm.evictOldestSession()
	}

	sm.sessions[sessionID] = session
	sm.logger.WithFields(logrus.Fields{
		"session_id": sessionID,
		"user_id":    userID,
		"channel_id": channelID,
	}).Info("Created new lore session")

	return session
}

// UpdateSession updates a session with a new event
func (sm *SessionManager) UpdateSession(sessionID string, event LoreEvent) {
	sm.mutex.Lock()
	defer sm.mutex.Unlock()

	session, exists := sm.sessions[sessionID]
	if !exists {
		sm.logger.WithField("session_id", sessionID).Warn("Attempted to update non-existent session")
		return
	}

	session.LastActivity = time.Now()
	session.EventCount++
	session.LoreEvents = append(session.LoreEvents, event)

	// Apply contextual scaling - ramp from base level to max level
	sessionProgress := float64(session.EventCount) / 20.0 // Scale over 20 events
	if sessionProgress > 1.0 {
		sessionProgress = 1.0
	}

	session.ScalingFactor = 1.0 + sessionProgress*2.0 // Scale from 1.0 to 3.0

	// Keep only last 50 events per session to prevent memory bloat
	if len(session.LoreEvents) > 50 {
		session.LoreEvents = session.LoreEvents[len(session.LoreEvents)-50:]
	}

	sm.logger.WithFields(logrus.Fields{
		"session_id":       sessionID,
		"event_count":      session.EventCount,
		"scaling_factor":   session.ScalingFactor,
		"session_progress": sessionProgress,
	}).Debug("Updated session with new event")
}

// GetSession retrieves a session by ID
func (sm *SessionManager) GetSession(sessionID string) (*SessionState, bool) {
	sm.mutex.RLock()
	defer sm.mutex.RUnlock()

	session, exists := sm.sessions[sessionID]
	return session, exists
}

// GetAllSessions returns all active sessions
func (sm *SessionManager) GetAllSessions() map[string]*SessionState {
	sm.mutex.RLock()
	defer sm.mutex.RUnlock()

	result := make(map[string]*SessionState)
	for id, session := range sm.sessions {
		result[id] = session
	}
	return result
}

// CleanupExpiredSessions removes sessions that have been inactive
func (sm *SessionManager) CleanupExpiredSessions() {
	sm.mutex.Lock()
	defer sm.mutex.Unlock()

	cutoff := time.Now().Add(-sm.sessionTimeout)
	toDelete := make([]string, 0)

	for sessionID, session := range sm.sessions {
		if session.LastActivity.Before(cutoff) {
			toDelete = append(toDelete, sessionID)
		}
	}

	for _, sessionID := range toDelete {
		delete(sm.sessions, sessionID)
		sm.logger.WithField("session_id", sessionID).Info("Cleaned up expired session")
	}
}

// evictOldestSession removes the oldest session to make room for new ones
func (sm *SessionManager) evictOldestSession() {
	var oldestID string
	var oldestTime time.Time

	for sessionID, session := range sm.sessions {
		if oldestID == "" || session.LastActivity.Before(oldestTime) {
			oldestID = sessionID
			oldestTime = session.LastActivity
		}
	}

	if oldestID != "" {
		delete(sm.sessions, oldestID)
		sm.logger.WithField("session_id", oldestID).Info("Evicted oldest session")
	}
}

// GetSessionStats returns statistics about sessions
func (sm *SessionManager) GetSessionStats() map[string]interface{} {
	sm.mutex.RLock()
	defer sm.mutex.RUnlock()

	stats := map[string]interface{}{
		"total_sessions":  len(sm.sessions),
		"active_sessions": 0,
		"total_events":    0,
		"average_events":  0.0,
		"session_timeout": sm.sessionTimeout.String(),
		"max_sessions":    sm.maxSessions,
	}

	totalEvents := 0
	activeSessions := 0

	for _, session := range sm.sessions {
		if session.Active {
			activeSessions++
		}
		totalEvents += session.EventCount
	}

	stats["active_sessions"] = activeSessions
	stats["total_events"] = totalEvents

	if len(sm.sessions) > 0 {
		stats["average_events"] = float64(totalEvents) / float64(len(sm.sessions))
	}

	return stats
}

// GetSessionManager returns the session manager
func (ld *LoreDispatcher) GetSessionManager() *SessionManager {
	return ld.sessionManager
}

// GetLoreMarkdownGenerator returns the lore markdown generator
func (ld *LoreDispatcher) GetLoreMarkdownGenerator() *LoreMarkdownGenerator {
	return ld.loreMarkdownGenerator
}

// GetLoreLooper returns the interactive lore looper
func (ld *LoreDispatcher) GetLoreLooper() *InteractiveLoreLooper {
	return ld.loreLooper
}

// GetMarkdownGenerator returns the markdown generator
func (ld *LoreDispatcher) GetMarkdownGenerator() *LoreMarkdownGenerator {
	return ld.loreMarkdownGenerator
}

// GetSessionStats returns session statistics
func (ld *LoreDispatcher) GetSessionStats() map[string]interface{} {
	return ld.sessionManager.GetSessionStats()
}

// CleanupExpiredSessions removes expired sessions
func (ld *LoreDispatcher) CleanupExpiredSessions() {
	ld.sessionManager.CleanupExpiredSessions()
}

// GetConflictDetector returns the conflict detector
func (ld *LoreDispatcher) GetConflictDetector() *LoreConflictDetector {
	return ld.conflictDetector
}

// GetLiveMetrics returns the live metrics collector
func (ld *LoreDispatcher) GetLiveMetrics() *LiveMetricsCollector {
	return ld.liveMetrics
}
