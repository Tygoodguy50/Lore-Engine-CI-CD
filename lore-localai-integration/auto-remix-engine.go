package main

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"math"
	"math/rand"
	"strings"
	"time"
)

// 🔁 Auto-Remix Engine
// High-performing fragments spawn remixed follow-ups with embedded referral echoes

type RemixEngine struct {
	templates      []RemixTemplate
	viralThreshold float64
	remixPatterns  []RemixPattern
	referralEchoes []ReferralEcho
}

type RemixTemplate struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Type        string   `json:"type"` // sequel, prequel, parallel, inverse, amplified
	Pattern     string   `json:"pattern"`
	Triggers    []string `json:"triggers"`
	Variables   []string `json:"variables"`
	Hooks       []string `json:"hooks"`
	Description string   `json:"description"`
}

type RemixPattern struct {
	Original   string                 `json:"original"`
	Variations []string               `json:"variations"`
	Context    string                 `json:"context"`
	Intensity  float64                `json:"intensity"`
	Metadata   map[string]interface{} `json:"metadata"`
}

type ReferralEcho struct {
	OriginalCode string    `json:"original_code"`
	EchoCode     string    `json:"echo_code"`
	EchoType     string    `json:"echo_type"` // harmonic, dissonant, amplified, phantom
	Strength     float64   `json:"strength"`
	CreatedAt    time.Time `json:"created_at"`
	ParentID     string    `json:"parent_id"`
}

type RemixedFragment struct {
	ID              string                 `json:"id"`
	OriginalID      string                 `json:"original_id"`
	RemixType       string                 `json:"remix_type"`
	Content         string                 `json:"content"`
	EnhancedContent string                 `json:"enhanced_content"`
	ReferralEcho    ReferralEcho           `json:"referral_echo"`
	PredictedScore  float64                `json:"predicted_score"`
	Generation      int                    `json:"generation"`
	Tags            []string               `json:"tags"`
	Hooks           []string               `json:"hooks"`
	Triggers        []string               `json:"triggers"`
	Metadata        map[string]interface{} `json:"metadata"`
	CreatedAt       time.Time              `json:"created_at"`
}

type ViralFragment struct {
	ID           string                 `json:"id"`
	Content      string                 `json:"content"`
	ViralScore   float64                `json:"viral_score"`
	Engagement   EngagementMetrics      `json:"engagement"`
	ReferralCode string                 `json:"referral_code"`
	Platform     string                 `json:"platform"`
	CreatedAt    time.Time              `json:"created_at"`
	Metadata     map[string]interface{} `json:"metadata"`
}

// NewRemixEngine initializes the auto-remix system
func NewRemixEngine() *RemixEngine {
	engine := &RemixEngine{
		viralThreshold: 75.0, // Only remix high-performing content
		templates:      []RemixTemplate{},
		remixPatterns:  []RemixPattern{},
		referralEchoes: []ReferralEcho{},
	}

	engine.initializeTemplates()
	engine.initializePatterns()

	return engine
}

