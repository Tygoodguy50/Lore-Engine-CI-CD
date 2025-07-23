// 🎭 Creator Card Component
// Displays individual creator metrics, performance, and haunted status

class CreatorCard {
    constructor(creatorData) {
        this.data = creatorData;
        this.element = null;
        this.updateInterval = 10000; // 10 seconds
        this.init();
    }

    init() {
        this.createElement();
        this.startUpdates();
        console.log(`👻 Creator card initialized for: ${this.data.handle}`);
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'creator-card';
        this.element.setAttribute('data-creator-id', this.data.id);
        this.update();
        return this.element;
    }

    update() {
        if (!this.element) return;

        const viralScore = this.calculateViralScore();
        const tierInfo = this.getTierInfo(viralScore);
        
        this.element.innerHTML = `
            <div class="creator-header">
                <div class="creator-avatar" style="background: ${this.getAvatarGradient()}">
                    ${this.data.name.charAt(0).toUpperCase()}
                </div>
                <div class="creator-info">
                    <h3>${this.data.name}</h3>
                    <div class="creator-handle">@${this.data.handle}</div>
                </div>
                <div class="creator-status ${this.getStatusClass()}">
                    ${this.getStatusIcon()}
                </div>
            </div>
            
            <div class="creator-metrics">
                <div class="metric-row">
                    <div class="stat-item">
                        <span class="stat-value">${this.formatNumber(this.data.followers)}</span>
                        <span class="stat-label">Followers</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${this.data.dispatchCount || 0}</span>
                        <span class="stat-label">Dispatches</span>
                    </div>
                </div>
                
                <div class="metric-row">
                    <div class="stat-item">
                        <span class="stat-value viral-score">${viralScore.toFixed(2)}</span>
                        <span class="stat-label">Viral Score</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value tier-badge-mini ${tierInfo.class}">${tierInfo.name}</span>
                        <span class="stat-label">Tier</span>
                    </div>
                </div>
            </div>

            <div class="creator-progress">
                <div class="progress-info">
                    <span>Weekly Progress</span>
                    <span class="progress-percentage">${this.calculateWeeklyProgress()}%</span>
                </div>
                <div class="progress-bar-mini">
                    <div class="progress-fill-mini" data-width="${this.calculateWeeklyProgress()}%"></div>
                </div>
            </div>

            <div class="creator-actions">
                <button class="action-btn boost" onclick="creatorManager.boostCreator('${this.data.id}')">
                    <i class="fas fa-rocket"></i> Boost
                </button>
                <button class="action-btn analyze" onclick="creatorManager.analyzeCreator('${this.data.id}')">
                    <i class="fas fa-chart-line"></i> Analyze
                </button>
            </div>
        `;

        // Apply progress bar width with animation
        setTimeout(() => {
            const progressFill = this.element.querySelector('.progress-fill-mini');
            if (progressFill) {
                progressFill.style.width = progressFill.dataset.width;
            }
        }, 100);
    }

    calculateViralScore() {
        // Calculate viral score based on multiple factors
        const engagement = this.data.totalLikes + this.data.totalShares + this.data.totalComments;
        const reach = this.data.totalViews || this.data.followers;
        const frequency = this.data.dispatchCount || 1;
        
        if (reach === 0) return 0;
        
        const baseScore = engagement / reach;
        const frequencyBonus = Math.log(frequency + 1) * 0.1;
        const followerMultiplier = 1 + Math.log(this.data.followers + 1) * 0.05;
        
        return Math.min(5.0, (baseScore * followerMultiplier + frequencyBonus) * 10);
    }

    getTierInfo(score) {
        if (score >= 4.0) return { name: 'Ghost', class: 'ghost-tier' };
        if (score >= 3.0) return { name: 'Wraith', class: 'wraith-tier' };
        if (score >= 2.0) return { name: 'Possessed', class: 'possessed-tier' };
        return { name: 'Shadow', class: 'shadow-tier' };
    }

    getStatusClass() {
        const lastActive = new Date(this.data.lastActive || Date.now());
        const hoursAgo = (Date.now() - lastActive) / (1000 * 60 * 60);
        
        if (hoursAgo < 1) return 'online';
        if (hoursAgo < 24) return 'recent';
        return 'offline';
    }

