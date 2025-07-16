package hooks

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
)

// Constants for markdown generation
const (
	dateFormat      = "2006-01-02"
	timeFormat      = "2006-01-02 15:04:05"
	fileTimeFormat  = "2006-01-02_15-04-05"
	generatedHeader = "**Generated:** %s\n"
	eventIDHeader   = "**Event ID:** %s\n\n"
)

// 📝 MarkdownInjector - Lore docs and cursed outputs
type MarkdownInjector struct {
	logger      *logrus.Logger
	outputDir   string
	templateDir string
	healthy     bool
	autoCommit  bool
	gitRepo     string
}

// NewMarkdownInjector creates a new Markdown injector integration
func NewMarkdownInjector() *MarkdownInjector {
	return &MarkdownInjector{
		logger:     logrus.New(),
		healthy:    false,
		autoCommit: false,
	}
}

func (mi *MarkdownInjector) Name() string {
	return "markdown"
}

func (mi *MarkdownInjector) Initialize(config map[string]interface{}) error {
	mi.logger.Info("📝 Initializing Markdown haunted integration")

	if dir, ok := config["output_dir"].(string); ok {
		mi.outputDir = dir
	} else {
		mi.outputDir = "./docs/haunted"
	}

	if templateDir, ok := config["template_dir"].(string); ok {
		mi.templateDir = templateDir
	} else {
		mi.templateDir = "./templates/haunted"
	}

	if autoCommit, ok := config["auto_commit"].(bool); ok {
		mi.autoCommit = autoCommit
	}

	if gitRepo, ok := config["git_repo"].(string); ok {
		mi.gitRepo = gitRepo
	}

	// Ensure output directory exists
	if err := os.MkdirAll(mi.outputDir, 0755); err != nil {
		return errors.Wrap(err, "failed to create output directory")
	}

	mi.healthy = true
	mi.logger.Info("✅ Markdown injector initialized")
	return nil
}

func (mi *MarkdownInjector) IsHealthy() bool {
	return mi.healthy
}

func (mi *MarkdownInjector) HandleEvent(event *HauntedEvent) error {
	mi.logger.WithFields(logrus.Fields{
		"event_id": event.ID,
		"type":     event.Type,
		"cursed":   event.Cursed,
	}).Info("📝 Markdown handling haunted event")

	switch event.Type {
	case "lore_response":
		return mi.handleLoreDocument(event)
	case "cursed_output":
		return mi.handleCursedOutput(event)
	case "session_summary":
		return mi.handleSessionSummary(event)
	case "debug_artifact":
		return mi.handleDebugArtifact(event)
	case "haunted_chronicle":
		return mi.handleHauntedChronicle(event)
	default:
		mi.logger.WithField("type", event.Type).Debug("Unknown event type for Markdown")
	}

	return nil
}

// 📜 handleLoreDocument processes lore responses into documentation
func (mi *MarkdownInjector) handleLoreDocument(event *HauntedEvent) error {
	mi.logger.Info("📜 Processing lore document")

	response, ok := event.Payload["response"].(string)
	if !ok {
		return errors.New("No response found in lore event")
	}

	query, _ := event.Payload["query"].(string)

	// Generate lore document
	content := mi.generateLoreDocument(response, query, event)

	// Create filename
	filename := mi.generateLoreFilename(query, event.Cursed)
	filepath := filepath.Join(mi.outputDir, "lore", filename)

	return mi.writeMarkdownFile(filepath, content, event)
}

// 🔮 handleCursedOutput processes cursed outputs
func (mi *MarkdownInjector) handleCursedOutput(event *HauntedEvent) error {
	mi.logger.Info("🔮 Processing cursed output")

	output, ok := event.Payload["output"].(string)
	if !ok {
		return errors.New("No output found in cursed event")
	}

	content := mi.generateCursedDocument(output, event)

	filename := fmt.Sprintf("cursed_%s.md", event.Timestamp.Format(fileTimeFormat))
	filepath := filepath.Join(mi.outputDir, "cursed", filename)

	return mi.writeMarkdownFile(filepath, content, event)
}

// 📊 handleSessionSummary processes session summaries
func (mi *MarkdownInjector) handleSessionSummary(event *HauntedEvent) error {
	mi.logger.Info("📊 Processing session summary")

	summary, ok := event.Payload["summary"].(string)
	if !ok {
		return errors.New("No summary found in session event")
	}

	content := mi.generateSessionDocument(summary, event)

	filename := fmt.Sprintf("session_%s.md", event.Timestamp.Format(dateFormat))
	filepath := filepath.Join(mi.outputDir, "sessions", filename)

	return mi.writeMarkdownFile(filepath, content, event)
}