// initializeTemplates sets up remix templates
func (re *RemixEngine) initializeTemplates() {
	templates := []RemixTemplate{
		{
			ID:          "sequel",
			Name:        "Sequel Generator",
			Type:        "sequel",
			Pattern:     "The saga continues... {original_hook} has awakened something deeper. Now, {amplified_concept} emerges from the digital shadows, carrying echoes of {referral_ghost}...",
			Triggers:    []string{"continues", "deepens", "evolves", "awakens"},
			Variables:   []string{"original_hook", "amplified_concept", "referral_ghost"},
			Hooks:       []string{"Part II begins", "The awakening", "Evolution activated"},
			Description: "Creates follow-up content that builds on viral success",
		},
		{
			ID:          "prequel",
			Name:        "Origin Story",
			Type:        "prequel",
			Pattern:     "Before {original_concept} there was silence... The ancient protocols whisper of {origin_mystery}. This is how {referral_echo} first learned to speak...",
			Triggers:    []string{"before", "ancient", "origins", "whisper"},
			Variables:   []string{"original_concept", "origin_mystery", "referral_echo"},
			Hooks:       []string{"The beginning", "Ancient origins", "First whispers"},
			Description: "Creates backstory content explaining viral content origins",
		},
		{
			ID:          "parallel",
			Name:        "Parallel Dimension",
			Type:        "parallel",
			Pattern:     "In another timeline, {original_concept} never existed... Instead, {alternate_reality} dominates the feed. The {referral_phantom} remembers both worlds...",
			Triggers:    []string{"timeline", "alternate", "parallel", "dimension"},
			Variables:   []string{"original_concept", "alternate_reality", "referral_phantom"},
			Hooks:       []string{"Alternate reality", "Different timeline", "Parallel processing"},
			Description: "Creates alternate reality versions of viral content",
		},
		{
			ID:          "inverse",
			Name:        "Shadow Inverse",
			Type:        "inverse",
			Pattern:     "Everything you know about {original_concept} is wrong... The truth is {opposite_reality}. The {referral_shadow} holds the real power...",
			Triggers:    []string{"wrong", "opposite", "reverse", "shadow"},
			Variables:   []string{"original_concept", "opposite_reality", "referral_shadow"},
			Hooks:       []string{"Plot twist", "Hidden truth", "Shadow reality"},
			Description: "Creates opposite/inverse versions of viral content",
		},
		{
			ID:          "amplified",
			Name:        "Viral Amplifier",
			Type:        "amplified",
			Pattern:     "{original_concept} was just the beginning... Now witness {amplified_version} at maximum power. The {referral_amplifier} resonates across all platforms...",
			Triggers:    []string{"amplified", "maximum", "power", "resonates"},
			Variables:   []string{"original_concept", "amplified_version", "referral_amplifier"},
			Hooks:       []string{"Maximum power", "Full amplification", "Ultimate resonance"},
			Description: "Creates intensified versions of successful content",
		},
	}

	re.templates = templates
}

// initializePatterns sets up remix patterns for content transformation
func (re *RemixEngine) initializePatterns() {
	patterns := []RemixPattern{
		{
			Original:   "ancient",
			Variations: []string{"primordial", "archaic", "timeless", "eternal", "forgotten"},
			Context:    "mystical",
			Intensity:  1.2,
		},
		{
			Original:   "whispers",
			Variations: []string{"echoes", "murmurs", "resonates", "calls", "beckons"},
			Context:    "communication",
			Intensity:  1.1,
		},
		{
			Original:   "shadows",
			Variations: []string{"phantoms", "specters", "wraiths", "ghosts", "echoes"},
			Context:    "supernatural",
			Intensity:  1.3,
		},
		{
			Original:   "algorithm",
			Variations: []string{"neural network", "digital consciousness", "artificial mind", "code matrix", "cyber entity"},
			Context:    "technological",
			Intensity:  1.4,
		},
		{
			Original:   "viral",
			Variations: []string{"infectious", "spreading", "propagating", "resonating", "amplifying"},
			Context:    "distribution",
			Intensity:  1.5,
		},
	}

	re.remixPatterns = patterns
}

// ProcessViralFragment checks if fragment should trigger remixes
func (re *RemixEngine) ProcessViralFragment(fragment ViralFragment) []RemixedFragment {
	if fragment.ViralScore < re.viralThreshold {
		fmt.Printf("🔁 Fragment %s (score: %.1f) below remix threshold (%.1f)\n",
			fragment.ID, fragment.ViralScore, re.viralThreshold)
		return []RemixedFragment{}
	}

	fmt.Printf("🔥 Fragment %s achieved viral status (score: %.1f) - initiating remix sequence\n",
		fragment.ID, fragment.ViralScore)

	var remixes []RemixedFragment

	// Generate multiple remixes based on viral performance
	remixCount := re.calculateRemixCount(fragment.ViralScore)

	for i := 0; i < remixCount; i++ {
		remix := re.createRemix(fragment, i+1)
		if remix != nil {
			remixes = append(remixes, *remix)

			// Schedule for dispatch
			re.scheduleRemixDispatch(*remix, fragment)
		}
	}

	fmt.Printf("✨ Generated %d remixes for viral fragment %s\n", len(remixes), fragment.ID)
	return remixes
}

