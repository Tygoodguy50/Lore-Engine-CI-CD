package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"
)

// 🌐 Multi-Platform Dispatcher - Expands lore distribution across all major platforms
// Handles YouTube Shorts, Instagram Reels, Telegram, Reddit, and more via n8n workflows

type Platform struct {
	ID              string         `json:"id"`
	Name            string         `json:"name"`
	Type            string         `json:"type"`
	Active          bool           `json:"active"`
	APIEndpoint     string         `json:"api_endpoint"`
	FormatRules     PlatformFormat `json:"format_rules"`
	DispatchCount   int            `json:"dispatch_count"`
	SuccessRate     float64        `json:"success_rate"`
	OptimalTiming   []string       `json:"optimal_timing"`
	TagRequirements []string       `json:"tag_requirements"`
	LastDispatch    time.Time      `json:"last_dispatch"`
}

type PlatformFormat struct {
	MaxLength       int      `json:"max_length"`
	RequiredPrefix  string   `json:"required_prefix"`
	RequiredSuffix  string   `json:"required_suffix"`
	ForbiddenWords  []string `json:"forbidden_words"`
	OptimalHashtags []string `json:"optimal_hashtags"`
	ContentStyle    string   `json:"content_style"`
}

type DispatchRequest struct {
	ID          string            `json:"id"`
	Content     string            `json:"content"`
	Platforms   []string          `json:"platforms"`
	ViralScore  float64           `json:"viral_score"`
	Priority    int               `json:"priority"`
	Metadata    map[string]string `json:"metadata"`
	ScheduledAt *time.Time        `json:"scheduled_at,omitempty"`
	CreatedAt   time.Time         `json:"created_at"`
}

type DispatchResult struct {
	RequestID        string      `json:"request_id"`
	Platform         string      `json:"platform"`
	Status           string      `json:"status"`
	FormattedContent string      `json:"formatted_content"`
	DispatchedAt     time.Time   `json:"dispatched_at"`
	Error            string      `json:"error,omitempty"`
	PlatformResponse interface{} `json:"platform_response,omitempty"`
}

type MultiDispatchStats struct {
	TotalDispatches      int                     `json:"total_dispatches"`
	SuccessfulDispatches int                     `json:"successful_dispatches"`
	FailedDispatches     int                     `json:"failed_dispatches"`
	PlatformStats        map[string]PlatformStat `json:"platform_stats"`
	AverageViralScore    float64                 `json:"average_viral_score"`
	LastUpdated          time.Time               `json:"last_updated"`
}

type PlatformStat struct {
	Name          string  `json:"name"`
	Dispatches    int     `json:"dispatches"`
	SuccessRate   float64 `json:"success_rate"`
	AvgViralScore float64 `json:"avg_viral_score"`
}

var (
	platforms          = make(map[string]*Platform)
	dispatchQueue      = make(chan *DispatchRequest, 100)
	dispatchResults    = make(map[string][]*DispatchResult)
	multiDispatchStats = &MultiDispatchStats{PlatformStats: make(map[string]PlatformStat)}
	n8nWebhookURL      = "https://your-n8n-instance.com/webhook" // Configure your n8n webhook
)

// 🌐 Initialize multi-platform dispatcher
func initializeMultiDispatcher() {
	fmt.Println("🌐 Initializing Multi-Platform Dispatcher...")

	createPlatformConfigurations()
	startDispatchWorkers()

	fmt.Println("✅ Multi-Platform Dispatcher active!")
}

