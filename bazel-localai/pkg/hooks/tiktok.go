package hooks

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
)

// 📦 TikTokWebhook - Viral rotations and reactive dialogue
type TikTokWebhook struct {
	logger         *logrus.Logger
	webhookURL     string
	accessToken    string
	healthy        bool
	viralThreshold float64
}

// NewTikTokWebhook creates a new TikTok webhook integration
func NewTikTokWebhook() *TikTokWebhook {
	return &TikTokWebhook{
		logger:         logrus.New(),
		healthy:        false,
		viralThreshold: 0.8, // Default viral threshold
	}
}

func (tw *TikTokWebhook) Name() string {
	return "tiktok"
}

func (tw *TikTokWebhook) Initialize(config map[string]interface{}) error {
	tw.logger.Info("📦 Initializing TikTok haunted integration")

	if url, ok := config["webhook_url"].(string); ok {
		tw.webhookURL = url
	} else {
		return errors.New("TikTok webhook URL is required")
	}

	if token, ok := config["access_token"].(string); ok {
		tw.accessToken = token
	}

	if threshold, ok := config["viral_threshold"].(float64); ok {
		tw.viralThreshold = threshold
	}

	tw.healthy = true
	tw.logger.Info("✅ TikTok integration initialized")
	return nil
}

func (tw *TikTokWebhook) IsHealthy() bool {
	return tw.healthy
}

func (tw *TikTokWebhook) HandleEvent(event *HauntedEvent) error {
	tw.logger.WithFields(logrus.Fields{
		"event_id": event.ID,
		"type":     event.Type,
		"cursed":   event.Cursed,
	}).Info("📦 TikTok handling haunted event")

	switch event.Type {
	case "viral":
		return tw.handleViralRotation(event)
	case "reactive_dialogue":
		return tw.handleReactiveDialogue(event)
	case "lore_response":
		return tw.handleLoreResponse(event)
	case "sentiment":
		return tw.handleSentimentReaction(event)
	default:
		tw.logger.WithField("type", event.Type).Debug("Unknown event type for TikTok")
	}

	return nil
}

// 🌪️ handleViralRotation processes viral content rotations
func (tw *TikTokWebhook) handleViralRotation(event *HauntedEvent) error {
	tw.logger.Info("🌪️ Processing viral rotation for TikTok")

	content, ok := event.Payload["content"].(string)
	if !ok {
		return errors.New("No content found in viral event")
	}

	// Check if content meets viral threshold
	viralScore, _ := event.Payload["viral_score"].(float64)
	if viralScore < tw.viralThreshold {
		tw.logger.WithField("score", viralScore).Debug("Content below viral threshold")
		return nil
	}

	// Create viral rotation payload
	rotation := map[string]interface{}{
		"type":        "viral_rotation",
		"content":     content,
		"viral_score": viralScore,
		"cursed":      event.Cursed,
		"timestamp":   event.Timestamp.Format(time.RFC3339),
		"hashtags":    tw.generateHashtags(content, event.Cursed),
		"effects":     tw.generateEffects(event.Cursed),
	}

	return tw.sendToTikTok(rotation)
}

// 💬 handleReactiveDialogue processes reactive dialogue
func (tw *TikTokWebhook) handleReactiveDialogue(event *HauntedEvent) error {
	tw.logger.Info("💬 Processing reactive dialogue for TikTok")

	userMessage, ok := event.Payload["message"].(string)
	if !ok {
		return errors.New("No message found in dialogue event")
	}

	// Generate reactive response
	response := tw.generateReactiveResponse(userMessage, event.Cursed, event.Sentiment)

	dialogue := map[string]interface{}{
		"type":         "reactive_dialogue",
		"user_message": userMessage,
		"ai_response":  response,
		"sentiment":    event.Sentiment,
		"cursed":       event.Cursed,
		"timestamp":    event.Timestamp.Format(time.RFC3339),
		"engagement":   tw.calculateEngagement(event),
	}

	return tw.sendToTikTok(dialogue)
}

// 📜 handleLoreResponse processes lore responses for TikTok
func (tw *TikTokWebhook) handleLoreResponse(event *HauntedEvent) error {
	tw.logger.Info("📜 Processing lore response for TikTok")

	response, ok := event.Payload["response"].(string)
	if !ok {
		return nil
	}

	// Create TikTok-friendly lore content
	loreContent := map[string]interface{}{
		"type":       "lore_content",
		"story":      response,
		"cursed":     event.Cursed,
		"lore_level": event.LoreLevel,
		"timestamp":  event.Timestamp.Format(time.RFC3339),
		"format":     tw.formatForTikTok(response),
		"duration":   tw.calculateDuration(response),
	}

	return tw.sendToTikTok(loreContent)
}

// 😊 handleSentimentReaction processes sentiment-based reactions
func (tw *TikTokWebhook) handleSentimentReaction(event *HauntedEvent) error {
	tw.logger.Info("😊 Processing sentiment reaction for TikTok")

	reaction := map[string]interface{}{
		"type":      "sentiment_reaction",
		"sentiment": event.Sentiment,
		"cursed":    event.Cursed,
		"reaction":  tw.getSentimentReaction(event.Sentiment, event.Cursed),
		"timestamp": event.Timestamp.Format(time.RFC3339),
		"filters":   tw.getSentimentFilters(event.Sentiment),
		"sounds":    tw.getSentimentSounds(event.Sentiment, event.Cursed),
	}

	return tw.sendToTikTok(reaction)
}

