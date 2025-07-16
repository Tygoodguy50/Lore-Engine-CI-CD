package hooks

import (
	"fmt"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/sirupsen/logrus"
)

// LiveMetricsCollector collects and aggregates live metrics for the lore system
type LiveMetricsCollector struct {
	logger *logrus.Logger
	mutex  sync.RWMutex

	// Integration metrics
	integrationHits     map[string]int64
	integrationFailures map[string]int64
	integrationLatency  map[string][]time.Duration

	// Event metrics
	eventTypes      map[string]int64
	failedEvents    []FailedEvent
	maxFailedEvents int

	// Lore content metrics
	cursedTopics     map[string]CursedTopicMetrics
	loreSentimentMap map[string]SentimentMetrics
	loreEvolution    map[string]EvolutionMetrics

	// Performance metrics
	totalEvents        int64
	avgProcessingTime  time.Duration
	peakConcurrency    int
	currentConcurrency int

	// Time-based metrics
	hourlyStats map[string]HourlyMetrics
	dailyStats  map[string]DailyMetrics

	// Real-time metrics
	realtimeMetrics RealtimeMetrics
	metricsHistory  []MetricsSnapshot
	maxHistorySize  int

	// Integration with external systems
	grafanaEnabled    bool
	n8nWebhookURL     string
	prometheusEnabled bool

	// Configuration
	collectInterval       time.Duration
	retentionPeriod       time.Duration
	cursedTopicTracking   bool
	sentimentAnalysis     bool
	evolutionTracking     bool
	performanceMonitoring bool
}

// FailedEvent represents a failed event with detailed information
type FailedEvent struct {
	ID          string                 `json:"id"`
	Type        string                 `json:"type"`
	Timestamp   time.Time              `json:"timestamp"`
	Error       string                 `json:"error"`
	Integration string                 `json:"integration"`
	Content     string                 `json:"content"`
	Metadata    map[string]interface{} `json:"metadata"`
	Retries     int                    `json:"retries"`
	Resolved    bool                   `json:"resolved"`
}

// CursedTopicMetrics tracks cursed content by topic
type CursedTopicMetrics struct {
	Topic          string    `json:"topic"`
	CursedCount    int64     `json:"cursed_count"`
	TotalEvents    int64     `json:"total_events"`
	AvgCursedLevel float64   `json:"avg_cursed_level"`
	MaxCursedLevel int       `json:"max_cursed_level"`
	LastSeen       time.Time `json:"last_seen"`
	TopUsers       []string  `json:"top_users"`
	CursedPhrases  []string  `json:"cursed_phrases"`
	TrendDirection string    `json:"trend_direction"` // "rising", "falling", "stable"
}

// SentimentMetrics tracks sentiment analysis across lore content
type SentimentMetrics struct {
	Topic            string           `json:"topic"`
	PositiveCount    int64            `json:"positive_count"`
	NegativeCount    int64            `json:"negative_count"`
	NeutralCount     int64            `json:"neutral_count"`
	AvgSentiment     float64          `json:"avg_sentiment"`
	SentimentHistory []SentimentPoint `json:"sentiment_history"`
	EmotionBreakdown map[string]int64 `json:"emotion_breakdown"`
	LastUpdated      time.Time        `json:"last_updated"`
}

// SentimentPoint represents a point in sentiment history
type SentimentPoint struct {
	Timestamp time.Time `json:"timestamp"`
	Sentiment float64   `json:"sentiment"`
	Count     int64     `json:"count"`
}

// EvolutionMetrics tracks how lore fragments evolve across platforms
type EvolutionMetrics struct {
	OriginalContent string           `json:"original_content"`
	OriginalID      string           `json:"original_id"`
	EvolutionCount  int64            `json:"evolution_count"`
	Platforms       map[string]int64 `json:"platforms"`
	Mutations       []MutationEvent  `json:"mutations"`
	ComplexityScore float64          `json:"complexity_score"`
	ViralityScore   float64          `json:"virality_score"`
	LastEvolution   time.Time        `json:"last_evolution"`
	EvolutionTree   []EvolutionNode  `json:"evolution_tree"`
}