func createPlatformConfigurations() {
	platformConfigs := []*Platform{
		{
			ID: "youtube_shorts", Name: "YouTube Shorts", Type: "video",
			Active: true, APIEndpoint: "/youtube/shorts",
			FormatRules: PlatformFormat{
				MaxLength: 100, RequiredPrefix: "", RequiredSuffix: " #Shorts #Horror #Viral",
				ForbiddenWords:  []string{"death", "suicide", "kill"},
				OptimalHashtags: []string{"#Shorts", "#Horror", "#Mystery", "#Creepy", "#Viral"},
				ContentStyle:    "visual_narrative",
			},
			OptimalTiming:   []string{"14:00", "18:00", "21:00"},
			TagRequirements: []string{"visual", "short_form"},
			SuccessRate:     0.78,
		},
		{
			ID: "instagram_reels", Name: "Instagram Reels", Type: "video",
			Active: true, APIEndpoint: "/instagram/reels",
			FormatRules: PlatformFormat{
				MaxLength: 125, RequiredPrefix: "", RequiredSuffix: " 📱✨",
				ForbiddenWords:  []string{"follow", "like", "subscribe"},
				OptimalHashtags: []string{"#Reels", "#Horror", "#Mystery", "#CreepyTok", "#ViralVideo"},
				ContentStyle:    "aesthetic_horror",
			},
			OptimalTiming:   []string{"11:00", "15:00", "20:00"},
			TagRequirements: []string{"visual", "aesthetic"},
			SuccessRate:     0.82,
		},
		{
			ID: "telegram_channels", Name: "Telegram Lore Threads", Type: "messaging",
			Active: true, APIEndpoint: "/telegram/channels",
			FormatRules: PlatformFormat{
				MaxLength: 1000, RequiredPrefix: "🕸️ ", RequiredSuffix: "\n\n👻 Join the lore: @YourChannel",
				ForbiddenWords:  []string{},
				OptimalHashtags: []string{},
				ContentStyle:    "detailed_narrative",
			},
			OptimalTiming:   []string{"10:00", "16:00", "22:00"},
			TagRequirements: []string{"narrative", "detailed"},
			SuccessRate:     0.85,
		},
		{
			ID: "reddit_args", Name: "Reddit ARG Triggers", Type: "discussion",
			Active: true, APIEndpoint: "/reddit/post",
			FormatRules: PlatformFormat{
				MaxLength: 300, RequiredPrefix: "", RequiredSuffix: "\n\nEdit: This is getting strange...",
				ForbiddenWords:  []string{"fake", "made up", "story"},
				OptimalHashtags: []string{},
				ContentStyle:    "authentic_mystery",
			},
			OptimalTiming:   []string{"09:00", "13:00", "19:00"},
			TagRequirements: []string{"mystery", "args"},
			SuccessRate:     0.73,
		},
		{
			ID: "tiktok_duets", Name: "TikTok Duet Challenges", Type: "video",
			Active: true, APIEndpoint: "/tiktok/duets",
			FormatRules: PlatformFormat{
				MaxLength: 80, RequiredPrefix: "", RequiredSuffix: " #DuetThis #Horror",
				ForbiddenWords:  []string{},
				OptimalHashtags: []string{"#DuetThis", "#Horror", "#Challenge", "#Creepy", "#Viral"},
				ContentStyle:    "interactive_challenge",
			},
			OptimalTiming:   []string{"15:00", "18:00", "21:00"},
			TagRequirements: []string{"interactive", "challenge"},
			SuccessRate:     0.89,
		},
		{
			ID: "discord_summons", Name: "Discord Summon Threads", Type: "messaging",
			Active: true, APIEndpoint: "/discord/threads",
			FormatRules: PlatformFormat{
				MaxLength: 500, RequiredPrefix: "🌙 **SUMMON THREAD** 🌙\n", RequiredSuffix: "\n\n*React with 👻 to join the ritual*",
				ForbiddenWords:  []string{},
				OptimalHashtags: []string{},
				ContentStyle:    "ritual_interactive",
			},
			OptimalTiming:   []string{"20:00", "22:00", "00:00"},
			TagRequirements: []string{"interactive", "community"},
			SuccessRate:     0.91,
		},
		{
			ID: "twitter_threads", Name: "Twitter/X Horror Threads", Type: "social",
			Active: true, APIEndpoint: "/twitter/threads",
			FormatRules: PlatformFormat{
				MaxLength: 280, RequiredPrefix: "🧵 THREAD: ", RequiredSuffix: " 1/n",
				ForbiddenWords:  []string{},
				OptimalHashtags: []string{"#HorrorThread", "#Mystery", "#Creepy"},
				ContentStyle:    "threaded_narrative",
			},
			OptimalTiming:   []string{"12:00", "17:00", "21:00"},
			TagRequirements: []string{"threaded", "narrative"},
			SuccessRate:     0.76,
		},
	}

	for _, platform := range platformConfigs {
		platform.LastDispatch = time.Now().Add(-time.Hour) // Initialize as 1 hour ago
		platforms[platform.ID] = platform
	}
}

func startDispatchWorkers() {
	// Start multiple workers to handle dispatches
	for i := 0; i < 3; i++ {
		go dispatchWorker(i)
	}

	fmt.Println("✅ Started 3 dispatch workers")
}

func dispatchWorker(workerID int) {
	fmt.Printf("👷 Dispatch worker %d started\n", workerID)

	for request := range dispatchQueue {
		fmt.Printf("🔄 Worker %d processing dispatch: %s\n", workerID, request.ID)
		processDispatchRequest(request)
	}
}

