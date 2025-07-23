package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v74"
	"github.com/stripe/stripe-go/v74/checkout/session"
	"github.com/stripe/stripe-go/v74/customer"
)

type SaaSServer struct {
	stripeKey     string
	webhookSecret string
	customers     map[string]*Customer
	apiKeys       map[string]*APIKey
}

type Customer struct {
	ID               string     `json:"id"`
	Email            string     `json:"email"`
	StripeID         string     `json:"stripe_id"`
	SubscriptionTier string     `json:"subscription_tier"`
	APIKey           string     `json:"api_key"`
	CreatedAt        time.Time  `json:"created_at"`
	UsageLimit       UsageLimit `json:"usage_limit"`
	CurrentUsage     Usage      `json:"current_usage"`
}

type APIKey struct {
	Key        string    `json:"key"`
	CustomerID string    `json:"customer_id"`
	Tier       string    `json:"tier"`
	CreatedAt  time.Time `json:"created_at"`
	LastUsed   time.Time `json:"last_used"`
	IsActive   bool      `json:"is_active"`
}

type Usage struct {
	EventsThisMonth     int `json:"events_this_month"`
	ConflictDetections  int `json:"conflict_detections"`
	RealtimeConnections int `json:"realtime_connections"`
	APICallsToday       int `json:"api_calls_today"`
	APICallsThisHour    int `json:"api_calls_this_hour"`
	WebhookEndpoints    int `json:"webhook_endpoints"`
}

type UsageLimit struct {
	EventsPerMonth      int  `json:"events_per_month"`
	ConflictDetections  int  `json:"conflict_detections"`
	RealtimeConnections int  `json:"realtime_connections"`
	APICallsPerMinute   int  `json:"api_calls_per_minute"`
	WebhookEndpoints    int  `json:"webhook_endpoints"`
	DashboardAccess     bool `json:"dashboard_access"`
	PrioritySupport     bool `json:"priority_support"`
	CustomIntegrations  bool `json:"custom_integrations"`
}

type SubscriptionTier struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Price       float64    `json:"price"`
	Interval    string     `json:"interval"`
	Popular     bool       `json:"popular"`
	Features    []string   `json:"features"`
	Limits      UsageLimit `json:"limits"`
}

func NewSaaSServer() *SaaSServer {
	return &SaaSServer{
		stripeKey:     os.Getenv("STRIPE_SECRET_KEY"),
		webhookSecret: os.Getenv("STRIPE_WEBHOOK_SECRET"),
		customers:     make(map[string]*Customer),
		apiKeys:       make(map[string]*APIKey),
	}
}

func (s *SaaSServer) Initialize() error {
	if s.stripeKey == "" {
		return fmt.Errorf("STRIPE_SECRET_KEY environment variable not set")
	}

	stripe.Key = s.stripeKey
	log.Println("🔮 SaaS Server initialized with Stripe integration")
	return nil
}

func (s *SaaSServer) GetTiers() []SubscriptionTier {
	return []SubscriptionTier{
		{
			ID:          "basic",
			Name:        "🔍 Lore Observer",
			Description: "Perfect for individual creators starting their lore journey",
			Price:       9.99,
			Interval:    "month",
			Popular:     false,
			Features: []string{
				"Real-time conflict detection",
				"Basic dashboard access",
				"API integration",
				"Discord webhook support",
				"Email support",
			},
			Limits: UsageLimit{
				EventsPerMonth:      1000,
				ConflictDetections:  500,
				RealtimeConnections: 5,
				APICallsPerMinute:   60,
				WebhookEndpoints:    3,
				DashboardAccess:     true,
				PrioritySupport:     false,
				CustomIntegrations:  false,
			},
		},
		{
			ID:          "pro",
			Name:        "🏗️ Lore Architect",
			Description: "Ideal for content creators and small teams building rich narratives",
			Price:       29.99,
			Interval:    "month",
			Popular:     true,
			Features: []string{
				"Everything in Observer",
				"Advanced conflict analytics",
				"Multi-platform distribution",
				"TikTok integration",
				"Priority support",
				"Custom webhook endpoints",
			},
			Limits: UsageLimit{
				EventsPerMonth:      10000,
				ConflictDetections:  5000,
				RealtimeConnections: 25,
				APICallsPerMinute:   300,
				WebhookEndpoints:    10,
				DashboardAccess:     true,
				PrioritySupport:     true,
				CustomIntegrations:  false,
			},
		},
		{
			ID:          "enterprise",
			Name:        "👑 Lore Master",
			Description: "Enterprise-grade solution for studios and large-scale operations",
			Price:       99.99,
			Interval:    "month",
			Popular:     false,
			Features: []string{
				"Everything in Architect",
				"Unlimited events & conflicts",
				"Custom integrations",
				"Dedicated support",
				"SLA guarantees",
				"Advanced analytics",
				"White-label options",
			},
			Limits: UsageLimit{
				EventsPerMonth:      -1, // Unlimited
				ConflictDetections:  -1, // Unlimited
				RealtimeConnections: 100,
				APICallsPerMinute:   1000,
				WebhookEndpoints:    -1, // Unlimited
				DashboardAccess:     true,
				PrioritySupport:     true,
				CustomIntegrations:  true,
			},
		},
	}
}

