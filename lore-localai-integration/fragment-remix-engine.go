package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math"
	"math/rand"
	"net/http"
	"strings"
	"time"
)

// 🔄 Fragment Remix Engine - Auto-mutates viral lore for continuous evolution
// Detects high-performing content and creates variations via LangChain API

type LoreFragment struct {
	ID             string            `json:"id"`
	Content        string            `json:"content"`
	OriginalAuthor string            `json:"original_author"`
	ViralScore     float64           `json:"viral_score"`
	EngagementRate float64           `json:"engagement_rate"`
	Platform       string            `json:"platform"`
	CreatedAt      time.Time         `json:"created_at"`
	RemixCount     int               `json:"remix_count"`
	Metadata       map[string]string `json:"metadata"`
}

type RemixVariation struct {
	ID             string    `json:"id"`
	OriginalID     string    `json:"original_id"`
	RemixType      string    `json:"remix_type"`
	Content        string    `json:"content"`
	PredictedScore float64   `json:"predicted_score"`
	DispatchPlan   []string  `json:"dispatch_plan"`
	CreatedAt      time.Time `json:"created_at"`
	Status         string    `json:"status"`
}

type RemixEngine struct {
	LangChainAPIKey  string
	ViralThreshold   float64
	RemixStrategies  []RemixStrategy
	ActiveFragments  map[string]*LoreFragment
	GeneratedRemixes map[string]*RemixVariation
}

type RemixStrategy struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Prompt      string  `json:"prompt"`
	Weight      float64 `json:"weight"`
}

var remixEngine *RemixEngine

// 🎭 Initialize the Fragment Remix Engine
func initializeRemixEngine() {
	fmt.Println("🔄 Initializing Fragment Remix Engine...")

	remixEngine = &RemixEngine{
		LangChainAPIKey:  "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", // Your key
		ViralThreshold:   7.5,                                                   // Only remix content with viral score > 7.5
		ActiveFragments:  make(map[string]*LoreFragment),
		GeneratedRemixes: make(map[string]*RemixVariation),
		RemixStrategies:  getRemixStrategies(),
	}

	// Seed with test fragments
	seedTestFragments()

	// Start background remix detection
	go continuousRemixGeneration()

	fmt.Println("✅ Fragment Remix Engine active!")
}

func getRemixStrategies() []RemixStrategy {
	return []RemixStrategy{
		{
			Name:        "tone_shift",
			Description: "Shift the emotional tone while preserving core narrative",
			Prompt:      "Take this lore fragment and rewrite it with a completely different emotional tone (if dark, make it mysterious; if mysterious, make it urgent; if urgent, make it melancholic). Keep the core story but change the emotional experience: '%s'",
			Weight:      1.0,
		},
		{
			Name:        "pov_change",
			Description: "Change the perspective or narrator",
			Prompt:      "Rewrite this lore fragment from a completely different point of view. If it's first person, make it third person omniscient; if it's observational, make it personal and intimate; if it's historical, make it present-tense and immediate: '%s'",
			Weight:      1.2,
		},
		{
			Name:        "time_warp",
			Description: "Shift the temporal setting or pacing",
			Prompt:      "Transform this lore fragment by shifting its time frame. If it's present, make it ancient prophecy; if it's past, make it a future memory; if it's slow revelation, make it urgent warning: '%s'",
			Weight:      1.1,
		},
		{
			Name:        "inverse_twist",
			Description: "Invert the core concept while maintaining atmosphere",
			Prompt:      "Take this lore fragment and create an 'inverse' version - if it's about gaining power, make it about losing it; if it's about fear, make it about forbidden desire; if it's about darkness, make it about dangerous light: '%s'",
			Weight:      1.3,
		},
		{
			Name:        "platform_adaptation",
			Description: "Adapt the content for different platform formats",
			Prompt:      "Rewrite this lore fragment specifically optimized for viral TikTok format - make it more immediate, visual, and hook-heavy while preserving the mysterious essence: '%s'",
			Weight:      0.9,
		},
		{
			Name:        "sequel_fragment",
			Description: "Create a continuation or sequel to the original lore",
			Prompt:      "Create a sequel fragment to this lore - what happens next? What are the consequences? What deeper mystery is revealed? Build on the original narrative: '%s'",
			Weight:      1.1,
		},
	}
}