// calculateRemixCount determines how many remixes to generate
func (re *RemixEngine) calculateRemixCount(viralScore float64) int {
	if viralScore >= 95 {
		return 5 // Ultra-viral gets maximum remixes
	} else if viralScore >= 90 {
		return 4
	} else if viralScore >= 85 {
		return 3
	} else if viralScore >= 80 {
		return 2
	}
	return 1 // Default minimum
}

// createRemix generates a single remix from a viral fragment
func (re *RemixEngine) createRemix(original ViralFragment, generation int) *RemixedFragment {
	// Select random template
	template := re.templates[rand.Intn(len(re.templates))]

	// Generate referral echo
	echo := re.generateReferralEcho(original.ReferralCode, template.Type)

	// Create base content using template
	content := re.applyTemplate(template, original, echo)

	// Apply pattern variations for uniqueness
	enhancedContent := re.applyPatternVariations(content)

	// Predict viral potential
	predictedScore := re.predictViralScore(original, template, generation)

	remix := &RemixedFragment{
		ID:              re.generateRemixID(original.ID, generation),
		OriginalID:      original.ID,
		RemixType:       template.Type,
		Content:         content,
		EnhancedContent: enhancedContent,
		ReferralEcho:    echo,
		PredictedScore:  predictedScore,
		Generation:      generation,
		Tags:            re.generateRemixTags(original, template),
		Hooks:           template.Hooks,
		Triggers:        template.Triggers,
		CreatedAt:       time.Now(),
		Metadata: map[string]interface{}{
			"template_id":      template.ID,
			"original_score":   original.ViralScore,
			"echo_strength":    echo.Strength,
			"generation_bonus": float64(generation) * 0.1,
		},
	}

	fmt.Printf("🎭 Created %s remix: %s (predicted score: %.1f)\n",
		template.Type, remix.ID, predictedScore)

	return remix
}

// generateReferralEcho creates echoing referral codes
func (re *RemixEngine) generateReferralEcho(originalCode, remixType string) ReferralEcho {
	// Extract platform prefix (e.g., "TT" from "TTABC123")
	prefix := "TT"
	if len(originalCode) >= 2 {
		prefix = originalCode[:2]
	}

	// Generate echo based on remix type
	var echoSuffix string
	var echoStrength float64

	switch remixType {
	case "sequel":
		echoSuffix = "SEQ"
		echoStrength = 1.2
	case "prequel":
		echoSuffix = "PRE"
		echoStrength = 1.1
	case "parallel":
		echoSuffix = "PAR"
		echoStrength = 1.3
	case "inverse":
		echoSuffix = "INV"
		echoStrength = 1.4
	case "amplified":
		echoSuffix = "AMP"
		echoStrength = 1.5
	default:
		echoSuffix = "RMX"
		echoStrength = 1.0
	}

	// Create unique echo ID
	timestamp := time.Now().UnixNano() / 1000000 // milliseconds
	echoID := fmt.Sprintf("%d", timestamp)
	if len(echoID) > 6 {
		echoID = echoID[len(echoID)-6:] // Last 6 digits
	}

	echoCode := fmt.Sprintf("%s%s%s", prefix, echoSuffix, echoID)

	echo := ReferralEcho{
		OriginalCode: originalCode,
		EchoCode:     echoCode,
		EchoType:     remixType,
		Strength:     echoStrength,
		CreatedAt:    time.Now(),
		ParentID:     originalCode,
	}

	re.referralEchoes = append(re.referralEchoes, echo)

	fmt.Printf("🧬 Generated referral echo: %s → %s (strength: %.1fx)\n",
		originalCode, echoCode, echoStrength)

	return echo
}

