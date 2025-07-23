"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stripe_1 = __importDefault(require("stripe"));
const environment_js_1 = require("../config/environment.js");
const logger_js_1 = require("../utils/logger.js");
const referral_js_1 = require("../services/referral.js");
const user_js_1 = require("../services/user.js");
const provisioning_js_1 = require("../services/provisioning.js");
const discord_js_1 = require("../services/discord.js");
const router = express_1.default.Router();
const stripe = new stripe_1.default(environment_js_1.config.stripe.secretKey, {
    apiVersion: '2023-08-16',
});
router.post('/checkout', async (req, res) => {
    try {
        const { priceId, customerId, referralCode, metadata = {}, email } = req.body;
        const validPriceIds = Object.values(environment_js_1.config.stripe.priceIds);
        if (!validPriceIds.includes(priceId)) {
            res.status(400).json({
                error: 'Invalid price ID',
                validPrices: validPriceIds
            });
            return;
        }
        let referralBonus = 0;
        let referrer = null;
        if (referralCode) {
            const referralValidation = await referral_js_1.ReferralService.validateCode(referralCode);
            if (referralValidation.valid) {
                referralBonus = referralValidation.bonus;
                referrer = referralValidation.referrer;
                metadata.referralCode = referralCode;
                metadata.referrer = referrer;
            }
        }
        const sessionParams = {
            mode: 'subscription',
            line_items: [{
                    price: priceId,
                    quantity: 1,
                }],
            subscription_data: {
                metadata,
                trial_period_days: environment_js_1.config.saas.trialPeriodDays,
            },
            success_url: `${environment_js_1.config.saas.baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${environment_js_1.config.saas.baseUrl}/cancel`,
            allow_promotion_codes: true,
            billing_address_collection: 'required',
            metadata: {
                ...metadata,
                environment: environment_js_1.config.app.env,
                source: 'lore_engine_saas',
            },
        };
        if (customerId) {
            sessionParams.customer = customerId;
        }
        else if (email) {
            sessionParams.customer_email = email;
        }
        if (referralBonus > 0) {
            const couponId = await createReferralCoupon(referralBonus);
            sessionParams.discounts = [{ coupon: couponId }];
        }
        const session = await stripe.checkout.sessions.create(sessionParams);
        logger_js_1.logger.info('Stripe checkout session created', {
            sessionId: session.id,
            priceId,
            referralCode,
            customerId,
        });
        res.json({
            url: session.url,
            sessionId: session.id,
            referralBonus,
        });
    }
    catch (error) {
        logger_js_1.logger.error('Stripe checkout error:', error);
        res.status(500).json({
            error: 'Failed to create checkout session',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
router.post('/webhook', express_1.default.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, environment_js_1.config.stripe.webhookSecret);
    }
    catch (error) {
        logger_js_1.logger.error('Stripe webhook signature verification failed:', error);
        res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return;
    }
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutCompleted(event.data.object);
                break;
            case 'customer.subscription.created':
                await handleSubscriptionCreated(event.data.object);
                break;
            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await handleSubscriptionCanceled(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                await handlePaymentSucceeded(event.data.object);
                break;
            case 'invoice.payment_failed':
                await handlePaymentFailed(event.data.object);
                break;
            default:
                logger_js_1.logger.info(`Unhandled webhook event type: ${event.type}`);
        }
        res.status(200).json({ received: true });
    }
    catch (error) {
        logger_js_1.logger.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});
router.get('/customer/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        const customer = await stripe.customers.retrieve(customerId);
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'all',
        });
        res.json({
            customer,
            subscriptions: subscriptions.data,
        });
    }
    catch (error) {
        logger_js_1.logger.error('Error fetching customer data:', error);
        res.status(500).json({ error: 'Failed to fetch customer data' });
    }
});
async function handleCheckoutCompleted(session) {
    logger_js_1.logger.info('Processing checkout completion', { sessionId: session.id });
    const customer = await stripe.customers.retrieve(session.customer);
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    const user = await user_js_1.UserService.createFromStripeSession(session, customer);
    const credentials = await provisioning_js_1.ProvisioningService.provisionUser(user, subscription);
    if (session.metadata?.referralCode) {
        await referral_js_1.ReferralService.processReferralComplete(session.metadata.referralCode, session.metadata.referrer, user.id);
    }
    await discord_js_1.DiscordWebhookService.sendSubscriptionNotification({
        event: 'new_subscription',
        user: user.email,
        plan: subscription.items.data[0].price.nickname || 'Unknown',
        amount: subscription.items.data[0].price.unit_amount / 100,
        referralCode: session.metadata?.referralCode,
    });
    logger_js_1.logger.info('User provisioned successfully', {
        userId: user.id,
        customerId: customer.id,
        subscriptionId: subscription.id,
    });
}
async function handleSubscriptionCreated(subscription) {
    logger_js_1.logger.info('Processing subscription creation', { subscriptionId: subscription.id });
    await user_js_1.UserService.updateSubscriptionTier(subscription.customer, subscription.items.data[0].price.id);
    await provisioning_js_1.ProvisioningService.enableRealtimeAccess(subscription.customer);
}
async function handleSubscriptionUpdated(subscription) {
    logger_js_1.logger.info('Processing subscription update', { subscriptionId: subscription.id });
    await user_js_1.UserService.updateSubscriptionTier(subscription.customer, subscription.items.data[0].price.id);
    await discord_js_1.DiscordWebhookService.sendSubscriptionNotification({
        event: 'subscription_updated',
        customerId: subscription.customer,
        plan: subscription.items.data[0].price.nickname || 'Unknown',
        status: subscription.status,
    });
}
async function handleSubscriptionCanceled(subscription) {
    logger_js_1.logger.info('Processing subscription cancellation', { subscriptionId: subscription.id });
    await user_js_1.UserService.downgradeToFreeTier(subscription.customer);
    await provisioning_js_1.ProvisioningService.scheduleAccessRevocation(subscription.customer, environment_js_1.config.saas.gracePeriodDays);
    await discord_js_1.DiscordWebhookService.sendSubscriptionNotification({
        event: 'subscription_canceled',
        customerId: subscription.customer,
        plan: subscription.items.data[0].price.nickname || 'Unknown',
    });
}
async function handlePaymentSucceeded(invoice) {
    logger_js_1.logger.info('Processing successful payment', { invoiceId: invoice.id });
    await user_js_1.UserService.extendAccess(invoice.customer);
    if (invoice.subscription_details?.metadata?.referrer) {
        await referral_js_1.ReferralService.processCommission(invoice.subscription_details.metadata.referrer, invoice.amount_paid / 100);
    }
}
async function handlePaymentFailed(invoice) {
    logger_js_1.logger.error('Payment failed', { invoiceId: invoice.id });
    await user_js_1.UserService.startDunningProcess(invoice.customer);
    await discord_js_1.DiscordWebhookService.sendPaymentFailedNotification({
        customerId: invoice.customer,
        amount: invoice.amount_due / 100,
        attemptCount: invoice.attempt_count,
    });
}
async function createReferralCoupon(discountPercent) {
    const coupon = await stripe.coupons.create({
        percent_off: discountPercent,
        duration: 'once',
        name: `Referral Bonus ${discountPercent}%`,
        metadata: {
            type: 'referral_bonus',
            created_by: 'lore_engine_saas',
        },
    });
    return coupon.id;
}
exports.default = router;
//# sourceMappingURL=stripe.js.map