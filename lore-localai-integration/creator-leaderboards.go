package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"math/rand"
	"net/http"
	"sort"
	"time"
)

// 🏆 Creator Leaderboard & Lore Ranking System
// Tracks viral performance, dispatch efficiency, and engagement scores

type Creator struct {
	ID                 string             `json:"id"`
	Username           string             `json:"username"`
	ViralCoefficient   float64            `json:"viral_coefficient"`
	DispatchEfficiency float64            `json:"dispatch_efficiency"`
	EngagementScore    float64            `json:"engagement_score"`
	TotalScore         float64            `json:"total_score"`
	Rank               int                `json:"rank"`
	Tier               string             `json:"tier"`
	Badges             []string           `json:"badges"`
	WeeklyPerformance  map[string]float64 `json:"weekly_performance"`
	LastUpdated        time.Time          `json:"last_updated"`
}

type LeaderboardStats struct {
	TotalCreators  int       `json:"total_creators"`
	ActiveCreators int       `json:"active_creators"`
	TopPerformer   string    `json:"top_performer"`
	AverageScore   float64   `json:"average_score"`
	LastUpdated    time.Time `json:"last_updated"`
}

var creatorDatabase = make(map[string]*Creator)
var leaderboardStats = &LeaderboardStats{}

// 🎭 Initialize creator leaderboard system
func initializeLeaderboards() {
	fmt.Println("🏆 Initializing Creator Leaderboards & Lore Rankings...")

	// Seed with some test creators
	seedTestCreators()

	// Start background ranking updates
	go periodicRankingUpdates()

	fmt.Println("✅ Creator leaderboard system active!")
}

func seedTestCreators() {
	testCreators := []Creator{
		{
			ID: "creator001", Username: "LoreMaster_Tyler",
			ViralCoefficient: 8.5, DispatchEfficiency: 9.2, EngagementScore: 8.8,
			Badges: []string{"🩸 Blood Architect", "⚡ Lightning Dispatcher"},
			WeeklyPerformance: map[string]float64{
				"week1": 8.2, "week2": 8.7, "week3": 9.1, "week4": 8.9,
			},
		},
		{
			ID: "creator002", Username: "VoidWhisperer",
			ViralCoefficient: 7.8, DispatchEfficiency: 8.1, EngagementScore: 9.3,
			Badges: []string{"🌊 Engagement Tsunami", "👁️ Void Seer"},
			WeeklyPerformance: map[string]float64{
				"week1": 7.5, "week2": 8.0, "week3": 8.4, "week4": 8.8,
			},
		},
		{
			ID: "creator003", Username: "CursedCoder",
			ViralCoefficient: 9.1, DispatchEfficiency: 7.9, EngagementScore: 8.2,
			Badges: []string{"💻 Code Necromancer", "🔥 Viral Infector"},
			WeeklyPerformance: map[string]float64{
				"week1": 8.8, "week2": 8.9, "week3": 9.0, "week4": 9.2,
			},
		},
		{
			ID: "creator004", Username: "GhostlyGamer",
			ViralCoefficient: 6.9, DispatchEfficiency: 8.7, EngagementScore: 7.4,
			Badges: []string{"🎮 Digital Haunter"},
			WeeklyPerformance: map[string]float64{
				"week1": 7.1, "week2": 7.3, "week3": 7.8, "week4": 7.7,
			},
		},
	}

	for _, creator := range testCreators {
		creator.LastUpdated = time.Now()
		creator.TotalScore = calculateTotalScore(creator)
		creatorDatabase[creator.ID] = &creator
	}

	updateRankings()
}

func calculateTotalScore(creator Creator) float64 {
	// Weighted scoring algorithm
	viralWeight := 0.4
	dispatchWeight := 0.35
	engagementWeight := 0.25

	totalScore := (creator.ViralCoefficient * viralWeight) +
		(creator.DispatchEfficiency * dispatchWeight) +
		(creator.EngagementScore * engagementWeight)

	// Bonus for consistency (low standard deviation in weekly performance)
	var weeklyScores []float64
	for _, score := range creator.WeeklyPerformance {
		weeklyScores = append(weeklyScores, score)
	}

	if len(weeklyScores) > 1 {
		consistency := calculateConsistency(weeklyScores)
		totalScore += consistency * 0.1 // 10% bonus for consistency
	}

	return math.Round(totalScore*100) / 100
}