func (s *SaaSServer) SetupRoutes() *gin.Engine {
	router := gin.Default()

	// CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"*"},
		AllowCredentials: true,
	}))

	// Serve static files
	router.Static("/public", "./public")
	router.StaticFile("/", "./public/pricing.html")

	// API routes
	api := router.Group("/api")
	{
		api.GET("/pricing", s.getPricing)
		api.POST("/billing/subscribe", s.createSubscription)
		api.POST("/billing/webhook", s.handleWebhook)
		api.GET("/billing/customer/:id", s.authMiddleware(), s.getCustomer)
		api.GET("/billing/usage/:id", s.authMiddleware(), s.getUsage)
		api.POST("/billing/upgrade", s.authMiddleware(), s.upgradeSubscription)
		api.POST("/billing/cancel", s.authMiddleware(), s.cancelSubscription)
	}

	// Protected Lore Engine API routes
	lore := router.Group("/lore")
	{
		lore.Use(s.usageMiddleware())
		lore.GET("/stats", s.getLoreStats)
		lore.GET("/metrics", s.getLoreMetrics)
		lore.POST("/response", s.postLoreResponse)
		lore.POST("/cursed", s.postLoreCursed)
		lore.POST("/reactive", s.postLoreReactive)
	}

	return router
}

func (s *SaaSServer) authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := c.GetHeader("X-API-Key")
		if apiKey == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "API key required"})
			c.Abort()
			return
		}

		keyInfo, exists := s.apiKeys[apiKey]
		if !exists || !keyInfo.IsActive {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid API key"})
			c.Abort()
			return
		}

		// Update last used
		keyInfo.LastUsed = time.Now()
		c.Set("customer_id", keyInfo.CustomerID)
		c.Set("tier", keyInfo.Tier)
		c.Next()
	}
}

func (s *SaaSServer) usageMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := c.GetHeader("X-API-Key")
		if apiKey == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "API key required"})
			c.Abort()
			return
		}

		keyInfo, exists := s.apiKeys[apiKey]
		if !exists || !keyInfo.IsActive {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid API key"})
			c.Abort()
			return
		}

		customer, exists := s.customers[keyInfo.CustomerID]
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Customer not found"})
			c.Abort()
			return
		}

		// Check rate limits
		if !s.checkRateLimit(customer, c.Request.Method) {
			c.JSON(http.StatusTooManyRequests, gin.H{"error": "Rate limit exceeded"})
			c.Abort()
			return
		}

		// Update usage
		s.updateUsage(customer, c.Request.URL.Path)

		c.Set("customer_id", keyInfo.CustomerID)
		c.Set("tier", keyInfo.Tier)
		c.Next()
	}
}

func (s *SaaSServer) checkRateLimit(customer *Customer, method string) bool {
	// Simple rate limiting implementation
	if customer.CurrentUsage.APICallsThisHour >= customer.UsageLimit.APICallsPerMinute*60 {
		return false
	}
	return true
}

func (s *SaaSServer) updateUsage(customer *Customer, path string) {
	customer.CurrentUsage.APICallsToday++
	customer.CurrentUsage.APICallsThisHour++

	// Update specific usage based on endpoint
	switch path {
	case "/lore/response", "/lore/cursed", "/lore/reactive":
		customer.CurrentUsage.EventsThisMonth++
	}
}

func (s *SaaSServer) getPricing(c *gin.Context) {
	tiers := s.GetTiers()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"tiers":   tiers,
	})
}