func processDispatchRequest(request *DispatchRequest) {
	results := []*DispatchResult{}

	for _, platformID := range request.Platforms {
		platform, exists := platforms[platformID]
		if !exists {
			result := &DispatchResult{
				RequestID:    request.ID,
				Platform:     platformID,
				Status:       "failed",
				Error:        "Platform not found",
				DispatchedAt: time.Now(),
			}
			results = append(results, result)
			continue
		}

		// Format content for platform
		formattedContent := formatContentForPlatform(request.Content, platform, request.Metadata)

		// Dispatch to platform
		result := dispatchToPlatform(request, platform, formattedContent)
		results = append(results, result)

		// Update platform stats
		platform.DispatchCount++
		platform.LastDispatch = time.Now()

		if result.Status == "success" {
			// Update success rate
			platform.SuccessRate = (platform.SuccessRate + 1.0) / 2.0
		}
	}

	// Store results
	dispatchResults[request.ID] = results
	updateMultiDispatchStats(request, results)
}

func formatContentForPlatform(content string, platform *Platform, metadata map[string]string) string {
	formatted := content
	format := platform.FormatRules

	// Apply length limits
	if len(formatted) > format.MaxLength {
		formatted = formatted[:format.MaxLength-10] + "..."
	}

	// Apply prefixes and suffixes
	if format.RequiredPrefix != "" {
		formatted = format.RequiredPrefix + formatted
	}

	if format.RequiredSuffix != "" {
		formatted = formatted + format.RequiredSuffix
	}

	// Remove forbidden words
	for _, word := range format.ForbiddenWords {
		formatted = strings.ReplaceAll(formatted, word, "[redacted]")
	}

	// Add platform-specific styling
	switch format.ContentStyle {
	case "visual_narrative":
		formatted = addVisualCues(formatted)
	case "aesthetic_horror":
		formatted = addAestheticElements(formatted)
	case "detailed_narrative":
		formatted = expandNarrative(formatted)
	case "authentic_mystery":
		formatted = addAuthenticity(formatted)
	case "interactive_challenge":
		formatted = addInteractiveElements(formatted)
	case "ritual_interactive":
		formatted = addRitualElements(formatted)
	case "threaded_narrative":
		formatted = addThreadStructure(formatted)
	}

	return formatted
}

func addVisualCues(content string) string {
	// Add visual direction cues for video content
	visualCues := []string{"*camera zooms*", "*sound fades*", "*silence*", "*whisper*"}
	return content + " " + visualCues[len(content)%len(visualCues)]
}

func addAestheticElements(content string) string {
	// Add aesthetic symbols for Instagram
	aesthetics := []string{"✨", "🌙", "🔮", "👁️", "🕯️", "📱"}
	return aesthetics[len(content)%len(aesthetics)] + " " + content
}

func expandNarrative(content string) string {
	// Add more detail for Telegram's longer format
	return content + "\n\nThe implications of this are still unfolding..."
}

func addAuthenticity(content string) string {
	// Make it sound more authentic for Reddit
	authenticity := []string{"Update:", "So this happened:", "I'm not sure if this is normal, but", "Has anyone else experienced"}
	return authenticity[len(content)%len(authenticity)] + " " + content
}

func addInteractiveElements(content string) string {
	// Add challenge elements for TikTok
	return content + " Try this yourself! 👻"
}

func addRitualElements(content string) string {
	// Add ritual/mystical elements for Discord
	return content + "\n\n*The ritual requires 13 participants...*"
}

func addThreadStructure(content string) string {
	// Structure for Twitter threads
	return content + "\n\n🧵⬇️"
}

func dispatchToPlatform(request *DispatchRequest, platform *Platform, formattedContent string) *DispatchResult {
	result := &DispatchResult{
		RequestID:        request.ID,
		Platform:         platform.ID,
		FormattedContent: formattedContent,
		DispatchedAt:     time.Now(),
	}

	// Simulate different platform dispatch methods
	switch platform.Type {
	case "video":
		result = dispatchVideoContent(request, platform, formattedContent, result)
	case "messaging":
		result = dispatchMessagingContent(request, platform, formattedContent, result)
	case "discussion":
		result = dispatchDiscussionContent(request, platform, formattedContent, result)
	case "social":
		result = dispatchSocialContent(request, platform, formattedContent, result)
	default:
		result.Status = "failed"
		result.Error = "Unknown platform type"
	}

	fmt.Printf("📤 Dispatched to %s: %s\n", platform.Name, result.Status)
	return result
}

