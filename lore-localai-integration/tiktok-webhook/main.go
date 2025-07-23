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
	"strings"
	"time"
)

const (
	ContentTypeJSON = "application/json"
	ContentTypeText = "text/plain"
	ContentType     = "Content-Type"
)

// TikTokWebhookPayload represents incoming TikTok webhook data
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
		log.Printf("⚠️ No webhook secret configured, skipping signature verification")
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

	// Log request details for debugging
	clientIP := r.Header.Get("X-Forwarded-For")
	if clientIP == "" {
		clientIP = r.Header.Get("X-Real-IP")
	}
	if clientIP == "" {
		clientIP = r.RemoteAddr
	}

	log.Printf("🌐 Request from: %s", clientIP)
	log.Printf("🔍 User-Agent: %s", r.Header.Get("User-Agent"))
	log.Printf("🎯 URL Path: %s", r.URL.Path)

	// Handle preflight requests
	if r.Method == "OPTIONS" {
		log.Printf("✅ CORS preflight request handled")
		w.WriteHeader(http.StatusOK)
		return
	}

	// Handle GET requests (verification challenge)
	if r.Method == "GET" {
		challenge := r.URL.Query().Get("challenge")
		if challenge != "" {
			log.Printf("🎯 TikTok verification challenge received: %s", challenge)
			w.Header().Set(ContentType, ContentTypeText)
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(challenge))
			return
		}

		// Health check endpoint
		w.Header().Set(ContentType, ContentTypeJSON)
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":     "active",
			"service":    "TikTok Phantom Gear Webhook",
			"timestamp":  time.Now().Unix(),
			"domain":     s.Domain,
			"accessible": "external",
			"client_ip":  clientIP,
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

	log.Printf("📨 Received TikTok webhook request:")
	log.Printf("   🔍 Method: %s", r.Method)
	log.Printf("   🔗 URL: %s", r.URL.String())
	log.Printf("   📝 Body length: %d bytes", len(body))

	// Verify TikTok signature
	signature := r.Header.Get("X-TikTok-Signature")
	if signature != "" && !s.VerifySignature(body, signature) {
		log.Printf("❌ Invalid TikTok signature")
		http.Error(w, "Invalid signature", http.StatusUnauthorized)
		return
	}

	// Parse webhook payload
	var payload TikTokWebhookPayload
	if len(body) > 0 {
		if err := json.Unmarshal(body, &payload); err != nil {
			log.Printf("❌ Error parsing webhook payload: %v", err)
			log.Printf("📝 Raw body: %s", string(body))
			http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
			return
		}

		// Log webhook event
		log.Printf("🎬 TikTok webhook processed:")
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
	}

	// Send success response
	w.Header().Set(ContentType, ContentTypeJSON)
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

	// Calculate viral score
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

	// Analyze various factors
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
	log.Printf("📡 Sending viral amplification to dispatcher: %+v", data)

	// Convert data to JSON
	jsonData, err := json.Marshal(data)
	if err != nil {
		log.Printf("❌ Error marshaling amplification data: %v", err)
		return
	}

	// Send HTTP POST to lore dispatcher
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Post("http://localhost:8084/lore/viral-amplification", "application/json",
		io.NopCloser(strings.NewReader(string(jsonData))))
	if err != nil {
		log.Printf("❌ Error sending to dispatcher: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		log.Printf("✅ Successfully sent viral amplification to dispatcher")
	} else {
		log.Printf("⚠️ Dispatcher responded with status: %d", resp.StatusCode)
	}
}

func main() {
	// Configuration
	domain := "api.phantomgear.it.com"
	webhookSecret := os.Getenv("TIKTOK_WEBHOOK_SECRET")

	log.Printf("🔧 Configuration:")
	log.Printf("   🌐 Domain: %s", domain)
	log.Printf("   🔑 Webhook Secret: %s", func() string {
		if webhookSecret == "" {
			return "NOT SET"
		}
		return "SET (hidden)"
	}())

	// Create webhook server
	server := NewTikTokWebhookServer(webhookSecret, domain)

	// Set up HTTP handlers
	http.HandleFunc("/api/webhooks/tiktok", server.HandleTikTokWebhook)
	http.HandleFunc("/api/webhooks/tiktok/", server.HandleTikTokWebhook) // Handle trailing slash
	http.HandleFunc("/webhooks/tiktok", server.HandleTikTokWebhook)      // Alternative path
	http.HandleFunc("/tiktok", server.HandleTikTokWebhook)               // Simple path

	// Status and diagnostic endpoints
	http.HandleFunc("/api/webhooks/tiktok/status", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set(ContentType, ContentTypeJSON)
		w.Header().Set("Access-Control-Allow-Origin", "*")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":    "healthy",
			"service":   "TikTok Phantom Gear Webhook Server",
			"domain":    domain,
			"timestamp": time.Now().Unix(),
			"version":   "1.0.0",
			"endpoints": []string{
				"/api/webhooks/tiktok",
				"/webhooks/tiktok",
				"/tiktok",
			},
		})
	})

	// TikTok validation endpoint
	http.HandleFunc("/tiktok/validate", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set(ContentType, ContentTypeJSON)
		w.Header().Set("Access-Control-Allow-Origin", "*")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"valid":     true,
			"service":   "TikTok Webhook Validation",
			"domain":    domain,
			"external":  true,
			"timestamp": time.Now().Unix(),
		})
	})

	// Health check endpoint
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set(ContentType, ContentTypeJSON)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status": "ok",
			"time":   time.Now().Unix(),
		})
	})

	// Start server on multiple ports
	go func() {
		log.Printf("🚀 Starting HTTP server on :8080 for HTTP/SSL challenges...")
		if err := http.ListenAndServe(":8080", nil); err != nil {
			log.Printf("⚠️ HTTP server on :8080 failed: %v", err)
		}
	}()

	log.Printf("🚀 Starting TikTok Webhook Server...")
	log.Printf("🔒 Domain: %s", domain)
	log.Printf("📡 Webhook URL: https://%s:8443/api/webhooks/tiktok", domain)
	log.Printf("🏥 Health URL: https://%s:8443/health", domain)
	log.Printf("📊 Status URL: https://%s:8443/api/webhooks/tiktok/status", domain)
	log.Printf("🎯 Starting HTTPS server on :8443...")

	// Use TLS with generated certificates
	if err := http.ListenAndServeTLS(":8443", "tiktok-webhook.crt", "tiktok-webhook.key", nil); err != nil {
		log.Fatalf("❌ HTTPS Server error: %v", err)
	}
}
