/**
 * 🧬 Referral Emitter - Viral Growth Engine
 * 
 * Generates unique referral codes for lore fragments to drive signups
 * and track viral spread across platforms
 */

class ReferralEmitter {
    constructor(config = {}) {
        this.baseURL = config.baseURL || 'https://18e5cda9df96.ngrok-free.app';
        this.apiKey = config.apiKey || process.env.REFERRAL_API_KEY;
        this.trackingEnabled = config.trackingEnabled !== false;
        this.platform = config.platform || 'tiktok';
        
        // Referral code patterns for different platforms
        this.patterns = {
            tiktok: { prefix: 'TT', length: 8, format: 'alphanumeric' },
            discord: { prefix: 'DC', length: 6, format: 'numeric' },
            general: { prefix: 'LR', length: 10, format: 'mixed' }
        };
    }

    /**
     * Generate a unique referral code for a lore fragment
     * @param {Object} loreFragment - The lore fragment to generate code for
     * @returns {Object} Enhanced fragment with referral data
     */
    generateReferralCode(loreFragment) {
        const pattern = this.patterns[this.platform] || this.patterns.general;
        const timestamp = Date.now().toString(36);
        const randomSuffix = this._generateRandomString(pattern.length - pattern.prefix.length - 4);
        
        const referralCode = `${pattern.prefix}${timestamp}${randomSuffix}`.toUpperCase();
        
        return {
            ...loreFragment,
            referral: {
                code: referralCode,
                trackingURL: `${this.baseURL}/ref/${referralCode}`,
                platform: this.platform,
                createdAt: new Date().toISOString(),
                metrics: {
                    clicks: 0,
                    signups: 0,
                    conversions: 0,
                    viral_coefficient: 0.0
                }
            },
            enhanced_content: this._injectReferralContent(loreFragment.content, referralCode)
        };
    }

    /**
     * Inject referral content into lore fragments naturally
     * @param {string} content - Original lore content
     * @param {string} referralCode - Generated referral code
     * @returns {string} Enhanced content with subtle referral injection
     */
    _injectReferralContent(content, referralCode) {
        const injectionPatterns = [
            `${content}\n\n🔮 The ancient code speaks: ${referralCode}`,
            `${content}\n\n✨ Those who seek deeper mysteries... use ${referralCode}`,
            `${content}\n\n👁️ The watchers have left a sign: ${referralCode}`,
            `${content}\n\n🌌 Cosmic alignment detected: ${referralCode}`,
            `${content}\n\n🕸️ The web expands... ${referralCode}`
        ];
        
        return injectionPatterns[Math.floor(Math.random() * injectionPatterns.length)];
    }

    /**
     * Track referral performance
     * @param {string} referralCode - The referral code to track
     * @param {string} eventType - Type of event (click, signup, conversion)
     * @returns {Promise<Object>} Tracking result
     */
    async trackReferralEvent(referralCode, eventType = 'click') {
        if (!this.trackingEnabled) return { tracked: false };

        try {
            const response = await fetch(`${this.baseURL}/api/referrals/track`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    referral_code: referralCode,
                    event_type: eventType,
                    platform: this.platform,
                    timestamp: new Date().toISOString(),
                    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
                    ip_hash: this._generateIPHash()
                })
            });

            return await response.json();
        } catch (error) {
            console.error('🚨 Referral tracking failed:', error);
            return { tracked: false, error: error.message };
        }
    }

    /**
     * Get referral performance metrics
     * @param {string} referralCode - The referral code to analyze
     * @returns {Promise<Object>} Performance metrics
     */
    async getReferralMetrics(referralCode) {
        try {
            const response = await fetch(`${this.baseURL}/api/referrals/${referralCode}/metrics`);
            return await response.json();
        } catch (error) {
            console.error('🚨 Failed to fetch referral metrics:', error);
            return { error: error.message };
        }
    }

    /**
     * Process batch of lore fragments with referral codes
     * @param {Array} loreFragments - Array of lore fragments
     * @returns {Array} Enhanced fragments with referral data
     */
    processBatch(loreFragments) {
        return loreFragments.map(fragment => this.generateReferralCode(fragment));
    }

    /**
     * Generate random string for referral codes
     * @param {number} length - Length of random string
     * @returns {string} Random string
     */
    _generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Generate IP hash for privacy-compliant tracking
     * @returns {string} Hashed IP identifier
     */
    _generateIPHash() {
        const timestamp = Date.now();
        const random = Math.random();
        return btoa(`${timestamp}:${random}`).substr(0, 12);
    }

    /**
     * Calculate viral coefficient for a referral code
     * @param {Object} metrics - Referral metrics
     * @returns {number} Viral coefficient (signups per original user)
     */
    calculateViralCoefficient(metrics) {
        if (!metrics.clicks || metrics.clicks === 0) return 0;
        return (metrics.signups * metrics.conversions) / metrics.clicks;
    }
}

// Export for Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReferralEmitter;
} else if (typeof window !== 'undefined') {
    window.ReferralEmitter = ReferralEmitter;
}

// Usage example for the Lore Dispatcher
const createReferralEmitter = (platform = 'tiktok') => {
    return new ReferralEmitter({
        baseURL: 'https://18e5cda9df96.ngrok-free.app',
        platform: platform,
        trackingEnabled: true
    });
};

// Export factory function
if (typeof module !== 'undefined' && module.exports) {
    module.exports.createReferralEmitter = createReferralEmitter;
}
