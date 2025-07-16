package hooks

import (
	"crypto/md5"
	"encoding/json"
	"fmt"
	"html/template"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
)

// LoreMarkdownGenerator handles advanced markdown generation with git integration
type LoreMarkdownGenerator struct {
	logger           *logrus.Logger
	outputDir        string
	gitRepo          string
	autoCommit       bool
	htmlEnabled      bool
	indexEnabled     bool
	branchPerSession bool

	// Index tracking
	topicIndex   map[string][]string
	sessionIndex map[string][]string
	mutex        sync.RWMutex

	// Templates
	markdownTemplate *template.Template
	htmlTemplate     *template.Template
	indexTemplate    *template.Template

	// Statistics
	totalDocuments int64
	totalHTML      int64
	totalCommits   int64
	totalBranches  int64
	generatedAt    time.Time
}

// LoreDocument represents a processed lore document
type LoreDocument struct {
	ID          string                 `json:"id"`
	Title       string                 `json:"title"`
	Content     string                 `json:"content"`
	Prompt      string                 `json:"prompt"`
	Response    string                 `json:"response"`
	Sentiment   float64                `json:"sentiment"`
	CursedLevel int                    `json:"cursed_level"`
	LoreLevel   int                    `json:"lore_level"`
	SessionID   string                 `json:"session_id"`
	Timestamp   time.Time              `json:"timestamp"`
	Type        string                 `json:"type"`
	Tags        []string               `json:"tags"`
	Topics      []string               `json:"topics"`
	Metadata    map[string]interface{} `json:"metadata"`
	FilePath    string                 `json:"file_path"`
	HTMLPath    string                 `json:"html_path"`
	Branch      string                 `json:"branch"`
}

// NewLoreMarkdownGenerator creates a new enhanced markdown generator
func NewLoreMarkdownGenerator() *LoreMarkdownGenerator {
	return &LoreMarkdownGenerator{
		logger:           logrus.New(),
		topicIndex:       make(map[string][]string),
		sessionIndex:     make(map[string][]string),
		branchPerSession: true,
		htmlEnabled:      true,
		indexEnabled:     true,
	}
}

// Initialize sets up the markdown generator
func (lmg *LoreMarkdownGenerator) Initialize(config map[string]interface{}) error {
	lmg.logger.Info("📝 Initializing Lore Markdown Generator")

	// Configure paths
	if dir, ok := config["output_dir"].(string); ok {
		lmg.outputDir = dir
	} else {
		lmg.outputDir = "./docs/lore"
	}

	if repo, ok := config["git_repo"].(string); ok {
		lmg.gitRepo = repo
	}

	if autoCommit, ok := config["auto_commit"].(bool); ok {
		lmg.autoCommit = autoCommit
	}

	if htmlEnabled, ok := config["html_enabled"].(bool); ok {
		lmg.htmlEnabled = htmlEnabled
	}

	if indexEnabled, ok := config["index_enabled"].(bool); ok {
		lmg.indexEnabled = indexEnabled
	}

	if branchPerSession, ok := config["branch_per_session"].(bool); ok {
		lmg.branchPerSession = branchPerSession
	}

	// Create directory structure
	if err := lmg.createDirectoryStructure(); err != nil {
		return errors.Wrap(err, "failed to create directory structure")
	}

	// Initialize templates
	if err := lmg.initializeTemplates(); err != nil {
		return errors.Wrap(err, "failed to initialize templates")
	}

	// Initialize git repository if specified
	if lmg.gitRepo != "" {
		if err := lmg.initializeGitRepo(); err != nil {
			lmg.logger.WithError(err).Warn("Failed to initialize git repository")
		}
	}

	// Load existing indexes
	if err := lmg.loadIndexes(); err != nil {
		lmg.logger.WithError(err).Warn("Failed to load existing indexes")
	}

	lmg.logger.Info("✅ Lore Markdown Generator initialized")
	return nil
}

