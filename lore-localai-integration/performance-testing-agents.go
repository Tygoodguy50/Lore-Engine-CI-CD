package main

import (
	"fmt"
	"math"
	"math/rand"
	"strings"
	"sync"
	"time"
)

// 🧪 Performance Testing Agents
// Simulate alternate captions and dispatch channels to optimize for viral breakouts

type TestingAgent struct {
	ID            string                 `json:"id"`
	Name          string                 `json:"name"`
	Type          string                 `json:"type"` // caption_optimizer, channel_tester, timing_analyzer, engagement_predictor
	Status        string                 `json:"status"`
	TestsRun      int                    `json:"tests_run"`
	SuccessRate   float64                `json:"success_rate"`
	Insights      []TestInsight          `json:"insights"`
	Configuration AgentConfig            `json:"configuration"`
	LastRun       time.Time              `json:"last_run"`
	Metadata      map[string]interface{} `json:"metadata"`
}

type AgentConfig struct {
	MaxConcurrentTests int                    `json:"max_concurrent_tests"`
	TestDuration       int                    `json:"test_duration_minutes"`
	SampleSize         int                    `json:"sample_size"`
	TargetPlatforms    []string               `json:"target_platforms"`
	VariationTypes     []string               `json:"variation_types"`
	Parameters         map[string]interface{} `json:"parameters"`
}

type TestInsight struct {
	TestID         string                 `json:"test_id"`
	AgentType      string                 `json:"agent_type"`
	Insight        string                 `json:"insight"`
	Confidence     float64                `json:"confidence"`
	ImpactScore    float64                `json:"impact_score"`
	Recommendation string                 `json:"recommendation"`
	Data           map[string]interface{} `json:"data"`
	CreatedAt      time.Time              `json:"created_at"`
}

type PerformanceTest struct {
	ID              string             `json:"id"`
	AgentID         string             `json:"agent_id"`
	Type            string             `json:"type"`
	OriginalContent string             `json:"original_content"`
	Variations      []ContentVariation `json:"variations"`
	Results         []TestResult       `json:"results"`
	Winner          *ContentVariation  `json:"winner"`
	Insights        []TestInsight      `json:"insights"`
	Status          string             `json:"status"`
	CreatedAt       time.Time          `json:"created_at"`
	CompletedAt     *time.Time         `json:"completed_at"`
}

type ContentVariation struct {
	ID             string                 `json:"id"`
	Content        string                 `json:"content"`
	VariationType  string                 `json:"variation_type"`
	Channel        string                 `json:"channel"`
	Timing         time.Time              `json:"timing"`
	PredictedScore float64                `json:"predicted_score"`
	ActualScore    float64                `json:"actual_score"`
	Metadata       map[string]interface{} `json:"metadata"`
}

type TestResult struct {
	VariationID    string             `json:"variation_id"`
	Metrics        PerformanceMetrics `json:"metrics"`
	ViralScore     float64            `json:"viral_score"`
	EngagementRate float64            `json:"engagement_rate"`
	ConversionRate float64            `json:"conversion_rate"`
	ReachPotential float64            `json:"reach_potential"`
	Timestamp      time.Time          `json:"timestamp"`
}

type PerformanceMetrics struct {
	Views          int     `json:"views"`
	Likes          int     `json:"likes"`
	Comments       int     `json:"comments"`
	Shares         int     `json:"shares"`
	ClickThrough   int     `json:"click_through"`
	Conversions    int     `json:"conversions"`
	WatchTime      float64 `json:"watch_time_seconds"`
	RetentionRate  float64 `json:"retention_rate"`
	ViralityFactor float64 `json:"virality_factor"`
}

type TestingSuite struct {
	agents         map[string]*TestingAgent
	activeTests    map[string]*PerformanceTest
	completedTests []*PerformanceTest
	insights       []TestInsight
	mutex          sync.RWMutex
	baseURL        string
}

// NewTestingSuite initializes the performance testing system
func NewTestingSuite(baseURL string) *TestingSuite {
	suite := &TestingSuite{
		agents:         make(map[string]*TestingAgent),
		activeTests:    make(map[string]*PerformanceTest),
		completedTests: []*PerformanceTest{},
		insights:       []TestInsight{},
		baseURL:        baseURL,
	}

	suite.initializeAgents()
	return suite
}

