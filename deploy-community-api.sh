#!/bin/bash

# Multi-Agent Lore Conflict Detection System
# Community API Deployment Script
# Generated: July 16, 2025

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${PURPLE}🌐 Deploying Community API Features${NC}"
echo -e "${PURPLE}====================================${NC}"

# Create API key management system
create_api_keys() {
    echo -e "${CYAN}🔑 Creating API key management system...${NC}"
    
    mkdir -p ./config/api-keys
    
    # Generate unique API keys
    cat > ./config/api-keys/community-keys.json << EOF
{
  "observer_keys": [
    {
      "key": "obs_$(openssl rand -hex 16)",
      "name": "community_dashboard",
      "permissions": ["read_stats", "read_metrics"],
      "rate_limit": {
        "per_minute": 100,
        "per_hour": 2000,
        "per_day": 20000
      },
      "created": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
      "expires": "$(date -u -d '+1 year' +%Y-%m-%dT%H:%M:%SZ)"
    },
    {
      "key": "obs_$(openssl rand -hex 16)",
      "name": "researcher_access",
      "permissions": ["read_stats", "read_metrics", "read_fragments"],
      "rate_limit": {
        "per_minute": 200,
        "per_hour": 5000,
        "per_day": 50000
      },
      "created": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
      "expires": "$(date -u -d '+1 year' +%Y-%m-%dT%H:%M:%SZ)"
    },
    {
      "key": "obs_$(openssl rand -hex 16)",
      "name": "content_creator",
      "permissions": ["read_stats", "read_metrics", "read_fragments", "read_chains"],
      "rate_limit": {
        "per_minute": 300,
        "per_hour": 10000,
        "per_day": 100000
      },
      "created": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
      "expires": "$(date -u -d '+1 year' +%Y-%m-%dT%H:%M:%SZ)"
    }
  ],
  "admin_keys": [
    {
      "key": "admin_$(openssl rand -hex 24)",
      "name": "system_admin",
      "permissions": ["full_access"],
      "rate_limit": {
        "per_minute": 1000,
        "per_hour": 50000,
        "per_day": 1000000
      },
      "created": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
      "expires": "$(date -u -d '+5 years' +%Y-%m-%dT%H:%M:%SZ)"
    }
  ]
}
EOF
    
    echo -e "${GREEN}✅ API keys generated and saved to ./config/api-keys/community-keys.json${NC}"
}

