/**
 * 🎭 TikTok Viral Landing Page Handler
 * Converts TikTok traffic to paying customers
 * Generated: July 18, 2025
 */

import express from 'express';
import { viralFunnelService } from '../services/viral-funnel.service';
import { discordService } from '../services/discord.service';

const router = express.Router();

/**
 * 🎬 Viral Landing Page - Captures TikTok traffic
 */
router.get('/viral/:trackingCode', async (req, res) => {
  const { trackingCode } = req.params;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';

  try {
    // Track the viral click
    const redirectPath = await viralFunnelService.handleViralClick(trackingCode, {
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });

    // Generate the haunted engine landing page
    const landingPageHTML = generateHauntedLandingPage(trackingCode);
    
    res.send(landingPageHTML);
  } catch (error) {
    console.error('❌ Error handling viral click:', error);
    res.redirect('/');
  }
});

/**
 * 🎯 Referral Signup Handler
 */
router.post('/signup/viral', async (req, res) => {
  const { email, plan, referralCode, signupMethod = 'TikTok Viral' } = req.body;

  try {
    // Generate user ID (in real app, this would come from your user system)
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Track the conversion
    await viralFunnelService.handleSignupConversion(referralCode, {
      userId,
      email,
      plan,
      signupMethod,
    });

    // Return success with next steps
    res.json({
      success: true,
      userId,
      redirectUrl: `/onboarding/stripe?userId=${userId}&plan=${plan}&ref=${referralCode}`,
      message: 'Welcome to the Haunted Engine! Preparing your AI realm...',
    });
  } catch (error) {
    console.error('❌ Error handling viral signup:', error);
    res.status(500).json({
      success: false,
      error: 'Signup failed. Please try again.',
    });
  }
});

/**
 * 💳 Stripe Checkout Success Handler
 */
router.post('/stripe/success', async (req, res) => {
  const { userId, stripeCustomerId, subscriptionId, plan, amount, referralCode } = req.body;

  try {
    // Handle Stripe provisioning
    await viralFunnelService.handleStripeProvisioning({
      userId,
      stripeCustomerId,
      subscriptionId,
      plan,
      amount,
      referralCode,
    });

    res.json({
      success: true,
      message: 'AI agent provisioned! Welcome to your haunted realm.',
      dashboardUrl: `/dashboard?userId=${userId}`,
    });
  } catch (error) {
    console.error('❌ Error handling Stripe success:', error);
    res.status(500).json({
      success: false,
      error: 'Provisioning failed. Please contact support.',
    });
  }
});

/**
 * 🚀 User Engagement Tracking
 */
router.post('/engagement/track', async (req, res) => {
  const { userId, action, contentId, viralPotential = 'medium' } = req.body;

  try {
    await viralFunnelService.trackUserEngagement({
      userId,
      action,
      contentId,
      viralPotential,
      timestamp: new Date(),
    });

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error tracking engagement:', error);
    res.status(500).json({ success: false });
  }
});

/**
 * 🛒 Marketplace Sale Handler
 */
