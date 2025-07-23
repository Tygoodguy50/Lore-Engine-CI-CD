package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"math/rand"
	"net/http"
	"strings"
	"time"
)

// 🎭 Sentiment & Lore Evolution - Reactive ARG system that evolves based on audience response
// Analyzes engagement patterns and creates living, breathing lore that responds to community

type SentimentAnalysis struct {
	ID               string             `json:"id"`
	Content          string             `json:"content"`
	Platform         string             `json:"platform"`
	OverallScore     float64            `json:"overall_score"`
	PositiveScore    float64            `json:"positive_score"`
	NegativeScore    float64            `json:"negative_score"`
	NeutralScore     float64            `json:"neutral_score"`
	EmotionBreakdown map[string]float64 `json:"emotion_breakdown"`
	KeyPhrases       []string           `json:"key_phrases"`
	AnalyzedAt       time.Time          `json:"analyzed_at"`
}

type LoreEvolution struct {
	ID                 string              `json:"id"`
	OriginalContent    string              `json:"original_content"`
	CurrentVersion     string              `json:"current_version"`
	EvolutionStage     int                 `json:"evolution_stage"`
	TriggerSentiment   string              `json:"trigger_sentiment"`
	EvolutionType      string              `json:"evolution_type"`
	ResponsePattern    string              `json:"response_pattern"`
	CreatedAt          time.Time           `json:"created_at"`
	LastEvolution      time.Time           `json:"last_evolution"`
	EngagementMetrics  map[string]float64  `json:"engagement_metrics"`
	CommunityReactions []CommunityReaction `json:"community_reactions"`
}

type CommunityReaction struct {
	UserID       string    `json:"user_id"`
	ReactionType string    `json:"reaction_type"`
	Sentiment    float64   `json:"sentiment"`
	Comment      string    `json:"comment"`
	Timestamp    time.Time `json:"timestamp"`
	Influence    float64   `json:"influence"`
}

type ARGEvent struct {
	ID               string            `json:"id"`
	EventType        string            `json:"event_type"`
	TriggerCondition string            `json:"trigger_condition"`
	ResponseContent  string            `json:"response_content"`
	AffectedLore     []string          `json:"affected_lore"`
	CommunityScore   float64           `json:"community_score"`
	ActiveUntil      time.Time         `json:"active_until"`
	ParticipantCount int               `json:"participant_count"`
	Metadata         map[string]string `json:"metadata"`
	CreatedAt        time.Time         `json:"created_at"`
}

type EvolutionStats struct {
	TotalEvolutions       int                `json:"total_evolutions"`
	ActiveARGEvents       int                `json:"active_arg_events"`
	CommunityEngagement   float64            `json:"community_engagement"`
	PopularEvolutionTypes map[string]int     `json:"popular_evolution_types"`
	SentimentTrends       map[string]float64 `json:"sentiment_trends"`
	LoreHealthScore       float64            `json:"lore_health_score"`
	LastUpdated           time.Time          `json:"last_updated"`
}

var (
	sentimentAnalyses = make(map[string]*SentimentAnalysis)
	loreEvolutions    = make(map[string]*LoreEvolution)
	argEvents         = make(map[string]*ARGEvent)
	evolutionStats    = &EvolutionStats{
		PopularEvolutionTypes: make(map[string]int),
		SentimentTrends:       make(map[string]float64),
	}
)

// 🎭 Initialize sentiment & evolution system
func initializeSentimentEvolution() {
	fmt.Println("🎭 Initializing Sentiment & Lore Evolution System...")

	seedTestData()
	startEvolutionMonitoring()

	fmt.Println("✅ Sentiment & Lore Evolution system active!")
}