func seedTestFragments() {
	testFragments := []*LoreFragment{
		{
			ID: "frag001", Content: "The old Nokia still gets bars where smartphones die. Its battery hasn't been charged in 15 years, yet it pulses with messages from numbers that don't exist. The last text, timestamped from next Tuesday: 'They're coming through the WiFi.'",
			OriginalAuthor: "LoreMaster_Tyler", ViralScore: 8.7, EngagementRate: 0.92,
			Platform: "TikTok", CreatedAt: time.Now().AddDate(0, 0, -2),
			Metadata: map[string]string{"theme": "digital_horror", "type": "creepypasta"},
		},
		{
			ID: "frag002", Content: "My grandmother's recipes always called for 'a pinch of memory.' I thought it was her quirky way of saying intuition. Found her spice cabinet after she passed. There's a jar labeled 'Memory - Use Sparingly.' It's half empty.",
			OriginalAuthor: "VoidWhisperer", ViralScore: 9.2, EngagementRate: 0.89,
			Platform: "Discord", CreatedAt: time.Now().AddDate(0, 0, -1),
			Metadata: map[string]string{"theme": "domestic_horror", "type": "short_horror"},
		},
		{
			ID: "frag003", Content: "The elevator in our office building has 13 floors, but the buttons only go to 12. Sometimes, late at night, you hear the 'ding' from floor 13. The security footage shows the elevator doors opening to complete darkness.",
			OriginalAuthor: "CursedCoder", ViralScore: 7.8, EngagementRate: 0.85,
			Platform: "Reddit", CreatedAt: time.Now().AddDate(0, 0, -3),
			Metadata: map[string]string{"theme": "architectural_horror", "type": "office_horror"},
		},
	}

	for _, fragment := range testFragments {
		remixEngine.ActiveFragments[fragment.ID] = fragment
	}
}

func continuousRemixGeneration() {
	ticker := time.NewTicker(15 * time.Minute) // Check every 15 minutes
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			fmt.Println("🔍 Scanning for high-performing lore fragments to remix...")
			processViralFragments()
		}
	}
}

func processViralFragments() {
	for _, fragment := range remixEngine.ActiveFragments {
		if fragment.ViralScore >= remixEngine.ViralThreshold && fragment.RemixCount < 3 {
			fmt.Printf("🎯 High-performing fragment detected: %.1f viral score\n", fragment.ViralScore)
			generateRemixVariations(fragment)
		}
	}
}

func generateRemixVariations(original *LoreFragment) {
	fmt.Printf("🔄 Generating remix variations for fragment: %s\n", original.ID)

	// Select 2-3 random remix strategies
	selectedStrategies := selectRandomStrategies(2 + rand.Intn(2))

	for _, strategy := range selectedStrategies {
		remix := createRemixVariation(original, strategy)
		if remix != nil {
			remixEngine.GeneratedRemixes[remix.ID] = remix

			// Immediately dispatch high-confidence remixes
			if remix.PredictedScore > 8.0 {
				dispatchRemix(remix)
			}
		}
	}

	// Update original fragment remix count
	original.RemixCount++
}

func selectRandomStrategies(count int) []RemixStrategy {
	strategies := remixEngine.RemixStrategies
	selected := make([]RemixStrategy, 0, count)

	// Weighted selection based on strategy weights
	for i := 0; i < count && len(strategies) > 0; i++ {
		totalWeight := 0.0
		for _, s := range strategies {
			totalWeight += s.Weight
		}

		r := rand.Float64() * totalWeight
		currentWeight := 0.0

		for j, strategy := range strategies {
			currentWeight += strategy.Weight
			if r <= currentWeight {
				selected = append(selected, strategy)
				// Remove selected strategy to avoid duplicates
				strategies = append(strategies[:j], strategies[j+1:]...)
				break
			}
		}
	}

	return selected
}

