// 🧮 Viral Score Meter Component
// Tracks real-time viral coefficients and displays growth trends

class ViralScoreMeter {
    constructor() {
        this.chart = null;
        this.currentCoeff = 1.23;
        this.coeffHistory = [];
        this.updateInterval = 5000; // 5 seconds
        this.init();
    }

    init() {
        this.createChart();
        this.startRealtimeUpdates();
        console.log('👻 Viral Score Meter initialized');
    }

    createChart() {
        const ctx = document.getElementById('viralScoreChart').getContext('2d');
        
        // Generate initial data points
        this.generateInitialData();

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.coeffHistory.map((_, i) => `${i * 5}s ago`).reverse(),
                datasets: [{
                    label: 'Viral Coefficient',
                    data: this.coeffHistory.slice().reverse(),
                    borderColor: '#00ff41',
                    backgroundColor: 'rgba(0, 255, 65, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#8b5cf6',
                    pointBorderColor: '#00ff41',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            color: '#333333'
                        },
                        ticks: {
                            color: '#cccccc'
                        }
                    },
                    y: {
                        display: true,
                        beginAtZero: false,
                        min: 0.5,
                        max: 3.0,
                        grid: {
                            color: '#333333'
                        },
                        ticks: {
                            color: '#cccccc',
                            callback: function(value) {
                                return value.toFixed(2) + 'x';
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                animations: {
                    tension: {
                        duration: 1000,
                        easing: 'easeInOutCubic'
                    }
                }
            }
        });
    }

    generateInitialData() {
        // Generate 20 data points with realistic viral coefficient fluctuations
        for (let i = 0; i < 20; i++) {
            const baseCoeff = 1.2;
            const variation = (Math.random() - 0.5) * 0.8; // ±0.4 variation
            const trendBoost = i * 0.02; // Slight upward trend
            const coefficient = Math.max(0.5, baseCoeff + variation + trendBoost);
            this.coeffHistory.push(parseFloat(coefficient.toFixed(2)));
        }
        this.currentCoeff = this.coeffHistory[this.coeffHistory.length - 1];
    }

    calculateViralCoefficient() {
        // Simulate real viral coefficient calculation
        // In production: (shares + comments + signups) / impressions
        
        const mockMetrics = {
            shares: Math.floor(Math.random() * 1000) + 500,
            comments: Math.floor(Math.random() * 2000) + 800,
            signups: Math.floor(Math.random() * 100) + 50,
            impressions: Math.floor(Math.random() * 10000) + 5000
        };

        const viralActions = mockMetrics.shares + mockMetrics.comments + mockMetrics.signups;
        const coefficient = viralActions / mockMetrics.impressions;
        
        // Apply some smoothing to prevent wild fluctuations
        const smoothedCoeff = (this.currentCoeff * 0.7) + (coefficient * 0.3);
        
        return {
            coefficient: parseFloat(smoothedCoeff.toFixed(2)),
            metrics: mockMetrics
        };
    }

    updateViralScore() {
        const result = this.calculateViralCoefficient();
        const newCoeff = result.coefficient;
        const change = newCoeff - this.currentCoeff;

        // Update history
        this.coeffHistory.push(newCoeff);
        if (this.coeffHistory.length > 20) {
            this.coeffHistory.shift(); // Keep only last 20 points
        }

        // Update current coefficient
        this.currentCoeff = newCoeff;

        // Update chart
        this.chart.data.labels = this.coeffHistory.map((_, i) => `${(19-i) * 5}s ago`);
        this.chart.data.datasets[0].data = this.coeffHistory.slice();
        this.chart.update('none'); // No animation for real-time updates

        // Update DOM elements
        this.updateDOMElements(newCoeff, change);

        // Check for viral threshold alerts
        this.checkViralAlerts(newCoeff);

        console.log(`📈 Viral coefficient updated: ${newCoeff} (${change >= 0 ? '+' : ''}${change.toFixed(2)})`);
    }

    updateDOMElements(coeff, change) {
        const currentCoeffEl = document.getElementById('currentCoeff');
        const coeffChangeEl = document.getElementById('coeffChange');

        if (currentCoeffEl) {
            currentCoeffEl.textContent = coeff.toFixed(2);
            
            // Add pulsing effect for significant changes
            if (Math.abs(change) > 0.1) {
                currentCoeffEl.style.animation = 'pulse 0.5s ease-in-out';
                setTimeout(() => {
                    currentCoeffEl.style.animation = '';
                }, 500);
            }
        }

        if (coeffChangeEl) {
            coeffChangeEl.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}`;
            coeffChangeEl.className = `stat-value ${change >= 0 ? 'positive' : 'negative'}`;
        }
    }

    checkViralAlerts(coeff) {
        // Alert thresholds
        const VIRAL_THRESHOLD = 2.0;
        const SUPER_VIRAL_THRESHOLD = 2.5;
        const DECLINE_THRESHOLD = 0.8;

        if (coeff >= SUPER_VIRAL_THRESHOLD) {
            this.showAlert('🔥 SUPER VIRAL ALERT! Coefficient: ' + coeff, 'success');
            this.triggerAutoRemix();
        } else if (coeff >= VIRAL_THRESHOLD) {
            this.showAlert('🚀 Viral threshold reached! Coefficient: ' + coeff, 'success');
        } else if (coeff <= DECLINE_THRESHOLD) {
            this.showAlert('⚠️ Viral score declining. Consider content boost.', 'warning');
        }
    }

    triggerAutoRemix() {
        // Automatically trigger remix engine for viral content
        console.log('🎭 Auto-triggering remix engine due to viral threshold');
        if (window.fragmentRemixEngine) {
            window.fragmentRemixEngine.triggerHighScoreRemix(this.currentCoeff);
        }
    }

    showAlert(message, type = 'info') {
        // Create and show toast notification
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 0.25rem;">${message}</div>
            <div style="font-size: 0.8rem; opacity: 0.8;">Time: ${new Date().toLocaleTimeString()}</div>
        `;

        const container = document.getElementById('toastContainer');
        container.appendChild(toast);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => container.removeChild(toast), 300);
        }, 5000);
    }

    startRealtimeUpdates() {
        // Update viral score every 5 seconds
        setInterval(() => {
            this.updateViralScore();
        }, this.updateInterval);

        console.log(`⏰ Real-time updates started (${this.updateInterval}ms interval)`);
    }

    // Public methods for external interaction
    getCurrentCoefficient() {
        return this.currentCoeff;
    }

    setUpdateInterval(ms) {
        this.updateInterval = ms;
        console.log(`⏰ Update interval changed to ${ms}ms`);
    }

    exportData() {
        return {
            currentCoefficient: this.currentCoeff,
            history: this.coeffHistory.slice(),
            timestamp: new Date().toISOString()
        };
    }
}

// Initialize viral score meter when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.viralScoreMeter = new ViralScoreMeter();
});

// CSS for slideOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
