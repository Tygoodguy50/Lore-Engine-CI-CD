package hooks

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
)

// 🧠 N8nLangChain - Agentic behavior and ARG automation
type N8nLangChain struct {
	logger         *logrus.Logger
	n8nWebhookURL  string
	langChainURL   string
	apiKey         string
	healthy        bool
	agentMode      bool
	argEnabled     bool
	workflowID     string
}

// NewN8nLangChain creates a new n8n/LangChain integration
func NewN8nLangChain() *N8nLangChain {
	return &N8nLangChain{
		logger:     logrus.New(),
		healthy:    false,
		agentMode:  false,
		argEnabled: false,
	}
}

func (nl *N8nLangChain) Name() string {
	return "n8n-langchain"
}

func (nl *N8nLangChain) Initialize(config map[string]interface{}) error {
	nl.logger.Info("🧠 Initializing n8n/LangChain haunted integration")

	if url, ok := config["n8n_webhook_url"].(string); ok {
		nl.n8nWebhookURL = url
	}

	if url, ok := config["langchain_url"].(string); ok {
		nl.langChainURL = url
	}

	if key, ok := config["api_key"].(string); ok {
		nl.apiKey = key
	}

	if agentMode, ok := config["agent_mode"].(bool); ok {
		nl.agentMode = agentMode
	}

	if argEnabled, ok := config["arg_enabled"].(bool); ok {
		nl.argEnabled = argEnabled
	}

	if workflowID, ok := config["workflow_id"].(string); ok {
		nl.workflowID = workflowID
	}

	nl.healthy = true
	nl.logger.Info("✅ n8n/LangChain integration initialized")
	return nil
}

func (nl *N8nLangChain) IsHealthy() bool {
	return nl.healthy
}

func (nl *N8nLangChain) HandleEvent(event *HauntedEvent) error {
	nl.logger.WithFields(logrus.Fields{
		"event_id": event.ID,
		"type":     event.Type,
		"cursed":   event.Cursed,
	}).Info("🧠 n8n/LangChain handling haunted event")

	switch event.Type {
	case "agentic_behavior":
		return nl.handleAgenticBehavior(event)
	case "arg_automation":
		return nl.handleARGAutomation(event)
	case "workflow_trigger":
		return nl.handleWorkflowTrigger(event)
	case "chain_execution":
		return nl.handleChainExecution(event)
	case "intelligent_response":
		return nl.handleIntelligentResponse(event)
	default:
		nl.logger.WithField("type", event.Type).Debug("Unknown event type for n8n/LangChain")
	}

	return nil
}

// 🤖 handleAgenticBehavior processes agentic behavior events
func (nl *N8nLangChain) handleAgenticBehavior(event *HauntedEvent) error {
	nl.logger.Info("🤖 Processing agentic behavior")

	if !nl.agentMode {
		nl.logger.Debug("Agent mode disabled, skipping agentic behavior")
		return nil
	}

	behavior, ok := event.Payload["behavior"].(string)
	if !ok {
		return errors.New("No behavior found in agentic event")
	}

	// Create agentic workflow payload
	payload := map[string]interface{}{
		"type":       "agentic_behavior",
		"behavior":   behavior,
		"cursed":     event.Cursed,
		"timestamp":  event.Timestamp.Format(time.RFC3339),
		"agent_config": map[string]interface{}{
			"reasoning_mode": nl.getReasoningMode(event.Cursed),
			"creativity":     nl.getCreativityLevel(event.Cursed),
			"safety_level":   nl.getSafetyLevel(event.Cursed),
		},
		"context": nl.buildAgentContext(event),
	}

	// Send to both n8n and LangChain
	if err := nl.sendToN8n(payload); err != nil {
		nl.logger.WithError(err).Error("Failed to send agentic behavior to n8n")
	}

	if err := nl.sendToLangChain(payload); err != nil {
		nl.logger.WithError(err).Error("Failed to send agentic behavior to LangChain")
	}

	return nil
}

// 🎭 handleARGAutomation processes ARG automation events
func (nl *N8nLangChain) handleARGAutomation(event *HauntedEvent) error {
	nl.logger.Info("🎭 Processing ARG automation")

	if !nl.argEnabled {
		nl.logger.Debug("ARG automation disabled, skipping")
		return nil
	}

	scenario, ok := event.Payload["scenario"].(string)
	if !ok {
		return errors.New("No scenario found in ARG event")
	}

	// Create ARG automation payload
	payload := map[string]interface{}{
		"type":      "arg_automation",
		"scenario":  scenario,
		"cursed":    event.Cursed,
		"timestamp": event.Timestamp.Format(time.RFC3339),
		"arg_config": map[string]interface{}{
			"mystery_level":   nl.getMysteryLevel(event.Cursed),
			"clue_generation": nl.getClueGeneration(event.LoreLevel),
			"narrative_flow":  nl.getNarrativeFlow(event.Sentiment),
		},
		"automation_triggers": nl.buildARGTriggers(event),
	}

	return nl.sendToN8n(payload)
}

