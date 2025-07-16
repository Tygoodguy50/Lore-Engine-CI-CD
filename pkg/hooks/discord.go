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

// 🕯️ DiscordBot - Haunted Discord integration
type DiscordBot struct {
	logger    *logrus.Logger
	token     string
	guildID   string
	channelID string
	healthy   bool
}

// NewDiscordBot creates a new Discord bot integration
func NewDiscordBot() *DiscordBot {
	return &DiscordBot{
		logger:  logrus.New(),
		healthy: false,
	}
}

func (db *DiscordBot) Name() string {
	return "discord"
}

func (db *DiscordBot) Initialize(config map[string]interface{}) error {
	db.logger.Info("🕯️ Initializing Discord haunted integration")

	if token, ok := config["token"].(string); ok {
		db.token = token
	} else {
		return errors.New("Discord token is required")
	}

	if guildID, ok := config["guild_id"].(string); ok {
		db.guildID = guildID
	}

	if channelID, ok := config["channel_id"].(string); ok {
		db.channelID = channelID
	}

	db.healthy = true
	db.logger.Info("✅ Discord integration initialized")
	return nil
}

func (db *DiscordBot) IsHealthy() bool {
	return db.healthy
}

func (db *DiscordBot) HandleEvent(event *HauntedEvent) error {
	db.logger.WithFields(logrus.Fields{
		"event_id": event.ID,
		"type":     event.Type,
		"cursed":   event.Cursed,
	}).Info("🕯️ Discord handling haunted event")

	switch event.Type {
	case "lore":
		return db.handleLoreTrigger(event)
	case "gear_drop":
		return db.handleGearDrop(event)
	case "sentiment":
		return db.handleSentiment(event)
	case "lore_response":
		return db.sendMessage(event)
	default:
		db.logger.WithField("type", event.Type).Debug("Unknown event type for Discord")
	}

	return nil
}

// 🎭 handleLoreTrigger processes lore triggers
func (db *DiscordBot) handleLoreTrigger(event *HauntedEvent) error {
	db.logger.Info("🎭 Processing lore trigger for Discord")

	// Extract lore content
	loreContent, ok := event.Payload["content"].(string)
	if !ok {
		return errors.New("No lore content found in event")
	}

	// Create haunted embed
	embed := map[string]interface{}{
		"title":       "🕯️ Lore Awakened",
		"description": loreContent,
		"color":       0x800080, // Purple
		"timestamp":   event.Timestamp.Format(time.RFC3339),
		"footer": map[string]interface{}{
			"text": "Haunted LocalAI",
		},
	}

	if event.Cursed {
		embed["title"] = "🔮 Cursed Lore Manifested"
		embed["color"] = 0xFF0000 // Red
	}

	return db.sendEmbed(embed)
}

// 🎲 handleGearDrop processes gear drop events
func (db *DiscordBot) handleGearDrop(event *HauntedEvent) error {
	db.logger.Info("🎲 Processing gear drop for Discord")

	gearName, ok := event.Payload["gear_name"].(string)
	if !ok {
		return errors.New("No gear name found in event")
	}

	rarity, _ := event.Payload["rarity"].(string)
	if rarity == "" {
		rarity = "common"
	}

	// Create gear drop embed
	embed := map[string]interface{}{
		"title":       "⚔️ Gear Drop!",
		"description": fmt.Sprintf("🎯 **%s** has manifested!\n\n**Rarity:** %s", gearName, rarity),
		"color":       db.getRarityColor(rarity),
		"timestamp":   event.Timestamp.Format(time.RFC3339),
		"fields": []map[string]interface{}{
			{
				"name":   "Drop Location",
				"value":  event.Source,
				"inline": true,
			},
			{
				"name":   "Cursed",
				"value":  fmt.Sprintf("%v", event.Cursed),
				"inline": true,
			},
		},
	}

	return db.sendEmbed(embed)
}

// 💭 handleSentiment processes sentiment analysis
func (db *DiscordBot) handleSentiment(event *HauntedEvent) error {
	db.logger.Info("💭 Processing sentiment for Discord")

	sentiment := event.Sentiment
	text, _ := event.Payload["text"].(string)

	var emoji string
	var color int
	switch {
	case sentiment > 0.5:
		emoji = "😊"
		color = 0x00FF00
	case sentiment < -0.5:
		emoji = "😢"
		color = 0xFF0000
	default:
		emoji = "😐"
		color = 0xFFFF00
	}

	embed := map[string]interface{}{
		"title":       fmt.Sprintf("%s Sentiment Analysis", emoji),
		"description": fmt.Sprintf("**Text:** %s\n**Sentiment:** %.2f", text, sentiment),
		"color":       color,
		"timestamp":   event.Timestamp.Format(time.RFC3339),
	}

	return db.sendEmbed(embed)
}

// 📤 sendMessage sends a text message to Discord
func (db *DiscordBot) sendMessage(event *HauntedEvent) error {
	if response, ok := event.Payload["response"].(string); ok {
		return db.sendTextMessage(response)
	}
	return nil
}

// 📤 sendTextMessage sends a simple text message
func (db *DiscordBot) sendTextMessage(content string) error {
	if db.channelID == "" {
		db.logger.Debug("No channel ID configured, skipping Discord message")
		return nil
	}

	payload := map[string]interface{}{
		"content": content,
	}

	return db.sendToDiscord(payload)
}

// 🎨 sendEmbed sends an embed to Discord
func (db *DiscordBot) sendEmbed(embed map[string]interface{}) error {
	if db.channelID == "" {
		db.logger.Debug("No channel ID configured, skipping Discord embed")
		return nil
	}

	payload := map[string]interface{}{
		"embeds": []map[string]interface{}{embed},
	}

	return db.sendToDiscord(payload)
}

// 🔗 sendToDiscord sends payload to Discord API
func (db *DiscordBot) sendToDiscord(payload map[string]interface{}) error {
	if db.token == "" {
		return errors.New("Discord token not configured")
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return errors.Wrap(err, "failed to marshal Discord payload")
	}

	url := fmt.Sprintf("https://discord.com/api/v10/channels/%s/messages", db.channelID)
	req, err := http.NewRequest("POST", url, strings.NewReader(string(jsonPayload)))
	if err != nil {
		return errors.Wrap(err, "failed to create Discord request")
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bot %s", db.token))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return errors.Wrap(err, "failed to send Discord request")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return errors.Errorf("Discord API returned status %d", resp.StatusCode)
	}

	db.logger.Info("✅ Message sent to Discord")
	return nil
}

// 🎨 getRarityColor returns color based on rarity
func (db *DiscordBot) getRarityColor(rarity string) int {
	switch strings.ToLower(rarity) {
	case "legendary":
		return 0xFF6600 // Orange
	case "epic":
		return 0x9932CC // Purple
	case "rare":
		return 0x0066FF // Blue
	case "uncommon":
		return 0x00FF00 // Green
	default:
		return 0x808080 // Gray
	}
}