// MutationEvent represents a single mutation in lore evolution
type MutationEvent struct {
	ID              string    `json:"id"`
	FromContent     string    `json:"from_content"`
	ToContent       string    `json:"to_content"`
	Platform        string    `json:"platform"`
	MutationType    string    `json:"mutation_type"` // "remix", "escalation", "mutation"
	Timestamp       time.Time `json:"timestamp"`
	UserID          string    `json:"user_id"`
	SimilarityScore float64   `json:"similarity_score"`
}

// EvolutionNode represents a node in the evolution tree
type EvolutionNode struct {
	ID         string          `json:"id"`
	Content    string          `json:"content"`
	Platform   string          `json:"platform"`
	Timestamp  time.Time       `json:"timestamp"`
	Children   []EvolutionNode `json:"children"`
	Depth      int             `json:"depth"`
	Engagement int64           `json:"engagement"`
}

// HourlyMetrics represents metrics for a specific hour
type HourlyMetrics struct {
	Hour             time.Time `json:"hour"`
	TotalEvents      int64     `json:"total_events"`
	SuccessfulEvents int64     `json:"successful_events"`
	FailedEvents     int64     `json:"failed_events"`
	AvgCursedLevel   float64   `json:"avg_cursed_level"`
	AvgSentiment     float64   `json:"avg_sentiment"`
	TopIntegrations  []string  `json:"top_integrations"`
	PeakConcurrency  int       `json:"peak_concurrency"`
}

// DailyMetrics represents metrics for a specific day
type DailyMetrics struct {
	Date           time.Time `json:"date"`
	TotalEvents    int64     `json:"total_events"`
	UniqueUsers    int64     `json:"unique_users"`
	TopTopics      []string  `json:"top_topics"`
	AvgEngagement  float64   `json:"avg_engagement"`
	ConflictCount  int64     `json:"conflict_count"`
	EvolutionCount int64     `json:"evolution_count"`
	ViralEvents    int64     `json:"viral_events"`
}

// RealtimeMetrics represents current real-time metrics
type RealtimeMetrics struct {
	CurrentRPS        float64           `json:"current_rps"`
	ActiveSessions    int64             `json:"active_sessions"`
	QueueLength       int               `json:"queue_length"`
	MemoryUsage       int64             `json:"memory_usage"`
	CPUUsage          float64           `json:"cpu_usage"`
	IntegrationStatus map[string]string `json:"integration_status"`
	LastEventTime     time.Time         `json:"last_event_time"`
	AlertsActive      []string          `json:"alerts_active"`
}

// MetricsSnapshot represents a snapshot of metrics at a specific time
type MetricsSnapshot struct {
	Timestamp    time.Time        `json:"timestamp"`
	TotalEvents  int64            `json:"total_events"`
	SuccessRate  float64          `json:"success_rate"`
	AvgLatency   time.Duration    `json:"avg_latency"`
	TopTopics    []string         `json:"top_topics"`
	ActiveUsers  int64            `json:"active_users"`
	SystemHealth string           `json:"system_health"`
	Integrations map[string]int64 `json:"integrations"`
}

// NewLiveMetricsCollector creates a new metrics collector
func NewLiveMetricsCollector(logger *logrus.Logger) *LiveMetricsCollector {
	return &LiveMetricsCollector{
		logger:              logger,
		integrationHits:     make(map[string]int64),
		integrationFailures: make(map[string]int64),
		integrationLatency:  make(map[string][]time.Duration),
		eventTypes:          make(map[string]int64),
		failedEvents:        make([]FailedEvent, 0),
		maxFailedEvents:     1000,
		cursedTopics:        make(map[string]CursedTopicMetrics),
		loreSentimentMap:    make(map[string]SentimentMetrics),
		loreEvolution:       make(map[string]EvolutionMetrics),
		hourlyStats:         make(map[string]HourlyMetrics),
		dailyStats:          make(map[string]DailyMetrics),
		metricsHistory:      make([]MetricsSnapshot, 0),
		maxHistorySize:      1440, // 24 hours of minute-by-minute data
		realtimeMetrics: RealtimeMetrics{
			IntegrationStatus: make(map[string]string),
			AlertsActive:      make([]string, 0),
		},
	}
}