# Create public API documentation
create_public_docs() {
    echo -e "${CYAN}📚 Creating public API documentation...${NC}"
    
    mkdir -p ./docs/public-api
    
    cat > ./docs/public-api/README.md << EOF
# 🌐 Lore Engine Public API

Welcome to the **Multi-Agent Lore Conflict Detection System** public API! This documentation provides everything you need to start monitoring lore evolution and conflict resolution in real-time.

## 🚀 Quick Start

### Authentication
All public API requests require an API key in the header:
\`\`\`bash
curl -H "X-API-Key: your_observer_key_here" https://api.lore-engine.com/lore/stats/public
\`\`\`

### Base URL
- **Production**: \`https://api.lore-engine.com\`
- **Staging**: \`https://staging-api.lore-engine.com\`

## 📊 Available Endpoints

### System Statistics
\`\`\`
GET /lore/stats/public
\`\`\`

Returns comprehensive system metrics including:
- Event processing statistics
- Conflict resolution rates
- Sentiment analysis trends
- Performance metrics
- System health indicators

**Example Response:**
\`\`\`json
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
\`\`\`

### Live Metrics
\`\`\`
GET /lore/metrics/public
\`\`\`

Real-time performance indicators:
- Processing latency
- Error rates
- Resource utilization
- Active connections

### Lore Fragments
\`\`\`
GET /lore/fragments/public
\`\`\`

Query parameters:
- \`limit\`: Number of fragments to return (max 50)
- \`offset\`: Pagination offset
- \`min_cursed_level\`: Minimum cursed level filter
- \`sentiment\`: Filter by sentiment (positive/negative/neutral)

**Example:**
\`\`\`bash
curl -H "X-API-Key: your_key" "https://api.lore-engine.com/lore/fragments/public?limit=10&min_cursed_level=5"
\`\`\`

### Evolution Chains
\`\`\`
GET /lore/chains/public
\`\`\`

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
- \`X-RateLimit-Limit\`: Request limit per window
- \`X-RateLimit-Remaining\`: Requests remaining
- \`X-RateLimit-Reset\`: Time when limit resets

## 🚨 Error Handling

Standard HTTP status codes:
- \`200\`: Success
- \`400\`: Bad request
- \`401\`: Unauthorized (invalid API key)
- \`429\`: Rate limit exceeded
- \`500\`: Internal server error

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
EOF
    
    echo -e "${GREEN}✅ Public API documentation created${NC}"
}

# Create OpenAPI specification
create_openapi_spec() {
    echo -e "${CYAN}🔧 Creating OpenAPI specification...${NC}"
    
    cat > ./docs/public-api/openapi-public.json << EOF
{
  "openapi": "3.0.0",
  "info": {
    "title": "Lore Engine Public API",
    "version": "1.0.0",
    "description": "Multi-Agent Lore Conflict Detection System with Interactive Looping",
    "contact": {
      "name": "Lore Engine Support",
      "url": "https://docs.lore-engine.com",
      "email": "api-support@lore-engine.com"
    },
    "license": {
      "name": "MIT",
      "url": "https://opensource.org/licenses/MIT"
    }
  },
  "servers": [
    {
      "url": "https://api.lore-engine.com",
      "description": "Production server"
    },
    {
      "url": "https://staging-api.lore-engine.com",
      "description": "Staging server"
    }
  ],
  "security": [
    {
      "ApiKeyAuth": []
    }
  ],
  "paths": {
    "/lore/stats/public": {
      "get": {
        "summary": "Get system statistics",
        "description": "Returns comprehensive system metrics including event processing, conflict resolution, and performance data.",
        "tags": ["Statistics"],
        "responses": {
          "200": {
            "description": "System statistics",
            "content": {
              "application/json": {
                "schema": {
                  "\$ref": "#/components/schemas/SystemStats"
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized"
          },
          "429": {
            "description": "Rate limit exceeded"
          }
        }
      }
    },
    "/lore/metrics/public": {
      "get": {
        "summary": "Get live metrics",
        "description": "Returns real-time performance indicators and system health metrics.",
        "tags": ["Metrics"],
        "responses": {
          "200": {
            "description": "Live metrics",
            "content": {
              "application/json": {
                "schema": {
                  "\$ref": "#/components/schemas/LiveMetrics"
                }
              }
            }
          }
        }
      }
    },
    "/lore/fragments/public": {
      "get": {
        "summary": "Get lore fragments",
        "description": "Returns paginated lore fragments with optional filtering.",
        "tags": ["Lore"],
        "parameters": [
          {
            "name": "limit",
            "in": "query",
            "description": "Number of fragments to return (max 50)",
            "schema": {
              "type": "integer",
              "minimum": 1,
              "maximum": 50,
              "default": 10
            }
          },
          {
            "name": "offset",
            "in": "query",
            "description": "Pagination offset",
            "schema": {
              "type": "integer",
              "minimum": 0,
              "default": 0
            }
          },
          {
            "name": "min_cursed_level",
            "in": "query",
            "description": "Minimum cursed level filter",
            "schema": {
              "type": "integer",
              "minimum": 1,
              "maximum": 20
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Lore fragments",
            "content": {
              "application/json": {
                "schema": {
                  "\$ref": "#/components/schemas/LoreFragments"
                }
              }
            }
          }
        }
      }
    },
    "/lore/chains/public": {
      "get": {
        "summary": "Get evolution chains",
        "description": "Returns evolution chains showing content lineage and mutation history.",
        "tags": ["Evolution"],
        "parameters": [
          {
            "name": "days",
            "in": "query",
            "description": "Number of days to look back (max 7)",
            "schema": {
              "type": "integer",
              "minimum": 1,
              "maximum": 7,
              "default": 1
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Evolution chains",
            "content": {
              "application/json": {
                "schema": {
                  "\$ref": "#/components/schemas/EvolutionChains"
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "securitySchemes": {
      "ApiKeyAuth": {
        "type": "apiKey",
        "in": "header",
        "name": "X-API-Key"
      }
    },
    "schemas": {
      "SystemStats": {
        "type": "object",
        "properties": {
          "timestamp": {
            "type": "string",
            "format": "date-time"
          },
          "system_status": {
            "type": "string",
            "enum": ["operational", "degraded", "maintenance"]
          },
          "events_processed": {
            "type": "integer"
          },
          "conflicts_resolved": {
            "type": "integer"
          },
          "sentiment_score": {
            "type": "number",
            "minimum": -1,
            "maximum": 1
          },
          "performance": {
            "type": "object",
            "properties": {
              "avg_response_time": {
                "type": "number"
              },
              "success_rate": {
                "type": "number",
                "minimum": 0,
                "maximum": 1
              },
              "active_loops": {
                "type": "integer"
              }
            }
          }
        }
      },
      "LiveMetrics": {
        "type": "object",
        "properties": {
          "timestamp": {
            "type": "string",
            "format": "date-time"
          },
          "processing_latency": {
            "type": "number"
          },
          "error_rate": {
            "type": "number"
          },
          "resource_utilization": {
            "type": "object",
            "properties": {
              "cpu": {
                "type": "number"
              },
              "memory": {
                "type": "number"
              },
              "disk": {
                "type": "number"
              }
            }
          }
        }
      },
      "LoreFragments": {
        "type": "object",
        "properties": {
          "fragments": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "string"
                },
                "content": {
                  "type": "string"
                },
                "cursed_level": {
                  "type": "integer"
                },
                "sentiment": {
                  "type": "string",
                  "enum": ["positive", "negative", "neutral"]
                },
                "created_at": {
                  "type": "string",
                  "format": "date-time"
                }
              }
            }
          },
          "total": {
            "type": "integer"
          },
          "has_more": {
            "type": "boolean"
          }
        }
      },
      "EvolutionChains": {
        "type": "object",
        "properties": {
          "chains": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "string"
                },
                "mutations": {
                  "type": "integer"
                },
                "quality_score": {
                  "type": "number"
                },
                "virality_score": {
                  "type": "number"
                },
                "created_at": {
                  "type": "string",
                  "format": "date-time"
                }
              }
            }
          }
        }
      }
    }
  }
}
EOF
    
    echo -e "${GREEN}✅ OpenAPI specification created${NC}"
}

# Deploy community dashboard
deploy_dashboard() {
    echo -e "${CYAN}🖥️  Deploying community dashboard...${NC}"
    
    mkdir -p ./public/dashboard
    
    cat > ./public/dashboard/index.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔮 Lore Engine Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #e0e0e0;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        
        .header h1 {
            font-size: 2.5rem;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .stat-card h3 {
            color: #4ecdc4;
            margin-bottom: 10px;
        }
        
        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            color: #ff6b6b;
        }
        
        .loading {
            text-align: center;
            padding: 40px;
            color: #888;
        }
        
        .api-key-input {
            margin: 20px 0;
            padding: 10px;
            width: 300px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 5px;
            color: #e0e0e0;
        }
        
        .connect-btn {
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1rem;
        }
        
        .connect-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔮 The Lore Engine Has Awakened 🔮</h1>
            <p>Multi-Agent Lore Conflict Detection System</p>
            <p>Real-time monitoring and analytics dashboard</p>
            
            <div style="margin-top: 20px;">
                <input type="text" id="apiKey" class="api-key-input" placeholder="Enter your observer API key">
                <button class="connect-btn" onclick="connectToAPI()">Connect</button>
            </div>
        </div>
        
        <div id="dashboard" style="display: none;">
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>📊 Events Processed</h3>
                    <div class="stat-value" id="eventsProcessed">-</div>
                </div>
                <div class="stat-card">
                    <h3>⚡ Conflicts Resolved</h3>
                    <div class="stat-value" id="conflictsResolved">-</div>
                </div>
                <div class="stat-card">
                    <h3>🎭 Sentiment Score</h3>
                    <div class="stat-value" id="sentimentScore">-</div>
                </div>
                <div class="stat-card">
                    <h3>🔄 Active Loops</h3>
                    <div class="stat-value" id="activeLoops">-</div>
                </div>
                <div class="stat-card">
                    <h3>📝 Lore Fragments</h3>
                    <div class="stat-value" id="loreFragments">-</div>
                </div>
                <div class="stat-card">
                    <h3>🧬 Evolution Chains</h3>
                    <div class="stat-value" id="evolutionChains">-</div>
                </div>
            </div>
        </div>
        
        <div id="loading" class="loading">
            <p>🔮 Enter your API key to access the dashboard...</p>
        </div>
    </div>

    <script>
        let apiKey = null;
        let refreshInterval = null;
        
        function connectToAPI() {
            apiKey = document.getElementById('apiKey').value;
            if (!apiKey) {
                alert('Please enter your API key');
                return;
            }
            
            document.getElementById('loading').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            
            // Start fetching data
            fetchStats();
            refreshInterval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
        }
        
        async function fetchStats() {
            try {
                const response = await fetch('/lore/stats/public', {
                    headers: {
                        'X-API-Key': apiKey
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch stats');
                }
                
                const data = await response.json();
                updateDashboard(data);
            } catch (error) {
                console.error('Error fetching stats:', error);
                document.getElementById('loading').innerHTML = 
                    '<p>❌ Error connecting to API. Please check your key and try again.</p>';
            }
        }
        
        function updateDashboard(data) {
            document.getElementById('eventsProcessed').textContent = data.events_processed || 0;
            document.getElementById('conflictsResolved').textContent = data.conflicts_resolved || 0;
            document.getElementById('sentimentScore').textContent = 
                data.sentiment_score ? data.sentiment_score.toFixed(3) : '0.000';
            document.getElementById('activeLoops').textContent = 
                data.performance?.active_loops || 0;
            document.getElementById('loreFragments').textContent = data.lore_fragments || 0;
            document.getElementById('evolutionChains').textContent = data.evolution_chains || 0;
        }
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        });
    </script>
</body>
</html>
EOF
    
    echo -e "${GREEN}✅ Community dashboard deployed${NC}"
}

# Main deployment function
main() {
    echo -e "${PURPLE}🚀 Lore Engine Community API Deployment${NC}"
    echo -e "${PURPLE}=======================================${NC}"
    
    create_api_keys
    create_public_docs
    create_openapi_spec
    deploy_dashboard
    
    echo ""
    echo -e "${GREEN}🎉 Community API deployment completed!${NC}"
    echo ""
    echo -e "${CYAN}📋 Next Steps:${NC}"
    echo -e "${YELLOW}1. Review generated API keys in ./config/api-keys/community-keys.json${NC}"
    echo -e "${YELLOW}2. Update your .env files with the new API keys${NC}"
    echo -e "${YELLOW}3. Deploy the dashboard to your web server${NC}"
    echo -e "${YELLOW}4. Update DNS records for api.lore-engine.com${NC}"
    echo -e "${YELLOW}5. Set up SSL certificates for HTTPS${NC}"
    echo ""
    echo -e "${CYAN}🔗 Resources:${NC}"
    echo -e "${BLUE}• API Documentation: ./docs/public-api/README.md${NC}"
    echo -e "${BLUE}• OpenAPI Spec: ./docs/public-api/openapi-public.json${NC}"
    echo -e "${BLUE}• Dashboard: ./public/dashboard/index.html${NC}"
    echo -e "${BLUE}• API Keys: ./config/api-keys/community-keys.json${NC}"
    echo ""
    echo -e "${PURPLE}🔮 The Lore Engine Community Has Awakened! 🔮${NC}"
}

# Run the deployment
main "$@"