    getStatusIcon() {
        const status = this.getStatusClass();
        switch (status) {
            case 'online': return '🟢';
            case 'recent': return '🟡';
            default: return '🔴';
        }
    }

    getAvatarGradient() {
        const gradients = [
            'linear-gradient(45deg, #8b5cf6, #00ff41)',
            'linear-gradient(45deg, #ff4757, #8b5cf6)',
            'linear-gradient(45deg, #00ff41, #ffa726)',
            'linear-gradient(45deg, #ffa726, #ff4757)',
            'linear-gradient(45deg, #8b5cf6, #ff4757)'
        ];
        const hash = this.data.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        return gradients[hash % gradients.length];
    }

    calculateWeeklyProgress() {
        // Calculate progress towards next tier or weekly goals
        const currentScore = this.calculateViralScore();
        const tierInfo = this.getTierInfo(currentScore);
        
        let nextTierThreshold;
        switch (tierInfo.name) {
            case 'Shadow': nextTierThreshold = 2.0; break;
            case 'Possessed': nextTierThreshold = 3.0; break;
            case 'Wraith': nextTierThreshold = 4.0; break;
            case 'Ghost': nextTierThreshold = 5.0; break;
            default: nextTierThreshold = 2.0;
        }
        
        const progress = (currentScore / nextTierThreshold) * 100;
        return Math.min(100, Math.max(0, Math.floor(progress)));
    }

    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    updateData(newData) {
        this.data = { ...this.data, ...newData };
        this.update();
        console.log(`🔄 Creator data updated for: ${this.data.handle}`);
    }

    startUpdates() {
        setInterval(() => {
            this.simulateDataUpdate();
        }, this.updateInterval);
    }

    simulateDataUpdate() {
        // Simulate real-time data updates
        const updates = {};
        
        // Simulate follower growth
        if (Math.random() > 0.7) {
            const growth = Math.floor(Math.random() * 50) + 1;
            updates.followers = this.data.followers + growth;
        }
        
        // Simulate dispatch count increase
        if (Math.random() > 0.8) {
            updates.dispatchCount = (this.data.dispatchCount || 0) + 1;
        }
        
        // Simulate engagement updates
        if (Math.random() > 0.6) {
            updates.totalLikes = (this.data.totalLikes || 0) + Math.floor(Math.random() * 100);
            updates.totalShares = (this.data.totalShares || 0) + Math.floor(Math.random() * 20);
            updates.totalComments = (this.data.totalComments || 0) + Math.floor(Math.random() * 30);
        }
        
        if (Object.keys(updates).length > 0) {
            this.updateData(updates);
        }
    }

    // Animation methods
    highlightCard() {
        this.element.style.animation = 'cardHighlight 1s ease-in-out';
        setTimeout(() => {
            this.element.style.animation = '';
        }, 1000);
    }

    showBoostEffect() {
        const boostOverlay = document.createElement('div');
        boostOverlay.className = 'boost-overlay';
        boostOverlay.innerHTML = '<i class="fas fa-rocket"></i>';
        this.element.appendChild(boostOverlay);
        
        setTimeout(() => {
            this.element.removeChild(boostOverlay);
        }, 2000);
    }
}

// Creator Manager - Handles all creator cards
class CreatorManager {
    constructor() {
        this.creators = new Map();
        this.container = null;
        this.init();
    }

    init() {
        this.container = document.getElementById('creatorCards');
        if (!this.container) {
            console.error('Creator cards container not found');
            return;
        }
        
        // Initialize with mock data
        this.loadCreators();
        console.log('👥 Creator Manager initialized');
    }

    loadCreators() {
        const mockCreators = [
            {
                id: 'creator_001',
                name: 'Midnight Whisperer',
                handle: 'midnightwhispers',
                followers: 245000,
                dispatchCount: 47,
                totalLikes: 52000,
                totalShares: 8900,
                totalComments: 12400,
                totalViews: 1200000,
                lastActive: new Date().toISOString()
            },
            {
                id: 'creator_002',
                name: 'Digital Phantom',
                handle: 'digitalphantom',
                followers: 89000,
                dispatchCount: 23,
                totalLikes: 23000,
                totalShares: 4200,
                totalComments: 5800,
                totalViews: 450000,
                lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'creator_003',
                name: 'Void Speaker',
                handle: 'voidspeaker',
                followers: 456000,
                dispatchCount: 89,
                totalLikes: 89000,
                totalShares: 15600,
                totalComments: 23400,
                totalViews: 2100000,
                lastActive: new Date().toISOString()
            },
            {
                id: 'creator_004',
                name: 'Echo Entity',
                handle: 'echoentity',
                followers: 34000,
                dispatchCount: 12,
                totalLikes: 8900,
                totalShares: 1200,
                totalComments: 2300,
                totalViews: 180000,
                lastActive: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
            }
        ];

        mockCreators.forEach(creatorData => {
            const creator = new CreatorCard(creatorData);
            this.creators.set(creatorData.id, creator);
            this.container.appendChild(creator.element);
        });
    }

