package hooks

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
)

// 🕯️ HauntedHooks - The central haunted integration system
type HauntedHooks struct {
	logger       *logrus.Logger
	integrations map[string]Integration
	triggers     []LoreTrigger
}

// Integration represents a haunted external interface
type Integration interface {
	Name() string
	Initialize(config map[string]interface{}) error
	HandleEvent(event *HauntedEvent) error
	IsHealthy() bool
}

// 🎭 HauntedEvent - Core event structure for all haunted interactions
type HauntedEvent struct {
	ID        string                 `json:"id"`
	Type      string                 `json:"type"`   // "lore", "gear_drop", "sentiment", "viral", "arg"
	Source    string                 `json:"source"` // "discord", "tiktok", "markdown", "n8n"
	Timestamp time.Time              `json:"timestamp"`
	Payload   map[string]interface{} `json:"payload"`
	Metadata  map[string]string      `json:"metadata"`
	Cursed    bool                   `json:"cursed"`     // 🔮 Marks events as cursed/haunted
	Sentiment float64                `json:"sentiment"`  // -1.0 to 1.0
	LoreLevel int                    `json:"lore_level"` // 0-10 depth of lore
}

// 🎯 LoreTrigger - Defines conditions for haunted responses
type LoreTrigger struct {
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	Keywords     []string `json:"keywords"`
	Patterns     []string `json:"patterns"`
	MinSentiment float64  `json:"min_sentiment"`
	MaxSentiment float64  `json:"max_sentiment"`
	LoreLevel    int      `json:"lore_level"`
	Response     string   `json:"response"`
	Cursed       bool     `json:"cursed"`
}

// NewHauntedHooks creates the central haunted system
func NewHauntedHooks() *HauntedHooks {
	return &HauntedHooks{
		logger:       logrus.New(),
		integrations: make(map[string]Integration),
		triggers:     make([]LoreTrigger, 0),
	}
}

// 🕯️ RegisterIntegration adds a haunted integration
func (hh *HauntedHooks) RegisterIntegration(integration Integration) error {
	hh.logger.WithField("integration", integration.Name()).Info("🕯️ Registering haunted integration")
	hh.integrations[integration.Name()] = integration
	return nil
}

// 🎛️ InitializeIntegrations initializes all registered integrations
func (hh *HauntedHooks) InitializeIntegrations(configs map[string]map[string]interface{}) error {
	hh.logger.Info("⚡ Initializing haunted integrations")

	for name, integration := range hh.integrations {
		config, exists := configs[name]
		if !exists {
			config = make(map[string]interface{})
		}

		if err := integration.Initialize(config); err != nil {
			return errors.Wrapf(err, "failed to initialize integration: %s", name)
		}

		hh.logger.WithField("integration", name).Info("✅ Integration initialized")
	}

	return nil
}

// 🎭 ProcessEvent handles incoming haunted events
func (hh *HauntedHooks) ProcessEvent(event *HauntedEvent) error {
	hh.logger.WithFields(logrus.Fields{
		"event_id": event.ID,
		"type":     event.Type,
		"source":   event.Source,
		"cursed":   event.Cursed,
	}).Info("🎭 Processing haunted event")

	// Check lore triggers
	for i, trigger := range hh.triggers {
		if hh.matchesTrigger(event, &hh.triggers[i]) {
			hh.logger.WithField("trigger", trigger.Name).Info("🔮 Lore trigger activated")
			return hh.executeTrigger(event, &hh.triggers[i])
		}
	}

	// Route to appropriate integrations
	for _, integration := range hh.integrations {
		if integration.IsHealthy() {
			if err := integration.HandleEvent(event); err != nil {
				hh.logger.WithError(err).WithField("integration", integration.Name()).Error("Integration failed to handle event")
			}
		}
	}

	return nil
}

// 🔮 matchesTrigger checks if event matches lore trigger
func (hh *HauntedHooks) matchesTrigger(event *HauntedEvent, trigger *LoreTrigger) bool {
	// Check sentiment range
	if event.Sentiment < trigger.MinSentiment || event.Sentiment > trigger.MaxSentiment {
		return false
	}

	// Check lore level
	if event.LoreLevel < trigger.LoreLevel {
		return false
	}

	// Check cursed status
	if trigger.Cursed && !event.Cursed {
		return false
	}

	// Check keywords in payload
	payloadStr := fmt.Sprintf("%v", event.Payload)
	for _, keyword := range trigger.Keywords {
		if contains(payloadStr, keyword) {
			return true
		}
	}

	return false
}