// GenerateFromLoreEvent processes a lore event and generates markdown
func (lmg *LoreMarkdownGenerator) GenerateFromLoreEvent(event LoreEvent) (*LoreDocument, error) {
	lmg.logger.WithFields(logrus.Fields{
		"type":       event.Type,
		"session_id": event.SessionID,
		"lore_level": event.LoreLevel,
	}).Info("📝 Generating lore document")

	// Create lore document
	doc := &LoreDocument{
		ID:          lmg.generateDocumentID(event),
		Title:       lmg.generateTitle(event),
		Content:     event.Content,
		Prompt:      lmg.extractPrompt(event),
		Response:    event.Content,
		Sentiment:   event.Sentiment,
		CursedLevel: event.CursedLevel,
		LoreLevel:   event.LoreLevel,
		SessionID:   event.SessionID,
		Timestamp:   event.Timestamp,
		Type:        event.Type,
		Tags:        event.Tags,
		Topics:      lmg.extractTopics(event),
		Metadata:    event.Metadata,
		Branch:      lmg.generateBranchName(event),
	}

	// Generate file paths
	doc.FilePath = lmg.generateFilePath(doc)
	if lmg.htmlEnabled {
		doc.HTMLPath = lmg.generateHTMLPath(doc)
	}

	// Generate markdown content
	markdownContent, err := lmg.generateMarkdownContent(doc)
	if err != nil {
		return nil, errors.Wrap(err, "failed to generate markdown content")
	}

	// Write markdown file
	if err := lmg.writeMarkdownFile(doc.FilePath, markdownContent); err != nil {
		return nil, errors.Wrap(err, "failed to write markdown file")
	}

	// Generate HTML if enabled
	if lmg.htmlEnabled {
		if err := lmg.generateHTMLFile(doc, markdownContent); err != nil {
			lmg.logger.WithError(err).Warn("Failed to generate HTML file")
		}
	}

	// Update indexes
	if lmg.indexEnabled {
		lmg.updateIndexes(doc)
	}

	// Git operations
	if lmg.gitRepo != "" {
		if err := lmg.handleGitOperations(doc); err != nil {
			lmg.logger.WithError(err).Warn("Failed to handle git operations")
		}
	}

	lmg.logger.WithFields(logrus.Fields{
		"file":       doc.FilePath,
		"session_id": doc.SessionID,
		"topics":     len(doc.Topics),
	}).Info("✅ Lore document generated successfully")

	return doc, nil
}

// createDirectoryStructure creates the necessary directory structure
func (lmg *LoreMarkdownGenerator) createDirectoryStructure() error {
	dirs := []string{
		lmg.outputDir,
		filepath.Join(lmg.outputDir, "sessions"),
		filepath.Join(lmg.outputDir, "topics"),
		filepath.Join(lmg.outputDir, "types"),
		filepath.Join(lmg.outputDir, "indexes"),
		filepath.Join(lmg.outputDir, "html"),
		filepath.Join(lmg.outputDir, "html", "sessions"),
		filepath.Join(lmg.outputDir, "html", "topics"),
		filepath.Join(lmg.outputDir, "html", "types"),
	}

	for _, dir := range dirs {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return errors.Wrapf(err, "failed to create directory %s", dir)
		}
	}

	return nil
}