func calculateConsistency(scores []float64) float64 {
	if len(scores) < 2 {
		return 0
	}

	// Calculate mean
	sum := 0.0
	for _, score := range scores {
		sum += score
	}
	mean := sum / float64(len(scores))

	// Calculate standard deviation
	variance := 0.0
	for _, score := range scores {
		variance += math.Pow(score-mean, 2)
	}
	stdDev := math.Sqrt(variance / float64(len(scores)))

	// Lower standard deviation = higher consistency bonus
	consistencyBonus := math.Max(0, (3.0-stdDev)/3.0) // Max bonus of 1.0
	return consistencyBonus
}

func updateRankings() {
	// Convert map to slice for sorting
	var creators []*Creator
	for _, creator := range creatorDatabase {
		creators = append(creators, creator)
	}

	// Sort by total score (descending)
	sort.Slice(creators, func(i, j int) bool {
		return creators[i].TotalScore > creators[j].TotalScore
	})

	// Assign ranks and tiers
	for i, creator := range creators {
		creator.Rank = i + 1
		creator.Tier = assignTier(creator.TotalScore, creator.Rank)
		assignBadges(creator)
	}

	// Update leaderboard stats
	updateLeaderboardStats(creators)
}

func assignTier(score float64, rank int) string {
	if score >= 9.0 && rank <= 3 {
		return "👻 Ghost Tier"
	} else if score >= 8.5 && rank <= 10 {
		return "🔥 Phantom Tier"
	} else if score >= 8.0 && rank <= 25 {
		return "⚡ Spirit Tier"
	} else if score >= 7.0 {
		return "🌙 Wraith Tier"
	} else {
		return "🕯️ Apprentice Tier"
	}
}

func assignBadges(creator *Creator) {
	badges := []string{}

	// Performance-based badges
	if creator.ViralCoefficient >= 9.0 {
		badges = append(badges, "🔥 Viral Infector")
	}
	if creator.DispatchEfficiency >= 9.0 {
		badges = append(badges, "⚡ Lightning Dispatcher")
	}
	if creator.EngagementScore >= 9.0 {
		badges = append(badges, "🌊 Engagement Tsunami")
	}

	// Special achievements
	if creator.TotalScore >= 9.0 {
		badges = append(badges, "🩸 Blood Architect")
	}
	if creator.Rank == 1 {
		badges = append(badges, "👑 Lore Sovereign")
	}
	if len(creator.WeeklyPerformance) >= 4 && calculateConsistency(getWeeklyScores(creator)) >= 0.8 {
		badges = append(badges, "💎 Consistency Master")
	}

	creator.Badges = badges
}

func getWeeklyScores(creator *Creator) []float64 {
	var scores []float64
	for _, score := range creator.WeeklyPerformance {
		scores = append(scores, score)
	}
	return scores
}

func updateLeaderboardStats(creators []*Creator) {
	totalScore := 0.0
	activeCount := 0

	for _, creator := range creators {
		totalScore += creator.TotalScore
		// Consider active if updated within last 7 days
		if time.Since(creator.LastUpdated) < 7*24*time.Hour {
			activeCount++
		}
	}

	leaderboardStats.TotalCreators = len(creators)
	leaderboardStats.ActiveCreators = activeCount
	leaderboardStats.AverageScore = math.Round((totalScore/float64(len(creators)))*100) / 100
	leaderboardStats.LastUpdated = time.Now()

	if len(creators) > 0 {
		leaderboardStats.TopPerformer = creators[0].Username
	}
}

func periodicRankingUpdates() {
	ticker := time.NewTicker(30 * time.Minute) // Update every 30 minutes
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			fmt.Println("🔄 Updating creator rankings...")
			simulatePerformanceChanges()
			updateRankings()

			// Notify top performers (could integrate with Discord bot)
			notifyTopPerformers()
		}
	}
}

