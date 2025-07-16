# 📊 Monitoring and Observability Setup

## System Metrics Collection

### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "lore-engine-rules.yml"

scrape_configs:
  - job_name: 'lore-engine-production'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/metrics'
    scrape_interval: 5s
    scrape_timeout: 10s

  - job_name: 'lore-engine-staging'
    static_configs:
      - targets: ['localhost:8081']
    metrics_path: '/metrics'
    scrape_interval: 5s
    scrape_timeout: 10s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### Alerting Rules
```yaml
# lore-engine-rules.yml
groups:
- name: lore-engine-alerts
  rules:
  - alert: LoreEngineDown
    expr: up{job="lore-engine-production"} == 0
    for: 30s
    labels:
      severity: critical
    annotations:
      summary: "🚨 Lore Engine is down"
      description: "The Lore Engine has been down for more than 30 seconds"

  - alert: HighResponseTime
    expr: histogram_quantile(0.95, rate(lore_engine_http_request_duration_seconds_bucket[5m])) > 2
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "⚠️ High response time detected"
      description: "95th percentile response time is {{ $value }}s"

  - alert: HighErrorRate
    expr: rate(lore_engine_http_errors_total[5m]) > 0.1
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "⚠️ High error rate detected"
      description: "Error rate is {{ $value }} errors/second"

  - alert: CursedTopicOverload
    expr: lore_engine_cursed_topics_active > 10
    for: 1m
    labels:
      severity: warning
    annotations:
      summary: "🔮 Too many cursed topics active"
      description: "{{ $value }} cursed topics are currently active"

  - alert: MemoryUsageHigh
    expr: (process_resident_memory_bytes / 1024 / 1024) > 512
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "💾 High memory usage"
      description: "Memory usage is {{ $value }}MB"
```

### Grafana Dashboard JSON
```json
{
  "dashboard": {
    "id": null,
    "title": "🔮 Lore Engine Monitoring",
    "tags": ["lore-engine", "monitoring"],
    "style": "dark",
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "🚀 Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(lore_engine_http_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ],
        "yAxes": [
          {
            "label": "Requests/sec",
            "min": 0
          }
        ]
      },
      {
        "id": 2,
        "title": "⏱️ Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(lore_engine_http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.50, rate(lore_engine_http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "50th percentile"
          }
        ],
        "yAxes": [
          {
            "label": "Seconds",
            "min": 0
          }
        ]
      },
      {
        "id": 3,
        "title": "❌ Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(lore_engine_http_errors_total[5m])",
            "legendFormat": "{{status_code}}"
          }
        ],
        "yAxes": [
          {
            "label": "Errors/sec",
            "min": 0
          }
        ]
      },
      {
        "id": 4,
        "title": "🔮 Cursed Topics",
        "type": "stat",
        "targets": [
          {
            "expr": "lore_engine_cursed_topics_active",
            "legendFormat": "Active"
          },
          {
            "expr": "lore_engine_cursed_topics_total",
            "legendFormat": "Total"
          }
        ]
      },
      {
        "id": 5,
        "title": "💾 Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "process_resident_memory_bytes / 1024 / 1024",
            "legendFormat": "Memory (MB)"
          }
        ],
        "yAxes": [
          {
            "label": "MB",
            "min": 0
          }
        ]
      },
      {
        "id": 6,
        "title": "🌐 Active Sessions",
        "type": "stat",
        "targets": [
          {
            "expr": "lore_engine_active_sessions",
            "legendFormat": "Sessions"
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "5s"
  }
}
```

## Log Management

### Structured Logging Configuration
```go
// logging/config.go
package logging

import (
    "os"
    "github.com/sirupsen/logrus"
)

func SetupLogging() *logrus.Logger {
    log := logrus.New()
    
    // Set JSON formatter for structured logging
    log.SetFormatter(&logrus.JSONFormatter{
        TimestampFormat: "2006-01-02T15:04:05.000Z07:00",
        FieldMap: logrus.FieldMap{
            logrus.FieldKeyTime:  "timestamp",
            logrus.FieldKeyLevel: "level",
            logrus.FieldKeyMsg:   "message",
        },
    })
    
    // Set log level from environment
    level := os.Getenv("LOG_LEVEL")
    switch level {
    case "debug":
        log.SetLevel(logrus.DebugLevel)
    case "info":
        log.SetLevel(logrus.InfoLevel)
    case "warn":
        log.SetLevel(logrus.WarnLevel)
    case "error":
        log.SetLevel(logrus.ErrorLevel)
    default:
        log.SetLevel(logrus.InfoLevel)
    }
    
    return log
}
```

### ELK Stack Configuration
```yaml
# docker-compose.elk.yml
version: '3.8'

services:
  elasticsearch:
    image: elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data

  logstash:
    image: logstash:8.8.0
    ports:
      - "5044:5044"
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
      - ./logstash/config:/usr/share/logstash/config
    depends_on:
      - elasticsearch

  kibana:
    image: kibana:8.8.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

volumes:
  elasticsearch-data:
```

