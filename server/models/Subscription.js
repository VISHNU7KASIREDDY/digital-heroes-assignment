const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    plan: { type: String, enum: ['monthly', 'yearly'], required: true },
    status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
    stripeSubId: { type: String, required: true },
    stripeCustomerId: { type: String },
    currentPeriodEnd: { type: Date, required: true },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
