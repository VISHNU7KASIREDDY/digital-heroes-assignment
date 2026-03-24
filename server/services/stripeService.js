const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (priceId, userId, baseUrl) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${baseUrl}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/dashboard?canceled=true`,
    client_reference_id: userId.toString(),
  });
  return session;
};

const cancelSubscription = async (subscriptionId) => {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
};

const validateWebhookSignature = (rawBody, signature, secret) => {
  return stripe.webhooks.constructEvent(rawBody, signature, secret);
};

module.exports = {
  createCheckoutSession,
  cancelSubscription,
  validateWebhookSignature,
};