func simulatePerformanceChanges() {
	for _, creator := range creatorDatabase {
		// Simulate small performance fluctuations
		creator.ViralCoefficient += (rand.Float64() - 0.5) * 0.2
		creator.DispatchEfficiency += (rand.Float64() - 0.5) * 0.15
		creator.EngagementScore += (rand.Float64() - 0.5) * 0.18

		// Keep scores within bounds
		creator.ViralCoefficient = math.Max(0, math.Min(10, creator.ViralCoefficient))
		creator.DispatchEfficiency = math.Max(0, math.Min(10, creator.DispatchEfficiency))
		creator.EngagementScore = math.Max(0, math.Min(10, creator.EngagementScore))

		creator.TotalScore = calculateTotalScore(*creator)
		creator.LastUpdated = time.Now()
	}
}

func notifyTopPerformers() {
	// Get top 3 performers
	var creators []*Creator
	for _, creator := range creatorDatabase {
		creators = append(creators, creator)
	}

	sort.Slice(creators, func(i, j int) bool {
		return creators[i].TotalScore > creators[j].TotalScore
	})

	fmt.Println("🏆 TOP PERFORMERS NOTIFICATION:")
	for i, creator := range creators[:3] {
		fmt.Printf("   #%d: %s (%.2f) - %s %s\n",
			i+1, creator.Username, creator.TotalScore, creator.Tier,
			fmt.Sprintf("Badges: %v", creator.Badges))
	}
}

// 🌐 API Handlers for leaderboard system
func handleGetLeaderboard(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Get sorted creators
	var creators []*Creator
	for _, creator := range creatorDatabase {
		creators = append(creators, creator)
	}

	sort.Slice(creators, func(i, j int) bool {
		return creators[i].TotalScore > creators[j].TotalScore
	})

	response := map[string]interface{}{
		"leaderboard": creators[:min(len(creators), 50)], // Top 50
		"stats":       leaderboardStats,
		"timestamp":   time.Now(),
	}

	json.NewEncoder(w).Encode(response)
}

func handleUpdateCreatorStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var updateData struct {
		CreatorID          string  `json:"creator_id"`
		Username           string  `json:"username,omitempty"`
		ViralCoefficient   float64 `json:"viral_coefficient,omitempty"`
		DispatchEfficiency float64 `json:"dispatch_efficiency,omitempty"`
		EngagementScore    float64 `json:"engagement_score,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	creator, exists := creatorDatabase[updateData.CreatorID]
	if !exists {
		// Create new creator
		creator = &Creator{
			ID:                updateData.CreatorID,
			Username:          updateData.Username,
			WeeklyPerformance: make(map[string]float64),
			LastUpdated:       time.Now(),
		}
		creatorDatabase[updateData.CreatorID] = creator
	}

	// Update stats
	if updateData.ViralCoefficient > 0 {
		creator.ViralCoefficient = updateData.ViralCoefficient
	}
	if updateData.DispatchEfficiency > 0 {
		creator.DispatchEfficiency = updateData.DispatchEfficiency
	}
	if updateData.EngagementScore > 0 {
		creator.EngagementScore = updateData.EngagementScore
	}
	if updateData.Username != "" {
		creator.Username = updateData.Username
	}

	creator.TotalScore = calculateTotalScore(*creator)
	creator.LastUpdated = time.Now()

	// Update rankings
	updateRankings()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":    true,
		"creator":    creator,
		"message":    "Creator stats updated successfully",
		"updated_at": time.Now(),
	})
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// 🚀 Start leaderboard system
func startCreatorLeaderboards() {
	fmt.Println("🏆 Starting Creator Leaderboards System...")

	initializeLeaderboards()

	// Set up HTTP handlers
	http.HandleFunc("/leaderboard", handleGetLeaderboard)
	http.HandleFunc("/leaderboard/update", handleUpdateCreatorStats)

	fmt.Println("✅ Creator Leaderboards running on :8085")
	fmt.Println("   📊 GET  /leaderboard - View current rankings")
	fmt.Println("   📝 POST /leaderboard/update - Update creator stats")
}

func main() {
	fmt.Println("🎯👻 CREATOR LEADERBOARDS & LORE RANKINGS")
	fmt.Println("==========================================")

	// Start the leaderboard system
	startCreatorLeaderboards()

	// Start HTTP server
	log.Fatal(http.ListenAndServe(":8085", nil))
}