// initializeTemplates sets up the markdown and HTML templates
func (lmg *LoreMarkdownGenerator) initializeTemplates() error {
	// Markdown template
	markdownTmpl := `# {{ .Title }}

**Generated:** {{ .Timestamp.Format "2006-01-02 15:04:05" }}  
**Session:** {{ .SessionID }}  
**Type:** {{ .Type }}  
**Lore Level:** {{ .LoreLevel }}  
**Cursed Level:** {{ .CursedLevel }}  
**Sentiment:** {{ printf "%.2f" .Sentiment }}

{{ if .Prompt }}
## 🔍 Prompt
{{ .Prompt }}
{{ end }}

## 📖 Response
{{ .Response }}

{{ if .Topics }}
## 🏷️ Topics
{{ range .Topics }}
- {{ . }}
{{ end }}
{{ end }}

{{ if .Tags }}
## 🔖 Tags
{{ range .Tags }}
- {{ . }}
{{ end }}
{{ end }}

## 📊 Metadata
| Property | Value |
|----------|-------|
| Document ID | {{ .ID }} |
| Session ID | {{ .SessionID }} |
| Type | {{ .Type }} |
| Lore Level | {{ .LoreLevel }} |
| Cursed Level | {{ .CursedLevel }} |
| Sentiment | {{ printf "%.2f" .Sentiment }} |
| Timestamp | {{ .Timestamp.Format "2006-01-02 15:04:05" }} |
| Branch | {{ .Branch }} |

{{ if gt .CursedLevel 7 }}
---
*🔮 This document contains highly cursed content. Proceed with supernatural caution...*
{{ else if gt .CursedLevel 5 }}
---
*⚠️ This document contains cursed content. Reader discretion advised.*
{{ end }}

---
*Generated by LocalAI Lore Markdown Generator*`

	// HTML template
	htmlTmpl := `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ .Title }}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #0a0a0a; color: #e0e0e0; }
        .container { max-width: 800px; margin: 0 auto; background: #1a1a1a; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,255,0,0.1); }
        h1 { color: #00ff00; text-shadow: 0 0 10px rgba(0,255,0,0.5); }
        h2 { color: #00cc00; border-bottom: 2px solid #00cc00; padding-bottom: 5px; }
        .metadata { background: #2a2a2a; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .cursed { background: #4a0000; border: 2px solid #ff0000; padding: 15px; border-radius: 5px; color: #ffcccc; }
        .lore-level { display: inline-block; padding: 5px 10px; background: #003300; color: #00ff00; border-radius: 3px; margin: 5px; }
        .sentiment { color: {{ if gt .Sentiment 0.5 }}#00ff00{{ else if lt .Sentiment -0.5 }}#ff0000{{ else }}#ffff00{{ end }}; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #333; }
        th { background: #333; color: #00ff00; }
        .topics, .tags { display: flex; flex-wrap: wrap; gap: 5px; margin: 10px 0; }
        .topic, .tag { background: #333; color: #00ff00; padding: 3px 8px; border-radius: 3px; font-size: 0.9em; }
        .footer { text-align: center; margin-top: 30px; font-size: 0.8em; color: #666; }
        .glow { animation: glow 2s ease-in-out infinite alternate; }
        @keyframes glow { from { text-shadow: 0 0 5px rgba(0,255,0,0.5); } to { text-shadow: 0 0 20px rgba(0,255,0,0.8); } }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="glow">{{ .Title }}</h1>
        
        <div class="metadata">
            <strong>Generated:</strong> {{ .Timestamp.Format "2006-01-02 15:04:05" }}<br>
            <strong>Session:</strong> {{ .SessionID }}<br>
            <strong>Type:</strong> {{ .Type }}<br>
            <strong>Lore Level:</strong> <span class="lore-level">{{ .LoreLevel }}</span><br>
            <strong>Cursed Level:</strong> {{ .CursedLevel }}<br>
            <strong>Sentiment:</strong> <span class="sentiment">{{ printf "%.2f" .Sentiment }}</span>
        </div>
        
        {{ if .Prompt }}
        <h2>🔍 Prompt</h2>
        <div class="prompt">{{ .Prompt }}</div>
        {{ end }}
        
        <h2>📖 Response</h2>
        <div class="response{{ if gt .CursedLevel 7 }} cursed{{ end }}">{{ .Response }}</div>
        
        {{ if .Topics }}
        <h2>🏷️ Topics</h2>
        <div class="topics">
        {{ range .Topics }}
            <span class="topic">{{ . }}</span>
        {{ end }}
        </div>
        {{ end }}
        
        {{ if .Tags }}
        <h2>🔖 Tags</h2>
        <div class="tags">
        {{ range .Tags }}
            <span class="tag">{{ . }}</span>
        {{ end }}
        </div>
        {{ end }}
        
        <h2>📊 Metadata</h2>
        <table>
            <tr><th>Property</th><th>Value</th></tr>
            <tr><td>Document ID</td><td>{{ .ID }}</td></tr>
            <tr><td>Session ID</td><td>{{ .SessionID }}</td></tr>
            <tr><td>Type</td><td>{{ .Type }}</td></tr>
            <tr><td>Lore Level</td><td>{{ .LoreLevel }}</td></tr>
            <tr><td>Cursed Level</td><td>{{ .CursedLevel }}</td></tr>
            <tr><td>Sentiment</td><td class="sentiment">{{ printf "%.2f" .Sentiment }}</td></tr>
            <tr><td>Timestamp</td><td>{{ .Timestamp.Format "2006-01-02 15:04:05" }}</td></tr>
            <tr><td>Branch</td><td>{{ .Branch }}</td></tr>
        </table>
        
        {{ if gt .CursedLevel 7 }}
        <div class="cursed">
            🔮 This document contains highly cursed content. Proceed with supernatural caution...
        </div>
        {{ else if gt .CursedLevel 5 }}
        <div class="cursed">
            ⚠️ This document contains cursed content. Reader discretion advised.
        </div>
        {{ end }}
        
        <div class="footer">
            Generated by LocalAI Lore Markdown Generator
        </div>
    </div>
</body>
</html>`

	// Index template
	indexTmpl := `# 📚 Lore Index

**Generated:** {{ .Timestamp.Format "2006-01-02 15:04:05" }}  
**Total Documents:** {{ .TotalDocuments }}  
**Active Sessions:** {{ len .Sessions }}  
**Topics:** {{ len .Topics }}

## 🔍 Quick Navigation
- [Sessions](#sessions)
- [Topics](#topics)
- [Recent Documents](#recent-documents)

## 📖 Sessions
{{ range $sessionID, $docs := .Sessions }}
### {{ $sessionID }}
- **Documents:** {{ len $docs }}
- **Latest:** {{ (index $docs 0).Timestamp.Format "2006-01-02 15:04:05" }}
{{ range $docs }}
  - [{{ .Title }}]({{ .FilePath }}){{ if .HTMLPath }} ([HTML]({{ .HTMLPath }})){{ end }}
{{ end }}
{{ end }}

## 🏷️ Topics
{{ range $topic, $docs := .Topics }}
### {{ $topic }}
{{ range $docs }}
- [{{ .Title }}]({{ .FilePath }}) - {{ .Timestamp.Format "2006-01-02 15:04:05" }}
{{ end }}
{{ end }}

## 📅 Recent Documents
{{ range .RecentDocuments }}
- [{{ .Title }}]({{ .FilePath }}) - {{ .Timestamp.Format "2006-01-02 15:04:05" }} ({{ .Type }})
{{ end }}

---
*Generated by LocalAI Lore Markdown Generator*`

	var err error
	lmg.markdownTemplate, err = template.New("markdown").Parse(markdownTmpl)
	if err != nil {
		return errors.Wrap(err, "failed to parse markdown template")
	}

	lmg.htmlTemplate, err = template.New("html").Parse(htmlTmpl)
	if err != nil {
		return errors.Wrap(err, "failed to parse HTML template")
	}

	lmg.indexTemplate, err = template.New("index").Parse(indexTmpl)
	if err != nil {
		return errors.Wrap(err, "failed to parse index template")
	}

	return nil
}