// 🐛 handleDebugArtifact processes debug artifacts
func (mi *MarkdownInjector) handleDebugArtifact(event *HauntedEvent) error {
	mi.logger.Info("🐛 Processing debug artifact")

	artifact, ok := event.Payload["artifact"].(string)
	if !ok {
		return errors.New("No artifact found in debug event")
	}

	content := mi.generateDebugDocument(artifact, event)

	filename := fmt.Sprintf("debug_%s.md", event.Timestamp.Format(fileTimeFormat))
	filepath := filepath.Join(mi.outputDir, "debug", filename)

	return mi.writeMarkdownFile(filepath, content, event)
}

// 🔗 handleHauntedChronicle processes haunted chronicles
func (mi *MarkdownInjector) handleHauntedChronicle(event *HauntedEvent) error {
	mi.logger.Info("🔗 Processing haunted chronicle")

	chronicle, ok := event.Payload["chronicle"].(string)
	if !ok {
		return errors.New("No chronicle found in haunted event")
	}

	content := mi.generateChronicleDocument(chronicle, event)

	filename := fmt.Sprintf("chronicle_%s.md", event.Timestamp.Format(dateFormat))
	filepath := filepath.Join(mi.outputDir, "chronicles", filename)

	return mi.writeMarkdownFile(filepath, content, event)
}

// 📝 writeMarkdownFile writes content to markdown file
func (mi *MarkdownInjector) writeMarkdownFile(filePath string, content string, event *HauntedEvent) error {
	// Ensure directory exists
	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return errors.Wrap(err, "failed to create directory")
	}

	// Write file
	if err := os.WriteFile(filePath, []byte(content), 0644); err != nil {
		return errors.Wrap(err, "failed to write markdown file")
	}

	mi.logger.WithField("file", filePath).Info("✅ Markdown file written")

	// Auto-commit if enabled
	if mi.autoCommit && mi.gitRepo != "" {
		return mi.commitChanges(filePath, event)
	}

	return nil
}

// 📜 generateLoreDocument creates lore documentation
func (mi *MarkdownInjector) generateLoreDocument(response, query string, event *HauntedEvent) string {
	var content strings.Builder

	// Header
	content.WriteString("# 📜 Lore Document\n\n")
	content.WriteString(fmt.Sprintf(generatedHeader, event.Timestamp.Format(timeFormat)))
	content.WriteString(fmt.Sprintf("**Event ID:** %s\n", event.ID))
	content.WriteString(fmt.Sprintf("**Cursed:** %v\n", event.Cursed))
	content.WriteString(fmt.Sprintf("**Lore Level:** %d\n", event.LoreLevel))
	content.WriteString(fmt.Sprintf("**Sentiment:** %.2f\n\n", event.Sentiment))

	// Query section
	if query != "" {
		content.WriteString("## 🔍 Query\n\n")
		content.WriteString(fmt.Sprintf("```\n%s\n```\n\n", query))
	}

	// Response section
	content.WriteString("## 📖 Lore Response\n\n")
	content.WriteString(response)
	content.WriteString("\n\n")

	// Metadata section
	content.WriteString("## 📊 Metadata\n\n")
	content.WriteString("| Property | Value |\n")
	content.WriteString("|----------|-------|\n")
	content.WriteString(fmt.Sprintf("| Event Type | %s |\n", event.Type))
	content.WriteString(fmt.Sprintf("| Cursed | %v |\n", event.Cursed))
	content.WriteString(fmt.Sprintf("| Lore Level | %d |\n", event.LoreLevel))
	content.WriteString(fmt.Sprintf("| Sentiment | %.2f |\n", event.Sentiment))
	content.WriteString(fmt.Sprintf("| Timestamp | %s |\n", event.Timestamp.Format(timeFormat)))

	// Haunted styling
	if event.Cursed {
		content.WriteString("\n---\n")
		content.WriteString("*🔮 This document contains cursed knowledge. Read with caution...*\n")
	}

	return content.String()
}

// 🔮 generateCursedDocument creates cursed output documentation
func (mi *MarkdownInjector) generateCursedDocument(output string, event *HauntedEvent) string {
	var content strings.Builder

	content.WriteString("# 🔮 Cursed Output\n\n")
	content.WriteString(fmt.Sprintf(generatedHeader, event.Timestamp.Format(timeFormat)))
	content.WriteString(fmt.Sprintf(eventIDHeader, event.ID))

	content.WriteString("## ⚠️ Warning\n\n")
	content.WriteString("This document contains cursed AI output. The content may be:\n")
	content.WriteString("- Unexpectedly dark or mysterious\n")
	content.WriteString("- Filled with hidden meanings\n")
	content.WriteString("- Potentially haunted\n\n")

	content.WriteString("## 🔮 Cursed Content\n\n")
	content.WriteString("```cursed\n")
	content.WriteString(output)
	content.WriteString("\n```\n\n")

	content.WriteString("## 🕯️ Exorcism Instructions\n\n")
	content.WriteString("If this content becomes too cursed:\n")
	content.WriteString("1. Close the document\n")
	content.WriteString("2. Restart the LocalAI daemon\n")
	content.WriteString("3. Burn some sage (optional)\n")
	content.WriteString("4. Disable cursed mode in configuration\n\n")

	content.WriteString("---\n")
	content.WriteString("*🔮 The shadows have spoken. This document is complete.*\n")

	return content.String()
}

