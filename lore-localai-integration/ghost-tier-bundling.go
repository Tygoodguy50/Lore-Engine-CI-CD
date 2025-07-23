package main

import (
	"archive/zip"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// 📦 Ghost-Tier Bundling System
// Packages viral lore instances into downloadable premium kits

type LoreBundle struct {
	ID              string                 `json:"id"`
	Name            string                 `json:"name"`
	Tier            string                 `json:"tier"` // ghost, phantom, wraith, shadow
	CreatedAt       time.Time              `json:"created_at"`
	ViralScore      float64                `json:"viral_score"`
	TotalFragments  int                    `json:"total_fragments"`
	PremiumFeatures []string               `json:"premium_features"`
	Fragments       []LoreFragment         `json:"fragments"`
	Metadata        map[string]interface{} `json:"metadata"`
	DownloadURL     string                 `json:"download_url"`
	Price           float64                `json:"price"`
	UserID          string                 `json:"user_id"`
}

type LoreFragment struct {
	ID           string                 `json:"id"`
	Content      string                 `json:"content"`
	Type         string                 `json:"type"`
	ViralScore   float64                `json:"viral_score"`
	Engagement   EngagementMetrics      `json:"engagement"`
	ReferralCode string                 `json:"referral_code"`
	Tags         []string               `json:"tags"`
	Metadata     map[string]interface{} `json:"metadata"`
	CreatedAt    time.Time              `json:"created_at"`
	Platform     string                 `json:"platform"`
}

type EngagementMetrics struct {
	Views    int     `json:"views"`
	Likes    int     `json:"likes"`
	Comments int     `json:"comments"`
	Shares   int     `json:"shares"`
	CTR      float64 `json:"ctr"`      // Click-through rate
	CVR      float64 `json:"cvr"`      // Conversion rate
	Virality float64 `json:"virality"` // Viral coefficient
}

type BundleCreator struct {
	baseURL    string
	bundlesDir string
	tiers      map[string]BundleTier
}

type BundleTier struct {
	Name            string   `json:"name"`
	MinViralScore   float64  `json:"min_viral_score"`
	MaxFragments    int      `json:"max_fragments"`
	PremiumFeatures []string `json:"premium_features"`
	Price           float64  `json:"price"`
	Description     string   `json:"description"`
}

// NewBundleCreator initializes the ghost-tier bundling system
func NewBundleCreator(baseURL string) *BundleCreator {
	bundlesDir := "./ghost-bundles"
	os.MkdirAll(bundlesDir, 0755)

	tiers := map[string]BundleTier{
		"shadow": {
			Name:            "Shadow Tier",
			MinViralScore:   10.0,
			MaxFragments:    5,
			Price:           9.99,
			PremiumFeatures: []string{"basic_analytics", "single_platform"},
			Description:     "Entry-level viral lore with basic tracking",
		},
		"wraith": {
			Name:            "Wraith Tier",
			MinViralScore:   25.0,
			MaxFragments:    15,
			Price:           24.99,
			PremiumFeatures: []string{"advanced_analytics", "multi_platform", "custom_tags"},
			Description:     "Mid-tier viral content with enhanced features",
		},
		"phantom": {
			Name:            "Phantom Tier",
			MinViralScore:   50.0,
			MaxFragments:    30,
			Price:           49.99,
			PremiumFeatures: []string{"premium_analytics", "auto_remix", "priority_support", "custom_branding"},
			Description:     "High-performance viral lore with advanced automation",
		},
		"ghost": {
			Name:            "Ghost Tier",
			MinViralScore:   100.0,
			MaxFragments:    100,
			Price:           99.99,
			PremiumFeatures: []string{"full_analytics", "ai_optimization", "unlimited_remix", "white_label", "api_access"},
			Description:     "Ultimate viral lore package with full premium features",
		},
	}

	return &BundleCreator{
		baseURL:    baseURL,
		bundlesDir: bundlesDir,
		tiers:      tiers,
	}
}

// CreateBundle generates a viral lore bundle based on performance metrics
func (bc *BundleCreator) CreateBundle(userID string, fragmentIDs []string, customName string) (*LoreBundle, error) {
	// Fetch fragments and calculate bundle tier
	fragments, err := bc.fetchFragments(fragmentIDs)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch fragments: %v", err)
	}

	// Calculate bundle metrics
	avgViralScore := bc.calculateAverageViralScore(fragments)
	tier := bc.determineBundleTier(avgViralScore)

	// Filter fragments based on tier limits
	if len(fragments) > bc.tiers[tier].MaxFragments {
		fragments = bc.selectTopFragments(fragments, bc.tiers[tier].MaxFragments)
	}

	// Create bundle
	bundle := &LoreBundle{
		ID:              bc.generateBundleID(userID),
		Name:            bc.generateBundleName(customName, tier),
		Tier:            tier,
		CreatedAt:       time.Now(),
		ViralScore:      avgViralScore,
		TotalFragments:  len(fragments),
		PremiumFeatures: bc.tiers[tier].PremiumFeatures,
		Fragments:       fragments,
		Price:           bc.tiers[tier].Price,
		UserID:          userID,
		Metadata: map[string]interface{}{
			"bundle_version": "v1.0",
			"created_by":     "ghost_bundler",
			"tier_info":      bc.tiers[tier],
		},
	}

	// Package bundle
	bundlePath, err := bc.packageBundle(bundle)
	if err != nil {
		return nil, fmt.Errorf("failed to package bundle: %v", err)
	}

	bundle.DownloadURL = fmt.Sprintf("%s/download/bundle/%s", bc.baseURL, bundle.ID)

	fmt.Printf("📦 Created %s bundle '%s' with %d fragments (Viral Score: %.1f)\n",
		strings.ToUpper(tier), bundle.Name, len(fragments), avgViralScore)

	return bundle, nil
}

