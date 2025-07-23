package main

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"regexp"
	"strings"
	"time"
)

// Standalone test for Input Normalization Filter
func TestInputFilterStandalone() {
	fmt.Println("🧼 Input Normalization Pre-Filter - Standalone Test")
	fmt.Println("==================================================")

	// Basic normalization test
	rawContent := "   The ancient cosmic void whispers secrets    "
	normalized := strings.TrimSpace(rawContent)
	re := regexp.MustCompile(`\s+`)
	normalized = re.ReplaceAllString(normalized, " ")

	fmt.Printf("Original: '%s'\n", rawContent)
	fmt.Printf("Normalized: '%s'\n", normalized)

	// Auto-tagging test
	content := "The cursed shadows emerge from the ancient void"
	tags := []string{"lore", "filtered"}

	patterns := map[string]*regexp.Regexp{
		"cosmic": regexp.MustCompile(`(?i)(cosmic|void|ancient|eternal|infinite)`),
		"cursed": regexp.MustCompile(`(?i)(cursed|dark|shadow|nightmare|horror)`),
	}

	for tagName, pattern := range patterns {
		if pattern.MatchString(content) {
			tags = append(tags, tagName)
		}
	}

	fmt.Printf("Content: %s\n", content)
	fmt.Printf("Auto-tags: %v\n", tags)

	// Lore level estimation
	mysticalWords := []string{"ancient", "cosmic", "void", "cursed", "shadows"}
	count := 0
	for _, word := range mysticalWords {
		if strings.Contains(strings.ToLower(content), word) {
			count++
		}
	}

	loreLevel := 3 + count
	if loreLevel > 10 {
		loreLevel = 10
	}

	fmt.Printf("Estimated lore level: %d (found %d mystical words)\n", loreLevel, count)

	// Generate referral code
	timestamp := time.Now().Unix()
	hash := md5.Sum([]byte(fmt.Sprintf("lore:%d", timestamp)))
	referralCode := fmt.Sprintf("LR%s", hex.EncodeToString(hash[:])[:6])

	fmt.Printf("Generated referral code: %s\n", referralCode)

	fmt.Println("✅ Input normalization test completed!")
}

func main() {
	TestInputFilterStandalone()
}