// generateDocumentID creates a unique document ID
func (lmg *LoreMarkdownGenerator) generateDocumentID(event LoreEvent) string {
	hash := md5.Sum([]byte(fmt.Sprintf("%s_%s_%d", event.SessionID, event.Type, event.Timestamp.Unix())))
	return fmt.Sprintf("%x", hash)[:12]
}

// generateTitle creates a document title
func (lmg *LoreMarkdownGenerator) generateTitle(event LoreEvent) string {
	switch event.Type {
	case "lore_response":
		return fmt.Sprintf("📜 Lore: %s", lmg.truncateString(event.Content, 50))
	case "cursed_output":
		return fmt.Sprintf("🔮 Cursed: %s", lmg.truncateString(event.Content, 50))
	case "reactive_dialogue":
		return fmt.Sprintf("💭 Reactive: %s", lmg.truncateString(event.Content, 50))
	default:
		return fmt.Sprintf("📄 %s: %s", event.Type, lmg.truncateString(event.Content, 50))
	}
}

// extractPrompt extracts the prompt from event metadata
func (lmg *LoreMarkdownGenerator) extractPrompt(event LoreEvent) string {
	if prompt, ok := event.Metadata["prompt"].(string); ok {
		return prompt
	}
	if query, ok := event.Metadata["query"].(string); ok {
		return query
	}
	return ""
}