func createRemixVariation(original *LoreFragment, strategy RemixStrategy) *RemixVariation {
	// Generate remix using LangChain API
	prompt := fmt.Sprintf(strategy.Prompt, original.Content)
	remixedContent, err := callLangChainAPI(prompt)
	if err != nil {
		fmt.Printf("❌ Failed to generate remix: %v\n", err)
		return nil
	}

	// Predict viral score based on various factors
	predictedScore := predictViralScore(remixedContent, original, strategy)

	// Generate dispatch plan based on content and predicted performance
	dispatchPlan := generateDispatchPlan(remixedContent, predictedScore)

	remix := &RemixVariation{
		ID:             fmt.Sprintf("remix_%s_%s_%d", original.ID, strategy.Name, time.Now().Unix()),
		OriginalID:     original.ID,
		RemixType:      strategy.Name,
		Content:        remixedContent,
		PredictedScore: predictedScore,
		DispatchPlan:   dispatchPlan,
		CreatedAt:      time.Now(),
		Status:         "generated",
	}

	fmt.Printf("✨ Generated %s remix: %.1f predicted score\n", strategy.Name, predictedScore)
	return remix
}

func callLangChainAPI(prompt string) (string, error) {
	apiURL := "https://api.langchain.com/v1/chat/completions"

	payload := map[string]interface{}{
		"model": "gpt-4o-mini",
		"messages": []map[string]string{
			{
				"role":    "system",
				"content": "You are a master of viral horror lore. Create compelling, mysterious, and shareable content that maintains atmospheric dread while being optimized for social media virality. Keep responses concise but impactful.",
			},
			{
				"role":    "user",
				"content": prompt,
			},
		},
		"max_tokens":       200,
		"temperature":      0.8,
		"presence_penalty": 0.1,
	}

	jsonData, _ := json.Marshal(payload)

	req, _ := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+remixEngine.LangChainAPIKey)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var apiResponse struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.Unmarshal(body, &apiResponse); err != nil {
		return "", err
	}

	if len(apiResponse.Choices) > 0 {
		return strings.TrimSpace(apiResponse.Choices[0].Message.Content), nil
	}

	return "", fmt.Errorf("no content generated")
}

func predictViralScore(content string, original *LoreFragment, strategy RemixStrategy) float64 {
	baseScore := original.ViralScore

	// Factor in strategy effectiveness
	strategyMultiplier := strategy.Weight

	// Content analysis factors
	contentLength := float64(len(content))
	optimalLength := 280.0 // Optimal for social sharing
	lengthFactor := 1.0 - math.Abs(contentLength-optimalLength)/optimalLength*0.3

	// Hook strength (presence of engaging elements)
	hookStrength := 1.0
	hookWords := []string{"you", "never", "always", "everyone", "nobody", "secret", "hidden", "found", "discovered"}
	for _, word := range hookWords {
		if strings.Contains(strings.ToLower(content), word) {
			hookStrength += 0.1
		}
	}

	// Mystery factor (questions, implications)
	mysteryFactor := 1.0
	if strings.Contains(content, "?") {
		mysteryFactor += 0.2
	}
	if strings.Contains(content, "...") {
		mysteryFactor += 0.1
	}

	// Time sensitivity bonus
	timeFactor := 1.0
	timeWords := []string{"now", "today", "tonight", "right now", "happening", "live"}
	for _, word := range timeWords {
		if strings.Contains(strings.ToLower(content), word) {
			timeFactor += 0.15
		}
	}

	// Calculate final predicted score
	predictedScore := baseScore * strategyMultiplier * lengthFactor * hookStrength * mysteryFactor * timeFactor

	// Add some randomness to simulate real-world variability
	randomFactor := 0.9 + (rand.Float64() * 0.2) // ±10%
	predictedScore *= randomFactor

	// Cap at 10.0
	if predictedScore > 10.0 {
		predictedScore = 10.0
	}

	return math.Round(predictedScore*10) / 10
}