// Initialize sets up the live metrics collector with configuration
func (lmc *LiveMetricsCollector) Initialize(config map[string]interface{}) error {
	lmc.mutex.Lock()
	defer lmc.mutex.Unlock()

	if interval, ok := config["collect_interval"].(string); ok {
		if duration, err := time.ParseDuration(interval); err == nil {
			lmc.collectInterval = duration
		}
	}

	if period, ok := config["retention_period"].(string); ok {
		if duration, err := time.ParseDuration(period); err == nil {
			lmc.retentionPeriod = duration
		}
	}

	if enabled, ok := config["cursed_topic_tracking"].(bool); ok {
		lmc.cursedTopicTracking = enabled
	}

	if enabled, ok := config["sentiment_analysis"].(bool); ok {
		lmc.sentimentAnalysis = enabled
	}

	if enabled, ok := config["evolution_tracking"].(bool); ok {
		lmc.evolutionTracking = enabled
	}

	if enabled, ok := config["performance_monitoring"].(bool); ok {
		lmc.performanceMonitoring = enabled
	}

	lmc.logger.Info("📊 Live Metrics Collector initialized")
	return nil
}

// RecordIntegrationHit records a successful integration hit
func (lmc *LiveMetricsCollector) RecordIntegrationHit(integration string, latency time.Duration) {
	lmc.mutex.Lock()
	defer lmc.mutex.Unlock()

	lmc.integrationHits[integration]++
	lmc.integrationLatency[integration] = append(lmc.integrationLatency[integration], latency)

	// Keep only last 100 latency measurements
	if len(lmc.integrationLatency[integration]) > 100 {
		lmc.integrationLatency[integration] = lmc.integrationLatency[integration][1:]
	}

	lmc.realtimeMetrics.IntegrationStatus[integration] = "healthy"
	lmc.updateRealtimeMetrics()
}

// RecordIntegrationFailure records a failed integration attempt
func (lmc *LiveMetricsCollector) RecordIntegrationFailure(integration string, event LoreEvent, err error) {
	lmc.mutex.Lock()
	defer lmc.mutex.Unlock()

	lmc.integrationFailures[integration]++

	// Record failed event
	failedEvent := FailedEvent{
		ID:          event.SessionID + "_" + fmt.Sprintf("%d", event.SessionEventCount),
		Type:        event.Type,
		Timestamp:   time.Now(),
		Error:       err.Error(),
		Integration: integration,
		Content:     event.Content,
		Metadata:    event.Metadata,
		Retries:     0,
		Resolved:    false,
	}

	lmc.failedEvents = append(lmc.failedEvents, failedEvent)

	// Keep only last N failed events
	if len(lmc.failedEvents) > lmc.maxFailedEvents {
		lmc.failedEvents = lmc.failedEvents[1:]
	}

	lmc.realtimeMetrics.IntegrationStatus[integration] = "degraded"
	lmc.updateRealtimeMetrics()
}

// RecordLoreEvent records metrics for a lore event
func (lmc *LiveMetricsCollector) RecordLoreEvent(event LoreEvent) {
	lmc.mutex.Lock()
	defer lmc.mutex.Unlock()

	lmc.totalEvents++
	lmc.eventTypes[event.Type]++

	// Update cursed topic metrics
	lmc.updateCursedTopicMetrics(event)

	// Update sentiment metrics
	lmc.updateSentimentMetrics(event)

	// Update evolution metrics if this is a mutation/remix
	if event.Type == "reactive_dialogue" || event.Type == "lore_mutation" {
		lmc.updateEvolutionMetrics(event)
	}

	// Update hourly and daily stats
	lmc.updateTimeBasedMetrics(event)

	lmc.realtimeMetrics.LastEventTime = time.Now()
	lmc.updateRealtimeMetrics()
}