### Logstash Pipeline
```ruby
# logstash/pipeline/lore-engine.conf
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][service] == "lore-engine" {
    json {
      source => "message"
    }
    
    date {
      match => [ "timestamp", "ISO8601" ]
    }
    
    if [level] == "error" {
      mutate {
        add_tag => ["error"]
      }
    }
    
    if [cursed_level] {
      mutate {
        add_tag => ["cursed"]
      }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "lore-engine-%{+YYYY.MM.dd}"
  }
}
```

## Health Checks and Uptime Monitoring

### Health Check Endpoint Enhancement
```go
// health/checker.go
package health

import (
    "context"
    "time"
    "net/http"
    "encoding/json"
)

type HealthChecker struct {
    checks map[string]HealthCheck
}

type HealthCheck func(ctx context.Context) error

type HealthStatus struct {
    Status    string            `json:"status"`
    Timestamp time.Time         `json:"timestamp"`
    Services  map[string]string `json:"services"`
    Uptime    string            `json:"uptime"`
    Version   string            `json:"version"`
}

func (h *HealthChecker) RegisterCheck(name string, check HealthCheck) {
    h.checks[name] = check
}

func (h *HealthChecker) CheckHealth(ctx context.Context) HealthStatus {
    status := HealthStatus{
        Status:    "healthy",
        Timestamp: time.Now(),
        Services:  make(map[string]string),
        Uptime:    getUptime(),
        Version:   getVersion(),
    }
    
    for name, check := range h.checks {
        if err := check(ctx); err != nil {
            status.Services[name] = "unhealthy: " + err.Error()
            status.Status = "unhealthy"
        } else {
            status.Services[name] = "healthy"
        }
    }
    
    return status
}

func (h *HealthChecker) HealthHandler(w http.ResponseWriter, r *http.Request) {
    ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
    defer cancel()
    
    status := h.CheckHealth(ctx)
    
    w.Header().Set("Content-Type", "application/json")
    if status.Status == "healthy" {
        w.WriteHeader(http.StatusOK)
    } else {
        w.WriteHeader(http.StatusServiceUnavailable)
    }
    
    json.NewEncoder(w).Encode(status)
}
```

### Uptime Monitoring with UptimeRobot
```bash
# uptime-robot-setup.sh
#!/bin/bash

API_KEY="your-uptimerobot-api-key"
PROD_URL="http://your-prod-server:8080/health"
STAGING_URL="http://your-staging-server:8081/health"

# Create production monitor
curl -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "api_key=$API_KEY&format=json&type=1&url=$PROD_URL&friendly_name=Lore Engine Production&interval=300" \
  "https://api.uptimerobot.com/v2/newMonitor"

# Create staging monitor  
curl -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "api_key=$API_KEY&format=json&type=1&url=$STAGING_URL&friendly_name=Lore Engine Staging&interval=300" \
  "https://api.uptimerobot.com/v2/newMonitor"
```

## Discord/Slack Integration

### Discord Webhook for Alerts
```go
// alerts/discord.go
package alerts

import (
    "bytes"
    "encoding/json"
    "net/http"
    "time"
)

type DiscordWebhook struct {
    URL string
}

type DiscordEmbed struct {
    Title       string                 `json:"title"`
    Description string                 `json:"description"`
    Color       int                    `json:"color"`
    Fields      []DiscordField         `json:"fields"`
    Footer      map[string]string      `json:"footer"`
    Timestamp   time.Time              `json:"timestamp"`
}

type DiscordField struct {
    Name   string `json:"name"`
    Value  string `json:"value"`
    Inline bool   `json:"inline"`
}

type DiscordMessage struct {
    Embeds []DiscordEmbed `json:"embeds"`
}

func (d *DiscordWebhook) SendAlert(alert Alert) error {
    color := 16711680 // Red for critical
    if alert.Severity == "warning" {
        color = 16776960 // Yellow for warning
    }
    
    embed := DiscordEmbed{
        Title:       alert.Title,
        Description: alert.Description,
        Color:       color,
        Fields: []DiscordField{
            {Name: "Severity", Value: alert.Severity, Inline: true},
            {Name: "Environment", Value: alert.Environment, Inline: true},
            {Name: "Service", Value: "Lore Engine", Inline: true},
        },
        Footer: map[string]string{
            "text": "Lore Engine Monitoring",
        },
        Timestamp: time.Now(),
    }
    
    message := DiscordMessage{
        Embeds: []DiscordEmbed{embed},
    }
    
    payload, err := json.Marshal(message)
    if err != nil {
        return err
    }
    
    _, err = http.Post(d.URL, "application/json", bytes.NewBuffer(payload))
    return err
}
```