func seedTestData() {
	// Seed some test lore evolutions
	testEvolutions := []*LoreEvolution{
		{
			ID:               "evo001",
			OriginalContent:  "The old Nokia still gets bars where smartphones die.",
			CurrentVersion:   "The old Nokia still gets bars where smartphones die. But tonight, it's receiving calls from numbers that were disconnected decades ago.",
			EvolutionStage:   2,
			TriggerSentiment: "curiosity",
			EvolutionType:    "expansion_arc",
			ResponsePattern:  "community_curiosity",
			CreatedAt:        time.Now().Add(-48 * time.Hour),
			LastEvolution:    time.Now().Add(-24 * time.Hour),
			EngagementMetrics: map[string]float64{
				"likes": 1247, "shares": 89, "comments": 156, "saves": 234,
			},
			CommunityReactions: []CommunityReaction{
				{UserID: "user123", ReactionType: "curiosity", Sentiment: 0.7, Comment: "What happens if you answer?", Timestamp: time.Now().Add(-12 * time.Hour), Influence: 0.8},
				{UserID: "user456", ReactionType: "fear", Sentiment: -0.3, Comment: "This is getting too real", Timestamp: time.Now().Add(-6 * time.Hour), Influence: 0.6},
			},
		},
		{
			ID:               "evo002",
			OriginalContent:  "My grandmother's recipes always called for 'a pinch of memory.'",
			CurrentVersion:   "My grandmother's recipes always called for 'a pinch of memory.' I found the jar. It's not spice. It's photographs, ground to powder.",
			EvolutionStage:   3,
			TriggerSentiment: "dread",
			EvolutionType:    "horror_intensification",
			ResponsePattern:  "community_dread",
			CreatedAt:        time.Now().Add(-72 * time.Hour),
			LastEvolution:    time.Now().Add(-12 * time.Hour),
			EngagementMetrics: map[string]float64{
				"likes": 2156, "shares": 234, "comments": 445, "saves": 567,
			},
			CommunityReactions: []CommunityReaction{
				{UserID: "user789", ReactionType: "horror", Sentiment: -0.8, Comment: "NO NO NO", Timestamp: time.Now().Add(-8 * time.Hour), Influence: 0.9},
				{UserID: "user321", ReactionType: "intrigue", Sentiment: 0.4, Comment: "What memories?", Timestamp: time.Now().Add(-4 * time.Hour), Influence: 0.7},
			},
		},
	}

	for _, evolution := range testEvolutions {
		loreEvolutions[evolution.ID] = evolution
	}

	// Seed some ARG events
	testARGEvents := []*ARGEvent{
		{
			ID:               "arg001",
			EventType:        "community_investigation",
			TriggerCondition: "high_curiosity_sentiment",
			ResponseContent:  "A new Nokia model has been spotted. Model number: 3310-∞. It only appears in electronics graveyards.",
			AffectedLore:     []string{"evo001"},
			CommunityScore:   8.7,
			ActiveUntil:      time.Now().Add(48 * time.Hour),
			ParticipantCount: 89,
			Metadata:         map[string]string{"phase": "discovery", "clue_type": "location"},
			CreatedAt:        time.Now().Add(-24 * time.Hour),
		},
		{
			ID:               "arg002",
			EventType:        "horror_escalation",
			TriggerCondition: "overwhelming_dread_response",
			ResponseContent:  "The photographs in the spice jar are moving. They show moments that haven't happened yet.",
			AffectedLore:     []string{"evo002"},
			CommunityScore:   9.1,
			ActiveUntil:      time.Now().Add(72 * time.Hour),
			ParticipantCount: 156,
			Metadata:         map[string]string{"phase": "revelation", "threat_level": "high"},
			CreatedAt:        time.Now().Add(-12 * time.Hour),
		},
	}

	for _, event := range testARGEvents {
		argEvents[event.ID] = event
	}
}

func startEvolutionMonitoring() {
	go evolutionMonitoringLoop()
	fmt.Println("🔍 Started evolution monitoring loop")
}

func evolutionMonitoringLoop() {
	ticker := time.NewTicker(10 * time.Minute) // Check every 10 minutes
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			fmt.Println("🔍 Analyzing community sentiment and triggering evolution...")
			analyzeCommunityEngagement()
			triggerLoreEvolution()
			manageARGEvents()
			updateEvolutionStats()
		}
	}
}

