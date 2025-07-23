package main

import (
	"fmt"
	"math"
	"sort"
	"strings"
	"time"
)

// 📊 Leaderboards System
// Ranks creators by viral coefficient, dispatch efficiency, and lore resonance

type CreatorProfile struct {
	UserID           string                 `json:"user_id"`
	Username         string                 `json:"username"`
	Tier             string                 `json:"tier"`
	Level            int                    `json:"level"`
	TotalFragments   int                    `json:"total_fragments"`
	ViralCoefficient float64                `json:"viral_coefficient"`
	DispatchEff      float64                `json:"dispatch_efficiency"`
	LoreResonance    float64                `json:"lore_resonance"`
	OverallScore     float64                `json:"overall_score"`
	Achievements     []Achievement          `json:"achievements"`
	Stats            CreatorStats           `json:"stats"`
	Badges           []Badge                `json:"badges"`
	Metadata         map[string]interface{} `json:"metadata"`
	LastActive       time.Time              `json:"last_active"`
	JoinedAt         time.Time              `json:"joined_at"`
}

type CreatorStats struct {
	TotalViews         int     `json:"total_views"`
	TotalEngagements   int     `json:"total_engagements"`
	TotalShares        int     `json:"total_shares"`
	TotalReferrals     int     `json:"total_referrals"`
	SuccessfulLaunches int     `json:"successful_launches"`
	FailedDispatches   int     `json:"failed_dispatches"`
	AvgViralScore      float64 `json:"avg_viral_score"`
	TopPerformingPost  string  `json:"top_performing_post"`
	ConsistencyScore   float64 `json:"consistency_score"`
	GrowthRate         float64 `json:"growth_rate"`
}

type Achievement struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Icon        string    `json:"icon"`
	Rarity      string    `json:"rarity"`
	UnlockedAt  time.Time `json:"unlocked_at"`
	Points      int       `json:"points"`
}

type Badge struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Color       string `json:"color"`
	Icon        string `json:"icon"`
	Level       int    `json:"level"`
}

type Leaderboard struct {
	Type        string           `json:"type"`
	Title       string           `json:"title"`
	Description string           `json:"description"`
	Rankings    []CreatorProfile `json:"rankings"`
	UpdatedAt   time.Time        `json:"updated_at"`
	Season      string           `json:"season"`
	TotalUsers  int              `json:"total_users"`
}

type LeaderboardManager struct {
	creators     map[string]*CreatorProfile
	achievements map[string]Achievement
	badges       map[string]Badge
}

// NewLeaderboardManager initializes the leaderboard system
func NewLeaderboardManager() *LeaderboardManager {
	lm := &LeaderboardManager{
		creators:     make(map[string]*CreatorProfile),
		achievements: make(map[string]Achievement),
		badges:       make(map[string]Badge),
	}

	lm.initializeAchievements()
	lm.initializeBadges()
	lm.seedTestData()

	return lm
}

// initializeAchievements sets up the achievement system
func (lm *LeaderboardManager) initializeAchievements() {
	achievements := []Achievement{
		{
			ID: "first_viral", Name: "First Blood",
			Description: "First fragment to go viral", Icon: "🩸",
			Rarity: "common", Points: 100,
		},
		{
			ID: "viral_tsunami", Name: "Viral Tsunami",
			Description: "Fragment reached 100k+ views", Icon: "🌊",
			Rarity: "rare", Points: 500,
		},
		{
			ID: "phantom_lord", Name: "Phantom Lord",
			Description: "Achieved Ghost Tier status", Icon: "👻",
			Rarity: "legendary", Points: 1000,
		},
		{
			ID: "consistency_king", Name: "Consistency King",
			Description: "10 successful launches in a row", Icon: "👑",
			Rarity: "epic", Points: 750,
		},
		{
			ID: "viral_velocity", Name: "Viral Velocity",
			Description: "Fragment went viral in under 1 hour", Icon: "⚡",
			Rarity: "rare", Points: 400,
		},
		{
			ID: "cross_platform_conqueror", Name: "Cross-Platform Conqueror",
			Description: "Fragment succeeded on 5+ platforms", Icon: "🌐",
			Rarity: "epic", Points: 600,
		},
		{
			ID: "referral_master", Name: "Referral Master",
			Description: "Generated 1000+ referrals", Icon: "🧬",
			Rarity: "legendary", Points: 1200,
		},
		{
			ID: "lore_sage", Name: "Lore Sage",
			Description: "Perfect lore resonance score", Icon: "🔮",
			Rarity: "mythic", Points: 2000,
		},
	}

	for _, achievement := range achievements {
		lm.achievements[achievement.ID] = achievement
	}
}

