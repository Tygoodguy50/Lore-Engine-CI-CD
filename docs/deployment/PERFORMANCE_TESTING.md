# 🧪 Performance Testing Configuration

## k6 Load Testing Scripts

### Basic Health Check Test
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
};

export default function() {
  let response = http.get(`${__ENV.BASE_URL}/health`);
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

### Lore Engine API Test
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '2m', target: 100 },
    { duration: '30s', target: 0 },
  ],
};

const API_KEY = 'community-observer-12345';

export default function() {
  const headers = {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json',
  };

  // Test health endpoint
  let response = http.get(`${__ENV.BASE_URL}/health`);
  check(response, {
    'health check passes': (r) => r.status === 200,
  });

  // Test stats endpoint
  response = http.get(`${__ENV.BASE_URL}/lore/stats`, { headers });
  check(response, {
    'stats endpoint works': (r) => r.status === 200,
    'stats response time < 1s': (r) => r.timings.duration < 1000,
  });

  // Test metrics endpoint
  response = http.get(`${__ENV.BASE_URL}/lore/metrics`, { headers });
  check(response, {
    'metrics endpoint works': (r) => r.status === 200,
    'metrics response time < 2s': (r) => r.timings.duration < 2000,
  });

  // Test lore trigger (light load)
  if (Math.random() < 0.1) { // 10% of requests
    const payload = {
      content: `Performance test content ${Math.random()}`,
      topic: 'performance-testing',
      cursed_level: 3,
    };
    
    response = http.post(`${__ENV.BASE_URL}/lore/trigger`, JSON.stringify(payload), { headers });
    check(response, {
      'trigger endpoint works': (r) => r.status === 200,
      'trigger response time < 5s': (r) => r.timings.duration < 5000,
    });
  }

  sleep(1);
}
```

### Stress Test
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '5m', target: 200 },
    { duration: '1m', target: 300 },
    { duration: '2m', target: 300 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    http_req_failed: ['rate<0.1'], // Error rate under 10%
  },
};

export default function() {
  const endpoints = [
    '/health',
    '/lore/stats',
    '/lore/metrics',
    '/dashboard',
  ];

  endpoints.forEach(endpoint => {
    let response = http.get(`${__ENV.BASE_URL}${endpoint}`);
    check(response, {
      [`${endpoint} responds`]: (r) => r.status === 200,
    });
  });

  sleep(1);
}
```

## Performance Thresholds

### Response Time Targets
- **Health Check**: < 100ms
- **API Endpoints**: < 500ms
- **Lore Processing**: < 2s
- **Dashboard**: < 1s

### Throughput Targets
- **Concurrent Users**: 200+
- **Requests/Second**: 1000+
- **Error Rate**: < 1%

### Resource Usage
- **Memory**: < 512MB
- **CPU**: < 80%
- **Disk I/O**: < 100MB/s

## Monitoring Integration

### Prometheus Metrics
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'lore-engine'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/metrics'
    scrape_interval: 5s
```

### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "Lore Engine Performance",
    "panels": [
      {
        "title": "Response Time",
        "targets": [
          {
            "expr": "lore_engine_http_request_duration_seconds",
            "legendFormat": "{{endpoint}}"
          }
        ]
      },
      {
        "title": "Throughput",
        "targets": [
          {
            "expr": "rate(lore_engine_http_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(lore_engine_http_errors_total[5m])",
            "legendFormat": "{{status_code}}"
          }
        ]
      }
    ]
  }
}
```

## Continuous Performance Testing

### GitHub Actions Integration
```yaml
# .github/workflows/performance.yml
name: Performance Testing

on:
  schedule:
    - cron: '0 */6 * * *' # Every 6 hours
  workflow_dispatch:

jobs:
  performance-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run k6 tests
        run: |
          docker run --rm -v $PWD:/tests grafana/k6 run /tests/performance/api-test.js
```

### Performance Regression Detection
```javascript
// performance-regression.js
import { check } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

export function handleSummary(data) {
  const threshold = {
    'http_req_duration': 500, // 500ms
    'http_req_failed': 0.01,  // 1% error rate
  };

  const failures = [];
  
  Object.entries(threshold).forEach(([metric, limit]) => {
    const value = data.metrics[metric];
    if (value && value.avg > limit) {
      failures.push(`${metric}: ${value.avg} > ${limit}`);
    }
  });

  if (failures.length > 0) {
    console.error('Performance regression detected:', failures);
    // Send alert to Discord/Slack
  }

  return {
    'performance-report.json': JSON.stringify(data),
    'stdout': textSummary(data),
  };
}
```

## Performance Optimization

### Database Optimization
- Connection pooling
- Query optimization
- Indexing strategy
- Caching layer

### Application Optimization
- Goroutine pooling
- Memory management
- HTTP keep-alive
- Response compression

### Infrastructure Optimization
- Load balancing
- CDN integration
- Auto-scaling
- Resource monitoring

## Alert Configuration

### Discord Alerts
```bash
# performance-alert.sh
#!/bin/bash
WEBHOOK_URL="$1"
METRIC="$2"
VALUE="$3"
THRESHOLD="$4"

curl -H "Content-Type: application/json" \
  -d "{
    \"embeds\": [{
      \"title\": \"⚠️ Performance Alert\",
      \"description\": \"Performance threshold exceeded\",
      \"color\": 16711680,
      \"fields\": [
        {\"name\": \"Metric\", \"value\": \"$METRIC\", \"inline\": true},
        {\"name\": \"Value\", \"value\": \"$VALUE\", \"inline\": true},
        {\"name\": \"Threshold\", \"value\": \"$THRESHOLD\", \"inline\": true}
      ]
    }]
  }" \
  "$WEBHOOK_URL"
```

### Automated Scaling
```yaml
# kubernetes/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: lore-engine-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: lore-engine
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

The performance testing setup will help ensure your Lore Engine maintains mystical performance even under heavy load! 🚀⚡