// extractTopics extracts topics from content using simple NLP
func (lmg *LoreMarkdownGenerator) extractTopics(event LoreEvent) []string {
	topics := make(map[string]bool)

	// Extract from tags
	for _, tag := range event.Tags {
		topics[tag] = true
	}

	// Extract from content using keywords
	content := strings.ToLower(event.Content)
	keywords := []string{
		"ancient", "void", "whispers", "darkness", "light", "shadow", "curse", "blessing",
		"magic", "power", "knowledge", "wisdom", "mystery", "secret", "hidden", "revealed",
		"time", "space", "dimension", "reality", "dream", "nightmare", "vision", "prophecy",
		"spirit", "soul", "essence", "energy", "force", "entity", "being", "creature",
		"digital", "code", "data", "algorithm", "system", "network", "protocol", "interface",
	}

	for _, keyword := range keywords {
		if strings.Contains(content, keyword) {
			topics[keyword] = true
		}
	}

	// Convert to slice
	var result []string
	for topic := range topics {
		result = append(result, topic)
	}

	sort.Strings(result)
	return result
}

// generateBranchName creates a git branch name for the session
func (lmg *LoreMarkdownGenerator) generateBranchName(event LoreEvent) string {
	if !lmg.branchPerSession {
		return "main"
	}

	// Clean session ID for branch name
	branch := strings.ReplaceAll(event.SessionID, "_", "-")
	branch = strings.ReplaceAll(branch, " ", "-")
	branch = strings.ToLower(branch)

	// Remove invalid characters
	reg := regexp.MustCompile(`[^a-z0-9\-]`)
	branch = reg.ReplaceAllString(branch, "")

	return fmt.Sprintf("session-%s", branch)
}

// generateFilePath creates the file path for the document
func (lmg *LoreMarkdownGenerator) generateFilePath(doc *LoreDocument) string {
	filename := fmt.Sprintf("%s_%s.md", doc.ID, doc.Timestamp.Format("20060102_150405"))
	return filepath.Join(lmg.outputDir, "sessions", doc.SessionID, filename)
}

// generateHTMLPath creates the HTML file path for the document
func (lmg *LoreMarkdownGenerator) generateHTMLPath(doc *LoreDocument) string {
	filename := fmt.Sprintf("%s_%s.html", doc.ID, doc.Timestamp.Format("20060102_150405"))
	return filepath.Join(lmg.outputDir, "html", "sessions", doc.SessionID, filename)
}

// generateMarkdownContent generates the markdown content using templates
func (lmg *LoreMarkdownGenerator) generateMarkdownContent(doc *LoreDocument) (string, error) {
	var buf strings.Builder
	if err := lmg.markdownTemplate.Execute(&buf, doc); err != nil {
		return "", errors.Wrap(err, "failed to execute markdown template")
	}
	return buf.String(), nil
}

// writeMarkdownFile writes the markdown content to file
func (lmg *LoreMarkdownGenerator) writeMarkdownFile(filePath, content string) error {
	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return errors.Wrap(err, "failed to create directory")
	}

	if err := os.WriteFile(filePath, []byte(content), 0644); err != nil {
		return errors.Wrap(err, "failed to write markdown file")
	}

	// Increment statistics counter
	lmg.totalDocuments++

	return nil
}

// generateHTMLFile generates the HTML version of the document
func (lmg *LoreMarkdownGenerator) generateHTMLFile(doc *LoreDocument, markdownContent string) error {
	var buf strings.Builder
	if err := lmg.htmlTemplate.Execute(&buf, doc); err != nil {
		return errors.Wrap(err, "failed to execute HTML template")
	}

	dir := filepath.Dir(doc.HTMLPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return errors.Wrap(err, "failed to create HTML directory")
	}

	if err := os.WriteFile(doc.HTMLPath, []byte(buf.String()), 0644); err != nil {
		return errors.Wrap(err, "failed to write HTML file")
	}

	// Increment statistics counter
	lmg.totalHTML++

	return nil
}

