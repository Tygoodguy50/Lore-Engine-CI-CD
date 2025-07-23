package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"time"
)

const (
	ContentTypeJSON = "application/json"
	ContentTypeText = "text/plain"
)

// TikTokWebhookPayload represents the incoming TikTok webhook data
type TikTokWebhookPayload struct {
	Event     string                 `json:"event"`
	Data      map[string]interface{} `json:"data"`
	Timestamp int64                  `json:"timestamp"`
	UserID    string                 `json:"user_id"`
	VideoID   string                 `json:"video_id"`
}

// TikTokWebhookServer handles TikTok webhook requests
type TikTokWebhookServer struct {
	WebhookSecret string
	Domain        string
}

// NewTikTokWebhookServer creates a new webhook server
func NewTikTokWebhookServer(webhookSecret, domain string) *TikTokWebhookServer {
	return &TikTokWebhookServer{
		WebhookSecret: webhookSecret,
		Domain:        domain,
	}
}

// VerifySignature verifies the TikTok webhook signature
func (s *TikTokWebhookServer) VerifySignature(body []byte, signature string) bool {
	if s.WebhookSecret == "" {
		return true // Skip verification if no secret is set
	}
	mac := hmac.New(sha256.New, []byte(s.WebhookSecret))
	mac.Write(body)
	expectedSignature := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(signature), []byte(expectedSignature))
}

// HandleTikTokWebhook processes incoming TikTok webhook requests
func (s *TikTokWebhookServer) HandleTikTokWebhook(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers for TikTok
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-TikTok-Signature")

	// Handle preflight requests
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Handle GET requests (verification challenge)
	if r.Method == "GET" {
		challenge := r.URL.Query().Get("challenge")
		if challenge != "" {
			log.Printf("🎯 TikTok verification challenge received: %s", challenge)
			w.Header().Set("Content-Type", ContentTypeText)
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(challenge))
			return
		}

		// Health check endpoint
		w.Header().Set("Content-Type", ContentTypeJSON)
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":    "active",
			"service":   "TikTok Phantom Gear Webhook",
			"timestamp": time.Now().Unix(),
			"domain":    s.Domain,
		})
		return
	}

	// Handle POST requests (actual webhook data)
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Read request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("❌ Error reading request body: %v", err)
		http.Error(w, "Error reading request", http.StatusBadRequest)
		return
	}

	// Verify TikTok signature
	signature := r.Header.Get("X-TikTok-Signature")
	if signature != "" && !s.VerifySignature(body, signature) {
		log.Printf("❌ Invalid TikTok signature")
		http.Error(w, "Invalid signature", http.StatusUnauthorized)
		return
	}

	// Parse webhook payload
	var payload TikTokWebhookPayload
	if err := json.Unmarshal(body, &payload); err != nil {
		log.Printf("❌ Error parsing webhook payload: %v", err)
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	// Log webhook event
	log.Printf("🎬 TikTok webhook received:")
	log.Printf("   📅 Event: %s", payload.Event)
	log.Printf("   👤 User ID: %s", payload.UserID)
	log.Printf("   🎥 Video ID: %s", payload.VideoID)
	log.Printf("   ⏰ Timestamp: %d", payload.Timestamp)

	// Process webhook based on event type
	switch payload.Event {
	case "video.upload":
		s.handleVideoUpload(payload)
	case "video.analytics":
		s.handleVideoAnalytics(payload)
	case "user.follow":
		s.handleUserFollow(payload)
	case "video.share":
		s.handleVideoShare(payload)
	default:
		log.Printf("⚠️ Unknown event type: %s", payload.Event)
	}

	// Send success response
	w.Header().Set("Content-Type", ContentTypeJSON)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":    "success",
		"processed": true,
		"event":     payload.Event,
		"timestamp": time.Now().Unix(),
	})
}