// initializeAgents sets up different types of testing agents
func (ts *TestingSuite) initializeAgents() {
	agents := []*TestingAgent{
		{
			ID:     "caption_optimizer_001",
			Name:   "Caption Optimization Agent",
			Type:   "caption_optimizer",
			Status: "active",
			Configuration: AgentConfig{
				MaxConcurrentTests: 5,
				TestDuration:       30,
				SampleSize:         1000,
				TargetPlatforms:    []string{"tiktok", "instagram", "twitter"},
				VariationTypes:     []string{"hook_variation", "cta_optimization", "hashtag_testing", "length_optimization"},
				Parameters: map[string]interface{}{
					"hook_count":     3,
					"cta_variations": 4,
					"hashtag_limit":  10,
					"min_length":     50,
					"max_length":     300,
				},
			},
		},
		{
			ID:     "channel_tester_001",
			Name:   "Channel Testing Agent",
			Type:   "channel_tester",
			Status: "active",
			Configuration: AgentConfig{
				MaxConcurrentTests: 3,
				TestDuration:       60,
				SampleSize:         2000,
				TargetPlatforms:    []string{"discord", "tiktok", "markdown", "n8n"},
				VariationTypes:     []string{"channel_split", "timing_comparison", "format_testing"},
				Parameters: map[string]interface{}{
					"channel_combinations": 4,
					"timing_windows":       6,
					"format_variations":    3,
				},
			},
		},
		{
			ID:     "timing_analyzer_001",
			Name:   "Timing Analysis Agent",
			Type:   "timing_analyzer",
			Status: "active",
			Configuration: AgentConfig{
				MaxConcurrentTests: 8,
				TestDuration:       120,
				SampleSize:         500,
				TargetPlatforms:    []string{"tiktok", "instagram"},
				VariationTypes:     []string{"peak_hour_testing", "day_comparison", "week_pattern_analysis"},
				Parameters: map[string]interface{}{
					"time_slots":     24,
					"day_variations": 7,
					"week_patterns":  4,
				},
			},
		},
		{
			ID:     "engagement_predictor_001",
			Name:   "Engagement Prediction Agent",
			Type:   "engagement_predictor",
			Status: "active",
			Configuration: AgentConfig{
				MaxConcurrentTests: 10,
				TestDuration:       15,
				SampleSize:         1500,
				TargetPlatforms:    []string{"tiktok", "discord", "instagram"},
				VariationTypes:     []string{"sentiment_analysis", "keyword_density", "viral_pattern_matching"},
				Parameters: map[string]interface{}{
					"sentiment_ranges":  5,
					"keyword_densities": 4,
					"pattern_matches":   8,
				},
			},
		},
	}

	for _, agent := range agents {
		agent.Insights = []TestInsight{}
		agent.Metadata = make(map[string]interface{})
		ts.agents[agent.ID] = agent
	}
}

// RunOptimizationTest runs a comprehensive optimization test
func (ts *TestingSuite) RunOptimizationTest(originalContent string, userID string) (*PerformanceTest, error) {
	ts.mutex.Lock()
	defer ts.mutex.Unlock()

	testID := ts.generateTestID()

	test := &PerformanceTest{
		ID:              testID,
		Type:            "full_optimization",
		OriginalContent: originalContent,
		Variations:      []ContentVariation{},
		Results:         []TestResult{},
		Status:          "running",
		CreatedAt:       time.Now(),
	}

	fmt.Printf("🧪 Starting optimization test %s\n", testID)

	// Generate variations using different agents
	for _, agent := range ts.agents {
		if agent.Status != "active" {
			continue
		}

		variations := ts.generateVariations(agent, originalContent, userID)
		test.Variations = append(test.Variations, variations...)

		fmt.Printf("   %s generated %d variations\n", agent.Name, len(variations))
	}

	ts.activeTests[testID] = test

	// Run tests concurrently
	go ts.executeTest(test)

	return test, nil
}

// generateVariations creates content variations based on agent type
func (ts *TestingSuite) generateVariations(agent *TestingAgent, original string, userID string) []ContentVariation {
	var variations []ContentVariation

	switch agent.Type {
	case "caption_optimizer":
		variations = ts.generateCaptionVariations(agent, original, userID)
	case "channel_tester":
		variations = ts.generateChannelVariations(agent, original, userID)
	case "timing_analyzer":
		variations = ts.generateTimingVariations(agent, original, userID)
	case "engagement_predictor":
		variations = ts.generateEngagementVariations(agent, original, userID)
	}

	return variations
}