// initializeBadges sets up the badge system
func (lm *LeaderboardManager) initializeBadges() {
	badges := []Badge{
		{ID: "viral_rookie", Name: "Viral Rookie", Description: "Getting started", Color: "#bronze", Icon: "🥉", Level: 1},
		{ID: "content_crusher", Name: "Content Crusher", Description: "Crushing it", Color: "#silver", Icon: "🥈", Level: 2},
		{ID: "phantom_force", Name: "Phantom Force", Description: "Phantom level", Color: "#gold", Icon: "🥇", Level: 3},
		{ID: "ghost_tier_god", Name: "Ghost Tier God", Description: "Ultimate status", Color: "#diamond", Icon: "💎", Level: 4},
		{ID: "algorithm_whisperer", Name: "Algorithm Whisperer", Description: "Masters the algorithms", Color: "#mystic", Icon: "🔮", Level: 3},
		{ID: "engagement_emperor", Name: "Engagement Emperor", Description: "Rules engagement", Color: "#royal", Icon: "👑", Level: 4},
	}

	for _, badge := range badges {
		lm.badges[badge.ID] = badge
	}
}

// UpdateCreatorMetrics updates creator performance metrics
func (lm *LeaderboardManager) UpdateCreatorMetrics(userID, username string, metrics map[string]interface{}) {
	creator, exists := lm.creators[userID]
	if !exists {
		creator = &CreatorProfile{
			UserID:   userID,
			Username: username,
			JoinedAt: time.Now(),
			Tier:     "shadow",
			Level:    1,
			Stats:    CreatorStats{},
			Metadata: make(map[string]interface{}),
		}
		lm.creators[userID] = creator
	}

	// Update metrics
	if views, ok := metrics["views"].(float64); ok {
		creator.Stats.TotalViews += int(views)
	}
	if engagements, ok := metrics["engagements"].(float64); ok {
		creator.Stats.TotalEngagements += int(engagements)
	}
	if shares, ok := metrics["shares"].(float64); ok {
		creator.Stats.TotalShares += int(shares)
	}
	if referrals, ok := metrics["referrals"].(float64); ok {
		creator.Stats.TotalReferrals += int(referrals)
	}
	if viralScore, ok := metrics["viral_score"].(float64); ok {
		creator.Stats.AvgViralScore = (creator.Stats.AvgViralScore + viralScore) / 2
	}

	creator.TotalFragments++
	creator.Stats.SuccessfulLaunches++
	creator.LastActive = time.Now()

	// Recalculate core metrics
	lm.calculateMetrics(creator)
	lm.updateTierAndLevel(creator)
	lm.checkAchievements(creator)

	fmt.Printf("📊 Updated metrics for %s: Viral=%.2f, Efficiency=%.2f, Resonance=%.2f\n",
		username, creator.ViralCoefficient, creator.DispatchEff, creator.LoreResonance)
}