// 🔧 handleWorkflowTrigger processes workflow trigger events
func (nl *N8nLangChain) handleWorkflowTrigger(event *HauntedEvent) error {
	nl.logger.Info("🔧 Processing workflow trigger")

	trigger, ok := event.Payload["trigger"].(string)
	if !ok {
		return errors.New("No trigger found in workflow event")
	}

	// Create workflow trigger payload
	payload := map[string]interface{}{
		"type":        "workflow_trigger",
		"trigger":     trigger,
		"workflow_id": nl.workflowID,
		"cursed":      event.Cursed,
		"timestamp":   event.Timestamp.Format(time.RFC3339),
		"execution_context": map[string]interface{}{
			"priority":     nl.getPriority(event.Cursed),
			"timeout":      nl.getTimeout(event.Type),
			"retry_count":  nl.getRetryCount(event.Cursed),
		},
		"event_data": event.Payload,
	}

	return nl.sendToN8n(payload)
}

// ⛓️ handleChainExecution processes chain execution events
func (nl *N8nLangChain) handleChainExecution(event *HauntedEvent) error {
	nl.logger.Info("⛓️ Processing chain execution")

	chain, ok := event.Payload["chain"].(string)
	if !ok {
		return errors.New("No chain found in execution event")
	}

	// Create chain execution payload
	payload := map[string]interface{}{
		"type":      "chain_execution",
		"chain":     chain,
		"cursed":    event.Cursed,
		"timestamp": event.Timestamp.Format(time.RFC3339),
		"chain_config": map[string]interface{}{
			"model":       nl.getModel(event.Cursed),
			"temperature": nl.getTemperature(event.Cursed),
			"max_tokens":  nl.getMaxTokens(event.Type),
		},
		"execution_params": nl.buildChainParams(event),
	}

	return nl.sendToLangChain(payload)
}

// 🧩 handleIntelligentResponse processes intelligent response events
func (nl *N8nLangChain) handleIntelligentResponse(event *HauntedEvent) error {
	nl.logger.Info("🧩 Processing intelligent response")

	query, ok := event.Payload["query"].(string)
	if !ok {
		return errors.New("No query found in intelligent response event")
	}

	// Create intelligent response payload
	payload := map[string]interface{}{
		"type":      "intelligent_response",
		"query":     query,
		"cursed":    event.Cursed,
		"timestamp": event.Timestamp.Format(time.RFC3339),
		"response_config": map[string]interface{}{
			"style":       nl.getResponseStyle(event.Cursed),
			"complexity":  nl.getComplexity(event.LoreLevel),
			"personality": nl.getPersonality(event.Cursed),
		},
		"context": nl.buildResponseContext(event),
	}

	// Send to both for collaborative processing
	if err := nl.sendToN8n(payload); err != nil {
		nl.logger.WithError(err).Error("Failed to send intelligent response to n8n")
	}

	return nl.sendToLangChain(payload)
}

// 📤 sendToN8n sends payload to n8n webhook
func (nl *N8nLangChain) sendToN8n(payload map[string]interface{}) error {
	if nl.n8nWebhookURL == "" {
		nl.logger.Debug("No n8n webhook URL configured, skipping")
		return nil
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return errors.Wrap(err, "failed to marshal n8n payload")
	}

	req, err := http.NewRequest("POST", nl.n8nWebhookURL, bytes.NewBuffer(jsonPayload))
	if err != nil {
		return errors.Wrap(err, "failed to create n8n request")
	}

	req.Header.Set("Content-Type", "application/json")
	if nl.apiKey != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", nl.apiKey))
	}

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return errors.Wrap(err, "failed to send n8n request")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return errors.Errorf("n8n webhook returned status %d", resp.StatusCode)
	}

	nl.logger.Info("✅ Payload sent to n8n")
	return nil
}

