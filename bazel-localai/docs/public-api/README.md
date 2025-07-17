# 🌐 Lore Engine Public API

Welcome to the **Multi-Agent Lore Conflict Detection System** public API! This documentation provides everything you need to start monitoring lore evolution and conflict resolution in real-time.

## 🚀 Quick Start

### Authentication
All public API requests require an API key in the header:
```bash
curl -H "X-API-Key: your_observer_key_here" https://api.lore-engine.com/lore/stats/public
```

### Base URL
- **Production**: `https://api.lore-engine.com`
- **Staging**: `https://staging-api.lore-engine.com`

## 📊 Available Endpoints

### System Statistics
```
GET /lore/stats/public
```

Returns comprehensive system metrics including:
- Event processing statistics
- Conflict resolution rates
- Sentiment analysis trends
- Performance metrics
- System health indicators

**Example Response:**
```json
{
  "timestamp": "2025-07-16T12:00:00Z",
  "system_status": "operational",
  "events_processed": 1247,
  "conflicts_resolved": 89,
  "sentiment_score": 0.72,
  "performance": {
    "avg_response_time": 245,
    "success_rate": 0.987,
    "active_loops": 3
  },
  "lore_fragments": 156,
  "evolution_chains": 23
}
```

### Live Metrics
```
GET /lore/metrics/public
```

Real-time performance indicators:
- Processing latency
- Error rates
- Resource utilization
- Active connections

### Lore Fragments
```
GET /lore/fragments/public
```

Query parameters:
- `limit`: Number of fragments to return (max 50)
- `offset`: Pagination offset
- `min_cursed_level`: Minimum cursed level filter
- `sentiment`: Filter by sentiment (positive/negative/neutral)

**Example:**
```bash
curl -H "X-API-Key: your_key" "https://api.lore-engine.com/lore/fragments/public?limit=10&min_cursed_level=5"
```

### Evolution Chains
```
GET /lore/chains/public
```

Track content evolution over time:
- Chain lineage
- Mutation history
- Quality metrics
- Virality scores

## 🔐 API Key Types

### Observer Keys
- **Basic**: Read access to stats and metrics
- **Premium**: Includes fragment access
- **Researcher**: Full read access to all public data
- **Creator**: Enhanced data for content creation

### Rate Limits
- **Basic**: 100 requests/minute
- **Premium**: 200 requests/minute
- **Researcher**: 300 requests/minute
- **Creator**: 500 requests/minute

## 📈 Rate Limiting

All endpoints are rate-limited. Limits are returned in response headers:
- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time when limit resets

## 🚨 Error Handling

Standard HTTP status codes:
- `200`: Success
- `400`: Bad request
- `401`: Unauthorized (invalid API key)
- `429`: Rate limit exceeded
- `500`: Internal server error

## 🔄 Webhooks (Coming Soon)

Subscribe to real-time events:
- Conflict detected
- Major sentiment shifts
- New evolution chains
- System alerts

## 📊 Community Dashboard

Access the web dashboard at:
- **Production**: https://dashboard.lore-engine.com
- **Staging**: https://staging-dashboard.lore-engine.com

## 🆘 Support

- **Documentation**: https://docs.lore-engine.com
- **Community**: https://discord.gg/lore-engine
- **Issues**: https://github.com/lore-engine/api/issues
- **Email**: api-support@lore-engine.com

## 📜 Terms of Service

By using this API, you agree to:
- Respect rate limits
- Use data responsibly
- Attribute data source when sharing
- Report security issues promptly

---

**🔮 The Lore Engine Has Awakened! 🔮**

*Happy coding, and may your lore be ever-evolving!*
