package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
)

// 🔁 Performance Loop Monitor
// Loops fragments back to TikTok Webhook Listener to monitor performance

type PerformanceMetrics struct {
	FragmentID     string    `json:"fragment_id"`
	ReferralCode   string    `json:"referral_code"`
	Platform       string    `json:"platform"`
	Likes          int       `json:"likes"`
	Comments       int       `json:"comments"`
	Shares         int       `json:"shares"`
	Views          int       `json:"views"`
	EngagementRate float64   `json:"engagement_rate"`
	ViralScore     float64   `json:"viral_score"`
	LastChecked    time.Time `json:"last_checked"`
	CreatedAt      time.Time `json:"created_at"`
}

type PerformanceLoopMonitor struct {
	tiktokWebhookURL  string
	loreDispatcherURL string
	checkInterval     time.Duration
	activeFragments   map[string]*PerformanceMetrics
	mutex             sync.RWMutex
	isRunning         bool
	stopChan          chan bool
}

// NewPerformanceLoopMonitor creates a new performance monitor
func NewPerformanceLoopMonitor(tiktokURL, loreURL string) *PerformanceLoopMonitor {
	return &PerformanceLoopMonitor{
		tiktokWebhookURL:  tiktokURL,
		loreDispatcherURL: loreURL,
		checkInterval:     5 * time.Minute, // Check every 5 minutes
		activeFragments:   make(map[string]*PerformanceMetrics),
		stopChan:          make(chan bool),
	}
}

// RegisterFragment adds a new fragment to performance monitoring
func (plm *PerformanceLoopMonitor) RegisterFragment(fragmentID, referralCode, platform string) {
	plm.mutex.Lock()
	defer plm.mutex.Unlock()

	plm.activeFragments[fragmentID] = &PerformanceMetrics{
		FragmentID:   fragmentID,
		ReferralCode: referralCode,
		Platform:     platform,
		CreatedAt:    time.Now(),
		LastChecked:  time.Now(),
	}

	fmt.Printf("🔄 Registered fragment for performance monitoring: %s (referral: %s)\n",
		fragmentID, referralCode)
}

// StartMonitoring begins the performance monitoring loop
func (plm *PerformanceLoopMonitor) StartMonitoring() {
	if plm.isRunning {
		fmt.Println("⚠️  Performance monitor already running")
		return
	}

	plm.isRunning = true
	fmt.Println("🔄 Starting Performance Loop Monitor...")

	go plm.monitoringLoop()
}

// StopMonitoring stops the performance monitoring loop
func (plm *PerformanceLoopMonitor) StopMonitoring() {
	if !plm.isRunning {
		return
	}

	plm.stopChan <- true
	plm.isRunning = false
	fmt.Println("🛑 Performance Loop Monitor stopped")
}

// monitoringLoop runs the continuous performance checking
func (plm *PerformanceLoopMonitor) monitoringLoop() {
	ticker := time.NewTicker(plm.checkInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			plm.checkAllFragments()
		case <-plm.stopChan:
			return
		}
	}
}

// checkAllFragments checks performance for all registered fragments
func (plm *PerformanceLoopMonitor) checkAllFragments() {
	plm.mutex.RLock()
	fragments := make(map[string]*PerformanceMetrics)
	for k, v := range plm.activeFragments {
		fragments[k] = v
	}
	plm.mutex.RUnlock()

	fmt.Printf("🔍 Checking performance for %d fragments...\n", len(fragments))

	for fragmentID, metrics := range fragments {
		plm.checkFragmentPerformance(fragmentID, metrics)
	}
}

// checkFragmentPerformance checks performance for a specific fragment
func (plm *PerformanceLoopMonitor) checkFragmentPerformance(fragmentID string, metrics *PerformanceMetrics) {
	// Simulate TikTok API call to check performance
	// In real implementation, this would call TikTok's API
	newMetrics := plm.fetchTikTokMetrics(fragmentID, metrics.ReferralCode)

	plm.mutex.Lock()
	// Update metrics
	if existingMetrics, exists := plm.activeFragments[fragmentID]; exists {
		existingMetrics.Likes = newMetrics.Likes
		existingMetrics.Comments = newMetrics.Comments
		existingMetrics.Shares = newMetrics.Shares
		existingMetrics.Views = newMetrics.Views
		existingMetrics.EngagementRate = plm.calculateEngagementRate(newMetrics)
		existingMetrics.ViralScore = plm.calculateViralScore(newMetrics)
		existingMetrics.LastChecked = time.Now()
	}
	plm.mutex.Unlock()

	// Send performance update back to Lore Dispatcher for reactive processing
	plm.sendPerformanceUpdateToDispatcher(fragmentID, newMetrics)

	fmt.Printf("📊 Fragment %s: Views: %d, Likes: %d, Comments: %d, Viral Score: %.2f\n",
		fragmentID, newMetrics.Views, newMetrics.Likes, newMetrics.Comments, newMetrics.ViralScore)
}