func generateDispatchPlan(content string, predictedScore float64) []string {
	plan := []string{}

	// Always dispatch to TikTok for high viral potential
	if predictedScore > 7.0 {
		plan = append(plan, "TikTok")
	}

	// Discord for community engagement
	if predictedScore > 6.5 {
		plan = append(plan, "Discord")
	}

	// Reddit for discussion-heavy content
	if strings.Contains(content, "?") || len(content) > 200 {
		plan = append(plan, "Reddit")
	}

	// Instagram Reels for visual content
	if predictedScore > 8.0 {
		plan = append(plan, "Instagram_Reels")
	}

	// YouTube Shorts for high-performance content
	if predictedScore > 8.5 {
		plan = append(plan, "YouTube_Shorts")
	}

	return plan
}

func dispatchRemix(remix *RemixVariation) {
	fmt.Printf("🚀 Dispatching high-confidence remix: %s (Score: %.1f)\n", remix.ID, remix.PredictedScore)

	for _, platform := range remix.DispatchPlan {
		dispatchToPlatform(remix, platform)
	}

	remix.Status = "dispatched"
}

func dispatchToPlatform(remix *RemixVariation, platform string) {
	// Integration points with existing dispatch systems
	switch platform {
	case "TikTok":
		// Send to TikTok webhook system
		fmt.Printf("   📱 Dispatched to TikTok: %s\n", platform)
	case "Discord":
		// Send to Discord bot
		fmt.Printf("   💬 Dispatched to Discord: %s\n", platform)
	case "Reddit":
		// Send to Reddit posting system
		fmt.Printf("   🔴 Dispatched to Reddit: %s\n", platform)
	case "Instagram_Reels":
		// Send to Instagram Reels via n8n
		fmt.Printf("   📸 Dispatched to Instagram Reels: %s\n", platform)
	case "YouTube_Shorts":
		// Send to YouTube Shorts via n8n
		fmt.Printf("   🎥 Dispatched to YouTube Shorts: %s\n", platform)
	default:
		fmt.Printf("   ❓ Unknown platform: %s\n", platform)
	}
}

// 🌐 API Handlers for remix system
func handleGetRemixes(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Get all remixes, sorted by predicted score
	var remixes []*RemixVariation
	for _, remix := range remixEngine.GeneratedRemixes {
		remixes = append(remixes, remix)
	}

	// Sort by predicted score (descending)
	for i := 0; i < len(remixes)-1; i++ {
		for j := i + 1; j < len(remixes); j++ {
			if remixes[i].PredictedScore < remixes[j].PredictedScore {
				remixes[i], remixes[j] = remixes[j], remixes[i]
			}
		}
	}

	response := map[string]interface{}{
		"remixes":          remixes,
		"total_count":      len(remixes),
		"active_fragments": len(remixEngine.ActiveFragments),
		"generated_at":     time.Now(),
	}

	json.NewEncoder(w).Encode(response)
}

func handleAddFragment(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var fragment LoreFragment
	if err := json.NewDecoder(r.Body).Decode(&fragment); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Generate ID if not provided
	if fragment.ID == "" {
		fragment.ID = fmt.Sprintf("frag_%d", time.Now().Unix())
	}

	fragment.CreatedAt = time.Now()
	remixEngine.ActiveFragments[fragment.ID] = &fragment

	// Immediately process if high viral score
	if fragment.ViralScore >= remixEngine.ViralThreshold {
		go generateRemixVariations(&fragment)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":    true,
		"fragment":   fragment,
		"message":    "Fragment added successfully",
		"will_remix": fragment.ViralScore >= remixEngine.ViralThreshold,
	})
}

// 🚀 Start remix engine
func startRemixEngine() {
	fmt.Println("🔄 Starting Fragment Remix Engine...")

	initializeRemixEngine()

	// Set up HTTP handlers
	http.HandleFunc("/remix/list", handleGetRemixes)
	http.HandleFunc("/remix/add_fragment", handleAddFragment)

	fmt.Println("✅ Fragment Remix Engine running on :8086")
	fmt.Println("   📊 GET  /remix/list - View generated remixes")
	fmt.Println("   📝 POST /remix/add_fragment - Add new fragment for remixing")
}

func main() {
	fmt.Println("🔄👻 FRAGMENT REMIX ENGINE - LIVING LORE EVOLUTION")
	fmt.Println("================================================")

	// Start the remix engine
	startRemixEngine()

	// Start HTTP server
	log.Fatal(http.ListenAndServe(":8086", nil))
}