router.post('/marketplace/sale', async (req, res) => {
  const { sellerId, buyerId, contentId, contentType, price, commission } = req.body;

  try {
    await viralFunnelService.handleMarketplaceSale({
      sellerId,
      buyerId,
      contentId,
      contentType,
      price,
      commission,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error handling marketplace sale:', error);
    res.status(500).json({ success: false });
  }
});

/**
 * 📊 Analytics Dashboard
 */
router.get('/analytics/viral', async (req, res) => {
  try {
    const fragments = viralFunnelService.getAllFragments();
    
    const analytics = {
      totalFragments: fragments.length,
      totalClicks: fragments.reduce((sum, f) => sum + f.clicks, 0),
      totalConversions: fragments.reduce((sum, f) => sum + f.conversions, 0),
      totalRevenue: fragments.reduce((sum, f) => sum + f.revenue, 0),
      topPerformers: fragments
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map(f => ({
          title: f.title,
          clicks: f.clicks,
          conversions: f.conversions,
          revenue: f.revenue,
          conversionRate: ((f.conversions / f.clicks) * 100).toFixed(2),
        })),
    };

    res.json(analytics);
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    res.status(500).json({ error: 'Analytics fetch failed' });
  }
});

/**
 * 🎭 Generate Haunted Engine Landing Page
 */
function generateHauntedLandingPage(trackingCode: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔮 Haunted Engine - AI Lore Creation Platform</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Creepster&family=Nosifer&family=Griffy:wght@400&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: linear-gradient(135deg, #0a0a0a 0%, #1a0f1a 50%, #0f0f0f 100%);
            color: #e0e0e0;
            font-family: 'Griffy', cursive;
            min-height: 100vh;
            overflow-x: hidden;
        }
        
        .haunted-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            position: relative;
        }
        
        .floating-spirits {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        }
        
        .spirit {
            position: absolute;
            font-size: 2rem;
            opacity: 0.1;
            animation: float 10s infinite ease-in-out;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-30px) rotate(180deg); }
        }
        
        .hero-section {
            text-align: center;
            padding: 60px 20px;
            position: relative;
            z-index: 2;
        }
        
        .haunted-title {
            font-family: 'Nosifer', cursive;
            font-size: 4rem;
            color: #8B0000;
            text-shadow: 0 0 20px #ff6b6b, 0 0 40px #ff6b6b;
            margin-bottom: 20px;
            animation: glow 2s ease-in-out infinite alternate;
        }
        
        @keyframes glow {
            from { text-shadow: 0 0 20px #ff6b6b, 0 0 40px #ff6b6b; }
            to { text-shadow: 0 0 30px #ff6b6b, 0 0 60px #ff6b6b, 0 0 80px #ff6b6b; }
        }
        
        .subtitle {
            font-size: 1.5rem;
            color: #b19cd9;
            margin-bottom: 40px;
            font-style: italic;
        }
        
        .cta-container {
            background: rgba(139, 0, 0, 0.2);
            border: 2px solid #8B0000;
            border-radius: 20px;
            padding: 40px;
            margin: 40px auto;
            max-width: 600px;
            box-shadow: 0 0 30px rgba(255, 107, 107, 0.3);
        }
        
        .plans-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }
        
        .plan-card {
            background: rgba(0, 0, 0, 0.7);
            border: 2px solid #444;
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .plan-card:hover {
            border-color: #8B0000;
            box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
            transform: translateY(-5px);
        }
        
        .plan-card.selected {
            border-color: #ff6b6b;
            background: rgba(139, 0, 0, 0.2);
        }
        
        .plan-name {
            font-family: 'Creepster', cursive;
            font-size: 1.8rem;
            color: #ff6b6b;
            margin-bottom: 10px;
        }
        
        .plan-price {
            font-size: 2rem;
            color: #fff;
            margin-bottom: 20px;
        }
        
        .plan-features {
            list-style: none;
            text-align: left;
        }
        
        .plan-features li {
            margin: 10px 0;
            padding-left: 20px;
            position: relative;
        }
        
        .plan-features li::before {
            content: "👻";
            position: absolute;
            left: 0;
        }
        
        .signup-form {
            margin-top: 30px;
        }
        
        .form-group {
            margin: 20px 0;
            text-align: left;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            color: #b19cd9;
            font-weight: bold;
        }
        
        .form-group input {
            width: 100%;
            padding: 15px;
            border: 2px solid #444;
            border-radius: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: #fff;
            font-size: 1.1rem;
            transition: border-color 0.3s ease;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #8B0000;
            box-shadow: 0 0 10px rgba(255, 107, 107, 0.3);
        }
        
        .haunted-button {
            background: linear-gradient(45deg, #8B0000, #ff6b6b);
            border: none;
            color: white;
            padding: 20px 40px;
            font-size: 1.3rem;
            font-family: 'Creepster', cursive;
            border-radius: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
            width: 100%;
            margin-top: 20px;
        }
        
        .haunted-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(255, 107, 107, 0.5);
        }
        
        .features-showcase {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin: 60px 0;
        }
        
        .feature-card {
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid #444;
            border-radius: 15px;
            padding: 30px;
            text-align: center;
        }
        
        .feature-icon {
            font-size: 3rem;
            margin-bottom: 20px;
        }
        
        .feature-title {
            font-size: 1.5rem;
            color: #ff6b6b;
            margin-bottom: 15px;
        }
        
        .social-proof {
            text-align: center;
            margin: 40px 0;
            padding: 30px;
            background: rgba(139, 0, 0, 0.1);
            border-radius: 15px;
        }
        
        @media (max-width: 768px) {
            .haunted-title {
                font-size: 2.5rem;
            }
            
            .plans-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="floating-spirits">
        <div class="spirit" style="left: 10%; animation-delay: 0s;">👻</div>
        <div class="spirit" style="left: 20%; animation-delay: 2s;">🔮</div>
        <div class="spirit" style="left: 30%; animation-delay: 4s;">🕷️</div>
        <div class="spirit" style="left: 40%; animation-delay: 6s;">🦇</div>
        <div class="spirit" style="left: 50%; animation-delay: 8s;">🕸️</div>
        <div class="spirit" style="left: 60%; animation-delay: 1s;">⚰️</div>
        <div class="spirit" style="left: 70%; animation-delay: 3s;">🧙‍♀️</div>
        <div class="spirit" style="left: 80%; animation-delay: 5s;">🎭</div>
        <div class="spirit" style="left: 90%; animation-delay: 7s;">🌙</div>
    </div>

    <div class="haunted-container">
        <div class="hero-section">
            <h1 class="haunted-title">🔮 HAUNTED ENGINE</h1>
            <p class="subtitle">Where AI Meets Dark Fantasy • Create Haunting Lore • Build Cursed Worlds</p>
            
            <div class="social-proof">
                <h3>✨ As seen on TikTok ✨</h3>
                <p>Join thousands of creators crafting supernatural stories with AI</p>
            </div>
        </div>

        <div class="cta-container">
            <h2 style="color: #ff6b6b; text-align: center; margin-bottom: 30px;">🎭 Choose Your Haunted Realm</h2>
            
            <div class="plans-grid">
                <div class="plan-card" data-plan="starter" data-price="9.99">
                    <div class="plan-name">👻 Apprentice</div>
                    <div class="plan-price">$9.99<small>/month</small></div>
                    <ul class="plan-features">
                        <li>Basic AI Lore Generation</li>
                        <li>5 Haunted Characters</li>
                        <li>Community Templates</li>
                        <li>Discord Access</li>
                    </ul>
                </div>
                
                <div class="plan-card" data-plan="pro" data-price="29.99">
                    <div class="plan-name">🧙‍♀️ Conjurer</div>
                    <div class="plan-price">$29.99<small>/month</small></div>
                    <ul class="plan-features">
                        <li>Advanced AI Lore Engine</li>
                        <li>Unlimited Characters</li>
                        <li>Custom World Building</li>
                        <li>Marketplace Access</li>
                        <li>TikTok Integration</li>
                    </ul>
                </div>
                
                <div class="plan-card" data-plan="enterprise" data-price="99.99">
                    <div class="plan-name">⚰️ Necromancer</div>
                    <div class="plan-price">$99.99<small>/month</small></div>
                    <ul class="plan-features">
                        <li>Ultimate AI Power</li>
                        <li>Viral Marketing Tools</li>
                        <li>Revenue Sharing</li>
                        <li>Priority Support</li>
                        <li>Custom Integrations</li>
                    </ul>
                </div>
            </div>

            <form class="signup-form" id="viralSignupForm">
                <input type="hidden" name="referralCode" value="${trackingCode.replace('tk_', 'ref_')}">
                <input type="hidden" name="selectedPlan" value="pro">
                
                <div class="form-group">
                    <label for="email">📧 Enter Your Email to Begin</label>
                    <input type="email" id="email" name="email" required 
                           placeholder="your@email.com" />
                </div>
                
                <button type="submit" class="haunted-button">
                    🚀 SUMMON MY AI REALM
                </button>
            </form>
        </div>

        <div class="features-showcase">
            <div class="feature-card">
                <div class="feature-icon">🤖</div>
                <div class="feature-title">AI-Powered Lore</div>
                <p>Generate haunting backstories, cursed items, and supernatural characters with our advanced AI engine.</p>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">🎬</div>
                <div class="feature-title">TikTok Ready</div>
                <p>Create viral-ready content fragments optimized for social media and audience engagement.</p>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">💰</div>
                <div class="feature-title">Monetize Your Lore</div>
                <p>Sell your creations on our marketplace and earn revenue from your supernatural imagination.</p>
            </div>
        </div>
    </div>

    <script>
        // Plan selection logic
        document.querySelectorAll('.plan-card').forEach(card => {
            card.addEventListener('click', function() {
                document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                document.querySelector('input[name="selectedPlan"]').value = this.dataset.plan;
            });
        });

        // Default selection
        document.querySelector('.plan-card[data-plan="pro"]').classList.add('selected');

        // Form submission
        document.getElementById('viralSignupForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = {
                email: formData.get('email'),
                plan: formData.get('selectedPlan'),
                referralCode: formData.get('referralCode'),
            };

            try {
                const response = await fetch('/api/signup/viral', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                
                if (result.success) {
                    window.location.href = result.redirectUrl;
                } else {
                    alert('Signup failed: ' + result.error);
                }
            } catch (error) {
                alert('Network error. Please try again.');
            }
        });

        // Track page engagement
        setTimeout(() => {
            fetch('/api/engagement/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 'anonymous',
                    action: 'landing_page_view',
                    contentId: '${trackingCode}',
                    viralPotential: 'medium'
                })
            });
        }, 5000);
    </script>
</body>
</html>
  `;
}

export default router;