func analyzeCommunityEngagement() {
	for _, evolution := range loreEvolutions {
		// Analyze recent community reactions
		recentReactions := getRecentReactions(evolution, 2*time.Hour)

		if len(recentReactions) == 0 {
			continue
		}

		// Calculate sentiment trends
		sentimentSum := 0.0
		dominantEmotion := ""
		emotionCounts := make(map[string]int)

		for _, reaction := range recentReactions {
			sentimentSum += reaction.Sentiment * reaction.Influence
			emotionCounts[reaction.ReactionType]++
		}

		avgSentiment := sentimentSum / float64(len(recentReactions))

		// Find dominant emotion
		maxCount := 0
		for emotion, count := range emotionCounts {
			if count > maxCount {
				maxCount = count
				dominantEmotion = emotion
			}
		}

		// Store analysis results
		analysis := &SentimentAnalysis{
			ID:            fmt.Sprintf("analysis_%s_%d", evolution.ID, time.Now().Unix()),
			Content:       evolution.CurrentVersion,
			Platform:      "community",
			OverallScore:  avgSentiment,
			PositiveScore: math.Max(0, avgSentiment),
			NegativeScore: math.Max(0, -avgSentiment),
			NeutralScore:  1.0 - math.Abs(avgSentiment),
			EmotionBreakdown: map[string]float64{
				dominantEmotion: float64(maxCount) / float64(len(recentReactions)),
			},
			KeyPhrases: extractKeyPhrases(recentReactions),
			AnalyzedAt: time.Now(),
		}

		sentimentAnalyses[analysis.ID] = analysis

		// Update evolution with new sentiment data
		evolution.TriggerSentiment = dominantEmotion
		evolution.EngagementMetrics["recent_sentiment"] = avgSentiment
		evolution.EngagementMetrics["reaction_count"] = float64(len(recentReactions))

		fmt.Printf("📊 Analyzed %s: %.2f sentiment, dominant emotion: %s\n",
			evolution.ID, avgSentiment, dominantEmotion)
	}
}

func getRecentReactions(evolution *LoreEvolution, duration time.Duration) []CommunityReaction {
	var recent []CommunityReaction
	cutoff := time.Now().Add(-duration)

	for _, reaction := range evolution.CommunityReactions {
		if reaction.Timestamp.After(cutoff) {
			recent = append(recent, reaction)
		}
	}

	return recent
}

func extractKeyPhrases(reactions []CommunityReaction) []string {
	phraseMap := make(map[string]int)

	for _, reaction := range reactions {
		words := strings.Fields(strings.ToLower(reaction.Comment))
		for _, word := range words {
			if len(word) > 3 { // Only consider words longer than 3 characters
				phraseMap[word]++
			}
		}
	}

	// Get top phrases
	var phrases []string
	for phrase, count := range phraseMap {
		if count >= 2 { // Mentioned at least twice
			phrases = append(phrases, phrase)
		}
	}

	return phrases
}

func triggerLoreEvolution() {
	for _, evolution := range loreEvolutions {
		// Check if evolution conditions are met
		recentReactions := getRecentReactions(evolution, 4*time.Hour)

		if len(recentReactions) < 5 { // Need at least 5 reactions to trigger evolution
			continue
		}

		// Calculate evolution trigger score
		triggerScore := calculateEvolutionTrigger(evolution, recentReactions)

		if triggerScore > 7.5 { // High threshold for evolution
			fmt.Printf("🧬 Triggering evolution for %s (score: %.2f)\n", evolution.ID, triggerScore)
			evolveContent(evolution, recentReactions)
		}
	}
}

func calculateEvolutionTrigger(evolution *LoreEvolution, reactions []CommunityReaction) float64 {
	if len(reactions) == 0 {
		return 0
	}

	// Factors for evolution triggering:
	reactionIntensity := 0.0
	emotionalDiversity := make(map[string]bool)
	highInfluenceReactions := 0

	for _, reaction := range reactions {
		// Intensity (absolute sentiment value)
		reactionIntensity += math.Abs(reaction.Sentiment) * reaction.Influence

		// Emotional diversity
		emotionalDiversity[reaction.ReactionType] = true

		// High influence reactions
		if reaction.Influence > 0.7 {
			highInfluenceReactions++
		}
	}

	avgIntensity := reactionIntensity / float64(len(reactions))
	diversityScore := float64(len(emotionalDiversity)) / 5.0 // Max 5 different emotions
	influenceScore := float64(highInfluenceReactions) / float64(len(reactions))
	volumeScore := math.Min(float64(len(reactions))/20.0, 1.0) // Cap at 20 reactions

	// Time since last evolution (encourages spacing)
	timeSinceLastEvolution := time.Since(evolution.LastEvolution)
	timeScore := math.Min(timeSinceLastEvolution.Hours()/24.0, 1.0) // Cap at 24 hours

	totalScore := (avgIntensity*3.0 + diversityScore*2.0 + influenceScore*2.0 + volumeScore*2.0 + timeScore*1.0) * 10.0 / 10.0

	return math.Min(totalScore, 10.0)
}

