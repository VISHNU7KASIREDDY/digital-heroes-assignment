const express = require('express');
const { createCheckout, getSubscriptionInfo, cancelSubscription, stripeWebhook } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/create-checkout', protect, createCheckout);
router.get('/', protect, getSubscriptionInfo);
router.post('/cancel', protect, cancelSubscription);

module.exports = router;
