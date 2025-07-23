#!/usr/bin/env node
/**
 * Enhanced Stripe Dashboard Server - Phase IV Integration
 * Comprehensive payment analytics with haunted empire theming
 */

const http = require('http');
const PORT = 3003;

const dashboardHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔮 Haunted Empire - Payment Analytics Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 25%, #2a0a2a 50%, #1a0a1a 75%, #0a0a0a 100%);
            color: #e0e0e0;
            min-height: 100vh;
            overflow-x: hidden;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 107, 107, 0.2);
            box-shadow: 0 8px 32px rgba(255, 107, 107, 0.1);
        }

        .header h1 {
            font-size: 2.5rem;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
            animation: glow 3s ease-in-out infinite alternate;
        }

        @keyframes glow {
            from { filter: drop-shadow(0 0 5px rgba(255, 107, 107, 0.3)); }
            to { filter: drop-shadow(0 0 20px rgba(255, 107, 107, 0.6)); }
        }

        .status-bar {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }

        .status-item {
            background: rgba(255, 255, 255, 0.1);
            padding: 10px 20px;
            border-radius: 25px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        .status-online { background: #4ecdc4; }
        .status-offline { background: #ff6b6b; }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .card {
            background: rgba(255, 255, 255, 0.08);
            padding: 25px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 40px rgba(255, 107, 107, 0.2);
        }

        .card h3 {
            color: #4ecdc4;
            margin-bottom: 15px;
            font-size: 1.3rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .metric-value {
            font-size: 2.2rem;
            font-weight: bold;
            color: #ff6b6b;
            margin-bottom: 5px;
        }

        .metric-label {
            color: #999;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .creator-list {
            max-height: 300px;
            overflow-y: auto;
        }

        .creator-item {
            background: rgba(255, 255, 255, 0.05);
            margin-bottom: 10px;
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #4ecdc4;
            transition: background 0.3s ease;
        }

        .creator-item:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        .creator-name {
            font-weight: bold;
            color: #4ecdc4;
            margin-bottom: 5px;
        }

        .creator-stats {
            display: flex;
            justify-content: space-between;
            font-size: 0.9rem;
            color: #ccc;
        }

        .tier-ghost { border-left-color: #ff6b6b; }
        .tier-wraith { border-left-color: #45b7d1; }
        .tier-possessed { border-left-color: #96ceb4; }
        .tier-shadow { border-left-color: #666; }

        .stripe-integration {
            background: linear-gradient(135deg, rgba(106, 90, 205, 0.2), rgba(72, 61, 139, 0.2));
            border: 1px solid rgba(106, 90, 205, 0.3);
        }

        .payment-methods {
            display: flex;
            gap: 15px;
            margin-top: 15px;
        }

        .payment-method {
            background: rgba(255, 255, 255, 0.1);
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 0.8rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .loading {
            text-align: center;
            padding: 40px;
            color: #888;
            font-size: 1.2rem;
        }

        .refresh-btn {
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1rem;
            margin: 20px auto;
            display: block;
            transition: transform 0.3s ease;
        }

        .refresh-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
        }

        .transactions-list {
            max-height: 200px;
            overflow-y: auto;
        }

        .transaction-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .error-message {
            background: rgba(255, 107, 107, 0.2);
            border: 1px solid rgba(255, 107, 107, 0.5);
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: center;
        }

        .success-message {
            background: rgba(76, 205, 196, 0.2);
            border: 1px solid rgba(76, 205, 196, 0.5);
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: center;
        }
        
        .webhook-status {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 10px;
        }
        
        .api-version {
            font-size: 0.8rem;
            color: #999;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔮 Haunted Empire Payment Analytics</h1>
            <p>Real-time Stripe Integration & Creator Revenue Tracking</p>
            <div class="status-bar">
                <div class="status-item">
                    <div class="status-indicator" id="stripeStatus"></div>
                    <span>Stripe API</span>
                </div>
                <div class="status-item">
                    <div class="status-indicator" id="creatorsStatus"></div>
                    <span>Creator Leaderboards</span>
                </div>
                <div class="status-item">
                    <div class="status-indicator" id="paymentsStatus"></div>
                    <span>Payment Service</span>
                </div>
            </div>
        </div>

        <div id="loading" class="loading">
            <p>🔮 Loading payment analytics...</p>
        </div>

        <div id="dashboard" style="display: none;">
            <div class="dashboard-grid">
                <!-- Stripe Integration Status -->
                <div class="card stripe-integration">
                    <h3>💳 Stripe Integration</h3>
                    <div class="metric-value" id="stripeConnected">Checking...</div>
                    <div class="metric-label">Connection Status</div>
                    <div class="webhook-status">
                        <span>Webhooks:</span>
                        <span id="webhookStatus">Checking...</span>
                    </div>
                    <div class="api-version" id="apiVersion">API Version: Loading...</div>
                </div>

                <!-- Total Revenue -->
                <div class="card">
                    <h3>💰 Total Platform Revenue</h3>
                    <div class="metric-value" id="totalRevenue">$0.00</div>
                    <div class="metric-label">All-Time Earnings</div>
                </div>

                <!-- Monthly Revenue -->
                <div class="card">
                    <h3>📈 Monthly Revenue</h3>
                    <div class="metric-value" id="monthlyRevenue">$0.00</div>
                    <div class="metric-label">This Month</div>
                </div>

                <!-- Average Transaction -->
                <div class="card">
                    <h3>💵 Average Transaction</h3>
                    <div class="metric-value" id="avgTransaction">$0.00</div>
                    <div class="metric-label">Per Purchase</div>
                </div>

                <!-- Total Transactions -->
                <div class="card">
                    <h3>📊 Total Transactions</h3>
                    <div class="metric-value" id="totalTransactions">0</div>
                    <div class="metric-label">All Time</div>
                </div>

                <!-- Subscription Metrics -->
                <div class="card">
                    <h3>🔄 Subscription Metrics</h3>
                    <div class="metric-value" id="totalSubscribers">0</div>
                    <div class="metric-label">Active Subscribers</div>
                    <div style="margin-top: 10px;">
                        <div style="font-size: 1.2rem; color: #4ecdc4;">MRR: $<span id="monthlyRecurring">0.00</span></div>
                        <div style="font-size: 0.9rem; color: #999;">Avg: $<span id="avgSubscription">0.00</span></div>
                    </div>
                </div>

                <!-- Creator Breakdown -->
                <div class="card" style="grid-column: span 2;">
                    <h3>👻 Creator Revenue Breakdown</h3>
                    <div id="creatorBreakdown" class="creator-list">
                        <div class="loading">Loading creator data...</div>
                    </div>
                </div>
            </div>

            <!-- Recent Transactions -->
            <div class="card" style="margin-bottom: 20px;">
                <h3>🧾 Recent Platform Activity</h3>
                <div id="recentActivity" class="transactions-list">
                    <div class="loading">Loading recent transactions...</div>
                </div>
            </div>

            <button class="refresh-btn" onclick="refreshDashboard()">
                🔄 Refresh Analytics
            </button>
        </div>
    </div>

    <script>
        let refreshInterval;

        async function fetchDashboardData() {
            try {
                console.log('Fetching payment dashboard data...');
                const response = await fetch('http://localhost:8090/payments/dashboard');
                
                if (!response.ok) {
                    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
                }
                
                const data = await response.json();
                console.log('Payment data received:', data);
                return data;
            } catch (error) {
                console.error('Error fetching payment data:', error);
                throw error;
            }
        }

        async function fetchCreatorData() {
            try {
                const response = await fetch('http://localhost:8085/creators');
                if (response.ok) {
                    const data = await response.json();
                    return data.creators || [];
                }
            } catch (error) {
                console.warn('Could not fetch creator data:', error);
            }
            return [];
        }

        function updateDashboard(data) {
            // Update Stripe integration status
            const stripeIntegration = data.stripe_integration || {};
            document.getElementById('stripeConnected').textContent = 
                stripeIntegration.connected ? '✅ Connected' : '❌ Not Connected';
            document.getElementById('stripeStatus').className = 
                'status-indicator ' + (stripeIntegration.connected ? 'status-online' : 'status-offline');
            
            document.getElementById('webhookStatus').textContent = 
                stripeIntegration.webhook_configured ? '✅ Configured' : '⚠️ Not Configured';
            document.getElementById('apiVersion').textContent = 
                \`API Version: \${stripeIntegration.api_version || 'Unknown'}\`;

            // Update revenue metrics
            const revenue = data.revenue_metrics || {};
            document.getElementById('totalRevenue').textContent = \`$\${revenue.total_revenue || '0.00'}\`;
            document.getElementById('monthlyRevenue').textContent = \`$\${revenue.monthly_revenue || '0.00'}\`;
            document.getElementById('avgTransaction').textContent = \`$\${revenue.average_transaction || '0.00'}\`;
            document.getElementById('totalTransactions').textContent = revenue.total_transactions || 0;

            // Update subscription metrics
            const subscriptions = data.subscription_metrics || {};
            document.getElementById('totalSubscribers').textContent = subscriptions.totalSubscribers || 0;
            document.getElementById('monthlyRecurring').textContent = subscriptions.monthlyRecurringRevenue?.toFixed(2) || '0.00';
            document.getElementById('avgSubscription').textContent = subscriptions.averageSubscriptionValue?.toFixed(2) || '0.00';

            // Update creator breakdown
            updateCreatorBreakdown(data.creator_breakdown || []);

            // Update status indicators
            document.getElementById('paymentsStatus').className = 'status-indicator status-online';
            document.getElementById('creatorsStatus').className = 'status-indicator status-online';
        }

        async function updateCreatorBreakdown(creatorPaymentData) {
            const creatorData = await fetchCreatorData();
            const breakdown = document.getElementById('creatorBreakdown');
            
            if (creatorPaymentData.length === 0) {
                breakdown.innerHTML = '<div class="loading">No payment data available</div>';
                return;
            }

            // Merge creator data with payment data
            const mergedData = creatorPaymentData.map(payment => {
                const creator = creatorData.find(c => c.id === payment.creator_id) || {};
                return {
                    ...payment,
                    name: creator.name || \`Creator \${payment.creator_id}\`,
                    tier: payment.tier || creator.tier || 'Shadow',
                    viralScore: creator.viralScore || 0
                };
            });

            // Sort by monthly revenue
            mergedData.sort((a, b) => parseFloat(b.monthly_revenue) - parseFloat(a.monthly_revenue));

            breakdown.innerHTML = mergedData.map(creator => \`
                <div class="creator-item tier-\${creator.tier.toLowerCase()}">
                    <div class="creator-name">\${creator.name}</div>
                    <div class="creator-stats">
                        <span>Monthly: $\${creator.monthly_revenue}</span>
                        <span>Total: $\${creator.total_revenue}</span>
                        <span>Tier: \${creator.tier}</span>
                        <span>Multiplier: \${creator.multiplier.toFixed(1)}x</span>
                        <span>Subs: \${creator.subscriptions}</span>
                    </div>
                    <div class="creator-stats" style="margin-top: 5px;">
                        <span>Pending: $\${creator.pending_payouts}</span>
                        <span>Transactions: \${creator.recent_transactions}</span>
                        <span>Viral: \${creator.viralScore?.toFixed(1) || '0.0'}</span>
                    </div>
                </div>
            \`).join('');
        }

        async function updateRecentActivity(data) {
            const activityDiv = document.getElementById('recentActivity');
            const creatorData = data.creator_breakdown || [];
            
            // Collect all recent transactions
            let allTransactions = [];
            creatorData.forEach(creator => {
                // This would be enhanced with actual transaction data from the API
                allTransactions.push({
                    creator: creator.creator_id,
                    amount: creator.monthly_revenue,
                    type: 'Monthly Revenue',
                    time: 'Recent'
                });
            });

            if (allTransactions.length === 0) {
                activityDiv.innerHTML = '<div class="loading">No recent activity</div>';
                return;
            }

            activityDiv.innerHTML = allTransactions.slice(0, 10).map(tx => \`
                <div class="transaction-item">
                    <span>\${tx.type} - \${tx.creator}</span>
                    <span>$\${typeof tx.amount === 'string' ? tx.amount : tx.amount.toFixed(2)}</span>
                </div>
            \`).join('');
        }

        async function refreshDashboard() {
            try {
                document.getElementById('loading').style.display = 'block';
                document.getElementById('dashboard').style.display = 'none';

                const data = await fetchDashboardData();
                updateDashboard(data);
                await updateRecentActivity(data);

                document.getElementById('loading').style.display = 'none';
                document.getElementById('dashboard').style.display = 'block';

                // Show success message
                showMessage('✅ Dashboard refreshed successfully!', 'success');

            } catch (error) {
                console.error('Error refreshing dashboard:', error);
                showMessage(\`❌ Error refreshing dashboard: \${error.message}\`, 'error');
                
                // Update status indicators to show error
                document.getElementById('paymentsStatus').className = 'status-indicator status-offline';
            }
        }

        function showMessage(message, type) {
            const existingMessage = document.querySelector('.error-message, .success-message');
            if (existingMessage) {
                existingMessage.remove();
            }

            const messageDiv = document.createElement('div');
            messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
            messageDiv.textContent = message;
            
            document.querySelector('.container').insertBefore(messageDiv, document.getElementById('dashboard'));
            
            setTimeout(() => messageDiv.remove(), 5000);
        }

        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', () => {
            refreshDashboard();
            
            // Auto-refresh every 30 seconds
            refreshInterval = setInterval(refreshDashboard, 30000);
        });

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        });
    </script>
</body>
</html>
`;

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.end(dashboardHTML);
});

server.listen(PORT, () => {
    console.log(`🔮 Enhanced Stripe Dashboard running on http://localhost:${PORT}`);
    console.log(`💳 Displays real-time Stripe integration with creator metrics`);
    console.log(`🌐 Access the dashboard at: http://localhost:${PORT}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
    } else {
        console.error('❌ Server error:', err);
    }
    process.exit(1);
});