// generateCaptionVariations creates different caption optimizations
func (ts *TestingSuite) generateCaptionVariations(agent *TestingAgent, original string, userID string) []ContentVariation {
	var variations []ContentVariation

	// Hook variations
	hooks := []string{
		"⚡ BREAKING:",
		"🔥 This changes everything:",
		"👻 You won't believe this:",
		"🚨 ATTENTION:",
		"💀 WARNING:",
	}

	// CTA variations
	ctas := []string{
		"Drop a 👻 if you felt that",
		"Share this with someone who needs to see it",
		"Follow for more viral secrets",
		"Use code VIRAL for exclusive access",
	}

	// Generate hook + content + cta combinations
	for i, hook := range hooks {
		for j, cta := range ctas {
			if i >= 3 && j >= 3 { // Limit combinations
				break
			}

			variation := ContentVariation{
				ID:             fmt.Sprintf("caption_%s_%d_%d", agent.ID, i, j),
				Content:        fmt.Sprintf("%s %s\n\n%s", hook, original, cta),
				VariationType:  "caption_optimization",
				Channel:        "tiktok",
				Timing:         time.Now().Add(time.Duration(i*5) * time.Minute),
				PredictedScore: 60.0 + rand.Float64()*30.0,
				Metadata: map[string]interface{}{
					"hook_type": hooks[i],
					"cta_type":  ctas[j],
					"user_id":   userID,
					"agent_id":  agent.ID,
				},
			}

			variations = append(variations, variation)
		}
	}

	return variations[:6] // Limit to 6 variations
}

// generateChannelVariations creates different channel distribution tests
func (ts *TestingSuite) generateChannelVariations(agent *TestingAgent, original string, userID string) []ContentVariation {
	var variations []ContentVariation

	channels := []string{"discord", "tiktok", "markdown", "n8n"}

	// Format adaptations for each channel
	formatAdaptations := map[string]string{
		"discord":  "```\n🔮 LORE UPDATE\n%s\n```",
		"tiktok":   "🎬 %s #viral #lore #fyp",
		"markdown": "# Viral Lore Fragment\n\n%s\n\n*Generated by Lore Engine*",
		"n8n":      `{"lore_content": "%s", "viral_optimized": true}`,
	}

	for i, channel := range channels {
		format := formatAdaptations[channel]
		if format == "" {
			format = "%s"
		}

		variation := ContentVariation{
			ID:             fmt.Sprintf("channel_%s_%s_%d", agent.ID, channel, i),
			Content:        fmt.Sprintf(format, original),
			VariationType:  "channel_optimization",
			Channel:        channel,
			Timing:         time.Now().Add(time.Duration(i*10) * time.Minute),
			PredictedScore: 50.0 + rand.Float64()*40.0,
			Metadata: map[string]interface{}{
				"target_channel": channel,
				"format_type":    "optimized",
				"user_id":        userID,
				"agent_id":       agent.ID,
			},
		}

		variations = append(variations, variation)
	}

	return variations
}

// generateTimingVariations creates different timing tests
func (ts *TestingSuite) generateTimingVariations(agent *TestingAgent, original string, userID string) []ContentVariation {
	var variations []ContentVariation

	// Peak engagement times (hours)
	peakTimes := []int{8, 12, 17, 19, 21, 23}

	for i, hour := range peakTimes {
		timing := time.Now().Truncate(time.Hour).Add(time.Duration(hour) * time.Hour)
		if timing.Before(time.Now()) {
			timing = timing.Add(24 * time.Hour) // Next day
		}

		variation := ContentVariation{
			ID:             fmt.Sprintf("timing_%s_%d", agent.ID, i),
			Content:        original,
			VariationType:  "timing_optimization",
			Channel:        "tiktok",
			Timing:         timing,
			PredictedScore: 45.0 + float64(i*5) + rand.Float64()*20.0,
			Metadata: map[string]interface{}{
				"target_hour": hour,
				"timing_type": "peak_optimization",
				"user_id":     userID,
				"agent_id":    agent.ID,
			},
		}

		variations = append(variations, variation)
	}

	return variations[:4] // Limit to 4 timing variations
}

