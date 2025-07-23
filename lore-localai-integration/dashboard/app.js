// 👻 Haunted Payout Dashboard - Main Application
// Real-time viral score tracking and revenue visualization

class HauntedPayoutDashboard {
    constructor() {
        this.updateInterval = 5000; // 5 seconds
        this.charts = {};
        this.lastUpdateTime = null;
        this.isInitialized = false;
        this.realtimeData = {
            totalRevenue: 0,
            viralCoefficient: 1.23,
            activeCreators: 0,
            totalReferrals: 0
        };
    }

    async init() {
        try {
            console.log('🏗️ Initializing Haunted Payout Dashboard...');
            
            // Wait for DOM to be ready
            if (document.readyState !== 'complete') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialize components
            await this.initializeComponents();
            
            // Setup real-time updates
            this.startRealtimeUpdates();
            
            // Initialize charts
            this.initializeCharts();
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('✅ Dashboard initialized successfully');
            
            // Initial data load
            await this.loadInitialData();
            
        } catch (error) {
            console.error('❌ Dashboard initialization failed:', error);
            this.showErrorToast('Failed to initialize dashboard');
        }
    }

    async initializeComponents() {
        // Ensure all component instances are available
        const componentsReady = await this.waitForComponents([
            'viralScoreMeter',
            'creatorManager',
            'viralScoreAPI',
            'revenueAPI'
        ]);

        if (!componentsReady) {
            throw new Error('Required components not available');
        }

        console.log('🧩 All components ready');
    }

    async waitForComponents(componentNames, timeout = 10000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            const allReady = componentNames.every(name => window[name] !== undefined);
            if (allReady) return true;
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        return false;
    }

    async loadInitialData() {
        try {
            console.log('📊 Loading initial dashboard data...');
            
            // Load revenue data
            const revenueData = await window.revenueAPI.getCurrentRevenue();
            this.updateRevenueDisplay(revenueData);
            
            // Load viral score
            const viralData = await window.viralScoreAPI.getRealtimeCoefficient();
            this.updateViralScoreDisplay(viralData);
            
            // Load referral data
            const referralData = await this.getReferralData();
            this.updateReferralDisplay(referralData);
            
            // Update fragment performance
            await this.updateFragmentPerformance();
            
            // Update rising ghosts
            await this.updateRisingGhosts();
            
            this.lastUpdateTime = Date.now();
            this.updateLastUpdateTime();
            
            console.log('✅ Initial data loaded');
            
        } catch (error) {
            console.error('❌ Failed to load initial data:', error);
            this.showErrorToast('Failed to load dashboard data');
        }
    }

    initializeCharts() {
        // Initialize referral timeline chart
        this.initializeReferralChart();
        
        // Initialize revenue history chart
        this.initializeRevenueChart();
        
        console.log('📈 Charts initialized');
    }

