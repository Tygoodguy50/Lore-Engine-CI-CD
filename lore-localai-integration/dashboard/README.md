# 👻 Haunted Payout Dashboard

## Viral Score Tracking & Revenue Visualization for Lore Engine Empire

A real-time dashboard that transforms your ghostly content empire into cold, hard data. Watch viral coefficients fluctuate, track creator performance, and monitor revenue streams as your haunted ecosystem generates profit autonomously.

---

## 🚀 Features

### 💰 **Real-Time Revenue Tracking**
- **Live Payout Tiers**: Shadow → Possessed → Wraith → Ghost progression
- **Multi-Stream Revenue**: Subscriptions, templates, referrals, premium features
- **Tier Progression**: Visual progress tracking with unlock notifications
- **Revenue Projections**: AI-powered future earnings predictions

### 🧮 **Viral Coefficient Engine**
- **Real-Time Scoring**: Live calculation of viral multiplication factors
- **Engagement Analytics**: (shares + comments + signups) / impressions
- **Threshold Alerts**: Automatic notifications at 2.0x and 2.5x viral levels
- **Auto-Remix Triggers**: Triggers Fragment Remix Engine at viral thresholds

### 🎭 **Creator Performance Matrix**
- **Individual Cards**: Real-time metrics per creator
- **Viral Score Tracking**: Live coefficient calculation per creator
- **Tier Classification**: Ghost/Wraith/Possessed/Shadow ranking
- **Boost Actions**: Manual creator amplification controls

### 🔗 **Referral Chain Analytics**
- **Timeline Visualization**: 24-hour referral activity graphs
- **Chain Tracking**: Multi-level referral conversion monitoring
- **Revenue Attribution**: Commission tracking per referral source
- **High-Value Alerts**: Notifications for premium conversions

### 🧬 **Fragment Performance Table**
- **Viral Scoring**: Real-time fragment performance metrics
- **Remix Tracking**: Count and revenue from content variations
- **Mass Remix Trigger**: Bulk content generation controls
- **Revenue Attribution**: Earnings per content fragment

---

## 🏗️ Architecture

### **Frontend Stack**
```
dashboard/
├── index.html              # Main haunted UI
├── styles.css              # Dark theme + neon accents
├── app.js                  # Core dashboard orchestration
├── components/
│   ├── creatorCard.js      # Individual creator metrics
│   ├── payoutSummary.js    # Tier progression & earnings
│   ├── viralScoreMeter.js  # Real-time coefficient tracking
│   └── referralTimeline.js # Referral chain visualization
└── api/
    ├── getCreators.js      # Creator performance data
    ├── getRevenue.js       # Multi-stream revenue tracking
    └── getViralScore.js    # Viral coefficient calculations
```

### **Backend Integration**
- **Port 8085**: Creator Leaderboards Service
- **Port 8086**: Fragment Remix Engine  
- **Port 8087**: Revenue Multipliers Service
- **Port 8088**: Multi-Platform Dispatcher
- **Port 8089**: Sentiment & Lore Evolution

---

## 🎮 Real-Time Features

### **Live Data Streams**
- **5-second updates**: Viral coefficients and engagement metrics
- **10-second updates**: Creator performance and follower counts  
- **30-second updates**: Revenue streams and payout calculations
- **Background sync**: Continues updating when tab is visible

### **Interactive Elements**
- **Creator Boost**: Manual amplification of specific creators
- **Mass Remix**: Trigger bulk content generation
- **Data Export**: CSV/JSON revenue and performance exports
- **Force Refresh**: Manual data synchronization

---

## 🎯 Key Metrics Tracked

| Metric | Description | Update Frequency |
|--------|-------------|------------------|
| **Viral Coefficient** | (Shares + Comments + Signups) ÷ Impressions | 5 seconds |
| **Weekly Revenue** | Total earnings across all streams | 30 seconds |
| **Active Creators** | Creators with activity in last 24h | 10 seconds |
| **Referral Chains** | Multi-level conversion tracking | 8 seconds |
| **Fragment Performance** | Content viral scores and remix counts | 15 seconds |

---

## 🔥 Viral Threshold System

### **Coefficient Levels**
- **0.5 - 1.5**: Standard engagement
- **1.5 - 2.0**: Rising viral potential  
- **2.0 - 2.5**: **VIRAL THRESHOLD** - Auto-alerts enabled
- **2.5+**: **SUPER VIRAL** - Auto-remix triggers activated

### **Auto-Actions**
- **Viral Alert** (2.0+): Toast notification + creator highlighting
- **Super Viral** (2.5+): Fragment Remix Engine activation
- **Mass Remix**: Available for coefficients 7.5+ (from Phase IV)

---

## 💸 Revenue Tier System

### **Payout Tiers**
| Tier | Weekly Earnings | Multiplier | Badge |
|------|----------------|------------|-------|
| **Shadow** | $0 - $249 | 1.0x | 🌙 |
| **Possessed** | $250 - $749 | 1.2x | 👻 |  
| **Wraith** | $750 - $1,999 | 1.5x | 🔮 |
| **Ghost** | $2,000+ | 2.0x | 👑 |

### **Revenue Sources**
- **Subscriptions**: Haunted CRM monthly/yearly plans
- **Templates**: Horror content bundle sales
- **Referrals**: Creator signup commission (15%)
- **Premium**: AI agent subscriptions, advanced analytics
- **Consulting**: Viral strategy sessions and audits

---

## 🎨 UI/UX Design

