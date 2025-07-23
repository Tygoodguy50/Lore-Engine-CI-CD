// 🔗 Referral Timeline Component
// Tracks and visualizes referral chains, conversions, and revenue impact

class ReferralTimeline {
    constructor() {
        this.referralChains = new Map();
        this.realtimeEvents = [];
        this.updateInterval = 8000; // 8 seconds
        this.chart = null;
        this.totalReferrals = 0;
        this.activeChains = 0;
        this.referralRevenue = 0;
        this.init();
    }

    init() {
        this.loadInitialData();
        this.startRealtimeTracking();
        console.log('🔗 Referral Timeline component initialized');
    }

    async loadInitialData() {
        try {
            // Simulate loading referral data from API
            const referralData = await this.fetchReferralData();
            this.processReferralData(referralData);
            this.updateDisplay();
            
        } catch (error) {
            console.error('❌ Failed to load referral data:', error);
            this.loadMockData();
        }
    }

    async fetchReferralData() {
        // In production, this would fetch from the actual referral tracking API
        // For now, simulate with realistic referral chain data
        return this.generateMockReferralData();
    }

    generateMockReferralData() {
        const chains = [];
        const creators = ['midnightwhispers', 'digitalphantom', 'voidspeaker', 'echoentity', 'shadowweaver'];
        
        // Generate referral chains for the last 30 days
        for (let i = 0; i < 50; i++) {
            const rootCreator = creators[Math.floor(Math.random() * creators.length)];
            const chain = this.generateReferralChain(rootCreator, Math.floor(Math.random() * 5) + 1);
            chains.push(chain);
        }
        
        return {
            chains,
            totalReferrals: chains.reduce((sum, chain) => sum + chain.conversions.length, 0),
            totalRevenue: chains.reduce((sum, chain) => sum + chain.totalRevenue, 0),
            activeChains: chains.filter(chain => this.isChainActive(chain)).length
        };
    }

    generateReferralChain(rootCreator, depth) {
        const chain = {
            id: `chain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            rootCreator,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
            conversions: [],
            totalRevenue: 0,
            status: 'active'
        };

        // Generate conversions for this chain
        const conversionCount = Math.floor(Math.random() * 8) + 1;
        for (let i = 0; i < conversionCount; i++) {
            const conversion = {
                id: `conv_${Date.now()}_${i}`,
                userId: `user_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date(chain.createdAt.getTime() + i * 24 * 60 * 60 * 1000 + Math.random() * 24 * 60 * 60 * 1000),
                type: this.getRandomConversionType(),
                value: this.getConversionValue(),
                source: this.getRandomSource()
            };
            
            chain.conversions.push(conversion);
            chain.totalRevenue += conversion.value * 0.15; // 15% commission
        }

