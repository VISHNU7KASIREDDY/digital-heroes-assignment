/**
 * Require that the authenticated user has an active subscription.
 * Must be used AFTER the `protect` middleware.
 */
const requireActiveSubscription = (req, res, next) => {
  if (req.user && req.user.subscriptionStatus === 'active') return next();
  return res.status(403).json({
    message: 'An active subscription is required to access this resource.',
  });
};

module.exports = requireActiveSubscription;