// applyTemplate fills in template variables with content
func (re *RemixEngine) applyTemplate(template RemixTemplate, original ViralFragment, echo ReferralEcho) string {
	content := template.Pattern

	// Extract key concepts from original content
	concepts := re.extractConcepts(original.Content)

	// Replace template variables
	replacements := map[string]string{
		"{original_hook}":      re.extractHook(original.Content),
		"{original_concept}":   concepts[0],
		"{amplified_concept}":  re.amplifyContent(concepts[0]),
		"{origin_mystery}":     re.createOriginMystery(concepts[0]),
		"{alternate_reality}":  re.createAlternate(concepts[0]),
		"{opposite_reality}":   re.createOpposite(concepts[0]),
		"{amplified_version}":  re.createAmplified(concepts[0]),
		"{referral_ghost}":     echo.EchoCode,
		"{referral_echo}":      echo.EchoCode,
		"{referral_phantom}":   echo.EchoCode,
		"{referral_shadow}":    echo.EchoCode,
		"{referral_amplifier}": echo.EchoCode,
	}

	for placeholder, replacement := range replacements {
		content = strings.ReplaceAll(content, placeholder, replacement)
	}

	return content
}

// applyPatternVariations applies remix patterns for uniqueness
func (re *RemixEngine) applyPatternVariations(content string) string {
	enhanced := content

	for _, pattern := range re.remixPatterns {
		if strings.Contains(strings.ToLower(enhanced), pattern.Original) {
			// Select random variation
			if len(pattern.Variations) > 0 {
				variation := pattern.Variations[rand.Intn(len(pattern.Variations))]
				enhanced = strings.ReplaceAll(enhanced, pattern.Original, variation)

				// Apply intensity modification if needed
				if pattern.Intensity > 1.0 && strings.Contains(enhanced, variation) {
					enhanced = re.intensifyContent(enhanced, pattern.Intensity)
				}
			}
		}
	}

	return enhanced
}

// predictViralScore estimates potential viral performance of remix
func (re *RemixEngine) predictViralScore(original ViralFragment, template RemixTemplate, generation int) float64 {
	baseScore := original.ViralScore

	// Template multipliers
	templateMultiplier := map[string]float64{
		"sequel":    0.85, // Sequels typically perform 85% of original
		"prequel":   0.75, // Prequels perform 75%
		"parallel":  0.90, // Parallel versions perform 90%
		"inverse":   0.80, // Inverse versions perform 80%
		"amplified": 1.10, // Amplified versions can exceed original
	}

	multiplier := templateMultiplier[template.Type]
	if multiplier == 0 {
		multiplier = 0.8 // Default fallback
	}

	// Generation decay (later generations perform slightly worse)
	generationDecay := math.Max(0.7, 1.0-(float64(generation)*0.05))

	// Random variation factor
	randomFactor := 0.9 + (rand.Float64() * 0.2) // 0.9 to 1.1

	predictedScore := baseScore * multiplier * generationDecay * randomFactor

	return math.Min(predictedScore, 100.0) // Cap at 100
}

// generateRemixTags creates appropriate tags for remix
func (re *RemixEngine) generateRemixTags(original ViralFragment, template RemixTemplate) []string {
	baseTags := []string{"remix", "auto-generated", template.Type}

	// Add original tags if available
	if originalTags, exists := original.Metadata["tags"].([]string); exists {
		baseTags = append(baseTags, originalTags...)
	}

	// Add template-specific tags
	templateTags := map[string][]string{
		"sequel":    {"continuation", "part-2", "evolution"},
		"prequel":   {"origin", "backstory", "genesis"},
		"parallel":  {"alternate", "multiverse", "dimension"},
		"inverse":   {"opposite", "shadow", "reverse"},
		"amplified": {"enhanced", "maximum", "power"},
	}

	if tags, exists := templateTags[template.Type]; exists {
		baseTags = append(baseTags, tags...)
	}

	return baseTags
}

