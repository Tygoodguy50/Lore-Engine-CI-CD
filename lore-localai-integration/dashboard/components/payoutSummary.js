// 💸 Payout Summary Component
// Displays current payout tier, progress, and earnings projections

class PayoutSummary {
    constructor() {
        this.currentTier = null;
        this.weeklyEarnings = 0;
        this.progressToNext = 0;
        this.updateInterval = 30000; // 30 seconds
        this.animations = new Map();
        this.init();
    }

    init() {
        this.startUpdates();
        console.log('💰 Payout Summary component initialized');
    }

    async updatePayoutData() {
        try {
            const revenueData = await window.revenueAPI.getCurrentRevenue();
            
            if (revenueData && revenueData.payoutTier) {
                this.updateTierDisplay(revenueData.payoutTier, revenueData.total);
                this.updateProgressBar(revenueData.payoutTier.progress);
                this.updateEarningsDisplay(revenueData.total);
                this.checkForTierUpgrade(revenueData.payoutTier);
            }
            
        } catch (error) {
            console.error('❌ Failed to update payout data:', error);
        }
    }

    updateTierDisplay(tierInfo, earnings) {
        const tierElement = document.getElementById('currentTier');
        if (!tierElement) return;

        const newTierText = `${tierInfo.current.badge} ${tierInfo.current.name} Tier`;
        
        if (tierElement.textContent !== newTierText) {
            this.animateTierChange(tierElement, newTierText);
        }
        
        this.currentTier = tierInfo.current;
        this.weeklyEarnings = earnings;
    }

    updateProgressBar(progress) {
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill) {
            const currentWidth = parseInt(progressFill.style.width) || 0;
            if (Math.abs(currentWidth - progress) > 1) {
                this.animateProgressBar(progressFill, progress);
            }
        }
        
        if (progressText && this.currentTier && this.currentTier.next) {
            const remaining = this.currentTier.next.min - this.weeklyEarnings;
            progressText.textContent = remaining > 0 ? `$${remaining} to unlock` : 'Tier unlocked!';
        }
        
