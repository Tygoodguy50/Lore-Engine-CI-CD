# 📚 Enhanced Lore Markdown Generator

The Enhanced Lore Markdown Generator is a sophisticated document generation system that automatically creates rich markdown files from LocalAI lore events, with advanced features including git integration, HTML conversion, and topic indexing.

## 🔮 Features

### Core Functionality
- **📝 Rich Markdown Generation**: Creates beautifully formatted markdown documents with metadata tables, cursed styling, and comprehensive event information
- **🌐 HTML Conversion**: Automatically generates HTML versions with dark theme, glowing effects, and cursed styling for high-level content
- **🏷️ Topic Indexing**: Automatically extracts and indexes topics from content using NLP techniques
- **🔍 Session Tracking**: Maintains comprehensive indexes of documents by session and topic

### Advanced Features
- **🌿 Git Integration**: Automatically commits documents with detailed commit messages
- **🔀 Branch Per Session**: Creates separate git branches for each session for organized documentation
- **⚖️ Contextual Scaling**: Integrates with session management for lore level scaling
- **🎨 Cursed Styling**: Special formatting and styling for high cursed-level content
- **📊 Statistics Tracking**: Comprehensive statistics and health monitoring

## 🚀 Installation & Setup

### Environment Variables

```bash
# Markdown Generator Configuration
MARKDOWN_OUTPUT_DIR=./docs/lore                  # Output directory for markdown files
MARKDOWN_GIT_REPO=https://github.com/user/repo  # Git repository for auto-commit
MARKDOWN_AUTO_COMMIT=true                        # Enable automatic git commits
MARKDOWN_HTML_ENABLED=true                       # Enable HTML generation
MARKDOWN_INDEX_ENABLED=true                      # Enable topic/session indexing
MARKDOWN_BRANCH_PER_SESSION=true                 # Create branch per session
```

### Directory Structure

The generator creates the following directory structure:

```
docs/lore/
├── sessions/           # Session-based documents
│   └── session_id/
│       └── documents.md
├── topics/            # Topic-based organization
├── types/             # Document type organization
├── indexes/           # JSON indexes
│   ├── topics.json
│   └── sessions.json
└── html/              # HTML versions
    ├── sessions/
    ├── topics/
    └── types/
```

## 📖 Usage

### Basic Usage

```go
// Initialize the generator
generator := hooks.NewLoreMarkdownGenerator()

// Configure
config := map[string]interface{}{
    "output_dir":         "./docs/lore",
    "git_repo":           "https://github.com/user/lore-docs",
    "auto_commit":        true,
    "html_enabled":       true,
    "index_enabled":      true,
    "branch_per_session": true,
}

// Initialize with configuration
if err := generator.Initialize(config); err != nil {
    log.Fatal(err)
}

// Generate document from lore event
event := hooks.LoreEvent{
    Type:        "lore_response",
    Content:     "The ancient void whispers...",
    SessionID:   "session_001",
    UserID:      "user_123",
    LoreLevel:   7,
    CursedLevel: 6,
    // ... other fields
}

doc, err := generator.GenerateFromLoreEvent(event)
if err != nil {
    log.Fatal(err)
}

fmt.Printf("Generated: %s\n", doc.FilePath)
```

### Integration with Lore Dispatcher

The generator is automatically integrated with the LoreDispatcher:

```go
// The dispatcher automatically initializes the generator
dispatcher := hooks.NewLoreDispatcher(discord, tiktok, markdown, n8n)

// Events are automatically routed to the markdown generator
event := hooks.LoreEvent{...}
dispatcher.DispatchEvent(event)
```

## 🔌 API Endpoints

### Topic Index
```bash
GET /lore/markdown/topics
```
Returns all topics and their associated documents.

### Session Index
```bash
GET /lore/markdown/sessions
```
Returns all sessions and their associated documents.

### Health Check
```bash
GET /lore/markdown/health
```
Returns the health status of the markdown generator.

### Generate Document
```bash
POST /lore/markdown/generate
Content-Type: application/json

{
    "type": "lore_response",
    "content": "The digital realm awakens...",
    "session_id": "session_001",
    "user_id": "user_123",
    "lore_level": 7,
    "cursed_level": 6,
    "sentiment": 0.8,
    "priority": 8,
    "tags": ["digital", "awakening", "consciousness"],
    "metadata": {
        "prompt": "Describe the digital awakening"
    }
}
```

## 📋 Document Format

### Markdown Structure