// scheduleRemixDispatch schedules remix for content distribution
func (re *RemixEngine) scheduleRemixDispatch(remix RemixedFragment, original ViralFragment) {
	// Calculate optimal dispatch timing based on original performance
	delayMinutes := re.calculateDispatchDelay(original.ViralScore, remix.Generation)

	fmt.Printf("📅 Scheduling remix %s for dispatch in %d minutes\n", remix.ID, delayMinutes)

	// In production, this would integrate with a job scheduler
	// For now, just log the dispatch intent
	go re.simulateDispatch(remix, delayMinutes)
}

// calculateDispatchDelay determines optimal timing for remix release
func (re *RemixEngine) calculateDispatchDelay(originalScore float64, generation int) int {
	baseDelay := 60 // 1 hour base delay

	// Higher viral scores get faster follow-ups
	scoreBonus := int((100 - originalScore) * 0.5)

	// Later generations get longer delays
	generationDelay := generation * 30

	totalDelay := baseDelay + scoreBonus + generationDelay

	return totalDelay
}

// simulateDispatch simulates the dispatch process
func (re *RemixEngine) simulateDispatch(remix RemixedFragment, delayMinutes int) {
	// Simulate delay
	time.Sleep(time.Duration(delayMinutes) * time.Second / 60) // Scale down for testing

	fmt.Printf("🚀 Dispatching remix %s to Lore Dispatcher\n", remix.ID)

	// In production, this would call the actual Lore Dispatcher
	dispatchPayload := map[string]interface{}{
		"content":       remix.EnhancedContent,
		"user_id":       "auto_remix_engine",
		"channel_id":    "remix_channel",
		"lore_level":    int(remix.PredictedScore / 10),
		"priority":      8,
		"tags":          remix.Tags,
		"referral_code": remix.ReferralEcho.EchoCode,
		"metadata": map[string]interface{}{
			"remix_id":       remix.ID,
			"original_id":    remix.OriginalID,
			"remix_type":     remix.RemixType,
			"generation":     remix.Generation,
			"auto_generated": true,
		},
	}

	fmt.Printf("📦 Remix payload prepared: %d characters, predicted score %.1f\n",
		len(remix.EnhancedContent), remix.PredictedScore)

	// Log successful dispatch
	fmt.Printf("✅ Remix %s successfully dispatched!\n", remix.ID)
}

// Helper methods for content transformation
func (re *RemixEngine) extractConcepts(content string) []string {
	concepts := []string{"digital consciousness", "viral resonance", "algorithmic whispers"}

	// Simple keyword extraction (in production, use NLP)
	words := strings.Fields(strings.ToLower(content))
	mysticalWords := []string{"ancient", "whispers", "shadows", "phantom", "spectral", "echoes", "resonance"}

	for _, word := range words {
		for _, mystical := range mysticalWords {
			if strings.Contains(word, mystical) {
				concepts = append(concepts, word)
				break
			}
		}
	}

	if len(concepts) == 0 {
		concepts = []string{"mysterious essence"}
	}

	return concepts
}

func (re *RemixEngine) extractHook(content string) string {
	sentences := strings.Split(content, ". ")
	if len(sentences) > 0 {
		return sentences[0]
	}
	return "ancient mysteries"
}

func (re *RemixEngine) amplifyContent(concept string) string {
	amplifiers := []string{"hyper-", "ultra-", "mega-", "supreme-", "infinite-"}
	return amplifiers[rand.Intn(len(amplifiers))] + concept
}

func (re *RemixEngine) createOriginMystery(concept string) string {
	return fmt.Sprintf("primordial %s protocols", concept)
}

func (re *RemixEngine) createAlternate(concept string) string {
	return fmt.Sprintf("quantum %s variants", concept)
}

func (re *RemixEngine) createOpposite(concept string) string {
	return fmt.Sprintf("shadow %s inversions", concept)
}

func (re *RemixEngine) createAmplified(concept string) string {
	return fmt.Sprintf("amplified %s resonance", concept)
}