        return chain;
    }

    getRandomConversionType() {
        const types = ['subscription', 'template_purchase', 'premium_upgrade', 'consulting_booking', 'ai_agent_subscription'];
        return types[Math.floor(Math.random() * types.length)];
    }

    getConversionValue() {
        const values = [9.99, 19.99, 29.99, 49.99, 99.99, 199.99];
        return values[Math.floor(Math.random() * values.length)];
    }

    getRandomSource() {
        const sources = ['tiktok', 'instagram', 'youtube', 'twitter', 'discord', 'direct'];
        return sources[Math.floor(Math.random() * sources.length)];
    }

    isChainActive(chain) {
        const lastConversion = Math.max(...chain.conversions.map(c => new Date(c.timestamp).getTime()));
        const daysSinceLastActivity = (Date.now() - lastConversion) / (1000 * 60 * 60 * 24);
        return daysSinceLastActivity <= 7; // Active if conversion in last 7 days
    }

    processReferralData(data) {
        this.totalReferrals = data.totalReferrals;
        this.activeChains = data.activeChains;
        this.referralRevenue = data.totalRevenue;

        // Process chains for display
        data.chains.forEach(chain => {
            this.referralChains.set(chain.id, chain);
        });

        // Generate timeline events
        this.generateTimelineEvents();
    }

    generateTimelineEvents() {
        this.realtimeEvents = [];
        const now = Date.now();
        
        // Generate events for the last 24 hours
        for (let i = 23; i >= 0; i--) {
            const hourStart = now - (i * 60 * 60 * 1000);
            const hourEnd = hourStart + (60 * 60 * 1000);
            
            // Count conversions in this hour
            let hourlyConversions = 0;
            let hourlyRevenue = 0;
            
            this.referralChains.forEach(chain => {
                chain.conversions.forEach(conversion => {
                    const conversionTime = new Date(conversion.timestamp).getTime();
                    if (conversionTime >= hourStart && conversionTime < hourEnd) {
                        hourlyConversions++;
                        hourlyRevenue += conversion.value * 0.15;
                    }
                });
            });
            
            this.realtimeEvents.push({
                timestamp: new Date(hourStart).toISOString(),
                hour: new Date(hourStart).getHours(),
                conversions: hourlyConversions,
                revenue: hourlyRevenue,
                label: `${new Date(hourStart).getHours()}:00`
            });
        }
    }

    updateDisplay() {
        // Update stats
        this.updateReferralStats();
        
        // Update chart if it exists
        if (this.chart) {
            this.updateChart();
        }
        
        console.log(`🔄 Referral display updated - ${this.totalReferrals} total referrals, ${this.activeChains} active chains`);
    }

    updateReferralStats() {
        const totalReferralsEl = document.getElementById('totalReferrals');
        const activeChainsEl = document.getElementById('activeChains');
        const referralRevenueEl = document.getElementById('referralRevenue');

        if (totalReferralsEl) {
            this.animateNumber(totalReferralsEl, this.totalReferrals);
        }

        if (activeChainsEl) {
            this.animateNumber(activeChainsEl, this.activeChains);
        }

        if (referralRevenueEl) {
            referralRevenueEl.textContent = `$${Math.floor(this.referralRevenue)}`;
        }
    }

    updateChart() {
        if (!this.chart) return;

        const labels = this.realtimeEvents.map(event => event.label);
        const conversionData = this.realtimeEvents.map(event => event.conversions);
        
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = conversionData;
        this.chart.update('none');
    }

    animateNumber(element, targetValue) {
        const currentValue = parseInt(element.textContent) || 0;
        const diff = targetValue - currentValue;
        
        if (Math.abs(diff) <= 1) return; // Skip animation for small changes
        
        const steps = 20;
        const stepValue = diff / steps;
        let current = currentValue;
        
        const animation = setInterval(() => {
            current += stepValue;
            
            if ((stepValue > 0 && current >= targetValue) || (stepValue < 0 && current <= targetValue)) {
                current = targetValue;
                clearInterval(animation);
            }
            
            element.textContent = Math.floor(current);
        }, 50);
    }

    startRealtimeTracking() {
        setInterval(() => {
            this.simulateRealtimeActivity();
        }, this.updateInterval);
    }

    simulateRealtimeActivity() {
        // Simulate new referral activity
        if (Math.random() > 0.7) {
            this.addRandomReferralEvent();
        }
        
        // Update the display
        this.updateDisplay();
    }

    addRandomReferralEvent() {
        const creators = ['midnightwhispers', 'digitalphantom', 'voidspeaker', 'echoentity'];
        const rootCreator = creators[Math.floor(Math.random() * creators.length)];
        
        // Create new conversion
        const conversion = {
            id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            userId: `user_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            type: this.getRandomConversionType(),
            value: this.getConversionValue(),
            source: this.getRandomSource()
        };
        
        // Add to an existing chain or create new one
        const existingChains = Array.from(this.referralChains.values()).filter(chain => 
            chain.rootCreator === rootCreator && chain.status === 'active'
        );
        
        if (existingChains.length > 0 && Math.random() > 0.3) {
            // Add to existing chain
            const targetChain = existingChains[Math.floor(Math.random() * existingChains.length)];
            targetChain.conversions.push(conversion);
            targetChain.totalRevenue += conversion.value * 0.15;
        } else {
            // Create new chain
            const newChain = {
                id: `chain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                rootCreator,
                createdAt: new Date(),
                conversions: [conversion],
                totalRevenue: conversion.value * 0.15,
                status: 'active'
            };
            
            this.referralChains.set(newChain.id, newChain);
            this.activeChains++;
        }
        
        this.totalReferrals++;
        this.referralRevenue += conversion.value * 0.15;
        
        // Show notification for significant events
        if (conversion.value >= 99.99) {
            this.showHighValueReferralNotification(conversion, rootCreator);
        }
        
        console.log(`💰 New referral: ${conversion.type} ($${conversion.value}) via ${rootCreator}`);
    }

    showHighValueReferralNotification(conversion, creator) {
        const notification = document.createElement('div');
        notification.className = 'referral-notification high-value';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">💰</div>
                <div class="notification-text">
                    <div class="notification-title">High-Value Referral!</div>
                    <div class="notification-details">$${conversion.value} ${conversion.type.replace('_', ' ')} via @${creator}</div>
                    <div class="notification-commission">+$${(conversion.value * 0.15).toFixed(2)} commission</div>
                </div>
            </div>
        `;
        
        const container = document.getElementById('toastContainer');
        if (container) {
            container.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('show');
            }, 100);
            
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (container.contains(notification)) {
                        container.removeChild(notification);
                    }
                }, 300);
            }, 4000);
        }
    }

    loadMockData() {
        // Fallback mock data
        this.totalReferrals = 142;
        this.activeChains = 23;
        this.referralRevenue = 1247;
        
        this.updateDisplay();
    }

    // Public methods
    getCurrentStats() {
        return {
            totalReferrals: this.totalReferrals,
            activeChains: this.activeChains,
            referralRevenue: this.referralRevenue,
            conversionRate: this.calculateConversionRate(),
            topPerformers: this.getTopPerformers()
        };
    }

    calculateConversionRate() {
        const totalClicks = this.totalReferrals * 1.5; // Estimate clicks from conversions
        return totalClicks > 0 ? (this.totalReferrals / totalClicks * 100).toFixed(1) : 0;
    }

    getTopPerformers() {
        const creatorStats = new Map();
        
        this.referralChains.forEach(chain => {
            if (!creatorStats.has(chain.rootCreator)) {
                creatorStats.set(chain.rootCreator, {
                    name: chain.rootCreator,
                    conversions: 0,
                    revenue: 0
                });
            }
            
            const stats = creatorStats.get(chain.rootCreator);
            stats.conversions += chain.conversions.length;
            stats.revenue += chain.totalRevenue;
        });
        
        return Array.from(creatorStats.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.referralTimeline = new ReferralTimeline();
});

// Add CSS for referral notifications
const referralStyles = document.createElement('style');
referralStyles.textContent = `
    .referral-notification {
        background: var(--bg-card);
        border: 1px solid var(--accent-warning);
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 0.5rem;
        transform: translateX(100%);
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(255, 167, 38, 0.2);
    }

    .referral-notification.high-value {
        border-color: var(--accent-neon);
        box-shadow: 0 4px 12px rgba(0, 255, 65, 0.3);
    }

    .referral-notification.show {
        transform: translateX(0);
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .notification-icon {
        font-size: 1.5rem;
    }

    .notification-title {
        font-weight: 600;
        color: var(--text-primary);
        font-size: 0.9rem;
    }

    .notification-details {
        font-size: 0.8rem;
        color: var(--text-secondary);
        margin: 0.25rem 0;
    }

    .notification-commission {
        font-size: 0.8rem;
        color: var(--accent-neon);
        font-weight: 600;
    }
`;
document.head.appendChild(referralStyles);