// generateEngagementVariations creates engagement-optimized variations
func (ts *TestingSuite) generateEngagementVariations(agent *TestingAgent, original string, userID string) []ContentVariation {
	var variations []ContentVariation

	// Sentiment modifications
	sentimentMods := map[string]string{
		"urgency":    "🚨 URGENT: %s",
		"mystery":    "🔮 Hidden truth: %s",
		"fear":       "👻 WARNING: %s",
		"curiosity":  "🧐 Did you know: %s",
		"excitement": "🔥 BREAKING: %s",
	}

	i := 0
	for sentiment, template := range sentimentMods {
		if i >= 4 { // Limit variations
			break
		}

		content := fmt.Sprintf(template, original)

		variation := ContentVariation{
			ID:             fmt.Sprintf("engagement_%s_%s", agent.ID, sentiment),
			Content:        content,
			VariationType:  "engagement_optimization",
			Channel:        "tiktok",
			Timing:         time.Now().Add(time.Duration(i*7) * time.Minute),
			PredictedScore: 55.0 + float64(i*8) + rand.Float64()*25.0,
			Metadata: map[string]interface{}{
				"sentiment_type": sentiment,
				"modification":   "emotional_trigger",
				"user_id":        userID,
				"agent_id":       agent.ID,
			},
		}

		variations = append(variations, variation)
		i++
	}

	return variations
}

// executeTest runs the actual performance test
func (ts *TestingSuite) executeTest(test *PerformanceTest) {
	fmt.Printf("🚀 Executing test %s with %d variations\n", test.ID, len(test.Variations))

	var wg sync.WaitGroup
	resultsChan := make(chan TestResult, len(test.Variations))

	// Run variations concurrently
	for _, variation := range test.Variations {
		wg.Add(1)
		go ts.testVariation(variation, resultsChan, &wg)
	}

	// Wait for all tests to complete
	wg.Wait()
	close(resultsChan)

	// Collect results
	for result := range resultsChan {
		test.Results = append(test.Results, result)
	}

	// Analyze results and generate insights
	ts.analyzeTestResults(test)

	// Mark test as completed
	completedAt := time.Now()
	test.CompletedAt = &completedAt
	test.Status = "completed"

	// Move to completed tests
	ts.mutex.Lock()
	delete(ts.activeTests, test.ID)
	ts.completedTests = append(ts.completedTests, test)
	ts.mutex.Unlock()

	fmt.Printf("✅ Test %s completed with %d results\n", test.ID, len(test.Results))
}

// testVariation simulates testing a single content variation
func (ts *TestingSuite) testVariation(variation ContentVariation, resultsChan chan<- TestResult, wg *sync.WaitGroup) {
	defer wg.Done()

	// Simulate test duration
	time.Sleep(time.Duration(1+rand.Intn(3)) * time.Second)

	// Simulate performance metrics based on variation type and predicted score
	metrics := ts.simulatePerformanceMetrics(variation)

	// Calculate actual viral score based on simulated performance
	actualScore := ts.calculateActualViralScore(metrics, variation.PredictedScore)

	result := TestResult{
		VariationID:    variation.ID,
		Metrics:        metrics,
		ViralScore:     actualScore,
		EngagementRate: ts.calculateEngagementRate(metrics),
		ConversionRate: ts.calculateConversionRate(metrics),
		ReachPotential: ts.calculateReachPotential(metrics),
		Timestamp:      time.Now(),
	}

	resultsChan <- result

	fmt.Printf("   📊 Tested %s: Score %.1f (predicted %.1f)\n",
		variation.ID, actualScore, variation.PredictedScore)
}