// 📤 sendToLangChain sends payload to LangChain endpoint
func (nl *N8nLangChain) sendToLangChain(payload map[string]interface{}) error {
	if nl.langChainURL == "" {
		nl.logger.Debug("No LangChain URL configured, skipping")
		return nil
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return errors.Wrap(err, "failed to marshal LangChain payload")
	}

	req, err := http.NewRequest("POST", nl.langChainURL, bytes.NewBuffer(jsonPayload))
	if err != nil {
		return errors.Wrap(err, "failed to create LangChain request")
	}

	req.Header.Set("Content-Type", "application/json")
	if nl.apiKey != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", nl.apiKey))
	}

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return errors.Wrap(err, "failed to send LangChain request")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return errors.Errorf("LangChain endpoint returned status %d", resp.StatusCode)
	}

	nl.logger.Info("✅ Payload sent to LangChain")
	return nil
}

// 🧠 getReasoningMode returns reasoning mode based on cursed state
func (nl *N8nLangChain) getReasoningMode(cursed bool) string {
	if cursed {
		return "creative_dark"
	}
	return "analytical"
}

// 🎨 getCreativityLevel returns creativity level based on cursed state
func (nl *N8nLangChain) getCreativityLevel(cursed bool) float64 {
	if cursed {
		return 0.9 // High creativity for cursed content
	}
	return 0.7 // Moderate creativity for normal content
}

// 🛡️ getSafetyLevel returns safety level based on cursed state
func (nl *N8nLangChain) getSafetyLevel(cursed bool) string {
	if cursed {
		return "relaxed" // Allow more creative freedom
	}
	return "strict" // Standard safety measures
}

// 🔍 getMysteryLevel returns mystery level based on cursed state
func (nl *N8nLangChain) getMysteryLevel(cursed bool) int {
	if cursed {
		return 9 // Maximum mystery
	}
	return 5 // Moderate mystery
}

// 🧩 getClueGeneration returns clue generation settings
func (nl *N8nLangChain) getClueGeneration(loreLevel int) map[string]interface{} {
	return map[string]interface{}{
		"difficulty":     loreLevel,
		"interconnected": true,
		"red_herrings":   loreLevel > 3,
		"cryptic_style":  loreLevel > 5,
	}
}

// 📖 getNarrativeFlow returns narrative flow settings
func (nl *N8nLangChain) getNarrativeFlow(sentiment float64) map[string]interface{} {
	return map[string]interface{}{
		"pacing":    nl.getPacing(sentiment),
		"tension":   nl.getTension(sentiment),
		"emotional": sentiment,
	}
}

// ⏱️ getPacing returns pacing based on sentiment
func (nl *N8nLangChain) getPacing(sentiment float64) string {
	if sentiment > 0.5 {
		return "fast"
	} else if sentiment < -0.5 {
		return "slow"
	}
	return "medium"
}

// 😰 getTension returns tension based on sentiment
func (nl *N8nLangChain) getTension(sentiment float64) string {
	if sentiment < -0.5 {
		return "high"
	} else if sentiment > 0.5 {
		return "low"
	}
	return "medium"
}

// 🎯 getPriority returns priority based on cursed state
func (nl *N8nLangChain) getPriority(cursed bool) string {
	if cursed {
		return "high" // Cursed events get priority
	}
	return "normal"
}

// ⏰ getTimeout returns timeout based on event type
func (nl *N8nLangChain) getTimeout(eventType string) int {
	switch eventType {
	case "agentic_behavior":
		return 60 // 1 minute
	case "arg_automation":
		return 300 // 5 minutes
	case "chain_execution":
		return 120 // 2 minutes
	default:
		return 30 // 30 seconds
	}
}

// 🔄 getRetryCount returns retry count based on cursed state
func (nl *N8nLangChain) getRetryCount(cursed bool) int {
	if cursed {
		return 5 // More retries for cursed content
	}
	return 3 // Standard retries
}

// 🤖 getModel returns model based on cursed state
func (nl *N8nLangChain) getModel(cursed bool) string {
	if cursed {
		return "gpt-4-cursed" // Hypothetical cursed model
	}
	return "gpt-4"
}

// 🌡️ getTemperature returns temperature based on cursed state
func (nl *N8nLangChain) getTemperature(cursed bool) float64 {
	if cursed {
		return 0.8 // High but controlled creativity for cursed content
	}
	return 0.6 // Moderate creativity for normal content
}

// 📏 getMaxTokens returns max tokens based on event type
func (nl *N8nLangChain) getMaxTokens(eventType string) int {
	switch eventType {
	case "agentic_behavior":
		return 2000
	case "arg_automation":
		return 1500
	case "chain_execution":
		return 1000
	default:
		return 500
	}
}

// 🎭 getResponseStyle returns response style based on cursed state
func (nl *N8nLangChain) getResponseStyle(cursed bool) string {
	if cursed {
		return "mysterious_dark"
	}
	return "helpful_friendly"
}