func evolveContent(evolution *LoreEvolution, reactions []CommunityReaction) {
	// Determine evolution type based on dominant sentiment
	dominantEmotion := getDominantEmotion(reactions)
	evolutionType := determineEvolutionType(dominantEmotion, evolution.EvolutionStage)

	// Generate evolved content based on the pattern
	evolvedContent := generateEvolvedContent(evolution, evolutionType, reactions)

	// Update evolution
	evolution.CurrentVersion = evolvedContent
	evolution.EvolutionStage++
	evolution.EvolutionType = evolutionType
	evolution.LastEvolution = time.Now()
	evolution.ResponsePattern = dominantEmotion + "_response"

	// Create ARG event if conditions are met
	if shouldTriggerARGEvent(evolution, reactions) {
		createARGEvent(evolution, dominantEmotion)
	}

	fmt.Printf("🔄 Evolved %s to stage %d: %s\n", evolution.ID, evolution.EvolutionStage, evolutionType)
}

func getDominantEmotion(reactions []CommunityReaction) string {
	emotionCounts := make(map[string]float64)

	for _, reaction := range reactions {
		emotionCounts[reaction.ReactionType] += reaction.Influence
	}

	dominantEmotion := ""
	maxScore := 0.0

	for emotion, score := range emotionCounts {
		if score > maxScore {
			maxScore = score
			dominantEmotion = emotion
		}
	}

	return dominantEmotion
}

func determineEvolutionType(dominantEmotion string, currentStage int) string {
	evolutionTypes := map[string][]string{
		"curiosity":  {"expansion_arc", "mystery_deepening", "clue_revelation"},
		"fear":       {"horror_intensification", "threat_escalation", "psychological_pressure"},
		"dread":      {"foreboding_buildup", "atmospheric_thickening", "inevitability_arc"},
		"intrigue":   {"puzzle_complexity", "hidden_connection", "revelation_tease"},
		"horror":     {"visceral_escalation", "reality_breakdown", "sanity_questioning"},
		"confusion":  {"clarity_inversion", "paradox_introduction", "logic_subversion"},
		"excitement": {"momentum_building", "community_mobilization", "collaborative_mystery"},
	}

	types, exists := evolutionTypes[dominantEmotion]
	if !exists {
		types = evolutionTypes["curiosity"] // Default fallback
	}

	// Select based on current evolution stage
	index := (currentStage - 1) % len(types)
	return types[index]
}

func generateEvolvedContent(evolution *LoreEvolution, evolutionType string, reactions []CommunityReaction) string {
	baseContent := evolution.CurrentVersion

	// Evolution patterns based on type
	switch evolutionType {
	case "expansion_arc":
		return baseContent + " " + generateExpansion(reactions)
	case "horror_intensification":
		return intensifyHorror(baseContent, reactions)
	case "mystery_deepening":
		return deepenMystery(baseContent, reactions)
	case "clue_revelation":
		return revealClue(baseContent, reactions)
	case "threat_escalation":
		return escalateThreat(baseContent, reactions)
	case "psychological_pressure":
		return addPsychologicalPressure(baseContent, reactions)
	case "foreboding_buildup":
		return buildForeboding(baseContent, reactions)
	case "reality_breakdown":
		return breakdownReality(baseContent, reactions)
	case "collaborative_mystery":
		return createCollaborativeMystery(baseContent, reactions)
	default:
		return baseContent + " The mystery deepens..."
	}
}

func generateExpansion(reactions []CommunityReaction) string {
	expansions := []string{
		"But there's more to this story than I first realized.",
		"The implications are far more reaching than I thought.",
		"What I didn't mention is what happened next.",
		"There's a detail I left out that changes everything.",
		"The follow-up event is what really terrifies me.",
	}
	return expansions[len(reactions)%len(expansions)]
}

func intensifyHorror(content string, reactions []CommunityReaction) string {
	intensifiers := []string{
		" The smell is getting stronger.",
		" It's happening more frequently now.",
		" They're getting bolder.",
		" The sounds are coming from inside the walls.",
		" I can feel them watching me type this.",
	}
	return content + intensifiers[len(reactions)%len(intensifiers)]
}