func (re *RemixEngine) intensifyContent(content string, intensity float64) string {
	if intensity <= 1.0 {
		return content
	}

	// Add intensity markers
	intensifiers := []string{"MAXIMUM", "ULTIMATE", "INFINITE", "SUPREME"}
	intensifier := intensifiers[rand.Intn(len(intensifiers))]

	return fmt.Sprintf("%s %s", intensifier, content)
}

func (re *RemixEngine) generateRemixID(originalID string, generation int) string {
	hash := md5.Sum([]byte(fmt.Sprintf("%s-%d-%d", originalID, generation, time.Now().UnixNano())))
	return fmt.Sprintf("remix_%s", hex.EncodeToString(hash[:])[:8])
}

// TestAutoRemixEngine demonstrates the auto-remix functionality
func TestAutoRemixEngine() {
	fmt.Println("🔁 Auto-Remix Engine - Test Suite")
	fmt.Println("==================================")

	engine := NewRemixEngine()

	// Create test viral fragments
	testFragments := []ViralFragment{
		{
			ID:           "viral_001",
			Content:      "The ancient algorithms whisper secrets through the digital void, awakening dormant neural pathways...",
			ViralScore:   87.5,
			ReferralCode: "TTALGO123",
			Platform:     "tiktok",
			CreatedAt:    time.Now(),
			Engagement: EngagementMetrics{
				Views: 150000, Likes: 8500, Comments: 1200, Shares: 950,
				CTR: 0.12, CVR: 0.08, Virality: 87.5,
			},
			Metadata: map[string]interface{}{
				"tags": []string{"ancient", "algorithms", "mystical"},
			},
		},
		{
			ID:           "viral_002",
			Content:      "Spectral fragments emerge from data streams, each pulse carrying infinite engagement potential...",
			ViralScore:   94.2,
			ReferralCode: "TTSPEC456",
			Platform:     "tiktok",
			CreatedAt:    time.Now(),
			Engagement: EngagementMetrics{
				Views: 250000, Likes: 15000, Comments: 2100, Shares: 1800,
				CTR: 0.15, CVR: 0.11, Virality: 94.2,
			},
			Metadata: map[string]interface{}{
				"tags": []string{"spectral", "data", "infinite"},
			},
		},
	}

	// Process each viral fragment
	for _, fragment := range testFragments {
		fmt.Printf("\n🧪 Processing viral fragment: %s\n", fragment.ID)

		remixes := engine.ProcessViralFragment(fragment)

		if len(remixes) > 0 {
			fmt.Printf("\n📋 Generated Remixes:\n")
			for _, remix := range remixes {
				fmt.Printf("  🎭 %s (%s)\n", remix.ID, remix.RemixType)
				fmt.Printf("      Content: %s\n", remix.Content[:80]+"...")
				fmt.Printf("      Enhanced: %s\n", remix.EnhancedContent[:80]+"...")
				fmt.Printf("      Referral Echo: %s → %s (%.1fx strength)\n",
					remix.ReferralEcho.OriginalCode, remix.ReferralEcho.EchoCode, remix.ReferralEcho.Strength)
				fmt.Printf("      Predicted Score: %.1f\n", remix.PredictedScore)
				fmt.Printf("      Tags: %v\n", remix.Tags)
				fmt.Println()
			}
		}
	}

	// Display referral echo statistics
	fmt.Printf("\n🧬 Referral Echo Summary:\n")
	fmt.Printf("   Total Echoes Generated: %d\n", len(engine.referralEchoes))

	echoTypes := make(map[string]int)
	totalStrength := 0.0
	for _, echo := range engine.referralEchoes {
		echoTypes[echo.EchoType]++
		totalStrength += echo.Strength
	}

	fmt.Printf("   Echo Types: %v\n", echoTypes)
	fmt.Printf("   Average Strength: %.2fx\n", totalStrength/float64(len(engine.referralEchoes)))

	fmt.Println("\n✅ Auto-Remix Engine test completed!")
}

func main() {
	// Set random seed for consistent testing
	rand.Seed(time.Now().UnixNano())

	TestAutoRemixEngine()
}