// simulatePerformanceMetrics generates realistic performance data
func (ts *TestingSuite) simulatePerformanceMetrics(variation ContentVariation) PerformanceMetrics {
	baseViews := 1000 + rand.Intn(5000)

	// Adjust base views based on variation type
	switch variation.VariationType {
	case "caption_optimization":
		baseViews = int(float64(baseViews) * (1.0 + rand.Float64()*0.5))
	case "channel_optimization":
		baseViews = int(float64(baseViews) * (0.8 + rand.Float64()*0.6))
	case "timing_optimization":
		baseViews = int(float64(baseViews) * (0.9 + rand.Float64()*0.4))
	case "engagement_optimization":
		baseViews = int(float64(baseViews) * (1.1 + rand.Float64()*0.8))
	}

	likes := int(float64(baseViews) * (0.05 + rand.Float64()*0.1))
	comments := int(float64(likes) * (0.1 + rand.Float64()*0.2))
	shares := int(float64(likes) * (0.05 + rand.Float64()*0.15))
	clickThrough := int(float64(baseViews) * (0.02 + rand.Float64()*0.08))
	conversions := int(float64(clickThrough) * (0.1 + rand.Float64()*0.3))

	return PerformanceMetrics{
		Views:          baseViews,
		Likes:          likes,
		Comments:       comments,
		Shares:         shares,
		ClickThrough:   clickThrough,
		Conversions:    conversions,
		WatchTime:      15.0 + rand.Float64()*45.0,
		RetentionRate:  0.3 + rand.Float64()*0.5,
		ViralityFactor: rand.Float64() * 2.0,
	}
}

// calculateActualViralScore computes viral score from metrics
func (ts *TestingSuite) calculateActualViralScore(metrics PerformanceMetrics, predicted float64) float64 {
	// Engagement score
	engagementScore := 0.0
	if metrics.Views > 0 {
		engagements := metrics.Likes + metrics.Comments + metrics.Shares
		engagementScore = (float64(engagements) / float64(metrics.Views)) * 100
	}

	// Virality factor
	viralityScore := metrics.ViralityFactor * 25

	// Conversion score
	conversionScore := 0.0
	if metrics.ClickThrough > 0 {
		conversionScore = (float64(metrics.Conversions) / float64(metrics.ClickThrough)) * 50
	}

	// Retention score
	retentionScore := metrics.RetentionRate * 50

	// Combine scores with prediction influence
	rawScore := (engagementScore*0.3 + viralityScore*0.3 + conversionScore*0.2 + retentionScore*0.2)

	// Factor in prediction accuracy
	actualScore := (rawScore * 0.7) + (predicted * 0.3)

	return math.Min(actualScore, 100.0)
}

// calculateEngagementRate calculates engagement rate from metrics
func (ts *TestingSuite) calculateEngagementRate(metrics PerformanceMetrics) float64 {
	if metrics.Views == 0 {
		return 0.0
	}
	engagements := metrics.Likes + metrics.Comments + metrics.Shares
	return (float64(engagements) / float64(metrics.Views)) * 100
}

// calculateConversionRate calculates conversion rate
func (ts *TestingSuite) calculateConversionRate(metrics PerformanceMetrics) float64 {
	if metrics.ClickThrough == 0 {
		return 0.0
	}
	return (float64(metrics.Conversions) / float64(metrics.ClickThrough)) * 100
}

// calculateReachPotential estimates potential reach
func (ts *TestingSuite) calculateReachPotential(metrics PerformanceMetrics) float64 {
	baseReach := float64(metrics.Views)
	viralMultiplier := 1.0 + (metrics.ViralityFactor * 2.0)
	shareMultiplier := 1.0 + (float64(metrics.Shares) / float64(metrics.Views) * 10.0)

	return baseReach * viralMultiplier * shareMultiplier
}

// analyzeTestResults performs analysis and generates insights
func (ts *TestingSuite) analyzeTestResults(test *PerformanceTest) {
	if len(test.Results) == 0 {
		return
	}

	// Find best performing variation
	var bestResult TestResult
	bestScore := 0.0

	for _, result := range test.Results {
		if result.ViralScore > bestScore {
			bestScore = result.ViralScore
			bestResult = result
		}
	}

	// Find corresponding variation
	for _, variation := range test.Variations {
		if variation.ID == bestResult.VariationID {
			test.Winner = &variation
			break
		}
	}

	// Generate insights by variation type
	insights := ts.generateTestInsights(test)
	test.Insights = insights

	// Store insights globally
	ts.mutex.Lock()
	ts.insights = append(ts.insights, insights...)
	ts.mutex.Unlock()

	fmt.Printf("🏆 Best performing variation: %s (Score: %.1f)\n",
		bestResult.VariationID, bestResult.ViralScore)
}