// calculateMetrics calculates the three core leaderboard metrics
func (lm *LeaderboardManager) calculateMetrics(creator *CreatorProfile) {
	// Viral Coefficient: How viral the content spreads
	if creator.Stats.TotalViews > 0 {
		creator.ViralCoefficient = float64(creator.Stats.TotalShares) / float64(creator.Stats.TotalViews) * 100
		if creator.Stats.TotalReferrals > 0 {
			creator.ViralCoefficient += float64(creator.Stats.TotalReferrals) * 0.1
		}
	}

	// Dispatch Efficiency: Success rate of content launches
	totalAttempts := creator.Stats.SuccessfulLaunches + creator.Stats.FailedDispatches
	if totalAttempts > 0 {
		creator.DispatchEff = (float64(creator.Stats.SuccessfulLaunches) / float64(totalAttempts)) * 100
	}

	// Lore Resonance: Quality and consistency of content
	baseResonance := creator.Stats.AvgViralScore

	// Engagement factor
	if creator.Stats.TotalViews > 0 {
		engagementRate := float64(creator.Stats.TotalEngagements) / float64(creator.Stats.TotalViews)
		baseResonance += engagementRate * 50
	}

	// Consistency bonus
	consistencyBonus := creator.Stats.ConsistencyScore * 10
	creator.LoreResonance = math.Min(baseResonance+consistencyBonus, 100.0)

	// Overall Score (weighted combination)
	creator.OverallScore = (creator.ViralCoefficient * 0.4) +
		(creator.DispatchEff * 0.3) +
		(creator.LoreResonance * 0.3)
}

// updateTierAndLevel updates creator tier and level based on performance
func (lm *LeaderboardManager) updateTierAndLevel(creator *CreatorProfile) {
	// Update tier based on overall score
	if creator.OverallScore >= 90 {
		creator.Tier = "ghost"
	} else if creator.OverallScore >= 70 {
		creator.Tier = "phantom"
	} else if creator.OverallScore >= 50 {
		creator.Tier = "wraith"
	} else {
		creator.Tier = "shadow"
	}

	// Update level based on total experience
	experience := creator.Stats.TotalViews/1000 + creator.Stats.TotalReferrals*2 + creator.Stats.SuccessfulLaunches*10
	creator.Level = 1 + (experience / 100)
	if creator.Level > 100 {
		creator.Level = 100
	}

	// Assign tier-specific badges
	lm.assignBadges(creator)
}

// assignBadges assigns badges based on creator achievements
func (lm *LeaderboardManager) assignBadges(creator *CreatorProfile) {
	creator.Badges = []Badge{} // Reset badges

	// Tier-based badges
	switch creator.Tier {
	case "ghost":
		creator.Badges = append(creator.Badges, lm.badges["ghost_tier_god"])
		fallthrough
	case "phantom":
		creator.Badges = append(creator.Badges, lm.badges["phantom_force"])
		fallthrough
	case "wraith":
		creator.Badges = append(creator.Badges, lm.badges["content_crusher"])
		fallthrough
	default:
		creator.Badges = append(creator.Badges, lm.badges["viral_rookie"])
	}

	// Performance-based badges
	if creator.ViralCoefficient > 80 {
		creator.Badges = append(creator.Badges, lm.badges["algorithm_whisperer"])
	}
	if creator.Stats.TotalEngagements > 10000 {
		creator.Badges = append(creator.Badges, lm.badges["engagement_emperor"])
	}
}

// checkAchievements checks and awards achievements
func (lm *LeaderboardManager) checkAchievements(creator *CreatorProfile) {
	existingAchievements := make(map[string]bool)
	for _, achievement := range creator.Achievements {
		existingAchievements[achievement.ID] = true
	}

	// Check for new achievements
	if creator.Stats.AvgViralScore > 50 && !existingAchievements["first_viral"] {
		achievement := lm.achievements["first_viral"]
		achievement.UnlockedAt = time.Now()
		creator.Achievements = append(creator.Achievements, achievement)
		fmt.Printf("🏆 %s unlocked achievement: %s %s\n", creator.Username, achievement.Icon, achievement.Name)
	}

	if creator.Stats.TotalViews > 100000 && !existingAchievements["viral_tsunami"] {
		achievement := lm.achievements["viral_tsunami"]
		achievement.UnlockedAt = time.Now()
		creator.Achievements = append(creator.Achievements, achievement)
		fmt.Printf("🏆 %s unlocked achievement: %s %s\n", creator.Username, achievement.Icon, achievement.Name)
	}

	if creator.Tier == "ghost" && !existingAchievements["phantom_lord"] {
		achievement := lm.achievements["phantom_lord"]
		achievement.UnlockedAt = time.Now()
		creator.Achievements = append(creator.Achievements, achievement)
		fmt.Printf("🏆 %s unlocked achievement: %s %s\n", creator.Username, achievement.Icon, achievement.Name)
	}

	if creator.Stats.TotalReferrals > 1000 && !existingAchievements["referral_master"] {
		achievement := lm.achievements["referral_master"]
		achievement.UnlockedAt = time.Now()
		creator.Achievements = append(creator.Achievements, achievement)
		fmt.Printf("🏆 %s unlocked achievement: %s %s\n", creator.Username, achievement.Icon, achievement.Name)
	}

	if creator.LoreResonance >= 95 && !existingAchievements["lore_sage"] {
		achievement := lm.achievements["lore_sage"]
		achievement.UnlockedAt = time.Now()
		creator.Achievements = append(creator.Achievements, achievement)
		fmt.Printf("🏆 %s unlocked achievement: %s %s\n", creator.Username, achievement.Icon, achievement.Name)
	}
}