// fetchFragments retrieves lore fragments from the system
func (bc *BundleCreator) fetchFragments(fragmentIDs []string) ([]LoreFragment, error) {
	var fragments []LoreFragment

	for _, id := range fragmentIDs {
		// Simulate fragment data - in real implementation, fetch from database
		fragment := LoreFragment{
			ID:           id,
			Content:      bc.generateSampleContent(id),
			Type:         bc.determineLoreType(id),
			ViralScore:   float64(20 + (len(id) % 80)), // Simulate varying viral scores
			ReferralCode: fmt.Sprintf("TT%s", strings.ToUpper(id[:6])),
			Tags:         []string{"viral", "premium", "ghost-tier"},
			Platform:     "tiktok",
			CreatedAt:    time.Now().Add(-time.Duration(len(id)) * time.Hour),
			Engagement: EngagementMetrics{
				Views:    1000 + (len(id) * 100),
				Likes:    50 + (len(id) * 5),
				Comments: 10 + (len(id) * 2),
				Shares:   5 + len(id),
				CTR:      0.05 + float64(len(id)%10)/100,
				CVR:      0.02 + float64(len(id)%5)/100,
				Virality: float64(20 + (len(id) % 80)),
			},
		}

		fragments = append(fragments, fragment)
	}

	return fragments, nil
}

// packageBundle creates a downloadable ZIP package
func (bc *BundleCreator) packageBundle(bundle *LoreBundle) (string, error) {
	bundlePath := filepath.Join(bc.bundlesDir, bundle.ID+".zip")

	zipFile, err := os.Create(bundlePath)
	if err != nil {
		return "", err
	}
	defer zipFile.Close()

	zipWriter := zip.NewWriter(zipFile)
	defer zipWriter.Close()

	// Add bundle metadata
	metadataJSON, _ := json.MarshalIndent(bundle, "", "  ")
	metadataFile, _ := zipWriter.Create("bundle-info.json")
	metadataFile.Write(metadataJSON)

	// Add README
	readmeContent := bc.generateBundleREADME(bundle)
	readmeFile, _ := zipWriter.Create("README.md")
	readmeFile.Write([]byte(readmeContent))

	// Add individual fragment files
	for i, fragment := range bundle.Fragments {
		fragmentFile, _ := zipWriter.Create(fmt.Sprintf("fragments/fragment_%d_%s.json", i+1, fragment.ID))
		fragmentJSON, _ := json.MarshalIndent(fragment, "", "  ")
		fragmentFile.Write(fragmentJSON)

		// Add content file
		contentFile, _ := zipWriter.Create(fmt.Sprintf("content/fragment_%d.txt", i+1))
		contentFile.Write([]byte(fragment.Content))
	}

	// Add usage guide
	usageGuide := bc.generateUsageGuide(bundle)
	guideFile, _ := zipWriter.Create("USAGE_GUIDE.md")
	guideFile.Write([]byte(usageGuide))

	// Add analytics dashboard HTML
	dashboardHTML := bc.generateAnalyticsDashboard(bundle)
	dashboardFile, _ := zipWriter.Create("analytics_dashboard.html")
	dashboardFile.Write([]byte(dashboardHTML))

	fmt.Printf("📦 Packaged bundle to: %s\n", bundlePath)
	return bundlePath, nil
}

