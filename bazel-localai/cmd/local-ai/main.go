package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"github.com/spf13/cobra"
	
	"github.com/mudler/LocalAI/pkg/hooks"
)

func main() {
	rootCmd := &cobra.Command{
		Use:   "local-ai",
		Short: "LocalAI - Local AI daemon",
		Long:  `LocalAI is a local AI daemon that provides AI capabilities.`,
		Run: func(cmd *cobra.Command, args []string) {
			runServer()
		},
	}

	if err := rootCmd.Execute(); err != nil {
		log.Fatal(errors.Wrap(err, "failed to execute command"))
	}
}

func runServer() {
	logrus.Info("Starting LocalAI server...")

	// 🕸️ Initialize haunted hooks system
	hauntedHooks := hooks.NewHauntedHooks()
	
	// Register all integrations
	discordBot := hooks.NewDiscordBot()
	tiktokWebhook := hooks.NewTikTokWebhook()
	markdownInjector := hooks.NewMarkdownInjector()
	n8nLangChain := hooks.NewN8nLangChain()
	
	if err := hauntedHooks.RegisterIntegration(discordBot); err != nil {
		logrus.WithError(err).Warn("Failed to register Discord integration")
	}
	
	if err := hauntedHooks.RegisterIntegration(tiktokWebhook); err != nil {
		logrus.WithError(err).Warn("Failed to register TikTok integration")
	}
	
	if err := hauntedHooks.RegisterIntegration(markdownInjector); err != nil {
		logrus.WithError(err).Warn("Failed to register Markdown integration")
	}
	
	if err := hauntedHooks.RegisterIntegration(n8nLangChain); err != nil {
		logrus.WithError(err).Warn("Failed to register n8n/LangChain integration")
	}

	// Initialize integrations with configuration
	integrationConfigs := map[string]map[string]interface{}{
		"discord": {
			"token":       os.Getenv("DISCORD_TOKEN"),
			"channel_id":  os.Getenv("DISCORD_CHANNEL_ID"),
			"guild_id":    os.Getenv("DISCORD_GUILD_ID"),
		},
		"tiktok": {
			"webhook_url":     os.Getenv("TIKTOK_WEBHOOK_URL"),
			"access_token":    os.Getenv("TIKTOK_ACCESS_TOKEN"),
			"viral_threshold": 0.8,
		},
		"markdown": {
			"output_dir":   "./docs/haunted",
			"auto_commit":  os.Getenv("MARKDOWN_AUTO_COMMIT") == "true",
			"git_repo":     os.Getenv("MARKDOWN_GIT_REPO"),
		},
		"n8n-langchain": {
			"n8n_webhook_url": os.Getenv("N8N_WEBHOOK_URL"),
			"langchain_url":   os.Getenv("LANGCHAIN_URL"),
			"api_key":         os.Getenv("N8N_API_KEY"),
			"agent_mode":      os.Getenv("AGENT_MODE") == "true",
			"arg_enabled":     os.Getenv("ARG_ENABLED") == "true",
		},
	}

	if err := hauntedHooks.InitializeIntegrations(integrationConfigs); err != nil {
		logrus.WithError(err).Warn("Failed to initialize some integrations")
	}

	// 🔮 Initialize the Lore Dispatcher
	loreDispatcher := hooks.NewLoreDispatcher(discordBot, tiktokWebhook, markdownInjector, n8nLangChain)
	defer loreDispatcher.Stop()

	r := gin.Default()

	// Health endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "healthy",
			"message": "LocalAI is running",
		})
	})

	// 🔮 Haunted webhooks endpoints
	r.POST("/haunted/webhook", func(c *gin.Context) {
		var event hooks.HauntedEvent
		if err := c.ShouldBindJSON(&event); err != nil {
			c.JSON(400, gin.H{"error": "Invalid haunted event format"})
			return
		}

		if err := hauntedHooks.ProcessEvent(&event); err != nil {
			logrus.WithError(err).Error("Failed to process haunted event")
			c.JSON(500, gin.H{"error": "Failed to process haunted event"})
			return
		}

		c.JSON(200, gin.H{"status": "Event processed", "event_id": event.ID})
	})

	// 🎭 Lore trigger endpoint
	r.POST("/haunted/lore", func(c *gin.Context) {
		var trigger hooks.LoreTrigger
		if err := c.ShouldBindJSON(&trigger); err != nil {
			c.JSON(400, gin.H{"error": "Invalid lore trigger format"})
			return
		}

		if err := hauntedHooks.AddLoreTrigger(&trigger); err != nil {
			logrus.WithError(err).Error("Failed to add lore trigger")
			c.JSON(500, gin.H{"error": "Failed to add lore trigger"})
			return
		}

		c.JSON(200, gin.H{"status": "Lore trigger added", "trigger": trigger.Name})
	})

	// 📊 Status endpoint for haunted integrations
	r.GET("/haunted/status", func(c *gin.Context) {
		status := hauntedHooks.GetStatus()
		c.JSON(200, status)
	})

	// 🔮 Lore Dispatcher endpoints
	r.POST("/lore/dispatch", func(c *gin.Context) {
		var event hooks.LoreEvent
		if err := c.ShouldBindJSON(&event); err != nil {
			c.JSON(400, gin.H{"error": "Invalid lore event format"})
			return
		}

		if err := loreDispatcher.DispatchEvent(event); err != nil {
			logrus.WithError(err).Error("Failed to dispatch lore event")
			c.JSON(500, gin.H{"error": "Failed to dispatch lore event"})
			return
		}

		c.JSON(200, gin.H{"status": "Lore event dispatched", "type": event.Type})
	})

	// 📊 Lore dispatcher statistics
	r.GET("/lore/stats", func(c *gin.Context) {
		stats := loreDispatcher.GetStats()
		
		// Enhance stats with comprehensive metrics
		enhancedStats := map[string]interface{}{
			"dispatcher": stats,
		}
		
		// Add live metrics if available
		if loreDispatcher.GetLiveMetrics() != nil {
			enhancedStats["live_metrics"] = loreDispatcher.GetLiveMetrics().GetMetrics()
		}
		
		// Add conflict detector stats
		if loreDispatcher.GetConflictDetector() != nil {
			enhancedStats["conflict_detector"] = loreDispatcher.GetConflictDetector().GetConflictStats()
		}
		
		// Add lore looper stats
		if loreDispatcher.GetLoreLooper() != nil {
			enhancedStats["lore_looper"] = loreDispatcher.GetLoreLooper().GetLooperStats()
		}
		
		// Add markdown generator stats
		if loreDispatcher.GetMarkdownGenerator() != nil {
			enhancedStats["markdown_generator"] = loreDispatcher.GetMarkdownGenerator().GetGeneratorStats()
		}
		
		c.JSON(200, enhancedStats)
	})

	// 🎭 Convenience endpoints for specific lore events
	r.POST("/lore/response", func(c *gin.Context) {
		var request struct {
			Content     string                 `json:"content"`
			UserID      string                 `json:"user_id"`
			ChannelID   string                 `json:"channel_id"`
			LoreLevel   int                    `json:"lore_level"`
			Priority    int                    `json:"priority"`
			Tags        []string               `json:"tags"`
			Metadata    map[string]interface{} `json:"metadata"`
			SessionID   string                 `json:"session_id"`
		}
		
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(400, gin.H{"error": "Invalid lore response format"})
			return
		}

		event := hooks.LoreEvent{
			Type:        "lore_response",
			Content:     request.Content,
			UserID:      request.UserID,
			ChannelID:   request.ChannelID,
			LoreLevel:   request.LoreLevel,
			CursedLevel: 5, // Set a default cursed level
			Priority:    request.Priority,
			Tags:        request.Tags,
			Metadata:    request.Metadata,
			SessionID:   request.SessionID,
			Timestamp:   time.Now(),
		}

		if err := loreDispatcher.DispatchEvent(event); err != nil {
			logrus.WithError(err).Error("Failed to dispatch lore response")
			c.JSON(500, gin.H{"error": "Failed to dispatch lore response"})
			return
		}

		c.JSON(200, gin.H{"status": "Lore response dispatched"})
	})

	r.POST("/lore/cursed", func(c *gin.Context) {
		var request struct {
			Content     string                 `json:"content"`
			UserID      string                 `json:"user_id"`
			ChannelID   string                 `json:"channel_id"`
			CursedLevel int                    `json:"cursed_level"`
			Priority    int                    `json:"priority"`
			Tags        []string               `json:"tags"`
			Metadata    map[string]interface{} `json:"metadata"`
			SessionID   string                 `json:"session_id"`
		}
		
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(400, gin.H{"error": "Invalid cursed output format"})
			return
		}

		event := hooks.LoreEvent{
			Type:        "cursed_output",
			Content:     request.Content,
			UserID:      request.UserID,
			ChannelID:   request.ChannelID,
			LoreLevel:   5, // Set a default lore level
			CursedLevel: request.CursedLevel,
			Priority:    request.Priority,
			Tags:        request.Tags,
			Metadata:    request.Metadata,
			SessionID:   request.SessionID,
			Timestamp:   time.Now(),
		}

		if err := loreDispatcher.DispatchEvent(event); err != nil {
			logrus.WithError(err).Error("Failed to dispatch cursed output")
			c.JSON(500, gin.H{"error": "Failed to dispatch cursed output"})
			return
		}

		c.JSON(200, gin.H{"status": "Cursed output dispatched"})
	})

	r.POST("/lore/reactive", func(c *gin.Context) {
		var request struct {
			Content     string                 `json:"content"`
			UserID      string                 `json:"user_id"`
			ChannelID   string                 `json:"channel_id"`
			Priority    int                    `json:"priority"`
			Sentiment   float64                `json:"sentiment"`
			Tags        []string               `json:"tags"`
			Metadata    map[string]interface{} `json:"metadata"`
			SessionID   string                 `json:"session_id"`
		}
		
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(400, gin.H{"error": "Invalid reactive dialogue format"})
			return
		}

		event := hooks.LoreEvent{
			Type:        "reactive_dialogue",
			Content:     request.Content,
			UserID:      request.UserID,
			ChannelID:   request.ChannelID,
			LoreLevel:   5, // Set a default lore level
			CursedLevel: 3, // Set a default cursed level
			Priority:    request.Priority,
			Sentiment:   request.Sentiment,
			Tags:        request.Tags,
			Metadata:    request.Metadata,
			SessionID:   request.SessionID,
			Timestamp:   time.Now(),
		}

		if err := loreDispatcher.DispatchEvent(event); err != nil {
			logrus.WithError(err).Error("Failed to dispatch reactive dialogue")
			c.JSON(500, gin.H{"error": "Failed to dispatch reactive dialogue"})
			return
		}

		c.JSON(200, gin.H{"status": "Reactive dialogue dispatched"})
	})

	// 🔮 Session Management Endpoints
	r.GET("/lore/sessions", func(c *gin.Context) {
		sessions := loreDispatcher.GetSessionManager().GetAllSessions()
		c.JSON(200, gin.H{"sessions": sessions})
	})

	r.GET("/lore/sessions/:session_id", func(c *gin.Context) {
		sessionID := c.Param("session_id")
		session, exists := loreDispatcher.GetSessionManager().GetSession(sessionID)
		if !exists {
			c.JSON(404, gin.H{"error": "Session not found"})
			return
		}
		c.JSON(200, gin.H{"session": session})
	})

	r.GET("/lore/sessions/stats", func(c *gin.Context) {
		stats := loreDispatcher.GetSessionManager().GetSessionStats()
		c.JSON(200, gin.H{"session_stats": stats})
	})

	r.POST("/lore/sessions/:session_id/cleanup", func(c *gin.Context) {
		sessionID := c.Param("session_id")
		// This would be implemented to clean up a specific session
		c.JSON(200, gin.H{"message": "Session cleanup initiated", "session_id": sessionID})
	})

	r.POST("/lore/sessions/cleanup", func(c *gin.Context) {
		loreDispatcher.GetSessionManager().CleanupExpiredSessions()
		c.JSON(200, gin.H{"message": "Expired sessions cleaned up"})
	})

	// 📚 Lore Markdown Generator Endpoints
	r.GET("/lore/markdown/topics", func(c *gin.Context) {
		if loreDispatcher.GetLoreMarkdownGenerator() == nil {
			c.JSON(503, gin.H{"error": "Lore markdown generator not available"})
			return
		}
		topics := loreDispatcher.GetLoreMarkdownGenerator().GetTopicIndex()
		c.JSON(200, gin.H{"topics": topics})
	})

	r.GET("/lore/markdown/sessions", func(c *gin.Context) {
		if loreDispatcher.GetLoreMarkdownGenerator() == nil {
			c.JSON(503, gin.H{"error": "Lore markdown generator not available"})
			return
		}
		sessionDocs := loreDispatcher.GetLoreMarkdownGenerator().GetSessionIndex()
		c.JSON(200, gin.H{"sessions": sessionDocs})
	})

	r.GET("/lore/markdown/health", func(c *gin.Context) {
		if loreDispatcher.GetLoreMarkdownGenerator() == nil {
			c.JSON(503, gin.H{"error": "Lore markdown generator not available"})
			return
		}
		healthy := loreDispatcher.GetLoreMarkdownGenerator().IsHealthy()
		c.JSON(200, gin.H{
			"healthy": healthy,
			"name":    loreDispatcher.GetLoreMarkdownGenerator().Name(),
		})
	})

	r.POST("/lore/markdown/generate", func(c *gin.Context) {
		if loreDispatcher.GetLoreMarkdownGenerator() == nil {
			c.JSON(503, gin.H{"error": "Lore markdown generator not available"})
			return
		}
		
		var event hooks.LoreEvent
		if err := c.ShouldBindJSON(&event); err != nil {
			c.JSON(400, gin.H{"error": "Invalid lore event format"})
			return
		}
		
		doc, err := loreDispatcher.GetLoreMarkdownGenerator().GenerateFromLoreEvent(event)
		if err != nil {
			logrus.WithError(err).Error("Failed to generate markdown document")
			c.JSON(500, gin.H{"error": "Failed to generate markdown document"})
			return
		}
		
		c.JSON(200, gin.H{
			"status":   "Markdown document generated",
			"document": doc,
		})
	})

	// 🔍 Lore Conflict Detection Endpoints
	r.POST("/lore/conflicts/analyze", func(c *gin.Context) {
		if loreDispatcher.GetConflictDetector() == nil {
			c.JSON(503, gin.H{"error": "Lore conflict detector not available"})
			return
		}
		
		var event hooks.LoreEvent
		if err := c.ShouldBindJSON(&event); err != nil {
			c.JSON(400, gin.H{"error": "Invalid lore event format"})
			return
		}
		
		conflictResult, err := loreDispatcher.GetConflictDetector().AnalyzeLoreEvent(event)
		if err != nil {
			logrus.WithError(err).Error("Failed to analyze lore event for conflicts")
			c.JSON(500, gin.H{"error": "Failed to analyze lore event for conflicts"})
			return
		}
		
		c.JSON(200, gin.H{
			"status":  "Conflict analysis completed",
			"result":  conflictResult,
		})
	})

	r.GET("/lore/conflicts/history", func(c *gin.Context) {
		if loreDispatcher.GetConflictDetector() == nil {
			c.JSON(503, gin.H{"error": "Lore conflict detector not available"})
			return
		}
		
		history := loreDispatcher.GetConflictDetector().GetConflictHistory()
		c.JSON(200, gin.H{"conflicts": history})
	})

	r.GET("/lore/conflicts/stats", func(c *gin.Context) {
		if loreDispatcher.GetConflictDetector() == nil {
			c.JSON(503, gin.H{"error": "Lore conflict detector not available"})
			return
		}
		
		stats := loreDispatcher.GetConflictDetector().GetConflictStats()
		c.JSON(200, gin.H{"stats": stats})
	})

	r.GET("/lore/conflicts/health", func(c *gin.Context) {
		if loreDispatcher.GetConflictDetector() == nil {
			c.JSON(503, gin.H{"error": "Lore conflict detector not available"})
			return
		}
		
		healthy := loreDispatcher.GetConflictDetector().IsHealthy()
		c.JSON(200, gin.H{
			"healthy": healthy,
			"name":    loreDispatcher.GetConflictDetector().Name(),
		})
	})

	// Interactive Lore Looping endpoints
	r.POST("/lore/trigger", func(c *gin.Context) {
		if loreDispatcher.GetLoreLooper() == nil {
			c.JSON(503, gin.H{"error": "Interactive lore looper not available"})
			return
		}
		
		var request hooks.TriggerRequest
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
		
		response, err := loreDispatcher.GetLoreLooper().TriggerLoreReanimation(request)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		
		c.JSON(200, response)
	})

	r.GET("/lore/fragments", func(c *gin.Context) {
		if loreDispatcher.GetLoreLooper() == nil {
			c.JSON(503, gin.H{"error": "Interactive lore looper not available"})
			return
		}
		
		fragments := loreDispatcher.GetLoreLooper().GetLoreFragments()
		c.JSON(200, gin.H{"fragments": fragments})
	})

	r.GET("/lore/chains", func(c *gin.Context) {
		if loreDispatcher.GetLoreLooper() == nil {
			c.JSON(503, gin.H{"error": "Interactive lore looper not available"})
			return
		}
		
		chains := loreDispatcher.GetLoreLooper().GetEvolutionChains()
		c.JSON(200, gin.H{"chains": chains})
	})

	r.GET("/lore/loops", func(c *gin.Context) {
		if loreDispatcher.GetLoreLooper() == nil {
			c.JSON(503, gin.H{"error": "Interactive lore looper not available"})
			return
		}
		
		loops := loreDispatcher.GetLoreLooper().GetActiveLoops()
		c.JSON(200, gin.H{"loops": loops})
	})

	r.GET("/lore/loops/:id", func(c *gin.Context) {
		if loreDispatcher.GetLoreLooper() == nil {
			c.JSON(503, gin.H{"error": "Interactive lore looper not available"})
			return
		}
		
		loopID := c.Param("id")
		loop, err := loreDispatcher.GetLoreLooper().GetLoopStatus(loopID)
		if err != nil {
			c.JSON(404, gin.H{"error": err.Error()})
			return
		}
		
		c.JSON(200, gin.H{"loop": loop})
	})

	r.GET("/lore/looper/stats", func(c *gin.Context) {
		if loreDispatcher.GetLoreLooper() == nil {
			c.JSON(503, gin.H{"error": "Interactive lore looper not available"})
			return
		}
		
		stats := loreDispatcher.GetLoreLooper().GetLooperStats()
		c.JSON(200, gin.H{"stats": stats})
	})

	r.GET("/lore/looper/health", func(c *gin.Context) {
		if loreDispatcher.GetLoreLooper() == nil {
			c.JSON(503, gin.H{"error": "Interactive lore looper not available"})
			return
		}
		
		healthy := loreDispatcher.GetLoreLooper().IsHealthy()
		c.JSON(200, gin.H{
			"healthy": healthy,
			"name":    loreDispatcher.GetLoreLooper().Name(),
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("🕸️ LocalAI daemon with haunted hooks starting on port %s\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(errors.Wrap(err, "failed to start server"))
	}
}