// GetLeaderboard generates different types of leaderboards
func (lm *LeaderboardManager) GetLeaderboard(leaderboardType string) Leaderboard {
	creators := make([]CreatorProfile, 0, len(lm.creators))
	for _, creator := range lm.creators {
		creators = append(creators, *creator)
	}

	var title, description string

	// Sort based on leaderboard type
	switch leaderboardType {
	case "viral":
		title = "🌊 Viral Coefficient Leaders"
		description = "Creators with the highest viral spread rates"
		sort.Slice(creators, func(i, j int) bool {
			return creators[i].ViralCoefficient > creators[j].ViralCoefficient
		})
	case "efficiency":
		title = "⚡ Dispatch Efficiency Champions"
		description = "Creators with the best launch success rates"
		sort.Slice(creators, func(i, j int) bool {
			return creators[i].DispatchEff > creators[j].DispatchEff
		})
	case "resonance":
		title = "🔮 Lore Resonance Masters"
		description = "Creators with the highest content quality scores"
		sort.Slice(creators, func(i, j int) bool {
			return creators[i].LoreResonance > creators[j].LoreResonance
		})
	default: // overall
		title = "👑 Overall Leaderboard"
		description = "Top creators by combined performance metrics"
		sort.Slice(creators, func(i, j int) bool {
			return creators[i].OverallScore > creators[j].OverallScore
		})
	}

	// Limit to top 25
	if len(creators) > 25 {
		creators = creators[:25]
	}

	return Leaderboard{
		Type:        leaderboardType,
		Title:       title,
		Description: description,
		Rankings:    creators,
		UpdatedAt:   time.Now(),
		Season:      fmt.Sprintf("Season %d", time.Now().Year()),
		TotalUsers:  len(lm.creators),
	}
}

