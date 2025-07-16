package hooks

import (
	"context"
	"fmt"
	"math/rand"
	"strings"
	"sync"
	"time"

	"github.com/sirupsen/logrus"
)

// InteractiveLoreLooper handles re-entrant content for remix, mutation, and escalation
type InteractiveLoreLooper struct {
	logger *logrus.Logger
	mutex  sync.RWMutex

	// Lore storage and tracking
	loreFragments   map[string]*LoreFragment
	evolutionChains map[string]*EvolutionChain
	activeLoops     map[string]*ActiveLoop

	// Mutation algorithms
	mutationRules   []MutationRule
	remixPatterns   []RemixPattern
	escalationRules []EscalationRule

	// Platform integrations
	discordEnabled  bool
	tiktokEnabled   bool
	markdownEnabled bool

	// Loop management
	maxLoopDepth   int
	loopTimeout    time.Duration
	cooldownPeriod time.Duration

	// Evolution tracking
	totalEvolutions  int64
	totalRemixes     int64
	totalEscalations int64

	// Context and cancellation
	ctx    context.Context
	cancel context.CancelFunc
}

// LoreFragment represents a piece of lore that can be evolved
type LoreFragment struct {
	ID              string                 `json:"id"`
	OriginalContent string                 `json:"original_content"`
	CurrentContent  string                 `json:"current_content"`
	OriginalEvent   *LoreEvent             `json:"original_event"`
	CreatedAt       time.Time              `json:"created_at"`
	LastEvolved     time.Time              `json:"last_evolved"`
	EvolutionCount  int                    `json:"evolution_count"`
	Platform        string                 `json:"platform"`
	UserID          string                 `json:"user_id"`
	Tags            []string               `json:"tags"`
	Metadata        map[string]interface{} `json:"metadata"`
	Active          bool                   `json:"active"`
	Popularity      int                    `json:"popularity"`
	CursedLevel     int                    `json:"cursed_level"`
	SentimentScore  float64                `json:"sentiment_score"`
	ViralityScore   float64                `json:"virality_score"`
	Children        []string               `json:"children"` // IDs of evolved fragments
	Parent          string                 `json:"parent"`   // ID of parent fragment
}

// EvolutionChain represents a chain of lore evolution
type EvolutionChain struct {
	ID              string                 `json:"id"`
	RootFragmentID  string                 `json:"root_fragment_id"`
	Fragments       []string               `json:"fragments"`
	TotalEvolutions int                    `json:"total_evolutions"`
	Platforms       map[string]int         `json:"platforms"`
	Users           map[string]int         `json:"users"`
	CreatedAt       time.Time              `json:"created_at"`
	LastActivity    time.Time              `json:"last_activity"`
	Active          bool                   `json:"active"`
	Depth           int                    `json:"depth"`
	Branches        int                    `json:"branches"`
	Metadata        map[string]interface{} `json:"metadata"`
}

// ActiveLoop represents an active lore loop session
type ActiveLoop struct {
	ID             string                 `json:"id"`
	FragmentID     string                 `json:"fragment_id"`
	UserID         string                 `json:"user_id"`
	Platform       string                 `json:"platform"`
	LoopType       string                 `json:"loop_type"` // "remix", "mutation", "escalation"
	StartTime      time.Time              `json:"start_time"`
	LastActivity   time.Time              `json:"last_activity"`
	Iterations     int                    `json:"iterations"`
	MaxIterations  int                    `json:"max_iterations"`
	CurrentContent string                 `json:"current_content"`
	Metadata       map[string]interface{} `json:"metadata"`
	Status         string                 `json:"status"` // "active", "paused", "completed", "expired"
	Results        []LoopResult           `json:"results"`
}

// LoopResult represents the result of a loop iteration
type LoopResult struct {
	Iteration       int                    `json:"iteration"`
	Timestamp       time.Time              `json:"timestamp"`
	InputContent    string                 `json:"input_content"`
	OutputContent   string                 `json:"output_content"`
	OperationType   string                 `json:"operation_type"`
	Success         bool                   `json:"success"`
	QualityScore    float64                `json:"quality_score"`
	Metadata        map[string]interface{} `json:"metadata"`
	UserFeedback    string                 `json:"user_feedback"`
	EngagementScore float64                `json:"engagement_score"`
}

// MutationRule defines how content should be mutated
type MutationRule struct {
	ID          string                 `json:"id"`
	Name        string                 `json:"name"`
	Pattern     string                 `json:"pattern"`
	Replacement string                 `json:"replacement"`
	Probability float64                `json:"probability"`
	Conditions  map[string]interface{} `json:"conditions"`
	Enabled     bool                   `json:"enabled"`
}