func deepenMystery(content string, reactions []CommunityReaction) string {
	mysteries := []string{
		" But why only at 3:33 AM?",
		" The pattern is becoming clear, and I don't like it.",
		" There's a symbol that keeps appearing.",
		" The dates aren't random - they spell something.",
		" I've found others experiencing the same thing.",
	}
	return content + mysteries[len(reactions)%len(mysteries)]
}

func revealClue(content string, reactions []CommunityReaction) string {
	clues := []string{
		" UPDATE: Found a manufacturer's mark - it's not from this decade.",
		" EDIT: The serial number traces to a factory that burned down in 1987.",
		" New info: My neighbor says they've seen this before.",
		" Breaking: The phone company has no record of these numbers.",
		" Discovery: The messages are coming from underground.",
	}
	return content + clues[len(reactions)%len(clues)]
}

func escalateThreat(content string, reactions []CommunityReaction) string {
	threats := []string{
		" It followed me home.",
		" Now it's affecting other devices.",
		" My family is starting to notice.",
		" The authorities won't listen.",
		" I think I made a terrible mistake.",
	}
	return content + threats[len(reactions)%len(threats)]
}

func addPsychologicalPressure(content string, reactions []CommunityReaction) string {
	pressures := []string{
		" I can't sleep knowing this exists.",
		" Every phone call makes me jump now.",
		" I keep checking if it's still there.",
		" My friends think I'm losing it.",
		" The doubt is eating at me - what if I'm wrong?",
	}
	return content + pressures[len(reactions)%len(pressures)]
}

func buildForeboding(content string, reactions []CommunityReaction) string {
	forebodings := []string{
		" Something's coming. I can feel it.",
		" The timing is too perfect to be coincidence.",
		" There's a countdown hidden in the patterns.",
		" Every day, it gets closer to completion.",
		" The final piece is almost in place.",
	}
	return content + forebodings[len(reactions)%len(forebodings)]
}

func breakdownReality(content string, reactions []CommunityReaction) string {
	breakdowns := []string{
		" Wait... is this even real?",
		" The timestamps don't match what I remember.",
		" Others are claiming this never happened.",
		" The photos I took are coming out blank.",
		" Reality is shifting around this thing.",
	}
	return content + breakdowns[len(reactions)%len(breakdowns)]
}

func createCollaborativeMystery(content string, reactions []CommunityReaction) string {
	collaborative := []string{
		" Who else is experiencing this? DM me.",
		" We need to piece this together as a community.",
		" Check your devices for similar anomalies.",
		" Document everything - we're building a case.",
		" If you've seen this symbol [●●●○], contact me immediately.",
	}
	return content + collaborative[len(reactions)%len(collaborative)]
}

func shouldTriggerARGEvent(evolution *LoreEvolution, reactions []CommunityReaction) bool {
	// Trigger ARG events when:
	// 1. High engagement (many reactions)
	// 2. Strong community sentiment (high average influence)
	// 3. Collaborative interest (questions and investigations)

	if len(reactions) < 8 {
		return false
	}

	totalInfluence := 0.0
	questionCount := 0

	for _, reaction := range reactions {
		totalInfluence += reaction.Influence
		if strings.Contains(reaction.Comment, "?") {
			questionCount++
		}
	}

	avgInfluence := totalInfluence / float64(len(reactions))
	questionRatio := float64(questionCount) / float64(len(reactions))

	return avgInfluence > 0.6 && questionRatio > 0.3 && evolution.EvolutionStage >= 2
}

func createARGEvent(evolution *LoreEvolution, dominantEmotion string) {
	eventTypes := map[string]string{
		"curiosity":  "community_investigation",
		"fear":       "horror_escalation",
		"dread":      "countdown_event",
		"intrigue":   "puzzle_challenge",
		"horror":     "reality_breach",
		"confusion":  "paradox_event",
		"excitement": "community_mobilization",
	}

	eventType, exists := eventTypes[dominantEmotion]
	if !exists {
		eventType = "mystery_event"
	}

	responseContent := generateARGResponse(eventType, evolution)

	event := &ARGEvent{
		ID:               fmt.Sprintf("arg_%s_%d", evolution.ID, time.Now().Unix()),
		EventType:        eventType,
		TriggerCondition: fmt.Sprintf("%s_threshold_reached", dominantEmotion),
		ResponseContent:  responseContent,
		AffectedLore:     []string{evolution.ID},
		CommunityScore:   7.0 + rand.Float64()*2.0,                                    // 7.0-9.0 range
		ActiveUntil:      time.Now().Add(time.Duration(24+rand.Intn(48)) * time.Hour), // 24-72 hours
		ParticipantCount: 0,                                                           // Will be updated as people participate
		Metadata: map[string]string{
			"evolution_stage": fmt.Sprintf("%d", evolution.EvolutionStage),
			"trigger_emotion": dominantEmotion,
			"phase":           "active",
		},
		CreatedAt: time.Now(),
	}

	argEvents[event.ID] = event

	fmt.Printf("🎭 Created ARG event: %s (%s)\n", event.ID, event.EventType)
}

