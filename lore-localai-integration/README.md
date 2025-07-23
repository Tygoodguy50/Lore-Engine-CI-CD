# 🔮 Lore Engine SaaS - Automated Revenue System

> **"Plug in an account and watch it grow"** - Complete viral marketing automation with TikTok → Discord → Revenue flow

## 🎯 Overview

Transform your Lore Engine into a fully automated revenue-generating SaaS platform. This system handles everything from viral TikTok content tracking to automated Stripe billing, all while monitoring real-time conversions through Discord webhooks.

### ⚡ Key Features

- **💳 Stripe Integration**: Complete subscription billing with 3-tier pricing
- **🔁 Viral Referral System**: Crypto-secure referral codes with commission tracking
- **🎮 Discord Automation**: Real-time viral flow monitoring and notifications
- **🚀 Auto-Provisioning**: Instant API key generation and user onboarding
- **📊 Analytics Dashboard**: Viral coefficient tracking and conversion analytics
- **🎬 TikTok Integration**: Fragment tracking and viral content monitoring

## 🏗️ Architecture

```
TikTok Content Creation
         ↓
Discord Fragment Embed
         ↓
Viral Signup Flow
         ↓
Stripe Subscription
         ↓
Auto User Provisioning
         ↓
💰 Automated Revenue
```

## 🚀 SaaS Features

### 💳 Automated Revenue System

- **3-tier pricing model**: Observer ($9.99), Architect ($29.99), Master ($99.99)
- **Stripe integration**: Automated checkout, subscription management, webhooks
- **Usage-based limits**: API calls, events, connections per tier
- **Free trial**: 14-day trial for all plans

### � Customer Experience

- **Pricing page**: Beautiful, responsive pricing with feature comparison
- **Customer dashboard**: Real-time usage monitoring and API testing
- **API key management**: Secure key generation and usage tracking
- **Success/cancel flows**: Smooth onboarding and cancellation experience

### 🔐 API Gateway & Billing

- **Rate limiting**: Per-tier API rate limits with usage validation
- **Authentication**: API key-based authentication for all endpoints
- **Usage tracking**: Real-time monitoring of customer API usage
- **Billing integration**: Automatic usage-based billing calculations

## 🛠️ Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Go 1.21+
- PostgreSQL 13+

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd lore-localai-integration

# Copy environment template
cp .env.example .env

# Start services
docker-compose up -d

# Install dependencies
npm install

# Run development server
npm run dev
```

### Configuration
Edit `.env` file with your settings:
```env
# LocalAI Configuration
LOCALAI_URL=http://localhost:8080
LOCALAI_API_KEY=your-api-key

# Discord Integration
DISCORD_TOKEN=your-discord-token
DISCORD_WEBHOOK_URL=your-webhook-url

# TikTok Integration
TIKTOK_WEBHOOK_URL=your-tiktok-webhook

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/lore_db

# Stripe (Optional)
STRIPE_SECRET_KEY=sk_test_...
```

## 🎯 Subscription Tiers

### 🔍 Lore Observer - $9.99/month

- 1,000 events per month
- 500 conflict detections
- 5 realtime connections
- 60 API calls per minute
- Basic dashboard access
- Email support

### 🏗️ Lore Architect - $29.99/month ⭐ Most Popular

- 10,000 events per month
- 5,000 conflict detections
- 25 realtime connections
- 300 API calls per minute
- Advanced analytics
- Priority support

### 👑 Lore Master - $99.99/month

- Unlimited events & conflicts
- 100 realtime connections
- 1,000 API calls per minute
- Custom integrations
- Dedicated support
- SLA guarantees

## 📦 SaaS Server Installation

### Prerequisites

- Go 1.21+
- Stripe account with API keys
- Existing Lore Engine installation

### Setup

1. **Environment variables for SaaS server**

```bash
export STRIPE_SECRET_KEY="sk_test_..."
export STRIPE_WEBHOOK_SECRET="whsec_..."
export PORT="8085"
```

2. **Run the SaaS server**

```bash
go run cmd/saas-server/main.go
```

3. **Access the SaaS system**

- Pricing page: <http://localhost:8085>
- API endpoints: <http://localhost:8085/api>
- Customer dashboard: <http://localhost:8085/dashboard.html>

## 💰 Revenue Automation

### Stripe Integration

- **Automatic billing**: Monthly recurring subscriptions
- **Failed payment handling**: Smart retry logic and dunning
- **Proration**: Automatic proration for plan changes
- **Tax calculation**: Automatic tax calculation for global customers

### Customer Lifecycle

- **Onboarding**: Automated API key generation and welcome flow
- **Engagement**: Usage dashboards and feature discovery
- **Retention**: Usage-based upgrade prompts and suggestions
- **Win-back**: Cancellation flow with discount offers

## 📁 Project Structure

```
lore-localai-integration/
├── api-gateway/          # API Gateway with rate limiting
├── localai-hosting/      # LocalAI Docker configuration
├── lore-engine/          # Lore conflict detection system
├── marketplace/          # Model marketplace
├── ci-cd/               # CI/CD pipelines
└── scripts/             # Utility scripts
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run integration tests
npm run test:integration

# Run conflict detection tests
npm run test:conflict

# Run marketplace tests
npm run test:marketplace
```

## 🚢 Deployment

### Staging
```bash
# Deploy to staging
npm run deploy:staging

# Run staging tests
npm run test:staging
```

### Production
```bash
# Deploy to production
npm run deploy:production

# Monitor deployment
npm run monitor
```

## 📊 Monitoring

Access monitoring dashboards:
- **API Gateway**: http://localhost:3000/dashboard
- **Lore Engine**: http://localhost:3001/metrics
- **LocalAI**: http://localhost:8080/health
- **Marketplace**: http://localhost:3002/analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 API Documentation

### Lore Engine API
- `POST /lore/conflicts/analyze` - Analyze content for conflicts
- `GET /lore/conflicts/history` - Get conflict history
- `GET /lore/conflicts/stats` - Get conflict statistics

### Model API
- `GET /models` - List available models
- `POST /models/{id}/generate` - Generate content
- `GET /models/{id}/health` - Check model health

### Marketplace API
- `GET /marketplace/models` - Browse model marketplace
- `POST /marketplace/purchase` - Purchase model access
- `GET /marketplace/analytics` - View usage analytics

## 🔧 Configuration

### Model Configuration
Edit `localai-hosting/config/model-registry.json`:
```json
{
  "models": [
    {
      "id": "haunted-model",
      "name": "Haunted Narrative AI",
      "description": "Specialized in dark fantasy narratives",
      "tier": "premium",
      "cursed_level": 8
    }
  ]
}
```

### Webhook Configuration
Configure webhooks in `lore-engine/webhook/`:
- Discord: Real-time conflict notifications
- TikTok: Viral content routing
- Slack: Team notifications

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale API Gateway
docker-compose up -d --scale api-gateway=3

# Scale Lore Engine
docker-compose up -d --scale lore-engine=2

# Scale LocalAI
docker-compose up -d --scale localai=2
```

### Performance Optimization
- Redis caching for conflict detection
- PostgreSQL connection pooling
- Rate limiting with Redis
- Model response caching

## 🔐 Security

- API key authentication
- Rate limiting per user/IP
- Request validation
- CORS configuration
- Environment variable security

## 📚 Documentation

- [API Reference](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [Configuration Guide](./docs/configuration.md)
- [Troubleshooting](./docs/troubleshooting.md)

## 🆘 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@lore-engine.com
- **Discord**: [Join our Discord](https://discord.gg/lore-engine)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by the Lore Engine Team**