// fetchTikTokMetrics simulates fetching metrics from TikTok API
func (plm *PerformanceLoopMonitor) fetchTikTokMetrics(fragmentID, referralCode string) *PerformanceMetrics {
	// This is a simulation - in reality, you'd call TikTok's API
	// For now, we'll generate realistic-looking data that changes over time

	baseViews := 1000 + (int(time.Now().Unix()) % 5000)
	baseLikes := baseViews/10 + (int(time.Now().Unix()) % 100)
	baseComments := baseLikes/5 + (int(time.Now().Unix()) % 20)
	baseShares := baseComments/2 + (int(time.Now().Unix()) % 10)

	return &PerformanceMetrics{
		FragmentID:   fragmentID,
		ReferralCode: referralCode,
		Platform:     "tiktok",
		Views:        baseViews,
		Likes:        baseLikes,
		Comments:     baseComments,
		Shares:       baseShares,
		LastChecked:  time.Now(),
	}
}

// calculateEngagementRate calculates engagement rate from metrics
func (plm *PerformanceLoopMonitor) calculateEngagementRate(metrics *PerformanceMetrics) float64 {
	if metrics.Views == 0 {
		return 0.0
	}

	totalEngagements := metrics.Likes + metrics.Comments + metrics.Shares
	return float64(totalEngagements) / float64(metrics.Views) * 100.0
}

// calculateViralScore calculates viral score based on engagement and growth
func (plm *PerformanceLoopMonitor) calculateViralScore(metrics *PerformanceMetrics) float64 {
	if metrics.Views == 0 {
		return 0.0
	}

	// Viral score based on shares ratio and engagement velocity
	sharesRatio := float64(metrics.Shares) / float64(metrics.Views) * 100.0
	engagementRatio := float64(metrics.Likes+metrics.Comments) / float64(metrics.Views) * 100.0

	// Weighted viral score (shares are more important for virality)
	viralScore := (sharesRatio * 0.7) + (engagementRatio * 0.3)

	// Bonus for high absolute numbers
	if metrics.Views > 10000 {
		viralScore *= 1.2
	}
	if metrics.Shares > 100 {
		viralScore *= 1.1
	}

	return viralScore
}