func generateARGResponse(eventType string, evolution *LoreEvolution) string {
	responses := map[string][]string{
		"community_investigation": {
			"New evidence has surfaced. Check local electronics stores for similar devices.",
			"A pattern is emerging across multiple cities. Document any similar experiences.",
			"Investigation update: The manufacturer code leads to a defunct company.",
			"Community findings: These incidents cluster around specific geographic coordinates.",
		},
		"horror_escalation": {
			"ALERT: Multiple reports of similar phenomena in the last 24 hours.",
			"WARNING: Do not attempt to interact with the device alone.",
			"URGENT: The events are accelerating. Pattern suggests imminent escalation.",
			"CRITICAL: Community safety protocol now in effect.",
		},
		"countdown_event": {
			"The countdown has begun. T-minus 72 hours to convergence.",
			"All signs point to a specific date and time. We must prepare.",
			"The sequence is almost complete. Final phase approaching.",
			"Temporal markers indicate synchronization across all incidents.",
		},
		"puzzle_challenge": {
			"The cipher is hidden in plain sight. Who can decode the pattern?",
			"Collaborative puzzle: Combine your pieces to see the bigger picture.",
			"Challenge issued: Solve the coordinates to unlock the next phase.",
			"Community challenge: The answer requires multiple perspectives.",
		},
		"reality_breach": {
			"Reality flux detected. Consensus breakdown imminent.",
			"Multiple timelines converging. Prepare for cognitive dissonance.",
			"The barrier is thinning. Document all anomalies immediately.",
			"Reality anchor failure detected. Community verification needed.",
		},
	}

	eventResponses, exists := responses[eventType]
	if !exists {
		eventResponses = responses["community_investigation"] // Default
	}

	return eventResponses[evolution.EvolutionStage%len(eventResponses)]
}

func manageARGEvents() {
	currentTime := time.Now()

	for id, event := range argEvents {
		// Remove expired events
		if currentTime.After(event.ActiveUntil) {
			fmt.Printf("⏰ ARG event %s has expired\n", id)
			delete(argEvents, id)
			continue
		}

		// Simulate community participation growth
		if rand.Float64() < 0.3 { // 30% chance per check
			event.ParticipantCount += rand.Intn(5) + 1
		}

		// Update community score based on participation
		if event.ParticipantCount > 50 {
			event.CommunityScore = math.Min(event.CommunityScore+0.1, 10.0)
		}
	}
}

func updateEvolutionStats() {
	evolutionStats.TotalEvolutions = 0
	evolutionStats.ActiveARGEvents = len(argEvents)
	evolutionStats.CommunityEngagement = 0.0
	evolutionStats.PopularEvolutionTypes = make(map[string]int)
	evolutionStats.SentimentTrends = make(map[string]float64)

	totalEngagement := 0.0
	engagementCount := 0

	for _, evolution := range loreEvolutions {
		evolutionStats.TotalEvolutions += evolution.EvolutionStage
		evolutionStats.PopularEvolutionTypes[evolution.EvolutionType]++

		// Calculate engagement for this evolution
		if reactionCount, exists := evolution.EngagementMetrics["reaction_count"]; exists {
			totalEngagement += reactionCount
			engagementCount++
		}

		// Add to sentiment trends
		if sentiment, exists := evolution.EngagementMetrics["recent_sentiment"]; exists {
			evolutionStats.SentimentTrends[evolution.TriggerSentiment] = sentiment
		}
	}

	if engagementCount > 0 {
		evolutionStats.CommunityEngagement = totalEngagement / float64(engagementCount)
	}

	// Calculate lore health score (0-10 scale)
	healthScore := 5.0 // Base score

	if evolutionStats.CommunityEngagement > 10 {
		healthScore += 2.0
	}

	if len(argEvents) > 0 {
		healthScore += 1.5
	}

	if len(evolutionStats.PopularEvolutionTypes) > 3 {
		healthScore += 1.0
	}

	evolutionStats.LoreHealthScore = math.Min(healthScore, 10.0)
	evolutionStats.LastUpdated = time.Now()
}