func (s *SaaSServer) createSubscription(c *gin.Context) {
	var req struct {
		Tier     string            `json:"tier"`
		Email    string            `json:"email"`
		Metadata map[string]string `json:"metadata"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request format",
		})
		return
	}

	// Find the tier
	var selectedTier *SubscriptionTier
	for _, tier := range s.GetTiers() {
		if tier.ID == req.Tier {
			selectedTier = &tier
			break
		}
	}

	if selectedTier == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid tier selected",
		})
		return
	}

	// Create Stripe customer
	customerParams := &stripe.CustomerParams{
		Email: stripe.String(req.Email),
	}
	if req.Metadata != nil {
		customerParams.Metadata = req.Metadata
	}

	stripeCustomer, err := customer.New(customerParams)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to create customer",
		})
		return
	}

	// Create checkout session
	checkoutParams := &stripe.CheckoutSessionParams{
		Customer: stripe.String(stripeCustomer.ID),
		PaymentMethodTypes: []*string{
			stripe.String("card"),
		},
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
					Currency: stripe.String("usd"),
					ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
						Name: stripe.String(selectedTier.Name),
					},
					UnitAmount: stripe.Int64(int64(selectedTier.Price * 100)),
					Recurring: &stripe.CheckoutSessionLineItemPriceDataRecurringParams{
						Interval: stripe.String(selectedTier.Interval),
					},
				},
				Quantity: stripe.Int64(1),
			},
		},
		Mode:       stripe.String("subscription"),
		SuccessURL: stripe.String("http://localhost:8085/success?session_id={CHECKOUT_SESSION_ID}"),
		CancelURL:  stripe.String("http://localhost:8085/cancel"),
	}

	session, err := session.New(checkoutParams)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to create checkout session",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"checkout_url": session.URL,
		"session_id":   session.ID,
	})
}

func (s *SaaSServer) handleWebhook(c *gin.Context) {
	// TODO: Implement Stripe webhook handling
	c.JSON(http.StatusOK, gin.H{"received": true})
}

func (s *SaaSServer) getCustomer(c *gin.Context) {
	customerID := c.Param("id")
	customer, exists := s.customers[customerID]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		return
	}
	c.JSON(http.StatusOK, customer)
}

func (s *SaaSServer) getUsage(c *gin.Context) {
	customerID := c.Param("id")
	customer, exists := s.customers[customerID]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"usage":  customer.CurrentUsage,
		"limits": customer.UsageLimit,
	})
}

func (s *SaaSServer) upgradeSubscription(c *gin.Context) {
	// TODO: Implement subscription upgrade
	c.JSON(http.StatusOK, gin.H{"message": "Upgrade functionality coming soon"})
}

func (s *SaaSServer) cancelSubscription(c *gin.Context) {
	// TODO: Implement subscription cancellation
	c.JSON(http.StatusOK, gin.H{"message": "Cancel functionality coming soon"})
}

// Lore Engine API endpoints
func (s *SaaSServer) getLoreStats(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"events_processed":   1247,
		"conflicts_resolved": 89,
		"sentiment_score":    0.72,
		"lore_fragments":     156,
		"evolution_chains":   23,
		"timestamp":          time.Now(),
	})
}

func (s *SaaSServer) getLoreMetrics(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"performance": gin.H{
			"avg_response_time": 245,
			"success_rate":      0.987,
			"active_loops":      3,
		},
		"system_status": "operational",
		"timestamp":     time.Now(),
	})
}

func (s *SaaSServer) postLoreResponse(c *gin.Context) {
	// TODO: Integrate with actual Lore Engine
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Lore response processed",
	})
}

func (s *SaaSServer) postLoreCursed(c *gin.Context) {
	// TODO: Integrate with actual Lore Engine
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Cursed lore processed",
	})
}

func (s *SaaSServer) postLoreReactive(c *gin.Context) {
	// TODO: Integrate with actual Lore Engine
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Reactive lore processed",
	})
}

func main() {
	server := NewSaaSServer()

	if err := server.Initialize(); err != nil {
		log.Fatal("Failed to initialize SaaS server:", err)
	}

	router := server.SetupRoutes()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8085"
	}

	log.Printf("🔮 Lore Engine SaaS Server starting on port %s", port)
	log.Printf("📊 Pricing page: http://localhost:%s", port)
	log.Printf("🎯 API endpoint: http://localhost:%s/api", port)

	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