// 📊 generateSessionDocument creates session summary documentation
func (mi *MarkdownInjector) generateSessionDocument(summary string, event *HauntedEvent) string {
	var content strings.Builder

	content.WriteString("# 📊 Session Summary\n\n")
	content.WriteString(fmt.Sprintf("**Date:** %s\n", event.Timestamp.Format(dateFormat)))
	content.WriteString(fmt.Sprintf("**Event ID:** %s\n", event.ID))
	content.WriteString(fmt.Sprintf("**Cursed Activity:** %v\n\n", event.Cursed))

	content.WriteString("## 📈 Summary\n\n")
	content.WriteString(summary)
	content.WriteString("\n\n")

	content.WriteString("## 🔍 Session Details\n\n")
	content.WriteString("- **Event Type:** Session Summary\n")
	content.WriteString(fmt.Sprintf("- **Cursed:** %v\n", event.Cursed))
	content.WriteString(fmt.Sprintf("- **Lore Level:** %d\n", event.LoreLevel))
	content.WriteString(fmt.Sprintf("- **Sentiment:** %.2f\n", event.Sentiment))
	content.WriteString(fmt.Sprintf("- **Generated:** %s\n", event.Timestamp.Format(timeFormat)))

	return content.String()
}

// 🐛 generateDebugDocument creates debug artifact documentation
func (mi *MarkdownInjector) generateDebugDocument(artifact string, event *HauntedEvent) string {
	var content strings.Builder

	content.WriteString("# 🐛 Debug Artifact\n\n")
	content.WriteString(fmt.Sprintf(generatedHeader, event.Timestamp.Format(timeFormat)))
	content.WriteString(fmt.Sprintf(eventIDHeader, event.ID))

	content.WriteString("## 🔧 Debug Information\n\n")
	content.WriteString("```debug\n")
	content.WriteString(artifact)
	content.WriteString("\n```\n\n")

	content.WriteString("## 📊 Debug Metadata\n\n")
	content.WriteString("| Property | Value |\n")
	content.WriteString("|----------|-------|\n")
	content.WriteString(fmt.Sprintf("| Event Type | %s |\n", event.Type))
	content.WriteString(fmt.Sprintf("| Cursed | %v |\n", event.Cursed))
	content.WriteString(fmt.Sprintf("| Timestamp | %s |\n", event.Timestamp.Format(timeFormat)))

	return content.String()
}

// 🔗 generateChronicleDocument creates haunted chronicle documentation
func (mi *MarkdownInjector) generateChronicleDocument(chronicle string, event *HauntedEvent) string {
	var content strings.Builder

	content.WriteString("# 🔗 Haunted Chronicle\n\n")
	content.WriteString(fmt.Sprintf("**Date:** %s\n", event.Timestamp.Format(dateFormat)))
	content.WriteString(fmt.Sprintf(eventIDHeader, event.ID))

	content.WriteString("## 📖 Chronicle Entry\n\n")
	content.WriteString(chronicle)
	content.WriteString("\n\n")

	content.WriteString("## 🔮 Haunted Properties\n\n")
	content.WriteString(fmt.Sprintf("- **Cursed Level:** %v\n", event.Cursed))
	content.WriteString(fmt.Sprintf("- **Lore Depth:** %d\n", event.LoreLevel))
	content.WriteString(fmt.Sprintf("- **Emotional Resonance:** %.2f\n", event.Sentiment))
	content.WriteString(fmt.Sprintf("- **Chronicled:** %s\n", event.Timestamp.Format(timeFormat)))

	content.WriteString("\n---\n")
	content.WriteString("*🔗 Another entry in the haunted chronicles...*\n")

	return content.String()
}

// 📁 generateLoreFilename creates filename for lore documents
func (mi *MarkdownInjector) generateLoreFilename(query string, cursed bool) string {
	// Clean query for filename
	cleaned := strings.ReplaceAll(query, " ", "_")
	cleaned = strings.ReplaceAll(cleaned, "?", "")
	cleaned = strings.ReplaceAll(cleaned, "!", "")
	cleaned = strings.ToLower(cleaned)

	// Limit length
	if len(cleaned) > 50 {
		cleaned = cleaned[:50]
	}

	// Add cursed prefix if needed
	if cursed {
		cleaned = "cursed_" + cleaned
	}

	// Add timestamp and extension
	timestamp := time.Now().Format(fileTimeFormat)
	return fmt.Sprintf("%s_%s.md", cleaned, timestamp)
}

// 🔀 commitChanges commits changes to git repo
func (mi *MarkdownInjector) commitChanges(filepath string, event *HauntedEvent) error {
	// This is a placeholder for git integration
	// In a real implementation, you would use git commands or a Go git library
	mi.logger.WithFields(logrus.Fields{
		"file":     filepath,
		"event_id": event.ID,
	}).Info("🔀 Auto-commit enabled (placeholder)")

	return nil
}