// 🌐 API Handlers
func handleAnalyzeSentiment(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var request struct {
		Content  string `json:"content"`
		Platform string `json:"platform"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Simulate sentiment analysis (in production, use actual sentiment API)
	analysis := &SentimentAnalysis{
		ID:            fmt.Sprintf("analysis_%d", time.Now().Unix()),
		Content:       request.Content,
		Platform:      request.Platform,
		OverallScore:  (rand.Float64() - 0.5) * 2, // -1 to 1
		PositiveScore: rand.Float64(),
		NegativeScore: rand.Float64(),
		NeutralScore:  rand.Float64(),
		EmotionBreakdown: map[string]float64{
			"curiosity": rand.Float64(),
			"fear":      rand.Float64(),
			"intrigue":  rand.Float64(),
		},
		KeyPhrases: []string{"mysterious", "interesting", "scary"},
		AnalyzedAt: time.Now(),
	}

	sentimentAnalyses[analysis.ID] = analysis

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(analysis)
}

func handleGetEvolutions(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var evolutions []*LoreEvolution
	for _, evolution := range loreEvolutions {
		evolutions = append(evolutions, evolution)
	}

	response := map[string]interface{}{
		"evolutions": evolutions,
		"count":      len(evolutions),
		"stats":      evolutionStats,
	}

	json.NewEncoder(w).Encode(response)
}

func handleGetARGEvents(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var events []*ARGEvent
	for _, event := range argEvents {
		events = append(events, event)
	}

	response := map[string]interface{}{
		"arg_events":   events,
		"active_count": len(events),
		"timestamp":    time.Now(),
	}

	json.NewEncoder(w).Encode(response)
}

func handleAddReaction(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var request struct {
		LoreID       string  `json:"lore_id"`
		UserID       string  `json:"user_id"`
		ReactionType string  `json:"reaction_type"`
		Sentiment    float64 `json:"sentiment"`
		Comment      string  `json:"comment"`
		Influence    float64 `json:"influence"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	evolution, exists := loreEvolutions[request.LoreID]
	if !exists {
		http.Error(w, "Lore evolution not found", http.StatusNotFound)
		return
	}

	reaction := CommunityReaction{
		UserID:       request.UserID,
		ReactionType: request.ReactionType,
		Sentiment:    request.Sentiment,
		Comment:      request.Comment,
		Influence:    request.Influence,
		Timestamp:    time.Now(),
	}

	evolution.CommunityReactions = append(evolution.CommunityReactions, reaction)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":        true,
		"message":        "Reaction added successfully",
		"lore_id":        request.LoreID,
		"reaction_count": len(evolution.CommunityReactions),
	})
}

// 🚀 Start sentiment & evolution system
func startSentimentEvolution() {
	fmt.Println("🎭 Starting Sentiment & Lore Evolution System...")

	initializeSentimentEvolution()

	// Set up HTTP handlers
	http.HandleFunc("/evolution/analyze", handleAnalyzeSentiment)
	http.HandleFunc("/evolution/lore", handleGetEvolutions)
	http.HandleFunc("/evolution/arg-events", handleGetARGEvents)
	http.HandleFunc("/evolution/react", handleAddReaction)

	fmt.Println("✅ Sentiment & Lore Evolution running on :8089")
	fmt.Println("   🎭 POST /evolution/analyze - Analyze sentiment")
	fmt.Println("   🧬 GET  /evolution/lore - View lore evolutions")
	fmt.Println("   🎮 GET  /evolution/arg-events - View ARG events")
	fmt.Println("   💬 POST /evolution/react - Add community reaction")
}

func main() {
	fmt.Println("🎭👻 SENTIMENT & LORE EVOLUTION - LIVING ARG SYSTEM")
	fmt.Println("==================================================")

	// Start the sentiment & evolution system
	startSentimentEvolution()

	// Start HTTP server
	log.Fatal(http.ListenAndServe(":8089", nil))
}