// updateCursedTopicMetrics updates cursed topic tracking
func (lmc *LiveMetricsCollector) updateCursedTopicMetrics(event LoreEvent) {
	for _, tag := range event.Tags {
		if metric, exists := lmc.cursedTopics[tag]; exists {
			metric.TotalEvents++
			if event.CursedLevel > 5 {
				metric.CursedCount++
			}
			metric.AvgCursedLevel = (metric.AvgCursedLevel*float64(metric.TotalEvents-1) + float64(event.CursedLevel)) / float64(metric.TotalEvents)
			if event.CursedLevel > metric.MaxCursedLevel {
				metric.MaxCursedLevel = event.CursedLevel
			}
			metric.LastSeen = time.Now()

			// Update top users
			if !containsString(metric.TopUsers, event.UserID) {
				metric.TopUsers = append(metric.TopUsers, event.UserID)
				if len(metric.TopUsers) > 10 {
					metric.TopUsers = metric.TopUsers[:10]
				}
			}

			// Extract cursed phrases
			if event.CursedLevel > 7 {
				words := strings.Fields(strings.ToLower(event.Content))
				for _, word := range words {
					if len(word) > 3 && !containsString(metric.CursedPhrases, word) {
						metric.CursedPhrases = append(metric.CursedPhrases, word)
						if len(metric.CursedPhrases) > 20 {
							metric.CursedPhrases = metric.CursedPhrases[:20]
						}
					}
				}
			}

			lmc.cursedTopics[tag] = metric
		} else {
			lmc.cursedTopics[tag] = CursedTopicMetrics{
				Topic: tag,
				CursedCount: func() int64 {
					if event.CursedLevel > 5 {
						return 1
					} else {
						return 0
					}
				}(),
				TotalEvents:    1,
				AvgCursedLevel: float64(event.CursedLevel),
				MaxCursedLevel: event.CursedLevel,
				LastSeen:       time.Now(),
				TopUsers:       []string{event.UserID},
				CursedPhrases:  []string{},
				TrendDirection: "stable",
			}
		}
	}
}

// updateSentimentMetrics updates sentiment tracking
func (lmc *LiveMetricsCollector) updateSentimentMetrics(event LoreEvent) {
	topic := "general"
	if len(event.Tags) > 0 {
		topic = event.Tags[0]
	}

	if metric, exists := lmc.loreSentimentMap[topic]; exists {
		// Update sentiment counts
		if event.Sentiment > 0.2 {
			metric.PositiveCount++
		} else if event.Sentiment < -0.2 {
			metric.NegativeCount++
		} else {
			metric.NeutralCount++
		}

		// Update average sentiment
		totalEvents := metric.PositiveCount + metric.NegativeCount + metric.NeutralCount
		metric.AvgSentiment = (metric.AvgSentiment*float64(totalEvents-1) + event.Sentiment) / float64(totalEvents)

		// Add to sentiment history
		metric.SentimentHistory = append(metric.SentimentHistory, SentimentPoint{
			Timestamp: time.Now(),
			Sentiment: event.Sentiment,
			Count:     totalEvents,
		})

		// Keep only last 100 points
		if len(metric.SentimentHistory) > 100 {
			metric.SentimentHistory = metric.SentimentHistory[1:]
		}

		metric.LastUpdated = time.Now()
		lmc.loreSentimentMap[topic] = metric
	} else {
		lmc.loreSentimentMap[topic] = SentimentMetrics{
			Topic: topic,
			PositiveCount: func() int64 {
				if event.Sentiment > 0.2 {
					return 1
				} else {
					return 0
				}
			}(),
			NegativeCount: func() int64 {
				if event.Sentiment < -0.2 {
					return 1
				} else {
					return 0
				}
			}(),
			NeutralCount: func() int64 {
				if event.Sentiment >= -0.2 && event.Sentiment <= 0.2 {
					return 1
				} else {
					return 0
				}
			}(),
			AvgSentiment: event.Sentiment,
			SentimentHistory: []SentimentPoint{{
				Timestamp: time.Now(),
				Sentiment: event.Sentiment,
				Count:     1,
			}},
			EmotionBreakdown: make(map[string]int64),
			LastUpdated:      time.Now(),
		}
	}
}

