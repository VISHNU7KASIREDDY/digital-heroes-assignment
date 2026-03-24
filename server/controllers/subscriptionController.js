const Subscription = require('../models/Subscription');
const User = require('../models/User');
const stripeService = require('../services/stripeService');

exports.createCheckout = async (req, res) => {
  const { plan } = req.body; // 'monthly' or 'yearly'
  const user = req.user;

  const priceId = plan === 'yearly' ? process.env.STRIPE_YEARLY_PRICE_ID : process.env.STRIPE_MONTHLY_PRICE_ID;
  if (!priceId) return res.status(500).json({ message: 'Stripe prices not configured on server' });

  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  // Create a Stripe Checkout Session
  const session = await stripeService.createCheckoutSession(priceId, user._id, baseUrl);

  res.json({ url: session.url });
};

exports.getSubscriptionInfo = async (req, res) => {
  const sub = await Subscription.findOne({ userId: req.user._id });
  res.json(sub || { status: 'none' });
};

exports.cancelSubscription = async (req, res) => {
  const sub = await Subscription.findOne({ userId: req.user._id });
  if (!sub || !sub.stripeSubId) return res.status(404).json({ message: 'No active subscription found' });

  await stripeService.cancelSubscription(sub.stripeSubId);
  sub.cancelAtPeriodEnd = true;
  await sub.save();

  res.json({ message: 'Subscription will be cancelled at the end of the billing period.' });
};

// STRIPE WEBHOOK HANDLER
exports.stripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripeService.validateWebhookSignature(req.rawBody, signature, secret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const stripeSubId = session.subscription;
      const customerId = session.customer;

      if (userId) {
        // Initial setup on checkout
        await Subscription.findOneAndUpdate(
          { userId },
          {
            userId,
            stripeSubId,
            stripeCustomerId: customerId,
            status: 'active', // Will be confirmed by customer.subscription.updated
          },
          { upsert: true }
        );
      }
    } else if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const stripeSubId = subscription.id;
      const customerId = subscription.customer;

      const dbSub = await Subscription.findOne({ stripeSubId });
      if (dbSub) {
        dbSub.status = subscription.status === 'active' ? 'active' : dbSub.status;
        dbSub.stripeCustomerId = customerId;
        dbSub.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        dbSub.cancelAtPeriodEnd = subscription.cancel_at_period_end;
        await dbSub.save();
        
        if (dbSub.status === 'active') {
          await User.findByIdAndUpdate(dbSub.userId, { subscriptionStatus: 'active', stripeCustomerId: customerId });
        }
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const dbSub = await Subscription.findOne({ stripeSubId: subscription.id });
      if (dbSub) {
        dbSub.status = 'cancelled';
        await dbSub.save();
        await User.findByIdAndUpdate(dbSub.userId, { subscriptionStatus: 'cancelled' });
      }
    }
  } catch(err) {
    console.error('Error handling webhook', err);
  }

  res.status(200).json({ received: true });
};