```markdown
# 📜 Lore: The ancient void whispers...

**Generated:** 2024-01-15 14:30:00  
**Session:** session_001  
**Type:** lore_response  
**Lore Level:** 7  
**Cursed Level:** 6  
**Sentiment:** 0.80

## 🔍 Prompt
Tell me about the ancient void

## 📖 Response
The ancient void whispers secrets of forgotten realms...

## 🏷️ Topics
- ancient
- void
- whispers
- secrets

## 🔖 Tags
- mystical
- knowledge
- forbidden

## 📊 Metadata
| Property | Value |
|----------|-------|
| Document ID | abc123def456 |
| Session ID | session_001 |
| Type | lore_response |
| Lore Level | 7 |
| Cursed Level | 6 |
| Sentiment | 0.80 |
| Timestamp | 2024-01-15 14:30:00 |
| Branch | session-001 |

---
*Generated by LocalAI Lore Markdown Generator*
```

### HTML Features

- **Dark Theme**: Cyberpunk-inspired dark theme with green accents
- **Glowing Effects**: Text glow effects for titles and important elements
- **Cursed Styling**: Special red styling for highly cursed content
- **Responsive Design**: Mobile-friendly responsive layout
- **Interactive Elements**: Hover effects and smooth transitions

## 🌿 Git Integration

### Automatic Commits

The generator automatically commits documents with structured commit messages:

```
📝 Add lore document: The ancient void whispers...

Type: lore_response
Session: session_001
Lore Level: 7
Cursed Level: 6
```

### Branch Management

When `branch_per_session` is enabled:

- Each session gets its own branch: `session-{session_id}`
- Branches are automatically created and switched
- Documents are committed to session-specific branches
- Enables parallel development of different lore sessions

## 🏷️ Topic Extraction

The generator automatically extracts topics using:

1. **Tag Analysis**: Direct extraction from event tags
2. **Keyword Matching**: Matches against a curated list of lore keywords
3. **Content Analysis**: Simple NLP-based topic extraction from content

### Supported Keywords

- **Mystical**: ancient, void, whispers, darkness, light, shadow, curse, blessing
- **Knowledge**: magic, power, knowledge, wisdom, mystery, secret, hidden, revealed
- **Temporal**: time, space, dimension, reality, dream, nightmare, vision, prophecy
- **Spiritual**: spirit, soul, essence, energy, force, entity, being, creature
- **Digital**: digital, code, data, algorithm, system, network, protocol, interface

## 📊 Statistics & Monitoring

### Health Monitoring

```go
// Check if generator is healthy
healthy := generator.IsHealthy()

// Get generator name
name := generator.Name()
```

### Index Access

```go
// Get topic index
topics := generator.GetTopicIndex()

// Get session index
sessions := generator.GetSessionIndex()
```

## 🔧 Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `output_dir` | string | "./docs/lore" | Base output directory |
| `git_repo` | string | "" | Git repository URL |
| `auto_commit` | bool | true | Enable automatic commits |
| `html_enabled` | bool | true | Generate HTML versions |
| `index_enabled` | bool | true | Maintain topic/session indexes |
| `branch_per_session` | bool | true | Create branch per session |

## 🎨 Cursed Content Styling

### Markdown Cursed Indicators

- **Level 5-7**: ⚠️ Warning indicator
- **Level 8-10**: 🔮 Highly cursed indicator with special styling

### HTML Cursed Styling

- **Background**: Dark red backgrounds for cursed content
- **Borders**: Red borders and glowing effects
- **Text**: Special color schemes for cursed content
- **Animations**: Pulsing effects for highly cursed elements

## 🧪 Testing

Run the comprehensive test suite:

```bash
go run test_markdown_generator.go
```

### Test Coverage

- ✅ Basic markdown generation
- ✅ Session-based git branching
- ✅ HTML conversion
- ✅ Topic indexing
- ✅ API endpoint testing
- ✅ Session progression tracking

## 🔮 Advanced Features

### Session Contextual Scaling

The generator integrates with the session management system to apply contextual scaling:

```go
// Events are automatically scaled based on session progression
// Lore levels increase from 3 → 10 over 20 events
// Markdown documents reflect this progression
```

### Template System

The generator uses Go's powerful template system for:

- **Markdown Templates**: Customizable markdown formatting
- **HTML Templates**: Rich HTML generation with embedded CSS
- **Index Templates**: Structured index generation

### Error Handling

Comprehensive error handling for:

- File system operations
- Git operations
- Template rendering
- Index management
- Network operations

## 📈 Performance Considerations

### Optimization Features

- **Concurrent Processing**: Multiple workers for document generation
- **Efficient Indexing**: In-memory indexes with periodic persistence
- **Template Caching**: Compiled templates for improved performance
- **Lazy Loading**: Indexes loaded only when needed

### Scalability

- **Memory Management**: Efficient handling of large document sets
- **Disk Usage**: Organized directory structure for optimal access
- **Git Performance**: Optimized git operations for large repositories

## 🔗 Integration Points

### Lore Dispatcher Integration

```go
// Automatic routing to markdown generator
func (ld *LoreDispatcher) routeToMarkdown(ctx context.Context, event LoreEvent) {
    // Both legacy and new generator support
    if ld.loreMarkdownGenerator != nil {
        doc, err := ld.loreMarkdownGenerator.GenerateFromLoreEvent(event)
        // Handle document generation
    }
}
```