// updateEvolutionMetrics updates lore evolution tracking
func (lmc *LiveMetricsCollector) updateEvolutionMetrics(event LoreEvent) {
	// Check if this is a mutation/evolution of existing content
	if originalID, exists := event.Metadata["original_id"].(string); exists {
		if metric, exists := lmc.loreEvolution[originalID]; exists {
			metric.EvolutionCount++
			metric.LastEvolution = time.Now()

			// Update platform tracking
			if platform, exists := event.Metadata["platform"].(string); exists {
				metric.Platforms[platform]++
			}

			// Add mutation event
			mutation := MutationEvent{
				ID:              event.SessionID + "_" + fmt.Sprintf("%d", event.SessionEventCount),
				FromContent:     metric.OriginalContent,
				ToContent:       event.Content,
				Platform:        event.Source,
				MutationType:    event.Type,
				Timestamp:       time.Now(),
				UserID:          event.UserID,
				SimilarityScore: calculateSimilarity(metric.OriginalContent, event.Content),
			}

			metric.Mutations = append(metric.Mutations, mutation)

			// Keep only last 50 mutations
			if len(metric.Mutations) > 50 {
				metric.Mutations = metric.Mutations[1:]
			}

			// Update complexity and virality scores
			metric.ComplexityScore = calculateComplexityScore(metric.Mutations)
			metric.ViralityScore = calculateViralityScore(metric.Platforms, metric.EvolutionCount)

			lmc.loreEvolution[originalID] = metric
		}
	}
}

// updateTimeBasedMetrics updates hourly and daily statistics
func (lmc *LiveMetricsCollector) updateTimeBasedMetrics(event LoreEvent) {
	now := time.Now()
	hourKey := now.Format("2006-01-02-15")
	dayKey := now.Format("2006-01-02")

	// Update hourly metrics
	if hourlyMetric, exists := lmc.hourlyStats[hourKey]; exists {
		hourlyMetric.TotalEvents++
		hourlyMetric.SuccessfulEvents++
		hourlyMetric.AvgCursedLevel = (hourlyMetric.AvgCursedLevel*float64(hourlyMetric.TotalEvents-1) + float64(event.CursedLevel)) / float64(hourlyMetric.TotalEvents)
		hourlyMetric.AvgSentiment = (hourlyMetric.AvgSentiment*float64(hourlyMetric.TotalEvents-1) + event.Sentiment) / float64(hourlyMetric.TotalEvents)
		lmc.hourlyStats[hourKey] = hourlyMetric
	} else {
		lmc.hourlyStats[hourKey] = HourlyMetrics{
			Hour:             now.Truncate(time.Hour),
			TotalEvents:      1,
			SuccessfulEvents: 1,
			FailedEvents:     0,
			AvgCursedLevel:   float64(event.CursedLevel),
			AvgSentiment:     event.Sentiment,
			TopIntegrations:  []string{},
			PeakConcurrency:  1,
		}
	}

	// Update daily metrics
	if dailyMetric, exists := lmc.dailyStats[dayKey]; exists {
		dailyMetric.TotalEvents++
		lmc.dailyStats[dayKey] = dailyMetric
	} else {
		lmc.dailyStats[dayKey] = DailyMetrics{
			Date:           now.Truncate(24 * time.Hour),
			TotalEvents:    1,
			UniqueUsers:    1,
			TopTopics:      event.Tags,
			AvgEngagement:  float64(event.Priority),
			ConflictCount:  0,
			EvolutionCount: 0,
			ViralEvents:    0,
		}
	}
}

// updateRealtimeMetrics updates real-time metrics
func (lmc *LiveMetricsCollector) updateRealtimeMetrics() {
	lmc.realtimeMetrics.CurrentRPS = float64(lmc.totalEvents) / time.Since(time.Now().Add(-time.Minute)).Seconds()
	lmc.realtimeMetrics.QueueLength = lmc.currentConcurrency
	lmc.realtimeMetrics.LastEventTime = time.Now()

	// Check for alerts
	lmc.realtimeMetrics.AlertsActive = []string{}
	for integration, failures := range lmc.integrationFailures {
		if hits, exists := lmc.integrationHits[integration]; exists {
			failureRate := float64(failures) / float64(hits+failures)
			if failureRate > 0.1 { // 10% failure rate threshold
				lmc.realtimeMetrics.AlertsActive = append(lmc.realtimeMetrics.AlertsActive, fmt.Sprintf("High failure rate for %s: %.2f%%", integration, failureRate*100))
			}
		}
	}
}