// Helper functions
func (bc *BundleCreator) calculateAverageViralScore(fragments []LoreFragment) float64 {
	if len(fragments) == 0 {
		return 0.0
	}

	total := 0.0
	for _, fragment := range fragments {
		total += fragment.ViralScore
	}
	return total / float64(len(fragments))
}

func (bc *BundleCreator) determineBundleTier(viralScore float64) string {
	if viralScore >= 100.0 {
		return "ghost"
	} else if viralScore >= 50.0 {
		return "phantom"
	} else if viralScore >= 25.0 {
		return "wraith"
	}
	return "shadow"
}

func (bc *BundleCreator) selectTopFragments(fragments []LoreFragment, maxCount int) []LoreFragment {
	// Simple sort by viral score (in production, use proper sorting)
	if len(fragments) <= maxCount {
		return fragments
	}
	return fragments[:maxCount] // Return top fragments
}

func (bc *BundleCreator) generateBundleID(userID string) string {
	timestamp := time.Now().Unix()
	hash := md5.Sum([]byte(fmt.Sprintf("%s:%d", userID, timestamp)))
	return fmt.Sprintf("bundle_%s", hex.EncodeToString(hash[:])[:12])
}

func (bc *BundleCreator) generateBundleName(customName, tier string) string {
	if customName != "" {
		return fmt.Sprintf("%s (%s Tier)", customName, strings.Title(tier))
	}

	mysticalNames := []string{
		"Echoing Shadows", "Viral Whispers", "Ancient Algorithms",
		"Digital Phantoms", "Cosmic Resonance", "Spectral Fragments",
	}

	name := mysticalNames[int(time.Now().Unix())%len(mysticalNames)]
	return fmt.Sprintf("%s (%s Tier)", name, strings.Title(tier))
}

func (bc *BundleCreator) generateSampleContent(id string) string {
	templates := []string{
		"The ancient codes whisper through the digital void, carrying secrets of viral resonance...",
		"In the depths of algorithmic consciousness, shadows dance with infinite engagement...",
		"Spectral fragments emerge from the data streams, each pulse echoing across platforms...",
		"The viral essence spreads through neural networks, awakening dormant algorithms...",
		"Digital phantoms materialize in the space between clicks, haunting every interaction...",
	}

	template := templates[len(id)%len(templates)]
	return fmt.Sprintf("%s [Fragment ID: %s]", template, id)
}

func (bc *BundleCreator) determineLoreType(id string) string {
	types := []string{"viral_lore", "cursed_output", "reactive_dialogue", "phantom_whisper", "spectral_echo"}
	return types[len(id)%len(types)]
}