        this.progressToNext = progress;
    }

    updateEarningsDisplay(earnings) {
        const earningsElement = document.getElementById('weeklyEarnings');
        if (!earningsElement) return;

        const currentEarnings = parseFloat(earningsElement.textContent.replace(/,/g, ''));
        
        if (Math.abs(currentEarnings - earnings) > 0.01) {
            this.animateEarnings(earningsElement, currentEarnings, earnings);
        }
    }

    checkForTierUpgrade(tierInfo) {
        // Check if user just upgraded tiers
        if (this.currentTier && tierInfo.current.name !== this.currentTier.name) {
            this.showTierUpgradeNotification(tierInfo.current);
            this.triggerTierUpgradeEffects();
        }
    }

    animateTierChange(element, newText) {
        element.style.transform = 'scale(0.8)';
        element.style.opacity = '0.5';
        
        setTimeout(() => {
            element.textContent = newText;
            element.style.transform = 'scale(1.1)';
            element.style.opacity = '1';
            
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        }, 150);
    }

    animateProgressBar(progressFill, targetProgress) {
        const animationId = 'progress-animation';
        
        if (this.animations.has(animationId)) {
            clearInterval(this.animations.get(animationId));
        }
        
        const currentWidth = parseInt(progressFill.style.width) || 0;
        const step = (targetProgress - currentWidth) / 20; // 20 steps
        let current = currentWidth;
        
        const animation = setInterval(() => {
            current += step;
            
            if ((step > 0 && current >= targetProgress) || (step < 0 && current <= targetProgress)) {
                current = targetProgress;
                clearInterval(animation);
                this.animations.delete(animationId);
            }
            
            progressFill.style.width = `${Math.max(0, Math.min(100, current))}%`;
        }, 50);
        
        this.animations.set(animationId, animation);
    }

    animateEarnings(element, startValue, endValue) {
        const animationId = 'earnings-animation';
        
        if (this.animations.has(animationId)) {
            clearInterval(this.animations.get(animationId));
        }
        
        const duration = 2000; // 2 seconds
        const steps = 60; // 60 FPS
        const stepValue = (endValue - startValue) / steps;
        let current = startValue;
        let step = 0;
        
        const animation = setInterval(() => {
            step++;
            current += stepValue;
            
            if (step >= steps) {
                current = endValue;
                clearInterval(animation);
                this.animations.delete(animationId);
            }
            
            element.textContent = current.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            
            // Add pulse effect during animation
            if (step % 10 === 0) {
                element.style.color = 'var(--accent-neon)';
                setTimeout(() => {
                    element.style.color = '';
                }, 100);
            }
            
        }, duration / steps);
        
        this.animations.set(animationId, animation);
    }

    showTierUpgradeNotification(newTier) {
        const notification = document.createElement('div');
        notification.className = 'tier-upgrade-notification';
        notification.innerHTML = `
            <div class="upgrade-content">
                <div class="upgrade-icon">${newTier.badge}</div>
                <div class="upgrade-text">
                    <div class="upgrade-title">Tier Upgraded!</div>
                    <div class="upgrade-subtitle">You've reached ${newTier.name} Tier</div>
                    <div class="upgrade-multiplier">${newTier.multiplier}x Revenue Multiplier</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 500);
        }, 5000);
    }

    triggerTierUpgradeEffects() {
        // Add screen flash effect
        const flash = document.createElement('div');
        flash.className = 'tier-upgrade-flash';
        document.body.appendChild(flash);
        
        setTimeout(() => {
            flash.classList.add('active');
            setTimeout(() => {
                document.body.removeChild(flash);
            }, 1000);
        }, 100);
        
        // Trigger confetti or particle effect
        this.createCelebrationParticles();
    }

    createCelebrationParticles() {
        const colors = ['#00ff41', '#8b5cf6', '#ffa726'];
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'celebration-particle';
                particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                particle.style.left = Math.random() * 100 + 'vw';
                particle.style.top = '-10px';
                particle.style.animationDelay = Math.random() * 2 + 's';
                
                document.body.appendChild(particle);
                
                setTimeout(() => {
                    if (document.body.contains(particle)) {
                        document.body.removeChild(particle);
                    }
                }, 4000);
            }, i * 100);
        }
    }

    startUpdates() {
        // Initial update
        this.updatePayoutData();
        
        // Periodic updates
        setInterval(() => {
            this.updatePayoutData();
        }, this.updateInterval);
    }

    // Public methods
    manualUpdate() {
        this.updatePayoutData();
    }

    getCurrentTier() {
        return this.currentTier;
    }

    getWeeklyEarnings() {
        return this.weeklyEarnings;
    }

    getProgressToNext() {
        return this.progressToNext;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.payoutSummary = new PayoutSummary();
});

// Add CSS for tier upgrade effects
const upgradeStyles = document.createElement('style');
upgradeStyles.textContent = `
    .tier-upgrade-notification {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.8);
        background: linear-gradient(135deg, var(--bg-card), var(--bg-secondary));
        border: 2px solid var(--accent-neon);
        border-radius: 16px;
        padding: 2rem;
        z-index: 1000;
        box-shadow: 0 10px 40px rgba(0, 255, 65, 0.3);
        opacity: 0;
        transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        min-width: 300px;
        text-align: center;
    }

    .tier-upgrade-notification.show {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
    }

    .upgrade-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    .upgrade-icon {
        font-size: 4rem;
        animation: bounce 1s ease-in-out infinite alternate;
    }

    .upgrade-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--accent-neon);
        margin-bottom: 0.5rem;
    }

    .upgrade-subtitle {
        font-size: 1.1rem;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
    }

    .upgrade-multiplier {
        font-size: 0.9rem;
        color: var(--accent-ghost);
        font-weight: 600;
    }

    .tier-upgrade-flash {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle, rgba(0, 255, 65, 0.1) 0%, transparent 70%);
        z-index: 999;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.5s ease;
    }

    .tier-upgrade-flash.active {
        opacity: 1;
        animation: flash 1s ease-in-out;
    }

    .celebration-particle {
        position: fixed;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        animation: particleFall 4s ease-in forwards;
        z-index: 998;
        pointer-events: none;
    }

    @keyframes bounce {
        0% { transform: translateY(0); }
        100% { transform: translateY(-10px); }
    }

    @keyframes flash {
        0%, 100% { opacity: 0; }
        50% { opacity: 1; }
    }

    @keyframes particleFall {
        0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(upgradeStyles);