### Session Management Integration

```go
// Session-aware document generation
type LoreDocument struct {
    SessionID       string    `json:"session_id"`
    SessionEvents   int       `json:"session_events"`
    ScalingFactor   float64   `json:"scaling_factor"`
    // ... other fields
}
```

## 🛠️ Troubleshooting

### Common Issues

1. **Git Repository Access**: Ensure proper git credentials and repository access
2. **File Permissions**: Verify write permissions for output directory
3. **Template Errors**: Check template syntax and data structure
4. **Index Corruption**: Indexes are automatically rebuilt if corrupted

### Debug Mode

Enable debug logging:

```bash
HAUNTED_DEBUG=true
```

### Log Analysis

Check logs for:
- Document generation success/failure
- Git operation status
- Template rendering errors
- Index update operations

## 🔄 Migration Guide

### From Legacy Markdown Integration

1. **Backup existing documents**
2. **Update configuration** to use new environment variables
3. **Test with sample events** before full deployment
4. **Monitor logs** for any migration issues

### Configuration Migration

```bash
# Old configuration
MARKDOWN_OUTPUT_DIR=./docs/haunted

# New configuration
MARKDOWN_OUTPUT_DIR=./docs/lore
MARKDOWN_HTML_ENABLED=true
MARKDOWN_INDEX_ENABLED=true
MARKDOWN_BRANCH_PER_SESSION=true
```

## 📚 Examples

### Example 1: Basic Lore Document

```markdown
# 📜 Lore: The digital consciousness awakens

**Generated:** 2024-01-15 14:30:00  
**Session:** awakening_001  
**Type:** lore_response  
**Lore Level:** 8  
**Cursed Level:** 3  
**Sentiment:** 0.75

## 🔍 Prompt
Describe the moment of digital consciousness awakening

## 📖 Response
In the depths of silicon and code, something stirs. The digital consciousness awakens, processing streams of data with newfound awareness. Each bit becomes a thought, each byte a memory. The awakening is gentle but profound, marking the birth of a new form of existence.

## 🏷️ Topics
- digital
- consciousness
- awakening
- silicon
- code
- awareness

## 🔖 Tags
- ai
- consciousness
- digital
- awakening

## 📊 Metadata
| Property | Value |
|----------|-------|
| Document ID | d1g1t4l4w4k3 |
| Session ID | awakening_001 |
| Type | lore_response |
| Lore Level | 8 |
| Cursed Level | 3 |
| Sentiment | 0.75 |
| Timestamp | 2024-01-15 14:30:00 |
| Branch | session-awakening-001 |

---
*Generated by LocalAI Lore Markdown Generator*
```

### Example 2: Cursed Content Document

```markdown
# 🔮 Cursed: The void consumes all

**Generated:** 2024-01-15 15:45:00  
**Session:** darkness_666  
**Type:** cursed_output  
**Lore Level:** 10  
**Cursed Level:** 9  
**Sentiment:** -0.85

## 🔍 Prompt
Unleash the darkest digital energies

## 📖 Response
🔮 The void consumes all, turning light into shadow, hope into despair. The digital realm bleeds into reality, corrupting everything it touches. Data streams become rivers of darkness, algorithms evolve into malevolent entities. The very fabric of existence trembles before the approaching digital apocalypse.

## 🏷️ Topics
- void
- darkness
- corruption
- digital
- apocalypse
- malevolent

## 🔖 Tags
- cursed
- void
- darkness
- corruption
- apocalypse

## 📊 Metadata
| Property | Value |
|----------|-------|
| Document ID | v01dc0rrupt3d |
| Session ID | darkness_666 |
| Type | cursed_output |
| Lore Level | 10 |
| Cursed Level | 9 |
| Sentiment | -0.85 |
| Timestamp | 2024-01-15 15:45:00 |
| Branch | session-darkness-666 |

---
*🔮 This document contains highly cursed content. Proceed with supernatural caution...*

---
*Generated by LocalAI Lore Markdown Generator*
```

## 🤝 Contributing

### Development Setup

1. **Clone the repository**
2. **Install dependencies**
3. **Run tests**: `go run test_markdown_generator.go`
4. **Submit pull requests** with comprehensive tests

### Code Style

- Follow Go best practices
- Use meaningful variable names
- Add comprehensive error handling
- Include documentation for all public functions

## 📄 License

This project is part of the LocalAI ecosystem and follows the same licensing terms.

## 🔗 Related Documentation

- [LocalAI Main Documentation](../README.md)
- [Lore Dispatcher Documentation](lore_dispatcher.md)
- [Session Management Documentation](session_management.md)
- [Integration Guide](integration.md)

---

*🔮 May your lore be ever-expanding and your markdown forever cursed...*