// DisplayLeaderboard formats and displays a leaderboard
func (lm *LeaderboardManager) DisplayLeaderboard(leaderboard Leaderboard) {
	fmt.Printf("\n%s\n", leaderboard.Title)
	fmt.Println(strings.Repeat("=", len(leaderboard.Title)))
	fmt.Printf("%s\n", leaderboard.Description)
	fmt.Printf("Updated: %s | Total Users: %d\n\n",
		leaderboard.UpdatedAt.Format("2006-01-02 15:04:05"), leaderboard.TotalUsers)

	for i, creator := range leaderboard.Rankings {
		rank := i + 1
		var rankIcon string
		switch rank {
		case 1:
			rankIcon = "🥇"
		case 2:
			rankIcon = "🥈"
		case 3:
			rankIcon = "🥉"
		default:
			rankIcon = fmt.Sprintf("%d.", rank)
		}

		tierIcon := lm.getTierIcon(creator.Tier)

		fmt.Printf("%s %s %s %s (Level %d)\n",
			rankIcon, tierIcon, creator.Username, strings.ToUpper(creator.Tier), creator.Level)

		switch leaderboard.Type {
		case "viral":
			fmt.Printf("    Viral Coefficient: %.2f | Fragments: %d | Referrals: %d\n",
				creator.ViralCoefficient, creator.TotalFragments, creator.Stats.TotalReferrals)
		case "efficiency":
			fmt.Printf("    Dispatch Efficiency: %.1f%% | Successes: %d | Failures: %d\n",
				creator.DispatchEff, creator.Stats.SuccessfulLaunches, creator.Stats.FailedDispatches)
		case "resonance":
			fmt.Printf("    Lore Resonance: %.1f | Avg Viral Score: %.1f | Engagements: %d\n",
				creator.LoreResonance, creator.Stats.AvgViralScore, creator.Stats.TotalEngagements)
		default:
			fmt.Printf("    Overall Score: %.1f | Viral: %.1f | Efficiency: %.1f%% | Resonance: %.1f\n",
				creator.OverallScore, creator.ViralCoefficient, creator.DispatchEff, creator.LoreResonance)
		}

		// Show badges
		if len(creator.Badges) > 0 {
			fmt.Print("    Badges: ")
			for _, badge := range creator.Badges {
				fmt.Printf("%s", badge.Icon)
			}
			fmt.Println()
		}

		// Show top achievements
		if len(creator.Achievements) > 0 {
			fmt.Print("    Achievements: ")
			count := 0
			for _, achievement := range creator.Achievements {
				if count < 3 {
					fmt.Printf("%s", achievement.Icon)
					count++
				}
			}
			if len(creator.Achievements) > 3 {
				fmt.Printf(" +%d more", len(creator.Achievements)-3)
			}
			fmt.Println()
		}

		fmt.Println()
	}
}

// getTierIcon returns the appropriate icon for a tier
func (lm *LeaderboardManager) getTierIcon(tier string) string {
	icons := map[string]string{
		"shadow":  "🌑",
		"wraith":  "👻",
		"phantom": "🔮",
		"ghost":   "👑",
	}
	if icon, exists := icons[tier]; exists {
		return icon
	}
	return "⚫"
}

// seedTestData creates test data for demonstration
func (lm *LeaderboardManager) seedTestData() {
	testUsers := []map[string]interface{}{
		{
			"userID": "user001", "username": "ShadowMaster",
			"views": 50000.0, "engagements": 2500.0, "shares": 500.0, "referrals": 150.0, "viral_score": 75.0,
		},
		{
			"userID": "user002", "username": "PhantomLore",
			"views": 120000.0, "engagements": 8000.0, "shares": 1200.0, "referrals": 400.0, "viral_score": 85.0,
		},
		{
			"userID": "user003", "username": "GhostWhisperer",
			"views": 200000.0, "engagements": 15000.0, "shares": 2500.0, "referrals": 800.0, "viral_score": 92.0,
		},
		{
			"userID": "user004", "username": "ViralSage",
			"views": 350000.0, "engagements": 25000.0, "shares": 5000.0, "referrals": 1500.0, "viral_score": 98.0,
		},
		{
			"userID": "user005", "username": "SpectrumCrafter",
			"views": 75000.0, "engagements": 4000.0, "shares": 750.0, "referrals": 200.0, "viral_score": 80.0,
		},
	}

	for _, userData := range testUsers {
		for i := 0; i < 5; i++ { // Simulate multiple updates
			lm.UpdateCreatorMetrics(
				userData["userID"].(string),
				userData["username"].(string),
				userData,
			)
		}
	}
}

// TestLeaderboardSystem demonstrates the leaderboard functionality
func TestLeaderboardSystem() {
	fmt.Println("📊 Leaderboard System - Test Suite")
	fmt.Println("===================================")

	manager := NewLeaderboardManager()

	// Display different leaderboards
	leaderboardTypes := []string{"overall", "viral", "efficiency", "resonance"}

	for _, lbType := range leaderboardTypes {
		leaderboard := manager.GetLeaderboard(lbType)
		manager.DisplayLeaderboard(leaderboard)
		time.Sleep(1 * time.Second) // Pause between displays
	}

	fmt.Println("✅ Leaderboard system test completed!")
}

func main() {
	TestLeaderboardSystem()
}