// RemixPattern defines how content should be remixed
type RemixPattern struct {
	ID         string                 `json:"id"`
	Name       string                 `json:"name"`
	Template   string                 `json:"template"`
	Variables  []string               `json:"variables"`
	Complexity int                    `json:"complexity"`
	Conditions map[string]interface{} `json:"conditions"`
	Enabled    bool                   `json:"enabled"`
}

// EscalationRule defines how content should be escalated
type EscalationRule struct {
	ID         string                 `json:"id"`
	Name       string                 `json:"name"`
	Trigger    string                 `json:"trigger"`
	Action     string                 `json:"action"`
	Intensity  int                    `json:"intensity"`
	Conditions map[string]interface{} `json:"conditions"`
	Enabled    bool                   `json:"enabled"`
}

// TriggerRequest represents a request to trigger lore reanimation
type TriggerRequest struct {
	FragmentID  string                 `json:"fragment_id"`
	UserID      string                 `json:"user_id"`
	Platform    string                 `json:"platform"`
	LoopType    string                 `json:"loop_type"`
	Iterations  int                    `json:"iterations"`
	Parameters  map[string]interface{} `json:"parameters"`
	Constraints map[string]interface{} `json:"constraints"`
}

// TriggerResponse represents the response from triggering lore reanimation
type TriggerResponse struct {
	LoopID        string                 `json:"loop_id"`
	FragmentID    string                 `json:"fragment_id"`
	Status        string                 `json:"status"`
	Message       string                 `json:"message"`
	InitialLoop   *ActiveLoop            `json:"initial_loop"`
	EstimatedTime time.Duration          `json:"estimated_time"`
	Metadata      map[string]interface{} `json:"metadata"`
}

// NewInteractiveLoreLooper creates a new interactive lore looper
func NewInteractiveLoreLooper(logger *logrus.Logger) *InteractiveLoreLooper {
	ctx, cancel := context.WithCancel(context.Background())

	ill := &InteractiveLoreLooper{
		logger:          logger,
		loreFragments:   make(map[string]*LoreFragment),
		evolutionChains: make(map[string]*EvolutionChain),
		activeLoops:     make(map[string]*ActiveLoop),
		mutationRules:   make([]MutationRule, 0),
		remixPatterns:   make([]RemixPattern, 0),
		escalationRules: make([]EscalationRule, 0),
		maxLoopDepth:    10,
		loopTimeout:     30 * time.Minute,
		cooldownPeriod:  5 * time.Minute,
		ctx:             ctx,
		cancel:          cancel,
	}

	// Initialize default rules and patterns
	ill.initializeDefaultRules()

	// Start background loop management
	go ill.manageActiveLoops()

	return ill
}

// Initialize configures the looper with settings
func (ill *InteractiveLoreLooper) Initialize(config map[string]interface{}) error {
	ill.mutex.Lock()
	defer ill.mutex.Unlock()

	if enabled, ok := config["discord_enabled"].(bool); ok {
		ill.discordEnabled = enabled
	}

	if enabled, ok := config["tiktok_enabled"].(bool); ok {
		ill.tiktokEnabled = enabled
	}

	if enabled, ok := config["markdown_enabled"].(bool); ok {
		ill.markdownEnabled = enabled
	}

	if maxDepth, ok := config["max_loop_depth"].(int); ok {
		ill.maxLoopDepth = maxDepth
	}

	if timeout, ok := config["loop_timeout"].(string); ok {
		if duration, err := time.ParseDuration(timeout); err == nil {
			ill.loopTimeout = duration
		}
	}

	if cooldown, ok := config["cooldown_period"].(string); ok {
		if duration, err := time.ParseDuration(cooldown); err == nil {
			ill.cooldownPeriod = duration
		}
	}

	ill.logger.Info("🔄 Interactive Lore Looper initialized")
	return nil
}