// 🧩 getComplexity returns complexity based on lore level
func (nl *N8nLangChain) getComplexity(loreLevel int) string {
	if loreLevel > 7 {
		return "high"
	} else if loreLevel > 3 {
		return "medium"
	}
	return "low"
}

// 🎪 getPersonality returns personality based on cursed state
func (nl *N8nLangChain) getPersonality(cursed bool) string {
	if cursed {
		return "enigmatic_sage"
	}
	return "knowledgeable_assistant"
}

// 🏗️ buildAgentContext builds context for agent behavior
func (nl *N8nLangChain) buildAgentContext(event *HauntedEvent) map[string]interface{} {
	return map[string]interface{}{
		"event_history": nl.getEventHistory(event.ID),
		"user_context":  nl.getUserContext(event),
		"system_state":  nl.getSystemState(),
		"cursed_level":  nl.getCursedLevel(event.Cursed),
	}
}

// 🎭 buildARGTriggers builds ARG automation triggers
func (nl *N8nLangChain) buildARGTriggers(event *HauntedEvent) []map[string]interface{} {
	triggers := []map[string]interface{}{
		{
			"type":      "time_based",
			"schedule":  nl.getARGSchedule(event.Cursed),
			"condition": "lore_level_threshold",
		},
		{
			"type":      "event_based",
			"trigger":   "user_interaction",
			"condition": "sentiment_change",
		},
	}

	if event.Cursed {
		triggers = append(triggers, map[string]interface{}{
			"type":      "cursed_trigger",
			"trigger":   "dark_event",
			"condition": "mystery_deepening",
		})
	}

	return triggers
}

// ⛓️ buildChainParams builds chain execution parameters
func (nl *N8nLangChain) buildChainParams(event *HauntedEvent) map[string]interface{} {
	return map[string]interface{}{
		"input_variables": nl.getInputVariables(event),
		"memory_config":   nl.getMemoryConfig(event.Cursed),
		"tool_selection":  nl.getToolSelection(event.Type),
		"output_format":   nl.getOutputFormat(event.Cursed),
	}
}

// 🧩 buildResponseContext builds context for intelligent responses
func (nl *N8nLangChain) buildResponseContext(event *HauntedEvent) map[string]interface{} {
	return map[string]interface{}{
		"conversation_history": nl.getConversationHistory(event.ID),
		"user_preferences":     nl.getUserPreferences(event),
		"knowledge_base":       nl.getKnowledgeBase(event.Cursed),
		"response_constraints": nl.getResponseConstraints(event.Cursed),
	}
}

// Helper methods (placeholders for actual implementations)
func (nl *N8nLangChain) getEventHistory(eventID string) []string {
	return []string{"placeholder_history"}
}

func (nl *N8nLangChain) getUserContext(event *HauntedEvent) map[string]interface{} {
	return map[string]interface{}{"user_id": "unknown", "session": event.ID}
}

func (nl *N8nLangChain) getSystemState() map[string]interface{} {
	return map[string]interface{}{"status": "operational", "mode": "haunted"}
}

func (nl *N8nLangChain) getCursedLevel(cursed bool) int {
	if cursed {
		return 8
	}
	return 0
}

func (nl *N8nLangChain) getARGSchedule(cursed bool) string {
	if cursed {
		return "random_haunted"
	}
	return "predictable"
}

func (nl *N8nLangChain) getInputVariables(event *HauntedEvent) []string {
	return []string{"query", "context", "cursed_state"}
}

func (nl *N8nLangChain) getMemoryConfig(cursed bool) map[string]interface{} {
	return map[string]interface{}{
		"type":     "conversation_buffer",
		"k":        10,
		"cursed":   cursed,
	}
}

func (nl *N8nLangChain) getToolSelection(eventType string) []string {
	return []string{"search", "reasoning", "generation"}
}

func (nl *N8nLangChain) getOutputFormat(cursed bool) string {
	if cursed {
		return "mysterious_narrative"
	}
	return "structured_response"
}

func (nl *N8nLangChain) getConversationHistory(eventID string) []string {
	return []string{"placeholder_conversation"}
}

func (nl *N8nLangChain) getUserPreferences(event *HauntedEvent) map[string]interface{} {
	return map[string]interface{}{"style": "default", "verbosity": "medium"}
}

func (nl *N8nLangChain) getKnowledgeBase(cursed bool) string {
	if cursed {
		return "cursed_knowledge"
	}
	return "standard_knowledge"
}

func (nl *N8nLangChain) getResponseConstraints(cursed bool) map[string]interface{} {
	return map[string]interface{}{
		"max_length": 1000,
		"style":      nl.getResponseStyle(cursed),
		"safety":     nl.getSafetyLevel(cursed),
	}
}