// updateIndexes updates the topic and session indexes
func (lmg *LoreMarkdownGenerator) updateIndexes(doc *LoreDocument) {
	lmg.mutex.Lock()
	defer lmg.mutex.Unlock()

	// Update topic index
	for _, topic := range doc.Topics {
		if _, exists := lmg.topicIndex[topic]; !exists {
			lmg.topicIndex[topic] = make([]string, 0)
		}
		lmg.topicIndex[topic] = append(lmg.topicIndex[topic], doc.ID)
	}

	// Update session index
	if _, exists := lmg.sessionIndex[doc.SessionID]; !exists {
		lmg.sessionIndex[doc.SessionID] = make([]string, 0)
	}
	lmg.sessionIndex[doc.SessionID] = append(lmg.sessionIndex[doc.SessionID], doc.ID)

	// Save indexes
	if err := lmg.saveIndexes(); err != nil {
		lmg.logger.WithError(err).Warn("Failed to save indexes")
	}
}

// initializeGitRepo initializes the git repository
func (lmg *LoreMarkdownGenerator) initializeGitRepo() error {
	if _, err := os.Stat(filepath.Join(lmg.outputDir, ".git")); os.IsNotExist(err) {
		cmd := exec.Command("git", "init")
		cmd.Dir = lmg.outputDir
		if err := cmd.Run(); err != nil {
			return errors.Wrap(err, "failed to initialize git repository")
		}

		lmg.logger.Info("🔀 Git repository initialized")
	}

	return nil
}

// handleGitOperations handles git operations for the document
func (lmg *LoreMarkdownGenerator) handleGitOperations(doc *LoreDocument) error {
	// Switch to or create branch
	if lmg.branchPerSession && doc.Branch != "main" {
		if err := lmg.createOrSwitchBranch(doc.Branch); err != nil {
			return errors.Wrap(err, "failed to create or switch branch")
		}
	}

	// Add and commit files
	if lmg.autoCommit {
		if err := lmg.commitDocument(doc); err != nil {
			return errors.Wrap(err, "failed to commit document")
		}
	}

	return nil
}

// createOrSwitchBranch creates or switches to a git branch
func (lmg *LoreMarkdownGenerator) createOrSwitchBranch(branchName string) error {
	// Check if branch exists
	cmd := exec.Command("git", "branch", "--list", branchName)
	cmd.Dir = lmg.outputDir
	output, err := cmd.Output()
	if err != nil {
		return errors.Wrap(err, "failed to list branches")
	}

	if len(output) == 0 {
		// Create new branch
		cmd = exec.Command("git", "checkout", "-b", branchName)
		cmd.Dir = lmg.outputDir
		if err := cmd.Run(); err != nil {
			return errors.Wrap(err, "failed to create branch")
		}
		lmg.logger.WithField("branch", branchName).Info("🌿 Created new git branch")

		// Increment statistics counter for new branch
		lmg.totalBranches++
	} else {
		// Switch to existing branch
		cmd = exec.Command("git", "checkout", branchName)
		cmd.Dir = lmg.outputDir
		if err := cmd.Run(); err != nil {
			return errors.Wrap(err, "failed to switch branch")
		}
		lmg.logger.WithField("branch", branchName).Info("🔄 Switched to git branch")
	}

	return nil
}

// commitDocument commits the document to git
func (lmg *LoreMarkdownGenerator) commitDocument(doc *LoreDocument) error {
	// Add files
	files := []string{doc.FilePath}
	if lmg.htmlEnabled && doc.HTMLPath != "" {
		files = append(files, doc.HTMLPath)
	}

	for _, file := range files {
		// Make path relative to output dir
		relPath, err := filepath.Rel(lmg.outputDir, file)
		if err != nil {
			relPath = file
		}

		cmd := exec.Command("git", "add", relPath)
		cmd.Dir = lmg.outputDir
		if err := cmd.Run(); err != nil {
			return errors.Wrapf(err, "failed to add file %s", relPath)
		}
	}

	// Commit
	commitMsg := fmt.Sprintf("📝 Add lore document: %s\n\nType: %s\nSession: %s\nLore Level: %d\nCursed Level: %d",
		doc.Title, doc.Type, doc.SessionID, doc.LoreLevel, doc.CursedLevel)

	cmd := exec.Command("git", "commit", "-m", commitMsg)
	cmd.Dir = lmg.outputDir
	if err := cmd.Run(); err != nil {
		return errors.Wrap(err, "failed to commit document")
	}

	lmg.logger.WithFields(logrus.Fields{
		"document": doc.ID,
		"branch":   doc.Branch,
		"files":    len(files),
	}).Info("📝 Document committed to git")

	// Increment statistics counter
	lmg.totalCommits++

	return nil
}