// 🎯 executeTrigger runs the lore trigger response
func (hh *HauntedHooks) executeTrigger(event *HauntedEvent, trigger *LoreTrigger) error {
	hh.logger.WithFields(logrus.Fields{
		"trigger": trigger.Name,
		"cursed":  trigger.Cursed,
	}).Info("🎯 Executing lore trigger")

	// Create response event
	response := &HauntedEvent{
		ID:        generateID(),
		Type:      "lore_response",
		Source:    "local-ai",
		Timestamp: time.Now(),
		Payload: map[string]interface{}{
			"trigger_id": trigger.ID,
			"response":   trigger.Response,
			"original":   event,
		},
		Cursed:    trigger.Cursed,
		LoreLevel: trigger.LoreLevel,
	}

	// Send response back through integrations
	return hh.ProcessEvent(response)
}

// 🕸️ SetupRoutes adds haunted endpoints to gin router
func (hh *HauntedHooks) SetupRoutes(r *gin.Engine) {
	haunted := r.Group("/haunted")
	{
		haunted.POST("/webhook", hh.handleWebhook)
		haunted.GET("/status", hh.handleStatus)
		haunted.POST("/trigger", hh.handleTrigger)
		haunted.GET("/lore", hh.handleLore)
		haunted.POST("/curse", hh.handleCurse)
	}
}

// 🎪 handleWebhook receives events from external sources
func (hh *HauntedHooks) handleWebhook(c *gin.Context) {
	var event HauntedEvent
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid haunted event", "details": err.Error()})
		return
	}

	// Add timestamp if not present
	if event.Timestamp.IsZero() {
		event.Timestamp = time.Now()
	}

	// Generate ID if not present
	if event.ID == "" {
		event.ID = generateID()
	}

	if err := hh.ProcessEvent(&event); err != nil {
		hh.logger.WithError(err).Error("Failed to process haunted event")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process event"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":   "haunted",
		"event_id": event.ID,
		"cursed":   event.Cursed,
	})
}

// 🔮 handleStatus returns haunted system status
func (hh *HauntedHooks) handleStatus(c *gin.Context) {
	status := map[string]interface{}{
		"status":       "haunted",
		"integrations": make(map[string]bool),
		"triggers":     len(hh.triggers),
		"timestamp":    time.Now(),
	}

	for name, integration := range hh.integrations {
		status["integrations"].(map[string]bool)[name] = integration.IsHealthy()
	}

	c.JSON(http.StatusOK, status)
}

// 🎭 handleTrigger manually triggers lore events
func (hh *HauntedHooks) handleTrigger(c *gin.Context) {
	var req struct {
		TriggerID string                 `json:"trigger_id"`
		Payload   map[string]interface{} `json:"payload"`
		Cursed    bool                   `json:"cursed"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid trigger request"})
		return
	}

	event := &HauntedEvent{
		ID:        generateID(),
		Type:      "manual_trigger",
		Source:    "api",
		Timestamp: time.Now(),
		Payload:   req.Payload,
		Cursed:    req.Cursed,
	}

	if err := hh.ProcessEvent(event); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to trigger event"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "triggered", "event_id": event.ID})
}

// 📜 handleLore returns lore documentation
func (hh *HauntedHooks) handleLore(c *gin.Context) {
	lore := map[string]interface{}{
		"title":    "🕯️ Haunted LocalAI Lore",
		"version":  "1.0.0",
		"cursed":   true,
		"triggers": hh.triggers,
		"integrations": []string{
			"🕯️ Discord Bot - Lore triggers, gear drops, live sentiment",
			"📦 TikTok Webhook - Viral rotations, reactive dialogue",
			"📜 Markdown Injector - Generates lore docs, cursed outputs",
			"🧭 n8n/LangChain - Agentic behavior, ARG automation",
		},
	}

	c.JSON(http.StatusOK, lore)
}

// 🔮 handleCurse marks events as cursed
func (hh *HauntedHooks) handleCurse(c *gin.Context) {
	var req struct {
		EventID string `json:"event_id"`
		Cursed  bool   `json:"cursed"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid curse request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":   "cursed",
		"event_id": req.EventID,
		"cursed":   req.Cursed,
	})
}

// 🎭 AddLoreTrigger adds a new lore trigger to the system
func (hh *HauntedHooks) AddLoreTrigger(trigger *LoreTrigger) error {
	hh.logger.WithField("trigger", trigger.Name).Info("🎭 Adding lore trigger")
	hh.triggers = append(hh.triggers, *trigger)
	return nil
}

// 📊 GetStatus returns the current status of all integrations
func (hh *HauntedHooks) GetStatus() map[string]interface{} {
	status := map[string]interface{}{
		"total_integrations": len(hh.integrations),
		"total_triggers":     len(hh.triggers),
		"integrations":       make(map[string]interface{}),
	}

	for name, integration := range hh.integrations {
		status["integrations"].(map[string]interface{})[name] = map[string]interface{}{
			"name":    integration.Name(),
			"healthy": integration.IsHealthy(),
		}
	}

	return status
}

// Helper functions
func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || (len(s) > len(substr) && (s[:len(substr)] == substr || s[len(s)-len(substr):] == substr || contains(s[1:len(s)-1], substr))))
}

func generateID() string {
	return fmt.Sprintf("haunted_%d", time.Now().UnixNano())
}