// 🔗 sendToTikTok sends payload to TikTok webhook
func (tw *TikTokWebhook) sendToTikTok(payload map[string]interface{}) error {
	if tw.webhookURL == "" {
		tw.logger.Debug("No webhook URL configured, skipping TikTok send")
		return nil
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return errors.Wrap(err, "failed to marshal TikTok payload")
	}

	req, err := http.NewRequest("POST", tw.webhookURL, strings.NewReader(string(jsonPayload)))
	if err != nil {
		return errors.Wrap(err, "failed to create TikTok request")
	}

	req.Header.Set("Content-Type", "application/json")
	if tw.accessToken != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", tw.accessToken))
	}

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return errors.Wrap(err, "failed to send TikTok request")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return errors.Errorf("TikTok webhook returned status %d", resp.StatusCode)
	}

	tw.logger.Info("✅ Payload sent to TikTok")
	return nil
}

// 🏷️ generateHashtags creates hashtags for viral content
func (tw *TikTokWebhook) generateHashtags(content string, cursed bool) []string {
	baseHashtags := []string{"#AI", "#LocalAI", "#Tech", "#Viral"}

	if cursed {
		baseHashtags = append(baseHashtags, "#Cursed", "#Haunted", "#Dark", "#Mystery")
	} else {
		baseHashtags = append(baseHashtags, "#Cool", "#Amazing", "#Future", "#Innovation")
	}

	// Add content-specific hashtags
	if strings.Contains(strings.ToLower(content), "lore") {
		baseHashtags = append(baseHashtags, "#Lore", "#Story", "#Epic")
	}

	return baseHashtags
}

// 🎭 generateEffects creates effects for content
func (tw *TikTokWebhook) generateEffects(cursed bool) []string {
	if cursed {
		return []string{"dark_glitch", "horror_filter", "distortion", "shadow_effect"}
	}
	return []string{"glow", "sparkle", "colorful", "smooth_transition"}
}

// 💬 generateReactiveResponse creates AI response for dialogue
func (tw *TikTokWebhook) generateReactiveResponse(message string, cursed bool, sentiment float64) string {
	if cursed {
		return fmt.Sprintf("🔮 *The shadows whisper*: %s... but darker energies stir within these words...", message)
	}

	if sentiment > 0.5 {
		return fmt.Sprintf("✨ I sense joy in your words! %s - let's amplify this positive energy!", message)
	} else if sentiment < -0.5 {
		return fmt.Sprintf("💭 I hear your concerns about %s. Let's explore this together...", message)
	}

	return fmt.Sprintf("🤖 Processing: %s - interesting perspective, tell me more!", message)
}

// 📊 calculateEngagement estimates engagement potential
func (tw *TikTokWebhook) calculateEngagement(event *HauntedEvent) float64 {
	base := 0.5

	if event.Cursed {
		base += 0.3 // Cursed content tends to be more engaging
	}

	if event.Sentiment > 0.5 || event.Sentiment < -0.5 {
		base += 0.2 // Strong sentiment drives engagement
	}

	if event.LoreLevel > 5 {
		base += 0.1 // Deep lore attracts dedicated followers
	}

	return base
}

// 🎬 formatForTikTok formats content for TikTok display
func (tw *TikTokWebhook) formatForTikTok(content string) map[string]interface{} {
	return map[string]interface{}{
		"text_overlay": true,
		"max_length":   150,
		"font_style":   "dramatic",
		"animation":    "typewriter",
		"background":   "dark_gradient",
	}
}

// ⏱️ calculateDuration estimates video duration
func (tw *TikTokWebhook) calculateDuration(content string) int {
	// Rough estimate: 3 seconds per sentence
	sentences := strings.Count(content, ".") + strings.Count(content, "!") + strings.Count(content, "?")
	duration := sentences * 3

	// Minimum 15 seconds, maximum 60 seconds
	if duration < 15 {
		duration = 15
	} else if duration > 60 {
		duration = 60
	}

	return duration
}

// 😊 getSentimentReaction returns reaction based on sentiment
func (tw *TikTokWebhook) getSentimentReaction(sentiment float64, cursed bool) string {
	if cursed {
		return "dark_energy"
	}

	if sentiment > 0.5 {
		return "positive_energy"
	} else if sentiment < -0.5 {
		return "concerned_energy"
	}

	return "neutral_energy"
}

// 🎨 getSentimentFilters returns filters based on sentiment
func (tw *TikTokWebhook) getSentimentFilters(sentiment float64) []string {
	if sentiment > 0.5 {
		return []string{"brightness", "saturation", "warm_tones"}
	} else if sentiment < -0.5 {
		return []string{"desaturate", "cool_tones", "vignette"}
	}

	return []string{"neutral", "balance"}
}

// 🎵 getSentimentSounds returns sounds based on sentiment
func (tw *TikTokWebhook) getSentimentSounds(sentiment float64, cursed bool) []string {
	if cursed {
		return []string{"dark_ambient", "whispers", "eerie_tones"}
	}

	if sentiment > 0.5 {
		return []string{"upbeat", "energetic", "positive_vibes"}
	} else if sentiment < -0.5 {
		return []string{"calm", "soothing", "reflective"}
	}

	return []string{"neutral", "ambient", "tech_sounds"}
}