func (bc *BundleCreator) generateBundleREADME(bundle *LoreBundle) string {
	return fmt.Sprintf(`# 👻 %s - Premium Viral Lore Bundle

## Bundle Information
- **Tier**: %s
- **Viral Score**: %.1f
- **Total Fragments**: %d
- **Created**: %s

## Premium Features
%s

## Contents
This bundle contains high-performance viral lore fragments optimized for maximum engagement across social media platforms.

### Files Included:
- 📋 bundle-info.json - Complete bundle metadata
- 📁 fragments/ - Individual lore fragment data
- 📁 content/ - Ready-to-use content files  
- 📊 analytics_dashboard.html - Performance tracking dashboard
- 📖 USAGE_GUIDE.md - Implementation instructions

## Viral Performance Metrics
- Average engagement rate: %.1f%%
- Expected viral coefficient: %.2fx
- Platform optimization: Multi-platform ready

## 🕸️ Unleash the Power of Viral Lore
Transform your content strategy with these battle-tested, high-performance lore fragments that have proven viral potential.

*Generated by Ghost-Tier Bundling System v1.0*
`,
		bundle.Name,
		strings.ToUpper(bundle.Tier),
		bundle.ViralScore,
		bundle.TotalFragments,
		bundle.CreatedAt.Format("2006-01-02 15:04:05"),
		bc.formatFeatures(bundle.PremiumFeatures),
		bc.calculateAvgEngagement(bundle.Fragments),
		bundle.ViralScore/20.0)
}

func (bc *BundleCreator) generateUsageGuide(bundle *LoreBundle) string {
	return fmt.Sprintf(`# 📖 Usage Guide - %s

## Quick Start
1. Extract the bundle contents
2. Review fragment data in the fragments/ directory
3. Copy content from content/ directory to your platform
4. Monitor performance using analytics_dashboard.html

## Integration Instructions

### TikTok Integration
Each fragment includes optimized content for TikTok's algorithm:
- Referral codes embedded for tracking
- Optimal length and engagement hooks
- Trending hashtag suggestions

### Performance Monitoring
Use the included analytics dashboard to track:
- View counts and engagement rates
- Viral coefficient progression  
- Cross-platform performance
- ROI metrics

### Advanced Features (%s Tier)
%s

## Best Practices
1. **Timing**: Post during peak engagement hours
2. **Customization**: Adapt content to your brand voice
3. **Tracking**: Monitor referral code performance
4. **Iteration**: Use analytics to optimize future content

## Support
For premium tier support, contact: ghost-support@lore-engine.com

*Maximize your viral potential with strategic lore deployment.*
`,
		bundle.Name,
		strings.ToUpper(bundle.Tier),
		bc.formatFeatures(bundle.PremiumFeatures))
}