### **Dark Haunted Theme**
- **Primary Colors**: Deep blacks (#0a0a0a, #1a1a1a)
- **Accent Colors**: Neon green (#00ff41), Ghost purple (#8b5cf6)
- **Typography**: Inter primary, Fira Code monospace
- **Animations**: Pulse effects, shimmer progress bars, celebration particles

### **Responsive Layout**
- **Desktop**: Multi-column grid with full feature set
- **Tablet**: Adaptive grid with optimized card sizes  
- **Mobile**: Single column with touch-optimized controls

---

## 🚀 Getting Started

### **Prerequisites**
1. **Lore Engine Phase IV** services running (ports 8085-8089)
2. **Modern browser** with JavaScript enabled
3. **HTTP server** for local development

### **Launch Dashboard**
```bash
# Navigate to dashboard directory
cd lore-localai-integration/dashboard

# Start HTTP server (Python)
python -m http.server 3000

# Or Node.js alternative
npx http-server -p 3000

# Open in browser
open http://localhost:3000
```

### **Production Deployment**
- Deploy to **Vercel**, **Netlify**, or **Azure Static Web Apps**
- Configure **CORS** for API endpoints
- Set **environment variables** for API keys and endpoints
- Enable **HTTPS** for secure data transmission

---

## 🔧 Configuration

### **API Endpoints** (app.js)
```javascript
const config = {
    creatorLeaderboards: 'http://localhost:8085',
    fragmentRemix: 'http://localhost:8086', 
    revenueMultipliers: 'http://localhost:8087',
    multiPlatform: 'http://localhost:8088',
    sentimentEvolution: 'http://localhost:8089'
};
```

### **Update Intervals**
```javascript
const intervals = {
    viralCoefficient: 5000,    // 5 seconds
    creatorMetrics: 10000,     // 10 seconds  
    revenueData: 30000,        // 30 seconds
    referralChains: 8000       // 8 seconds
};
```

---

## 📊 Data Integration

### **Mock Data Mode** (Development)
When backend services are unavailable, the dashboard automatically falls back to realistic mock data:
- Simulated creator performance with growth patterns
- Realistic viral coefficient fluctuations  
- Generated referral chains and conversions
- Revenue projections with trend variations

### **Live Data Mode** (Production)  
Connects to actual Lore Engine services:
- Real creator statistics from TikTok API
- Live fragment performance from Remix Engine
- Actual revenue from Stripe and payment processors
- Genuine referral tracking and conversions

---

## 🎯 Success Metrics

The dashboard tracks these key performance indicators:

### **Creator Success**
- **Viral Score**: Target 2.0+ for consistent viral content
- **Tier Progression**: Aim for Wraith/Ghost tier creators (75%+)
- **Engagement Rate**: Track improvement over time
- **Content Frequency**: Optimal posting schedules

### **Revenue Success**  
- **Weekly Growth**: Target 15%+ week-over-week
- **Stream Diversification**: Balance across revenue sources
- **Tier Advancement**: Progressive payout tier climbing
- **Referral Performance**: 20%+ of revenue from referrals

### **Viral Success**
- **Threshold Breaches**: Track frequency of 2.0+ coefficients  
- **Auto-Remix Triggers**: Monitor super-viral content generation
- **Cross-Platform Reach**: Measure multi-platform viral spread
- **Community Growth**: Sustained follower and engagement increases

---

## 🔮 Future Enhancements

### **Phase V Features** (Planned)
- **Global Haunting Protocol**: Worldwide viral coordination
- **AI Prediction Engine**: Viral coefficient forecasting  
- **Creator Marketplace**: Direct creator-brand connections
- **Sentiment Heat Maps**: Visual community emotion tracking
- **Revenue Optimization AI**: Automated pricing and tier adjustments

### **Advanced Analytics**
- **Cohort Analysis**: Creator retention and lifecycle tracking
- **A/B Testing**: Content variation performance comparison
- **Predictive Modeling**: Revenue and growth forecasting
- **Competitive Intelligence**: Industry benchmarking and analysis

---

## 🆘 Troubleshooting

### **Common Issues**

**Dashboard not loading?**
- Check HTTP server is running on port 3000
- Verify JavaScript is enabled in browser
- Check browser console for errors

**No live data?**
- Ensure Phase IV services are running (ports 8085-8089)  
- Check API endpoint configuration in app.js
- Verify CORS settings on backend services

**Charts not displaying?**
- Confirm Chart.js library loaded properly
- Check canvas element IDs match component references
- Verify data format matches chart expectations

**Real-time updates stopped?**
- Check browser tab is visible (updates pause when hidden)
- Verify network connectivity to backend services
- Check console for JavaScript errors

---

## 🤝 Contributing

This dashboard is part of the larger **Lore Engine Empire** ecosystem. Contributions welcome:

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/haunted-improvement`)  
3. **Commit** changes (`git commit -m 'Add ghostly feature'`)
4. **Push** to branch (`git push origin feature/haunted-improvement`)
5. **Open** Pull Request with detailed description

---

## 📜 License

Part of the Lore Engine Empire - Proprietary haunted technology for viral content domination.

---

## 👻 Support

**Need help with your haunted dashboard?**

- 📧 **Email**: tyler@loreengine.com
- 💬 **Discord**: Lore Engine Community  
- 📖 **Docs**: [Phase IV Documentation](./PHASE-IV-SUCCESS-REPORT.md)
- 🎥 **Demo**: [Dashboard Walkthrough Video](./demo/)

---

*"Transform your ghostly whispers into revenue streams. The dashboard doesn't just track performance—it manifests profit from the void."* 💀💰

**Built with 👻 by the Lore Engine Team**