// handleVideoUpload processes video upload events
func (s *TikTokWebhookServer) handleVideoUpload(payload TikTokWebhookPayload) {
	log.Printf("🎥 Processing video upload for user: %s", payload.UserID)

	// Calculate viral score (example implementation)
	viralScore := s.calculateViralScore(payload.Data)
	log.Printf("📊 Viral Score: %.2f", viralScore)

	// If high viral potential, trigger follow-up actions
	if viralScore > 7.0 {
		log.Printf("🚀 High viral potential detected! Triggering amplification...")
		s.triggerViralAmplification(payload, viralScore)
	}
}

// handleVideoAnalytics processes analytics updates
func (s *TikTokWebhookServer) handleVideoAnalytics(payload TikTokWebhookPayload) {
	log.Printf("📈 Processing analytics update for video: %s", payload.VideoID)

	// Extract analytics data
	if analytics, ok := payload.Data["analytics"].(map[string]interface{}); ok {
		if views, ok := analytics["views"].(float64); ok {
			if likes, ok := analytics["likes"].(float64); ok {
				engagementRate := (likes / views) * 100
				log.Printf("📊 Engagement Rate: %.2f%%", engagementRate)
			}
		}
	}
}

// handleUserFollow processes follow events
func (s *TikTokWebhookServer) handleUserFollow(payload TikTokWebhookPayload) {
	log.Printf("👥 New follower for user: %s", payload.UserID)
}

// handleVideoShare processes share events
func (s *TikTokWebhookServer) handleVideoShare(payload TikTokWebhookPayload) {
	log.Printf("🔄 Video shared: %s", payload.VideoID)
}

// calculateViralScore calculates potential viral score
func (s *TikTokWebhookServer) calculateViralScore(data map[string]interface{}) float64 {
	score := 5.0 // Base score

	// Analyze various factors (example implementation)
	if views, ok := data["views"].(float64); ok {
		if views > 10000 {
			score += 2.0
		}
	}

	if likes, ok := data["likes"].(float64); ok {
		if likes > 1000 {
			score += 1.5
		}
	}

	if comments, ok := data["comments"].(float64); ok {
		if comments > 100 {
			score += 1.0
		}
	}

	if shares, ok := data["shares"].(float64); ok {
		if shares > 50 {
			score += 0.5
		}
	}

	return score
}

// triggerViralAmplification triggers actions for high-scoring content
func (s *TikTokWebhookServer) triggerViralAmplification(payload TikTokWebhookPayload, score float64) {
	log.Printf("🎯 Triggering viral amplification for score: %.2f", score)

	amplificationData := map[string]interface{}{
		"event":       "viral_amplification",
		"video_id":    payload.VideoID,
		"user_id":     payload.UserID,
		"viral_score": score,
		"timestamp":   time.Now().Unix(),
		"source":      "tiktok_webhook",
	}

	// Send to your existing dispatcher system
	go s.sendToDispatcher(amplificationData)
}

// sendToDispatcher sends data to your lore dispatcher system
func (s *TikTokWebhookServer) sendToDispatcher(data map[string]interface{}) {
	// This would connect to your existing localhost:8084 dispatcher
	log.Printf("📡 Sending viral amplification to dispatcher: %+v", data)
}

func main() {
	// Configuration
	domain := "api.phantomgear.it.com"
	webhookSecret := os.Getenv("TIKTOK_WEBHOOK_SECRET")
	port := os.Getenv("PORT")

	if port == "" {
		port = "8443" // Use 8443 for HTTPS if no port specified
	}

	// Create webhook server
	server := NewTikTokWebhookServer(webhookSecret, domain)

	// Set up HTTP handlers
	http.HandleFunc("/api/webhooks/tiktok", server.HandleTikTokWebhook)
	http.HandleFunc("/api/webhooks/tiktok/status", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", ContentTypeJSON)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":    "healthy",
			"service":   "TikTok Phantom Gear Webhook Server",
			"domain":    domain,
			"timestamp": time.Now().Unix(),
			"port":      port,
		})
	})

	// Start server
	log.Printf("🚀 Starting TikTok Webhook Server...")
	log.Printf("🔒 Domain: %s", domain)
	log.Printf("📡 Webhook URL: http://%s:%s/api/webhooks/tiktok", domain, port)
	log.Printf("🎯 Server starting on port %s", port)

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("❌ Server error: %v", err)
	}
}