// sendPerformanceUpdateToDispatcher sends performance data back to Lore Dispatcher
func (plm *PerformanceLoopMonitor) sendPerformanceUpdateToDispatcher(fragmentID string, metrics *PerformanceMetrics) {
	// Create a lore event based on performance metrics
	loreEvent := map[string]interface{}{
		"type":       "performance_update",
		"content":    plm.generatePerformanceContent(metrics),
		"user_id":    "performance_monitor",
		"channel_id": "tiktok_analytics",
		"lore_level": plm.calculateLoreLevel(metrics.ViralScore),
		"priority":   plm.calculatePriority(metrics.EngagementRate),
		"tags":       []string{"performance", "tiktok", "analytics", "viral"},
		"metadata": map[string]interface{}{
			"source":          "performance_monitor",
			"fragment_id":     fragmentID,
			"referral_code":   metrics.ReferralCode,
			"platform":        metrics.Platform,
			"views":           metrics.Views,
			"likes":           metrics.Likes,
			"comments":        metrics.Comments,
			"shares":          metrics.Shares,
			"engagement_rate": metrics.EngagementRate,
			"viral_score":     metrics.ViralScore,
		},
	}

	jsonData, err := json.Marshal(loreEvent)
	if err != nil {
		fmt.Printf("❌ Failed to marshal performance event: %v\n", err)
		return
	}

	resp, err := http.Post(plm.loreDispatcherURL+"/lore/dispatch", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Printf("❌ Failed to send performance update: %v\n", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 {
		fmt.Printf("✅ Performance update sent for fragment %s\n", fragmentID)
	} else {
		fmt.Printf("⚠️  Performance update failed for fragment %s (Status: %d)\n", fragmentID, resp.StatusCode)
	}
}

// generatePerformanceContent creates lore content based on performance metrics
func (plm *PerformanceLoopMonitor) generatePerformanceContent(metrics *PerformanceMetrics) string {
	if metrics.ViralScore > 50.0 {
		return fmt.Sprintf("🔥 The fragment awakens! %d souls have gazed upon the mystery, %d hearts resonate with darkness. The viral essence spreads... (Score: %.1f)",
			metrics.Views, metrics.Likes, metrics.ViralScore)
	} else if metrics.ViralScore > 20.0 {
		return fmt.Sprintf("⚡ Energy builds around fragment %s... %d watchers, %d believers. The pattern emerges... (Score: %.1f)",
			metrics.FragmentID[:8], metrics.Views, metrics.Likes, metrics.ViralScore)
	} else {
		return fmt.Sprintf("🌱 Seeds planted in the digital realm... %d observers, %d touched by the lore. Growth begins... (Score: %.1f)",
			metrics.Views, metrics.Likes, metrics.ViralScore)
	}
}

// calculateLoreLevel determines lore level based on viral score
func (plm *PerformanceLoopMonitor) calculateLoreLevel(viralScore float64) int {
	if viralScore > 80.0 {
		return 10 // Maximum lore level for viral hits
	} else if viralScore > 60.0 {
		return 8
	} else if viralScore > 40.0 {
		return 6
	} else if viralScore > 20.0 {
		return 4
	} else {
		return 2
	}
}

// calculatePriority determines priority based on engagement rate
func (plm *PerformanceLoopMonitor) calculatePriority(engagementRate float64) int {
	if engagementRate > 15.0 {
		return 9 // High priority for high engagement
	} else if engagementRate > 10.0 {
		return 7
	} else if engagementRate > 5.0 {
		return 5
	} else {
		return 3
	}
}

// GetAllMetrics returns all current fragment metrics
func (plm *PerformanceLoopMonitor) GetAllMetrics() map[string]*PerformanceMetrics {
	plm.mutex.RLock()
	defer plm.mutex.RUnlock()

	result := make(map[string]*PerformanceMetrics)
	for k, v := range plm.activeFragments {
		result[k] = v
	}
	return result
}

// GetTopPerformers returns the top performing fragments
func (plm *PerformanceLoopMonitor) GetTopPerformers(limit int) []*PerformanceMetrics {
	plm.mutex.RLock()
	defer plm.mutex.RUnlock()

	var metrics []*PerformanceMetrics
	for _, m := range plm.activeFragments {
		metrics = append(metrics, m)
	}

	// Simple sort by viral score (in real implementation, use proper sorting)
	// For now, just return first N
	if len(metrics) > limit {
		return metrics[:limit]
	}
	return metrics
}

// Example usage and test function
func TestPerformanceLoopMonitor() {
	tiktokURL := "https://18e5cda9df96.ngrok-free.app"
	loreURL := "http://localhost:8084"

	monitor := NewPerformanceLoopMonitor(tiktokURL, loreURL)

	// Register some test fragments
	monitor.RegisterFragment("frag_001", "TT123ABC", "tiktok")
	monitor.RegisterFragment("frag_002", "TT456DEF", "tiktok")
	monitor.RegisterFragment("frag_003", "TT789GHI", "tiktok")

	// Start monitoring
	monitor.StartMonitoring()

	// Let it run for a minute for testing
	fmt.Println("🔄 Performance monitoring active for 60 seconds...")
	time.Sleep(60 * time.Second)

	// Get current metrics
	metrics := monitor.GetAllMetrics()
	fmt.Printf("📊 Current metrics for %d fragments:\n", len(metrics))
	for id, metric := range metrics {
		fmt.Printf("  Fragment %s: Viral Score %.1f, Engagement Rate %.1f%%\n",
			id, metric.ViralScore, metric.EngagementRate)
	}

	monitor.StopMonitoring()
}

func main() {
	fmt.Println("🔁 Performance Loop Monitor - Test Suite")
	fmt.Println("==========================================")

	TestPerformanceLoopMonitor()

	fmt.Println("✅ Performance Loop Monitor test completed!")
}

func main() {
	fmt.Println("🔁 Performance Loop Monitor - Test Suite")
	fmt.Println("==========================================")

	TestPerformanceLoopMonitor()

	fmt.Println("✅ Performance Loop Monitor test completed!")
}