func dispatchVideoContent(request *DispatchRequest, platform *Platform, content string, result *DispatchResult) *DispatchResult {
	// For video platforms like YouTube Shorts, Instagram Reels, TikTok
	// In production, this would integrate with actual platform APIs

	// Simulate n8n webhook call
	success := callN8NWebhook(map[string]interface{}{
		"platform": platform.ID,
		"content":  content,
		"type":     "video",
		"metadata": map[string]interface{}{
			"viral_score": request.ViralScore,
			"priority":    request.Priority,
		},
	})

	if success {
		result.Status = "success"
		result.PlatformResponse = map[string]string{
			"video_id": fmt.Sprintf("vid_%d", time.Now().Unix()),
			"url":      fmt.Sprintf("https://%s.com/video/vid_%d", platform.ID, time.Now().Unix()),
		}
	} else {
		result.Status = "failed"
		result.Error = "Failed to dispatch to video platform"
	}

	return result
}

func dispatchMessagingContent(request *DispatchRequest, platform *Platform, content string, result *DispatchResult) *DispatchResult {
	// For messaging platforms like Telegram, Discord

	success := callN8NWebhook(map[string]interface{}{
		"platform": platform.ID,
		"content":  content,
		"type":     "message",
		"metadata": map[string]interface{}{
			"viral_score": request.ViralScore,
			"channel_id":  "lore_channel_001",
		},
	})

	if success {
		result.Status = "success"
		result.PlatformResponse = map[string]string{
			"message_id": fmt.Sprintf("msg_%d", time.Now().Unix()),
			"channel":    "lore_channel_001",
		}
	} else {
		result.Status = "failed"
		result.Error = "Failed to dispatch to messaging platform"
	}

	return result
}

func dispatchDiscussionContent(request *DispatchRequest, platform *Platform, content string, result *DispatchResult) *DispatchResult {
	// For discussion platforms like Reddit

	success := callN8NWebhook(map[string]interface{}{
		"platform":  platform.ID,
		"content":   content,
		"type":      "post",
		"subreddit": "mystery", // Could be dynamic based on content analysis
		"metadata": map[string]interface{}{
			"viral_score": request.ViralScore,
			"flair":       "ARG",
		},
	})

	if success {
		result.Status = "success"
		result.PlatformResponse = map[string]string{
			"post_id":   fmt.Sprintf("post_%d", time.Now().Unix()),
			"subreddit": "mystery",
			"url":       fmt.Sprintf("https://reddit.com/r/mystery/post_%d", time.Now().Unix()),
		}
	} else {
		result.Status = "failed"
		result.Error = "Failed to dispatch to discussion platform"
	}

	return result
}

func dispatchSocialContent(request *DispatchRequest, platform *Platform, content string, result *DispatchResult) *DispatchResult {
	// For social platforms like Twitter/X

	success := callN8NWebhook(map[string]interface{}{
		"platform": platform.ID,
		"content":  content,
		"type":     "tweet",
		"metadata": map[string]interface{}{
			"viral_score": request.ViralScore,
			"thread":      true,
		},
	})

	if success {
		result.Status = "success"
		result.PlatformResponse = map[string]string{
			"tweet_id": fmt.Sprintf("tweet_%d", time.Now().Unix()),
			"url":      fmt.Sprintf("https://twitter.com/lorearchitect/status/tweet_%d", time.Now().Unix()),
		}
	} else {
		result.Status = "failed"
		result.Error = "Failed to dispatch to social platform"
	}

	return result
}

func callN8NWebhook(data interface{}) bool {
	// Simulate n8n webhook call
	// In production, this would make actual HTTP calls to your n8n workflows

	jsonData, _ := json.Marshal(data)

	// Simulate HTTP call
	req, err := http.NewRequest("POST", n8nWebhookURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return false
	}

	req.Header.Set("Content-Type", "application/json")

	// For this demo, we'll simulate success/failure
	// In production, you'd make the actual HTTP call
	// client := &http.Client{Timeout: 10 * time.Second}
	// resp, err := client.Do(req)

	// Simulate 85% success rate
	return time.Now().Unix()%100 < 85
}