// GetLiveMetrics returns comprehensive live metrics
func (lmc *LiveMetricsCollector) GetLiveMetrics() map[string]interface{} {
	lmc.mutex.RLock()
	defer lmc.mutex.RUnlock()

	// Calculate integration hit rates
	integrationHitRates := make(map[string]float64)
	for integration, hits := range lmc.integrationHits {
		failures := lmc.integrationFailures[integration]
		total := hits + failures
		if total > 0 {
			integrationHitRates[integration] = float64(hits) / float64(total)
		}
	}

	// Get top cursed topics
	topCursedTopics := lmc.getTopCursedTopics(10)

	// Get sentiment map
	sentimentMap := lmc.getSentimentMap()

	// Get failed events (last 50)
	recentFailedEvents := lmc.failedEvents
	if len(recentFailedEvents) > 50 {
		recentFailedEvents = recentFailedEvents[len(recentFailedEvents)-50:]
	}

	return map[string]interface{}{
		"integration_hit_rates": integrationHitRates,
		"integration_failures":  lmc.integrationFailures,
		"failed_events":         recentFailedEvents,
		"top_cursed_topics":     topCursedTopics,
		"lore_sentiment_map":    sentimentMap,
		"lore_evolution":        lmc.loreEvolution,
		"realtime_metrics":      lmc.realtimeMetrics,
		"hourly_stats":          lmc.getRecentHourlyStats(24),
		"daily_stats":           lmc.getRecentDailyStats(7),
		"total_events":          lmc.totalEvents,
		"event_types":           lmc.eventTypes,
		"system_health":         lmc.calculateSystemHealth(),
		"performance_metrics":   lmc.getPerformanceMetrics(),
		"generated_at":          time.Now(),
	}
}

// GetMetrics returns current metrics
func (lmc *LiveMetricsCollector) GetMetrics() map[string]interface{} {
	lmc.mutex.RLock()
	defer lmc.mutex.RUnlock()

	return map[string]interface{}{
		"integration_hits":     lmc.integrationHits,
		"integration_failures": lmc.integrationFailures,
		"integration_latency":  lmc.integrationLatency,
		"event_types":          lmc.eventTypes,
		"failed_events":        lmc.failedEvents,
		"cursed_topics":        lmc.cursedTopics,
		"lore_sentiment_map":   lmc.loreSentimentMap,
		"lore_evolution":       lmc.loreEvolution,
		"hourly_stats":         lmc.hourlyStats,
		"daily_stats":          lmc.dailyStats,
		"realtime_metrics":     lmc.realtimeMetrics,
		"generated_at":         time.Now(),
	}
}

// Name returns the name of the collector
func (lmc *LiveMetricsCollector) Name() string {
	return "live_metrics_collector"
}

// IsHealthy returns the health status of the collector
func (lmc *LiveMetricsCollector) IsHealthy() bool {
	return true
}

// Helper functions

func (lmc *LiveMetricsCollector) getTopCursedTopics(limit int) []CursedTopicMetrics {
	topics := make([]CursedTopicMetrics, 0, len(lmc.cursedTopics))
	for _, topic := range lmc.cursedTopics {
		topics = append(topics, topic)
	}

	sort.Slice(topics, func(i, j int) bool {
		return topics[i].CursedCount > topics[j].CursedCount
	})

	if len(topics) > limit {
		topics = topics[:limit]
	}

	return topics
}

func (lmc *LiveMetricsCollector) getSentimentMap() map[string]SentimentMetrics {
	return lmc.loreSentimentMap
}