// generateTestInsights creates actionable insights from test results
func (ts *TestingSuite) generateTestInsights(test *PerformanceTest) []TestInsight {
	var insights []TestInsight

	// Analyze by variation type
	typePerformance := make(map[string][]float64)

	for _, result := range test.Results {
		// Find variation type
		for _, variation := range test.Variations {
			if variation.ID == result.VariationID {
				typePerformance[variation.VariationType] = append(
					typePerformance[variation.VariationType], result.ViralScore)
				break
			}
		}
	}

	// Generate insights for each type
	for varType, scores := range typePerformance {
		avgScore := ts.calculateAverage(scores)
		maxScore := ts.calculateMax(scores)

		insight := TestInsight{
			TestID:    test.ID,
			AgentType: varType,
			Insight: fmt.Sprintf("%s variations averaged %.1f viral score (max: %.1f)",
				strings.Title(strings.ReplaceAll(varType, "_", " ")), avgScore, maxScore),
			Confidence:     ts.calculateConfidence(scores),
			ImpactScore:    maxScore - avgScore,
			Recommendation: ts.generateRecommendation(varType, avgScore, maxScore),
			Data: map[string]interface{}{
				"average_score": avgScore,
				"max_score":     maxScore,
				"sample_size":   len(scores),
				"scores":        scores,
			},
			CreatedAt: time.Now(),
		}

		insights = append(insights, insight)
	}

	return insights
}

// Helper calculation functions
func (ts *TestingSuite) calculateAverage(scores []float64) float64 {
	if len(scores) == 0 {
		return 0.0
	}
	total := 0.0
	for _, score := range scores {
		total += score
	}
	return total / float64(len(scores))
}

func (ts *TestingSuite) calculateMax(scores []float64) float64 {
	if len(scores) == 0 {
		return 0.0
	}
	max := scores[0]
	for _, score := range scores {
		if score > max {
			max = score
		}
	}
	return max
}

func (ts *TestingSuite) calculateConfidence(scores []float64) float64 {
	if len(scores) < 2 {
		return 0.5
	}

	// Simple confidence based on sample size and score variance
	sampleConfidence := math.Min(float64(len(scores))/10.0, 1.0)

	// Calculate variance for consistency confidence
	avg := ts.calculateAverage(scores)
	variance := 0.0
	for _, score := range scores {
		variance += (score - avg) * (score - avg)
	}
	variance /= float64(len(scores))

	consistencyConfidence := math.Max(0.0, 1.0-(variance/500.0))

	return (sampleConfidence + consistencyConfidence) / 2.0
}

func (ts *TestingSuite) generateRecommendation(varType string, avgScore, maxScore float64) string {
	impact := maxScore - avgScore

	recommendations := map[string]map[string]string{
		"caption_optimization": {
			"high":   "Focus on emotional triggers and strong CTAs - they show %.1f point improvement",
			"medium": "Caption variations show promise - test more hook styles",
			"low":    "Caption changes have minimal impact - focus on other optimization areas",
		},
		"channel_optimization": {
			"high":   "Channel selection is crucial - optimal channels show %.1f point boost",
			"medium": "Some channels perform better - prioritize top-performing distribution",
			"low":    "Channel impact is limited - content quality is more important",
		},
		"timing_optimization": {
			"high":   "Timing makes a significant difference - schedule during peak windows for %.1f point gain",
			"medium": "Time-of-day affects performance - optimize posting schedule",
			"low":    "Timing has minimal impact - focus on content and channels instead",
		},
		"engagement_optimization": {
			"high":   "Engagement triggers are highly effective - emotional content scores %.1f points higher",
			"medium": "Engagement optimization shows results - continue emotional content testing",
			"low":    "Engagement modifications show little effect - try different approaches",
		},
	}

	var impactLevel string
	if impact > 15.0 {
		impactLevel = "high"
	} else if impact > 8.0 {
		impactLevel = "medium"
	} else {
		impactLevel = "low"
	}

	template := recommendations[varType][impactLevel]
	if template == "" {
		template = "Continue testing - results show potential for optimization"
	}

	return fmt.Sprintf(template, impact)
}

func (ts *TestingSuite) generateTestID() string {
	return fmt.Sprintf("test_%d_%d", time.Now().Unix(), rand.Intn(1000))
}