func updateMultiDispatchStats(request *DispatchRequest, results []*DispatchResult) {
	multiDispatchStats.TotalDispatches += len(results)

	totalViralScore := request.ViralScore
	successCount := 0

	for _, result := range results {
		if result.Status == "success" {
			successCount++
			multiDispatchStats.SuccessfulDispatches++
		} else {
			multiDispatchStats.FailedDispatches++
		}

		// Update platform-specific stats
		stat, exists := multiDispatchStats.PlatformStats[result.Platform]
		if !exists {
			stat = PlatformStat{Name: result.Platform}
		}

		stat.Dispatches++
		if result.Status == "success" {
			stat.SuccessRate = (stat.SuccessRate*float64(stat.Dispatches-1) + 1.0) / float64(stat.Dispatches)
		} else {
			stat.SuccessRate = (stat.SuccessRate*float64(stat.Dispatches-1) + 0.0) / float64(stat.Dispatches)
		}
		stat.AvgViralScore = (stat.AvgViralScore*float64(stat.Dispatches-1) + totalViralScore) / float64(stat.Dispatches)

		multiDispatchStats.PlatformStats[result.Platform] = stat
	}

	// Update overall average viral score
	totalDispatches := float64(multiDispatchStats.TotalDispatches)
	multiDispatchStats.AverageViralScore = (multiDispatchStats.AverageViralScore*(totalDispatches-float64(len(results))) + totalViralScore) / totalDispatches
	multiDispatchStats.LastUpdated = time.Now()
}

// 🌐 API Handlers
func handleDispatchContent(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var request DispatchRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Generate ID if not provided
	if request.ID == "" {
		request.ID = fmt.Sprintf("dispatch_%d", time.Now().Unix())
	}

	request.CreatedAt = time.Now()

	// Add to dispatch queue
	select {
	case dispatchQueue <- &request:
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":     true,
			"dispatch_id": request.ID,
			"message":     "Dispatch queued successfully",
			"platforms":   request.Platforms,
			"queued_at":   time.Now(),
		})
	default:
		http.Error(w, "Dispatch queue full", http.StatusServiceUnavailable)
	}
}

func handleGetPlatforms(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var platformList []*Platform
	for _, platform := range platforms {
		platformList = append(platformList, platform)
	}

	response := map[string]interface{}{
		"platforms": platformList,
		"count":     len(platformList),
		"active":    countActivePlatforms(),
	}

	json.NewEncoder(w).Encode(response)
}

func handleGetDispatchResults(w http.ResponseWriter, r *http.Request) {
	dispatchID := r.URL.Query().Get("id")

	if dispatchID == "" {
		http.Error(w, "Dispatch ID required", http.StatusBadRequest)
		return
	}

	results, exists := dispatchResults[dispatchID]
	if !exists {
		http.Error(w, "Dispatch not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"dispatch_id": dispatchID,
		"results":     results,
		"total":       len(results),
		"successful":  countSuccessfulResults(results),
	})
}

func handleGetMultiStats(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(multiDispatchStats)
}

func countActivePlatforms() int {
	count := 0
	for _, platform := range platforms {
		if platform.Active {
			count++
		}
	}
	return count
}

func countSuccessfulResults(results []*DispatchResult) int {
	count := 0
	for _, result := range results {
		if result.Status == "success" {
			count++
		}
	}
	return count
}

// 🚀 Start multi-platform dispatcher
func startMultiPlatformDispatcher() {
	fmt.Println("🌐 Starting Multi-Platform Dispatcher...")

	initializeMultiDispatcher()

	// Set up HTTP handlers
	http.HandleFunc("/dispatch/send", handleDispatchContent)
	http.HandleFunc("/dispatch/platforms", handleGetPlatforms)
	http.HandleFunc("/dispatch/results", handleGetDispatchResults)
	http.HandleFunc("/dispatch/stats", handleGetMultiStats)

	fmt.Println("✅ Multi-Platform Dispatcher running on :8088")
	fmt.Println("   📤 POST /dispatch/send - Dispatch content to platforms")
	fmt.Println("   🌐 GET  /dispatch/platforms - View available platforms")
	fmt.Println("   📊 GET  /dispatch/results?id=X - View dispatch results")
	fmt.Println("   📈 GET  /dispatch/stats - View dispatch statistics")
}

func main() {
	fmt.Println("🌐👻 MULTI-PLATFORM DISPATCHER - HAUNT ALL THE THINGS")
	fmt.Println("=====================================================")

	// Start the multi-platform dispatcher
	startMultiPlatformDispatcher()

	// Start HTTP server
	log.Fatal(http.ListenAndServe(":8088", nil))
}