func (lmc *LiveMetricsCollector) getRecentHourlyStats(hours int) map[string]HourlyMetrics {
	result := make(map[string]HourlyMetrics)
	now := time.Now()

	for i := 0; i < hours; i++ {
		hourKey := now.Add(time.Duration(-i) * time.Hour).Format("2006-01-02-15")
		if metric, exists := lmc.hourlyStats[hourKey]; exists {
			result[hourKey] = metric
		}
	}

	return result
}

func (lmc *LiveMetricsCollector) getRecentDailyStats(days int) map[string]DailyMetrics {
	result := make(map[string]DailyMetrics)
	now := time.Now()

	for i := 0; i < days; i++ {
		dayKey := now.Add(time.Duration(-i) * 24 * time.Hour).Format("2006-01-02")
		if metric, exists := lmc.dailyStats[dayKey]; exists {
			result[dayKey] = metric
		}
	}

	return result
}

func (lmc *LiveMetricsCollector) calculateSystemHealth() string {
	totalHits := int64(0)
	totalFailures := int64(0)

	for _, hits := range lmc.integrationHits {
		totalHits += hits
	}

	for _, failures := range lmc.integrationFailures {
		totalFailures += failures
	}

	if totalHits+totalFailures == 0 {
		return "unknown"
	}

	successRate := float64(totalHits) / float64(totalHits+totalFailures)

	if successRate >= 0.95 {
		return "excellent"
	} else if successRate >= 0.90 {
		return "good"
	} else if successRate >= 0.80 {
		return "fair"
	} else if successRate >= 0.70 {
		return "poor"
	} else {
		return "critical"
	}
}

func (lmc *LiveMetricsCollector) getPerformanceMetrics() map[string]interface{} {
	avgLatencies := make(map[string]time.Duration)

	for integration, latencies := range lmc.integrationLatency {
		if len(latencies) > 0 {
			var total time.Duration
			for _, latency := range latencies {
				total += latency
			}
			avgLatencies[integration] = total / time.Duration(len(latencies))
		}
	}

	return map[string]interface{}{
		"avg_latencies":       avgLatencies,
		"total_events":        lmc.totalEvents,
		"avg_processing_time": lmc.avgProcessingTime,
		"peak_concurrency":    lmc.peakConcurrency,
		"current_concurrency": lmc.currentConcurrency,
	}
}

// Utility functions

func containsString(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

func calculateSimilarity(content1, content2 string) float64 {
	// Simple similarity calculation - can be enhanced with more sophisticated algorithms
	words1 := strings.Fields(strings.ToLower(content1))
	words2 := strings.Fields(strings.ToLower(content2))

	commonWords := 0
	for _, word1 := range words1 {
		for _, word2 := range words2 {
			if word1 == word2 {
				commonWords++
				break
			}
		}
	}

	totalWords := len(words1) + len(words2)
	if totalWords == 0 {
		return 0.0
	}

	return float64(commonWords*2) / float64(totalWords)
}

func calculateComplexityScore(mutations []MutationEvent) float64 {
	if len(mutations) == 0 {
		return 0.0
	}

	// Calculate complexity based on mutation count, types, and similarity scores
	score := float64(len(mutations)) * 0.1

	mutationTypes := make(map[string]int)
	avgSimilarity := 0.0

	for _, mutation := range mutations {
		mutationTypes[mutation.MutationType]++
		avgSimilarity += mutation.SimilarityScore
	}

	avgSimilarity /= float64(len(mutations))

	// Higher complexity for diverse mutation types and lower similarity
	typeBonus := float64(len(mutationTypes)) * 0.2
	similarityPenalty := avgSimilarity * 0.5

	return score + typeBonus - similarityPenalty
}

func calculateViralityScore(platforms map[string]int64, evolutionCount int64) float64 {
	if evolutionCount == 0 {
		return 0.0
	}

	// Calculate virality based on platform spread and evolution frequency
	platformSpread := float64(len(platforms)) * 0.3
	evolutionFreq := float64(evolutionCount) * 0.1

	// Bonus for cross-platform evolution
	crossPlatformBonus := 0.0
	if len(platforms) > 1 {
		crossPlatformBonus = 0.5
	}

	return platformSpread + evolutionFreq + crossPlatformBonus
}