// GetTestingSummary provides an overview of all testing activity
func (ts *TestingSuite) GetTestingSummary() map[string]interface{} {
	ts.mutex.RLock()
	defer ts.mutex.RUnlock()

	activeCount := len(ts.activeTests)
	completedCount := len(ts.completedTests)
	totalInsights := len(ts.insights)

	// Calculate agent statistics
	agentStats := make(map[string]interface{})
	for agentID, agent := range ts.agents {
		agentStats[agentID] = map[string]interface{}{
			"name":         agent.Name,
			"type":         agent.Type,
			"status":       agent.Status,
			"tests_run":    agent.TestsRun,
			"success_rate": agent.SuccessRate,
			"insights":     len(agent.Insights),
		}
	}

	// Calculate performance trends
	avgViralScores := make(map[string]float64)
	if completedCount > 0 {
		for _, test := range ts.completedTests {
			if test.Winner != nil {
				avgViralScores[test.Winner.VariationType] += test.Winner.ActualScore
			}
		}

		for varType, total := range avgViralScores {
			count := 0
			for _, test := range ts.completedTests {
				if test.Winner != nil && test.Winner.VariationType == varType {
					count++
				}
			}
			if count > 0 {
				avgViralScores[varType] = total / float64(count)
			}
		}
	}

	return map[string]interface{}{
		"active_tests":       activeCount,
		"completed_tests":    completedCount,
		"total_insights":     totalInsights,
		"agent_stats":        agentStats,
		"performance_trends": avgViralScores,
		"last_updated":       time.Now(),
	}
}

// TestPerformanceTestingAgents demonstrates the testing system
func TestPerformanceTestingAgents() {
	fmt.Println("🧪 Performance Testing Agents - Test Suite")
	fmt.Println("===========================================")

	suite := NewTestingSuite("http://localhost:8084")

	// Test content for optimization
	testContent := "The ancient algorithms whisper through digital dimensions, awakening spectral code fragments that pulse with viral energy..."

	fmt.Printf("📝 Original Content: %s\n\n", testContent[:80]+"...")

	// Run optimization test
	test, err := suite.RunOptimizationTest(testContent, "test_user_001")
	if err != nil {
		fmt.Printf("❌ Test failed: %v\n", err)
		return
	}

	// Wait for test completion
	fmt.Println("⏳ Waiting for test completion...")

	for test.Status == "running" {
		time.Sleep(2 * time.Second)
		fmt.Print(".")
	}

	fmt.Printf("\n✅ Test %s completed!\n\n", test.ID)

	// Display results
	fmt.Printf("📊 Test Results Summary:\n")
	fmt.Printf("   Total Variations Tested: %d\n", len(test.Results))
	fmt.Printf("   Best Performing Score: %.1f\n", test.Winner.ActualScore)
	fmt.Printf("   Winner Type: %s\n", test.Winner.VariationType)
	fmt.Printf("   Winner Content: %s...\n", test.Winner.Content[:80])

	fmt.Printf("\n🔍 Generated Insights:\n")
	for _, insight := range test.Insights {
		fmt.Printf("   📈 %s\n", insight.Insight)
		fmt.Printf("      Confidence: %.1f%% | Impact: %.1f\n", insight.Confidence*100, insight.ImpactScore)
		fmt.Printf("      Recommendation: %s\n\n", insight.Recommendation)
	}

	// Display agent statistics
	summary := suite.GetTestingSummary()
	fmt.Printf("🤖 Agent Performance Summary:\n")

	if agentStats, ok := summary["agent_stats"].(map[string]interface{}); ok {
		for agentID, stats := range agentStats {
			if statMap, ok := stats.(map[string]interface{}); ok {
				fmt.Printf("   %s: %s (%s)\n",
					agentID, statMap["name"], statMap["status"])
			}
		}
	}

	fmt.Printf("\n📈 Performance Trends:\n")
	if trends, ok := summary["performance_trends"].(map[string]float64); ok {
		for varType, avgScore := range trends {
			fmt.Printf("   %s: %.1f avg score\n",
				strings.Title(strings.ReplaceAll(varType, "_", " ")), avgScore)
		}
	}

	fmt.Println("\n✅ Performance testing agents test completed!")
}

func main() {
	// Set random seed for consistent testing
	rand.Seed(time.Now().UnixNano())

	TestPerformanceTestingAgents()
}