    initializeReferralChart() {
        const ctx = document.getElementById('referralChart');
        if (!ctx) return;

        this.charts.referral = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(24), // Last 24 hours
                datasets: [{
                    label: 'Referrals',
                    data: this.generateReferralData(24),
                    borderColor: '#00ff41',
                    backgroundColor: 'rgba(0, 255, 65, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: true, grid: { color: '#333' }, ticks: { color: '#ccc' } },
                    y: { display: true, grid: { color: '#333' }, ticks: { color: '#ccc' } }
                }
            }
        });
    }

    initializeRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        this.charts.revenue = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                    {
                        label: 'Subscriptions',
                        data: [340, 445, 523, 678, 589, 712, 634],
                        backgroundColor: '#00ff41'
                    },
                    {
                        label: 'Templates',
                        data: [234, 334, 412, 456, 389, 567, 445],
                        backgroundColor: '#8b5cf6'
                    },
                    {
                        label: 'Referrals',
                        data: [156, 189, 267, 234, 298, 345, 278],
                        backgroundColor: '#ffa726'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { stacked: true, grid: { color: '#333' }, ticks: { color: '#ccc' } },
                    y: { stacked: true, grid: { color: '#333' }, ticks: { color: '#ccc' } }
                }
            }
        });
    }

    generateTimeLabels(hours) {
        const labels = [];
        const now = new Date();
        
        for (let i = hours - 1; i >= 0; i--) {
            const time = new Date(now - i * 60 * 60 * 1000);
            labels.push(time.getHours() + ':00');
        }
        
        return labels;
    }

    generateReferralData(hours) {
        const data = [];
        let cumulative = Math.floor(Math.random() * 50) + 10;
        
        for (let i = 0; i < hours; i++) {
            const change = Math.floor(Math.random() * 8) - 2; // -2 to +6 change
            cumulative = Math.max(0, cumulative + change);
            data.push(cumulative);
        }
        
        return data;
    }

    async updateRevenueDisplay(revenueData) {
        // Update weekly earnings
        const weeklyEarningsEl = document.getElementById('weeklyEarnings');
        if (weeklyEarningsEl) {
            weeklyEarningsEl.textContent = revenueData.total.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }

        // Update tier information
        const currentTierEl = document.getElementById('currentTier');
        if (currentTierEl && revenueData.payoutTier) {
            currentTierEl.textContent = `${revenueData.payoutTier.current.badge} ${revenueData.payoutTier.current.name} Tier`;
        }

        // Update progress bar
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill && revenueData.payoutTier) {
            progressFill.style.width = `${revenueData.payoutTier.progress}%`;
        }

        // Update revenue breakdown
        if (revenueData.breakdown) {
            const subRevenueEl = document.getElementById('subRevenue');
            const templateRevenueEl = document.getElementById('templateRevenue');
            const refRevenueEl = document.getElementById('refRevenue');

            if (subRevenueEl) subRevenueEl.textContent = revenueData.breakdown.subscriptions.toLocaleString();
            if (templateRevenueEl) templateRevenueEl.textContent = revenueData.breakdown.templates.toLocaleString();
            if (refRevenueEl) refRevenueEl.textContent = revenueData.breakdown.referrals.toLocaleString();
        }

        // Update realtime data
        this.realtimeData.totalRevenue = revenueData.total;
    }

    updateViralScoreDisplay(viralData) {
        // Viral score meter handles its own updates
        // Just update our internal data
        this.realtimeData.viralCoefficient = viralData.coefficient;
        
        console.log(`📈 Viral coefficient: ${viralData.coefficient}`);
    }

    async getReferralData() {
        // Mock referral data - would integrate with actual referral system
        return {
            totalReferrals: Math.floor(Math.random() * 200) + 100,
            activeChains: Math.floor(Math.random() * 30) + 15,
            referralRevenue: Math.floor(Math.random() * 2000) + 500,
            conversionRate: Math.random() * 0.2 + 0.05,
            topReferrers: [
                { name: 'Midnight Whisperer', count: 23, revenue: 567 },
                { name: 'Digital Phantom', count: 18, revenue: 423 },
                { name: 'Void Speaker', count: 15, revenue: 378 }
            ]
        };
    }

    updateReferralDisplay(referralData) {
        const totalReferralsEl = document.getElementById('totalReferrals');
        const activeChainsEl = document.getElementById('activeChains');
        const referralRevenueEl = document.getElementById('referralRevenue');

        if (totalReferralsEl) totalReferralsEl.textContent = referralData.totalReferrals;
        if (activeChainsEl) activeChainsEl.textContent = referralData.activeChains;
        if (referralRevenueEl) referralRevenueEl.textContent = `$${referralData.referralRevenue}`;

        // Update realtime data
        this.realtimeData.totalReferrals = referralData.totalReferrals;
    }

    async updateFragmentPerformance() {
        const fragmentTable = document.getElementById('fragmentTable');
        if (!fragmentTable) return;

        const tbody = fragmentTable.querySelector('tbody');
        if (!tbody) return;

        // Mock fragment data - would integrate with Fragment Remix Engine
        const fragments = [
            { name: 'Ancient Whispers v3.2', score: 8.7, views: '245K', remixes: 23, revenue: '$567' },
            { name: 'Digital Void Echo', score: 7.9, views: '189K', remixes: 18, revenue: '$423' },
            { name: 'Phantom Lore Spiral', score: 7.4, views: '156K', remixes: 15, revenue: '$345' },
            { name: 'Cursed Algorithm', score: 6.8, views: '134K', remixes: 12, revenue: '$289' },
            { name: 'Haunted Data Stream', score: 6.2, views: '98K', remixes: 8, revenue: '$198' }
        ];

        tbody.innerHTML = fragments.map(fragment => `
            <tr>
                <td>${fragment.name}</td>
                <td><span class="viral-score">${fragment.score}</span></td>
                <td>${fragment.views}</td>
                <td>${fragment.remixes}</td>
                <td>${fragment.revenue}</td>
            </tr>
        `).join('');
    }

    async updateRisingGhosts() {
        const risingList = document.getElementById('risingCreatorsList');
        if (!risingList) return;

        // Mock rising creators data
        const risingCreators = [
            { name: 'Echo Entity', handle: '@echoentity', trend: '+67%', change: 'up' },
            { name: 'Shadow Weaver', handle: '@shadowweaver', trend: '+45%', change: 'up' },
            { name: 'Void Caller', handle: '@voidcaller', trend: '+34%', change: 'up' },
            { name: 'Digital Wraith', handle: '@digitalwraith', trend: '+28%', change: 'up' }
        ];

        risingList.innerHTML = risingCreators.map(creator => `
            <div class="rising-creator">
                <div class="rising-info">
                    <span style="font-weight: 600;">${creator.name}</span>
                    <span style="color: var(--text-muted); font-size: 0.8rem;">${creator.handle}</span>
                </div>
                <div class="rising-trend">${creator.trend}</div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Handle window visibility for performance
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('⏸️ Dashboard paused (tab hidden)');
            } else {
                console.log('▶️ Dashboard resumed (tab visible)');
                this.forceRefreshData();
            }
        });

        // Handle window resize for charts
        window.addEventListener('resize', () => {
            Object.values(this.charts).forEach(chart => chart.resize());
        });

        console.log('🎮 Event listeners setup complete');
    }

    startRealtimeUpdates() {
        setInterval(async () => {
            if (document.hidden) return; // Don't update when tab is hidden
            
            try {
                await this.updateRealtimeData();
            } catch (error) {
                console.error('❌ Realtime update failed:', error);
            }
        }, this.updateInterval);

        console.log(`⏰ Realtime updates started (${this.updateInterval}ms interval)`);
    }

    async updateRealtimeData() {
        // Update revenue data
        const revenueData = await window.revenueAPI.getCurrentRevenue();
        this.updateRevenueDisplay(revenueData);

        // Update referral data
        const referralData = await this.getReferralData();
        this.updateReferralDisplay(referralData);

        // Update charts with new data
        this.updateChartsData();

        // Update timestamp
        this.lastUpdateTime = Date.now();
        this.updateLastUpdateTime();

        console.log('🔄 Realtime data updated');
    }

    updateChartsData() {
        // Update referral chart with new data point
        if (this.charts.referral) {
            const newReferralValue = Math.floor(Math.random() * 10) + this.realtimeData.totalReferrals;
            this.charts.referral.data.datasets[0].data.push(newReferralValue);
            this.charts.referral.data.datasets[0].data.shift();
            
            // Update labels
            const newLabel = new Date().getHours() + ':' + new Date().getMinutes().toString().padStart(2, '0');
            this.charts.referral.data.labels.push(newLabel);
            this.charts.referral.data.labels.shift();
            
            this.charts.referral.update('none');
        }
    }

    updateLastUpdateTime() {
        const lastUpdateEl = document.getElementById('lastUpdate');
        if (lastUpdateEl && this.lastUpdateTime) {
            const timeString = new Date(this.lastUpdateTime).toLocaleTimeString();
            lastUpdateEl.textContent = `Updated: ${timeString}`;
        }
    }

    // Public methods for external interaction
    async forceRefreshData() {
        try {
            console.log('🔄 Force refreshing dashboard data...');
            await this.loadInitialData();
            this.showSuccessToast('Dashboard refreshed successfully');
        } catch (error) {
            console.error('❌ Force refresh failed:', error);
            this.showErrorToast('Failed to refresh dashboard');
        }
    }

    async exportRevenueData() {
        try {
            console.log('📊 Exporting revenue data...');
            const data = await window.revenueAPI.exportRevenueData('csv');
            
            const blob = new Blob([data], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `haunted-revenue-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            
            this.showSuccessToast('Revenue data exported successfully');
        } catch (error) {
            console.error('❌ Export failed:', error);
            this.showErrorToast('Failed to export revenue data');
        }
    }

    toggleSettings() {
        // TODO: Implement settings modal
        this.showInfoToast('Settings panel coming soon...');
    }

    showSuccessToast(message) {
        this.showToast(message, 'success');
    }

    showErrorToast(message) {
        this.showToast(message, 'error');
    }

    showInfoToast(message) {
        this.showToast(message, 'info');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="font-weight: 600;">${message}</div>
            <div style="font-size: 0.8rem; opacity: 0.8; margin-top: 0.25rem;">
                ${new Date().toLocaleTimeString()}
            </div>
        `;

        const container = document.getElementById('toastContainer');
        if (container) {
            container.appendChild(toast);

            setTimeout(() => {
                container.removeChild(toast);
            }, 4000);
        }
    }
}

// Global functions for button handlers
function forceRefreshData() {
    if (window.dashboard) {
        window.dashboard.forceRefreshData();
    }
}

function exportRevenueData() {
    if (window.dashboard) {
        window.dashboard.exportRevenueData();
    }
}

function toggleSettings() {
    if (window.dashboard) {
        window.dashboard.toggleSettings();
    }
}

function triggerMassRemix() {
    console.log('🎭 Triggering mass remix...');
    if (window.dashboard) {
        window.dashboard.showSuccessToast('Mass remix triggered! Check Fragment Remix Engine.');
    }
}

// Initialize dashboard when everything is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Starting Haunted Payout Dashboard...');
    
    window.dashboard = new HauntedPayoutDashboard();
    await window.dashboard.init();
    
    console.log('👻 Haunted Payout Dashboard is LIVE!');
});