// StoreLoreFragment stores a lore fragment for future reanimation
func (ill *InteractiveLoreLooper) StoreLoreFragment(event LoreEvent) (*LoreFragment, error) {
	ill.mutex.Lock()
	defer ill.mutex.Unlock()

	fragment := &LoreFragment{
		ID:              event.SessionID + "_" + fmt.Sprintf("%d", event.SessionEventCount),
		OriginalContent: event.Content,
		CurrentContent:  event.Content,
		OriginalEvent:   &event,
		CreatedAt:       time.Now(),
		LastEvolved:     time.Now(),
		EvolutionCount:  0,
		Platform:        event.Source,
		UserID:          event.UserID,
		Tags:            event.Tags,
		Metadata:        event.Metadata,
		Active:          true,
		Popularity:      0,
		CursedLevel:     event.CursedLevel,
		SentimentScore:  event.Sentiment,
		ViralityScore:   float64(event.Priority) / 10.0,
		Children:        make([]string, 0),
		Parent:          "",
	}

	// Check if this is an evolution of an existing fragment
	if parentID, exists := event.Metadata["parent_fragment_id"].(string); exists {
		fragment.Parent = parentID
		if parent, exists := ill.loreFragments[parentID]; exists {
			parent.Children = append(parent.Children, fragment.ID)
			ill.loreFragments[parentID] = parent
		}
	}

	ill.loreFragments[fragment.ID] = fragment

	// Create or update evolution chain
	ill.updateEvolutionChain(fragment)

	ill.logger.WithFields(logrus.Fields{
		"fragment_id": fragment.ID,
		"user_id":     fragment.UserID,
		"platform":    fragment.Platform,
	}).Info("📦 Lore fragment stored")

	return fragment, nil
}

// TriggerLoreReanimation triggers the reanimation of a lore fragment
func (ill *InteractiveLoreLooper) TriggerLoreReanimation(request TriggerRequest) (*TriggerResponse, error) {
	ill.mutex.Lock()
	defer ill.mutex.Unlock()

	// Validate fragment exists
	fragment, exists := ill.loreFragments[request.FragmentID]
	if !exists {
		return nil, fmt.Errorf("fragment not found: %s", request.FragmentID)
	}

	// Check if user is in cooldown
	if ill.isUserInCooldown(request.UserID) {
		return &TriggerResponse{
			Status:  "error",
			Message: "User is in cooldown period",
		}, nil
	}

	// Create active loop
	loop := &ActiveLoop{
		ID:             ill.generateLoopID(),
		FragmentID:     request.FragmentID,
		UserID:         request.UserID,
		Platform:       request.Platform,
		LoopType:       request.LoopType,
		StartTime:      time.Now(),
		LastActivity:   time.Now(),
		Iterations:     0,
		MaxIterations:  request.Iterations,
		CurrentContent: fragment.CurrentContent,
		Metadata:       request.Parameters,
		Status:         "active",
		Results:        make([]LoopResult, 0),
	}

	ill.activeLoops[loop.ID] = loop

	// Start the loop processing
	go ill.processLoop(loop)

	response := &TriggerResponse{
		LoopID:        loop.ID,
		FragmentID:    request.FragmentID,
		Status:        "started",
		Message:       "Lore reanimation triggered successfully",
		InitialLoop:   loop,
		EstimatedTime: time.Duration(request.Iterations) * time.Second * 2,
		Metadata: map[string]interface{}{
			"loop_type":      request.LoopType,
			"max_iterations": request.Iterations,
			"platform":       request.Platform,
		},
	}

	ill.logger.WithFields(logrus.Fields{
		"loop_id":     loop.ID,
		"fragment_id": request.FragmentID,
		"user_id":     request.UserID,
		"loop_type":   request.LoopType,
	}).Info("🔄 Lore reanimation triggered")

	return response, nil
}

// GetLoreFragments returns all stored lore fragments
func (ill *InteractiveLoreLooper) GetLoreFragments() map[string]*LoreFragment {
	ill.mutex.RLock()
	defer ill.mutex.RUnlock()

	// Create a copy to avoid race conditions
	fragments := make(map[string]*LoreFragment)
	for id, fragment := range ill.loreFragments {
		fragments[id] = fragment
	}

	return fragments
}

// GetEvolutionChains returns all evolution chains
func (ill *InteractiveLoreLooper) GetEvolutionChains() map[string]*EvolutionChain {
	ill.mutex.RLock()
	defer ill.mutex.RUnlock()

	chains := make(map[string]*EvolutionChain)
	for id, chain := range ill.evolutionChains {
		chains[id] = chain
	}

	return chains
}

// GetActiveLoops returns all active loops
func (ill *InteractiveLoreLooper) GetActiveLoops() map[string]*ActiveLoop {
	ill.mutex.RLock()
	defer ill.mutex.RUnlock()

	loops := make(map[string]*ActiveLoop)
	for id, loop := range ill.activeLoops {
		loops[id] = loop
	}

	return loops
}