// loadIndexes loads existing indexes from disk
func (lmg *LoreMarkdownGenerator) loadIndexes() error {
	// Load topic index
	topicIndexPath := filepath.Join(lmg.outputDir, "indexes", "topics.json")
	if data, err := os.ReadFile(topicIndexPath); err == nil {
		if err := json.Unmarshal(data, &lmg.topicIndex); err != nil {
			lmg.logger.WithError(err).Warn("Failed to unmarshal topic index")
		}
	}

	// Load session index
	sessionIndexPath := filepath.Join(lmg.outputDir, "indexes", "sessions.json")
	if data, err := os.ReadFile(sessionIndexPath); err == nil {
		if err := json.Unmarshal(data, &lmg.sessionIndex); err != nil {
			lmg.logger.WithError(err).Warn("Failed to unmarshal session index")
		}
	}

	return nil
}

// saveIndexes saves indexes to disk
func (lmg *LoreMarkdownGenerator) saveIndexes() error {
	// Save topic index
	topicData, err := json.MarshalIndent(lmg.topicIndex, "", "  ")
	if err != nil {
		return errors.Wrap(err, "failed to marshal topic index")
	}

	topicIndexPath := filepath.Join(lmg.outputDir, "indexes", "topics.json")
	if err := os.WriteFile(topicIndexPath, topicData, 0644); err != nil {
		return errors.Wrap(err, "failed to write topic index")
	}

	// Save session index
	sessionData, err := json.MarshalIndent(lmg.sessionIndex, "", "  ")
	if err != nil {
		return errors.Wrap(err, "failed to marshal session index")
	}

	sessionIndexPath := filepath.Join(lmg.outputDir, "indexes", "sessions.json")
	if err := os.WriteFile(sessionIndexPath, sessionData, 0644); err != nil {
		return errors.Wrap(err, "failed to write session index")
	}

	return nil
}

// truncateString truncates a string to a specified length
func (lmg *LoreMarkdownGenerator) truncateString(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen] + "..."
}

// GetTopicIndex returns the topic index
func (lmg *LoreMarkdownGenerator) GetTopicIndex() map[string][]string {
	lmg.mutex.RLock()
	defer lmg.mutex.RUnlock()

	result := make(map[string][]string)
	for topic, docs := range lmg.topicIndex {
		result[topic] = make([]string, len(docs))
		copy(result[topic], docs)
	}
	return result
}

// GetSessionIndex returns the session index
func (lmg *LoreMarkdownGenerator) GetSessionIndex() map[string][]string {
	lmg.mutex.RLock()
	defer lmg.mutex.RUnlock()

	result := make(map[string][]string)
	for session, docs := range lmg.sessionIndex {
		result[session] = make([]string, len(docs))
		copy(result[session], docs)
	}
	return result
}

// GetGeneratorStats returns statistics about the markdown generator
func (lmg *LoreMarkdownGenerator) GetGeneratorStats() map[string]interface{} {
	lmg.mutex.RLock()
	defer lmg.mutex.RUnlock()

	return map[string]interface{}{
		"total_documents":    lmg.totalDocuments,
		"total_html":         lmg.totalHTML,
		"total_commits":      lmg.totalCommits,
		"total_branches":     lmg.totalBranches,
		"total_topics":       len(lmg.topicIndex),
		"total_sessions":     len(lmg.sessionIndex),
		"output_dir":         lmg.outputDir,
		"git_repo":           lmg.gitRepo,
		"auto_commit":        lmg.autoCommit,
		"html_enabled":       lmg.htmlEnabled,
		"index_enabled":      lmg.indexEnabled,
		"branch_per_session": lmg.branchPerSession,
		"generated_at":       time.Now(),
	}
}

// Name returns the name of the generator
func (lmg *LoreMarkdownGenerator) Name() string {
	return "lore_markdown_generator"
}

// IsHealthy returns the health status of the generator
func (lmg *LoreMarkdownGenerator) IsHealthy() bool {
	return lmg.outputDir != "" && lmg.markdownTemplate != nil
}