    boostCreator(creatorId) {
        const creator = this.creators.get(creatorId);
        if (creator) {
            creator.showBoostEffect();
            creator.highlightCard();
            
            // Simulate boost effects
            setTimeout(() => {
                creator.updateData({
                    followers: creator.data.followers + Math.floor(Math.random() * 500) + 100,
                    dispatchCount: creator.data.dispatchCount + 1
                });
            }, 1000);
            
            console.log(`🚀 Boosted creator: ${creator.data.handle}`);
            this.showToast(`Creator ${creator.data.handle} has been boosted!`, 'success');
        }
    }

    analyzeCreator(creatorId) {
        const creator = this.creators.get(creatorId);
        if (creator) {
            creator.highlightCard();
            console.log(`📊 Analyzing creator: ${creator.data.handle}`);
            this.showToast(`Analysis started for ${creator.data.handle}`, 'info');
            
            // Simulate analysis completion
            setTimeout(() => {
                this.showToast(`Analysis complete for ${creator.data.handle}`, 'success');
            }, 2000);
        }
    }

    showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = message;
        
        const container = document.getElementById('toastContainer');
        container.appendChild(toast);
        
        setTimeout(() => {
            container.removeChild(toast);
        }, 3000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.creatorManager = new CreatorManager();
});

// Add CSS for new components
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .creator-metrics {
        margin: 1rem 0;
    }

    .metric-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
    }

    .viral-score {
        color: var(--accent-neon) !important;
        font-weight: 700;
    }

    .tier-badge-mini {
        font-size: 0.7rem;
        padding: 2px 6px;
        border-radius: 10px;
        font-weight: 600;
    }

    .ghost-tier { background: linear-gradient(45deg, #8b5cf6, #00ff41); color: white; }
    .wraith-tier { background: linear-gradient(45deg, #ff4757, #8b5cf6); color: white; }
    .possessed-tier { background: linear-gradient(45deg, #ffa726, #ff4757); color: white; }
    .shadow-tier { background: #333; color: #ccc; }

    .creator-progress {
        margin: 1rem 0;
    }

    .progress-info {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        margin-bottom: 0.25rem;
        color: var(--text-muted);
    }

    .progress-percentage {
        color: var(--accent-neon);
        font-weight: 600;
    }

    .progress-bar-mini {
        background: var(--bg-primary);
        height: 4px;
        border-radius: 2px;
        overflow: hidden;
    }

    .progress-fill-mini {
        background: linear-gradient(90deg, var(--accent-ghost), var(--accent-neon));
        height: 100%;
        width: 0%;
        transition: width 1s ease;
    }

    .creator-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
    }

    .action-btn {
        flex: 1;
        padding: 0.4rem;
        border: 1px solid var(--border-color);
        background: var(--bg-secondary);
        color: var(--text-primary);
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
        transition: all 0.3s ease;
    }

    .action-btn:hover {
        border-color: var(--accent-neon);
        background: var(--bg-hover);
    }

    .creator-status {
        font-size: 1.2rem;
    }

    .boost-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(139, 92, 246, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        color: var(--accent-neon);
        animation: boostEffect 2s ease-in-out;
        border-radius: 8px;
    }

    @keyframes boostEffect {
        0% { opacity: 0; transform: scale(0.5); }
        50% { opacity: 1; transform: scale(1.1); }
        100% { opacity: 0; transform: scale(1); }
    }

    @keyframes cardHighlight {
        0%, 100% { box-shadow: var(--shadow-card); }
        50% { box-shadow: 0 0 30px rgba(0, 255, 65, 0.5); }
    }
`;
document.head.appendChild(additionalStyles);