// GetLoopStatus returns the status of a specific loop
func (ill *InteractiveLoreLooper) GetLoopStatus(loopID string) (*ActiveLoop, error) {
	ill.mutex.RLock()
	defer ill.mutex.RUnlock()

	loop, exists := ill.activeLoops[loopID]
	if !exists {
		return nil, fmt.Errorf("loop not found: %s", loopID)
	}

	return loop, nil
}

// GetLooperStats returns looper statistics
func (ill *InteractiveLoreLooper) GetLooperStats() map[string]interface{} {
	ill.mutex.RLock()
	defer ill.mutex.RUnlock()

	activeLoopCount := 0
	for _, loop := range ill.activeLoops {
		if loop.Status == "active" {
			activeLoopCount++
		}
	}

	return map[string]interface{}{
		"total_fragments":   len(ill.loreFragments),
		"evolution_chains":  len(ill.evolutionChains),
		"active_loops":      activeLoopCount,
		"total_evolutions":  ill.totalEvolutions,
		"total_remixes":     ill.totalRemixes,
		"total_escalations": ill.totalEscalations,
		"mutation_rules":    len(ill.mutationRules),
		"remix_patterns":    len(ill.remixPatterns),
		"escalation_rules":  len(ill.escalationRules),
		"max_loop_depth":    ill.maxLoopDepth,
		"loop_timeout":      ill.loopTimeout,
		"cooldown_period":   ill.cooldownPeriod,
		"generated_at":      time.Now(),
	}
}

// Private methods

func (ill *InteractiveLoreLooper) initializeDefaultRules() {
	// Initialize default mutation rules
	ill.mutationRules = []MutationRule{
		{
			ID:          "cursed_intensify",
			Name:        "Cursed Intensification",
			Pattern:     `\b(dark|evil|cursed|haunted)\b`,
			Replacement: "$1 and most $1",
			Probability: 0.7,
			Conditions:  map[string]interface{}{"min_cursed_level": 5},
			Enabled:     true,
		},
		{
			ID:          "lore_corruption",
			Name:        "Lore Corruption",
			Pattern:     `\b(ancient|old|forgotten)\b`,
			Replacement: "corrupted $1",
			Probability: 0.6,
			Conditions:  map[string]interface{}{"min_lore_level": 6},
			Enabled:     true,
		},
		{
			ID:          "reality_distortion",
			Name:        "Reality Distortion",
			Pattern:     `\b(world|reality|existence)\b`,
			Replacement: "twisted $1",
			Probability: 0.5,
			Conditions:  map[string]interface{}{"min_cursed_level": 7},
			Enabled:     true,
		},
	}

	// Initialize default remix patterns
	ill.remixPatterns = []RemixPattern{
		{
			ID:         "narrative_remix",
			Name:       "Narrative Remix",
			Template:   "In the {location}, {character} discovered {object} which {action}",
			Variables:  []string{"location", "character", "object", "action"},
			Complexity: 3,
			Conditions: map[string]interface{}{"min_lore_level": 4},
			Enabled:    true,
		},
		{
			ID:         "cursed_remix",
			Name:       "Cursed Remix",
			Template:   "The {cursed_adjective} {entity} {cursed_verb} in the {cursed_location}",
			Variables:  []string{"cursed_adjective", "entity", "cursed_verb", "cursed_location"},
			Complexity: 4,
			Conditions: map[string]interface{}{"min_cursed_level": 6},
			Enabled:    true,
		},
	}

	// Initialize default escalation rules
	ill.escalationRules = []EscalationRule{
		{
			ID:         "priority_escalation",
			Name:       "Priority Escalation",
			Trigger:    "high_engagement",
			Action:     "increase_priority",
			Intensity:  2,
			Conditions: map[string]interface{}{"min_priority": 7},
			Enabled:    true,
		},
		{
			ID:         "cursed_escalation",
			Name:       "Cursed Escalation",
			Trigger:    "high_cursed_level",
			Action:     "amplify_cursed_content",
			Intensity:  3,
			Conditions: map[string]interface{}{"min_cursed_level": 8},
			Enabled:    true,
		},
	}
}