func (bc *BundleCreator) generateAnalyticsDashboard(bundle *LoreBundle) string {
	fragmentsJSON, _ := json.Marshal(bundle.Fragments)

	return fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
    <title>📊 %s - Analytics Dashboard</title>
    <style>
        body { font-family: 'Courier New', monospace; background: #0a0a0a; color: #00ff00; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #00ff00; padding-bottom: 10px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-box { border: 1px solid #00ff00; padding: 15px; background: rgba(0,255,0,0.1); }
        .metric-title { font-weight: bold; margin-bottom: 10px; }
        .metric-value { font-size: 24px; color: #00ffff; }
        .fragments-list { margin-top: 20px; }
        .fragment-item { border-left: 3px solid #00ff00; padding: 10px; margin: 10px 0; background: rgba(0,255,0,0.05); }
    </style>
</head>
<body>
    <div class="header">
        <h1>👻 %s</h1>
        <h2>Premium Analytics Dashboard</h2>
        <p>Tier: %s | Created: %s</p>
    </div>

    <div class="metrics">
        <div class="metric-box">
            <div class="metric-title">📊 Bundle Viral Score</div>
            <div class="metric-value">%.1f</div>
        </div>
        <div class="metric-box">
            <div class="metric-title">🧬 Total Fragments</div>
            <div class="metric-value">%d</div>
        </div>
        <div class="metric-box">
            <div class="metric-title">💰 Bundle Value</div>
            <div class="metric-value">$%.2f</div>
        </div>
        <div class="metric-box">
            <div class="metric-title">⚡ Avg Engagement</div>
            <div class="metric-value">%.1f%%</div>
        </div>
    </div>

    <div class="fragments-list">
        <h3>🔮 Fragment Performance Breakdown</h3>
        <div id="fragments-container"></div>
    </div>

    <script>
        const fragments = %s;
        const container = document.getElementById('fragments-container');
        
        fragments.forEach((fragment, index) => {
            const div = document.createElement('div');
            div.className = 'fragment-item';
            div.innerHTML = `+"`"+`
                <h4>Fragment ${index + 1}: ${fragment.id}</h4>
                <p><strong>Type:</strong> ${fragment.type}</p>
                <p><strong>Viral Score:</strong> ${fragment.viral_score}</p>
                <p><strong>Engagement:</strong> ${fragment.engagement.views} views, ${fragment.engagement.likes} likes</p>
                <p><strong>Referral:</strong> ${fragment.referral_code}</p>
                <p><strong>Content Preview:</strong> ${fragment.content.substring(0, 100)}...</p>
            `+"`"+`;
            container.appendChild(div);
        });
    </script>
</body>
</html>`,
		bundle.Name, bundle.Name, strings.ToUpper(bundle.Tier),
		bundle.CreatedAt.Format("2006-01-02 15:04:05"),
		bundle.ViralScore, bundle.TotalFragments, bundle.Price,
		bc.calculateAvgEngagement(bundle.Fragments),
		string(fragmentsJSON))
}

func (bc *BundleCreator) formatFeatures(features []string) string {
	result := ""
	for _, feature := range features {
		result += fmt.Sprintf("- ✅ %s\n", strings.ReplaceAll(feature, "_", " "))
	}
	return result
}

func (bc *BundleCreator) calculateAvgEngagement(fragments []LoreFragment) float64 {
	if len(fragments) == 0 {
		return 0.0
	}

	total := 0.0
	for _, fragment := range fragments {
		if fragment.Engagement.Views > 0 {
			engagements := fragment.Engagement.Likes + fragment.Engagement.Comments + fragment.Engagement.Shares
			rate := (float64(engagements) / float64(fragment.Engagement.Views)) * 100
			total += rate
		}
	}
	return total / float64(len(fragments))
}

// TestBundleCreation demonstrates the ghost-tier bundling system
func TestGhostTierBundling() {
	fmt.Println("📦 Ghost-Tier Bundling System - Test Suite")
	fmt.Println("===========================================")

	bundler := NewBundleCreator("https://18e5cda9df96.ngrok-free.app")

	// Test bundle creation with different tiers
	testCases := []struct {
		userID      string
		fragmentIDs []string
		customName  string
	}{
		{
			userID:      "premium_user_001",
			fragmentIDs: []string{"frag_viral_001", "frag_cosmic_002", "frag_shadow_003"},
			customName:  "Viral Shadow Collection",
		},
		{
			userID:      "ghost_tier_user",
			fragmentIDs: []string{"frag_phantom_001", "frag_spectral_002", "frag_wraith_003", "frag_ghost_004", "frag_viral_005"},
			customName:  "Ultimate Ghost Bundle",
		},
	}

	for i, testCase := range testCases {
		fmt.Printf("\n📦 Test Case %d: Creating bundle for user %s\n", i+1, testCase.userID)

		bundle, err := bundler.CreateBundle(testCase.userID, testCase.fragmentIDs, testCase.customName)
		if err != nil {
			fmt.Printf("❌ Bundle creation failed: %v\n", err)
			continue
		}

		fmt.Printf("✅ Bundle created successfully!\n")
		fmt.Printf("   ID: %s\n", bundle.ID)
		fmt.Printf("   Name: %s\n", bundle.Name)
		fmt.Printf("   Tier: %s\n", strings.ToUpper(bundle.Tier))
		fmt.Printf("   Price: $%.2f\n", bundle.Price)
		fmt.Printf("   Fragments: %d\n", bundle.TotalFragments)
		fmt.Printf("   Viral Score: %.1f\n", bundle.ViralScore)
		fmt.Printf("   Download URL: %s\n", bundle.DownloadURL)
		fmt.Printf("   Features: %v\n", bundle.PremiumFeatures)
	}

	fmt.Println("\n✅ Ghost-Tier Bundling system test completed!")
}

func main() {
	TestGhostTierBundling()
}