### Alertmanager Configuration
```yaml
# alertmanager.yml
global:
  discord_api_url: 'https://discord.com/api/webhooks/'

route:
  group_by: ['alertname']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 12h
  receiver: 'discord-alerts'

receivers:
- name: 'discord-alerts'
  webhook_configs:
  - url: 'YOUR_DISCORD_WEBHOOK_URL'
    send_resolved: true
    title: '🚨 Lore Engine Alert'
    text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
```

## Deployment Pipeline Integration

### Monitoring Stack Deployment
```yaml
# .github/workflows/deploy-monitoring.yml
name: Deploy Monitoring Stack

on:
  push:
    branches: [ main ]
    paths:
      - 'monitoring/**'
      - 'docs/monitoring/**'

jobs:
  deploy-monitoring:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy Prometheus
      run: |
        scp -r monitoring/prometheus/* ${{ secrets.PROD_USER }}@${{ secrets.PROD_HOST }}:/opt/prometheus/
        ssh ${{ secrets.PROD_USER }}@${{ secrets.PROD_HOST }} "sudo systemctl restart prometheus"
    
    - name: Deploy Grafana
      run: |
        scp -r monitoring/grafana/* ${{ secrets.PROD_USER }}@${{ secrets.PROD_HOST }}:/opt/grafana/
        ssh ${{ secrets.PROD_USER }}@${{ secrets.PROD_HOST }} "sudo systemctl restart grafana"
    
    - name: Notify Discord
      env:
        DISCORD_WEBHOOK: ${{ secrets.DISCORD_WEBHOOK_URL }}
      run: |
        curl -H "Content-Type: application/json" \
        -d '{"content": "📊 Monitoring stack updated successfully!"}' \
        $DISCORD_WEBHOOK
```

## Security Monitoring

### Security Event Detection
```go
// security/monitor.go
package security

import (
    "context"
    "time"
    "net/http"
)

type SecurityMonitor struct {
    alerter AlertSender
    rateLimiter *RateLimiter
}

func (s *SecurityMonitor) MonitorRequest(req *http.Request) {
    // Check for suspicious patterns
    if s.detectSuspiciousActivity(req) {
        s.alerter.SendAlert(Alert{
            Title: "🚨 Suspicious Activity Detected",
            Description: "Potential security threat detected",
            Severity: "warning",
            Environment: "production",
            Metadata: map[string]string{
                "ip": req.RemoteAddr,
                "user_agent": req.UserAgent(),
                "endpoint": req.URL.Path,
            },
        })
    }
    
    // Check rate limiting
    if s.rateLimiter.IsBlocked(req.RemoteAddr) {
        s.alerter.SendAlert(Alert{
            Title: "🛡️ Rate Limit Exceeded",
            Description: "Client exceeded rate limit",
            Severity: "warning",
            Environment: "production",
            Metadata: map[string]string{
                "ip": req.RemoteAddr,
                "endpoint": req.URL.Path,
            },
        })
    }
}

func (s *SecurityMonitor) detectSuspiciousActivity(req *http.Request) bool {
    // SQL injection patterns
    sqlPatterns := []string{"'", "union", "select", "drop", "insert"}
    
    // XSS patterns
    xssPatterns := []string{"<script>", "javascript:", "onload="}
    
    // Check URL and parameters
    url := req.URL.String()
    for _, pattern := range append(sqlPatterns, xssPatterns...) {
        if strings.Contains(strings.ToLower(url), pattern) {
            return true
        }
    }
    
    return false
}
```

## Performance Monitoring

### Application Performance Monitoring (APM)
```go
// apm/tracer.go
package apm

import (
    "context"
    "net/http"
    "time"
    "github.com/opentracing/opentracing-go"
    "github.com/uber/jaeger-client-go/config"
)

func InitTracer(serviceName string) (opentracing.Tracer, error) {
    cfg, err := config.FromEnv()
    if err != nil {
        return nil, err
    }
    
    cfg.ServiceName = serviceName
    
    tracer, _, err := cfg.NewTracer()
    if err != nil {
        return nil, err
    }
    
    opentracing.SetGlobalTracer(tracer)
    return tracer, nil
}

func TracingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        span := opentracing.StartSpan(r.URL.Path)
        defer span.Finish()
        
        ctx := opentracing.ContextWithSpan(r.Context(), span)
        r = r.WithContext(ctx)
        
        start := time.Now()
        next.ServeHTTP(w, r)
        duration := time.Since(start)
        
        span.SetTag("http.method", r.Method)
        span.SetTag("http.url", r.URL.String())
        span.SetTag("http.duration", duration.Seconds())
    })
}
```

Your Lore Engine now has comprehensive monitoring and observability capabilities! The mystical performance metrics will be visible to all who seek to understand the engine's inner workings. 🔮📊✨