func (ill *InteractiveLoreLooper) updateEvolutionChain(fragment *LoreFragment) {
	chainID := fragment.ID
	if fragment.Parent != "" {
		// Find the root of the chain
		chainID = ill.findChainRoot(fragment.Parent)
	}

	if chain, exists := ill.evolutionChains[chainID]; exists {
		chain.Fragments = append(chain.Fragments, fragment.ID)
		chain.TotalEvolutions++
		chain.LastActivity = time.Now()

		if chain.Platforms == nil {
			chain.Platforms = make(map[string]int)
		}
		chain.Platforms[fragment.Platform]++

		if chain.Users == nil {
			chain.Users = make(map[string]int)
		}
		chain.Users[fragment.UserID]++

		ill.evolutionChains[chainID] = chain
	} else {
		ill.evolutionChains[chainID] = &EvolutionChain{
			ID:              chainID,
			RootFragmentID:  fragment.ID,
			Fragments:       []string{fragment.ID},
			TotalEvolutions: 1,
			Platforms:       map[string]int{fragment.Platform: 1},
			Users:           map[string]int{fragment.UserID: 1},
			CreatedAt:       time.Now(),
			LastActivity:    time.Now(),
			Active:          true,
			Depth:           1,
			Branches:        1,
			Metadata:        make(map[string]interface{}),
		}
	}
}

func (ill *InteractiveLoreLooper) findChainRoot(fragmentID string) string {
	if fragment, exists := ill.loreFragments[fragmentID]; exists {
		if fragment.Parent == "" {
			return fragmentID
		}
		return ill.findChainRoot(fragment.Parent)
	}
	return fragmentID
}

func (ill *InteractiveLoreLooper) isUserInCooldown(userID string) bool {
	// Check if user has triggered a loop recently
	cutoff := time.Now().Add(-ill.cooldownPeriod)
	for _, loop := range ill.activeLoops {
		if loop.UserID == userID && loop.StartTime.After(cutoff) {
			return true
		}
	}
	return false
}

func (ill *InteractiveLoreLooper) generateLoopID() string {
	return fmt.Sprintf("loop_%d_%d", time.Now().UnixNano(), rand.Intn(1000))
}

func (ill *InteractiveLoreLooper) processLoop(loop *ActiveLoop) {
	defer func() {
		ill.mutex.Lock()
		loop.Status = "completed"
		ill.mutex.Unlock()
	}()

	for loop.Iterations < loop.MaxIterations {
		select {
		case <-ill.ctx.Done():
			return
		case <-time.After(2 * time.Second): // Process every 2 seconds
			result := ill.performLoopIteration(loop)

			ill.mutex.Lock()
			loop.Results = append(loop.Results, result)
			loop.Iterations++
			loop.LastActivity = time.Now()
			loop.CurrentContent = result.OutputContent
			ill.mutex.Unlock()

			if result.Success {
				ill.logger.WithFields(logrus.Fields{
					"loop_id":   loop.ID,
					"iteration": result.Iteration,
					"loop_type": loop.LoopType,
					"quality":   result.QualityScore,
				}).Info("🔄 Loop iteration completed")
			} else {
				ill.logger.WithFields(logrus.Fields{
					"loop_id":   loop.ID,
					"iteration": result.Iteration,
					"error":     "iteration failed",
				}).Warn("⚠️ Loop iteration failed")
			}
		}
	}
}

func (ill *InteractiveLoreLooper) performLoopIteration(loop *ActiveLoop) LoopResult {
	result := LoopResult{
		Iteration:     loop.Iterations + 1,
		Timestamp:     time.Now(),
		InputContent:  loop.CurrentContent,
		OperationType: loop.LoopType,
		Success:       false,
		QualityScore:  0.0,
		Metadata:      make(map[string]interface{}),
	}

	switch loop.LoopType {
	case "mutation":
		result.OutputContent = ill.applyMutation(loop.CurrentContent)
		result.Success = true
		result.QualityScore = ill.calculateQualityScore(result.InputContent, result.OutputContent)
		ill.totalEvolutions++

	case "remix":
		result.OutputContent = ill.applyRemix(loop.CurrentContent)
		result.Success = true
		result.QualityScore = ill.calculateQualityScore(result.InputContent, result.OutputContent)
		ill.totalRemixes++

	case "escalation":
		result.OutputContent = ill.applyEscalation(loop.CurrentContent)
		result.Success = true
		result.QualityScore = ill.calculateQualityScore(result.InputContent, result.OutputContent)
		ill.totalEscalations++

	default:
		result.OutputContent = loop.CurrentContent
		result.Success = false
	}

	result.EngagementScore = rand.Float64() * 10.0 // Simulate engagement

	return result
}

func (ill *InteractiveLoreLooper) applyMutation(content string) string {
	// Apply mutation rules
	for _, rule := range ill.mutationRules {
		if rule.Enabled && rand.Float64() < rule.Probability {
			// Simple pattern replacement (in reality, this would be more sophisticated)
			content = strings.ReplaceAll(content, rule.Pattern, rule.Replacement)
		}
	}

	// Add random cursed words
	cursedWords := []string{"eldritch", "abyssal", "profane", "blasphemous", "malevolent"}
	if rand.Float64() < 0.3 {
		word := cursedWords[rand.Intn(len(cursedWords))]
		content = word + " " + content
	}

	return content
}

func (ill *InteractiveLoreLooper) applyRemix(content string) string {
	// Try to apply remix patterns first
	if remixed := ill.tryRemixPatterns(content); remixed != "" {
		return remixed
	}

	// Fallback to word shuffling
	return ill.shuffleWords(content)
}

func (ill *InteractiveLoreLooper) tryRemixPatterns(content string) string {
	for _, pattern := range ill.remixPatterns {
		if !pattern.Enabled || rand.Float64() >= 0.4 {
			continue
		}

		words := strings.Fields(content)
		if len(words) < len(pattern.Variables) {
			continue
		}

		return ill.applyRemixTemplate(pattern, words)
	}
	return ""
}

func (ill *InteractiveLoreLooper) applyRemixTemplate(pattern RemixPattern, words []string) string {
	remixed := pattern.Template
	for i, variable := range pattern.Variables {
		if i < len(words) {
			remixed = strings.ReplaceAll(remixed, "{"+variable+"}", words[i])
		}
	}
	return remixed
}

func (ill *InteractiveLoreLooper) shuffleWords(content string) string {
	words := strings.Fields(content)
	if len(words) <= 2 {
		return content
	}

	// Shuffle middle words only
	for i := 1; i < len(words)-1; i++ {
		j := rand.Intn(len(words)-2) + 1
		words[i], words[j] = words[j], words[i]
	}
	return strings.Join(words, " ")
}

func (ill *InteractiveLoreLooper) applyEscalation(content string) string {
	// Apply escalation rules
	escalationPrefixes := []string{"BEHOLD!", "WITNESS!", "TREMBLE!", "FEAR!", "DESPAIR!"}
	escalationSuffixes := []string{"...and it grows stronger!", "...the horror spreads!", "...reality bends!", "...chaos reigns!"}

	prefix := escalationPrefixes[rand.Intn(len(escalationPrefixes))]
	suffix := escalationSuffixes[rand.Intn(len(escalationSuffixes))]

	return prefix + " " + strings.ToUpper(content) + " " + suffix
}

func (ill *InteractiveLoreLooper) calculateQualityScore(input, output string) float64 {
	// Simple quality scoring based on content changes
	if input == output {
		return 0.0
	}

	lengthDiff := float64(len(output)) / float64(len(input))
	complexityBonus := 0.0

	// Bonus for adding interesting words
	interestingWords := []string{"ancient", "cursed", "eldritch", "abyssal", "profane", "blasphemous"}
	for _, word := range interestingWords {
		if strings.Contains(strings.ToLower(output), word) {
			complexityBonus += 0.1
		}
	}

	score := lengthDiff + complexityBonus
	if score > 10.0 {
		score = 10.0
	}

	return score
}

func (ill *InteractiveLoreLooper) manageActiveLoops() {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ill.ctx.Done():
			return
		case <-ticker.C:
			ill.cleanupExpiredLoops()
		}
	}
}

func (ill *InteractiveLoreLooper) cleanupExpiredLoops() {
	ill.mutex.Lock()
	defer ill.mutex.Unlock()

	cutoff := time.Now().Add(-ill.loopTimeout)
	toDelete := make([]string, 0)

	for loopID, loop := range ill.activeLoops {
		if loop.LastActivity.Before(cutoff) || loop.Status == "completed" {
			toDelete = append(toDelete, loopID)
		}
	}

	for _, loopID := range toDelete {
		delete(ill.activeLoops, loopID)
		ill.logger.WithField("loop_id", loopID).Info("🧹 Cleaned up expired loop")
	}
}

// Name returns the name of the looper
func (ill *InteractiveLoreLooper) Name() string {
	return "interactive_lore_looper"
}

// IsHealthy returns the health status of the looper
func (ill *InteractiveLoreLooper) IsHealthy() bool {
	return true
}

// Stop gracefully shuts down the looper
func (ill *InteractiveLoreLooper) Stop() {
	ill.cancel()
	ill.logger.Info("🛑 Interactive Lore Looper stopped")
}
